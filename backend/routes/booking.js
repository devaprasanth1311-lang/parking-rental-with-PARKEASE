// backend/routes/booking.js
const router = require('express').Router();
const ctrl   = require('../controllers/bookingController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.post('/send-otp',            verifyToken, checkRole('client'), ctrl.sendBookingOtp);
router.post('/',                  verifyToken, checkRole('client'), ctrl.createBooking);
router.get('/my',                 verifyToken, checkRole('client'), ctrl.getMyBookings);
router.put('/:id/pay',            verifyToken, checkRole('client'), ctrl.payBooking);
router.put('/:id/cancel',         verifyToken, checkRole('client'), ctrl.cancelBooking);
router.put('/:id/extend',         verifyToken, checkRole('client'), ctrl.extendBooking);
router.get('/owner/bookings',     verifyToken, checkRole('client'), ctrl.getOwnerBookings);

module.exports = router;
