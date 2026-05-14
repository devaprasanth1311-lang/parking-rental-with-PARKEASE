// backend/routes/transaction.js
const router = require('express').Router();
const ctrl   = require('../controllers/transactionController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/my',  verifyToken, checkRole('client', 'admin'), ctrl.getMyTransactions);
router.get('/all', verifyToken, checkRole('admin'),  ctrl.getAllTransactions);

module.exports = router;
