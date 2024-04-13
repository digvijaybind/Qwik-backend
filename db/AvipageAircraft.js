const mongoose = require('mongoose');

const AvipageaircraftSchema = new mongoose.Schema({
  Response: {
    type: Array,
  },
});
const AvipageAircraft = mongoose.model(
  'AvipageAircraftData',
  AvipageaircraftSchema
);

module.exports = AvipageAircraft;
