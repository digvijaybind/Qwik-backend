const countryRegex = /^(?:\+?\d{2,3})$/;

const isValidCountryCode = (text) => {
  // Ensure text is a string using typeof
  if (typeof text !== 'string') {
    return false;
  }
  return countryRegex.test(text);
};

module.exports = { isValidCountryCode };
