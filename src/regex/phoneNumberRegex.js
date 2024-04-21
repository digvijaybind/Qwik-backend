const mobileRegex = /^\d{10}$/;
const isValidMobileNumber = (text) => {
  return mobileRegex.test(text);
};

module.exports = { isValidMobileNumber };
