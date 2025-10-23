// ============================================================================
// FILE: backend/utils/amountToWords.js
// Convert numeric amount to words for payment vouchers
// ============================================================================

/**
 * Convert amount to words (English)
 * Example: 1234.56 => "One Thousand Two Hundred Thirty Four and 56/100"
 */
const amountToWords = (amount) => {
  if (!amount || isNaN(amount)) {
    return 'Zero';
  }

  const numAmount = parseFloat(amount);

  // Split into rupees and paisa
  const rupees = Math.floor(numAmount);
  const paisa = Math.round((numAmount - rupees) * 100);

  const rupeesInWords = convertNumberToWords(rupees);

  if (paisa > 0) {
    return `${rupeesInWords} and ${paisa}/100`;
  }

  return rupeesInWords;
};

/**
 * Convert number to words
 */
const convertNumberToWords = (num) => {
  if (num === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const convertLessThanThousand = (n) => {
    if (n === 0) return '';

    if (n < 10) {
      return ones[n];
    } else if (n < 20) {
      return teens[n - 10];
    } else if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    } else {
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    }
  };

  if (num < 1000) {
    return convertLessThanThousand(num);
  }

  // Handle thousands, lakhs, crores (Indian numbering system)
  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  let result = '';

  if (crores > 0) {
    result += convertLessThanThousand(crores) + ' Crore ';
  }

  if (lakhs > 0) {
    result += convertLessThanThousand(lakhs) + ' Lakh ';
  }

  if (thousands > 0) {
    result += convertLessThanThousand(thousands) + ' Thousand ';
  }

  if (remainder > 0) {
    result += convertLessThanThousand(remainder);
  }

  return result.trim();
};

export default amountToWords;
