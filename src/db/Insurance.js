const Mongoose = require('mongoose');

const InsuranceSchema = new Mongoose.Schema({
  CompanyName: {
    type: String,
    required: true,
  },
  ContactNumber: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  ContactPerson: {
    type: String,
    required: true,
  },
  PersonContact: {
    type: String,
    required: true,
  },
});

const Insurance = Mongoose.model('InsuranceData', InsuranceSchema);

module.exports = {
  Insurance,
};
