// Get the elements needed for the mobile menu behavior
const hamburgerButton = document.getElementById('hamburgerButton');
const mobileNav = document.getElementById('mobileNav');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

// Closes the mobile navigation menu
function closeMobileMenu() {
  mobileNav.classList.remove('show');
  mobileMenuOverlay.classList.remove('show');
}

// Opens or closes the mobile menu depending on its current state
function toggleMobileMenu() {
  mobileNav.classList.toggle('show');
  mobileMenuOverlay.classList.toggle('show');
}

// Open or close menu when hamburger is clicked
hamburgerButton.addEventListener('click', toggleMobileMenu);

// Close menu when the dark overlay is clicked
mobileMenuOverlay.addEventListener('click', closeMobileMenu);

// Close menu after clicking one of the mobile navigation links
mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});