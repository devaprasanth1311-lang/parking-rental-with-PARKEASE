// backend/controllers/adminController.js
const User        = require('../models/User');
const ParkingSpace= require('../models/ParkingSpace');
const Booking     = require('../models/Booking');
const Transaction = require('../models/Transaction');

exports.getStats = async (req, res) => {
  try {
    const [clients, spaces, pendingSpaces, bookings, transactions] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      ParkingSpace.countDocuments(),
      ParkingSpace.countDocuments({ approvalStatus: 'pending' }),
      Booking.countDocuments(),
      Transaction.find(),
    ]);
    const providers = await ParkingSpace.distinct('ownerId');
    const revenue = transactions.reduce((s, t) => s + t.amount, 0);
    res.json({
      clients,
      providers: providers.length,
      spaces,
      pendingSpaces,
      bookings,
      revenue: parseFloat(revenue.toFixed(2)),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllSpaces = async (req, res) => {
  try {
    const spaces = await ParkingSpace.find().populate('ownerId', 'username email phone').sort({ createdAt: -1 });
    res.json(spaces);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.approveSpace = async (req, res) => {
  try {
    const space = await ParkingSpace.findByIdAndUpdate(
      req.params.id, { isApproved: true, approvalStatus: 'approved' }, { new: true }
    );
    if (!space) return res.status(404).json({ message: 'Space not found' });
    res.json({ message: 'Space approved', space });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.rejectSpace = async (req, res) => {
  try {
    const space = await ParkingSpace.findByIdAndUpdate(
      req.params.id, { isApproved: false, approvalStatus: 'rejected' }, { new: true }
    );
    if (!space) return res.status(404).json({ message: 'Space not found' });
    res.json({ message: 'Space rejected', space });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deactivateSpace = async (req, res) => {
  try {
    const space = await ParkingSpace.findByIdAndUpdate(
      req.params.id, { isAvailable: false }, { new: true }
    );
    if (!space) return res.status(404).json({ message: 'Space not found' });
    res.json({ message: 'Space deactivated', space });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.activateSpace = async (req, res) => {
  try {
    const space = await ParkingSpace.findByIdAndUpdate(
      req.params.id, { isAvailable: true }, { new: true }
    );
    if (!space) return res.status(404).json({ message: 'Space not found' });
    res.json({ message: 'Space activated', space });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customerId', 'username email phone')
      .populate('parkingSpaceId', 'title location')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const txns = await Transaction.find()
      .populate('customerId', 'username email phone')
      .populate('bookingId')
      .sort({ createdAt: -1 });
    res.json(txns);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
