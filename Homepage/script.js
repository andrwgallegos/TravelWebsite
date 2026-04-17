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
     LIVE DESTINATION SEARCH
     Filters featured trips in real time and still supports
     navigating to Search Results on submit.
     ========================================================= */

  // The Homepage search uses the first destination input inside the shared search form.
  const homepageSearchForm = document.querySelector('.search-form');
  const homepageDestinationInput = document.querySelector('.search-form input[aria-label="Destination"]');
  const homepageDatesInput = document.querySelector('.search-form input[aria-label="Dates"]');
  const homepageTravelersInput = document.querySelector('.search-form input[aria-label="Travelers"]');
  const homepageTripLinks = Array.from(document.querySelectorAll('.trip-grid .trip-link'));

  if (window.TravelWebsiteUtils && homepageSearchForm && homepageDestinationInput && homepageTripLinks.length) {
    window.TravelWebsiteUtils.initLiveSearch({
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

      // This line keeps the search feedback specific to the Homepage section.
      getStatusText: function (state) {
        if (!state.query) {
          return 'Showing all ' + state.totalCount + ' featured destinations.';
        }

        return (
          'Showing ' +
          state.matchCount +
          ' ' +
          (state.matchCount === 1 ? 'destination' : 'destinations') +
          ' for “' +
          state.query +
          '”.'
        );
      },

      noResultsTitle: 'No featured destinations matched your search',
      noResultsDescription: 'Try a different city, state, country, or beach destination.',
      noResultsMount: document.querySelector('.trip-section'),

      // Submitting the Homepage search still routes the user to the Search Results page.
      onSubmit: function (state) {
        const searchResultsUrl = new URL('../SearchResults/index.html', window.location.href);
        const datesValue = homepageDatesInput ? homepageDatesInput.value.trim() : '';
        const travelersValue = homepageTravelersInput ? homepageTravelersInput.value.trim() : '';

        if (state.query) {
          searchResultsUrl.searchParams.set('destination', state.query);
        }

        if (datesValue) {
          searchResultsUrl.searchParams.set('dates', datesValue);
        }

        if (travelersValue) {
          searchResultsUrl.searchParams.set('travelers', travelersValue);
        }

        window.location.href = searchResultsUrl.toString();
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