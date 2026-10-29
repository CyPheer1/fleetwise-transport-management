/**
 * FleetWise Enterprise - Utility Formatters
 * Collection of formatting utilities for consistent data display
 */

/**
 * Format currency values in MAD with proper formatting
 * @param {number} amount - The amount to format
 * @param {string} locale - The locale to use for formatting (default: 'fr-MA')
 * @return {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a duration in hours to a readable string
 * @param {number} hours - Duration in hours (can be decimal)
 * @return {string} Formatted duration string (e.g. "2h 30min")
 */
export const formatDuration = (hours) => {
  const h = Math.floor(hours);
  const min = Math.round((hours - h) * 60);
  
  if (min === 0) {
    return `${h}h`;
  }
  
  return `${h}h ${min}min`;
};

/**
 * Format a distance in kilometers
 * @param {number} distance - Distance in kilometers
 * @return {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  return `${Math.round(distance)} km`;
};

