// backend/controllers/transactionController.js
const Transaction = require('../models/Transaction');

exports.getMyTransactions = async (req, res) => {
  try {
    const txns = await Transaction.find({ customerId: req.user._id })
      .populate('bookingId')
      .sort({ createdAt: -1 });
    res.json(txns);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const txns = await Transaction.find()
      .populate('customerId', 'username email')
      .populate('bookingId')
      .sort({ createdAt: -1 });
    res.json(txns);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
