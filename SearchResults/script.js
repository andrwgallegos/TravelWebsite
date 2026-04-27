document.addEventListener('DOMContentLoaded', function () {
  /* =========================================================
     MOBILE NAVIGATION
     ========================================================= */

  // Main mobile navigation elements
  const hamburgerButton = document.getElementById('hamburgerButton');
  const mobileNav = document.getElementById('mobileNav');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

  // Keeps the menu button understandable in both visual and screen-reader states.
  function updateHamburgerButtonState(isMenuOpen) {
    if (!hamburgerButton) {
      return;
    }

    hamburgerButton.setAttribute('aria-expanded', isMenuOpen ? 'true' : 'false');
    hamburgerButton.setAttribute('aria-label', isMenuOpen ? 'Close navigation menu' : 'Open navigation menu');
    hamburgerButton.textContent = isMenuOpen ? '✕' : '☰';
  }

  // Opens the mobile menu
  function openMobileMenu() {
    if (mobileNav) {
      mobileNav.classList.add('show');
    }

    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.add('show');
    }

    updateHamburgerButtonState(true);
  }

  // Closes the mobile menu
  function closeMobileMenu() {
    if (mobileNav) {
      mobileNav.classList.remove('show');
    }

    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.remove('show');
    }

    updateHamburgerButtonState(false);
  }

  // Opens or closes the mobile menu
  function toggleMobileMenu() {
    if (!mobileNav) {
      return;
    }

    if (mobileNav.classList.contains('show')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  // Attach mobile menu events
  updateHamburgerButtonState(false);

  if (hamburgerButton) {
    hamburgerButton.addEventListener('click', toggleMobileMenu);
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  }

  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  /* =========================================================
     FALLBACK SIGN IN MODAL
     ========================================================= */

  // Sign in modal elements
  const signInModal = document.getElementById('signInModal');
  const closeSignInModal = document.getElementById('closeSignInModal');
  const signInSubmit = document.getElementById('signInSubmit');
  const signUpSubmit = document.getElementById('signUpSubmit');

  // Buttons that open the modal
  const desktopSignInButton = document.getElementById('desktopSignInButton');
  const mobileSignInButton = document.getElementById('mobileSignInButton');

  // Opens the modal
  function openSignInModal() {
    if (signInModal) {
      signInModal.classList.remove('hidden');
      signInModal.setAttribute('aria-hidden', 'false');
    }

    // If opened from mobile nav, close the mobile nav
    closeMobileMenu();
  }

  // Closes the modal
  function closeSignInModalFn() {
    if (signInModal) {
      signInModal.classList.add('hidden');
      signInModal.setAttribute('aria-hidden', 'true');
    }
  }

  // Attach events to open the modal
  if (desktopSignInButton) {
    desktopSignInButton.addEventListener('click', openSignInModal);
  }

  if (mobileSignInButton) {
    mobileSignInButton.addEventListener('click', openSignInModal);
  }

  // Close the modal using the X button
  if (closeSignInModal) {
    closeSignInModal.addEventListener('click', closeSignInModalFn);
  }

  // Close when user clicks the dark background around the modal
  if (signInModal) {
    signInModal.addEventListener('click', function (event) {
      if (event.target === signInModal) {
        closeSignInModalFn();
      }
    });
  }

  // Fallback behavior for environments where the shared validated modal is unavailable.
  if (signInSubmit) {
    signInSubmit.addEventListener('click', function () {
      window.location.href = '../Trips/index.html';
    });
  }

  if (signUpSubmit) {
    signUpSubmit.addEventListener('click', function () {
      window.location.href = '../Trips/index.html';
    });
  }

  /* =========================================================
     FILTER + SEARCH RESULTS INTERACTIONS
     ---------------------------------------------------------
     This section replaces the earlier static filter clicks
     with real client-side filtering. It combines destination search,
     date availability, traveler capacity, collapsible pricing controls, and the expanded sidebar
     filters while keeping URL/session state synced for every card.
     ========================================================= */

  const searchForm = document.querySelector('.search-form');
  const destinationInput = document.querySelector('.search-form input[aria-label="Destination"]');
  const checkInInput = document.querySelector('.search-form input[aria-label="Check-in"]');
  const checkOutInput = document.querySelector('.search-form input[aria-label="Check-out"]');
  const travelersInput = document.querySelector('.search-form input[aria-label="Travelers"]');
  const listingsPanel = document.querySelector('.listings-panel');
  const listingLinks = Array.from(document.querySelectorAll('.listings-panel .listing-link'));
  const filterOptions = Array.from(document.querySelectorAll('.filter-option'));
  const filterGroupHeaders = Array.from(document.querySelectorAll('.filter-group-header'));
  const priceBoundInputs = Array.from(document.querySelectorAll('[data-price-bound]'));
  const sortSelect = document.getElementById('resultsSortSelect');
  const applyButton = document.querySelector('.apply-button');
  const clearFiltersButton = document.querySelector('.clear-filters-button');
  const activeFiltersElement = document.querySelector('.active-filters');

  listingLinks.forEach(function (listingLink, index) {
    listingLink.dataset.originalOrder = String(index);
  });

  const savedSearchState = window.NexpediaEnhancements && typeof window.NexpediaEnhancements.getSavedSearchState === 'function'
    ? window.NexpediaEnhancements.getSavedSearchState()
    : {};
  const initialDestinationQuery = window.TravelWebsiteUtils
    ? window.TravelWebsiteUtils.getPageQueryValue('destination') || savedSearchState.destination || ''
    : savedSearchState.destination || '';
  const legacyDatesQuery = window.TravelWebsiteUtils
    ? window.TravelWebsiteUtils.getPageQueryValue('dates')
    : '';

  function getLegacyDateRange(queryValue) {
    const rawValue = String(queryValue || '').trim();

    if (!rawValue) {
      return { checkIn: '', checkOut: '' };
    }

    const rangeMatch = rawValue.match(/^(\d{4}-\d{2}-\d{2})\s*(?:to|-|–|—)\s*(\d{4}-\d{2}-\d{2})$/i);

    if (!rangeMatch) {
      return { checkIn: '', checkOut: '' };
    }

    return {
      checkIn: rangeMatch[1],
      checkOut: rangeMatch[2]
    };
  }

  const legacyDateRange = getLegacyDateRange(legacyDatesQuery);
  const initialCheckInQuery = window.TravelWebsiteUtils
    ? window.TravelWebsiteUtils.getPageQueryValue('checkIn') || savedSearchState.checkIn || legacyDateRange.checkIn
    : savedSearchState.checkIn || legacyDateRange.checkIn;
  const initialCheckOutQuery = window.TravelWebsiteUtils
    ? window.TravelWebsiteUtils.getPageQueryValue('checkOut') || savedSearchState.checkOut || legacyDateRange.checkOut
    : savedSearchState.checkOut || legacyDateRange.checkOut;
  const initialTravelersQuery = window.TravelWebsiteUtils
    ? window.TravelWebsiteUtils.getPageQueryValue('travelers') || savedSearchState.travelers || ''
    : savedSearchState.travelers || '';

  // The fields are populated from URL/session values so searches started on Homepage
  // continue here, and the cards can display the same dates/travelers the user entered.
  if (destinationInput && initialDestinationQuery) {
    destinationInput.value = initialDestinationQuery;
  }

  if (checkInInput && initialCheckInQuery) {
    checkInInput.value = initialCheckInQuery;
  }

  if (checkOutInput && initialCheckOutQuery) {
    checkOutInput.value = initialCheckOutQuery;
  }

  if (travelersInput && initialTravelersQuery) {
    travelersInput.value = initialTravelersQuery;
  }

  function normalizeSearchText(value) {
    if (window.TravelWebsiteUtils && typeof window.TravelWebsiteUtils.normalizeText === 'function') {
      return window.TravelWebsiteUtils.normalizeText(value);
    }

    return String(value || '').toLowerCase().trim();
  }

  function parseIsoDate(dateText) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
      return null;
    }

    const parsedDate = new Date(dateText + 'T00:00:00');

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate;
  }

  function formatShortDate(dateObject) {
    if (!(dateObject instanceof Date) || Number.isNaN(dateObject.getTime())) {
      return '';
    }

    return dateObject.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getDatesFilterState() {
    const checkInValue = checkInInput ? checkInInput.value.trim() : '';
    const checkOutValue = checkOutInput ? checkOutInput.value.trim() : '';
    const hasAnyDate = Boolean(checkInValue || checkOutValue);

    if (!hasAnyDate) {
      return {
        isActive: false,
        isValid: true,
        startDate: null,
        endDate: null,
        checkInValue: '',
        checkOutValue: '',
        validationMessage: ''
      };
    }

    if (!checkInValue || !checkOutValue) {
      return {
        isActive: true,
        isValid: false,
        startDate: null,
        endDate: null,
        checkInValue: checkInValue,
        checkOutValue: checkOutValue,
        validationMessage: 'Choose both check-in and check-out dates.'
      };
    }

    const startDate = parseIsoDate(checkInValue);
    const endDate = parseIsoDate(checkOutValue);
    const isValidRange = Boolean(startDate && endDate && startDate < endDate);

    return {
      isActive: true,
      isValid: isValidRange,
      startDate: isValidRange ? startDate : null,
      endDate: isValidRange ? endDate : null,
      checkInValue: checkInValue,
      checkOutValue: checkOutValue,
      validationMessage: isValidRange ? '' : 'Check-out must be after check-in.'
    };
  }

  function getTravelersFilterState() {
    const rawValue = travelersInput ? travelersInput.value.trim() : '';

    if (!rawValue) {
      return {
        rawValue: '',
        isActive: false,
        isValid: true,
        count: null
      };
    }

    const numericMatch = rawValue.match(/\d+/);
    const travelerCount = numericMatch ? Number(numericMatch[0]) : Number.NaN;
    const isValidTravelerCount = Number.isFinite(travelerCount) && travelerCount > 0;

    return {
      rawValue: rawValue,
      isActive: true,
      isValid: isValidTravelerCount,
      count: isValidTravelerCount ? travelerCount : null
    };
  }

  function initializeFilterAccordions() {
    filterGroupHeaders.forEach(function (headerButton) {
      const filterGroup = headerButton.closest('.filter-group');
      const controlledId = headerButton.getAttribute('aria-controls');
      const optionsElement = controlledId ? document.getElementById(controlledId) : null;
      const shouldStartOpen = filterGroup && filterGroup.getAttribute('data-default-open') === 'true';

      if (!filterGroup || !optionsElement) {
        return;
      }

      headerButton.setAttribute('aria-expanded', shouldStartOpen ? 'true' : 'false');
      filterGroup.classList.toggle('is-collapsed', !shouldStartOpen);
      optionsElement.hidden = !shouldStartOpen;

      headerButton.addEventListener('click', function () {
        const isExpanded = headerButton.getAttribute('aria-expanded') === 'true';
        const shouldExpand = !isExpanded;

        headerButton.setAttribute('aria-expanded', shouldExpand ? 'true' : 'false');
        filterGroup.classList.toggle('is-collapsed', !shouldExpand);
        optionsElement.hidden = !shouldExpand;
      });
    });
  }

  function getPriceInputValue(boundName) {
    const matchingInput = priceBoundInputs.find(function (input) {
      return input.dataset.priceBound === boundName;
    });

    return matchingInput ? matchingInput.value.trim() : '';
  }

  function getSortLabel(sortValue) {
    const labels = {
      recommended: 'recommended order',
      'price-low': 'price low to high',
      'price-high': 'price high to low',
      'rating-high': 'highest guest rating'
    };

    return labels[sortValue] || labels.recommended;
  }

  function getSelectedFilterButtons() {
    return filterOptions.filter(function (button) {
      return button.classList.contains('selected');
    });
  }

  function getSidebarFilterState() {
    const customMinRaw = getPriceInputValue('min');
    const customMaxRaw = getPriceInputValue('max');
    const hasCustomMin = customMinRaw !== '';
    const hasCustomMax = customMaxRaw !== '';
    const customMin = hasCustomMin ? Number(customMinRaw) : 0;
    const customMax = hasCustomMax ? Number(customMaxRaw) : Number.POSITIVE_INFINITY;
    const hasCustomPrice = Boolean(hasCustomMin || hasCustomMax);
    const state = {
      priceRanges: [],
      propertyTypes: [],
      ratingMinimum: null,
      regions: [],
      amenities: [],
      selectedButtons: getSelectedFilterButtons(),
      hasCustomPrice: hasCustomPrice,
      customPriceRange: null,
      priceValidationMessage: '',
      sortValue: sortSelect ? sortSelect.value : 'recommended'
    };

    state.selectedButtons.forEach(function (button) {
      const group = button.dataset.filterGroup;
      const value = button.dataset.filterValue || '';

      if (group === 'price') {
        const rangeParts = value.split('-').map(Number);
        state.priceRanges.push({ min: rangeParts[0] || 0, max: rangeParts[1] || Number.POSITIVE_INFINITY });
      }

      if (group === 'propertyType') {
        state.propertyTypes.push(normalizeSearchText(value));
      }

      if (group === 'rating') {
        const ratingValue = Number(value);
        state.ratingMinimum = Math.max(state.ratingMinimum || 0, Number.isFinite(ratingValue) ? ratingValue : 0);
      }

      if (group === 'region') {
        state.regions.push(normalizeSearchText(value));
      }

      if (group === 'amenity') {
        state.amenities.push(normalizeSearchText(value));
      }
    });

    if (hasCustomPrice) {
      const suppliedMinIsValid = !hasCustomMin || Number.isFinite(customMin);
      const suppliedMaxIsValid = !hasCustomMax || Number.isFinite(customMax);
      const hasNegativeValue = customMin < 0 || customMax < 0;
      const rangeIsBackwards = hasCustomMin && hasCustomMax && customMin > customMax;

      if (!suppliedMinIsValid || !suppliedMaxIsValid || hasNegativeValue || rangeIsBackwards) {
        state.priceValidationMessage = 'Adjust the custom price range so the minimum is not higher than the maximum.';
      } else {
        state.customPriceRange = { min: customMin, max: customMax };
        state.priceRanges.push(state.customPriceRange);
      }
    }

    return state;
  }

  function matchesDateFilter(listingLink, datesState) {
    if (!datesState.isActive || !datesState.isValid) {
      return true;
    }

    if (listingLink.dataset.yearRound === 'true') {
      return true;
    }

    const availableStart = parseIsoDate(listingLink.dataset.availableStart || '');
    const availableEnd = parseIsoDate(listingLink.dataset.availableEnd || '');

    if (!availableStart || !availableEnd) {
      return false;
    }

    return datesState.startDate >= availableStart && datesState.endDate <= availableEnd;
  }

  function matchesTravelersFilter(listingLink, travelersState) {
    if (!travelersState.isActive || !travelersState.isValid) {
      return true;
    }

    const maxTravelers = Number(listingLink.dataset.maxTravelers || '0');
    return travelersState.count <= maxTravelers;
  }

  function matchesSidebarFilters(listingLink, sidebarState) {
    const price = Number(listingLink.dataset.priceUsd || '0');
    const propertyType = normalizeSearchText(listingLink.dataset.propertyType || '');
    const rating = Number(listingLink.dataset.rating || '0');
    const region = normalizeSearchText(listingLink.dataset.region || '');
    const amenities = String(listingLink.dataset.amenities || '')
      .split('|')
      .map(normalizeSearchText)
      .filter(Boolean);

    if (sidebarState.priceRanges.length) {
      const matchesAnyRange = sidebarState.priceRanges.some(function (range) {
        return price >= range.min && price <= range.max;
      });

      if (!matchesAnyRange) {
        return false;
      }
    }

    if (sidebarState.propertyTypes.length && !sidebarState.propertyTypes.includes(propertyType)) {
      return false;
    }

    if (sidebarState.ratingMinimum && rating < sidebarState.ratingMinimum) {
      return false;
    }

    if (sidebarState.regions.length && !sidebarState.regions.includes(region)) {
      return false;
    }

    // Amenity filters are cumulative: selecting Pool + Kitchen means the stay must show both.
    if (sidebarState.amenities.length) {
      const hasEveryAmenity = sidebarState.amenities.every(function (amenity) {
        return amenities.includes(amenity);
      });

      if (!hasEveryAmenity) {
        return false;
      }
    }

    return true;
  }

  function getCurrentSearchState() {
    return {
      destinationQuery: destinationInput ? destinationInput.value.trim() : '',
      dates: getDatesFilterState(),
      travelers: getTravelersFilterState(),
      sidebar: getSidebarFilterState()
    };
  }

  function hasActiveSearchState(searchState) {
    return Boolean(
      searchState.destinationQuery ||
      searchState.dates.isActive ||
      searchState.travelers.isActive ||
      searchState.sidebar.selectedButtons.length ||
      searchState.sidebar.hasCustomPrice ||
      searchState.sidebar.sortValue !== 'recommended'
    );
  }

  function getVisibleListingCount() {
    return listingLinks.filter(function (listingLink) {
      return listingLink.style.display !== 'none';
    }).length;
  }

  function syncSearchQueryParams() {
    const currentSearchState = getCurrentSearchState();

    if (window.TravelWebsiteUtils) {
      window.TravelWebsiteUtils.updatePageQueryValue('destination', currentSearchState.destinationQuery);
      window.TravelWebsiteUtils.updatePageQueryValue('checkIn', currentSearchState.dates.checkInValue);
      window.TravelWebsiteUtils.updatePageQueryValue('checkOut', currentSearchState.dates.checkOutValue);
      window.TravelWebsiteUtils.updatePageQueryValue('dates', '');
      window.TravelWebsiteUtils.updatePageQueryValue('travelers', currentSearchState.travelers.rawValue);
    }

    if (window.NexpediaEnhancements && typeof window.NexpediaEnhancements.saveSearchState === 'function') {
      window.NexpediaEnhancements.saveSearchState({
        destination: currentSearchState.destinationQuery,
        checkIn: currentSearchState.dates.checkInValue,
        checkOut: currentSearchState.dates.checkOutValue,
        travelers: currentSearchState.travelers.rawValue
      });
    }
  }

  function getListingTitle(listingLink) {
    const titleElement = listingLink.querySelector('h3');
    return titleElement ? titleElement.textContent.trim() : 'Selected stay';
  }

  function getListingLocation(listingLink) {
    const locationElement = listingLink.querySelector('.location');
    return locationElement ? locationElement.textContent.trim() : '';
  }

  function buildCheckoutHrefForListing(listingLink) {
    const currentSearchState = getCurrentSearchState();
    const params = new URLSearchParams();

    params.set('destination', getListingTitle(listingLink));

    if (getListingLocation(listingLink)) {
      params.set('location', getListingLocation(listingLink));
    }

    if (listingLink.dataset.priceUsd) {
      params.set('price', listingLink.dataset.priceUsd);
    }

    if (currentSearchState.dates.checkInValue) {
      params.set('checkIn', currentSearchState.dates.checkInValue);
    }

    if (currentSearchState.dates.checkOutValue) {
      params.set('checkOut', currentSearchState.dates.checkOutValue);
    }

    if (currentSearchState.travelers.rawValue) {
      params.set('travelers', currentSearchState.travelers.rawValue);
    }

    return '../CheckoutPage/index.html?' + params.toString();
  }

  function getListingAvailabilityText(listingLink) {
    if (listingLink.dataset.yearRound === 'true') {
      return 'Available year-round';
    }

    const startDate = parseIsoDate(listingLink.dataset.availableStart || '');
    const endDate = parseIsoDate(listingLink.dataset.availableEnd || '');

    if (!startDate || !endDate) {
      return '';
    }

    return 'Available ' + formatShortDate(startDate) + ' to ' + formatShortDate(endDate);
  }

  function updateListingContextCards() {
    const currentSearchState = getCurrentSearchState();

    listingLinks.forEach(function (listingLink) {
      const listingInfo = listingLink.querySelector('.listing-info');
      let contextElement = listingLink.querySelector('.listing-context');
      const contextParts = [];

      if (!contextElement && listingInfo) {
        contextElement = document.createElement('p');
        contextElement.className = 'listing-context';
        contextElement.setAttribute('aria-live', 'polite');
        listingInfo.appendChild(contextElement);
      }

      if (currentSearchState.dates.isActive && currentSearchState.dates.isValid) {
        contextParts.push(
          'Selected dates: ' +
          formatShortDate(currentSearchState.dates.startDate) +
          ' → ' +
          formatShortDate(currentSearchState.dates.endDate)
        );
      } else {
        const availabilityText = getListingAvailabilityText(listingLink);
        if (availabilityText) {
          contextParts.push(availabilityText);
        }
      }

      if (currentSearchState.travelers.isActive && currentSearchState.travelers.isValid) {
        contextParts.push(
          currentSearchState.travelers.count + ' ' +
          (currentSearchState.travelers.count === 1 ? 'traveler' : 'travelers')
        );
      }

      if (contextElement) {
        contextElement.textContent = contextParts.join(' • ');
      }

      listingLink.href = buildCheckoutHrefForListing(listingLink);
    });
  }

  function createActiveFilterChip(label, onRemove) {
    const chip = document.createElement('button');
    chip.className = 'filter-pill active-filter-chip';
    chip.type = 'button';
    chip.textContent = label + ' ×';
    chip.setAttribute('aria-label', 'Remove filter ' + label);
    chip.addEventListener('click', function () {
      onRemove();
    });

    return chip;
  }

  function setFilterButtonSelected(button, shouldBeSelected) {
    button.classList.toggle('selected', shouldBeSelected);
    button.setAttribute('aria-pressed', shouldBeSelected ? 'true' : 'false');
  }

  function reapplyCurrencyFormatting() {
    if (window.TravelWebsiteUtils && typeof window.TravelWebsiteUtils.applyCurrencyToPage === 'function') {
      window.TravelWebsiteUtils.applyCurrencyToPage(
        typeof window.TravelWebsiteUtils.getStoredCurrency === 'function'
          ? window.TravelWebsiteUtils.getStoredCurrency()
          : 'USD'
      );
    }
  }

  function updateActiveFilterChips() {
    if (!activeFiltersElement) {
      return;
    }

    const currentSearchState = getCurrentSearchState();
    activeFiltersElement.innerHTML = '';

    if (currentSearchState.destinationQuery) {
      activeFiltersElement.appendChild(createActiveFilterChip('Destination: ' + currentSearchState.destinationQuery, function () {
        if (destinationInput) {
          destinationInput.value = '';
        }
        applyAllSearchFilters();
      }));
    }

    if (currentSearchState.dates.isActive) {
      const dateLabel = currentSearchState.dates.isValid
        ? 'Dates: ' + formatShortDate(currentSearchState.dates.startDate) + ' to ' + formatShortDate(currentSearchState.dates.endDate)
        : 'Dates need attention';

      activeFiltersElement.appendChild(createActiveFilterChip(dateLabel, function () {
        if (checkInInput) {
          checkInInput.value = '';
        }

        if (checkOutInput) {
          checkOutInput.value = '';
        }

        scheduleSecondaryFiltersUpdate();
      }));
    }

    if (currentSearchState.travelers.isActive) {
      activeFiltersElement.appendChild(createActiveFilterChip('Travelers: ' + currentSearchState.travelers.rawValue, function () {
        if (travelersInput) {
          travelersInput.value = '';
        }
        scheduleSecondaryFiltersUpdate();
      }));
    }

    if (currentSearchState.sidebar.hasCustomPrice) {
      const minLabel = getPriceInputValue('min') || '0';
      const maxLabel = getPriceInputValue('max') || 'any';

      activeFiltersElement.appendChild(createActiveFilterChip('Price: $' + minLabel + '–' + (maxLabel === 'any' ? 'any' : '$' + maxLabel), function () {
        priceBoundInputs.forEach(function (input) { input.value = ''; });
        scheduleSecondaryFiltersUpdate();
      }));
    }
    if (currentSearchState.sidebar.sortValue !== 'recommended') {
      activeFiltersElement.appendChild(createActiveFilterChip('Sort: ' + getSortLabel(currentSearchState.sidebar.sortValue), function () {
        if (sortSelect) {
          sortSelect.value = 'recommended';
        }
        scheduleSecondaryFiltersUpdate();
      }));
    }

    currentSearchState.sidebar.selectedButtons.forEach(function (button) {
      const readableLabel = button.textContent.trim();
      activeFiltersElement.appendChild(createActiveFilterChip(readableLabel, function () {
        setFilterButtonSelected(button, false);
        scheduleSecondaryFiltersUpdate();
      }));
    });  }

  function updateCombinedSearchFeedback() {
    const currentSearchState = getCurrentSearchState();
    const visibleCount = getVisibleListingCount();
    const statusElement = document.querySelector('.search-results-status');
    const noResultsElement = document.querySelector('.search-no-results');
    const noResultsTitle = noResultsElement ? noResultsElement.querySelector('h3') : null;
    const noResultsDescription = noResultsElement ? noResultsElement.querySelector('p') : null;

    updateListingContextCards();
    updateActiveFilterChips();

    if (!statusElement || !noResultsElement) {
      return;
    }

    const activeFilters = [];
    const guidanceMessages = [];

    if (currentSearchState.destinationQuery) {
      activeFilters.push('destination “' + currentSearchState.destinationQuery + '”');
    }

    if (currentSearchState.dates.isActive) {
      if (currentSearchState.dates.isValid) {
        activeFilters.push(
          'dates ' +
            formatShortDate(currentSearchState.dates.startDate) +
            ' to ' +
            formatShortDate(currentSearchState.dates.endDate)
        );
      } else {
        guidanceMessages.push(currentSearchState.dates.validationMessage);
      }
    }

    if (currentSearchState.travelers.isActive) {
      if (currentSearchState.travelers.isValid) {
        activeFilters.push(
          currentSearchState.travelers.count +
            ' ' +
            (currentSearchState.travelers.count === 1 ? 'traveler' : 'travelers')
        );
      } else {
        guidanceMessages.push('Enter at least 1 traveler.');
      }
    }

    if (currentSearchState.sidebar.hasCustomPrice) {
      if (currentSearchState.sidebar.priceValidationMessage) {
        guidanceMessages.push(currentSearchState.sidebar.priceValidationMessage);
      } else {
        const minLabel = getPriceInputValue('min') || '0';
        const maxLabel = getPriceInputValue('max') || 'any price';
        activeFilters.push('price $' + minLabel + ' to ' + (maxLabel === 'any price' ? maxLabel : '$' + maxLabel));
      }
    }

    if (currentSearchState.sidebar.sortValue !== 'recommended') {
      activeFilters.push('sorted by ' + getSortLabel(currentSearchState.sidebar.sortValue));
    }

    currentSearchState.sidebar.selectedButtons.forEach(function (button) {
      activeFilters.push(button.textContent.trim());
    });

    let statusMessage = '';

    // The default state stays empty. Status text appears only after the
    // user searches, picks dates/travelers, sorts, or selects a sidebar filter.
    if (activeFilters.length) {
      statusMessage =
        'Showing ' +
        visibleCount +
        ' ' +
        (visibleCount === 1 ? 'stay' : 'stays') +
        ' for ' +
        activeFilters.join(' • ') +
        '.';
    }

    if (guidanceMessages.length) {
      statusMessage += (statusMessage ? ' ' : '') + guidanceMessages.join(' ');
    }

    // Clear the previous conversion template before writing new dynamic status text.
    delete statusElement.dataset.usdTextTemplate;
    statusElement.textContent = statusMessage;
    reapplyCurrencyFormatting();

    const shouldShowNoResults = hasActiveSearchState(currentSearchState) && visibleCount === 0 && !guidanceMessages.length;
    noResultsElement.classList.toggle('search-ui-hidden', !shouldShowNoResults);

    if (shouldShowNoResults) {
      if (noResultsTitle) {
        noResultsTitle.textContent = 'No stays matched your current search';
      }

      if (noResultsDescription) {
        noResultsDescription.textContent =
          'Try broader dates, fewer travelers, a different destination, or fewer sidebar filters.';
      }
    }
  }

  let listingsSearch = null;
  let resultsSecondaryFilterTimeoutId = null;

  function sortListings() {
    if (!listingsPanel || !listingLinks.length) {
      return;
    }

    const sortValue = sortSelect ? sortSelect.value : 'recommended';
    const noResultsElement = listingsPanel.querySelector('.search-no-results');
    const sortedLinks = listingLinks.slice().sort(function (firstLink, secondLink) {
      const firstPrice = Number(firstLink.dataset.priceUsd || '0');
      const secondPrice = Number(secondLink.dataset.priceUsd || '0');
      const firstRating = Number(firstLink.dataset.rating || '0');
      const secondRating = Number(secondLink.dataset.rating || '0');
      const firstOrder = Number(firstLink.dataset.originalOrder || '0');
      const secondOrder = Number(secondLink.dataset.originalOrder || '0');

      if (sortValue === 'price-low') {
        return firstPrice - secondPrice || firstOrder - secondOrder;
      }

      if (sortValue === 'price-high') {
        return secondPrice - firstPrice || firstOrder - secondOrder;
      }

      if (sortValue === 'rating-high') {
        return secondRating - firstRating || firstOrder - secondOrder;
      }

      return firstOrder - secondOrder;
    });

    sortedLinks.forEach(function (listingLink) {
      listingsPanel.insertBefore(listingLink, noResultsElement || null);
    });
  }

  function applyAllSearchFilters() {
    if (!listingsSearch) {
      return;
    }

    listingsSearch.applyFilter(destinationInput ? destinationInput.value.trim() : '');
    listingsSearch.hideSuggestions();
  }

  function scheduleSecondaryFiltersUpdate() {
    if (!listingsSearch) {
      return;
    }

    window.clearTimeout(resultsSecondaryFilterTimeoutId);

    resultsSecondaryFilterTimeoutId = window.setTimeout(function () {
      listingsSearch.runLoadingTask({
        mode: 'filter',
        query: 'stays',
        text: 'Updating stays…',
        delay: 420,
        onComplete: applyAllSearchFilters
      });
    }, 120);
  }

  initializeFilterAccordions();

  filterOptions.forEach(function (button) {
    button.addEventListener('click', function () {
      const isSelected = button.classList.contains('selected');
      const exclusiveGroup = button.dataset.exclusiveGroup;

      if (button.dataset.filterGroup === 'price' && !isSelected) {
        priceBoundInputs.forEach(function (input) { input.value = ''; });
      }

      if (exclusiveGroup && !isSelected) {
        filterOptions.forEach(function (otherButton) {
          if (otherButton !== button && otherButton.dataset.exclusiveGroup === exclusiveGroup) {
            setFilterButtonSelected(otherButton, false);
          }
        });
      }

      setFilterButtonSelected(button, !isSelected);
      scheduleSecondaryFiltersUpdate();
    });
  });

  priceBoundInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      filterOptions.forEach(function (button) {
        if (button.dataset.filterGroup === 'price') {
          setFilterButtonSelected(button, false);
        }
      });
      scheduleSecondaryFiltersUpdate();
    });

    input.addEventListener('change', scheduleSecondaryFiltersUpdate);
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', scheduleSecondaryFiltersUpdate);
  }

  if (applyButton) {
    applyButton.addEventListener('click', function () {
      scheduleSecondaryFiltersUpdate();

      if (window.TravelWebsiteUtils) {
        window.TravelWebsiteUtils.showToast('Filters applied to the current search results.');
      }
    });
  }

  if (clearFiltersButton) {
    clearFiltersButton.addEventListener('click', function () {
      filterOptions.forEach(function (button) {
        setFilterButtonSelected(button, false);
      });

      priceBoundInputs.forEach(function (input) {
        input.value = '';
      });

      if (sortSelect) {
        sortSelect.value = 'recommended';
      }

      scheduleSecondaryFiltersUpdate();

      if (window.TravelWebsiteUtils) {
        window.TravelWebsiteUtils.showToast('Sidebar filters cleared.');
      }
    });
  }

  if (
    window.TravelWebsiteUtils &&
    searchForm &&
    destinationInput &&
    checkInInput &&
    checkOutInput &&
    travelersInput &&
    listingsPanel &&
    listingLinks.length
  ) {
    listingsSearch = window.TravelWebsiteUtils.initLiveSearch({
      formElement: searchForm,
      inputElement: destinationInput,
      itemElements: listingLinks,
      initialQuery: initialDestinationQuery,
      noResultsMount: listingsPanel,

      getItemData: function (listingLink) {
        const title = getListingTitle(listingLink);
        const location = getListingLocation(listingLink);
        const priceElement = listingLink.querySelector('.price');
        const listingMetaElement = listingLink.querySelector('.listing-meta');
        const badges = Array.from(listingLink.querySelectorAll('.listing-badges span')).map(function (badge) {
          return badge.textContent.trim();
        });
        const price = priceElement ? priceElement.textContent.trim() : '';
        const listingMeta = listingMetaElement ? listingMetaElement.textContent.trim() : '';

        return {
          title: title,
          subtitle: location,
          suggestionMeta: location + (price ? ' • ' + price + ' per night' : ''),
          suggestionKey: title + '|' + location,
          searchValue: title,
          searchText: [
            title,
            location,
            price,
            listingMeta,
            listingLink.dataset.propertyType,
            listingLink.dataset.region,
            listingLink.dataset.amenities,
            badges.join(' ')
          ].join(' ')
        };
      },

      getLiveSuggestionMeta: function (listingLink) {
        const location = getListingLocation(listingLink);
        const priceElement = listingLink.querySelector('.price');
        const price = priceElement ? priceElement.textContent.trim() : '';

        return location + (price ? ' • ' + price + ' per night' : '');
      },

      getStatusText: function () {
        return '';
      },

      noResultsTitle: 'No stays matched your current search',
      noResultsDescription: 'Try broader dates, fewer travelers, or a different destination.',

      setItemVisibility: function (listingLink, matchesDestinationQuery) {
        const currentSearchState = getCurrentSearchState();
        const shouldShowListing =
          matchesDestinationQuery &&
          matchesDateFilter(listingLink, currentSearchState.dates) &&
          matchesTravelersFilter(listingLink, currentSearchState.travelers) &&
          matchesSidebarFilters(listingLink, currentSearchState.sidebar);

        listingLink.style.display = shouldShowListing ? '' : 'none';
      },

      afterFilter: function () {
        syncSearchQueryParams();
        sortListings();
        updateCombinedSearchFeedback();
      },

      onSubmit: function () {
        syncSearchQueryParams();
        sortListings();
        updateCombinedSearchFeedback();
      },

      enableInputLoading: true,
      loadingDelay: 260,
      loadingText: 'Loading matching stays…',
      filterLoadingText: 'Updating stays…',
      submitLoadingDelay: 950,
      submitLoadingText: 'Searching stays…'
    });

    checkInInput.addEventListener('input', scheduleSecondaryFiltersUpdate);
    checkInInput.addEventListener('change', scheduleSecondaryFiltersUpdate);
    checkOutInput.addEventListener('input', scheduleSecondaryFiltersUpdate);
    checkOutInput.addEventListener('change', scheduleSecondaryFiltersUpdate);
    travelersInput.addEventListener('input', scheduleSecondaryFiltersUpdate);
    travelersInput.addEventListener('change', scheduleSecondaryFiltersUpdate);

    // Initial context/link sync is useful even before a user filters because it
    // ensures checkout receives any saved Homepage search values immediately.
    updateListingContextCards();
    updateActiveFilterChips();
  }


  /* =========================================================
     GLOBAL KEYBOARD SHORTCUTS
     ========================================================= */

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMobileMenu();
      closeSignInModalFn();
    }
  });
});