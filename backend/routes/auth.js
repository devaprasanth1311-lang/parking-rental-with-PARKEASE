// backend/routes/auth.js
const router = require('express').Router();
const { register, login, sendOtp, verifyOtp, sendPhoneOtp, verifyPhoneOtp, testSmsConfig } = require('../controllers/authController');

router.post('/register',        register);
router.post('/login',           login);
router.post('/send-otp',        sendOtp);
router.post('/verify-otp',      verifyOtp);
router.post('/send-phone-otp',  sendPhoneOtp);
router.post('/verify-phone-otp', verifyPhoneOtp);
router.get('/sms-config',       testSmsConfig);

module.exports = router;
