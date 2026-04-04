document.addEventListener('DOMContentLoaded', function () {
  /* =========================================================
     MOBILE NAVIGATION
     ========================================================= */

  // Main mobile menu elements
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

  // Opens or closes the mobile menu depending on its current state
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

  // Modal elements
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

    // If the user opened sign in from the mobile menu,
    // close the menu so the screen stays clean
    closeMobileMenu();
  }

  // Closes the modal
  function closeSignInModalFn() {
    if (signInModal) {
      signInModal.classList.add('hidden');
      signInModal.setAttribute('aria-hidden', 'true');
    }
  }

  // Attach modal open events
  if (desktopSignInButton) {
    desktopSignInButton.addEventListener('click', openSignInModal);
  }

  if (mobileSignInButton) {
    mobileSignInButton.addEventListener('click', openSignInModal);
  }

  // Close modal with the X button
  if (closeSignInModal) {
    closeSignInModal.addEventListener('click', closeSignInModalFn);
  }

  // Close modal when clicking outside the modal box
  if (signInModal) {
    signInModal.addEventListener('click', function (event) {
      if (event.target === signInModal) {
        closeSignInModalFn();
      }
    });
  }

  // Prototype behavior: both buttons send the user to Trips
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
     FAQ TOGGLE BEHAVIOR
     ========================================================= */

  const faqQuestions = document.querySelectorAll('.faq-question');

  // Toggle each answer open/closed when its question is clicked
  faqQuestions.forEach(function (question) {
    question.addEventListener('click', function () {
      const answer = question.nextElementSibling;

      if (answer) {
        const isOpen = answer.classList.contains('show');

        answer.classList.toggle('show');
        question.setAttribute('aria-expanded', String(!isOpen));
      }
    });
  });

  /* =========================================================
     HELP SEARCH FORM
     ========================================================= */

  const helpSearchForm = document.getElementById('helpSearchForm');
  const helpSearchInput = document.getElementById('helpSearchInput');

  // Prevent a real page refresh because this is a prototype
  if (helpSearchForm && helpSearchInput) {
    helpSearchForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const searchTerm = helpSearchInput.value.trim();

      if (searchTerm) {
        alert('Searching for: ' + searchTerm);
      }
    });
  }

  /* =========================================================
     GLOBAL KEYBOARD SHORTCUTS
     ========================================================= */

  // Escape key closes open overlays
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMobileMenu();
      closeSignInModalFn();
    }
  });
});