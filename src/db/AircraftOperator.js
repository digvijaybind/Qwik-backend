const Mongoose = require("mongoose");

const AircraftOperatorSchema = new Mongoose.Schema({
  companyName:{
    type: String,
    required: true,
  },
  contactDetails: {
    type: String,
    required: true,
  },
  numberOfCountriesOperating:{
    type:String,
   required:true
  },
  location:{
    type:String,
   required:true
  },
  email:{
    type:String,
    required:true
  }
});


const AircraftOperator = Mongoose.model("AircraftOperatorData", AircraftOperatorSchema);
module.exports={AircraftOperator}