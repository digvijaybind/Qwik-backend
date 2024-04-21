const { default: mongoose } = require("mongoose");
const Mongoose = require("mongoose");

const EquirySchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Phone: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
});

module.exports = Mongoose.model("ConfirmEquiry", EquirySchema);