import { GENDER_OPTIONS, DEFAULT_GENDER } from "../constants/genderConstants";

/**
 * Normalizes a gender string to match our accepted GENDER_OPTIONS.
 * If the value is missing, empty, or doesn't match any option (case-insensitive),
 * it returns the DEFAULT_GENDER.
 * 
 * @param {string} value - The raw gender string input
 * @returns {string} The normalized gender string
 */
export const normalizeGender = (value) => {
  if (!value || typeof value !== "string") {
    return DEFAULT_GENDER;
  }

  const trimmedValue = value.trim().toLowerCase();

  const matchedOption = GENDER_OPTIONS.find(
    (option) => option.toLowerCase() === trimmedValue
  );

  return matchedOption || DEFAULT_GENDER;
};

/**
 * Validates whether a gender string is an exact match for one of the accepted options.
 * 
 * @param {string} value - The gender string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateGender = (value) => {
  return GENDER_OPTIONS.includes(value);
};
