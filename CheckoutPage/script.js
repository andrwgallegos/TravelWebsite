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
  const checkoutSubmitButton = document.getElementById('checkoutSubmitButton');
  const checkoutSpinner = document.getElementById('checkoutSpinner');
  const checkoutButtonText = document.getElementById('checkoutButtonText');
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
          cardFieldIds.forEach(function (fieldId) {
            const field = document.getElementById(fieldId);

            if (field && field.value.trim()) {
              validateField(fieldId);
            }
          });
        } else {
          cardDetailsForm.style.display = 'none';
          cardFieldIds.forEach(function (fieldId) {
            clearFieldState(fieldId);
          });
        }
      }

      syncErrorBanner();
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

  const liveValidationFields = [
    'firstName',
    'lastName',
    'email',
    'phoneNumber',
    'cardNumber',
    'expirationDate',
    'securityCode',
    'billingZip'
  ];

  const cardFieldIds = ['cardNumber', 'expirationDate', 'securityCode', 'billingZip'];

  function getFeedbackElement(fieldId) {
    return document.getElementById(fieldId + 'Error');
  }

  function setFieldState(fieldId, state, message) {
    const input = document.getElementById(fieldId);
    const feedback = getFeedbackElement(fieldId);

    if (!input) {
      return;
    }

    input.classList.remove('error', 'success');

    if (feedback) {
      feedback.classList.remove('is-visible', 'success');
      feedback.textContent = '';
    }

    if (!state || !message) {
      input.removeAttribute('aria-invalid');
      return;
    }

    input.classList.add(state);
    input.setAttribute('aria-invalid', String(state === 'error'));

    if (feedback) {
      feedback.textContent = message;
      feedback.classList.add('is-visible');

      if (state === 'success') {
        feedback.classList.add('success');
      }
    }
  }

  function showError(fieldId, message) {
    setFieldState(fieldId, 'error', message);
  }

  function showSuccess(fieldId, message) {
    setFieldState(fieldId, 'success', message);
  }

  function clearFieldState(fieldId) {
    setFieldState(fieldId, '', '');
  }

  function clearAllErrors() {
    if (errorBanner) {
      errorBanner.classList.add('hidden');
    }

    liveValidationFields.forEach(function (fieldId) {
      clearFieldState(fieldId);
    });
  }

  function syncErrorBanner() {
    if (!errorBanner) {
      return;
    }

    const hasVisibleErrors = Boolean(document.querySelector('.form-input.error, .form-select.error'));
    errorBanner.classList.toggle('hidden', !hasVisibleErrors);
  }

  function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  function passesLuhnCheck(cardNumber) {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let shouldDouble = false;

    for (let index = cleanNumber.length - 1; index >= 0; index -= 1) {
      let digit = parseInt(cleanNumber.charAt(index), 10);

      if (shouldDouble) {
        digit *= 2;

        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return cleanNumber.length >= 13 && cleanNumber.length <= 16 && sum % 10 === 0;
  }

  function validateCardNumber(cardNumber) {
    const cleanNumber = cardNumber.replace(/\D/g, '');

    if (cleanNumber.length < 13 || cleanNumber.length > 16) {
      return {
        isValid: false,
        message: 'Card number must be 13 to 16 digits.'
      };
    }

    if (!passesLuhnCheck(cleanNumber)) {
      return {
        isValid: false,
        message: 'Enter a valid card number.'
      };
    }

    return {
      isValid: true,
      message: 'Card number looks valid.'
    };
  }

  function validateExpirationDate(expirationDate) {
    if (!/^\d{2}\/\d{2}$/.test(expirationDate)) {
      return {
        isValid: false,
        message: 'Use MM/YY, such as 03/28.'
      };
    }

    const parts = expirationDate.split('/');
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10);

    if (Number.isNaN(month) || Number.isNaN(year) || month < 1 || month > 12) {
      return {
        isValid: false,
        message: 'Month must be between 01 and 12.'
      };
    }

    const fullYear = 2000 + year;
    const expiryDate = new Date(fullYear, month, 1);
    const currentDate = new Date();

    if (expiryDate <= currentDate) {
      return {
        isValid: false,
        message: 'Card is expired. Use a future date.'
      };
    }

    return {
      isValid: true,
      message: 'Expiration date looks good.'
    };
  }

  function validateSecurityCode(code) {
    if (!/^\d{3,4}$/.test(code)) {
      return {
        isValid: false,
        message: 'Security code must be 3 or 4 digits.'
      };
    }

    return {
      isValid: true,
      message: 'Security code looks good.'
    };
  }

  function validateZipCode(zip) {
    if (!/^\d{5,10}$/.test(zip)) {
      return {
        isValid: false,
        message: 'Billing ZIP code must be 5 to 10 digits.'
      };
    }

    return {
      isValid: true,
      message: 'Billing ZIP code looks good.'
    };
  }

  function isCardPaymentSelected() {
    const selectedPaymentMethodButton = document.querySelector('.payment-method.selected');
    const selectedPaymentMethod = selectedPaymentMethodButton
      ? selectedPaymentMethodButton.getAttribute('data-method')
      : 'card';

    return selectedPaymentMethod === 'card';
  }

  function validateField(fieldId) {
    const field = document.getElementById(fieldId);

    if (!field) {
      return true;
    }

    const value = field.value.trim();

    switch (fieldId) {
      case 'firstName':
        if (!value) {
          showError(fieldId, 'Enter your first name.');
          return false;
        }

        if (value.length < 2) {
          showError(fieldId, 'First name must be at least 2 characters.');
          return false;
        }

        showSuccess(fieldId, 'First name looks good.');
        return true;

      case 'lastName':
        if (!value) {
          showError(fieldId, 'Enter your last name.');
          return false;
        }

        if (value.length < 2) {
          showError(fieldId, 'Last name must be at least 2 characters.');
          return false;
        }

        showSuccess(fieldId, 'Last name looks good.');
        return true;

      case 'email':
        if (!value) {
          showError(fieldId, 'Enter an email address.');
          return false;
        }

        if (!validateEmail(value)) {
          showError(fieldId, 'Use a format like name@example.com.');
          return false;
        }

        showSuccess(fieldId, 'Email format looks good.');
        return true;

      case 'phoneNumber':
        if (!value) {
          showError(fieldId, 'Enter a phone number.');
          return false;
        }

        if (value.length < 7) {
          showError(fieldId, 'Phone number must have at least 7 digits.');
          return false;
        }

        showSuccess(fieldId, 'Phone number looks good.');
        return true;

      case 'cardNumber': {
        if (!isCardPaymentSelected()) {
          clearFieldState(fieldId);
          return true;
        }

        if (!value) {
          showError(fieldId, 'Enter your card number.');
          return false;
        }

        const validationResult = validateCardNumber(value);

        if (!validationResult.isValid) {
          showError(fieldId, validationResult.message);
          return false;
        }

        showSuccess(fieldId, validationResult.message);
        return true;
      }

      case 'expirationDate': {
        if (!isCardPaymentSelected()) {
          clearFieldState(fieldId);
          return true;
        }

        if (!value) {
          showError(fieldId, 'Enter the expiration date.');
          return false;
        }

        const validationResult = validateExpirationDate(value);

        if (!validationResult.isValid) {
          showError(fieldId, validationResult.message);
          return false;
        }

        showSuccess(fieldId, validationResult.message);
        return true;
      }

      case 'securityCode': {
        if (!isCardPaymentSelected()) {
          clearFieldState(fieldId);
          return true;
        }

        if (!value) {
          showError(fieldId, 'Enter the security code.');
          return false;
        }

        const validationResult = validateSecurityCode(value);

        if (!validationResult.isValid) {
          showError(fieldId, validationResult.message);
          return false;
        }

        showSuccess(fieldId, validationResult.message);
        return true;
      }

      case 'billingZip': {
        if (!isCardPaymentSelected()) {
          clearFieldState(fieldId);
          return true;
        }

        if (!value) {
          showError(fieldId, 'Enter the billing ZIP code.');
          return false;
        }

        const validationResult = validateZipCode(value);

        if (!validationResult.isValid) {
          showError(fieldId, validationResult.message);
          return false;
        }

        showSuccess(fieldId, validationResult.message);
        return true;
      }

      default:
        return true;
    }
  }

  liveValidationFields.forEach(function (fieldId) {
    const field = document.getElementById(fieldId);

    if (!field) {
      return;
    }

    field.setAttribute('aria-describedby', fieldId + 'Error');

    field.addEventListener('input', function () {
      validateField(fieldId);
      syncErrorBanner();
    });

    field.addEventListener('blur', function () {
      validateField(fieldId);
      syncErrorBanner();
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

    // Basic required field checks (simplified for assignment 12)
    if (!validateField('firstName')) hasErrors = true;
    if (!validateField('lastName')) hasErrors = true;
    if (!validateField('email')) hasErrors = true;
    if (!validateField('phoneNumber')) hasErrors = true;

    // Find the selected payment method
    const selectedPaymentMethodButton = document.querySelector('.payment-method.selected');
    const selectedPaymentMethod = selectedPaymentMethodButton
      ? selectedPaymentMethodButton.getAttribute('data-method')
      : 'card';

    // Only validate card details when card is selected
    if (selectedPaymentMethod === 'card') {
      if (!validateField('cardNumber')) hasErrors = true;
      if (!validateField('expirationDate')) hasErrors = true;
      if (!validateField('securityCode')) hasErrors = true;
      if (!validateField('billingZip')) hasErrors = true;
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
      // SHOW LOADING STATE
      if (checkoutSpinner) {
        checkoutSpinner.classList.remove('hidden');
      }

      if (checkoutButtonText) {
        checkoutButtonText.textContent = 'Processing...';
      }

      if (checkoutSubmitButton) {
        checkoutSubmitButton.disabled = true;
      }

      // SIMULATE PROCESSING DELAY
      setTimeout(function () {
        // reset button
        if (checkoutSpinner) {
          checkoutSpinner.classList.add('hidden');
        }

        if (checkoutButtonText) {
          checkoutButtonText.textContent = 'Book Now';
        }

        if (checkoutSubmitButton) {
          checkoutSubmitButton.disabled = false;
        }

        // THEN show success modal
        openSuccessModal();
      }, 2000);
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