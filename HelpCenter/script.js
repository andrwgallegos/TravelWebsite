document.addEventListener('DOMContentLoaded', function () {

  /* =========================================================
     MOBILE NAVIGATION
     ========================================================= */

  const hamburgerButton = document.getElementById('hamburgerButton');
  const mobileNav = document.getElementById('mobileNav');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

  function openMobileMenu() {
    if (mobileNav) {
      mobileNav.classList.add('show');
      mobileNav.style.animation = "slideIn 0.25s ease forwards";
    }

    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.add('show');
    }

    if (hamburgerButton) {
      hamburgerButton.setAttribute('aria-expanded', 'true');
    }
  }

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

  function toggleMobileMenu() {
    if (!mobileNav) return;

    if (mobileNav.classList.contains('show')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

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

  const signInModal = document.getElementById('signInModal');
  const closeSignInModal = document.getElementById('closeSignInModal');
  const signInSubmit = document.getElementById('signInSubmit');
  const signUpSubmit = document.getElementById('signUpSubmit');

  const desktopSignInButton = document.getElementById('desktopSignInButton');
  const mobileSignInButton = document.getElementById('mobileSignInButton');

  function openSignInModal() {
    if (signInModal) {
      signInModal.classList.remove('hidden');
      signInModal.style.opacity = "0";
      signInModal.style.transform = "scale(0.95)";

      requestAnimationFrame(() => {
        signInModal.style.transition = "0.2s ease";
        signInModal.style.opacity = "1";
        signInModal.style.transform = "scale(1)";
      });

      signInModal.setAttribute('aria-hidden', 'false');
    }

    closeMobileMenu();
  }

  function closeSignInModalFn() {
    if (signInModal) {
      signInModal.classList.add('hidden');
      signInModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (desktopSignInButton) {
    desktopSignInButton.addEventListener('click', openSignInModal);
  }

  if (mobileSignInButton) {
    mobileSignInButton.addEventListener('click', openSignInModal);
  }

  if (closeSignInModal) {
    closeSignInModal.addEventListener('click', closeSignInModalFn);
  }

  if (signInModal) {
    signInModal.addEventListener('click', function (event) {
      if (event.target === signInModal) {
        closeSignInModalFn();
      }
    });
  }

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
     FAQ TOGGLE (IMPROVED SMOOTH ANIMATION)
     ========================================================= */

  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(function (question) {
    question.addEventListener('click', function () {

      const answer = question.nextElementSibling;
      const faqItem = question.parentElement;

      if (!answer) return;

      const isOpen = answer.classList.contains('show');

      answer.classList.toggle('show');
      question.setAttribute('aria-expanded', String(!isOpen));

      if (!isOpen) {
        faqItem.style.transform = "translateY(-2px)";
      } else {
        faqItem.style.transform = "translateY(0)";
      }
    });
  });

  /* =========================================================
     SEARCH (UNCHANGED - YOUR GROUP CODE)
     ========================================================= */

  const helpSearchForm = document.getElementById('helpSearchForm');
  const helpSearchInput = document.getElementById('helpSearchInput');
  const faqSection = document.querySelector('.faq-section');
  const faqCategories = Array.from(document.querySelectorAll('.faq-category'));
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));

  function closeFaqItem(faqItem) {
    const question = faqItem.querySelector('.faq-question');
    const answer = faqItem.querySelector('.faq-answer');

    if (answer) answer.classList.remove('show');
    if (question) question.setAttribute('aria-expanded', 'false');
  }

  function openFaqItem(faqItem) {
    const question = faqItem.querySelector('.faq-question');
    const answer = faqItem.querySelector('.faq-answer');

    if (answer) answer.classList.add('show');
    if (question) question.setAttribute('aria-expanded', 'true');
  }

  if (window.TravelWebsiteUtils && helpSearchForm && helpSearchInput && faqSection && faqItems.length) {
    window.TravelWebsiteUtils.initLiveSearch({
      formElement: helpSearchForm,
      inputElement: helpSearchInput,
      itemElements: faqItems,
      noResultsMount: faqSection,
      getItemData: function (faqItem) {
        const questionElement = faqItem.querySelector('.faq-question');
        const answerElement = faqItem.querySelector('.faq-answer');
        const category = faqItem.closest('.faq-category');
        const categoryTitleElement = category ? category.querySelector('.category-title') : null;

        return {
          title: questionElement ? questionElement.textContent.trim() : '',
          subtitle: categoryTitleElement ? categoryTitleElement.textContent.trim() : '',
          suggestionMeta: categoryTitleElement ? categoryTitleElement.textContent.trim() : '',
          searchValue: questionElement ? questionElement.textContent.trim() : '',
          searchText: [
            questionElement ? questionElement.textContent : '',
            answerElement ? answerElement.textContent : '',
            categoryTitleElement ? categoryTitleElement.textContent : ''
          ].join(' ')
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

      setItemVisibility: function (faqItem, shouldShow) {
        faqItem.style.display = shouldShow ? '' : 'none';
      },

      afterFilter: function (state) {
        const searchIsActive = Boolean(state.query);

        faqCategories.forEach(function (faqCategory) {
          const categoryItems = Array.from(faqCategory.querySelectorAll('.faq-item'));

          const visibleItems = categoryItems.filter(function (faqItem) {
            return faqItem.style.display !== 'none';
          });

          faqCategory.style.display = visibleItems.length ? '' : 'none';

          categoryItems.forEach(function (faqItem) {
            if (!searchIsActive) {
              closeFaqItem(faqItem);
            } else if (faqItem.style.display !== 'none') {
              openFaqItem(faqItem);
            }
          });
        });
      },

      onSubmit: function () {}
    });
  }

  /* =========================================================
     ESC KEY
     ========================================================= */

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMobileMenu();
      closeSignInModalFn();
    }
  });

});
