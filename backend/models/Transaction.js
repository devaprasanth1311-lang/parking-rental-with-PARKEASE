// backend/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  bookingId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:        { type: Number, required: true },
  paymentStatus: { type: String, enum: ['paid','refunded'], default: 'paid' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
