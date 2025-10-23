// Formatting utilities

// Format currency
export function formatCurrency(amount, currency = 'PKR') {
  const num = parseFloat(amount);

  if (isNaN(num)) {
    return '0.00';
  }

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

// Format number with thousand separators
export function formatNumber(number) {
  const num = parseFloat(number);

  if (isNaN(num)) {
    return '0';
  }

  return new Intl.NumberFormat('en-PK').format(num);
}

// Format date
export function formatDate(date, format = 'short') {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-PK');
    case 'long':
      return d.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'time':
      return d.toLocaleTimeString('en-PK');
    case 'datetime':
      return `${d.toLocaleDateString('en-PK')} ${d.toLocaleTimeString('en-PK')}`;
    case 'iso':
      return d.toISOString();
    default:
      return d.toLocaleDateString('en-PK');
  }
}

// Format phone number
export function formatPhone(phone) {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 11) {
    // Format: 0XXX-XXXXXXX
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  } else if (cleaned.length === 10) {
    // Format: XXX-XXXXXXX
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }

  return phone;
}

// Truncate text
export function truncate(text, maxLength = 50) {
  if (!text) return '';

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + '...';
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Capitalize first letter
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Title case
export function titleCase(text) {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Format percentage
export function formatPercentage(value, decimals = 2) {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return '0%';
  }

  return `${num.toFixed(decimals)}%`;
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date, 'short');
  }
}

// Parse currency to number
export function parseCurrency(currencyString) {
  if (!currencyString) return 0;

  // Remove currency symbols and commas
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}
