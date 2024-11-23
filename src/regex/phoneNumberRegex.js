const mobileRegex = /^(?:\+|00)?([1-9][0-9]{0,3})\s?[1-9][0-9]{4,12}$/;

/**
 * Validates if the provided number is a valid mobile number with optional country code.
 *
 * @param {string} text - The mobile number to validate.
 * @returns {boolean} - Returns `true` if valid, otherwise `false`.
 */
const isValidMobileNumber = (text) => {
  // Ensure text is a string
  if (typeof text !== 'string') {
    return false;
  }

  // Test against the regex
  return mobileRegex.test(text);
};

module.exports = { isValidMobileNumber };
