// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors({ origin: function (origin, callback) { callback(null, true); }, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/parking', require('./routes/parking'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/transactions', require('./routes/transaction'));
app.use('/api/admin', require('./routes/admin'));

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/parking-rental')
  .then(async () => {
    console.log('✅ MongoDB connected');
    const { seedAdmin } = require('./controllers/authController');
    await seedAdmin();
  })
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
