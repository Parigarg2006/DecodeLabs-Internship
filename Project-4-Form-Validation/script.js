/* =========================================================
   FORM DESIGN & VALIDATION ENGINE
   Project 4 — DecodeLabs Frontend Internship

   Architecture (per the IPO model):
   1. Semantic Skeleton  -> index.html
   2. Inspection Engine  -> regex + rule functions below
   3. Communicator       -> dynamic error/success UI + ARIA
========================================================= */

// ---------- DOM REFERENCES ----------
const form = document.getElementById('signupForm');

const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');

const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const confirmError = document.getElementById('confirm-error');

const strengthBar = document.getElementById('strengthBar');
const strengthLabel = document.getElementById('strengthLabel');

const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

const togglePasswordBtn = document.getElementById('togglePassword');

// Password rule checklist items
const ruleEls = {
  length: document.getElementById('rule-length'),
  upper: document.getElementById('rule-upper'),
  lower: document.getElementById('rule-lower'),
  number: document.getElementById('rule-number'),
  special: document.getElementById('rule-special'),
};

// ---------- REGEX INSPECTORS ----------
// Basic email syntax check (per the deck: catches typos, not full RFC 5322)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strict password policy regex (matches the deck's example exactly):
// - at least 1 uppercase, 1 lowercase, 1 digit, 1 special char, min 8 chars
const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

const NAME_REGEX = /^[A-Za-z]+(?:[' -][A-Za-z]+)*$/; // letters, spaces, hyphens, apostrophes

// ---------- HELPER: SET FIELD STATE ----------
function setFieldState(input, errorEl, valid, message) {
  input.setAttribute('aria-invalid', valid ? 'false' : 'true');
  errorEl.textContent = valid ? '' : message;
  errorEl.classList.toggle('show', !valid);
  input.classList.toggle('valid', valid && input.value.trim() !== '');
  return valid;
}

// ---------- VALIDATORS ----------
function validateName() {
  const value = nameInput.value.trim();
  if (value === '') {
    return setFieldState(nameInput, nameError, false, 'Full name is required.');
  }
  if (value.length < 2) {
    return setFieldState(nameInput, nameError, false, 'Name must be at least 2 characters.');
  }
  if (!NAME_REGEX.test(value)) {
    return setFieldState(nameInput, nameError, false, 'Name can only contain letters, spaces and hyphens.');
  }
  return setFieldState(nameInput, nameError, true, '');
}

function validateEmail() {
  const value = emailInput.value.trim();
  if (value === '') {
    return setFieldState(emailInput, emailError, false, 'Email address is required.');
  }
  if (!EMAIL_REGEX.test(value)) {
    return setFieldState(emailInput, emailError, false, 'Please enter a valid email address (e.g. name@example.com).');
  }
  return setFieldState(emailInput, emailError, true, '');
}

function validatePassword() {
  const value = passwordInput.value;

  // Update the live checklist regardless of overall pass/fail
  const checks = {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[#?!@$%^&*-]/.test(value),
  };

  Object.keys(checks).forEach((key) => {
    ruleEls[key].classList.toggle('met', checks[key]);
  });

  updateStrengthMeter(checks);

  if (value === '') {
    return setFieldState(passwordInput, passwordError, false, 'Password is required.');
  }
  if (!PASSWORD_REGEX.test(value)) {
    return setFieldState(passwordInput, passwordError, false, 'Password does not meet all requirements above.');
  }
  return setFieldState(passwordInput, passwordError, true, '');
}

function validateConfirmPassword() {
  const value = confirmInput.value;
  if (value === '') {
    return setFieldState(confirmInput, confirmError, false, 'Please confirm your password.');
  }
  if (value !== passwordInput.value) {
    return setFieldState(confirmInput, confirmError, false, 'Passwords do not match.');
  }
  return setFieldState(confirmInput, confirmError, true, '');
}

// ---------- PASSWORD STRENGTH METER ----------
function updateStrengthMeter(checks) {
  const passed = Object.values(checks).filter(Boolean).length;
  const percent = (passed / 5) * 100;

  strengthBar.style.width = percent + '%';

  let color = 'var(--danger)';
  let label = 'Weak';

  if (passed >= 5) {
    color = 'var(--success)';
    label = 'Strong';
  } else if (passed >= 3) {
    color = 'var(--warning)';
    label = 'Medium';
  } else if (passed === 0) {
    label = '—';
  }

  strengthBar.style.background = color;
  strengthLabel.textContent = passed === 0 ? 'Strength: —' : `Strength: ${label}`;
}

// ---------- LIVE (REAL-TIME) LISTENERS ----------
// Real-time feedback as the user types — but the ARIA live announcement
// only fires on blur/submit, per the "polite live region" pattern in
// the deck (announcing on every keystroke would be unusable for
// screen-reader users).
nameInput.addEventListener('input', validateName);
emailInput.addEventListener('input', validateEmail);
passwordInput.addEventListener('input', () => {
  validatePassword();
  if (confirmInput.value !== '') validateConfirmPassword();
});
confirmInput.addEventListener('input', validateConfirmPassword);

// ---------- PASSWORD VISIBILITY TOGGLE ----------
togglePasswordBtn.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  togglePasswordBtn.textContent = isHidden ? '🙈' : '👁';
  togglePasswordBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
});

// ---------- FORM SUBMISSION ----------
form.addEventListener('submit', function (event) {
  // Phase 2: stop the browser's default "memory wipe" refresh
  event.preventDefault();

  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isConfirmValid = validateConfirmPassword();

  const allValid = isNameValid && isEmailValid && isPasswordValid && isConfirmValid;

  if (!allValid) {
    showStatus('Please fix the highlighted errors before continuing.', 'error');
    // Move focus to the first invalid field for keyboard/screen-reader users
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  // Simulate an async submission (e.g. an API call)
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: '••••••••', // never log real passwords — placeholder only
  };

  setTimeout(() => {
    console.log('Validated payload ready for dispatch:', payload);

    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;

    showStatus(`✅ Account created successfully! Welcome, ${payload.name}.`, 'success');
    form.reset();
    resetFieldStates();
  }, 900);
});

// ---------- STATUS / SUCCESS MESSAGE ----------
function showStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = 'form-status ' + type;
}

// ---------- RESET UI AFTER SUCCESSFUL SUBMIT ----------
function resetFieldStates() {
  [nameInput, emailInput, passwordInput, confirmInput].forEach((input) => {
    input.setAttribute('aria-invalid', 'false');
    input.classList.remove('valid');
  });
  [nameError, emailError, passwordError, confirmError].forEach((el) => {
    el.textContent = '';
    el.classList.remove('show');
  });
  Object.values(ruleEls).forEach((el) => el.classList.remove('met'));
  strengthBar.style.width = '0%';
  strengthLabel.textContent = 'Strength: —';
}