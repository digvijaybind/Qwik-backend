const mongoose = require("mongoose");

const aircraftSchema = new mongoose.Schema({
  Response: {
    type: Object,
  },
});
const Aircraft = mongoose.model("AircraftData", aircraftSchema);

module.exports = Aircraft

