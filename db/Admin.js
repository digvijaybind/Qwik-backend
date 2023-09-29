const Mongoose = require("mongoose");

const AdminSchema = new Mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  margin: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Admin", AdminSchema);