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
      link.setAttribute('title', 'Click to cycle currencies. Preview exchange rates are approximate.');
    });
  }

  function applyCurrencyToPage(currencyCode) {
    const priceLikeElements = document.querySelectorAll('.price, .filter-pill, .filter-option, .search-results-status');

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

        if (window.NexpediaEnhancements && typeof window.NexpediaEnhancements.openPropertyModal === 'function') {
          window.NexpediaEnhancements.openPropertyModal();
          return;
        }

        showToast('Property listing tools are loading. Try the navigation link again in a moment.');
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

      // Optional live meta keeps dropdown copy current after global changes,
      // such as the currency toggle updating visible card prices.
      const liveSuggestionMeta = typeof config.getLiveSuggestionMeta === 'function'
        ? config.getLiveSuggestionMeta(indexedItem.element, indexedItem.data)
        : '';
      const suggestionMetaText = liveSuggestionMeta || indexedItem.data.suggestionMeta || indexedItem.data.subtitle;

      if (suggestionMetaText) {
        const metaSpan = document.createElement('span');
        metaSpan.className = 'search-suggestion-meta';
        metaSpan.textContent = suggestionMetaText;
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
    normalizeText: normalizeText,
    applyCurrencyToPage: applyCurrencyToPage,
    formatMoneyFromUsd: formatMoneyFromUsd,
    getStoredCurrency: getStoredCurrency
  };
})();
/* =========================================================
   SHARED FEATURE ENHANCEMENTS
   ---------------------------------------------------------
   This second shared module keeps the new work centralized so all
   pages receive the same sign-in/sign-up modal, currency handling,
   session-only listed location, destination data, and homepage map.
   ========================================================= */
