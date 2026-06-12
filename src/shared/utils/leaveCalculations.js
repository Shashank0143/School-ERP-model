/**
 * Shared utility for calculating leave days
 */

/**
 * Calculates the total inclusive days between a start and end date.
 * @param {string|Date} startDate - The start date of the leave.
 * @param {string|Date} endDate - The end date of the leave.
 * @returns {number} The number of days requested.
 */
export function calculateLeaveDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set to midnight to avoid timezone/time-of-day discrepancies
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  if (end < start) return 0;

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  return diffDays + 1; // Inclusive day count
}
