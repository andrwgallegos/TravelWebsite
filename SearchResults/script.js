const hamburgerButton = document.getElementById('hamburgerButton');
const mobileNav = document.getElementById('mobileNav');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

function closeMobileMenu() {
  mobileNav.classList.remove('show');
  mobileMenuOverlay.classList.remove('show');
}

function toggleMobileMenu() {
  mobileNav.classList.toggle('show');
  mobileMenuOverlay.classList.toggle('show');
}

hamburgerButton.addEventListener('click', toggleMobileMenu);
mobileMenuOverlay.addEventListener('click', closeMobileMenu);

mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});