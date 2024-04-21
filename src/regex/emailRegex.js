const emailRegex =
  /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
const isValidEmail = async (email) => {
  return emailRegex.test(email);
};

module.exports = { isValidEmail };
