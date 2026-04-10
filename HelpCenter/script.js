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
     LIVE HELP TOPIC SEARCH
     Filters FAQ topics in real time, shows suggestions,
     and expands visible answers while searching.
     ========================================================= */

  const helpSearchForm = document.getElementById('helpSearchForm');
  const helpSearchInput = document.getElementById('helpSearchInput');
  const faqSection = document.querySelector('.faq-section');
  const faqCategories = Array.from(document.querySelectorAll('.faq-category'));
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));

  // Closes one FAQ item so the page can cleanly reset after a search is cleared.
  function closeFaqItem(faqItem) {
    const question = faqItem.querySelector('.faq-question');
    const answer = faqItem.querySelector('.faq-answer');

    if (answer) {
      answer.classList.remove('show');
    }

    if (question) {
      question.setAttribute('aria-expanded', 'false');
    }
  }

  // Opens one FAQ item so matching results are easier to scan.
  function openFaqItem(faqItem) {
    const question = faqItem.querySelector('.faq-question');
    const answer = faqItem.querySelector('.faq-answer');

    if (answer) {
      answer.classList.add('show');
    }

    if (question) {
      question.setAttribute('aria-expanded', 'true');
    }
  }

  if (window.TravelWebsiteUtils && helpSearchForm && helpSearchInput && faqSection && faqItems.length) {
    window.TravelWebsiteUtils.initLiveSearch({
      formElement: helpSearchForm,
      inputElement: helpSearchInput,
      itemElements: faqItems,
      noResultsMount: faqSection,

      // Each FAQ item is indexed with its question, answer, and category name.
      getItemData: function (faqItem) {
        const questionElement = faqItem.querySelector('.faq-question');
        const answerElement = faqItem.querySelector('.faq-answer');
        const category = faqItem.closest('.faq-category');
        const categoryTitleElement = category ? category.querySelector('.category-title') : null;
        const question = questionElement ? questionElement.textContent.trim() : '';
        const answer = answerElement ? answerElement.textContent.trim() : '';
        const categoryTitle = categoryTitleElement ? categoryTitleElement.textContent.trim() : '';

        return {
          title: question,
          subtitle: categoryTitle,
          suggestionMeta: categoryTitle,
          searchValue: question,
          searchText: [question, answer, categoryTitle].join(' ')
        };
      },

      getStatusText: function (state) {
        if (!state.query) {
          return 'Showing all ' + state.totalCount + ' help topics.';
        }

        return (
          'Showing ' +
          state.matchCount +
          ' ' +
          (state.matchCount === 1 ? 'help topic' : 'help topics') +
          ' for “' +
          state.query +
          '”.'
        );
      },

      noResultsTitle: 'No help topics matched your search',
      noResultsDescription: 'Try another keyword such as refund, booking, payment, passport, or itinerary.',

      // FAQ search hides non-matching items and then rebalances the category layout.
      setItemVisibility: function (faqItem, shouldShow) {
        faqItem.style.display = shouldShow ? '' : 'none';
      },

      afterFilter: function (state) {
        const searchIsActive = Boolean(state.query);

        // Show only categories that still contain at least one visible FAQ item.
        faqCategories.forEach(function (faqCategory) {
          const categoryItems = Array.from(faqCategory.querySelectorAll('.faq-item'));
          const visibleItems = categoryItems.filter(function (faqItem) {
            return faqItem.style.display !== 'none';
          });

          faqCategory.style.display = visibleItems.length ? '' : 'none';

          categoryItems.forEach(function (faqItem) {
            if (!searchIsActive) {
              closeFaqItem(faqItem);
              return;
            }

            if (faqItem.style.display !== 'none') {
              openFaqItem(faqItem);
            }
          });
        });
      },

      // Help Center search stays client-side, so submit only refreshes the current filter state.
      onSubmit: function () {}
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