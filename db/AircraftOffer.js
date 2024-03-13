const mongoose = require("mongoose");

const aircraftSchema = new mongoose.Schema({
  aircraft: {
    type: Object,
    required: true,
  },
  price: {
    type: Object,
    required: true,
  },
});

const Aircraft = mongoose.model("AircraftData", aircraftSchema);

module.exports = Aircraft;
