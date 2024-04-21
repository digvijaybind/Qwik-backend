const isPasswordValid = async (password) => {
  return await (password.length <= 6);
};

module.exports = { isPasswordValid };
