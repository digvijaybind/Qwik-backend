const Mongoose = require('mongoose');

const AircraftOperatorSchema = new Mongoose.Schema({
  COMPANY_NAME: {
    type: String,
    required: true,
  },
  COMPANY_CONTACT_NUMBER: {
    type: String,
    required: true,
  },
  NUMBER_OF_COUNTRIES_PRESENCE: {
    type: String,
    required: true,
  },
  COMPANY_LOCATION: {
    type: String,
    required: true,
  },
  COMPANY_EMAIL: {
    type: String,
    required: true,
  },
});

const AircraftOperator = Mongoose.model(
  'AircraftOperatorData',
  AircraftOperatorSchema,
);
module.exports = { AircraftOperator };
