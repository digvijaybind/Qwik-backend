const Mongoose = require("mongoose");

const OperatorSchema = new Mongoose.Schema({
  company_name: {
    type: String,
    required: true,
  },
  email_address: {
    type: String,
    required: true,
  },
  Contact_No: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  contact_number:{
    type:String,
    required:true
  },
  country_name:{
    type:String,
    required:true
  },
  aircraftOperators: [
    {
      aircraftOperator: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'AircraftOperatorSchema'
      },
      Aircraft_type: String,
      Tail_sign: String,
      location:String,
      icao:String,
      country_name:String,
      charges_per_hour:Number,
      speed:Number,
      margin:Number

    }
  ],
  role:{
    type:String,
   required:true
  }
});
const AircraftOPeratorSchema = new Mongoose.Schema({
  contact_number: {
    type:String,
  },
  Aircraft_type: {
    type: String,
    enum: ["Challenger 605", "Learjet 45", "C90"],
  },
  Tail_sign: {
    type: String,
  },
  location: {
    type: String,
  },
  icao: {
    type: String,
  },
  country_name: {
    type: String,
  },
  charges_per_hour: {
    type: Number,
  },
  speed: {
    type: Number,
  },
  margin: {
    type: Number,
    default: 0,
  },
  Date: {
    type: String,
  },

  date: {type: Date, default: Date.now},
  operator: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'OperatorSchema'
  },

});

const Operator = Mongoose.model("Operator", OperatorSchema);
const AircraftOPerator = Mongoose.model(
  "AircraftOPerator",
  AircraftOPeratorSchema
);
module.exports = {Operator, AircraftOPerator};
