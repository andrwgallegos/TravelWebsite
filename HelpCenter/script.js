// Get the elements needed for the mobile menu behavior
const hamburgerButton = document.getElementById('hamburgerButton');
const mobileNav = document.getElementById('mobileNav');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

// Get FAQ question buttons
const faqQuestions = document.querySelectorAll('.faq-question');

// Get the help search form and input
const helpSearchForm = document.getElementById('helpSearchForm');
const helpSearchInput = document.getElementById('helpSearchInput');

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

// Toggle each FAQ answer when its question is clicked
faqQuestions.forEach((question) => {
  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    answer.classList.toggle('show');
  });
});

// Prevent the form from refreshing the page for now
helpSearchForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // Simple placeholder behavior for prototype purposes
  const searchTerm = helpSearchInput.value.trim();

  if (searchTerm) {
    alert(`Searching for: ${searchTerm}`);
  }
});