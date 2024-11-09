const Mongoose = require('mongoose');

const DoctorSchema = new Mongoose.Schema({
  DOCTOR_FULL_NAME: {
    type: String,
    required: true,
  },
  DOCTOR_CONTACT_NUMBER: {
    type: String,
    required: true,
  },
  DOCTOR_SPECIALITIES: {
    type: String,
    required: true,
  },
  DOCTOR_LOCATION: {
    type: String,
    required: true,
  },
  DOCTOR_DEGREES: {
    type: String,
    required: true,
  },
});

const Doctor = Mongoose.model('DoctorData', DoctorSchema);
module.exports = { Doctor };
