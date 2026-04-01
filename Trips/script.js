// =========================
// MOBILE NAVIGATION
// Reuses the same shared behavior your teammate already set up
// =========================
const hamburgerButton = document.getElementById('hamburgerButton');
const mobileNav = document.getElementById('mobileNav');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

// Closes the mobile menu
function closeMobileMenu() {
  mobileNav.classList.remove('show');
  mobileMenuOverlay.classList.remove('show');
}

// Opens or closes the mobile menu
function toggleMobileMenu() {
  mobileNav.classList.toggle('show');
  mobileMenuOverlay.classList.toggle('show');
}

// Open or close menu when hamburger is clicked
hamburgerButton.addEventListener('click', toggleMobileMenu);

// Close menu when the dark overlay is clicked
mobileMenuOverlay.addEventListener('click', closeMobileMenu);

// Close menu after a mobile nav link is clicked
mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});

// =========================
// SIGN-IN MODAL
// Handles showing and hiding the sign-up prompt
// =========================
const openSignInDesktop = document.getElementById('openSignInDesktop');
const openSignInMobile = document.getElementById('openSignInMobile');
const signInModal = document.getElementById('signInModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalLink = document.getElementById('closeModalLink');

// Opens the modal and overlay together
function openModal() {
  signInModal.classList.add('show');
  modalOverlay.classList.add('show');
  closeMobileMenu();
}

// Closes the modal and overlay together
function closeModal() {
  signInModal.classList.remove('show');
  modalOverlay.classList.remove('show');
}

openSignInDesktop.addEventListener('click', openModal);
openSignInMobile.addEventListener('click', openModal);
modalOverlay.addEventListener('click', closeModal);
closeModalLink.addEventListener('click', closeModal);

// =========================
// SIGN-UP FORM
// Simple prototype validation before “success” behavior
// =========================
const signUpForm = document.getElementById('signUpForm');
const firstName = document.getElementById('firstName');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

signUpForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match.');
    return;
  }

  if (password.value.length < 6) {
    alert('Password must be at least 6 characters long.');
    return;
  }

  alert(`Account created successfully! Welcome, ${firstName.value}!`);
  closeModal();
});

// =========================
// TRIPS TAB SWITCHING
// Shows one panel at a time
// =========================
const tripTabs = document.querySelectorAll('.trip-tab');
const bookedPanel = document.getElementById('bookedPanel');
const savedPanel = document.getElementById('savedPanel');
const createPanel = document.getElementById('createPanel');

// Hides every panel and removes active tab state
function resetTripPanels() {
  tripTabs.forEach((tab) => tab.classList.remove('active'));
  bookedPanel.classList.remove('active-panel');
  bookedPanel.classList.add('hidden-panel');
  savedPanel.classList.remove('active-panel');
  savedPanel.classList.add('hidden-panel');
  createPanel.classList.remove('active-panel');
  createPanel.classList.add('hidden-panel');
}

// Shows the matching panel for the clicked tab
tripTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    resetTripPanels();
    tab.classList.add('active');

    const selectedTab = tab.dataset.tab;

    if (selectedTab === 'booked') {
      bookedPanel.classList.add('active-panel');
      bookedPanel.classList.remove('hidden-panel');
    } else if (selectedTab === 'saved') {
      savedPanel.classList.add('active-panel');
      savedPanel.classList.remove('hidden-panel');
    } else if (selectedTab === 'create') {
      createPanel.classList.add('active-panel');
      createPanel.classList.remove('hidden-panel');
    }
  });
});

// =========================
// ADS CAROUSEL
// Moves the row of ads left and right
// =========================
const adsContainer = document.getElementById('adsContainer');
const prevAd = document.getElementById('prevAd');
const nextAd = document.getElementById('nextAd');

let currentAdIndex = 0;
const adItems = document.querySelectorAll('.ad-item');

// Number of visible ads depends on screen width
function getVisibleAds() {
  if (window.innerWidth >= 1100) return 5;
  if (window.innerWidth >= 700) return 3;
  return 1;
}

// Moves the carousel based on the current index
function updateAdDisplay() {
  const adWidth = 184; // Approx image width + gap space
  const offset = -(currentAdIndex * adWidth);
  adsContainer.style.transform = `translateX(${offset}px)`;
}

// Move left only if not already at the start
prevAd.addEventListener('click', () => {
  if (currentAdIndex > 0) {
    currentAdIndex--;
    updateAdDisplay();
  }
});

// Move right only if there are more hidden ads ahead
nextAd.addEventListener('click', () => {
  const maxIndex = adItems.length - getVisibleAds();
  if (currentAdIndex < maxIndex) {
    currentAdIndex++;
    updateAdDisplay();
  }
});

// Recalculate ad position if screen size changes
window.addEventListener('resize', updateAdDisplay);

// =========================
// TRIP SEARCH FORM
// Keeps the prototype from refreshing and shows placeholder feedback
// =========================
const tripSearchForm = document.getElementById('tripSearchForm');
const tripSearchInput = document.getElementById('tripSearchInput');

tripSearchForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const searchTerm = tripSearchInput.value.trim();

  if (searchTerm) {
    alert(`Searching itinerary: ${searchTerm}`);
  }
});