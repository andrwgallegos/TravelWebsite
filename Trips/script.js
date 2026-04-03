// =========================
// MOBILE NAVIGATION
// Shared mobile menu logic
// =========================
const hamburgerButton = document.getElementById('hamburgerButton');
const mobileNav = document.getElementById('mobileNav');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

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

// Guard clauses prevent errors if a shared nav element is missing
if (hamburgerButton && mobileNav && mobileMenuOverlay) {
  hamburgerButton.addEventListener('click', toggleMobileMenu);
  mobileMenuOverlay.addEventListener('click', closeMobileMenu);

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });
}

// =========================
// SIGN-IN MODAL
// Handles showing and hiding the sign-up prompt
// =========================
const openSignInDesktop = document.getElementById('openSignInDesktop');
const openSignInMobile = document.getElementById('openSignInMobile');
const signInModal = document.getElementById('signInModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalLink = document.getElementById('closeModalLink');
const closeModalButton = document.getElementById('closeModalButton');

// Opens the modal and overlay together
function openModal() {
  if (signInModal) {
    signInModal.classList.add('show');
    signInModal.setAttribute('aria-hidden', 'false');
  }

  if (modalOverlay) {
    modalOverlay.classList.add('show');
  }

  closeMobileMenu();
}

// Closes the modal and overlay together
function closeModal() {
  if (signInModal) {
    signInModal.classList.remove('show');
    signInModal.setAttribute('aria-hidden', 'true');
  }

  if (modalOverlay) {
    modalOverlay.classList.remove('show');
  }
}

if (openSignInDesktop) {
  openSignInDesktop.addEventListener('click', openModal);
}

if (openSignInMobile) {
  openSignInMobile.addEventListener('click', openModal);
}

if (modalOverlay) {
  modalOverlay.addEventListener('click', closeModal);
}

if (closeModalLink) {
  closeModalLink.addEventListener('click', closeModal);
}

if (closeModalButton) {
  closeModalButton.addEventListener('click', closeModal);
}

// Allow Escape key to close modal/menu
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
    closeMobileMenu();
  }
});

// =========================
// SIGN-UP FORM
// Simple prototype validation before “success” behavior
// =========================
const signUpForm = document.getElementById('signUpForm');
const firstName = document.getElementById('firstName');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

if (signUpForm && firstName && password && confirmPassword) {
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
}

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

  if (bookedPanel) {
    bookedPanel.classList.remove('active-panel');
    bookedPanel.classList.add('hidden-panel');
  }

  if (savedPanel) {
    savedPanel.classList.remove('active-panel');
    savedPanel.classList.add('hidden-panel');
  }

  if (createPanel) {
    createPanel.classList.remove('active-panel');
    createPanel.classList.add('hidden-panel');
  }
}

// Shows the matching panel for the clicked tab
tripTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    resetTripPanels();
    tab.classList.add('active');

    const selectedTab = tab.dataset.tab;

    if (selectedTab === 'booked' && bookedPanel) {
      bookedPanel.classList.add('active-panel');
      bookedPanel.classList.remove('hidden-panel');
    } else if (selectedTab === 'saved' && savedPanel) {
      savedPanel.classList.add('active-panel');
      savedPanel.classList.remove('hidden-panel');
    } else if (selectedTab === 'create' && createPanel) {
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
const adItems = document.querySelectorAll('.ad-item');

let currentAdIndex = 0;

// Number of visible ads depends on screen width
function getVisibleAds() {
  if (window.innerWidth >= 1100) return 5;
  if (window.innerWidth >= 700) return 3;
  return 1;
}

// Moves the carousel based on the current index
function updateAdDisplay() {
  if (!adsContainer) return;

  const adWidth = 184; // Approx image width + gap space
  const maxIndex = Math.max(0, adItems.length - getVisibleAds());

  if (currentAdIndex > maxIndex) {
    currentAdIndex = maxIndex;
  }

  const offset = -(currentAdIndex * adWidth);
  adsContainer.style.transform = `translateX(${offset}px)`;
}

// Move left only if not already at the start
if (prevAd) {
  prevAd.addEventListener('click', () => {
    if (currentAdIndex > 0) {
      currentAdIndex--;
      updateAdDisplay();
    }
  });
}

// Move right only if there are more hidden ads ahead
if (nextAd) {
  nextAd.addEventListener('click', () => {
    const maxIndex = Math.max(0, adItems.length - getVisibleAds());

    if (currentAdIndex < maxIndex) {
      currentAdIndex++;
      updateAdDisplay();
    }
  });
}

// Recalculate ad position if screen size changes
window.addEventListener('resize', updateAdDisplay);

// =========================
// TRIP SEARCH FORM
// Keeps the prototype from refreshing and shows placeholder feedback
// =========================
const tripSearchForm = document.getElementById('tripSearchForm');
const tripSearchInput = document.getElementById('tripSearchInput');

if (tripSearchForm && tripSearchInput) {
  tripSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const searchTerm = tripSearchInput.value.trim();

    if (searchTerm) {
      alert(`Searching itinerary: ${searchTerm}`);
    }
  });
}

// Initialize carousel position on load
updateAdDisplay();