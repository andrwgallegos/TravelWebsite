window.TravelWebsiteUtils = (function () {
  /* =========================================================
     SHARED CONSTANTS
     These values are reused across every page.
     ========================================================= */

  // Stores the user's selected currency so the choice persists between pages.
  const CURRENCY_STORAGE_KEY = 'travelWebsitePreferredCurrency';

  // Stores the preferred color theme so it stays consistent across pages.
  const THEME_STORAGE_KEY = 'travelWebsiteTheme';

  // Defines the supported demo currencies and the rate used to convert from USD.
  const CURRENCY_MAP = {
    USD: { code: 'USD', locale: 'en-US', rate: 1 },
    EUR: { code: 'EUR', locale: 'de-DE', rate: 0.92 },
    GBP: { code: 'GBP', locale: 'en-GB', rate: 0.79 },
    JPY: { code: 'JPY', locale: 'ja-JP', rate: 151 },
    CAD: { code: 'CAD', locale: 'en-CA', rate: 1.36 }
  };

  // Controls the order the navigation button cycles through.
  const CURRENCY_SEQUENCE = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];

  // Matches USD price fragments such as "$248" or "$0" inside text content.
  const USD_PRICE_PATTERN = /\$(\d+(?:,\d+)?(?:\.\d+)?)/g;

  // Keeps track of the active toast timeout so a newer message can replace an older one.
  let toastTimeoutId = null;

  /* =========================================================
     SMALL SHARED HELPERS
     ========================================================= */

  // Normalizes user-entered text so searches are case-insensitive and punctuation-tolerant.
  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  // Safely reads the stored theme without breaking if localStorage is unavailable.
  function getStoredTheme() {
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

      if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
      }
    } catch (error) {
      // File-based demos can block storage in some environments, so failure is ignored.
    }

    return 'light';
  }

  // Saves the selected theme for the next page load.
  function setStoredTheme(themeName) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeName);
    } catch (error) {
      // Storage failure should not stop the current page from updating.
    }
  }

  // Safely reads the stored currency without breaking if localStorage is unavailable.
  function getStoredCurrency() {
    try {
      const storedCurrency = window.localStorage.getItem(CURRENCY_STORAGE_KEY);

      if (storedCurrency && CURRENCY_MAP[storedCurrency]) {
        return storedCurrency;
      }
    } catch (error) {
      // File-based demos can block storage in some environments, so failure is ignored.
    }

    return 'USD';
  }

  // Saves the newly selected currency for the next page load.
  function setStoredCurrency(currencyCode) {
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, currencyCode);
    } catch (error) {
      // Storage failure should not stop the interface from updating on the current page.
    }
  }

  // Formats one USD amount into the currently selected currency.
  function formatMoneyFromUsd(usdAmount, currencyCode) {
    const selectedCurrency = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.USD;
    const convertedAmount = Number(usdAmount) * selectedCurrency.rate;

    return new Intl.NumberFormat(selectedCurrency.locale, {
      style: 'currency',
      currency: selectedCurrency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(convertedAmount);
  }

  // Returns the next currency in the sequence so the nav button can cycle predictably.
  function getNextCurrency(currentCurrency) {
    const currentIndex = CURRENCY_SEQUENCE.indexOf(currentCurrency);

    if (currentIndex === -1) {
      return CURRENCY_SEQUENCE[0];
    }

    return CURRENCY_SEQUENCE[(currentIndex + 1) % CURRENCY_SEQUENCE.length];
  }

  // Creates the shared toast node once and reuses it for lightweight status messages.
  function getToastElement() {
    let toastElement = document.querySelector('.app-toast');

    if (!toastElement) {
      toastElement = document.createElement('div');
      toastElement.className = 'app-toast';
      toastElement.setAttribute('role', 'status');
      toastElement.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastElement);
    }

    return toastElement;
  }

  // Displays a short on-screen message without interrupting the user with an alert dialog.
  function showToast(message) {
    const toastElement = getToastElement();

    toastElement.textContent = message;
    toastElement.classList.add('show');

    window.clearTimeout(toastTimeoutId);

    toastTimeoutId = window.setTimeout(function () {
      toastElement.classList.remove('show');
    }, 2600);
  }


  // Returns the correct homepage path for the current page depth.
  function getHomepageHref() {
    const currentPath = String(window.location.pathname || '');
    return currentPath.includes('/Homepage/') ? 'index.html' : '../Homepage/index.html';
  }

  // Returns the correct inline SVG icon for the shared theme toggle.
  function getThemeToggleIconMarkup(themeName) {
    if (themeName === 'dark') {
      return (
        '<svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
          '<circle cx="12" cy="12" r="4"></circle>' +
          '<path d="M12 2.5v2.25"></path>' +
          '<path d="M12 19.25v2.25"></path>' +
          '<path d="M4.5 12H2.25"></path>' +
          '<path d="M21.75 12H19.5"></path>' +
          '<path d="M5.64 5.64l-1.59-1.59"></path>' +
          '<path d="M19.95 19.95l-1.59-1.59"></path>' +
          '<path d="M18.36 5.64l1.59-1.59"></path>' +
          '<path d="M4.05 19.95l1.59-1.59"></path>' +
        '</svg>'
      );
    }

    return (
      '<svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M21 13.05A8.5 8.5 0 1 1 10.95 3 6.8 6.8 0 0 0 21 13.05z"></path>' +
      '</svg>'
    );
  }

  // Updates the visible theme-toggle button labels to reflect the active theme.
  function updateThemeToggleLabels(themeName) {
    const themeToggleButtons = document.querySelectorAll('.theme-toggle');
    const nextThemeName = themeName === 'dark' ? 'light' : 'dark';

    themeToggleButtons.forEach(function (button) {
      button.innerHTML = getThemeToggleIconMarkup(themeName);
      button.setAttribute('aria-label', 'Switch to ' + nextThemeName + ' mode.');
      button.setAttribute('title', 'Switch to ' + nextThemeName + ' mode.');
    });
  }

  // Applies the currently selected theme to the page.
  function applyTheme(themeName) {
    const resolvedTheme = themeName === 'dark' ? 'dark' : 'light';
    document.body.classList.toggle('theme-dark', resolvedTheme === 'dark');
    updateThemeToggleLabels(resolvedTheme);
  }

  // Adds the shared home shortcut and dark-mode toggle to each page navigation.
  function ensureSharedNavigationFeatures() {
    const navbarLeft = document.querySelector('.navbar-left');

    if (navbarLeft && !navbarLeft.querySelector('.home-icon-link')) {
      const homeLink = document.createElement('a');
      const logoLink = navbarLeft.querySelector('.logo-link');
      homeLink.href = getHomepageHref();
      homeLink.className = 'nav-link nav-utility-link home-icon-link';
      homeLink.setAttribute('aria-label', 'Go to homepage');
      homeLink.setAttribute('title', 'Go to homepage');
      homeLink.textContent = '⌂';

      if (logoLink && logoLink.nextSibling) {
        navbarLeft.insertBefore(homeLink, logoLink.nextSibling);
      } else {
        navbarLeft.appendChild(homeLink);
      }
    }

    ['.desktop-nav', '.mobile-nav'].forEach(function (selector) {
      const navElement = document.querySelector(selector);

      if (!navElement || navElement.querySelector('.theme-toggle')) {
        return;
      }

      const themeToggleButton = document.createElement('button');
      themeToggleButton.type = 'button';
      themeToggleButton.className = 'nav-link nav-utility-link theme-toggle';
      themeToggleButton.addEventListener('click', function () {
        const nextTheme = getStoredTheme() === 'dark' ? 'light' : 'dark';
        setStoredTheme(nextTheme);
        applyTheme(nextTheme);
      });

      const signInButton = navElement.querySelector('.sign-in-button');

      if (signInButton) {
        navElement.insertBefore(themeToggleButton, signInButton);
      } else {
        navElement.appendChild(themeToggleButton);
      }
    });

    updateThemeToggleLabels(getStoredTheme());
  }

  /* =========================================================
     CURRENCY TOGGLE + PRICE CONVERSION
     ========================================================= */

  // Finds the navigation links that start as "USD" before any cycling happens.
  function getCurrencyToggleElements() {
    return Array.from(document.querySelectorAll('.nav-link')).filter(function (link) {
      return link.textContent.trim() === 'USD' || link.classList.contains('currency-toggle');
    });
  }

  // Finds the "List your property" links so they can show a prototype notice.
  function getPropertyTriggerElements() {
    return Array.from(document.querySelectorAll('.nav-link')).filter(function (link) {
      return link.textContent.trim() === 'List your property' || link.classList.contains('property-trigger');
    });
  }

  // Stores the original USD text so future currency switches always convert from the same base values.
  function rememberOriginalCurrencyText(element) {
    // Reset the regular expression state before testing because the global flag remembers prior matches.
    USD_PRICE_PATTERN.lastIndex = 0;

    if (!element.dataset.usdTextTemplate && USD_PRICE_PATTERN.test(element.textContent)) {
      element.dataset.usdTextTemplate = element.textContent.trim();
    }

    // Reset the regular expression state again for the next caller.
    USD_PRICE_PATTERN.lastIndex = 0;
  }

  // Replaces every USD amount inside the element's original text with the converted amount.
  function updateCurrencyTextElement(element, currencyCode) {
    rememberOriginalCurrencyText(element);

    const usdTemplate = element.dataset.usdTextTemplate;

    if (!usdTemplate) {
      return;
    }

    element.textContent = usdTemplate.replace(USD_PRICE_PATTERN, function (match, numericText) {
      const usdAmount = Number(numericText.replace(/,/g, ''));
      return formatMoneyFromUsd(usdAmount, currencyCode);
    });

    // Reset the regular expression state after replacement for future calls.
    USD_PRICE_PATTERN.lastIndex = 0;
  }

  // Updates every visible currency button label to show the active currency code.
  function updateCurrencyToggleLabels(currencyCode) {
    getCurrencyToggleElements().forEach(function (link) {
      link.classList.add('currency-toggle');
      link.textContent = currencyCode;
      link.setAttribute('aria-label', 'Switch currency. Current currency is ' + currencyCode + '.');
      link.setAttribute('title', 'Click to cycle currencies. Demo exchange rates are approximate.');
    });
  }

  // Converts all visible prices and price-filter labels on the current page.
  function applyCurrencyToPage(currencyCode) {
    const priceLikeElements = document.querySelectorAll('.price, .filter-pill, .filter-option');

    priceLikeElements.forEach(function (element) {
      updateCurrencyTextElement(element, currencyCode);
    });

    updateCurrencyToggleLabels(currencyCode);
  }

  // Wires up the currency links so each click cycles to the next currency and refreshes all prices.
  function bindCurrencyToggles() {
    getCurrencyToggleElements().forEach(function (link) {
      link.classList.add('currency-toggle');

      link.addEventListener('click', function (event) {
        event.preventDefault();

        const currentCurrency = getStoredCurrency();
        const nextCurrency = getNextCurrency(currentCurrency);

        setStoredCurrency(nextCurrency);
        applyCurrencyToPage(nextCurrency);
      });
    });
  }

  // Replaces the placeholder property flow with a clear prototype notice.
  function bindPropertyTriggers() {
    getPropertyTriggerElements().forEach(function (link) {
      link.classList.add('property-trigger');

      link.addEventListener('click', function (event) {
        event.preventDefault();
        showToast('List your property has not been integrated yet.');
      });
    });
  }

  /* =========================================================
     URL HELPERS
     ========================================================= */

  // Reads a query-string value from the current page URL.
  function getPageQueryValue(parameterName) {
    const currentUrl = new URL(window.location.href);
    return currentUrl.searchParams.get(parameterName) || '';
  }

  // Updates a query-string value without causing a full page refresh.
  function updatePageQueryValue(parameterName, parameterValue) {
    try {
      const currentUrl = new URL(window.location.href);

      if (parameterValue) {
        currentUrl.searchParams.set(parameterName, parameterValue);
      } else {
        currentUrl.searchParams.delete(parameterName);
      }

      window.history.replaceState({}, '', currentUrl.toString());
    } catch (error) {
      // Some file-based preview environments may not support URL rewriting cleanly.
    }
  }

  /* =========================================================
     GENERIC LIVE SEARCH HELPER
     ========================================================= */

  // Builds a reusable live-search experience for any page that has a search input and filterable items.
  function initLiveSearch(config) {
    const inputElement = config && config.inputElement;
    const formElement = config && config.formElement;
    const itemElements = Array.from((config && config.itemElements) || []);

    // Stop early if the page did not pass the minimum required pieces.
    if (!inputElement || !formElement || !itemElements.length) {
      return null;
    }

    const submitButton = formElement.querySelector('[type="submit"]');
    const enableInputLoading = Boolean(config && config.enableInputLoading);
    const inputLoadingDelay = Math.max(0, Number((config && config.loadingDelay) || 180));
    const submitLoadingDelay = Math.max(0, Number((config && config.submitLoadingDelay) || 0));

    // Native browser autocomplete would compete with the custom suggestion list.
    inputElement.setAttribute('autocomplete', 'off');

    // Turns the raw DOM elements into searchable records with normalized text.
    const indexedItems = itemElements.map(function (element, index) {
      const itemData = typeof config.getItemData === 'function' ? config.getItemData(element, index) : {};
      const keywords = Array.isArray(itemData.keywords) ? itemData.keywords : [];
      const combinedSearchText = [
        itemData.title,
        itemData.subtitle,
        itemData.searchText,
        keywords.join(' ')
      ]
        .filter(Boolean)
        .join(' ');

      return {
        element: element,
        data: itemData,
        searchableText: normalizeText(combinedSearchText)
      };
    });

    // Creates a shared loading row directly under the form, separate from the suggestion list.
    const loadingElement = document.createElement('div');
    loadingElement.className = 'search-loading search-ui-hidden';
    loadingElement.setAttribute('role', 'status');
    loadingElement.setAttribute('aria-live', 'polite');

    const loadingSpinner = document.createElement('span');
    loadingSpinner.className = 'search-loading-spinner';
    loadingSpinner.setAttribute('aria-hidden', 'true');

    const loadingText = document.createElement('span');
    loadingText.className = 'search-loading-text';
    loadingText.textContent = config.submitLoadingText || config.loadingText || 'Searching…';

    loadingElement.appendChild(loadingSpinner);
    loadingElement.appendChild(loadingText);
    formElement.insertAdjacentElement('afterend', loadingElement);

    // Creates the shared suggestion container just below the loading row.
    const suggestionsElement = document.createElement('section');
    suggestionsElement.className = 'search-suggestions search-ui-hidden';
    suggestionsElement.setAttribute('aria-label', 'Search suggestions');

    const suggestionsHeading = document.createElement('h3');
    suggestionsHeading.className = 'visually-hidden';
    suggestionsHeading.textContent = 'Search suggestions';

    const suggestionsList = document.createElement('div');
    suggestionsList.className = 'search-suggestion-list';

    suggestionsElement.appendChild(suggestionsHeading);
    suggestionsElement.appendChild(suggestionsList);
    loadingElement.insertAdjacentElement('afterend', suggestionsElement);

    // Adds a small live status line so users know how many matches they are seeing.
    const statusElement = document.createElement('p');
    statusElement.className = 'search-results-status';
    statusElement.setAttribute('aria-live', 'polite');
    suggestionsElement.insertAdjacentElement('afterend', statusElement);

    // Builds the reusable no-results block once and toggles it as needed.
    const noResultsElement = document.createElement('div');
    noResultsElement.className = 'search-no-results search-ui-hidden';

    const noResultsTitle = document.createElement('h3');
    noResultsTitle.textContent = config.noResultsTitle || 'No results found';

    const noResultsDescription = document.createElement('p');
    noResultsDescription.textContent =
      config.noResultsDescription || 'Try a different keyword or clear the search to reset the page.';

    noResultsElement.appendChild(noResultsTitle);
    noResultsElement.appendChild(noResultsDescription);

    const noResultsMount = config.noResultsMount || formElement.parentElement;
    noResultsMount.appendChild(noResultsElement);

    // Uses the page-provided visibility rule when present, otherwise falls back to display toggling.
    function setItemVisibility(indexedItem, shouldShow) {
      if (typeof config.setItemVisibility === 'function') {
        config.setItemVisibility(indexedItem.element, shouldShow, indexedItem.data);
        return;
      }

      indexedItem.element.style.display = shouldShow ? '' : 'none';
    }

    // Breaks the user query into tokens so multi-word searches remain flexible.
    function getQueryTokens(query) {
      return normalizeText(query)
        .split(' ')
        .filter(Boolean);
    }

    // Returns every item that contains all query tokens in its searchable text.
    function getMatches(query) {
      const tokens = getQueryTokens(query);

      if (!tokens.length) {
        return indexedItems;
      }

      return indexedItems.filter(function (indexedItem) {
        return tokens.every(function (token) {
          return indexedItem.searchableText.includes(token);
        });
      });
    }

    let filterDelayTimeoutId = null;
    let submitDelayTimeoutId = null;
    let latestFilterRequestId = 0;
    let currentLoadingMode = '';

    function setFormBusyState(isBusy) {
      formElement.setAttribute('aria-busy', isBusy ? 'true' : 'false');

      if (submitButton) {
        submitButton.disabled = isBusy;
      }
    }

    function showLoading(mode, query, overrideText) {
      const trimmedQuery = String(query || '').trim();

      if (mode === 'input') {
        if (!enableInputLoading || !trimmedQuery) {
          hideLoading();
          return;
        }

        loadingText.textContent = overrideText || config.loadingText || 'Loading suggestions…';
      } else if (mode === 'filter') {
        loadingText.textContent = overrideText || config.filterLoadingText || 'Updating results…';
      } else {
        loadingText.textContent = overrideText || config.submitLoadingText || 'Searching…';
      }

      currentLoadingMode = mode;
      loadingElement.classList.remove('search-ui-hidden');
      suggestionsElement.classList.add('search-ui-hidden');
      suggestionsList.innerHTML = '';
      setFormBusyState(mode === 'submit');
    }

    function hideLoading() {
      currentLoadingMode = '';
      loadingElement.classList.add('search-ui-hidden');
      setFormBusyState(false);
    }

    // Cancels any queued search work so a newer interaction can replace it cleanly.
    function cancelPendingSearchWork() {
      window.clearTimeout(filterDelayTimeoutId);
      window.clearTimeout(submitDelayTimeoutId);
      latestFilterRequestId += 1;
    }

    // Hides the suggestion dropdown completely.
    function hideSuggestions() {
      window.clearTimeout(filterDelayTimeoutId);

      if (currentLoadingMode === 'input') {
        hideLoading();
      }

      suggestionsElement.classList.add('search-ui-hidden');
      suggestionsList.innerHTML = '';
    }

    // Uses a unique key so duplicate cards do not produce duplicate suggestions.
    function getSuggestionKey(indexedItem) {
      return normalizeText(
        indexedItem.data.suggestionKey ||
          indexedItem.data.title ||
          indexedItem.data.searchText ||
          indexedItem.element.textContent
      );
    }

    // Creates a clickable suggestion button for one result.
    function createSuggestionButton(indexedItem) {
      const suggestionButton = document.createElement('button');
      suggestionButton.type = 'button';
      suggestionButton.className = 'search-suggestion-button';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'search-suggestion-title';
      titleSpan.textContent = indexedItem.data.title || 'Suggested result';

      suggestionButton.appendChild(titleSpan);

      if (indexedItem.data.suggestionMeta || indexedItem.data.subtitle) {
        const metaSpan = document.createElement('span');
        metaSpan.className = 'search-suggestion-meta';
        metaSpan.textContent = indexedItem.data.suggestionMeta || indexedItem.data.subtitle;
        suggestionButton.appendChild(metaSpan);
      }

      suggestionButton.addEventListener('click', function () {
        // Selecting a suggestion fills the search box and re-runs the live filter immediately.
        inputElement.value = indexedItem.data.searchValue || indexedItem.data.title || '';
        applyFilter(inputElement.value);
        inputElement.focus();
      });

      return suggestionButton;
    }

    // Schedules a short debounce before updating the suggestion list.
    function scheduleFilter(query) {
      const trimmedQuery = String(query || '').trim();

      window.clearTimeout(filterDelayTimeoutId);
      latestFilterRequestId += 1;

      if (!trimmedQuery) {
        hideSuggestions();
        applyFilter('');
        return;
      }

      const currentRequestId = latestFilterRequestId;

      if (enableInputLoading) {
        showLoading('input', trimmedQuery);
      }

      filterDelayTimeoutId = window.setTimeout(function () {
        if (currentRequestId !== latestFilterRequestId) {
          return;
        }

        if (currentLoadingMode === 'input') {
          hideLoading();
        }

        applyFilter(trimmedQuery);
      }, inputLoadingDelay);
    }

    // Rebuilds the visible suggestion list from the best current matches.
    function renderSuggestions(query, matches) {
      if (!query) {
        hideSuggestions();
        return;
      }

      const uniqueSuggestions = [];
      const seenSuggestionKeys = new Set();

      matches.forEach(function (indexedItem) {
        const suggestionKey = getSuggestionKey(indexedItem);

        if (!seenSuggestionKeys.has(suggestionKey)) {
          seenSuggestionKeys.add(suggestionKey);
          uniqueSuggestions.push(indexedItem);
        }
      });

      const limitedSuggestions = uniqueSuggestions.slice(0, config.maxSuggestions || 5);

      if (!limitedSuggestions.length) {
        hideSuggestions();
        return;
      }

      suggestionsList.innerHTML = '';

      limitedSuggestions.forEach(function (indexedItem) {
        suggestionsList.appendChild(createSuggestionButton(indexedItem));
      });

      suggestionsElement.classList.remove('search-ui-hidden');
    }

    // Updates the small line of text below the form with a page-specific count summary.
    function updateStatus(query, matchCount) {
      if (typeof config.getStatusText === 'function') {
        statusElement.textContent = config.getStatusText({
          query: query,
          matchCount: matchCount,
          totalCount: indexedItems.length
        });
        return;
      }

      if (!query) {
        statusElement.textContent = '';
        return;
      }

      statusElement.textContent =
        matchCount + ' ' + (matchCount === 1 ? 'match' : 'matches') + ' for “' + query + '”.';
    }

    // Shows the no-results block only when the user has typed a query with zero matches.
    function updateNoResultsState(query, matchCount) {
      const shouldShowNoResults = Boolean(query) && matchCount === 0;
      noResultsElement.classList.toggle('search-ui-hidden', !shouldShowNoResults);
    }

    // Filters the page content, refreshes suggestions, and updates all UI states together.
    function applyFilter(query) {
      const trimmedQuery = String(query || '').trim();
      const matches = getMatches(trimmedQuery);
      const matchedElements = new Set(matches.map(function (indexedItem) {
        return indexedItem.element;
      }));

      indexedItems.forEach(function (indexedItem) {
        const shouldShowItem = !trimmedQuery || matchedElements.has(indexedItem.element);
        setItemVisibility(indexedItem, shouldShowItem);
      });

      renderSuggestions(trimmedQuery, matches);
      updateStatus(trimmedQuery, matches.length);
      updateNoResultsState(trimmedQuery, matches.length);

      if (typeof config.afterFilter === 'function') {
        config.afterFilter({
          query: trimmedQuery,
          matches: matches,
          totalCount: indexedItems.length,
          indexedItems: indexedItems
        });
      }

      return matches;
    }

    // Re-runs the filter whenever the user types or clears the field.
    inputElement.addEventListener('input', function () {
      scheduleFilter(inputElement.value);
    });

    // Some browsers fire a dedicated event when the built-in search clear button is used.
    inputElement.addEventListener('search', function () {
      scheduleFilter(inputElement.value);
    });

    // Refocus should reveal the latest suggestions again when a query is still present.
    inputElement.addEventListener('focus', function () {
      if (inputElement.value.trim()) {
        renderSuggestions(inputElement.value.trim(), getMatches(inputElement.value.trim()));
      }
    });

    // Prevents the form from refreshing the page unless a page-specific submit handler takes over.
    formElement.addEventListener('submit', function (event) {
      const currentQuery = inputElement.value.trim();

      event.preventDefault();

      cancelPendingSearchWork();
      hideSuggestions();

      function finishSubmittedSearch() {
        const matches = applyFilter(currentQuery);
        hideLoading();

        if (typeof config.onSubmit === 'function') {
          config.onSubmit({
            query: currentQuery,
            matches: matches,
            inputElement: inputElement
          });
        }
      }

      if (submitLoadingDelay > 0) {
        showLoading('submit', currentQuery);
        submitDelayTimeoutId = window.setTimeout(finishSubmittedSearch, submitLoadingDelay);
        return;
      }

      finishSubmittedSearch();
    });

    // Runs page-specific filter work while reusing the shared loading row.
    function runLoadingTask(options) {
      const taskOptions = options || {};
      const taskMode = taskOptions.mode || 'filter';
      const taskDelay = Math.max(0, Number(taskOptions.delay) || 0);

      cancelPendingSearchWork();
      hideSuggestions();
      showLoading(taskMode, taskOptions.query || inputElement.value || '', taskOptions.text);

      function finishTask() {
        if (typeof taskOptions.onComplete === 'function') {
          taskOptions.onComplete();
        }

        hideLoading();
      }

      if (taskDelay > 0) {
        submitDelayTimeoutId = window.setTimeout(finishTask, taskDelay);
        return;
      }

      finishTask();
    }

    // Clicking anywhere outside the search UI closes the open suggestion list.
    document.addEventListener('click', function (event) {
      const clickedInsideForm = formElement.contains(event.target);
      const clickedInsideSuggestions = suggestionsElement.contains(event.target);

      if (!clickedInsideForm && !clickedInsideSuggestions) {
        hideSuggestions();
      }
    });

    // Escape hides the suggestion list without clearing the current filter.
    inputElement.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        hideSuggestions();
      }
    });

    // Applies the initial state once so the page starts in sync with any existing query.
    applyFilter(config.initialQuery || inputElement.value || '');

    return {
      applyFilter: applyFilter,
      hideSuggestions: hideSuggestions,
      runLoadingTask: runLoadingTask
    };
  }

  /* =========================================================
     SHARED PAGE INITIALIZATION
     ========================================================= */

  // Applies the shared currency/property behavior once the DOM is ready.
  document.addEventListener('DOMContentLoaded', function () {
    ensureSharedNavigationFeatures();
    bindCurrencyToggles();
    bindPropertyTriggers();
    applyCurrencyToPage(getStoredCurrency());
    applyTheme(getStoredTheme());
  });

  return {
    initLiveSearch: initLiveSearch,
    getPageQueryValue: getPageQueryValue,
    updatePageQueryValue: updatePageQueryValue,
    showToast: showToast,
    normalizeText: normalizeText
  };
})();