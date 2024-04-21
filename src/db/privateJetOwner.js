const Mongoose = require("mongoose");

const PrivateJetOwnerSchema = new Mongoose.Schema({
  aircraftType:{
    type: String,
    required: true,
  },
  ownersName: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  location:{
    type:String,
   required:true
  },

  emailAddress:{
    type:String,
    required:true
  }
});


const PrivateJetOwner = Mongoose.model("PrivateJetOwnerData",PrivateJetOwnerSchema);
module.exports={PrivateJetOwner}