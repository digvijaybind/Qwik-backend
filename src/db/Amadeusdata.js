const mongoose = require("mongoose");

const AmadeusSchema = new mongoose.Schema({
  type: String,
  id: String,
  source: String,
  instantTicketingRequired: Boolean,
  nonHomogeneous: Boolean,
  oneWay: Boolean,
  lastTicketingDate: {type: Date},
  lastTicketingDateTime: {type: Date},
  numberOfBookableSeats: Number,
  itineraries: {
    type: Object,
    required: true,
  },
  price: {
    type: Object,
    required: true,
  },
  pricingOptions: {
    type: Object,
    required: true,
  },
  validatingAirlineCodes: [String],
  travelerPricings: [Object],
});

const AmadeusData = mongoose.model("AmadeusData", AmadeusSchema);

module.exports = AmadeusData;
