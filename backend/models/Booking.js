// backend/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parkingSpaceId:{ type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpace', required: true },
  vehicleModel:  { type: String, required: true },
  vehicleType:   { type: String, enum: ['bike', 'hatchback', 'sedan', 'suv', 'truck'], required: true },
  vehicleSize:   { type: String, enum: ['small', 'medium', 'medium-large', 'large', 'extra-large'], required: true },
  startTime:     { type: Date, required: true },
  endTime:       { type: Date, required: true },
  totalPrice:    { type: Number, required: true },
  status:        { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
