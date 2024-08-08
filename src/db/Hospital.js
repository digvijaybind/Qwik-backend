const Mongoose = require("mongoose");

const HospitalSchema = new Mongoose.Schema({
  hospitalName: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  contactNumberWithCountryCode: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});


const Hospital = Mongoose.model("HospitalData",HospitalSchema);
module.exports={Hospital}