const Mongoose = require('mongoose');

const ParamedicsSchema = new Mongoose.Schema({
  FULL_NAME: {
    type: String,
    required: true,
  },
  EMAIL_ADDRESS: {
    type: String,
    required: true,
  },
  COUNTRY_OF_RESIDENCE: {
    type: String,
    required: true,
  },
  EDUCATION_DEGREES: {
    type: String,
    required: true,
  },
  CONTACT_NUMBER_WITH_COUNTRY_CODE: {
    type: String,
    required: true,
  },
});

const Paramedics = Mongoose.model('ParamedicsData', ParamedicsSchema);
module.exports = { Paramedics };
