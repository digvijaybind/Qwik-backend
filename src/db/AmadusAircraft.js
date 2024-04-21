const mongoose = require("mongoose");

const AmadusaircraftSchema = new mongoose.Schema({
  Response: {
    type: Object,
  },
});
const AmadusAircraft = mongoose.model("AmadusAircraftData", AmadusaircraftSchema);

module.exports = AmadusAircraft;
