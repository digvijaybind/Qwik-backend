const mobileRegex = /^(?:\+?\d{12,13}|\d{10,11})$/;

const isValidMobileNumber = (text) => {
  // Ensure text is a string using typeof
  if (typeof text !== 'string') {
    return false;
  }
  return mobileRegex.test(text);
};

module.exports = { isValidMobileNumber };
