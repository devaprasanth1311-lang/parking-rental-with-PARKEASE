// backend/models/ParkingSpace.js
const mongoose = require('mongoose');

const parkingSpaceSchema = new mongoose.Schema({
  ownerId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:         { type: String, required: true },
  description:   { type: String, default: '' },
  photos:        [{ type: String }],
  landProof:     { type: String, required: true },
  ownerName:     { type: String, required: true },
  ownerPhone:    { type: String, required: true },
  nationalIdProof: { type: String, required: true },
  ownerPhoto:    { type: String, required: true },
  phoneVerified: { type: Boolean, default: false },
  location: {
    address:  { type: String, required: true },
    area:     { type: String, default: '' },
    city:     { type: String, default: '' },
    state:    { type: String, default: '' },
    pincode:  { type: String, default: '' },
    landmark: { type: String, default: '' },
    lat:      { type: Number, default: 0 },
    lng:      { type: Number, default: 0 },
  },
  slotSizes: [{
    category: { type: String, enum: ['small', 'medium', 'medium-large', 'large', 'extra-large'] },
    count:    { type: Number, default: 1 },
    widthFt:  { type: Number, default: 7 },
    lengthFt: { type: Number, default: 15 },
  }],
  pricePerHour:   { type: Number, required: true },
  pricePerDay:    { type: Number },
  isAvailable:    { type: Boolean, default: true },
  isApproved:     { type: Boolean, default: false },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  cctvUrl:        { type: String, default: '' },
  totalSpots:     { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('ParkingSpace', parkingSpaceSchema);
