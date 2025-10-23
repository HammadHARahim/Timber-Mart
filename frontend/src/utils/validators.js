// Form validation utilities

export const validators = {
  // Email validation
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // Phone validation (basic)
  phone: (value) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(value) && value.length >= 10;
  },

  // Required field
  required: (value) => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  // Min length
  minLength: (value, min) => {
    return value.length >= min;
  },

  // Max length
  maxLength: (value, max) => {
    return value.length <= max;
  },

  // Number validation
  number: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  // Positive number
  positiveNumber: (value) => {
    return validators.number(value) && parseFloat(value) > 0;
  },

  // Decimal validation
  decimal: (value, decimals = 2) => {
    const regex = new RegExp(`^\\d+(\\.\\d{1,${decimals}})?$`);
    return regex.test(value);
  },

  // Username validation (alphanumeric and underscore)
  username: (value) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(value);
  },

  // Password strength
  passwordStrength: (value) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongRegex.test(value);
  },

  // Date validation
  date: (value) => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  },

  // Future date
  futureDate: (value) => {
    const date = new Date(value);
    const now = new Date();
    return date > now;
  },

  // Past date
  pastDate: (value) => {
    const date = new Date(value);
    const now = new Date();
    return date < now;
  }
};

// Validate form data against rules
export function validateForm(data, rules) {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    for (const rule of fieldRules) {
      const { validator, message, ...params } = rule;

      let isValid = false;

      if (typeof validator === 'function') {
        isValid = validator(value, params);
      } else if (typeof validator === 'string' && validators[validator]) {
        isValid = validators[validator](value, params.value);
      }

      if (!isValid) {
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(message);
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Example usage:
// const rules = {
//   email: [
//     { validator: 'required', message: 'Email is required' },
//     { validator: 'email', message: 'Invalid email format' }
//   ],
//   password: [
//     { validator: 'required', message: 'Password is required' },
//     { validator: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
//   ]
// };
//
// const result = validateForm(formData, rules);
