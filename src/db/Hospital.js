const Mongoose = require("mongoose");

const HospitalSchema = new Mongoose.Schema({
  HOSPITAL_NAME: {
    type: String,
    required: true,
  },
  HOSPITAL_OWNER_NAME: {
    type: String,
    required: true,
  },
  HOSPITAL_LOCATION: {
    type: String,
    required: true,
  },
  HOSPITAL_CONTACT_NUMBER: {
    type: String,
    required: true,
  },
  HOSPITAL_EMAIL: {
    type: String,
    required: true,
  },
});


const Hospital = Mongoose.model("HospitalData",HospitalSchema);
module.exports={Hospital}