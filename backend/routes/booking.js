// backend/routes/booking.js
const router = require('express').Router();
const ctrl   = require('../controllers/bookingController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.post('/send-otp',            verifyToken, checkRole('client', 'admin'), ctrl.sendBookingOtp);
router.post('/',                  verifyToken, checkRole('client', 'admin'), ctrl.createBooking);
router.get('/my',                 verifyToken, checkRole('client', 'admin'), ctrl.getMyBookings);
router.put('/:id/pay',            verifyToken, checkRole('client', 'admin'), ctrl.payBooking);
router.put('/:id/cancel',         verifyToken, checkRole('client', 'admin'), ctrl.cancelBooking);
router.put('/:id/extend',         verifyToken, checkRole('client', 'admin'), ctrl.extendBooking);
router.get('/owner/bookings',     verifyToken, checkRole('client', 'admin'), ctrl.getOwnerBookings);

module.exports = router;
