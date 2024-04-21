const Mongoose = require("mongoose");

const ParamedicsSchema = new Mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  resumeDocumentPath:{
    type:String,
   required:true
  },
  location:{
    type:String,
   required:true
  },
  degrees :{
    type:String,
    required:true
  }
});


const Paramedics = Mongoose.model("ParamedicsData",  ParamedicsSchema);
module.exports={Paramedics}