const Mongoose = require('mongoose');

const paymentSchema = new Mongoose.Schema({
  amount: Number,
  currency: String,
  description: String,
  status: String, // e.g., 'pending', 'completed', 'failed'
  transactionId: String,
  userId: String, // Store user reference
  createdAt: { type: Date, default: Date.now },
});

const Payment = Mongoose.model('Payment', paymentSchema);
module.exports = { Payment };
