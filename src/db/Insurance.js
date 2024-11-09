const Mongoose = require('mongoose');

const InsuranceSchema = new Mongoose.Schema({
  COMPANY_NAME: {
    type: String,
    required: true,
  },
  COMPANY_CONTACT_NUMBER: {
    type: String,
    required: true,
  },
  COMPANY_EMAIL: {
    type: String,
    required: true,
  },
  CONTACT_PERSON_NAME: {
    type: String,
    required: true,
  },
  CONTACT_PERSON_NUMBER: {
    type: String,
    required: true,
  },
});

const Insurance = Mongoose.model('InsuranceData', InsuranceSchema);

module.exports = {
  Insurance,
};
