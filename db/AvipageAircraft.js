const mongoose = require("mongoose");

const AvipageaircraftSchema = new mongoose.Schema({
  Response: {
    type: Object,
  },
});
const AvipageAircraft = mongoose.model("AvipageAircraftData", AvipageaircraftSchema);

module.exports =AvipageAircraft;