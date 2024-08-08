const Mongoose = require('mongoose');

const ParamedicsSchema = new Mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  degrees: {
    type: String,
    required: true,
  },
  contactNumberWithCountryCode: {
    type: String,
    required: true,
  },
});

const Paramedics = Mongoose.model('ParamedicsData', ParamedicsSchema);
module.exports = { Paramedics };
