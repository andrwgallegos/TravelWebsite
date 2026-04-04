const hamburgerButton = document.getElementById('hamburgerButton');
const mobileNav = document.getElementById('mobileNav');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

const faqQuestions = document.querySelectorAll('.faq-question');
const helpSearchForm = document.getElementById('helpSearchForm');
const helpSearchInput = document.getElementById('helpSearchInput');

// Closes the mobile navigation menu
function closeMobileMenu() {
  if (mobileNav) {
    mobileNav.classList.remove('show');
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.classList.remove('show');
  }
}

// Opens or closes the mobile menu
function toggleMobileMenu() {
  if (mobileNav) {
    mobileNav.classList.toggle('show');
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.classList.toggle('show');
  }
}

if (hamburgerButton && mobileNav && mobileMenuOverlay) {
  hamburgerButton.addEventListener('click', toggleMobileMenu);
  mobileMenuOverlay.addEventListener('click', closeMobileMenu);

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });
}

// SIGN IN MODAL ELEMENTS
const signInModal = document.getElementById('signInModal');
const closeSignInModal = document.getElementById('closeSignInModal');
const signInSubmit = document.getElementById('signInSubmit');
const signUpSubmit = document.getElementById('signUpSubmit');

// EXISTING BUTTONS
const desktopSignInButton = document.getElementById('desktopSignInButton');
const mobileSignInButton = document.getElementById('mobileSignInButton');

// OPEN MODAL
function openSignInModal() {
  if (signInModal) {
    signInModal.classList.remove('hidden');
  }
}

// CLOSE MODAL
function closeSignInModalFn() {
  if (signInModal) {
    signInModal.classList.add('hidden');
  }
}

// ATTACH EVENTS TO NAV BUTTONS
if (desktopSignInButton) {
  desktopSignInButton.addEventListener('click', openSignInModal);
}

if (mobileSignInButton) {
  mobileSignInButton.addEventListener('click', openSignInModal);
}

// CLOSE BUTTON
if (closeSignInModal) {
  closeSignInModal.addEventListener('click', closeSignInModalFn);
}

// CLICK OUTSIDE CLOSES MODAL
if (signInModal) {
  signInModal.addEventListener('click', (e) => {
    if (e.target === signInModal) {
      closeSignInModalFn();
    }
  });
}

// SIGN IN / SIGN UP → GO TO TRIPS
if (signInSubmit) {
  signInSubmit.addEventListener('click', () => {
    window.location.href = "../Trips/index.html";
  });
}

if (signUpSubmit) {
  signUpSubmit.addEventListener('click', () => {
    window.location.href = "../Trips/index.html";
  });
}

// Toggle each FAQ answer
faqQuestions.forEach((question) => {
  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    if (answer) {
      answer.classList.toggle('show');
    }
  });
});

// Prevent refresh for prototype search
if (helpSearchForm && helpSearchInput) {
  helpSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const searchTerm = helpSearchInput.value.trim();

    if (searchTerm) {
      alert(`Searching for: ${searchTerm}`);
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMobileMenu();
  }
});