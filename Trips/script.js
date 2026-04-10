document.addEventListener('DOMContentLoaded', function () {
  /* =========================================================
     MOBILE NAVIGATION
     Shared mobile menu logic
     ========================================================= */

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

  // Guard clauses prevent errors if a shared nav element is missing
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
     SIGN-IN / SIGN-UP MODAL
     Handles showing and hiding the account modal
     ========================================================= */

  const openSignInDesktop = document.getElementById('openSignInDesktop');
  const openSignInMobile = document.getElementById('openSignInMobile');
  const signInModal = document.getElementById('signInModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const closeModalLink = document.getElementById('closeModalLink');
  const closeModalButton = document.getElementById('closeModalButton');

  // Opens the modal and overlay together
  function openModal() {
    if (signInModal) {
      signInModal.classList.add('show');
      signInModal.setAttribute('aria-hidden', 'false');
    }

    if (modalOverlay) {
      modalOverlay.classList.add('show');
    }

    // If opened from mobile, clean up the mobile nav first
    closeMobileMenu();
  }

  // Closes the modal and overlay together
  function closeModal() {
    if (signInModal) {
      signInModal.classList.remove('show');
      signInModal.setAttribute('aria-hidden', 'true');
    }

    if (modalOverlay) {
      modalOverlay.classList.remove('show');
    }
  }

  if (openSignInDesktop) {
    openSignInDesktop.addEventListener('click', openModal);
  }

  if (openSignInMobile) {
    openSignInMobile.addEventListener('click', openModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }

  if (closeModalLink) {
    closeModalLink.addEventListener('click', closeModal);
  }

  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal);
  }

  // Close modal if user clicks outside the modal box
  if (signInModal) {
    signInModal.addEventListener('click', function (event) {
      if (event.target === signInModal) {
        closeModal();
      }
    });
  }

  /* =========================================================
     SIGN-UP FORM
     Simple prototype validation before success behavior
     ========================================================= */

  const signUpForm = document.getElementById('signUpForm');
  const firstName = document.getElementById('firstName');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');

  if (signUpForm && firstName && password && confirmPassword) {
    signUpForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (password.value !== confirmPassword.value) {
        alert('Passwords do not match.');
        return;
      }

      if (password.value.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
      }

      alert('Account created successfully! Welcome, ' + firstName.value + '!');
      closeModal();
    });
  }

  /* =========================================================
     TRIPS TAB SWITCHING
     Shows one panel at a time
     ========================================================= */

  const tripTabs = document.querySelectorAll('.trip-tab');
  const bookedPanel = document.getElementById('bookedPanel');
  const savedPanel = document.getElementById('savedPanel');
  const createPanel = document.getElementById('createPanel');
  const tripSearchForm = document.getElementById('tripSearchForm');
  const tripSearchInput = document.getElementById('tripSearchInput');

  // The search controller is filled later so the tabs can reset any active search.
  let tripSearchController = null;

  // Hides every panel and removes active tab state
  function resetTripPanels() {
    tripTabs.forEach(function (tab) {
      tab.classList.remove('active');
    });

    if (bookedPanel) {
      bookedPanel.classList.remove('active-panel');
      bookedPanel.classList.add('hidden-panel');
    }

    if (savedPanel) {
      savedPanel.classList.remove('active-panel');
      savedPanel.classList.add('hidden-panel');
    }

    if (createPanel) {
      createPanel.classList.remove('active-panel');
      createPanel.classList.add('hidden-panel');
    }
  }

  // Returns the currently selected tab name so search can restore it after clearing.
  function getActiveTripTabName() {
    const activeTab = document.querySelector('.trip-tab.active');
    return activeTab ? activeTab.dataset.tab : 'booked';
  }

  // Activates one tab and its matching content panel.
  function activateTripTab(tabName) {
    const selectedTabButton = Array.from(tripTabs).find(function (tab) {
      return tab.dataset.tab === tabName;
    });

    resetTripPanels();

    if (selectedTabButton) {
      selectedTabButton.classList.add('active');
    }

    if (tabName === 'booked' && bookedPanel) {
      bookedPanel.classList.add('active-panel');
      bookedPanel.classList.remove('hidden-panel');
    } else if (tabName === 'saved' && savedPanel) {
      savedPanel.classList.add('active-panel');
      savedPanel.classList.remove('hidden-panel');
    } else if (tabName === 'create' && createPanel) {
      createPanel.classList.add('active-panel');
      createPanel.classList.remove('hidden-panel');
    }
  }

  // Clicking a tab clears any active trip search so the user can browse panels normally again.
  tripTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      if (tripSearchInput && tripSearchInput.value.trim()) {
        tripSearchInput.value = '';

        if (tripSearchController) {
          tripSearchController.applyFilter('');
        }
      }

      activateTripTab(tab.dataset.tab);
    });
  });

  /* =========================================================
     ADS CAROUSEL
     Moves the row of ads left and right
     ========================================================= */

  const adsContainer = document.getElementById('adsContainer');
  const prevAd = document.getElementById('prevAd');
  const nextAd = document.getElementById('nextAd');
  const adItems = document.querySelectorAll('.ad-item');

  let currentAdIndex = 0;

  // Number of visible ads depends on screen width
  function getVisibleAds() {
    if (window.innerWidth >= 1100) {
      return 5;
    }

    if (window.innerWidth >= 700) {
      return 3;
    }

    return 1;
  }

  // Moves the carousel based on the current index
  function updateAdDisplay() {
    if (!adsContainer) {
      return;
    }

    const adWidth = 184;
    const maxIndex = Math.max(0, adItems.length - getVisibleAds());

    if (currentAdIndex > maxIndex) {
      currentAdIndex = maxIndex;
    }

    const offset = -(currentAdIndex * adWidth);
    adsContainer.style.transform = 'translateX(' + offset + 'px)';
  }

  // Move left only if not already at the start
  if (prevAd) {
    prevAd.addEventListener('click', function () {
      if (currentAdIndex > 0) {
        currentAdIndex--;
        updateAdDisplay();
      }
    });
  }

  // Move right only if there are more hidden ads ahead
  if (nextAd) {
    nextAd.addEventListener('click', function () {
      const maxIndex = Math.max(0, adItems.length - getVisibleAds());

      if (currentAdIndex < maxIndex) {
        currentAdIndex++;
        updateAdDisplay();
      }
    });
  }

  // Recalculate ad position if screen size changes
  window.addEventListener('resize', updateAdDisplay);

  /* =========================================================
     LIVE TRIP SEARCH
     Filters booked trips in real time and surfaces suggestions
     for itinerary number, destination, hotel, and airline.
     ========================================================= */

  const bookedTripCards = bookedPanel ? Array.from(bookedPanel.querySelectorAll('.trip-card')) : [];
  let tabBeforeSearch = '';

  // Add stable prototype itinerary numbers so the search field can match the current placeholder.
  bookedTripCards.forEach(function (tripCard, index) {
    tripCard.dataset.itineraryNumber = 'TRP-' + String(2041 + index);
  });

  // Update the placeholder so it matches the broader search behavior.
  if (tripSearchInput) {
    tripSearchInput.placeholder = 'Search itinerary, destination, hotel, or airline';
  }

  if (window.TravelWebsiteUtils && tripSearchForm && tripSearchInput && bookedTripCards.length) {
    tripSearchController = window.TravelWebsiteUtils.initLiveSearch({
      formElement: tripSearchForm,
      inputElement: tripSearchInput,
      itemElements: bookedTripCards,
      noResultsMount: bookedPanel,

      // Build a searchable record from each booked trip card.
      getItemData: function (tripCard) {
        const destinationElement = tripCard.querySelector('h3');
        const locationElement = tripCard.querySelector('.location');
        const stayElement = tripCard.querySelector('.stay');
        const priceElement = tripCard.querySelector('.price');
        const airlineElement = tripCard.querySelector('.travel');
        const timeElement = tripCard.querySelector('.time');
        const destination = destinationElement ? destinationElement.textContent.trim() : '';
        const location = locationElement ? locationElement.textContent.trim() : '';
        const stay = stayElement ? stayElement.textContent.trim() : '';
        const price = priceElement ? priceElement.textContent.trim() : '';
        const airline = airlineElement ? airlineElement.textContent.trim() : '';
        const time = timeElement ? timeElement.textContent.trim() : '';
        const itineraryNumber = tripCard.dataset.itineraryNumber || '';

        return {
          title: destination,
          subtitle: itineraryNumber,
          suggestionMeta: itineraryNumber + ' • ' + stay + ' • ' + airline,
          searchValue: destination,
          searchText: [destination, location, stay, price, airline, time, itineraryNumber].join(' ')
        };
      },

      getStatusText: function (state) {
        if (!state.query) {
          return 'Showing all ' + state.totalCount + ' booked trips.';
        }

        return (
          'Showing ' +
          state.matchCount +
          ' ' +
          (state.matchCount === 1 ? 'trip' : 'trips') +
          ' for “' +
          state.query +
          '”.'
        );
      },

      noResultsTitle: 'No booked trips matched your search',
      noResultsDescription: 'Try an itinerary number, destination, hotel name, or airline.',

      // Searching always focuses the Booked tab because that is where the trip cards live.
      afterFilter: function (state) {
        const searchIsActive = Boolean(state.query);

        if (searchIsActive) {
          if (!tabBeforeSearch) {
            tabBeforeSearch = getActiveTripTabName();
          }

          activateTripTab('booked');
          return;
        }

        if (tabBeforeSearch && tabBeforeSearch !== 'booked') {
          activateTripTab(tabBeforeSearch);
        }

        tabBeforeSearch = '';
      },

      // Submit stays client-side because the list is already filtering live.
      onSubmit: function () {}
    });
  }

  /* =========================================================
     GLOBAL KEYBOARD SHORTCUTS
     ========================================================= */

  // Allow Escape key to close modal/menu
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeModal();
      closeMobileMenu();
    }
  });

  // Initialize carousel position on load
  updateAdDisplay();
});