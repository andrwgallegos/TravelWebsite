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
  const signUpFirstNameField = document.getElementById('signUpFirstName');
  let lastModalTrigger = null;

  // Opens the modal and overlay together
  function openModal(event) {
    lastModalTrigger = event && event.currentTarget ? event.currentTarget : null;

    if (signInModal) {
      signInModal.classList.add('show');
      signInModal.setAttribute('aria-hidden', 'false');
    }

    if (modalOverlay) {
      modalOverlay.classList.add('show');
    }

    document.body.classList.add('modal-open');

    // If opened from mobile, clean up the mobile nav first
    closeMobileMenu();

    window.setTimeout(function () {
      if (signUpFirstNameField) {
        signUpFirstNameField.focus();
      }
    }, 40);
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

    document.body.classList.remove('modal-open');

    if (lastModalTrigger && typeof lastModalTrigger.focus === 'function') {
      lastModalTrigger.focus();
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
  const signUpFirstName = document.getElementById('signUpFirstName');
  const signUpLastName = document.getElementById('signUpLastName');
  const signUpEmail = document.getElementById('signUpEmail');
  const signUpPassword = document.getElementById('signUpPassword');
  const signUpConfirmPassword = document.getElementById('signUpConfirmPassword');
  const signUpFormStatus = document.getElementById('signUpFormStatus');

  function setSignUpFieldState(fieldElement, feedbackElement, state, message) {
    if (!fieldElement || !feedbackElement) {
      return;
    }

    fieldElement.classList.remove('error', 'success');
    feedbackElement.classList.remove('show', 'error', 'success');
    feedbackElement.textContent = '';

    if (!state || !message) {
      fieldElement.removeAttribute('aria-invalid');
      return;
    }

    fieldElement.classList.add(state);
    fieldElement.setAttribute('aria-invalid', String(state === 'error'));
    feedbackElement.textContent = message;
    feedbackElement.classList.add('show', state);
  }

  function setSignUpFormStatus(state, message) {
    if (!signUpFormStatus) {
      return;
    }

    signUpFormStatus.classList.remove('show', 'error', 'success');
    signUpFormStatus.textContent = '';

    if (state && message) {
      signUpFormStatus.textContent = message;
      signUpFormStatus.classList.add('show', state);
    }
  }

  function isValidEmailAddress(emailValue) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  }

  function isStrongPassword(passwordValue) {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(passwordValue);
  }

  function validateSignUpField(fieldName) {
    const fieldMap = {
      signUpFirstName: {
        element: signUpFirstName,
        feedback: document.getElementById('signUpFirstNameFeedback')
      },
      signUpLastName: {
        element: signUpLastName,
        feedback: document.getElementById('signUpLastNameFeedback')
      },
      signUpEmail: {
        element: signUpEmail,
        feedback: document.getElementById('signUpEmailFeedback')
      },
      signUpPassword: {
        element: signUpPassword,
        feedback: document.getElementById('signUpPasswordFeedback')
      },
      signUpConfirmPassword: {
        element: signUpConfirmPassword,
        feedback: document.getElementById('signUpConfirmPasswordFeedback')
      }
    };

    const fieldRecord = fieldMap[fieldName];

    if (!fieldRecord || !fieldRecord.element) {
      return true;
    }

    const fieldValue = fieldRecord.element.value.trim();

    switch (fieldName) {
      case 'signUpFirstName':
        if (!fieldValue) {
          setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'error', 'Enter your first name.');
          return false;
        }

        if (fieldValue.length < 2) {
          setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'error', 'First name must be at least 2 characters.');
          return false;
        }

        setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'success', 'First name looks good.');
        return true;

      case 'signUpLastName':
        if (!fieldValue) {
          setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'error', 'Enter your last name.');
          return false;
        }

        if (fieldValue.length < 2) {
          setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'error', 'Last name must be at least 2 characters.');
          return false;
        }

        setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'success', 'Last name looks good.');
        return true;

      case 'signUpEmail':
        if (!fieldValue) {
          setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'error', 'Enter an email address.');
          return false;
        }

        if (!isValidEmailAddress(fieldValue)) {
          setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'error', 'Use a format like name@example.com.');
          return false;
        }

        setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'success', 'Email format looks good.');
        return true;

      case 'signUpPassword':
        if (!fieldValue) {
          setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'error', 'Create a password.');
          return false;
        }

        if (!isStrongPassword(fieldValue)) {
          setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'error', 'Password must be at least 8 characters and include a letter and a number.');
          return false;
        }

        setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'success', 'Password meets the requirements.');
        return true;

      case 'signUpConfirmPassword':
        if (!fieldValue) {
          setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'error', 'Re-enter your password to confirm it.');
          return false;
        }

        if (fieldValue !== signUpPassword.value) {
          setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'error', 'Passwords do not match yet.');
          return false;
        }

        setSignUpFieldState(fieldRecord.element, fieldRecord.feedback, 'success', 'Passwords match.');
        return true;

      default:
        return true;
    }
  }

  if (signUpForm && signUpFirstName && signUpPassword && signUpConfirmPassword) {
    [signUpFirstName, signUpLastName, signUpEmail, signUpPassword, signUpConfirmPassword].forEach(function (fieldElement) {
      fieldElement.addEventListener('input', function () {
        validateSignUpField(fieldElement.id);
        setSignUpFormStatus('', '');

        if (fieldElement.id === 'signUpPassword' && signUpConfirmPassword.value.trim()) {
          validateSignUpField('signUpConfirmPassword');
        }
      });

      fieldElement.addEventListener('blur', function () {
        validateSignUpField(fieldElement.id);
      });
    });

    signUpForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const isFirstNameValid = validateSignUpField('signUpFirstName');
      const isLastNameValid = validateSignUpField('signUpLastName');
      const isEmailValid = validateSignUpField('signUpEmail');
      const isPasswordValid = validateSignUpField('signUpPassword');
      const isConfirmPasswordValid = validateSignUpField('signUpConfirmPassword');
      const formIsValid = isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;

      if (!formIsValid) {
        setSignUpFormStatus('error', 'Please fix the highlighted fields before creating your account.');

        const firstInvalidField = signUpForm.querySelector('input.error');

        if (firstInvalidField) {
          firstInvalidField.focus();
        }

        return;
      }

      setSignUpFormStatus('success', 'Account created successfully. Redirecting to your trips...');
      window.TravelWebsiteUtils.showToast('Account created successfully! Welcome, ' + signUpFirstName.value.trim() + '!');
      signUpForm.reset();
      [signUpFirstName, signUpLastName, signUpEmail, signUpPassword, signUpConfirmPassword].forEach(function (fieldElement) {
        const feedbackElement = document.getElementById(fieldElement.id + 'Feedback');
        setSignUpFieldState(fieldElement, feedbackElement, '', '');
      });
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
          return '';
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
      onSubmit: function (state) {
        if (!window.TravelWebsiteUtils) {
          return;
        }

        if (!state.query) {
          window.TravelWebsiteUtils.showToast('Type an itinerary, destination, hotel, or airline to search your booked trips.');
          state.inputElement.focus();
          return;
        }

        window.TravelWebsiteUtils.showToast('Booked trips updated for “' + state.query + '”.');
      }
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