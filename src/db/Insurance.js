const Mongoose = require('mongoose');

const InsuranceSchema = new Mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  companyContactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  personContact: {
    type: String,
    required: true,
  },
});

const Insurance = Mongoose.model('InsuranceData', InsuranceSchema);

module.exports = {
  Insurance,
};
