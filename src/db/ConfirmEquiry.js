const { default: mongoose } = require('mongoose');
const Mongoose = require('mongoose');

const EquirySchema = new mongoose.Schema({
  From: {
    type: String,
  },
  To: {
    type: String,
  },
  Name: {
    type: String,
  },
  Phone: {
    type: String,
  },
  Email: {
    type: String,
  },
});

module.exports = Mongoose.model('ConfirmEquiry', EquirySchema);