(function () {
  'use strict';

  const AUTH_STORAGE_KEY = 'nexpediaSessionUser';
  const CUSTOM_LOCATION_STORAGE_KEY = 'nexpediaSessionListedLocation';
  const SEARCH_STATE_STORAGE_KEY = 'nexpediaSessionSearchState';
  const CURRENCY_STORAGE_KEY = 'travelWebsitePreferredCurrency';

  const CURRENCY_MAP = {
    USD: { code: 'USD', locale: 'en-US', rate: 1 },
    EUR: { code: 'EUR', locale: 'de-DE', rate: 0.92 },
    GBP: { code: 'GBP', locale: 'en-GB', rate: 0.79 },
    JPY: { code: 'JPY', locale: 'ja-JP', rate: 151 },
    CAD: { code: 'CAD', locale: 'en-CA', rate: 1.36 }
  };

  /* Destination data powers cards, map points, filters, checkout links, and
     type-ahead suggestions. Preset destinations are marked year-round so
     user-selected travel dates continue to show them in search results. */
  const BASE_DESTINATIONS = [
    {
        "id": "san-juan",
        "title": "San Juan",
        "location": "Puerto Rico",
        "region": "Caribbean",
        "country": "Puerto Rico",
        "lat": 18.4655,
        "lng": -66.1057,
        "price": 248,
        "propertyType": "Resort",
        "rating": 4.7,
        "amenities": [
            "Beachfront",
            "Free cancellation",
            "Pool",
            "Breakfast included",
            "Family friendly"
        ],
        "maxTravelers": 10,
        "homeImage": "images/san juan.jpeg",
        "searchImage": "images/sanjuan.jpeg",
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "miami-beach",
        "title": "Miami Beach",
        "location": "Florida, USA",
        "region": "North America",
        "country": "United States",
        "lat": 25.7907,
        "lng": -80.13,
        "price": 331,
        "propertyType": "Hotel",
        "rating": 4.4,
        "amenities": [
            "Beachfront",
            "Free cancellation",
            "Pool",
            "Pet friendly"
        ],
        "maxTravelers": 8,
        "homeImage": "images/miami.jpeg",
        "searchImage": "images/miami.jpeg",
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "myrtle-beach",
        "title": "Myrtle Beach",
        "location": "South Carolina, USA",
        "region": "North America",
        "country": "United States",
        "lat": 33.6891,
        "lng": -78.8867,
        "price": 146,
        "propertyType": "Vacation rental",
        "rating": 4.1,
        "amenities": [
            "Beachfront",
            "Kitchen",
            "Free parking",
            "Family friendly"
        ],
        "maxTravelers": 8,
        "homeImage": "images/myrtle.jpeg",
        "searchImage": "images/myrtle.jpeg",
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "wilmington",
        "title": "Wilmington",
        "location": "North Carolina, USA",
        "region": "North America",
        "country": "United States",
        "lat": 34.2104,
        "lng": -77.8868,
        "price": 143,
        "propertyType": "Hotel",
        "rating": 4.0,
        "amenities": [
            "Free cancellation",
            "Breakfast included",
            "Free parking",
            "Pet friendly"
        ],
        "maxTravelers": 10,
        "homeImage": "images/wilmington.jpeg",
        "searchImage": "images/wilmington.jpeg",
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "hilton-head",
        "title": "Hilton Head Island",
        "location": "South Carolina, USA",
        "region": "North America",
        "country": "United States",
        "lat": 32.2163,
        "lng": -80.7526,
        "price": 240,
        "propertyType": "Resort",
        "rating": 4.6,
        "amenities": [
            "Beachfront",
            "Pool",
            "Free cancellation",
            "Spa"
        ],
        "maxTravelers": 6,
        "homeImage": "images/hilton.jpeg",
        "searchImage": "images/hilton.jpeg",
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "new-york-city",
        "title": "New York City",
        "location": "New York, USA",
        "region": "North America",
        "country": "United States",
        "lat": 40.7128,
        "lng": -74.006,
        "price": 289,
        "propertyType": "Hotel",
        "rating": 4.5,
        "amenities": [
            "Free cancellation",
            "Near transit",
            "Breakfast included",
            "City view"
        ],
        "maxTravelers": 4,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "vancouver",
        "title": "Vancouver",
        "location": "British Columbia, Canada",
        "region": "North America",
        "country": "Canada",
        "lat": 49.2827,
        "lng": -123.1207,
        "price": 164,
        "propertyType": "Apartment",
        "rating": 4.3,
        "amenities": [
            "Kitchen",
            "Mountain view",
            "Free cancellation",
            "Near transit"
        ],
        "maxTravelers": 4,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "honolulu",
        "title": "Honolulu",
        "location": "Hawaii, USA",
        "region": "North America",
        "country": "United States",
        "lat": 21.3069,
        "lng": -157.8583,
        "price": 276,
        "propertyType": "Resort",
        "rating": 4.6,
        "amenities": [
            "Beachfront",
            "Pool",
            "Free cancellation",
            "Family friendly"
        ],
        "maxTravelers": 6,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "cancun",
        "title": "Cancún",
        "location": "Mexico",
        "region": "Caribbean",
        "country": "Mexico",
        "lat": 21.1619,
        "lng": -86.8515,
        "price": 199,
        "propertyType": "Resort",
        "rating": 4.7,
        "amenities": [
            "Beachfront",
            "Pool",
            "Breakfast included",
            "Spa"
        ],
        "maxTravelers": 7,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "rio-de-janeiro",
        "title": "Rio de Janeiro",
        "location": "Brazil",
        "region": "South America",
        "country": "Brazil",
        "lat": -22.9068,
        "lng": -43.1729,
        "price": 132,
        "propertyType": "Hotel",
        "rating": 4.4,
        "amenities": [
            "Beachfront",
            "Breakfast included",
            "City view",
            "Free cancellation"
        ],
        "maxTravelers": 5,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "buenos-aires",
        "title": "Buenos Aires",
        "location": "Argentina",
        "region": "South America",
        "country": "Argentina",
        "lat": -34.6037,
        "lng": -58.3816,
        "price": 118,
        "propertyType": "Boutique hotel",
        "rating": 4.5,
        "amenities": [
            "Breakfast included",
            "City view",
            "Free cancellation",
            "Near transit"
        ],
        "maxTravelers": 4,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "london",
        "title": "London",
        "location": "England, United Kingdom",
        "region": "Europe",
        "country": "United Kingdom",
        "lat": 51.5072,
        "lng": -0.1276,
        "price": 215,
        "propertyType": "Hotel",
        "rating": 4.3,
        "amenities": [
            "Free cancellation",
            "Near transit",
            "Breakfast included",
            "City view"
        ],
        "maxTravelers": 5,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "paris",
        "title": "Paris",
        "location": "France",
        "region": "Europe",
        "country": "France",
        "lat": 48.8566,
        "lng": 2.3522,
        "price": 226,
        "propertyType": "Boutique hotel",
        "rating": 4.8,
        "amenities": [
            "Free cancellation",
            "Breakfast included",
            "Near landmarks",
            "City view"
        ],
        "maxTravelers": 3,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "rome",
        "title": "Rome",
        "location": "Italy",
        "region": "Europe",
        "country": "Italy",
        "lat": 41.9028,
        "lng": 12.4964,
        "price": 188,
        "propertyType": "Boutique hotel",
        "rating": 4.4,
        "amenities": [
            "Breakfast included",
            "Historic district",
            "Free cancellation",
            "Near landmarks"
        ],
        "maxTravelers": 4,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "barcelona",
        "title": "Barcelona",
        "location": "Spain",
        "region": "Europe",
        "country": "Spain",
        "lat": 41.3874,
        "lng": 2.1686,
        "price": 176,
        "propertyType": "Apartment",
        "rating": 4.5,
        "amenities": [
            "Kitchen",
            "Near transit",
            "Free cancellation",
            "Beachfront"
        ],
        "maxTravelers": 5,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "reykjavik",
        "title": "Reykjavík",
        "location": "Iceland",
        "region": "Europe",
        "country": "Iceland",
        "lat": 64.1466,
        "lng": -21.9426,
        "price": 234,
        "propertyType": "Boutique hotel",
        "rating": 4.6,
        "amenities": [
            "Breakfast included",
            "Free cancellation",
            "Mountain view",
            "Free parking"
        ],
        "maxTravelers": 4,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "marrakech",
        "title": "Marrakech",
        "location": "Morocco",
        "region": "Africa",
        "country": "Morocco",
        "lat": 31.6295,
        "lng": -7.9811,
        "price": 122,
        "propertyType": "Boutique hotel",
        "rating": 4.6,
        "amenities": [
            "Breakfast included",
            "Pool",
            "Free cancellation",
            "Spa"
        ],
        "maxTravelers": 5,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "cape-town",
        "title": "Cape Town",
        "location": "South Africa",
        "region": "Africa",
        "country": "South Africa",
        "lat": -33.9249,
        "lng": 18.4241,
        "price": 137,
        "propertyType": "Boutique hotel",
        "rating": 4.6,
        "amenities": [
            "Mountain view",
            "Breakfast included",
            "Free cancellation",
            "Beachfront"
        ],
        "maxTravelers": 4,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "nairobi",
        "title": "Nairobi",
        "location": "Kenya",
        "region": "Africa",
        "country": "Kenya",
        "lat": -1.2921,
        "lng": 36.8219,
        "price": 128,
        "propertyType": "Hotel",
        "rating": 4.2,
        "amenities": [
            "Breakfast included",
            "Free cancellation",
            "Free parking",
            "Pool"
        ],
        "maxTravelers": 5,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "cairo",
        "title": "Cairo",
        "location": "Egypt",
        "region": "Africa",
        "country": "Egypt",
        "lat": 30.0444,
        "lng": 31.2357,
        "price": 109,
        "propertyType": "Hotel",
        "rating": 4.1,
        "amenities": [
            "Breakfast included",
            "Near landmarks",
            "Free cancellation",
            "City view"
        ],
        "maxTravelers": 5,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "dubai",
        "title": "Dubai",
        "location": "United Arab Emirates",
        "region": "Middle East",
        "country": "United Arab Emirates",
        "lat": 25.2048,
        "lng": 55.2708,
        "price": 242,
        "propertyType": "Resort",
        "rating": 4.8,
        "amenities": [
            "Pool",
            "City view",
            "Free cancellation",
            "Spa"
        ],
        "maxTravelers": 6,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "istanbul",
        "title": "Istanbul",
        "location": "Turkey",
        "region": "Middle East",
        "country": "Turkey",
        "lat": 41.0082,
        "lng": 28.9784,
        "price": 151,
        "propertyType": "Hotel",
        "rating": 4.5,
        "amenities": [
            "Breakfast included",
            "Near landmarks",
            "Free cancellation",
            "City view"
        ],
        "maxTravelers": 5,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "tokyo",
        "title": "Tokyo",
        "location": "Japan",
        "region": "Asia Pacific",
        "country": "Japan",
        "lat": 35.6762,
        "lng": 139.6503,
        "price": 174,
        "propertyType": "Hotel",
        "rating": 4.6,
        "amenities": [
            "Near transit",
            "Free cancellation",
            "City view",
            "Breakfast included"
        ],
        "maxTravelers": 4,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "seoul",
        "title": "Seoul",
        "location": "South Korea",
        "region": "Asia Pacific",
        "country": "South Korea",
        "lat": 37.5665,
        "lng": 126.978,
        "price": 156,
        "propertyType": "Hotel",
        "rating": 4.2,
        "amenities": [
            "Near transit",
            "Breakfast included",
            "Free cancellation",
            "City view"
        ],
        "maxTravelers": 6,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "bangkok",
        "title": "Bangkok",
        "location": "Thailand",
        "region": "Asia Pacific",
        "country": "Thailand",
        "lat": 13.7563,
        "lng": 100.5018,
        "price": 98,
        "propertyType": "Hotel",
        "rating": 4.4,
        "amenities": [
            "Pool",
            "Breakfast included",
            "Free cancellation",
            "Near transit"
        ],
        "maxTravelers": 5,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "singapore",
        "title": "Singapore",
        "location": "Singapore",
        "region": "Asia Pacific",
        "country": "Singapore",
        "lat": 1.3521,
        "lng": 103.8198,
        "price": 221,
        "propertyType": "Apartment",
        "rating": 4.5,
        "amenities": [
            "Kitchen",
            "Pool",
            "Near transit",
            "City view"
        ],
        "maxTravelers": 4,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "bali",
        "title": "Bali",
        "location": "Indonesia",
        "region": "Asia Pacific",
        "country": "Indonesia",
        "lat": -8.3405,
        "lng": 115.092,
        "price": 161,
        "propertyType": "Villa",
        "rating": 4.8,
        "amenities": [
            "Pool",
            "Kitchen",
            "Free cancellation",
            "Spa"
        ],
        "maxTravelers": 6,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "sydney",
        "title": "Sydney",
        "location": "Australia",
        "region": "Asia Pacific",
        "country": "Australia",
        "lat": -33.8688,
        "lng": 151.2093,
        "price": 205,
        "propertyType": "Apartment",
        "rating": 4.5,
        "amenities": [
            "Kitchen",
            "City view",
            "Free cancellation",
            "Near transit"
        ],
        "maxTravelers": 5,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "auckland",
        "title": "Auckland",
        "location": "New Zealand",
        "region": "Asia Pacific",
        "country": "New Zealand",
        "lat": -36.8485,
        "lng": 174.7633,
        "price": 172,
        "propertyType": "Hotel",
        "rating": 4.4,
        "amenities": [
            "Free cancellation",
            "Breakfast included",
            "Harbor view",
            "Free parking"
        ],
        "maxTravelers": 4,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    },
    {
        "id": "queenstown",
        "title": "Queenstown",
        "location": "New Zealand",
        "region": "Asia Pacific",
        "country": "New Zealand",
        "lat": -45.0312,
        "lng": 168.6626,
        "price": 196,
        "propertyType": "Cabin",
        "rating": 4.7,
        "amenities": [
            "Mountain view",
            "Kitchen",
            "Free parking",
            "Free cancellation"
        ],
        "maxTravelers": 6,
        "availableStart": "2026-01-01",
        "availableEnd": "2028-12-31",
        "yearRound": true
    }
];

  function normalizeText(value) {
    if (window.TravelWebsiteUtils && typeof window.TravelWebsiteUtils.normalizeText === 'function') {
      return window.TravelWebsiteUtils.normalizeText(value);
    }

    return String(value || '').toLowerCase().trim();
  }

  function showToast(message) {
    if (window.TravelWebsiteUtils && typeof window.TravelWebsiteUtils.showToast === 'function') {
      window.TravelWebsiteUtils.showToast(message);
      return;
    }

    window.alert(message);
  }

  function safeParseJson(rawValue, fallbackValue) {
    try {
      return rawValue ? JSON.parse(rawValue) : fallbackValue;
    } catch (error) {
      return fallbackValue;
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function formatDisplayDate(dateText) {
    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(String(dateText || ''))
      ? new Date(dateText + 'T00:00:00')
      : null;

    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getSessionItem(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function setSessionItem(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      // Session storage can be blocked in some preview modes; the rest of the UI still works.
    }
  }

  function removeSessionItem(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      // Removing session data should not block the visible interface if storage is unavailable.
    }
  }

  function getCurrentPageFolder() {
    const path = String(window.location.pathname || '');
    const folderMatch = path.match(/\/([^/]+)\/index\.html$/);
    return folderMatch ? folderMatch[1] : '';
  }

  function isCurrentPage(folderName) {
    return getCurrentPageFolder() === folderName;
  }

  function getRelativePageUrl(folderName, queryParams) {
    const baseHref = isCurrentPage(folderName) ? 'index.html' : '../' + folderName + '/index.html';
    const params = new URLSearchParams(queryParams || {});
    const queryString = params.toString();

    return queryString ? baseHref + '?' + queryString : baseHref;
  }

  function getStoredCurrency() {
    try {
      const storedCurrency = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
      return CURRENCY_MAP[storedCurrency] ? storedCurrency : 'USD';
    } catch (error) {
      return 'USD';
    }
  }

  function formatMoneyFromUsd(usdAmount, currencyCode) {
    const selectedCurrency = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.USD;

    return new Intl.NumberFormat(selectedCurrency.locale, {
      style: 'currency',
      currency: selectedCurrency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(usdAmount || 0) * selectedCurrency.rate);
  }

  function applyCurrencyToEnhancedElements(rootElement) {
    const root = rootElement || document;
    const currencyCode = getStoredCurrency();

    root.querySelectorAll('[data-usd-amount]').forEach(function (element) {
      element.textContent = formatMoneyFromUsd(element.getAttribute('data-usd-amount'), currencyCode);
    });
  }

  function getSavedSearchState() {
    const storedState = safeParseJson(getSessionItem(SEARCH_STATE_STORAGE_KEY), {});
    const pageUrl = new URL(window.location.href);

    return {
      destination: pageUrl.searchParams.get('destination') || storedState.destination || '',
      checkIn: pageUrl.searchParams.get('checkIn') || storedState.checkIn || '',
      checkOut: pageUrl.searchParams.get('checkOut') || storedState.checkOut || '',
      travelers: pageUrl.searchParams.get('travelers') || storedState.travelers || ''
    };
  }

  function saveSearchState(partialState) {
    const nextState = Object.assign({}, getSavedSearchState(), partialState || {});
    setSessionItem(SEARCH_STATE_STORAGE_KEY, JSON.stringify(nextState));
    return nextState;
  }

  function getAuthUser() {
    return safeParseJson(getSessionItem(AUTH_STORAGE_KEY), null);
  }

  function setAuthUser(user) {
    setSessionItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  function clearAuthUser() {
    removeSessionItem(AUTH_STORAGE_KEY);
  }

  function getCustomLocation() {
    const customLocation = safeParseJson(getSessionItem(CUSTOM_LOCATION_STORAGE_KEY), null);

    if (!customLocation || !customLocation.title) {
      return null;
    }

    return Object.assign({
      source: 'session',
      amenities: ['Free cancellation'],
      availableStart: '2026-07-01',
      availableEnd: '2026-08-31',
      yearRound: false,
      rating: 4.6,
      propertyType: 'Vacation rental',
      maxTravelers: 4
    }, customLocation);
  }

  function getAllDestinations() {
    const customLocation = getCustomLocation();
    return customLocation ? BASE_DESTINATIONS.concat([customLocation]) : BASE_DESTINATIONS.slice();
  }

  function findDestinationByTitle(title) {
    const normalizedTitle = normalizeText(title);
    return getAllDestinations().find(function (destination) {
      return normalizeText(destination.title) === normalizedTitle;
    });
  }

  function getCheckoutHref(destination) {
    const savedSearch = getSavedSearchState();

    return getRelativePageUrl('CheckoutPage', {
      destination: destination.title,
      location: destination.location,
      price: destination.price,
      checkIn: savedSearch.checkIn,
      checkOut: savedSearch.checkOut,
      travelers: savedSearch.travelers
    });
  }

  function getSearchHref(destinationTitle) {
    const savedSearch = getSavedSearchState();

    return getRelativePageUrl('SearchResults', {
      destination: destinationTitle || savedSearch.destination || '',
      checkIn: savedSearch.checkIn,
      checkOut: savedSearch.checkOut,
      travelers: savedSearch.travelers
    });
  }

  function createDestinationPlaceholder(destination, extraClassName) {
    const placeholder = document.createElement('div');
    const initials = destination.title
      .split(/\s+/)
      .map(function (word) { return word.charAt(0); })
      .join('')
      .slice(0, 3)
      .toUpperCase();

    placeholder.className = 'destination-placeholder ' + (extraClassName || '');
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', 'Illustrated placeholder for ' + destination.title);
    placeholder.innerHTML = '<span>' + initials + '</span>';

    return placeholder;
  }

  function applyDestinationDataset(linkElement, destination) {
    if (!linkElement || !destination) {
      return;
    }

    const availabilityText = destination.yearRound
      ? 'Available year-round'
      : 'Available ' + formatDisplayDate(destination.availableStart) + ' to ' + formatDisplayDate(destination.availableEnd);

    linkElement.dataset.locationId = destination.id;
    linkElement.dataset.availableStart = destination.availableStart;
    linkElement.dataset.availableEnd = destination.availableEnd;
    linkElement.dataset.yearRound = destination.yearRound ? 'true' : 'false';
    linkElement.dataset.maxTravelers = String(destination.maxTravelers);
    linkElement.dataset.priceUsd = String(destination.price);
    linkElement.dataset.propertyType = destination.propertyType;
    linkElement.dataset.rating = String(destination.rating);
    linkElement.dataset.region = destination.region;
    linkElement.dataset.amenities = destination.amenities.join('|');
    linkElement.href = getCheckoutHref(destination);

    const priceElement = linkElement.querySelector('.price');
    if (priceElement) {
      priceElement.setAttribute('data-usd-amount', String(destination.price));
    }

    const metaElement = linkElement.querySelector('.listing-meta');
    if (metaElement) {
      metaElement.textContent =
        'Sleeps up to ' + destination.maxTravelers +
        ' • ' + availabilityText +
        ' • ' + destination.propertyType + ' • ' + destination.rating.toFixed(1) + '/5';
    }
  }

  function createHomeTripLink(destination) {
    const tripLink = document.createElement('a');
    tripLink.className = 'trip-link enhanced-destination-card';
    tripLink.href = getCheckoutHref(destination);

    const tripCard = document.createElement('article');
    tripCard.className = 'trip-card';

    if (destination.homeImage) {
      const image = document.createElement('img');
      image.src = destination.homeImage;
      image.alt = destination.title;
      tripCard.appendChild(image);
    } else {
      tripCard.appendChild(createDestinationPlaceholder(destination, 'trip-placeholder'));
    }

    tripCard.insertAdjacentHTML('beforeend',
      '<div class="trip-info">' +
        '<h3>' + escapeHtml(destination.title) + '</h3>' +
        '<p class="location">' + escapeHtml(destination.location) + '</p>' +
        '<p class="price" data-usd-amount="' + escapeHtml(destination.price) + '">$' + escapeHtml(destination.price) + '</p>' +
        '<p class="note">per night • ' + escapeHtml(destination.region) + '</p>' +
      '</div>'
    );

    tripLink.appendChild(tripCard);
    applyDestinationDataset(tripLink, destination);

    return tripLink;
  }

  function createSearchListingLink(destination) {
    const listingLink = document.createElement('a');
    listingLink.className = 'listing-link enhanced-destination-card';
    listingLink.href = getCheckoutHref(destination);

    const listingCard = document.createElement('article');
    listingCard.className = 'listing-card';

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'listing-media';

    if (destination.searchImage) {
      const image = document.createElement('img');
      image.className = 'listing-image';
      image.src = destination.searchImage;
      image.alt = destination.title;
      imageWrapper.appendChild(image);
    } else {
      imageWrapper.appendChild(createDestinationPlaceholder(destination, 'listing-image listing-placeholder'));
    }

    const listingInfo = document.createElement('div');
    listingInfo.className = 'listing-info';
    listingInfo.innerHTML =
      '<h3>' + escapeHtml(destination.title) + '</h3>' +
      '<p class="location">' + escapeHtml(destination.location) + '</p>' +
      '<p class="price" data-usd-amount="' + escapeHtml(destination.price) + '">$' + escapeHtml(destination.price) + '</p>' +
      '<p class="note">per night</p>' +
      '<p class="listing-meta"></p>' +
      '<p class="listing-context" aria-live="polite"></p>' +
      '<div class="listing-badges" aria-label="Property features">' +
        '<span>' + escapeHtml(destination.propertyType) + '</span>' +
        '<span>' + escapeHtml(destination.rating.toFixed(1)) + '/5</span>' +
        '<span>' + escapeHtml(destination.region) + '</span>' +
      '</div>';

    listingCard.appendChild(imageWrapper);
    listingCard.appendChild(listingInfo);
    listingLink.appendChild(listingCard);
    applyDestinationDataset(listingLink, destination);

    return listingLink;
  }

  function configureHomeTripReveal(grid) {
    const maxVisibleTripCards = 5;
    const allTripLinks = Array.from(grid.querySelectorAll('.trip-link'));
    let revealActions = document.querySelector('.trip-reveal-actions');
    let revealButton = document.getElementById('homeTripShowMoreButton');

    if (allTripLinks.length <= maxVisibleTripCards) {
      allTripLinks.forEach(function (tripLink) {
        tripLink.classList.remove('home-trip-hidden');
      });

      if (revealActions) {
        revealActions.remove();
      }

      return;
    }

    if (!revealActions) {
      revealActions = document.createElement('div');
      revealActions.className = 'trip-reveal-actions';
      revealActions.setAttribute('aria-live', 'polite');

      revealButton = document.createElement('button');
      revealButton.id = 'homeTripShowMoreButton';
      revealButton.className = 'trip-show-more-button';
      revealButton.type = 'button';

      revealActions.appendChild(revealButton);
      grid.insertAdjacentElement('afterend', revealActions);
    }

    // Keep the homepage short by default on mobile while still letting users
    // browse the full destination set when they intentionally ask for more.
    function syncTripVisibility() {
      const isExpanded = revealButton.getAttribute('aria-expanded') === 'true';
      const hiddenCount = Math.max(0, allTripLinks.length - maxVisibleTripCards);

      allTripLinks.forEach(function (tripLink, index) {
        tripLink.classList.toggle('home-trip-hidden', !isExpanded && index >= maxVisibleTripCards);
      });

      revealButton.textContent = isExpanded
        ? 'Show fewer trip ideas'
        : 'Show more trip ideas (' + hiddenCount + ' more)';
      revealButton.setAttribute('aria-label', isExpanded
        ? 'Show only the first five trip ideas'
        : 'Show all ' + allTripLinks.length + ' trip ideas');
    }

    if (revealButton.dataset.tripRevealBound !== 'true') {
      revealButton.setAttribute('aria-expanded', 'false');
      revealButton.addEventListener('click', function () {
        const isExpanded = revealButton.getAttribute('aria-expanded') === 'true';
        revealButton.setAttribute('aria-expanded', String(!isExpanded));
        syncTripVisibility();
      });
      revealButton.dataset.tripRevealBound = 'true';
    }

    syncTripVisibility();
  }

  function enhanceHomeDestinations() {
    if (!isCurrentPage('Homepage')) {
      return;
    }

    const grid = document.querySelector('.trip-section .trip-grid');
    if (!grid) {
      return;
    }

    const existingTitles = new Set();

    grid.querySelectorAll('.trip-link').forEach(function (tripLink) {
      const titleElement = tripLink.querySelector('h3');
      const title = titleElement ? titleElement.textContent.trim() : '';
      const matchingDestination = findDestinationByTitle(title);

      if (title) {
        existingTitles.add(normalizeText(title));
      }

      applyDestinationDataset(tripLink, matchingDestination);
    });

    getAllDestinations().forEach(function (destination) {
      if (!existingTitles.has(normalizeText(destination.title))) {
        grid.appendChild(createHomeTripLink(destination));
      }
    });

    configureHomeTripReveal(grid);
  }

  function enhanceSearchDestinations() {
    if (!isCurrentPage('SearchResults')) {
      return;
    }

    const listingsPanel = document.querySelector('.listings-panel');
    if (!listingsPanel) {
      return;
    }

    const existingTitles = new Set();

    listingsPanel.querySelectorAll('.listing-link').forEach(function (listingLink) {
      const titleElement = listingLink.querySelector('h3');
      const title = titleElement ? titleElement.textContent.trim() : '';
      const matchingDestination = findDestinationByTitle(title);

      if (title) {
        existingTitles.add(normalizeText(title));
      }

      applyDestinationDataset(listingLink, matchingDestination);
    });

    getAllDestinations().forEach(function (destination) {
      if (!existingTitles.has(normalizeText(destination.title))) {
        listingsPanel.appendChild(createSearchListingLink(destination));
      }
    });
  }

  const MAP_VIEWBOX = { minX: -2, minY: 17.68, width: 964, height: 924.64 };
  const MAP_MERCATOR_SCALE = MAP_VIEWBOX.width / (2 * Math.PI);
  const MAP_EQUATOR_Y = 459.8;

  /* Point offsets only separate overlapping pins. They are intentionally small so
     each marker still represents the real destination area on the supplied SVG. */
  const MAP_POINT_OFFSETS = {
    'san-juan': { x: 0.25, y: 0.15 },
    'miami-beach': { x: -0.15, y: 0.45 },
    'myrtle-beach': { x: 0.15, y: -0.45 },
    'wilmington': { x: 0.75, y: -0.75 },
    'hilton-head': { x: -0.65, y: 0.15 },
    'new-york-city': { x: 0.45, y: -0.2 },
    'cancun': { x: -0.35, y: 0.35 },
    'london': { x: -0.7, y: -0.15 },
    'paris': { x: 0.45, y: 0.05 },
    'barcelona': { x: -0.6, y: 0.55 },
    'rome': { x: 0.75, y: 0.45 },
    'cairo': { x: 0.55, y: 0.25 },
    'istanbul': { x: -0.4, y: -0.25 },
    'dubai': { x: 0.45, y: 0.3 },
    'tokyo': { x: 0.55, y: -0.1 },
    'seoul': { x: -0.55, y: 0.2 },
    'bangkok': { x: -0.35, y: 0.1 },
    'singapore': { x: 0.45, y: 0.35 },
    'bali': { x: 0.45, y: 0.4 },
    'sydney': { x: -0.35, y: 0.45 },
    'auckland': { x: -0.8, y: -0.1 },
    'queenstown': { x: 0.15, y: 0.65 }
  };

  function projectMapPoint(destination) {
    const longitude = Math.max(-180, Math.min(180, Number(destination.lng) || 0));
    const latitude = Math.max(-85, Math.min(85, Number(destination.lat) || 0));
    const latitudeRadians = latitude * Math.PI / 180;
    const mercatorY = Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2));
    const offset = MAP_POINT_OFFSETS[destination.id] || { x: 0, y: 0 };

    /* worldHigh.svg is a Mercator-projected map. Using the SVG viewBox and
       projection scale keeps markers attached to the land shapes at every size. */
    const projectedX = MAP_VIEWBOX.minX + ((longitude + 180) / 360) * MAP_VIEWBOX.width;
    const projectedY = MAP_EQUATOR_Y - MAP_MERCATOR_SCALE * mercatorY;
    const xPercent = ((projectedX - MAP_VIEWBOX.minX) / MAP_VIEWBOX.width) * 100 + (offset.x || 0);
    const yPercent = ((projectedY - MAP_VIEWBOX.minY) / MAP_VIEWBOX.height) * 100 + (offset.y || 0);

    return {
      x: Math.max(1.2, Math.min(98.8, xPercent)),
      y: Math.max(1.2, Math.min(98.8, yPercent))
    };
  }

  function renderHomepageWorldMap() {
    if (!isCurrentPage('Homepage')) {
      return;
    }

    const mapMount = document.getElementById('worldMapPoints');
    const listMount = document.getElementById('mapLocationList');

    if (!mapMount || !listMount) {
      return;
    }

    const destinations = getAllDestinations();
    const destinationLinks = destinations.map(function (destination) {
      const point = projectMapPoint(destination);
      const title = destination.title + ', ' + destination.location;
      const edgeClass = point.x < 12
        ? ' map-point-link--right-label'
        : point.x > 88
          ? ' map-point-link--left-label'
          : '';

      return (
        '<a class="map-point-link' + edgeClass + '" href="' + getSearchHref(destination.title) + '" ' +
          'style="--point-x:' + point.x.toFixed(3) + '%; --point-y:' + point.y.toFixed(3) + '%;" ' +
          'aria-label="Search stays in ' + escapeHtml(title) + '">' +
          '<span class="map-point" aria-hidden="true"></span>' +
          '<span class="map-point-label">' + escapeHtml(destination.title) + '</span>' +
        '</a>'
      );
    }).join('');

    mapMount.innerHTML =
      '<div class="world-map-frame">' +
        '<img class="world-map-image" src="../shared/worldHigh.svg" alt="World map outline" loading="lazy" draggable="false" />' +
        '<div class="map-points-layer" aria-label="Destination points on the world map">' + destinationLinks + '</div>' +
      '</div>';

    listMount.innerHTML =
      '<p class="map-list-heading">' + destinations.length + ' destinations plotted</p>' +
      '<div class="map-chip-grid">' +
        destinations.map(function (destination) {
          return (
            '<a href="' + getSearchHref(destination.title) + '" class="map-location-chip">' +
              '<span class="map-chip-dot" aria-hidden="true"></span>' +
              '<span><strong>' + escapeHtml(destination.title) + '</strong><small>' + escapeHtml(destination.location) + '</small></span>' +
            '</a>'
          );
        }).join('') +
      '</div>';
  }

  function populateSearchFormsFromSession() {
    const state = getSavedSearchState();

    document.querySelectorAll('.search-form').forEach(function (form) {
      const destinationInput = form.querySelector('input[aria-label="Destination"], input[name="destination"]');
      const checkInInput = form.querySelector('input[aria-label="Check-in"], input[name="checkIn"]');
      const checkOutInput = form.querySelector('input[aria-label="Check-out"], input[name="checkOut"]');
      const travelersInput = form.querySelector('input[aria-label="Travelers"], input[name="travelers"]');

      if (destinationInput && !destinationInput.value && state.destination) {
        destinationInput.value = state.destination;
      }

      if (checkInInput && !checkInInput.value && state.checkIn) {
        checkInInput.value = state.checkIn;
      }

      if (checkOutInput && !checkOutInput.value && state.checkOut) {
        checkOutInput.value = state.checkOut;
      }

      if (travelersInput && !travelersInput.value && state.travelers) {
        travelersInput.value = state.travelers;
      }

      [destinationInput, checkInInput, checkOutInput, travelersInput].forEach(function (inputElement) {
        if (!inputElement || inputElement.dataset.searchStateBound === 'true') {
          return;
        }

        inputElement.addEventListener('input', function () {
          saveSearchState({
            destination: destinationInput ? destinationInput.value.trim() : '',
            checkIn: checkInInput ? checkInInput.value.trim() : '',
            checkOut: checkOutInput ? checkOutInput.value.trim() : '',
            travelers: travelersInput ? travelersInput.value.trim() : ''
          });
        });

        inputElement.dataset.searchStateBound = 'true';
      });
    });
  }

  function ensureDesktopHomeLink() {
    document.querySelectorAll('.desktop-nav').forEach(function (desktopNav) {
      if (desktopNav.querySelector('.enhanced-home-nav-link')) {
        return;
      }

      const homeLink = document.createElement('a');
      homeLink.href = getRelativePageUrl('Homepage');
      homeLink.className = 'nav-link enhanced-home-nav-link';
      homeLink.textContent = 'Home';

      if (isCurrentPage('Homepage')) {
        homeLink.classList.add('active-link');
        homeLink.setAttribute('aria-current', 'page');
      }

      desktopNav.insertBefore(homeLink, desktopNav.firstElementChild);
    });
  }

  function closeMobileMenuIfOpen() {
    const mobileNav = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileMenuOverlay');
    const hamburgerButton = document.getElementById('hamburgerButton');

    if (mobileNav) {
      mobileNav.classList.remove('show');
    }

    if (overlay) {
      overlay.classList.remove('show');
    }

    if (hamburgerButton) {
      hamburgerButton.textContent = '☰';
      hamburgerButton.setAttribute('aria-expanded', 'false');
      hamburgerButton.setAttribute('aria-label', 'Open navigation menu');
    }
  }

  function setFieldFeedback(inputElement, feedbackElement, state, message) {
    if (!inputElement || !feedbackElement) {
      return;
    }

    inputElement.classList.remove('is-valid', 'is-invalid');
    feedbackElement.classList.remove('success', 'error');

    if (!message) {
      feedbackElement.textContent = '';
      inputElement.removeAttribute('aria-invalid');
      return;
    }

    inputElement.classList.add(state === 'success' ? 'is-valid' : 'is-invalid');
    inputElement.setAttribute('aria-invalid', state === 'success' ? 'false' : 'true');
    feedbackElement.textContent = message;
    feedbackElement.classList.add(state);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  function updateAuthButtons() {
    const user = getAuthUser();

    document.querySelectorAll('.sign-in-button').forEach(function (button) {
      if (user) {
        button.textContent = 'Hi, ' + (user.firstName || 'Traveler');
        button.classList.add('is-signed-in');
        button.setAttribute('aria-label', 'Signed in as ' + (user.firstName || 'traveler') + '. Open account options.');
      } else {
        button.textContent = 'Sign in';
        button.classList.remove('is-signed-in');
        button.setAttribute('aria-label', 'Open sign in and sign up form');
      }
    });
  }

  function ensureAuthModal() {
    if (document.getElementById('sharedAuthModal')) {
      return document.getElementById('sharedAuthModal');
    }

    const modal = document.createElement('div');
    modal.id = 'sharedAuthModal';
    modal.className = 'shared-modal shared-auth-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'sharedAuthTitle');
    modal.hidden = true;

    modal.innerHTML =
      '<div class="shared-modal-card" role="document">' +
        '<button type="button" class="shared-modal-close" data-shared-modal-close aria-label="Close sign in modal">✕</button>' +
        '<p class="shared-modal-eyebrow">Account access</p>' +
        '<h2 id="sharedAuthTitle">Sign in or create an account</h2>' +
        '<p class="shared-modal-help">Use this account form to access session features. Your signed-in state stays in this browser session only.</p>' +
        '<div class="auth-mode-tabs" role="tablist" aria-label="Choose account form">' +
          '<button type="button" class="auth-mode-tab active" data-auth-mode="signIn" aria-selected="true">Sign in</button>' +
          '<button type="button" class="auth-mode-tab" data-auth-mode="signUp" aria-selected="false">Sign up</button>' +
        '</div>' +
        '<form class="shared-auth-form" id="sharedSignInForm" novalidate>' +
          '<div class="shared-field">' +
            '<label for="sharedSignInEmail">Email address</label>' +
            '<input id="sharedSignInEmail" type="email" autocomplete="email" placeholder="name@example.com" aria-describedby="sharedSignInEmailFeedback" required />' +
            '<span id="sharedSignInEmailFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
          '</div>' +
          '<div class="shared-field">' +
            '<label for="sharedSignInPassword">Password</label>' +
            '<input id="sharedSignInPassword" type="password" autocomplete="current-password" placeholder="At least 6 characters" aria-describedby="sharedSignInPasswordFeedback" required />' +
            '<span id="sharedSignInPasswordFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
          '</div>' +
          '<p class="shared-form-status" id="sharedSignInStatus" aria-live="polite"></p>' +
          '<button type="submit" class="shared-submit-button">Sign in</button>' +
        '</form>' +
        '<form class="shared-auth-form hidden-form" id="sharedSignUpForm" novalidate>' +
          '<div class="shared-field">' +
            '<label for="sharedSignUpFirstName">First name</label>' +
            '<input id="sharedSignUpFirstName" type="text" autocomplete="given-name" placeholder="First name" aria-describedby="sharedSignUpFirstNameFeedback" required />' +
            '<span id="sharedSignUpFirstNameFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
          '</div>' +
          '<div class="shared-field">' +
            '<label for="sharedSignUpEmail">Email address</label>' +
            '<input id="sharedSignUpEmail" type="email" autocomplete="email" placeholder="name@example.com" aria-describedby="sharedSignUpEmailFeedback" required />' +
            '<span id="sharedSignUpEmailFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
          '</div>' +
          '<div class="shared-field">' +
            '<label for="sharedSignUpPassword">Password</label>' +
            '<input id="sharedSignUpPassword" type="password" autocomplete="new-password" placeholder="8+ characters and one number" aria-describedby="sharedSignUpPasswordFeedback" required />' +
            '<span id="sharedSignUpPasswordFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
          '</div>' +
          '<div class="shared-field">' +
            '<label for="sharedSignUpConfirm">Confirm password</label>' +
            '<input id="sharedSignUpConfirm" type="password" autocomplete="new-password" placeholder="Repeat password" aria-describedby="sharedSignUpConfirmFeedback" required />' +
            '<span id="sharedSignUpConfirmFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
          '</div>' +
          '<p class="shared-form-status" id="sharedSignUpStatus" aria-live="polite"></p>' +
          '<button type="submit" class="shared-submit-button">Create account</button>' +
        '</form>' +
      '</div>';

    document.body.appendChild(modal);
    bindAuthModalEvents(modal);

    return modal;
  }

  function setAuthMode(mode) {
    const modal = ensureAuthModal();
    const isSignUp = mode === 'signUp';
    const signInForm = modal.querySelector('#sharedSignInForm');
    const signUpForm = modal.querySelector('#sharedSignUpForm');

    modal.querySelectorAll('.auth-mode-tab').forEach(function (button) {
      const isActive = button.getAttribute('data-auth-mode') === mode;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    signInForm.classList.toggle('hidden-form', isSignUp);
    signUpForm.classList.toggle('hidden-form', !isSignUp);
  }

  function openAuthModal(mode) {
    const user = getAuthUser();

    if (user) {
      closeAuthModal();
      openAccountModal();
      showToast('You are already signed in. Sign out before using the sign in or sign up form again.');
      return;
    }

    const modal = ensureAuthModal();

    setAuthMode(mode || 'signIn');
    closeMobileMenuIfOpen();
    modal.hidden = false;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    window.setTimeout(function () {
      const focusTarget = modal.querySelector('.shared-auth-form:not(.hidden-form) input');
      if (focusTarget) {
        focusTarget.focus();
      }
    }, 0);
  }

  function closeAuthModal() {
    const modal = document.getElementById('sharedAuthModal');

    if (!modal) {
      return;
    }

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.hidden = true;
  }

  function ensureAccountModal() {
    if (document.getElementById('sharedAccountModal')) {
      return document.getElementById('sharedAccountModal');
    }

    const modal = document.createElement('div');
    modal.id = 'sharedAccountModal';
    modal.className = 'shared-modal shared-account-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'sharedAccountTitle');
    modal.hidden = true;

    modal.innerHTML =
      '<div class="shared-modal-card" role="document">' +
        '<button type="button" class="shared-modal-close" data-shared-account-close aria-label="Close account options">✕</button>' +
        '<p class="shared-modal-eyebrow">Account</p>' +
        '<h2 id="sharedAccountTitle">You are signed in</h2>' +
        '<p class="shared-modal-help">To protect the current session state, the sign in and sign up forms stay locked until you sign out.</p>' +
        '<div class="shared-account-summary" aria-live="polite">' +
          '<span class="shared-account-avatar" aria-hidden="true">N</span>' +
          '<div>' +
            '<p class="shared-account-name" id="sharedAccountName"></p>' +
            '<p class="shared-account-email" id="sharedAccountEmail"></p>' +
          '</div>' +
        '</div>' +
        '<div class="shared-account-actions">' +
          '<button type="button" class="shared-outline-button" data-shared-account-close>Keep browsing</button>' +
          '<button type="button" class="shared-submit-button" data-shared-sign-out>Sign out</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    bindAccountModalEvents(modal);

    return modal;
  }

  function refreshAccountModal() {
    const user = getAuthUser();
    const nameElement = document.getElementById('sharedAccountName');
    const emailElement = document.getElementById('sharedAccountEmail');
    const avatarElement = document.querySelector('#sharedAccountModal .shared-account-avatar');
    const firstName = user && user.firstName ? user.firstName : 'Traveler';

    if (nameElement) {
      nameElement.textContent = 'Signed in as ' + firstName;
    }

    if (emailElement) {
      emailElement.textContent = user && user.email ? user.email : 'Session account';
    }

    if (avatarElement) {
      avatarElement.textContent = firstName.charAt(0).toUpperCase();
    }
  }

  function openAccountModal() {
    const user = getAuthUser();

    if (!user) {
      openAuthModal('signIn');
      return;
    }

    const modal = ensureAccountModal();

    refreshAccountModal();
    closeMobileMenuIfOpen();
    modal.hidden = false;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    window.setTimeout(function () {
      const signOutButton = modal.querySelector('[data-shared-sign-out]');
      if (signOutButton) {
        signOutButton.focus();
      }
    }, 0);
  }

  function closeAccountModal() {
    const modal = document.getElementById('sharedAccountModal');

    if (!modal) {
      return;
    }

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.hidden = true;
  }

  function bindAccountModalEvents(modal) {
    modal.addEventListener('click', function (event) {
      if (event.target === modal || event.target.closest('[data-shared-account-close]')) {
        closeAccountModal();
        return;
      }

      if (event.target.closest('[data-shared-sign-out]')) {
        clearAuthUser();
        closeAccountModal();
        updateAuthButtons();
        showToast('You have signed out for this session.');
      }
    });
  }

  function validateSignInField(fieldName) {
    const fieldMap = {
      email: {
        input: document.getElementById('sharedSignInEmail'),
        feedback: document.getElementById('sharedSignInEmailFeedback')
      },
      password: {
        input: document.getElementById('sharedSignInPassword'),
        feedback: document.getElementById('sharedSignInPasswordFeedback')
      }
    };
    const field = fieldMap[fieldName];
    const value = field && field.input ? field.input.value.trim() : '';

    if (!field || !field.input || !field.feedback) {
      return false;
    }

    if (fieldName === 'email') {
      if (!value) {
        setFieldFeedback(field.input, field.feedback, 'error', 'Enter the email address for your account.');
        return false;
      }

      if (!isValidEmail(value)) {
        setFieldFeedback(field.input, field.feedback, 'error', 'Use a valid email format, like name@example.com.');
        return false;
      }

      setFieldFeedback(field.input, field.feedback, 'success', 'Email format looks good.');
      return true;
    }

    if (value.length < 6) {
      setFieldFeedback(field.input, field.feedback, 'error', 'Password must be at least 6 characters to sign in.');
      return false;
    }

    setFieldFeedback(field.input, field.feedback, 'success', 'Password length looks good.');
    return true;
  }

  function validateSignUpField(fieldName) {
    const firstNameInput = document.getElementById('sharedSignUpFirstName');
    const emailInput = document.getElementById('sharedSignUpEmail');
    const passwordInput = document.getElementById('sharedSignUpPassword');
    const confirmInput = document.getElementById('sharedSignUpConfirm');
    const fieldMap = {
      firstName: { input: firstNameInput, feedback: document.getElementById('sharedSignUpFirstNameFeedback') },
      email: { input: emailInput, feedback: document.getElementById('sharedSignUpEmailFeedback') },
      password: { input: passwordInput, feedback: document.getElementById('sharedSignUpPasswordFeedback') },
      confirm: { input: confirmInput, feedback: document.getElementById('sharedSignUpConfirmFeedback') }
    };
    const field = fieldMap[fieldName];
    const value = field && field.input ? field.input.value.trim() : '';

    if (!field || !field.input || !field.feedback) {
      return false;
    }

    if (fieldName === 'firstName') {
      if (value.length < 2) {
        setFieldFeedback(field.input, field.feedback, 'error', 'First name must be at least 2 characters.');
        return false;
      }

      setFieldFeedback(field.input, field.feedback, 'success', 'First name looks good.');
      return true;
    }

    if (fieldName === 'email') {
      if (!isValidEmail(value)) {
        setFieldFeedback(field.input, field.feedback, 'error', 'Enter a valid email address, like name@example.com.');
        return false;
      }

      setFieldFeedback(field.input, field.feedback, 'success', 'Email format looks good.');
      return true;
    }

    if (fieldName === 'password') {
      if (value.length < 8) {
        setFieldFeedback(field.input, field.feedback, 'error', 'Password must be at least 8 characters.');
        return false;
      }

      if (!/\d/.test(value)) {
        setFieldFeedback(field.input, field.feedback, 'error', 'Password must include at least one number.');
        return false;
      }

      setFieldFeedback(field.input, field.feedback, 'success', 'Password is strong enough for this account form.');
      return true;
    }

    if (fieldName === 'confirm') {
      if (!value) {
        setFieldFeedback(field.input, field.feedback, 'error', 'Repeat your password to confirm it.');
        return false;
      }

      if (passwordInput && value !== passwordInput.value.trim()) {
        setFieldFeedback(field.input, field.feedback, 'error', 'Passwords must match exactly.');
        return false;
      }

      setFieldFeedback(field.input, field.feedback, 'success', 'Passwords match.');
      return true;
    }

    return false;
  }

  function bindAuthModalEvents(modal) {
    modal.addEventListener('click', function (event) {
      if (event.target === modal || event.target.closest('[data-shared-modal-close]')) {
        closeAuthModal();
      }
    });

    modal.querySelectorAll('.auth-mode-tab').forEach(function (button) {
      button.addEventListener('click', function () {
        setAuthMode(button.getAttribute('data-auth-mode'));
      });
    });

    ['email', 'password'].forEach(function (fieldName) {
      const input = document.getElementById('sharedSignIn' + (fieldName === 'email' ? 'Email' : 'Password'));
      if (input) {
        input.addEventListener('input', function () { validateSignInField(fieldName); });
        input.addEventListener('blur', function () { validateSignInField(fieldName); });
      }
    });

    ['firstName', 'email', 'password', 'confirm'].forEach(function (fieldName) {
      const idSuffix = fieldName === 'firstName' ? 'FirstName' : fieldName === 'confirm' ? 'Confirm' : fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      const input = document.getElementById('sharedSignUp' + idSuffix);

      if (input) {
        input.addEventListener('input', function () {
          validateSignUpField(fieldName);
          if (fieldName === 'password') {
            validateSignUpField('confirm');
          }
        });
        input.addEventListener('blur', function () { validateSignUpField(fieldName); });
      }
    });

    modal.querySelector('#sharedSignInForm').addEventListener('submit', function (event) {
      const status = document.getElementById('sharedSignInStatus');
      const isEmailValid = validateSignInField('email');
      const isPasswordValid = validateSignInField('password');
      const emailInput = document.getElementById('sharedSignInEmail');

      event.preventDefault();

      if (!isEmailValid || !isPasswordValid) {
        status.textContent = 'Fix the highlighted fields before signing in.';
        status.className = 'shared-form-status error';
        return;
      }

      setAuthUser({
        firstName: emailInput.value.split('@')[0] || 'Traveler',
        email: emailInput.value.trim(),
        signedInAt: new Date().toISOString()
      });
      status.textContent = 'Signed in successfully.';
      status.className = 'shared-form-status success';
      updateAuthButtons();
      closeAuthModal();
      showToast('You are signed in for this session.');
    });

    modal.querySelector('#sharedSignUpForm').addEventListener('submit', function (event) {
      const status = document.getElementById('sharedSignUpStatus');
      const isFirstNameValid = validateSignUpField('firstName');
      const isEmailValid = validateSignUpField('email');
      const isPasswordValid = validateSignUpField('password');
      const isConfirmValid = validateSignUpField('confirm');
      const firstNameInput = document.getElementById('sharedSignUpFirstName');
      const emailInput = document.getElementById('sharedSignUpEmail');

      event.preventDefault();

      if (!isFirstNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
        status.textContent = 'Fix the highlighted fields before creating the account.';
        status.className = 'shared-form-status error';
        return;
      }

      setAuthUser({
        firstName: firstNameInput.value.trim(),
        email: emailInput.value.trim(),
        signedInAt: new Date().toISOString()
      });
      status.textContent = 'Account created for this session.';
      status.className = 'shared-form-status success';
      updateAuthButtons();
      closeAuthModal();
      showToast('Account created. You are signed in for this session.');
    });
  }

  function ensurePropertyModal() {
    if (document.getElementById('sharedPropertyModal')) {
      return document.getElementById('sharedPropertyModal');
    }

    const modal = document.createElement('div');
    modal.id = 'sharedPropertyModal';
    modal.className = 'shared-modal shared-property-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'sharedPropertyTitle');
    modal.hidden = true;

    modal.innerHTML =
      '<div class="shared-modal-card" role="document">' +
        '<button type="button" class="shared-modal-close" data-shared-property-close aria-label="Close list your property form">✕</button>' +
        '<p class="shared-modal-eyebrow">Session-only listing</p>' +
        '<h2 id="sharedPropertyTitle">List your location</h2>' +
        '<p class="shared-modal-help">This listing is stored for the current browser session only and can be filtered by the availability dates you enter.</p>' +
        '<form id="sharedPropertyForm" class="shared-auth-form" novalidate>' +
          '<div class="shared-field">' +
            '<label for="propertyName">Location name</label>' +
            '<input id="propertyName" type="text" placeholder="Example: Lakeside Studio" aria-describedby="propertyNameFeedback" required />' +
            '<span id="propertyNameFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
          '</div>' +
          '<div class="shared-field">' +
            '<label for="propertyArea">City / country</label>' +
            '<input id="propertyArea" type="text" placeholder="Example: Lisbon, Portugal" aria-describedby="propertyAreaFeedback" required />' +
            '<span id="propertyAreaFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
          '</div>' +
          '<div class="shared-field shared-field-row">' +
            '<div>' +
              '<label for="propertyPrice">Nightly price in USD</label>' +
              '<input id="propertyPrice" type="number" min="50" step="1" placeholder="180" aria-describedby="propertyPriceFeedback" required />' +
              '<span id="propertyPriceFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
            '</div>' +
            '<div>' +
              '<label for="propertyTravelers">Max travelers</label>' +
              '<input id="propertyTravelers" type="number" min="1" max="12" step="1" placeholder="4" aria-describedby="propertyTravelersFeedback" required />' +
              '<span id="propertyTravelersFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
            '</div>' +
          '</div>' +
          '<div class="shared-field shared-field-row">' +
            '<div>' +
              '<label for="propertyLatitude">Map latitude</label>' +
              '<input id="propertyLatitude" type="number" min="-85" max="85" step="0.0001" placeholder="38.7223" aria-describedby="propertyLatitudeFeedback" required />' +
              '<span id="propertyLatitudeFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
            '</div>' +
            '<div>' +
              '<label for="propertyLongitude">Map longitude</label>' +
              '<input id="propertyLongitude" type="number" min="-180" max="180" step="0.0001" placeholder="-9.1393" aria-describedby="propertyLongitudeFeedback" required />' +
              '<span id="propertyLongitudeFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
            '</div>' +
          '</div>' +
          '<div class="shared-field shared-field-row">' +
            '<div>' +
              '<label for="propertyAvailableStart">Available from</label>' +
              '<input id="propertyAvailableStart" type="date" aria-describedby="propertyAvailableStartFeedback" required />' +
              '<span id="propertyAvailableStartFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
            '</div>' +
            '<div>' +
              '<label for="propertyAvailableEnd">Available until</label>' +
              '<input id="propertyAvailableEnd" type="date" aria-describedby="propertyAvailableEndFeedback" required />' +
              '<span id="propertyAvailableEndFeedback" class="shared-field-feedback" aria-live="polite"></span>' +
            '</div>' +
          '</div>' +
          '<div class="shared-field">' +
            '<label for="propertyType">Property type</label>' +
            '<select id="propertyType">' +
              '<option>Vacation rental</option>' +
              '<option>Hotel</option>' +
              '<option>Resort</option>' +
              '<option>Apartment</option>' +
              '<option>Boutique hotel</option>' +
              '<option>Villa</option>' +
              '<option>Cabin</option>' +
            '</select>' +
          '</div>' +
          '<p class="shared-form-status" id="sharedPropertyStatus" aria-live="polite"></p>' +
          '<button type="submit" class="shared-submit-button">Add to search results</button>' +
        '</form>' +
      '</div>';

    document.body.appendChild(modal);
    bindPropertyModalEvents(modal);

    return modal;
  }

  function openPropertyModal() {
    const user = getAuthUser();

    if (!user) {
      showToast('Sign in first, then choose List your property again to add a session-only location.');
      openAuthModal('signIn');
      return;
    }

    const modal = ensurePropertyModal();
    closeMobileMenuIfOpen();
    modal.hidden = false;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    window.setTimeout(function () {
      const nameInput = document.getElementById('propertyName');
      if (nameInput) {
        nameInput.focus();
      }
    }, 0);
  }

  function closePropertyModal() {
    const modal = document.getElementById('sharedPropertyModal');

    if (!modal) {
      return;
    }

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.hidden = true;
  }

  function validatePropertyField(fieldName) {
    const fields = {
      propertyName: { input: document.getElementById('propertyName'), feedback: document.getElementById('propertyNameFeedback') },
      propertyArea: { input: document.getElementById('propertyArea'), feedback: document.getElementById('propertyAreaFeedback') },
      propertyPrice: { input: document.getElementById('propertyPrice'), feedback: document.getElementById('propertyPriceFeedback') },
      propertyTravelers: { input: document.getElementById('propertyTravelers'), feedback: document.getElementById('propertyTravelersFeedback') },
      propertyLatitude: { input: document.getElementById('propertyLatitude'), feedback: document.getElementById('propertyLatitudeFeedback') },
      propertyLongitude: { input: document.getElementById('propertyLongitude'), feedback: document.getElementById('propertyLongitudeFeedback') },
      propertyAvailableStart: { input: document.getElementById('propertyAvailableStart'), feedback: document.getElementById('propertyAvailableStartFeedback') },
      propertyAvailableEnd: { input: document.getElementById('propertyAvailableEnd'), feedback: document.getElementById('propertyAvailableEndFeedback') }
    };
    const field = fields[fieldName];
    const rawValue = field && field.input ? field.input.value.trim() : '';
    const numberValue = Number(rawValue);

    if (!field || !field.input || !field.feedback) {
      return false;
    }

    if (fieldName === 'propertyName' && rawValue.length < 2) {
      setFieldFeedback(field.input, field.feedback, 'error', 'Use at least 2 characters for the location name.');
      return false;
    }

    if (fieldName === 'propertyArea' && rawValue.length < 2) {
      setFieldFeedback(field.input, field.feedback, 'error', 'Add a city, region, or country so travelers know where it is.');
      return false;
    }

    if (fieldName === 'propertyPrice' && (!Number.isFinite(numberValue) || numberValue < 50)) {
      setFieldFeedback(field.input, field.feedback, 'error', 'Enter a nightly price of at least 50 USD.');
      return false;
    }

    if (fieldName === 'propertyTravelers' && (!Number.isInteger(numberValue) || numberValue < 1 || numberValue > 12)) {
      setFieldFeedback(field.input, field.feedback, 'error', 'Enter a whole number from 1 to 12 travelers.');
      return false;
    }

    if (fieldName === 'propertyLatitude' && (!Number.isFinite(numberValue) || numberValue < -85 || numberValue > 85)) {
      setFieldFeedback(field.input, field.feedback, 'error', 'Latitude must be between -85 and 85.');
      return false;
    }

    if (fieldName === 'propertyLongitude' && (!Number.isFinite(numberValue) || numberValue < -180 || numberValue > 180)) {
      setFieldFeedback(field.input, field.feedback, 'error', 'Longitude must be between -180 and 180.');
      return false;
    }

    if (fieldName === 'propertyAvailableStart' || fieldName === 'propertyAvailableEnd') {
      const startInput = document.getElementById('propertyAvailableStart');
      const endInput = document.getElementById('propertyAvailableEnd');
      const startDate = startInput && startInput.value ? new Date(startInput.value + 'T00:00:00') : null;
      const endDate = endInput && endInput.value ? new Date(endInput.value + 'T00:00:00') : null;

      if (!rawValue) {
        setFieldFeedback(field.input, field.feedback, 'error', 'Choose an availability date for this session listing.');
        return false;
      }

      if (startDate && endDate && startDate >= endDate) {
        setFieldFeedback(field.input, field.feedback, 'error', 'The end date must be after the start date.');
        return false;
      }
    }

    setFieldFeedback(field.input, field.feedback, 'success', 'Looks good.');
    return true;
  }

  function bindPropertyModalEvents(modal) {
    modal.addEventListener('click', function (event) {
      if (event.target === modal || event.target.closest('[data-shared-property-close]')) {
        closePropertyModal();
      }
    });

    ['propertyName', 'propertyArea', 'propertyPrice', 'propertyTravelers', 'propertyLatitude', 'propertyLongitude', 'propertyAvailableStart', 'propertyAvailableEnd'].forEach(function (fieldName) {
      const input = document.getElementById(fieldName);
      if (!input) {
        return;
      }

      input.addEventListener('input', function () { validatePropertyField(fieldName); });
      input.addEventListener('blur', function () { validatePropertyField(fieldName); });
    });

    modal.querySelector('#sharedPropertyForm').addEventListener('submit', function (event) {
      const status = document.getElementById('sharedPropertyStatus');
      const fieldNames = ['propertyName', 'propertyArea', 'propertyPrice', 'propertyTravelers', 'propertyLatitude', 'propertyLongitude', 'propertyAvailableStart', 'propertyAvailableEnd'];
      const isValid = fieldNames.every(validatePropertyField);

      event.preventDefault();

      if (!isValid) {
        status.textContent = 'Fix the highlighted fields before adding the location.';
        status.className = 'shared-form-status error';
        return;
      }

      const title = document.getElementById('propertyName').value.trim();
      const location = document.getElementById('propertyArea').value.trim();
      const price = Number(document.getElementById('propertyPrice').value);
      const maxTravelers = Number(document.getElementById('propertyTravelers').value);
      const lat = Number(document.getElementById('propertyLatitude').value);
      const lng = Number(document.getElementById('propertyLongitude').value);
      const propertyType = document.getElementById('propertyType').value;
      const availableStart = document.getElementById('propertyAvailableStart').value;
      const availableEnd = document.getElementById('propertyAvailableEnd').value;

      const customLocation = {
        id: 'session-location-' + Date.now(),
        title: title,
        location: location,
        region: 'Your listed location',
        country: location,
        lat: lat,
        lng: lng,
        price: price,
        propertyType: propertyType,
        rating: 4.6,
        amenities: ['Free cancellation', 'Session listing', 'Host added'],
        availableStart: availableStart,
        availableEnd: availableEnd,
        yearRound: false,
        maxTravelers: maxTravelers,
        source: 'session'
      };

      setSessionItem(CUSTOM_LOCATION_STORAGE_KEY, JSON.stringify(customLocation));
      saveSearchState({ destination: title });
      status.textContent = 'Location added for this session. Opening results now.';
      status.className = 'shared-form-status success';
      showToast('Your session-only location was added to search results.');

      window.setTimeout(function () {
        window.location.href = getSearchHref(title);
      }, 450);
    });
  }

  function bindGlobalEnhancedInteractions() {
    document.addEventListener('click', function (event) {
      const signInButton = event.target.closest('.sign-in-button');
      const propertyTrigger = event.target.closest('.property-trigger, .nav-link, .footer-column a');

      if (signInButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (getAuthUser()) {
          openAccountModal();
        } else {
          openAuthModal('signIn');
        }
        return;
      }

      if (propertyTrigger && /list your property/i.test(propertyTrigger.textContent || '')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openPropertyModal();
      }
    }, true);

    document.addEventListener('click', function (event) {
      const currencyTrigger = event.target.closest('.currency-toggle, .nav-link');

      if (currencyTrigger && /^(USD|EUR|GBP|JPY|CAD)$/i.test(String(currencyTrigger.textContent || '').trim())) {
        window.setTimeout(function () {
          applyCurrencyToEnhancedElements(document);
        }, 0);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeAuthModal();
        closeAccountModal();
        closePropertyModal();
      }
    });
  }

  function enhanceCheckoutSummary() {
    if (!isCurrentPage('CheckoutPage')) {
      return;
    }

    const pageUrl = new URL(window.location.href);
    const savedSearch = getSavedSearchState();
    const destinationTitle = pageUrl.searchParams.get('destination') || savedSearch.destination;
    const destination = destinationTitle ? findDestinationByTitle(destinationTitle) : null;
    const hotelName = document.querySelector('.hotel-name');
    const hotelAddress = document.querySelector('.hotel-address');
    const ratingBadge = document.querySelector('.rating-badge');
    const ratingText = document.querySelector('.rating-text');
    const reviewCount = document.querySelector('.review-count');
    const checkInDate = document.querySelector('.check-in .check-date');
    const checkOutDate = document.querySelector('.check-out .check-date');
    const nightsCount = document.querySelector('.nights-count');
    const imageHolder = document.querySelector('.hotel-image');

    if (!destination) {
      return;
    }

    if (hotelName) {
      hotelName.textContent = destination.title;
    }

    if (hotelAddress) {
      hotelAddress.textContent = destination.location;
    }

    if (ratingBadge) {
      ratingBadge.textContent = destination.rating.toFixed(1);
    }

    if (ratingText) {
      ratingText.textContent = destination.propertyType + ' • ' + destination.region;
    }

    if (reviewCount) {
      reviewCount.innerHTML =
        '<span data-usd-amount="' + destination.price + '">$' + destination.price + '</span> per night' +
        (savedSearch.travelers ? ' • ' + savedSearch.travelers + ' traveler(s)' : '');
    }

    if (checkInDate && savedSearch.checkIn) {
      checkInDate.textContent = savedSearch.checkIn;
    }

    if (checkOutDate && savedSearch.checkOut) {
      checkOutDate.textContent = savedSearch.checkOut;
    }

    if (nightsCount && savedSearch.checkIn && savedSearch.checkOut) {
      const startDate = new Date(savedSearch.checkIn + 'T00:00:00');
      const endDate = new Date(savedSearch.checkOut + 'T00:00:00');
      const nightDifference = Math.round((endDate - startDate) / 86400000);
      nightsCount.textContent = nightDifference > 0 ? String(nightDifference) : '--';
    }

    if (imageHolder) {
      imageHolder.innerHTML = '';
      if (destination.searchImage) {
        const image = document.createElement('img');
        image.src = '../SearchResults/' + destination.searchImage;
        image.alt = destination.title;
        image.className = 'checkout-summary-image';
        imageHolder.appendChild(image);
      } else {
        imageHolder.appendChild(createDestinationPlaceholder(destination, 'checkout-placeholder'));
      }
    }
  }

  function initEnhancedSharedFeatures() {
    ensureDesktopHomeLink();
    ensureAuthModal();
    ensureAccountModal();
    ensurePropertyModal();
    updateAuthButtons();
    populateSearchFormsFromSession();
    enhanceHomeDestinations();
    enhanceSearchDestinations();
    renderHomepageWorldMap();
    enhanceCheckoutSummary();
    applyCurrencyToEnhancedElements(document);
    bindGlobalEnhancedInteractions();
  }

  window.NexpediaEnhancements = {
    getAllDestinations: getAllDestinations,
    getSavedSearchState: getSavedSearchState,
    saveSearchState: saveSearchState,
    openAuthModal: openAuthModal,
    openAccountModal: openAccountModal,
    openPropertyModal: openPropertyModal,
    applyCurrencyToEnhancedElements: applyCurrencyToEnhancedElements,
    getCheckoutHref: getCheckoutHref
  };

  document.addEventListener('DOMContentLoaded', initEnhancedSharedFeatures);
})();