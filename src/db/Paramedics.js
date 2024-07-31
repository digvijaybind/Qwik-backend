const Mongoose = require('mongoose');

const ParamedicsSchema = new Mongoose.Schema({
  FullName: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  resumeDocumentPath: {
    type: String,
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

const Paramedics = Mongoose.model('ParamedicsData', ParamedicsSchema);
module.exports = { Paramedics };
