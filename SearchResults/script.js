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
     Filters listing cards as the user types and keeps
     the destination query synced to the page URL.
     ========================================================= */

  const searchForm = document.querySelector('.search-form');
  const destinationInput = document.querySelector('.search-form input[aria-label="Destination"]');
  const listingsPanel = document.querySelector('.listings-panel');
  const listingLinks = Array.from(document.querySelectorAll('.listings-panel .listing-link'));
  const initialDestinationQuery = window.TravelWebsiteUtils
    ? window.TravelWebsiteUtils.getPageQueryValue('destination')
    : '';

  // Prefill the destination field when the user came from the Homepage search.
  if (destinationInput && initialDestinationQuery) {
    destinationInput.value = initialDestinationQuery;
  }

  if (window.TravelWebsiteUtils && searchForm && destinationInput && listingsPanel && listingLinks.length) {
    window.TravelWebsiteUtils.initLiveSearch({
      formElement: searchForm,
      inputElement: destinationInput,
      itemElements: listingLinks,
      initialQuery: initialDestinationQuery,
      noResultsMount: listingsPanel,

      // Build the search index for each property card.
      getItemData: function (listingLink) {
        const titleElement = listingLink.querySelector('h3');
        const locationElement = listingLink.querySelector('.location');
        const priceElement = listingLink.querySelector('.price');
        const title = titleElement ? titleElement.textContent.trim() : '';
        const location = locationElement ? locationElement.textContent.trim() : '';
        const price = priceElement ? priceElement.textContent.trim() : '';

        return {
          title: title,
          subtitle: location,
          suggestionMeta: location + (price ? ' • ' + price + ' per night' : ''),
          suggestionKey: title + '|' + location,
          searchValue: title,
          searchText: [title, location, price].join(' ')
        };
      },

      // The status text is tuned to the Search Results page instead of the Homepage copy.
      getStatusText: function (state) {
        if (!state.query) {
          return 'Showing all ' + state.totalCount + ' available stays.';
        }

        return (
          'Showing ' +
          state.matchCount +
          ' ' +
          (state.matchCount === 1 ? 'stay' : 'stays') +
          ' for “' +
          state.query +
          '”.'
        );
      },

      noResultsTitle: 'No stays matched your destination search',
      noResultsDescription: 'Try another destination name or clear the search to see every available stay.',

      // Keep the current destination query shareable in the page URL.
      afterFilter: function (state) {
        window.TravelWebsiteUtils.updatePageQueryValue('destination', state.query);
      },

      // Submit keeps the experience client-side while staying in sync with the URL.
      onSubmit: function (state) {
        window.TravelWebsiteUtils.updatePageQueryValue('destination', state.query);
      }
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