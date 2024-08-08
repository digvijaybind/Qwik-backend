const Mongoose = require("mongoose");

const DoctorSchema = new Mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  contactNumberWithCountryCode: {
    type: String,
    required: true,
  },
  specialities: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  degrees: {
    type: String,
    required: true,
  },
});


const Doctor = Mongoose.model("DoctorData",  DoctorSchema);
module.exports={Doctor}