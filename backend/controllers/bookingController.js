// backend/controllers/bookingController.js
const Booking      = require('../models/Booking');
const ParkingSpace = require('../models/ParkingSpace');
const Transaction  = require('../models/Transaction');
const User         = require('../models/User');
const crypto       = require('crypto');
const nodemailer   = require('nodemailer');
const msg91        = require('../config/msg91');
const { predictVehicleSize } = require('../config/vehicleDatabase');

// In-memory store to track which users have requested booking OTP
const bookingOtpStore = new Map();

const getTransporter = () => nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate a random 6-digit OTP
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

const MIN_HOURS = 1;
const MAX_HOURS = 24;

// STEP 1: Send OTP for booking verification
exports.sendBookingOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const phone = user.phone;
    const email = user.email;

    if (!phone && !email) return res.status(400).json({ message: 'No phone or email on account' });

    // ── PHONE OTP (preferred) ──
    if (phone) {
      const cleanPhone = phone.replace(/[\s\-\+]/g, '');

      if (process.env.NODE_ENV === 'production' && process.env.MSG91_TEMPLATE_ID) {
        // Production with MSG91: send real SMS
        await msg91.sendOtp(cleanPhone);
        bookingOtpStore.set(`booking_${req.user._id}`, {
          provider: 'msg91',
          phone: cleanPhone,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });
        console.log(`📱 MSG91 Booking OTP sent to ${cleanPhone}`);
      } else {
        // Dev mode or MSG91 not configured: generate real random OTP
        const otp = generateOtp();
        bookingOtpStore.set(`booking_${req.user._id}`, {
          otp,
          phone: cleanPhone,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });
        console.log(`\n╔══════════════════════════════════════════════╗`);
        console.log(`║  🔐 BOOKING VERIFICATION OTP                 ║`);
        console.log(`║  User:  ${user.username || user.email}        ║`);
        console.log(`║  Phone: ${cleanPhone}                        ║`);
        console.log(`║  OTP:   ${otp}                               ║`);
        console.log(`║  ⏱️  Expires in 5 minutes                     ║`);
        console.log(`╚══════════════════════════════════════════════╝\n`);
      }

      const maskedPhone = cleanPhone.replace(/(.{3}).+(.{2})$/, '$1****$2');
      return res.json({ message: `OTP sent to ${maskedPhone}`, sentTo: maskedPhone });
    }

    // ── EMAIL OTP (fallback if no phone) ──
    const otp = generateOtp();

    bookingOtpStore.set(`booking_${req.user._id}`, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    if (process.env.SMTP_USER && !process.env.SMTP_USER.includes('your_email')) {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"ParkEase" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Booking Verification OTP — ParkEase',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
            <div style="text-align:center;margin-bottom:24px;">
              <h1 style="color:#1e40af;font-size:28px;margin:0;">🅿️ ParkEase</h1>
            </div>
            <h2 style="color:#1e293b;font-size:20px;">Booking Verification OTP</h2>
            <p style="color:#64748b;">Use this one-time password to confirm your parking booking. It expires in <strong>5 minutes</strong>.</p>
            <div style="background:#1e40af;color:white;text-align:center;font-size:36px;font-weight:bold;letter-spacing:12px;padding:20px;border-radius:12px;margin:24px 0;">
              ${otp}
            </div>
            <p style="color:#94a3b8;font-size:12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    } else {
      console.log(`\n╔══════════════════════════════════════════════╗`);
      console.log(`║  🔐 BOOKING VERIFICATION OTP                 ║`);
      console.log(`║  Email: ${email}                              ║`);
      console.log(`║  OTP:   ${otp}                               ║`);
      console.log(`║  ⏱️  Expires in 5 minutes                     ║`);
      console.log(`╚══════════════════════════════════════════════╝\n`);
    }

    const maskedEmail = email.replace(/(.{2}).+(@.+)/, '$1***$2');
    res.json({ message: `OTP sent to ${maskedEmail}`, sentTo: maskedEmail });
  } catch (err) {
    console.error('❌ Send Booking OTP Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// STEP 2: Verify OTP and create booking
exports.createBooking = async (req, res) => {
  try {
    const { parkingSpaceId, startTime, endTime, vehicleModel, vehicleType, otp } = req.body;

    // Verify OTP first
    if (!otp) return res.status(400).json({ message: 'OTP is required to confirm booking' });

    const stored = bookingOtpStore.get(`booking_${req.user._id}`);
    if (!stored) return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    if (Date.now() > stored.expiresAt) {
      bookingOtpStore.delete(`booking_${req.user._id}`);
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // ── MSG91 verification (phone in production) ──
    if (stored.provider === 'msg91') {
      try {
        const result = await msg91.verifyOtp(stored.phone, otp);
        if (result.type === 'error') {
          return res.status(400).json({ message: result.message || 'Invalid OTP' });
        }
        console.log(`✅ Booking OTP verified via MSG91 for user ${req.user._id}`);
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'OTP verification failed';
        return res.status(400).json({ message: errMsg });
      }
    } else {
      // ── Local verification ──
      if (stored.otp !== otp) {
        console.log(`❌ Invalid booking OTP: entered=${otp}, expected=${stored.otp}`);
        return res.status(400).json({ message: 'Invalid OTP' });
      }
      console.log(`✅ Booking OTP verified locally for user ${req.user._id}`);
    }

    // OTP verified — clear it
    bookingOtpStore.delete(`booking_${req.user._id}`);

    if (!vehicleModel && !vehicleType)
      return res.status(400).json({ message: 'Vehicle model or type is required' });

    const space = await ParkingSpace.findById(parkingSpaceId);
    if (!space || !space.isApproved || !space.isAvailable)
      return res.status(400).json({ message: 'Space not available' });

    const hours = (new Date(endTime) - new Date(startTime)) / 3600000;
    if (hours < MIN_HOURS) return res.status(400).json({ message: `Minimum booking duration is ${MIN_HOURS} hour` });
    if (hours > MAX_HOURS) return res.status(400).json({ message: `Maximum booking duration is ${MAX_HOURS} hours (1 day)` });

    // Predict vehicle size
    const predicted = predictVehicleSize(vehicleModel, vehicleType);

    const totalPrice = parseFloat((hours * space.pricePerHour).toFixed(2));
    const booking = await Booking.create({
      customerId: req.user._id,
      parkingSpaceId,
      vehicleModel: vehicleModel || '',
      vehicleType: predicted.type,
      vehicleSize: predicted.size,
      startTime,
      endTime,
      totalPrice,
    });
    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate('parkingSpaceId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.payBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') return res.status(400).json({ message: 'Already processed' });
    booking.status = 'confirmed';
    await booking.save();
    await Transaction.create({ bookingId: booking._id, customerId: req.user._id, amount: booking.totalPrice });
    res.json({ message: 'Payment successful', booking });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!['pending','confirmed'].includes(booking.status))
      return res.status(400).json({ message: 'Cannot cancel' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Cancelled', booking });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Extend booking (only within last 10 minutes)
exports.extendBooking = async (req, res) => {
  try {
    const { extraHours } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user._id })
      .populate('parkingSpaceId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed bookings can be extended' });

    const now = new Date();
    const end = new Date(booking.endTime);
    const minsLeft = (end - now) / 60000;
    if (minsLeft > 10) return res.status(400).json({ message: 'Extension only allowed within the last 10 minutes' });
    if (minsLeft <= 0) return res.status(400).json({ message: 'Booking has already ended' });

    const h = parseFloat(extraHours);
    if (!h || h < 0.5 || h > MAX_HOURS) return res.status(400).json({ message: 'Extra hours must be between 0.5 and 24' });

    const newEnd = new Date(end.getTime() + h * 3600000);
    const extraCost = parseFloat((h * (booking.parkingSpaceId?.pricePerHour || 0)).toFixed(2));

    booking.endTime    = newEnd;
    booking.totalPrice = parseFloat((booking.totalPrice + extraCost).toFixed(2));
    await booking.save();

    await Transaction.create({
      bookingId: booking._id,
      customerId: req.user._id,
      amount: extraCost,
    });

    res.json({ message: `Extended by ${h}h. New end: ${newEnd.toISOString()}`, booking });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const spaces   = await ParkingSpace.find({ ownerId: req.user._id }).select('_id');
    const ids      = spaces.map(s => s._id);
    const bookings = await Booking.find({ parkingSpaceId: { $in: ids } })
      .populate('customerId', 'username email phone')
      .populate('parkingSpaceId', 'title location pricePerHour')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
