// =========================
// MOBILE NAVIGATION
// Same shared nav behavior used on your other pages
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

// Guard clauses prevent errors if elements are missing
if (hamburgerButton && mobileNav && mobileMenuOverlay) {
  hamburgerButton.addEventListener('click', toggleMobileMenu);
  mobileMenuOverlay.addEventListener('click', closeMobileMenu);

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });
}

// =========================
// FORM VALIDATION + INTERACTIONS
// =========================
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('checkoutForm');
  const errorBanner = document.getElementById('errorBanner');
  const successModal = document.getElementById('successModal');
  const closeSuccessModal = document.getElementById('closeSuccessModal');
  const paymentMethods = document.querySelectorAll('.payment-method');
  const cardDetailsForm = document.getElementById('cardDetailsForm');

  // =========================
  // PAYMENT METHOD TOGGLE
  // Only show full card fields when "Card" is selected
  // =========================
  paymentMethods.forEach((method) => {
    method.addEventListener('click', function () {
      paymentMethods.forEach((m) => m.classList.remove('selected'));
      this.classList.add('selected');

      const selectedMethod = this.getAttribute('data-method');

      if (selectedMethod === 'card') {
        cardDetailsForm.style.display = 'block';
      } else {
        cardDetailsForm.style.display = 'none';
      }
    });
  });

  // =========================
  // CARD NUMBER FORMATTING
  // Adds spaces every 4 digits
  // =========================
  const cardNumberInput = document.getElementById('cardNumber');

  cardNumberInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
  });

  // =========================
  // EXPIRATION DATE FORMATTING
  // Converts 0326 into 03/26 while typing
  // =========================
  const expirationInput = document.getElementById('expirationDate');

  expirationInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }

    e.target.value = value;
  });

  // =========================
  // ONLY ALLOW NUMBERS
  // Security code and phone should stay numeric
  // =========================
  const securityCodeInput = document.getElementById('securityCode');
  const phoneNumberInput = document.getElementById('phoneNumber');
  const billingZipInput = document.getElementById('billingZip');

  securityCodeInput.addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  phoneNumberInput.addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  billingZipInput.addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  // =========================
  // VALIDATION HELPERS
  // =========================
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validateCardNumber(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return cleanNumber.length >= 13 && cleanNumber.length <= 19;
  }

  function validateExpirationDate(expDate) {
    const parts = expDate.split('/');

    if (parts.length !== 2) return false;

    const month = parseInt(parts[0], 10);
    const year = parseInt('20' + parts[1], 10);

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const expiry = new Date(year, month - 1);

    return expiry > now;
  }

  function validateSecurityCode(code) {
    return code.length >= 3 && code.length <= 4;
  }

  function validateZipCode(zip) {
    return zip.length >= 5;
  }

  // =========================
  // ERROR HANDLING HELPERS
  // =========================
  function showError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (input) {
      input.classList.add('error');
    }

    if (error) {
      error.style.display = 'block';
    }
  }

  // Clear error styling while user types
  const inputs = form.querySelectorAll('input, select');

  inputs.forEach((input) => {
    input.addEventListener('input', function () {
      this.classList.remove('error');
      const errorId = this.id + 'Error';
      const errorElement = document.getElementById(errorId);

      if (errorElement) {
        errorElement.style.display = 'none';
      }
    });
  });

  // =========================
  // SUCCESS MODAL HELPERS
  // =========================
  function openSuccessModal() {
    successModal.classList.remove('hidden');
    successModal.setAttribute('aria-hidden', 'false');
  }

  function closeSuccessModalFn() {
    successModal.classList.add('hidden');
    successModal.setAttribute('aria-hidden', 'true');
  }

  // =========================
  // FORM SUBMISSION
  // =========================
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let hasErrors = false;

    // Reset previous errors before validating again
    errorBanner.classList.add('hidden');
    document.querySelectorAll('.error-message').forEach((el) => {
      el.style.display = 'none';
    });
    document.querySelectorAll('.form-input, .form-select').forEach((el) => {
      el.classList.remove('error');
    });

    // First name validation
    const firstName = document.getElementById('firstName').value.trim();
    if (!firstName) {
      showError('firstName', 'firstNameError');
      hasErrors = true;
    }

    // Last name validation
    const lastName = document.getElementById('lastName').value.trim();
    if (!lastName) {
      showError('lastName', 'lastNameError');
      hasErrors = true;
    }

    // Email validation
    const email = document.getElementById('email').value.trim();
    if (!email || !validateEmail(email)) {
      showError('email', 'emailError');
      hasErrors = true;
    }

    // Phone number validation
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    if (!phoneNumber) {
      showError('phoneNumber', 'phoneNumberError');
      hasErrors = true;
    }

    // Only validate card details if "Card" is selected
    const selectedPaymentMethod = document
      .querySelector('.payment-method.selected')
      .getAttribute('data-method');

    if (selectedPaymentMethod === 'card') {
      const cardNumber = document.getElementById('cardNumber').value.trim();
      if (!cardNumber || !validateCardNumber(cardNumber)) {
        showError('cardNumber', 'cardNumberError');
        hasErrors = true;
      }

      const expirationDate = document.getElementById('expirationDate').value.trim();
      if (!expirationDate || !validateExpirationDate(expirationDate)) {
        showError('expirationDate', 'expirationDateError');
        hasErrors = true;
      }

      const securityCode = document.getElementById('securityCode').value.trim();
      if (!securityCode || !validateSecurityCode(securityCode)) {
        showError('securityCode', 'securityCodeError');
        hasErrors = true;
      }

      const billingZip = document.getElementById('billingZip').value.trim();
      if (!billingZip || !validateZipCode(billingZip)) {
        showError('billingZip', 'billingZipError');
        hasErrors = true;
      }
    }

    // If validation fails, show banner and scroll up
    if (hasErrors) {
      errorBanner.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      openSuccessModal();
    }
  });

  // Allow user to close modal by clicking backdrop or close button
  if (closeSuccessModal) {
    closeSuccessModal.addEventListener('click', closeSuccessModalFn);
  }

  successModal.addEventListener('click', function (e) {
    if (e.target === successModal) {
      closeSuccessModalFn();
    }
  });

  // Escape closes success modal or mobile menu
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeSuccessModalFn();
      closeMobileMenu();
    }
  });

  // Edit button scrolls back to top of form
  const editButton = document.querySelector('.btn-edit');

  if (editButton) {
    editButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.getElementById('firstName').focus();
    });
  }

  // Placeholder interaction for special requests
  const specialRequests = document.querySelector('.special-requests');

  if (specialRequests) {
    specialRequests.addEventListener('click', function () {
      alert('Special requests feature would open here.');
    });
  }
});