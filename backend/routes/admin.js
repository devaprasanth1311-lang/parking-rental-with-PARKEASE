// backend/routes/admin.js
const router = require('express').Router();
const ctrl   = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middleware/auth');

const guard = [verifyToken, checkRole('admin')];

router.get('/stats',                    ...guard, ctrl.getStats);
router.get('/users',                    ...guard, ctrl.getAllUsers);
router.put('/users/:id/toggle',         ...guard, ctrl.toggleUserStatus);
router.get('/spaces',                   ...guard, ctrl.getAllSpaces);
router.put('/spaces/:id/approve',       ...guard, ctrl.approveSpace);
router.put('/spaces/:id/reject',        ...guard, ctrl.rejectSpace);
router.put('/spaces/:id/deactivate',    ...guard, ctrl.deactivateSpace);
router.put('/spaces/:id/activate',      ...guard, ctrl.activateSpace);
router.get('/bookings',                 ...guard, ctrl.getAllBookings);
router.get('/transactions',             ...guard, ctrl.getAllTransactions);

module.exports = router;
