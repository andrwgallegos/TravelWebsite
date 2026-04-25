window.TravelWebsiteUtils = (function () {
  /* =========================================================
     SHARED CONSTANTS
     These values are reused across every page.
     ========================================================= */

  const CURRENCY_STORAGE_KEY = 'travelWebsitePreferredCurrency';
  const THEME_STORAGE_KEY = 'travelWebsiteTheme';
  const ACCESSIBILITY_STORAGE_KEY = 'travelWebsiteAccessibilitySettings';

  const CURRENCY_MAP = {
    USD: { code: 'USD', locale: 'en-US', rate: 1 },
    EUR: { code: 'EUR', locale: 'de-DE', rate: 0.92 },
    GBP: { code: 'GBP', locale: 'en-GB', rate: 0.79 },
    JPY: { code: 'JPY', locale: 'ja-JP', rate: 151 },
    CAD: { code: 'CAD', locale: 'en-CA', rate: 1.36 }
  };

  const CURRENCY_SEQUENCE = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
  const USD_PRICE_PATTERN = /\$(\d+(?:,\d+)?(?:\.\d+)?)/g;

  let toastTimeoutId = null;

  /* =========================================================
     SMALL SHARED HELPERS
     ========================================================= */

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function getStoredTheme() {
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

      if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
      }
    } catch (error) {
      // Ignore storage issues in preview/file environments.
    }

    // Accessibility improvement:
    // if the visitor has not chosen a theme yet, respect the operating system preference.
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  function setStoredTheme(themeName) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeName);
    } catch (error) {
      // Ignore storage failure without breaking the page.
    }
  }

  function getDefaultAccessibilitySettings() {
    return {
      fontScale: 100,
      readableSpacing: false,
      reduceMotion: false
    };
  }

  function sanitizeAccessibilitySettings(settings) {
    const allowedFontScales = [100, 112.5, 125];
    const rawSettings = settings || {};
    const parsedFontScale = Number(rawSettings.fontScale);

    return {
      fontScale: allowedFontScales.includes(parsedFontScale) ? parsedFontScale : 100,
      readableSpacing: Boolean(rawSettings.readableSpacing),
      reduceMotion: Boolean(rawSettings.reduceMotion)
    };
  }

  function getStoredAccessibilitySettings() {
    try {
      const storedSettings = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);

      if (storedSettings) {
        return sanitizeAccessibilitySettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      // Ignore storage issues in preview/file environments.
    }

    return getDefaultAccessibilitySettings();
  }

  function setStoredAccessibilitySettings(settings) {
    try {
      window.localStorage.setItem(
        ACCESSIBILITY_STORAGE_KEY,
        JSON.stringify(sanitizeAccessibilitySettings(settings))
      );
    } catch (error) {
      // Ignore storage failure without breaking the page.
    }
  }

  function getStoredCurrency() {
    try {
      const storedCurrency = window.localStorage.getItem(CURRENCY_STORAGE_KEY);

      if (storedCurrency && CURRENCY_MAP[storedCurrency]) {
        return storedCurrency;
      }
    } catch (error) {
      // Ignore storage issues in preview/file environments.
    }

    return 'USD';
  }

  function setStoredCurrency(currencyCode) {
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, currencyCode);
    } catch (error) {
      // Ignore storage failure without breaking the page.
    }
  }

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

  function getNextCurrency(currentCurrency) {
    const currentIndex = CURRENCY_SEQUENCE.indexOf(currentCurrency);

    if (currentIndex === -1) {
      return CURRENCY_SEQUENCE[0];
    }

    return CURRENCY_SEQUENCE[(currentIndex + 1) % CURRENCY_SEQUENCE.length];
  }

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

  function showToast(message) {
    const toastElement = getToastElement();

    toastElement.textContent = message;
    toastElement.classList.add('show');

    window.clearTimeout(toastTimeoutId);

    toastTimeoutId = window.setTimeout(function () {
      toastElement.classList.remove('show');
    }, 2600);
  }

  const PAGE_DEFINITIONS = {
    home: { folder: 'Homepage', label: 'Homepage' },
    search: { folder: 'SearchResults', label: 'Search Results' },
    help: { folder: 'HelpCenter', label: 'Help Center' },
    trips: { folder: 'Trips', label: 'Trips' },
    checkout: { folder: 'CheckoutPage', label: 'Checkout' }
  };

  function getCurrentPageKey() {
    const currentPath = String(window.location.pathname || '');

    if (currentPath.includes('/Homepage/')) {
      return 'home';
    }

    if (currentPath.includes('/SearchResults/')) {
      return 'search';
    }

    if (currentPath.includes('/HelpCenter/')) {
      return 'help';
    }

    if (currentPath.includes('/Trips/')) {
      return 'trips';
    }

    if (currentPath.includes('/CheckoutPage/')) {
      return 'checkout';
    }

    return '';
  }

  function getRelativePageHref(pageKey) {
    const pageDefinition = PAGE_DEFINITIONS[pageKey];

    if (!pageDefinition) {
      return '#';
    }

    const currentPath = String(window.location.pathname || '');
    return currentPath.includes('/' + pageDefinition.folder + '/')
      ? 'index.html'
      : '../' + pageDefinition.folder + '/index.html';
  }

  function getHomepageHref() {
    return getRelativePageHref('home');
  }

  function getSearchResultsHref() {
    return getRelativePageHref('search');
  }

  /* =========================================================
     ICON MARKUP
     Added pointer-events="none" so the button always receives clicks.
     ========================================================= */

  function getThemeToggleIconMarkup(themeName) {
    if (themeName === 'dark') {
      return (
        '<svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" pointer-events="none">' +
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
      '<svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" pointer-events="none">' +
        '<path d="M21 13.05A8.5 8.5 0 1 1 10.95 3 6.8 6.8 0 0 0 21 13.05z"></path>' +
      '</svg>'
    );
  }

  function getAccessibilityToggleIconMarkup() {
    return (
      '<svg class="accessibility-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" pointer-events="none">' +
        '<circle cx="12" cy="4.75" r="1.75"></circle>' +
        '<path d="M4.5 8.75h15"></path>' +
        '<path d="M12 6.5v11"></path>' +
        '<path d="M7.2 9.4 12 12l4.8-2.6"></path>' +
        '<path d="M8.2 19.5 12 13.5l3.8 6"></path>' +
      '</svg>'
    );
  }

  function updateThemeToggleLabels(themeName) {
    const themeToggleButtons = document.querySelectorAll('.theme-toggle');
    const nextThemeName = themeName === 'dark' ? 'light' : 'dark';
    const isDarkActive = themeName === 'dark';

    themeToggleButtons.forEach(function (button) {
      button.innerHTML = getThemeToggleIconMarkup(themeName);
      button.setAttribute(
        'aria-label',
        (isDarkActive ? 'Dark mode is active. ' : 'Light mode is active. ') +
          'Switch to ' + nextThemeName + ' mode.'
      );
      button.setAttribute(
        'title',
        (isDarkActive ? 'Dark mode is active. ' : 'Light mode is active. ') +
          'Switch to ' + nextThemeName + ' mode.'
      );
      button.setAttribute('aria-pressed', isDarkActive ? 'true' : 'false');
    });
  }

  function updateAccessibilityToggleLabels() {
    document.querySelectorAll('.accessibility-toggle').forEach(function (button) {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      button.innerHTML = getAccessibilityToggleIconMarkup();
      button.setAttribute(
        'aria-label',
        isExpanded ? 'Hide accessibility settings.' : 'Show accessibility settings.'
      );
      button.setAttribute(
        'title',
        isExpanded ? 'Hide accessibility settings.' : 'Show accessibility settings.'
      );
    });
  }

  function updateAccessibilityControlStates(settings) {
    const resolvedSettings = sanitizeAccessibilitySettings(settings);

    document.querySelectorAll('.font-scale-option').forEach(function (button) {
      const buttonScale = Number(button.getAttribute('data-font-scale'));
      const isActive = buttonScale === resolvedSettings.fontScale;

      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    document.querySelectorAll('.accessibility-setting-toggle').forEach(function (button) {
      const settingName = button.getAttribute('data-setting');
      const isActive = Boolean(resolvedSettings[settingName]);

      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    document.querySelectorAll('.accessibility-text-size-value').forEach(function (element) {
      if (resolvedSettings.fontScale === 125) {
        element.textContent = 'Largest';
        return;
      }

      if (resolvedSettings.fontScale === 112.5) {
        element.textContent = 'Larger';
        return;
      }

      element.textContent = 'Standard';
    });
  }

  function applyAccessibilitySettings(settings) {
    if (!document.body) {
      return;
    }

    const resolvedSettings = sanitizeAccessibilitySettings(settings);

    document.documentElement.style.fontSize = resolvedSettings.fontScale + '%';
    document.body.classList.toggle('accessibility-readable-spacing', resolvedSettings.readableSpacing);
    document.body.classList.toggle('accessibility-reduce-motion', resolvedSettings.reduceMotion);

    updateAccessibilityControlStates(resolvedSettings);
  }

  function commitAccessibilitySettings(partialSettings) {
    const nextSettings = sanitizeAccessibilitySettings(
      Object.assign({}, getStoredAccessibilitySettings(), partialSettings || {})
    );

    setStoredAccessibilitySettings(nextSettings);
    applyAccessibilitySettings(nextSettings);
  }

  function closeAccessibilityPanels() {
    document.querySelectorAll('.accessibility-panel').forEach(function (panel) {
      panel.hidden = true;
    });

    document.querySelectorAll('.accessibility-toggle').forEach(function (button) {
      button.setAttribute('aria-expanded', 'false');
    });

    updateAccessibilityToggleLabels();
  }

  function setAccessibilityPanelState(accessibilityMenu, shouldOpen) {
    const panel = accessibilityMenu && accessibilityMenu.querySelector('.accessibility-panel');
    const button = accessibilityMenu && accessibilityMenu.querySelector('.accessibility-toggle');

    if (!panel || !button) {
      return;
    }

    panel.hidden = !shouldOpen;
    button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    updateAccessibilityToggleLabels();

    if (shouldOpen) {
      updateAccessibilityControlStates(getStoredAccessibilitySettings());
    }
  }

  function bindAccessibilityPanelDismissal() {
    if (document.body.dataset.accessibilityDismissBound === 'true') {
      return;
    }

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.accessibility-menu')) {
        closeAccessibilityPanels();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeAccessibilityPanels();
      }
    });

    document.body.dataset.accessibilityDismissBound = 'true';
  }

  function createThemeToggleButton() {
    const themeToggleButton = document.createElement('button');
    themeToggleButton.type = 'button';
    themeToggleButton.className = 'nav-link nav-utility-link theme-toggle';

    themeToggleButton.addEventListener('click', function () {
      closeAccessibilityPanels();

      const nextTheme = getStoredTheme() === 'dark' ? 'light' : 'dark';
      setStoredTheme(nextTheme);
      applyTheme(nextTheme);
    });

    return themeToggleButton;
  }

  function createFontScaleOptionButton(label, value) {
    const button = document.createElement('button');
    const sizeLabel =
      value === 125 ? 'Largest text size' :
      value === 112.5 ? 'Larger text size' :
      'Standard text size';

    button.type = 'button';
    button.className = 'accessibility-option font-scale-option';
    button.setAttribute('data-font-scale', String(value));
    button.setAttribute('aria-label', sizeLabel);
    button.setAttribute('title', sizeLabel);
    button.textContent = label;

    button.addEventListener('click', function () {
      commitAccessibilitySettings({ fontScale: value });
    });

    return button;
  }

  function createAccessibilitySettingToggle(label, settingName) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accessibility-option accessibility-setting-toggle';
    button.setAttribute('data-setting', settingName);
    button.textContent = label;

    button.addEventListener('click', function () {
      const currentSettings = getStoredAccessibilitySettings();

      commitAccessibilitySettings({
        [settingName]: !currentSettings[settingName]
      });
    });

    return button;
  }

  function createAccessibilityMenu() {
    const accessibilityMenu = document.createElement('div');
    const accessibilityToggleButton = document.createElement('button');
    const accessibilityPanel = document.createElement('section');
    const panelId = 'accessibilityPanel' + document.querySelectorAll('.accessibility-panel').length;

    accessibilityMenu.className = 'accessibility-menu';

    accessibilityToggleButton.type = 'button';
    accessibilityToggleButton.className = 'nav-link nav-utility-link accessibility-toggle';
    accessibilityToggleButton.setAttribute('aria-controls', panelId);
    accessibilityToggleButton.setAttribute('aria-expanded', 'false');

    accessibilityToggleButton.addEventListener('click', function () {
      const isCurrentlyOpen = accessibilityToggleButton.getAttribute('aria-expanded') === 'true';

      closeAccessibilityPanels();
      setAccessibilityPanelState(accessibilityMenu, !isCurrentlyOpen);
    });

    accessibilityPanel.id = panelId;
    accessibilityPanel.className = 'accessibility-panel';
    accessibilityPanel.setAttribute('role', 'region');
    accessibilityPanel.setAttribute('aria-label', 'Accessibility settings');
    accessibilityPanel.hidden = true;

    const panelTitle = document.createElement('p');
    panelTitle.className = 'accessibility-panel-title';
    panelTitle.textContent = 'Accessibility';

    const panelDescription = document.createElement('p');
    panelDescription.className = 'accessibility-panel-text';
    panelDescription.textContent = 'Saved across pages. Adjust text size and reading comfort.';

    const textSizeGroup = document.createElement('div');
    textSizeGroup.className = 'accessibility-group';

    const textSizeHeader = document.createElement('div');
    textSizeHeader.className = 'accessibility-group-header';

    const textSizeLabel = document.createElement('span');
    textSizeLabel.className = 'accessibility-group-label';
    textSizeLabel.textContent = 'Text size';

    const textSizeValue = document.createElement('span');
    textSizeValue.className = 'accessibility-text-size-value';
    textSizeValue.textContent = 'Standard';

    textSizeHeader.appendChild(textSizeLabel);
    textSizeHeader.appendChild(textSizeValue);

    const textSizeOptions = document.createElement('div');
    textSizeOptions.className = 'accessibility-segmented';
    textSizeOptions.appendChild(createFontScaleOptionButton('A', 100));
    textSizeOptions.appendChild(createFontScaleOptionButton('A+', 112.5));
    textSizeOptions.appendChild(createFontScaleOptionButton('A++', 125));

    textSizeGroup.appendChild(textSizeHeader);
    textSizeGroup.appendChild(textSizeOptions);

    const preferenceGroup = document.createElement('div');
    preferenceGroup.className = 'accessibility-group';

    const preferenceLabel = document.createElement('span');
    preferenceLabel.className = 'accessibility-group-label';
    preferenceLabel.textContent = 'Reading options';

    preferenceGroup.appendChild(preferenceLabel);
    preferenceGroup.appendChild(createAccessibilitySettingToggle('Readable spacing', 'readableSpacing'));
    preferenceGroup.appendChild(createAccessibilitySettingToggle('Reduce motion', 'reduceMotion'));

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'accessibility-reset';
    resetButton.textContent = 'Reset accessibility settings';

    resetButton.addEventListener('click', function () {
      const defaultSettings = getDefaultAccessibilitySettings();
      setStoredAccessibilitySettings(defaultSettings);
      applyAccessibilitySettings(defaultSettings);
    });

    accessibilityPanel.appendChild(panelTitle);
    accessibilityPanel.appendChild(panelDescription);
    accessibilityPanel.appendChild(textSizeGroup);
    accessibilityPanel.appendChild(preferenceGroup);
    accessibilityPanel.appendChild(resetButton);

    accessibilityMenu.appendChild(accessibilityToggleButton);
    accessibilityMenu.appendChild(accessibilityPanel);

    return accessibilityMenu;
  }

  function applyTheme(themeName) {
    const resolvedTheme = themeName === 'dark' ? 'dark' : 'light';
    document.body.classList.toggle('theme-dark', resolvedTheme === 'dark');
    document.body.setAttribute('data-theme', resolvedTheme);
    updateThemeToggleLabels(resolvedTheme);
  }

  function createPrimaryNavLink(pageKey) {
    const pageDefinition = PAGE_DEFINITIONS[pageKey];

    if (!pageDefinition) {
      return null;
    }

    const link = document.createElement('a');
    link.href = getRelativePageHref(pageKey);
    link.className = 'nav-link';
    link.setAttribute('data-page-key', pageKey);
    link.textContent = pageDefinition.label;

    return link;
  }

  function inferNavigationPageKey(linkElement) {
    if (!linkElement) {
      return '';
    }

    const explicitPageKey = linkElement.getAttribute('data-page-key');

    if (explicitPageKey) {
      return explicitPageKey;
    }

    const linkText = String(linkElement.textContent || '').trim().toLowerCase();
    const linkHref = String(linkElement.getAttribute('href') || '');

    if (linkText === 'home' || linkText === 'homepage' || linkElement.classList.contains('home-icon-link')) {
      return 'home';
    }

    if (
      linkText === 'search' ||
      linkText === 'search results' ||
      linkText === 'shop travel' ||
      linkElement.classList.contains('dropdown-button') ||
      linkHref.includes('SearchResults')
    ) {
      return 'search';
    }

    if (linkText === 'help center' || linkHref.includes('HelpCenter')) {
      return 'help';
    }

    if (linkText === 'trips' || linkHref.includes('Trips')) {
      return 'trips';
    }

    if (linkText === 'checkout' || linkHref.includes('CheckoutPage')) {
      return 'checkout';
    }

    return '';
  }

  function markActiveNavigationLinks() {
    const currentPageKey = getCurrentPageKey();

    document.querySelectorAll('.nav-link, .logo-link, .dropdown-button').forEach(function (linkElement) {
      const linkPageKey = inferNavigationPageKey(linkElement);
      const isShopTravelButton = linkElement.classList.contains('dropdown-button');
      const isLogoLink = linkElement.classList.contains('logo-link');
      const shouldTreatCheckoutAsSearch = currentPageKey === 'checkout' && linkPageKey === 'search';

      // UX note:
      // on desktop, "Shop travel" represents the browse/search flow, so it stays active
      // for search results and checkout instead of adding extra Home/Search tabs.
      const shouldHighlightShopTravel =
        isShopTravelButton && ['search', 'checkout'].includes(currentPageKey);

      const shouldHighlightHomeLogo = isLogoLink && currentPageKey === 'home';
      const isActive =
        shouldHighlightHomeLogo ||
        shouldHighlightShopTravel ||
        (Boolean(linkPageKey) && (linkPageKey === currentPageKey || shouldTreatCheckoutAsSearch));

      linkElement.classList.toggle('active-link', isActive && !isLogoLink);
      linkElement.classList.toggle('active-home', isActive && isLogoLink);

      if (isActive) {
        linkElement.setAttribute('aria-current', 'page');
      } else {
        linkElement.removeAttribute('aria-current');
      }
    });
  }

  function ensureDesktopPrimaryLinks() {
    const desktopNav = document.querySelector('.desktop-nav');

    if (!desktopNav) {
      return;
    }

    // Keep the desktop header focused on the project's main utility links.
    // If older merged builds injected Home/Search desktop links, remove them here.
    desktopNav.querySelectorAll('[data-page-key="home"], [data-page-key="search"]').forEach(function (link) {
      link.remove();
    });
  }

  function ensureSkipLink() {
    if (!document.body || document.querySelector('.skip-link')) {
      return;
    }

    const skipTarget =
      document.querySelector('main') ||
      document.querySelector('[data-main-target]') ||
      document.querySelector('.hero, .search-hero, .help-hero');

    if (!skipTarget) {
      return;
    }

    if (!skipTarget.id) {
      skipTarget.id = 'mainContent';
    }

    skipTarget.setAttribute('tabindex', '-1');

    // Accessibility improvement:
    // inject one shared skip link so keyboard users can bypass the repeated header.
    const skipLink = document.createElement('a');
    skipLink.href = '#' + skipTarget.id;
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  function ensureSharedNavigationFeatures() {
    // Remove any legacy desktop home shortcut so the header matches the latest review direction.
    document.querySelectorAll('.home-icon-link').forEach(function (legacyHomeLink) {
      legacyHomeLink.remove();
    });

    ensureDesktopPrimaryLinks();

    ['.desktop-nav', '.mobile-nav'].forEach(function (selector) {
      const navElement = document.querySelector(selector);

      if (!navElement || navElement.querySelector('.nav-accessibility-group')) {
        return;
      }

      const utilityGroup = document.createElement('div');
      utilityGroup.className = 'nav-accessibility-group';
      utilityGroup.appendChild(createAccessibilityMenu());
      utilityGroup.appendChild(createThemeToggleButton());

      const signInButton = navElement.querySelector('.sign-in-button');

      if (signInButton) {
        navElement.insertBefore(utilityGroup, signInButton);
      } else {
        navElement.appendChild(utilityGroup);
      }
    });

    bindAccessibilityPanelDismissal();
    updateThemeToggleLabels(getStoredTheme());
    updateAccessibilityToggleLabels();
    updateAccessibilityControlStates(getStoredAccessibilitySettings());
    markActiveNavigationLinks();
  }

  /* =========================================================
     CURRENCY TOGGLE + PRICE CONVERSION
     ========================================================= */

  function getCurrencyToggleElements() {
    return Array.from(document.querySelectorAll('.nav-link')).filter(function (link) {
      return link.textContent.trim() === 'USD' || link.classList.contains('currency-toggle');
    });
  }

  function getPropertyTriggerElements() {
    return Array.from(document.querySelectorAll('.nav-link')).filter(function (link) {
      return link.textContent.trim() === 'List your property' || link.classList.contains('property-trigger');
    });
  }

  function rememberOriginalCurrencyText(element) {
    USD_PRICE_PATTERN.lastIndex = 0;

    if (!element.dataset.usdTextTemplate && USD_PRICE_PATTERN.test(element.textContent)) {
      element.dataset.usdTextTemplate = element.textContent.trim();
    }

    USD_PRICE_PATTERN.lastIndex = 0;
  }

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

    USD_PRICE_PATTERN.lastIndex = 0;
  }

  function updateCurrencyToggleLabels(currencyCode) {
    getCurrencyToggleElements().forEach(function (link) {
      link.classList.add('currency-toggle');
      link.textContent = currencyCode;
      link.setAttribute('aria-label', 'Switch currency. Current currency is ' + currencyCode + '.');
      link.setAttribute('title', 'Click to cycle currencies. Demo exchange rates are approximate.');
    });
  }

  function applyCurrencyToPage(currencyCode) {
    const priceLikeElements = document.querySelectorAll('.price, .filter-pill, .filter-option');

    priceLikeElements.forEach(function (element) {
      updateCurrencyTextElement(element, currencyCode);
    });

    updateCurrencyToggleLabels(currencyCode);
  }

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

  function bindPropertyTriggers() {
    getPropertyTriggerElements().forEach(function (link) {
      link.classList.add('property-trigger');

      link.addEventListener('click', function (event) {
        event.preventDefault();
        showToast('List your property has not been integrated yet.');
      });
    });
  }

  function bindShopTravelTriggers() {
    document.querySelectorAll('.dropdown-button').forEach(function (button) {
      if (button.dataset.shopTravelBound === 'true') {
        return;
      }

      button.setAttribute('title', 'Open travel search results');
      button.setAttribute('aria-label', 'Open travel search results');

      button.addEventListener('click', function () {
        window.location.href = getSearchResultsHref();
      });

      button.dataset.shopTravelBound = 'true';
    });
  }

  /* =========================================================
     URL HELPERS
     ========================================================= */

  function getPageQueryValue(parameterName) {
    const currentUrl = new URL(window.location.href);
    return currentUrl.searchParams.get(parameterName) || '';
  }

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
      // Ignore URL rewrite issues in preview/file environments.
    }
  }

  /* =========================================================
     GENERIC LIVE SEARCH HELPER
     ========================================================= */

  function initLiveSearch(config) {
    const inputElement = config && config.inputElement;
    const formElement = config && config.formElement;
    const itemElements = Array.from((config && config.itemElements) || []);

    if (!inputElement || !formElement || !itemElements.length) {
      return null;
    }

    const submitButton = formElement.querySelector('[type="submit"]');
    const enableInputLoading = Boolean(config && config.enableInputLoading);
    const inputLoadingDelay = Math.max(0, Number((config && config.loadingDelay) || 180));
    const submitLoadingDelay = Math.max(0, Number((config && config.submitLoadingDelay) || 0));

    inputElement.setAttribute('autocomplete', 'off');

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

    const statusElement = document.createElement('p');
    statusElement.className = 'search-results-status';
    statusElement.setAttribute('aria-live', 'polite');
    suggestionsElement.insertAdjacentElement('afterend', statusElement);

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

    function setItemVisibility(indexedItem, shouldShow) {
      if (typeof config.setItemVisibility === 'function') {
        config.setItemVisibility(indexedItem.element, shouldShow, indexedItem.data);
        return;
      }

      indexedItem.element.style.display = shouldShow ? '' : 'none';
    }

    function getQueryTokens(query) {
      return normalizeText(query)
        .split(' ')
        .filter(Boolean);
    }

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

    function cancelPendingSearchWork() {
      window.clearTimeout(filterDelayTimeoutId);
      window.clearTimeout(submitDelayTimeoutId);
      latestFilterRequestId += 1;
    }

    function hideSuggestions() {
      window.clearTimeout(filterDelayTimeoutId);

      if (currentLoadingMode === 'input') {
        hideLoading();
      }

      suggestionsElement.classList.add('search-ui-hidden');
      suggestionsList.innerHTML = '';
    }

    function getSuggestionKey(indexedItem) {
      return normalizeText(
        indexedItem.data.suggestionKey ||
          indexedItem.data.title ||
          indexedItem.data.searchText ||
          indexedItem.element.textContent
      );
    }

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
        inputElement.value = indexedItem.data.searchValue || indexedItem.data.title || '';
        applyFilter(inputElement.value);
        inputElement.focus();
      });

      return suggestionButton;
    }

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

    function updateNoResultsState(query, matchCount) {
      const shouldShowNoResults = Boolean(query) && matchCount === 0;
      noResultsElement.classList.toggle('search-ui-hidden', !shouldShowNoResults);
    }

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

    inputElement.addEventListener('input', function () {
      scheduleFilter(inputElement.value);
    });

    inputElement.addEventListener('search', function () {
      scheduleFilter(inputElement.value);
    });

    inputElement.addEventListener('focus', function () {
      if (inputElement.value.trim()) {
        renderSuggestions(inputElement.value.trim(), getMatches(inputElement.value.trim()));
      }
    });

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

    document.addEventListener('click', function (event) {
      const clickedInsideForm = formElement.contains(event.target);
      const clickedInsideSuggestions = suggestionsElement.contains(event.target);

      if (!clickedInsideForm && !clickedInsideSuggestions) {
        hideSuggestions();
      }
    });

    inputElement.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        hideSuggestions();
      }
    });

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

  document.addEventListener('DOMContentLoaded', function () {
    ensureSkipLink();
    ensureSharedNavigationFeatures();
    bindShopTravelTriggers();
    bindCurrencyToggles();
    bindPropertyTriggers();
    applyCurrencyToPage(getStoredCurrency());
    applyTheme(getStoredTheme());
    applyAccessibilitySettings(getStoredAccessibilitySettings());
  });

  return {
    initLiveSearch: initLiveSearch,
    getPageQueryValue: getPageQueryValue,
    updatePageQueryValue: updatePageQueryValue,
    showToast: showToast,
    normalizeText: normalizeText
  };
})();