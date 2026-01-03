// formatters.js
// Utility functions for number formatting with Turkish locale

/**
 * Format weight with Turkish number format
 * @param {number} weight - Weight in kg
 * @param {number} decimals - Number of decimal places (default: 3)
 * @returns {string} - Formatted weight (e.g., "1.558,600 kg")
 */
export const formatWeight = (weight, decimals = 3) => {
  if (weight === null || weight === undefined || isNaN(weight)) {
    return '0,000 kg';
  }

  const num = parseFloat(weight);

  // Format with Turkish locale: comma as decimal separator, dot as thousands separator
  return num.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }) + ' kg';
};

/**
 * Format weight without unit
 * @param {number} weight - Weight in kg
 * @param {number} decimals - Number of decimal places (default: 3)
 * @returns {string} - Formatted weight (e.g., "1.558,600")
 */
export const formatWeightNoUnit = (weight, decimals = 3) => {
  if (weight === null || weight === undefined || isNaN(weight)) {
    return '0,000';
  }

  const num = parseFloat(weight);

  return num.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format number with Turkish locale
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} - Formatted number
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  return parseFloat(num).toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Convert kg to ton
 * @param {number} kg - Weight in kg
 * @returns {number} - Weight in tons
 */
export const kgToTon = (kg) => {
  if (!kg || isNaN(kg)) return 0;
  return parseFloat(kg) / 1000;
};

/**
 * Convert ton to kg
 * @param {number} ton - Weight in tons
 * @returns {number} - Weight in kg
 */
export const tonToKg = (ton) => {
  if (!ton || isNaN(ton)) return 0;
  return parseFloat(ton) * 1000;
};

/**
 * Format weight in tons with Turkish locale
 * @param {number} ton - Weight in tons
 * @param {number} decimals - Number of decimal places (default: 3)
 * @returns {string} - Formatted weight (e.g., "1,559 ton")
 */
export const formatTon = (ton, decimals = 3) => {
  if (ton === null || ton === undefined || isNaN(ton)) {
    return '0,000 ton';
  }

  const num = parseFloat(ton);

  return num.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }) + ' ton';
};

/**
 * Parse Turkish number format to float
 * @param {string} str - Turkish formatted number (e.g., "1.558,600")
 * @returns {number} - Parsed number
 */
export const parseTurkishNumber = (str) => {
  if (!str) return 0;

  // Remove thousands separators (dots) and replace decimal comma with dot
  const cleaned = str.toString().replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

/**
 * Format time ago in Turkish
 * @param {Date|string} date - Date to format
 * @returns {string} - Time ago string (e.g., "5 dakika önce")
 */
export const formatTimeAgo = (date) => {
  if (!date) return '';

  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Az önce';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} dakika önce`;
  } else if (diffHours < 24) {
    return `${diffHours} saat önce`;
  } else if (diffDays < 30) {
    return `${diffDays} gün önce`;
  } else {
    return past.toLocaleDateString('tr-TR');
  }
};

/**
 * Format date and time in Turkish
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date and time
 */
export const formatDateTime = (date) => {
  if (!date) return '';

  const d = new Date(date);
  return d.toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Calculate percentage difference
 * @param {number} value1 - First value
 * @param {number} value2 - Second value
 * @returns {number} - Percentage difference
 */
export const calculatePercentDiff = (value1, value2) => {
  if (!value1 || !value2 || isNaN(value1) || isNaN(value2)) return 0;

  const diff = ((parseFloat(value2) - parseFloat(value1)) / parseFloat(value1)) * 100;
  return Math.round(diff * 100) / 100; // Round to 2 decimals
};

/**
 * Format percentage
 * @param {number} percent - Percentage value
 * @returns {string} - Formatted percentage (e.g., "+25,50%")
 */
export const formatPercent = (percent) => {
  if (percent === null || percent === undefined || isNaN(percent)) {
    return '0%';
  }

  const num = parseFloat(percent);
  const sign = num > 0 ? '+' : '';

  return sign + num.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + '%';
};
