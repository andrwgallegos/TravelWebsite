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

    // Close the mobile menu if sign in was opened from there
    closeMobileMenu();
  }

  // Closes the modal
  function closeSignInModalFn() {
    if (signInModal) {
      signInModal.classList.add('hidden');
      signInModal.setAttribute('aria-hidden', 'true');
    }
  }

  // Attach open events
  if (desktopSignInButton) {
    desktopSignInButton.addEventListener('click', openSignInModal);
  }

  if (mobileSignInButton) {
    mobileSignInButton.addEventListener('click', openSignInModal);
  }

  // Close from X button
  if (closeSignInModal) {
    closeSignInModal.addEventListener('click', closeSignInModalFn);
  }

  // Close when clicking outside the modal content
  if (signInModal) {
    signInModal.addEventListener('click', function (event) {
      if (event.target === signInModal) {
        closeSignInModalFn();
      }
    });
  }

  // Prototype behavior: both buttons go to Trips
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
     HOMEPAGE FEATURE BUTTONS
     Keeps each travel type clickable while the demo still
     uses the shared trips-style search flow.
     ========================================================= */

  const homepageFeatureButtons = Array.from(document.querySelectorAll('.category-feature-button'));

  function setActiveHomepageFeature(featureName) {
    homepageFeatureButtons.forEach(function (button) {
      const isSelected = button.dataset.feature === featureName;
      button.classList.toggle('is-active', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });
  }

  homepageFeatureButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const selectedFeature = button.dataset.feature || 'Stays';

      setActiveHomepageFeature(selectedFeature);

      if (window.TravelWebsiteUtils) {
        window.TravelWebsiteUtils.showToast(
          selectedFeature + ' is clickable in this prototype. The demo still uses the shared trips flow.'
        );
      }
    });
  });

  /* =========================================================
     LIVE DESTINATION SEARCH
     Filters featured stays in real time by destination,
     dates, and travelers, while submit still routes to the
     Search Results page.
     ========================================================= */

  // The Homepage search uses the first destination input inside the shared search form.
  const homepageSearchForm = document.querySelector('.search-form');
  const homepageDestinationInput = document.querySelector('.search-form input[aria-label="Destination"]');
  const homepageCheckInInput = document.querySelector('.search-form input[aria-label="Check-in"]');
  const homepageCheckOutInput = document.querySelector('.search-form input[aria-label="Check-out"]');
  const homepageTravelersInput = document.querySelector('.search-form input[aria-label="Travelers"]');
  const homepageTripLinks = Array.from(document.querySelectorAll('.trip-grid .trip-link'));
  const homepageTripSection = document.querySelector('.trip-section');

  let homepageSearchController = null;
  let homepageSecondaryFilterTimeoutId = null;

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

  function getHomepageDatesFilterState() {
    const checkInValue = homepageCheckInInput ? homepageCheckInInput.value.trim() : '';
    const checkOutValue = homepageCheckOutInput ? homepageCheckOutInput.value.trim() : '';
    const hasAnyDate = Boolean(checkInValue || checkOutValue);

    if (!hasAnyDate) {
      return {
        checkInValue: '',
        checkOutValue: '',
        isActive: false,
        isValid: true,
        startDate: null,
        endDate: null,
        validationMessage: ''
      };
    }

    if (!checkInValue || !checkOutValue) {
      return {
        checkInValue: checkInValue,
        checkOutValue: checkOutValue,
        isActive: true,
        isValid: false,
        startDate: null,
        endDate: null,
        validationMessage: 'Choose both check-in and check-out dates.'
      };
    }

    const startDate = parseIsoDate(checkInValue);
    const endDate = parseIsoDate(checkOutValue);

    if (!startDate || !endDate) {
      return {
        checkInValue: checkInValue,
        checkOutValue: checkOutValue,
        isActive: true,
        isValid: false,
        startDate: null,
        endDate: null,
        validationMessage: 'Enter valid check-in and check-out dates.'
      };
    }

    if (endDate < startDate) {
      return {
        checkInValue: checkInValue,
        checkOutValue: checkOutValue,
        isActive: true,
        isValid: false,
        startDate: startDate,
        endDate: endDate,
        validationMessage: 'Check-out must be after check-in.'
      };
    }

    return {
      checkInValue: checkInValue,
      checkOutValue: checkOutValue,
      isActive: true,
      isValid: true,
      startDate: startDate,
      endDate: endDate,
      validationMessage: ''
    };
  }

  function getHomepageTravelersFilterState() {
    const rawValue = homepageTravelersInput ? homepageTravelersInput.value.trim() : '';

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

  function matchesHomepageDateFilter(tripLink, datesState) {
    if (!datesState.isActive || !datesState.isValid) {
      return true;
    }

    const availableStart = parseIsoDate(tripLink.dataset.availableStart || '');
    const availableEnd = parseIsoDate(tripLink.dataset.availableEnd || '');

    if (!availableStart || !availableEnd) {
      return false;
    }

    return datesState.startDate >= availableStart && datesState.endDate <= availableEnd;
  }

  function matchesHomepageTravelersFilter(tripLink, travelersState) {
    if (!travelersState.isActive || !travelersState.isValid) {
      return true;
    }

    const maxTravelers = Number(tripLink.dataset.maxTravelers || '0');
    return travelersState.count <= maxTravelers;
  }

  function getHomepageSearchState() {
    return {
      destinationQuery: homepageDestinationInput ? homepageDestinationInput.value.trim() : '',
      dates: getHomepageDatesFilterState(),
      travelers: getHomepageTravelersFilterState()
    };
  }

  function getVisibleHomepageTripCount() {
    return homepageTripLinks.filter(function (tripLink) {
      return tripLink.style.display !== 'none';
    }).length;
  }

  function updateHomepageSearchFeedback() {
    const currentSearchState = getHomepageSearchState();
    const visibleCount = getVisibleHomepageTripCount();
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

    let statusMessage = '';

    if (activeFilters.length) {
      statusMessage =
        'Showing ' +
        visibleCount +
        ' ' +
        (visibleCount === 1 ? 'featured stay' : 'featured stays') +
        ' for ' +
        activeFilters.join(' • ') +
        '.';
    }

    if (guidanceMessages.length) {
      statusMessage += (statusMessage ? ' ' : '') + guidanceMessages.join(' ');
    }

    statusElement.textContent = statusMessage;

    const hasAnyFilter = Boolean(
      currentSearchState.destinationQuery ||
      currentSearchState.dates.isActive ||
      currentSearchState.travelers.isActive
    );
    const shouldShowNoResults = hasAnyFilter && visibleCount === 0 && !guidanceMessages.length;

    noResultsElement.classList.toggle('search-ui-hidden', !shouldShowNoResults);

    if (shouldShowNoResults) {
      if (noResultsTitle) {
        noResultsTitle.textContent = 'No featured stays matched your current search';
      }

      if (noResultsDescription) {
        noResultsDescription.textContent =
          'Try broader dates, fewer travelers, or a different destination.';
      }
    }
  }

  function applyHomepageSearchFilters() {
    if (!homepageSearchController) {
      return;
    }

    homepageSearchController.applyFilter(homepageDestinationInput ? homepageDestinationInput.value.trim() : '');
    homepageSearchController.hideSuggestions();
  }

  function scheduleHomepageSecondaryFiltersUpdate() {
    if (!homepageSearchController) {
      return;
    }

    window.clearTimeout(homepageSecondaryFilterTimeoutId);

    homepageSecondaryFilterTimeoutId = window.setTimeout(function () {
      homepageSearchController.runLoadingTask({
        mode: 'filter',
        query: 'featured stays',
        text: 'Updating featured stays…',
        delay: 420,
        onComplete: applyHomepageSearchFilters
      });
    }, 120);
  }

  if (
    window.TravelWebsiteUtils &&
    homepageSearchForm &&
    homepageDestinationInput &&
    homepageCheckInInput &&
    homepageCheckOutInput &&
    homepageTravelersInput &&
    homepageTripLinks.length
  ) {
    homepageSearchController = window.TravelWebsiteUtils.initLiveSearch({
      formElement: homepageSearchForm,
      inputElement: homepageDestinationInput,
      itemElements: homepageTripLinks,

      // Build a clean search record from each destination card.
      getItemData: function (tripLink) {
        const titleElement = tripLink.querySelector('h3');
        const locationElement = tripLink.querySelector('.location');
        const priceElement = tripLink.querySelector('.price');
        const title = titleElement ? titleElement.textContent.trim() : '';
        const location = locationElement ? locationElement.textContent.trim() : '';
        const price = priceElement ? priceElement.textContent.trim() : '';

        return {
          title: title,
          subtitle: location,
          suggestionMeta: location + (price ? ' • ' + price + ' per night' : ''),
          searchValue: title,
          searchText: [title, location, price].join(' ')
        };
      },

      getStatusText: function () {
        return '';
      },

      noResultsTitle: 'No featured stays matched your current search',
      noResultsDescription: 'Try broader dates, fewer travelers, or a different destination.',
      noResultsMount: homepageTripSection,

      setItemVisibility: function (tripLink, matchesDestinationQuery) {
        const currentSearchState = getHomepageSearchState();
        const shouldShowTrip =
          matchesDestinationQuery &&
          matchesHomepageDateFilter(tripLink, currentSearchState.dates) &&
          matchesHomepageTravelersFilter(tripLink, currentSearchState.travelers);

        tripLink.style.display = shouldShowTrip ? '' : 'none';
      },

      afterFilter: function () {
        updateHomepageSearchFeedback();
      },

      // Submitting the Homepage search still routes the user to the Search Results page.
      onSubmit: function (state) {
        const searchResultsUrl = new URL('../SearchResults/index.html', window.location.href);
        const checkInValue = homepageCheckInInput ? homepageCheckInInput.value.trim() : '';
        const checkOutValue = homepageCheckOutInput ? homepageCheckOutInput.value.trim() : '';
        const travelersValue = homepageTravelersInput ? homepageTravelersInput.value.trim() : '';

        if (state.query) {
          searchResultsUrl.searchParams.set('destination', state.query);
        }

        if (checkInValue) {
          searchResultsUrl.searchParams.set('checkIn', checkInValue);
        }

        if (checkOutValue) {
          searchResultsUrl.searchParams.set('checkOut', checkOutValue);
        }

        if (travelersValue) {
          searchResultsUrl.searchParams.set('travelers', travelersValue);
        }

        window.location.href = searchResultsUrl.toString();
      },

      enableInputLoading: true,
      loadingDelay: 260,
      loadingText: 'Loading featured stays…',
      filterLoadingText: 'Updating featured stays…',
      submitLoadingDelay: 900,
      submitLoadingText: 'Searching featured stays…'
    });

    homepageCheckInInput.addEventListener('input', scheduleHomepageSecondaryFiltersUpdate);
    homepageCheckInInput.addEventListener('change', scheduleHomepageSecondaryFiltersUpdate);
    homepageCheckOutInput.addEventListener('input', scheduleHomepageSecondaryFiltersUpdate);
    homepageCheckOutInput.addEventListener('change', scheduleHomepageSecondaryFiltersUpdate);
    homepageTravelersInput.addEventListener('input', scheduleHomepageSecondaryFiltersUpdate);
    homepageTravelersInput.addEventListener('change', scheduleHomepageSecondaryFiltersUpdate);

    updateHomepageSearchFeedback();
  }

  /* =========================================================
     GLOBAL KEYBOARD SHORTCUTS
     ========================================================= */

  // Escape key closes overlays
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMobileMenu();
      closeSignInModalFn();
    }
  });
});