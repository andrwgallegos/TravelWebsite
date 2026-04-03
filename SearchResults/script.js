// =========================
// MOBILE NAVIGATION
// Shared mobile menu behavior
// =========================
const hamburgerButton = document.getElementById('hamburgerButton');
const mobileNav = document.getElementById('mobileNav');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const desktopSignInButton = document.getElementById('desktopSignInButton');
const mobileSignInButton = document.getElementById('mobileSignInButton');

// Closes the mobile menu
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

// Open or close menu when hamburger is clicked
if (hamburgerButton && mobileNav && mobileMenuOverlay) {
  hamburgerButton.addEventListener('click', toggleMobileMenu);
  mobileMenuOverlay.addEventListener('click', closeMobileMenu);

  // Close menu after clicking one of the mobile navigation links
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });
}

// Placeholder sign-in behavior so the button does not feel broken
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

// Escape key closes mobile menu
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMobileMenu();
  }
});