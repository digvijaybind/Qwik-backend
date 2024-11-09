const mongoose = require('mongoose');

const EquirySchema = new mongoose.Schema({
  From: {
    type: String,
    required: true, // Optional: Add validation
  },
  To: {
    type: String,
    required: true, // Optional: Add validation
  },
  FirstName: {
    type: String,
    required: true, // Optional: Add validation
  },
  LastName: {
    type: String,
    required: true, // Optional: Add validation
  },
  Phone: {
    type: String,
    required: true, // Optional: Add validation
  },
  Email: {
    type: String,
    required: true, // Optional: Add validation
    match: /.+\@.+\..+/, // Optional: Email format validation
  },
  Message: {
    type: String, // Optional: If you want to store the message
  },
});

// Create the model and export it
module.exports = mongoose.model('ConfirmEquiry', EquirySchema);
