const hamburgerButton = document.getElementById('hamburgerButton');
const mobileNav = document.getElementById('mobileNav');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const desktopSignInButton = document.getElementById('desktopSignInButton');
const mobileSignInButton = document.getElementById('mobileSignInButton');

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

// Simple prototype sign-in behavior
function handleSignInClick() {
  closeMobileMenu();
  alert('Sign in flow is not implemented in this prototype.');
}

if (desktopSignInButton) {
  desktopSignInButton.addEventListener('click', handleSignInClick);
}

if (mobileSignInButton) {
  mobileSignInButton.addEventListener('click', handleSignInClick);
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