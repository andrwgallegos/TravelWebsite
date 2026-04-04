document.addEventListener('DOMContentLoaded', function () {
  /* =========================================================
     MOBILE NAVIGATION
     ========================================================= */

  // Main mobile navigation elements
  const hamburgerButton = document.getElementById('hamburgerButton');
  const mobileNav = document.getElementById('mobileNav');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

  // Opens the mobile menu
  function openMobileMenu() {
    if (mobileNav) {
      mobileNav.classList.add('show');
    }

    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.add('show');
    }

    if (hamburgerButton) {
      hamburgerButton.setAttribute('aria-expanded', 'true');
    }
  }

  // Closes the mobile menu
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

  // Toggles the mobile menu open/closed
  function toggleMobileMenu() {
    if (!mobileNav) {
      return;
    }

    if (mobileNav.classList.contains('show')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  // Attach mobile menu events
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

  // Sign in modal elements
  const signInModal = document.getElementById('signInModal');
  const closeSignInModal = document.getElementById('closeSignInModal');
  const signInSubmit = document.getElementById('signInSubmit');
  const signUpSubmit = document.getElementById('signUpSubmit');
  const desktopSignInButton = document.getElementById('desktopSignInButton');
  const mobileSignInButton = document.getElementById('mobileSignInButton');

  // Opens the sign in modal
  function openSignInModal() {
    if (signInModal) {
      signInModal.classList.remove('hidden');
      signInModal.setAttribute('aria-hidden', 'false');
    }

    // Close the mobile menu if sign in was opened from mobile navigation
    closeMobileMenu();
  }

  // Closes the sign in modal
  function closeSignInModalFn() {
    if (signInModal) {
      signInModal.classList.add('hidden');
      signInModal.setAttribute('aria-hidden', 'true');
    }
  }

  // Open modal from desktop sign in button
  if (desktopSignInButton) {
    desktopSignInButton.addEventListener('click', openSignInModal);
  }

  // Open modal from mobile sign in button
  if (mobileSignInButton) {
    mobileSignInButton.addEventListener('click', openSignInModal);
  }

  // Close modal from X button
  if (closeSignInModal) {
    closeSignInModal.addEventListener('click', closeSignInModalFn);
  }

  // Close modal when clicking the dark background
  if (signInModal) {
    signInModal.addEventListener('click', function (event) {
      if (event.target === signInModal) {
        closeSignInModalFn();
      }
    });
  }

  // Demo prototype behavior:
  // for now, both buttons send the user to the Trips page
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
     CHECKOUT FORM + BOOKING SUCCESS MODAL
     ========================================================= */

  // Form and checkout elements
  const form = document.getElementById('checkoutForm');
  const errorBanner = document.getElementById('errorBanner');
  const successModal = document.getElementById('successModal');
  const closeSuccessModal = document.getElementById('closeSuccessModal');
  const paymentMethods = document.querySelectorAll('.payment-method');
  const cardDetailsForm = document.getElementById('cardDetailsForm');

  // If the form is missing, stop here
  if (!form) {
    return;
  }

  /* =========================================================
     PAYMENT METHOD SWITCHING
     ========================================================= */

  // When a payment option is clicked, highlight it.
  // Only "Card" shows the credit card fields.
  paymentMethods.forEach(function (method) {
    method.addEventListener('click', function () {
      paymentMethods.forEach(function (button) {
        button.classList.remove('selected');
      });

      this.classList.add('selected');

      const selectedMethod = this.getAttribute('data-method');

      if (cardDetailsForm) {
        if (selectedMethod === 'card') {
          cardDetailsForm.style.display = 'block';
        } else {
          cardDetailsForm.style.display = 'none';
        }
      }
    });
  });

  /* =========================================================
     INPUT FORMATTING
     ========================================================= */

  const cardNumberInput = document.getElementById('cardNumber');
  const expirationInput = document.getElementById('expirationDate');
  const securityCodeInput = document.getElementById('securityCode');
  const phoneNumberInput = document.getElementById('phoneNumber');
  const billingZipInput = document.getElementById('billingZip');

  // Format card number into groups of 4 digits
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function (event) {
      let value = event.target.value.replace(/\D/g, '');
      value = value.slice(0, 16);

      const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      event.target.value = formattedValue;
    });
  }

  // Format expiration date as MM/YY
  if (expirationInput) {
    expirationInput.addEventListener('input', function (event) {
      let value = event.target.value.replace(/\D/g, '');
      value = value.slice(0, 4);

      if (value.length >= 3) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }

      event.target.value = value;
    });
  }

  // Security code should only contain digits
  if (securityCodeInput) {
    securityCodeInput.addEventListener('input', function (event) {
      event.target.value = event.target.value.replace(/\D/g, '').slice(0, 4);
    });
  }

  // Phone number should only contain digits
  if (phoneNumberInput) {
    phoneNumberInput.addEventListener('input', function (event) {
      event.target.value = event.target.value.replace(/\D/g, '').slice(0, 15);
    });
  }

  // ZIP code should only contain digits
  if (billingZipInput) {
    billingZipInput.addEventListener('input', function (event) {
      event.target.value = event.target.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  /* =========================================================
     VALIDATION HELPERS
     ========================================================= */

  // Email validation pattern
  function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Simple card number validation by length
  function validateCardNumber(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return cleanNumber.length >= 13 && cleanNumber.length <= 16;
  }

  // Validates expiration date and makes sure the date is not expired
  function validateExpirationDate(expirationDate) {
    const parts = expirationDate.split('/');

    if (parts.length !== 2) {
      return false;
    }

    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10);

    if (Number.isNaN(month) || Number.isNaN(year)) {
      return false;
    }

    if (month < 1 || month > 12) {
      return false;
    }

    const fullYear = 2000 + year;

    // Set expiry to the first day of the next month
    // so the card remains valid through the printed month
    const expiryDate = new Date(fullYear, month, 1);
    const currentDate = new Date();

    return expiryDate > currentDate;
  }

  // Security code must be 3 or 4 digits
  function validateSecurityCode(code) {
    return /^\d{3,4}$/.test(code);
  }

  // ZIP code must be at least 5 digits
  function validateZipCode(zip) {
    return /^\d{5,}$/.test(zip);
  }

  // Shows error styling and message for a field
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

  // Clears all error messages and red borders
  function clearAllErrors() {
    if (errorBanner) {
      errorBanner.classList.add('hidden');
    }

    document.querySelectorAll('.error-message').forEach(function (message) {
      message.style.display = 'none';
    });

    document.querySelectorAll('.form-input, .form-select').forEach(function (field) {
      field.classList.remove('error');
    });
  }

  // When the user edits a field, remove that field's error state
  const inputs = form.querySelectorAll('input, select');

  inputs.forEach(function (input) {
    input.addEventListener('input', function () {
      this.classList.remove('error');

      const errorId = this.id + 'Error';
      const errorElement = document.getElementById(errorId);

      if (errorElement) {
        errorElement.style.display = 'none';
      }
    });

    input.addEventListener('change', function () {
      this.classList.remove('error');

      const errorId = this.id + 'Error';
      const errorElement = document.getElementById(errorId);

      if (errorElement) {
        errorElement.style.display = 'none';
      }
    });
  });

  /* =========================================================
     SUCCESS MODAL
     ========================================================= */

  // Opens the booking success modal
  function openSuccessModal() {
    if (successModal) {
      successModal.classList.remove('hidden');
      successModal.setAttribute('aria-hidden', 'false');
    }
  }

  // Closes the booking success modal
  function closeSuccessModalFn() {
    if (successModal) {
      successModal.classList.add('hidden');
      successModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (closeSuccessModal) {
    closeSuccessModal.addEventListener('click', closeSuccessModalFn);
  }

  if (successModal) {
    successModal.addEventListener('click', function (event) {
      if (event.target === successModal) {
        closeSuccessModalFn();
      }
    });
  }

  /* =========================================================
     FORM SUBMISSION
     ========================================================= */

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    let hasErrors = false;

    clearAllErrors();

    // Gather trimmed field values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();

    // Basic required field checks
    if (!firstName) {
      showError('firstName', 'firstNameError');
      hasErrors = true;
    }

    if (!lastName) {
      showError('lastName', 'lastNameError');
      hasErrors = true;
    }

    if (!email || !validateEmail(email)) {
      showError('email', 'emailError');
      hasErrors = true;
    }

    if (!phoneNumber) {
      showError('phoneNumber', 'phoneNumberError');
      hasErrors = true;
    }

    // Find the selected payment method
    const selectedPaymentMethodButton = document.querySelector('.payment-method.selected');
    const selectedPaymentMethod = selectedPaymentMethodButton
      ? selectedPaymentMethodButton.getAttribute('data-method')
      : 'card';

    // Only validate card details when card is selected
    if (selectedPaymentMethod === 'card') {
      const cardNumber = document.getElementById('cardNumber').value.trim();
      const expirationDate = document.getElementById('expirationDate').value.trim();
      const securityCode = document.getElementById('securityCode').value.trim();
      const billingZip = document.getElementById('billingZip').value.trim();

      if (!cardNumber || !validateCardNumber(cardNumber)) {
        showError('cardNumber', 'cardNumberError');
        hasErrors = true;
      }

      if (!expirationDate || !validateExpirationDate(expirationDate)) {
        showError('expirationDate', 'expirationDateError');
        hasErrors = true;
      }

      if (!securityCode || !validateSecurityCode(securityCode)) {
        showError('securityCode', 'securityCodeError');
        hasErrors = true;
      }

      if (!billingZip || !validateZipCode(billingZip)) {
        showError('billingZip', 'billingZipError');
        hasErrors = true;
      }
    }

    // Show error banner or success modal
    if (hasErrors) {
      if (errorBanner) {
        errorBanner.classList.remove('hidden');
      }

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      openSuccessModal();
    }
  });

  /* =========================================================
     SMALL EXTRA INTERACTIONS
     ========================================================= */

  // "Edit" button scrolls user back to the top of the form
  const editButton = document.querySelector('.btn-edit');

  if (editButton) {
    editButton.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      const firstNameField = document.getElementById('firstName');
      if (firstNameField) {
        firstNameField.focus();
      }
    });
  }

  // Placeholder interaction for special requests row
  const specialRequests = document.querySelector('.special-requests');

  if (specialRequests) {
    specialRequests.addEventListener('click', function () {
      alert('Special requests feature would open here.');
    });
  }

  /* =========================================================
     GLOBAL ESCAPE KEY HANDLING
     ========================================================= */

  // Escape closes open overlays/modals
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMobileMenu();
      closeSignInModalFn();
      closeSuccessModalFn();
    }
  });
});