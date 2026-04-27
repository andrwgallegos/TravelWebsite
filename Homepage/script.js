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

  // Account action fallback keeps legacy buttons navigable.
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
     Keeps each travel type interactive while routing users through
     the shared trips-style search flow.
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
          selectedFeature + ' options are ready. Continue through search to view matching stays.'
        );
      }
    });
  });

  /* =========================================================
     HOMEPAGE SEARCH ROUTER
     The homepage now acts as the starting point for a search.
     It shows type-ahead suggestions, saves the
     visitor's dates/traveler choices, and routes to Search Results
     instead of hiding or changing the homepage card section.
     ========================================================= */

  const homepageSearchForm = document.querySelector('.search-form');
  const homepageDestinationInput = document.querySelector('.search-form input[aria-label="Destination"]');
  const homepageCheckInInput = document.querySelector('.search-form input[aria-label="Check-in"]');
  const homepageCheckOutInput = document.querySelector('.search-form input[aria-label="Check-out"]');
  const homepageTravelersInput = document.querySelector('.search-form input[aria-label="Travelers"]');
  const homepageTripLinks = Array.from(document.querySelectorAll('.trip-grid .trip-link'));

  function getHomepageSearchValues() {
    return {
      destination: homepageDestinationInput ? homepageDestinationInput.value.trim() : '',
      checkIn: homepageCheckInInput ? homepageCheckInInput.value.trim() : '',
      checkOut: homepageCheckOutInput ? homepageCheckOutInput.value.trim() : '',
      travelers: homepageTravelersInput ? homepageTravelersInput.value.trim() : ''
    };
  }

  function saveHomepageSearchValues() {
    if (window.NexpediaEnhancements && typeof window.NexpediaEnhancements.saveSearchState === 'function') {
      window.NexpediaEnhancements.saveSearchState(getHomepageSearchValues());
    }
  }

  function routeHomepageSearchToResults(queryFromSearchController) {
    const currentValues = getHomepageSearchValues();
    const searchResultsUrl = new URL('../SearchResults/index.html', window.location.href);
    const destinationQuery = String(queryFromSearchController || currentValues.destination || '').trim();

    if (destinationQuery) {
      searchResultsUrl.searchParams.set('destination', destinationQuery);
    }

    if (currentValues.checkIn) {
      searchResultsUrl.searchParams.set('checkIn', currentValues.checkIn);
    }

    if (currentValues.checkOut) {
      searchResultsUrl.searchParams.set('checkOut', currentValues.checkOut);
    }

    if (currentValues.travelers) {
      searchResultsUrl.searchParams.set('travelers', currentValues.travelers);
    }

    saveHomepageSearchValues();
    window.location.href = searchResultsUrl.toString();
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
    window.TravelWebsiteUtils.initLiveSearch({
      formElement: homepageSearchForm,
      inputElement: homepageDestinationInput,
      itemElements: homepageTripLinks,

      // Suggestions still come from the visible destination cards, but card visibility is never changed.
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

      getLiveSuggestionMeta: function (tripLink) {
        const locationElement = tripLink.querySelector('.location');
        const priceElement = tripLink.querySelector('.price');
        const location = locationElement ? locationElement.textContent.trim() : '';
        const price = priceElement ? priceElement.textContent.trim() : '';

        return location + (price ? ' • ' + price + ' per night' : '');
      },

      getStatusText: function () {
        return '';
      },

      noResultsTitle: 'No homepage suggestions matched',
      noResultsDescription: 'You can still search this destination to see all available results.',

      // Code review note: the homepage remains stable after searching;
      // destination filtering happens only on the dedicated Search Results page.
      setItemVisibility: function (tripLink) {
        tripLink.style.display = '';
      },

      afterFilter: function () {
        homepageTripLinks.forEach(function (tripLink) {
          tripLink.style.display = '';
        });
        saveHomepageSearchValues();
      },

      onSubmit: function (state) {
        routeHomepageSearchToResults(state.query);
      },

      enableInputLoading: true,
      loadingDelay: 240,
      loadingText: 'Loading destination suggestions…',
      submitLoadingDelay: 750,
      submitLoadingText: 'Opening search results…'
    });

    [homepageCheckInInput, homepageCheckOutInput, homepageTravelersInput].forEach(function (inputElement) {
      inputElement.addEventListener('input', saveHomepageSearchValues);
      inputElement.addEventListener('change', saveHomepageSearchValues);
    });
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