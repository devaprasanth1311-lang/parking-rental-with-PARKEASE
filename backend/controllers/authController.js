// backend/controllers/authController.js
const User    = require('../models/User');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const nodemailer = require('nodemailer');
const msg91   = require('../config/msg91');

// In-memory OTP store: { key: { otp, expiresAt } }  key = email or phone
const otpStore = new Map();

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '7d' });

// Create nodemailer transporter
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

exports.register = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { username }, ...(phone ? [{ phone }] : [])] });
    if (exists) return res.status(409).json({ message: 'Email, username, or phone already in use' });
    const user  = await User.create({ username, email, phone: phone || undefined, password: password || undefined, role: 'client' });
    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// STEP 1: Send OTP (supports email or phone)
exports.sendOtp = async (req, res) => {
  try {
    const { email, phone, role, password } = req.body;
    const loginMethod = phone ? 'phone' : 'email';
    const identifier = phone || email;

    if (!identifier) return res.status(400).json({ message: 'Email or phone number is required' });

    // Find user by email or phone
    const query = phone ? { phone } : { email };
    const user = await User.findOne(query);
    if (!user || !user.isActive)
      return res.status(401).json({ message: `No account found with this ${loginMethod}` });

    // For admin: verify password first
    if (role === 'admin') {
      if (user.role !== 'admin')
        return res.status(403).json({ message: 'Not an admin account' });
      if (!password)
        return res.status(400).json({ message: 'Password required for admin login' });
      const match = await user.comparePassword(password);
      if (!match) return res.status(401).json({ message: 'Invalid password' });
    }

    // ── PHONE OTP via MSG91 ──
    if (loginMethod === 'phone') {
      if (process.env.NODE_ENV === 'production' && process.env.MSG91_TEMPLATE_ID) {
        // Production: MSG91 sends & manages the OTP
        await msg91.sendOtp(phone);
        // We don't store OTP locally — MSG91 handles verification
        otpStore.set(identifier, { provider: 'msg91', expiresAt: Date.now() + 10 * 60 * 1000 });
        return res.json({ message: 'OTP sent successfully via SMS', provider: 'msg91' });
      } else {
        // Dev mode or MSG91 not configured: generate real random OTP, log to console
        const otp = generateOtp();
        otpStore.set(identifier, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
        console.log(`\n╔════════════════════════════════════════╗`);
        console.log(`║  📱 OTP for ${phone}: ${otp}          ║`);
        console.log(`║  ⏱️  Expires in 10 minutes              ║`);
        console.log(`╚════════════════════════════════════════╝\n`);
        return res.json({ message: 'OTP sent successfully via SMS', provider: 'local' });
      }
    }

    // ── EMAIL OTP (self-generated) ──
    const otp = generateOtp();
    otpStore.set(identifier, { otp, expiresAt: Date.now() + 10 * 60 * 1000, email: user.email });

    if (process.env.SMTP_USER && !process.env.SMTP_USER.includes('your_email')) {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"ParkEase" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your ParkEase Login OTP',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
            <div style="text-align:center;margin-bottom:24px;">
              <h1 style="color:#1e40af;font-size:28px;margin:0;">🅿️ ParkEase</h1>
            </div>
            <h2 style="color:#1e293b;font-size:20px;">Your Login OTP</h2>
            <p style="color:#64748b;">Use this one-time password to sign in. It expires in <strong>10 minutes</strong>.</p>
            <div style="background:#1e40af;color:white;text-align:center;font-size:36px;font-weight:bold;letter-spacing:12px;padding:20px;border-radius:12px;margin:24px 0;">
              ${otp}
            </div>
            <p style="color:#94a3b8;font-size:12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    } else {
      console.log(`\n╔════════════════════════════════════════╗`);
      console.log(`║  📧 OTP for ${email}: ${otp}  ║`);
      console.log(`║  ⏱️  Expires in 10 minutes              ║`);
      console.log(`╚════════════════════════════════════════╝\n`);
    }

    res.json({ message: `OTP sent successfully via ${loginMethod}` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// STEP 2: Verify OTP & Login
exports.verifyOtp = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;
    const identifier = phone || email;
    const stored = otpStore.get(identifier);

    if (!stored) return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(identifier);
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // ── MSG91 verification (phone in production) ──
    if (stored.provider === 'msg91') {
      try {
        const result = await msg91.verifyOtp(phone, otp);
        if (result.type === 'error') {
          return res.status(400).json({ message: result.message || 'Invalid OTP' });
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'OTP verification failed';
        return res.status(400).json({ message: errMsg });
      }
      otpStore.delete(identifier);
    } else {
      // ── Local verification ──
      if (stored.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
      otpStore.delete(identifier);
    }

    const query = phone ? { phone } : { email };
    const user = await User.findOne(query);
    if (!user || !user.isActive)
      return res.status(401).json({ message: 'Account not found or inactive' });

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Send OTP for phone verification (space listing / driveway registration)
exports.sendPhoneOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    // Clean the phone number
    const cleanPhone = phone.replace(/[\s\-\+]/g, '');

    if (process.env.NODE_ENV === 'production' && process.env.MSG91_TEMPLATE_ID) {
      // Production with MSG91 configured: Send real SMS OTP
      await msg91.sendOtp(cleanPhone);
      otpStore.set(`verify_${cleanPhone}`, { provider: 'msg91', phone: cleanPhone, expiresAt: Date.now() + 10 * 60 * 1000 });
      const maskedPhone = cleanPhone.replace(/(.{3}).+(.{2})$/, '$1****$2');
      console.log(`📱 MSG91 OTP sent to ${maskedPhone} for phone verification`);
      return res.json({ message: `OTP sent to ${maskedPhone}`, sentTo: maskedPhone });
    }

    // Dev mode or MSG91 not configured: Generate real random OTP and log it
    const otp = generateOtp();
    otpStore.set(`verify_${cleanPhone}`, { otp, phone: cleanPhone, expiresAt: Date.now() + 10 * 60 * 1000 });
    
    const maskedPhone = cleanPhone.replace(/(.{3}).+(.{2})$/, '$1****$2');
    console.log(`\n╔══════════════════════════════════════════════╗`);
    console.log(`║  📱 PHONE VERIFICATION OTP                   ║`);
    console.log(`║  Phone: ${cleanPhone}                        ║`);
    console.log(`║  OTP:   ${otp}                               ║`);
    console.log(`║  ⏱️  Expires in 10 minutes                    ║`);
    console.log(`║                                              ║`);
    console.log(`║  ℹ️  To send real SMS, configure MSG91:       ║`);
    console.log(`║     1. Set MSG91_TEMPLATE_ID in .env         ║`);
    console.log(`║     2. Set NODE_ENV=production               ║`);
    console.log(`╚══════════════════════════════════════════════╝\n`);

    res.json({ message: `OTP sent to ${maskedPhone}`, sentTo: maskedPhone });
  } catch (err) {
    console.error('❌ Send Phone OTP Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Verify phone OTP for space listing
exports.verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    const stored = otpStore.get(`verify_${cleanPhone}`);

    if (!stored) return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(`verify_${cleanPhone}`);
      return res.status(400).json({ message: 'OTP expired.' });
    }

    // ── MSG91 verification (production) ──
    if (stored.provider === 'msg91') {
      try {
        const result = await msg91.verifyOtp(cleanPhone, otp);
        if (result.type === 'error') {
          return res.status(400).json({ message: result.message || 'Invalid OTP' });
        }
        console.log(`✅ Phone ${cleanPhone} verified via MSG91`);
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'OTP verification failed';
        return res.status(400).json({ message: errMsg });
      }
    } else {
      // ── Local verification ──
      if (stored.otp !== otp) {
        console.log(`❌ Invalid OTP for ${cleanPhone}: entered=${otp}, expected=${stored.otp}`);
        return res.status(400).json({ message: 'Invalid OTP' });
      }
      console.log(`✅ Phone ${cleanPhone} verified locally (OTP matched)`);
    }

    otpStore.delete(`verify_${cleanPhone}`);
    res.json({ verified: true, message: 'Phone verified successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Test MSG91 configuration status
exports.testSmsConfig = (req, res) => {
  const config = msg91.testConfig();
  res.json({
    message: config.ready 
      ? '✅ MSG91 is fully configured and ready to send real SMS OTPs'
      : '⚠️ MSG91 is not fully configured. OTPs will be logged to server console.',
    config,
    instructions: !config.ready ? [
      '1. Log in to MSG91 dashboard: https://control.msg91.com',
      '2. Go to OTP section → Templates',
      '3. Create a template with ##OTP## placeholder',
      '4. Copy the Template ID',
      '5. Add MSG91_TEMPLATE_ID=<your-template-id> to .env',
      '6. Set NODE_ENV=production in .env',
      '7. Restart the server',
    ] : undefined,
  });
};

// Legacy direct login (keep for compatibility)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isActive)
      return res.status(401).json({ message: 'Invalid credentials or account inactive' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@parking.com';
  const exists = await User.findOne({ email: adminEmail });
  if (!exists) {
    await User.create({
      username: 'admin',
      email:    adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      role:     'admin',
    });
    console.log('✅ Admin seeded:', adminEmail);
  }
};
