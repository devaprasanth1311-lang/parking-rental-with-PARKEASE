// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  phone:    { type: String, unique: true, sparse: true, trim: true },
  password: { type: String },
  role:     { type: String, enum: ['client', 'admin'], default: 'client' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
