document.addEventListener('DOMContentLoaded', function () {
  /* =========================================================
     MOBILE NAVIGATION
     ========================================================= */

  // Main mobile navigation elements
  const hamburgerButton = document.getElementById('hamburgerButton');
  const mobileNav = document.getElementById('mobileNav');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

  // Opens the mobile menu
  function openMobileMenu() {
    if (mobileNav) {
      mobileNav.classList.add('show');
    }

    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.add('show');
    }

    if (hamburgerButton) {
      hamburgerButton.setAttribute('aria-expanded', 'true');
    }
  }

  // Closes the mobile menu
  function closeMobileMenu() {
    if (mobileNav) {
      mobileNav.classList.remove('show');
    }

    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.remove('show');
    }

    if (hamburgerButton) {
      hamburgerButton.setAttribute('aria-expanded', 'false');
    }
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
     SIGN IN MODAL
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

  // Prototype behavior: both actions route to Trips
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
     FILTER INTERACTIONS
     ========================================================= */

  const filterPills = document.querySelectorAll('.filter-pill');
  const filterOptions = document.querySelectorAll('.filter-option');
  const applyButton = document.querySelector('.apply-button');

  // Let users remove active filter pills for prototype interaction
  filterPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      pill.remove();
    });
  });

  // Toggle filter options on and off
  filterOptions.forEach(function (option) {
    option.addEventListener('click', function () {
      option.classList.toggle('selected');
    });
  });

  // The apply button simply confirms the current UI state for this front-end prototype.
  if (applyButton) {
    applyButton.addEventListener('click', function () {
      if (window.TravelWebsiteUtils) {
        window.TravelWebsiteUtils.showToast('Filters applied to the current prototype results.');
      }
    });
  }

  /* =========================================================
     LIVE SEARCH RESULTS FILTERING
     Filters listing cards by destination, available dates,
     and traveler count while keeping the URL in sync.
     ========================================================= */

  const searchForm = document.querySelector('.search-form');
  const destinationInput = document.querySelector('.search-form input[aria-label="Destination"]');
  const datesInput = document.querySelector('.search-form input[aria-label="Dates"]');
  const travelersInput = document.querySelector('.search-form input[aria-label="Travelers"]');
  const listingsPanel = document.querySelector('.listings-panel');
  const listingLinks = Array.from(document.querySelectorAll('.listings-panel .listing-link'));

  const initialDestinationQuery = window.TravelWebsiteUtils
    ? window.TravelWebsiteUtils.getPageQueryValue('destination')
    : '';
  const initialDatesQuery = window.TravelWebsiteUtils
    ? window.TravelWebsiteUtils.getPageQueryValue('dates')
    : '';
  const initialTravelersQuery = window.TravelWebsiteUtils
    ? window.TravelWebsiteUtils.getPageQueryValue('travelers')
    : '';

  if (destinationInput && initialDestinationQuery) {
    destinationInput.value = initialDestinationQuery;
  }

  if (datesInput && initialDatesQuery) {
    datesInput.value = initialDatesQuery;
  }

  if (travelersInput && initialTravelersQuery) {
    travelersInput.value = initialTravelersQuery;
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
    const rawValue = datesInput ? datesInput.value.trim() : '';

    if (!rawValue) {
      return {
        rawValue: '',
        isActive: false,
        isValid: true,
        startDate: null,
        endDate: null
      };
    }

    const normalizedValue = rawValue
      .replace(/[–—]/g, '-')
      .replace(/\s+to\s+/i, ' - ')
      .trim();
    const rangeMatch = normalizedValue.match(/^(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})$/);

    if (!rangeMatch) {
      return {
        rawValue: rawValue,
        isActive: true,
        isValid: false,
        startDate: null,
        endDate: null
      };
    }

    const startDate = parseIsoDate(rangeMatch[1]);
    const endDate = parseIsoDate(rangeMatch[2]);
    const isValidRange = Boolean(startDate && endDate && startDate < endDate);

    return {
      rawValue: rawValue,
      isActive: true,
      isValid: isValidRange,
      startDate: isValidRange ? startDate : null,
      endDate: isValidRange ? endDate : null
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

  function matchesDateFilter(listingLink, datesState) {
    if (!datesState.isActive || !datesState.isValid) {
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

  function getCurrentSearchState() {
    return {
      destinationQuery: destinationInput ? destinationInput.value.trim() : '',
      dates: getDatesFilterState(),
      travelers: getTravelersFilterState()
    };
  }

  function getVisibleListingCount() {
    return listingLinks.filter(function (listingLink) {
      return listingLink.style.display !== 'none';
    }).length;
  }

  function syncSearchQueryParams() {
    const currentSearchState = getCurrentSearchState();

    window.TravelWebsiteUtils.updatePageQueryValue('destination', currentSearchState.destinationQuery);
    window.TravelWebsiteUtils.updatePageQueryValue('dates', currentSearchState.dates.rawValue);
    window.TravelWebsiteUtils.updatePageQueryValue('travelers', currentSearchState.travelers.rawValue);
  }

  function updateCombinedSearchFeedback() {
    const currentSearchState = getCurrentSearchState();
    const visibleCount = getVisibleListingCount();
    const statusElement = document.querySelector('.search-results-status');
    const noResultsElement = document.querySelector('.search-no-results');
    const noResultsTitle = noResultsElement ? noResultsElement.querySelector('h3') : null;
    const noResultsDescription = noResultsElement ? noResultsElement.querySelector('p') : null;

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
        guidanceMessages.push('Enter dates as YYYY-MM-DD to YYYY-MM-DD.');
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

    let statusMessage = '';

    if (!activeFilters.length) {
      statusMessage = 'Showing all ' + listingLinks.length + ' available stays.';
    } else {
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
      statusMessage += ' ' + guidanceMessages.join(' ');
    }

    statusElement.textContent = statusMessage;

    const hasAnyFilter = Boolean(
      activeFilters.length || currentSearchState.dates.isActive || currentSearchState.travelers.isActive
    );
    const shouldShowNoResults = hasAnyFilter && visibleCount === 0 && !guidanceMessages.length;

    noResultsElement.classList.toggle('search-ui-hidden', !shouldShowNoResults);

    if (shouldShowNoResults) {
      if (noResultsTitle) {
        noResultsTitle.textContent = 'No stays matched your current search';
      }

      if (noResultsDescription) {
        noResultsDescription.textContent =
          'Try broader dates, fewer travelers, or a different destination.';
      }
    }
  }

  let listingsSearch = null;

  function applyAllSearchFilters() {
    if (!listingsSearch) {
      return;
    }

    listingsSearch.applyFilter(destinationInput ? destinationInput.value.trim() : '');
  }

  if (
    window.TravelWebsiteUtils &&
    searchForm &&
    destinationInput &&
    datesInput &&
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
        const titleElement = listingLink.querySelector('h3');
        const locationElement = listingLink.querySelector('.location');
        const priceElement = listingLink.querySelector('.price');
        const listingMetaElement = listingLink.querySelector('.listing-meta');
        const title = titleElement ? titleElement.textContent.trim() : '';
        const location = locationElement ? locationElement.textContent.trim() : '';
        const price = priceElement ? priceElement.textContent.trim() : '';
        const listingMeta = listingMetaElement ? listingMetaElement.textContent.trim() : '';

        return {
          title: title,
          subtitle: location,
          suggestionMeta: location + (price ? ' • ' + price + ' per night' : ''),
          suggestionKey: title + '|' + location,
          searchValue: title,
          searchText: [title, location, price, listingMeta].join(' ')
        };
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
          matchesTravelersFilter(listingLink, currentSearchState.travelers);

        listingLink.style.display = shouldShowListing ? '' : 'none';
      },

      afterFilter: function () {
        syncSearchQueryParams();
        updateCombinedSearchFeedback();
      },

      onSubmit: function () {
        syncSearchQueryParams();
        updateCombinedSearchFeedback();
      }
    });

    datesInput.addEventListener('input', applyAllSearchFilters);
    datesInput.addEventListener('change', applyAllSearchFilters);
    travelersInput.addEventListener('input', applyAllSearchFilters);
    travelersInput.addEventListener('change', applyAllSearchFilters);
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