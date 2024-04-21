const isDateValid = async (date) => {
  return await !new Date(date).getTime();
};

module.exports = { isDateValid };
