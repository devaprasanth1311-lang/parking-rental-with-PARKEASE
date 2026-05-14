// backend/controllers/parkingController.js
const ParkingSpace = require('../models/ParkingSpace');
const { predictVehicleSize, sizeOrder, canFit } = require('../config/vehicleDatabase');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const parkingOtpStore = new Map();

const getTransporter = () => nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

exports.sendParkingOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Validate email starts with lowercase and has @
    if (!/^[a-z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ message: 'Email must start with a lowercase letter and be valid.' });
    }

    const otp = generateOtp();
    parkingOtpStore.set(`parking_${req.user._id}`, {
      otp,
      email,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    if (process.env.SMTP_USER && !process.env.SMTP_USER.includes('your_email')) {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"ParkEase" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Driveway Registration OTP — ParkEase',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
            <div style="text-align:center;margin-bottom:24px;">
              <img src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80" alt="Driveway" style="width:100%;border-radius:12px;margin-bottom:16px;" />
              <h1 style="color:#1e40af;font-size:28px;margin:0;">🅿️ ParkEase</h1>
            </div>
            <p style="color:#1e293b;font-size:16px;line-height:1.5;">YOUR OTP <strong style="font-size:24px;color:#1e40af;">${otp}</strong> for adding driveway WITH PARKEASE IS THIS AND DO NOT SHARE THIS FOR SECURITY CONCERNS</p>
          </div>
        `,
      });
    } else {
      console.log(`\n🔑 PARKING OTP for ${email}: ${otp}\n`);
    }

    res.json({ message: `OTP sent to ${email}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSpace = async (req, res) => {
  try {
    const { title, description, address, city, pincode, landmark, lat, lng,
            pricePerHour, pricePerDay, cctvUrl, totalSpots, ownerName, ownerPhone,
            phoneVerified, slotSizes } = req.body;
    const photos = req.files && req.files.photos
      ? req.files.photos.map(f => `/uploads/${f.filename}`)
      : [];
    const landProofFile = req.files && req.files.landProof
      ? req.files.landProof[0]
      : null;
    const nationalIdProofFile = req.files && req.files.nationalIdProof
      ? req.files.nationalIdProof[0]
      : null;
    const ownerPhotoFile = req.files && req.files.ownerPhoto
      ? req.files.ownerPhoto[0]
      : null;

    if (!landProofFile || !nationalIdProofFile || !ownerPhotoFile) {
        return res.status(400).json({ message: "All document proofs and photos are required" });
    }

    const otp = req.body.otp;
    const email = req.body.email; // we store this email as ownerEmail
    
    if (!otp) return res.status(400).json({ message: 'OTP is required to verify email' });
    
    const stored = parkingOtpStore.get(`parking_${req.user._id}`);
    if (!stored || stored.otp !== otp || stored.email !== email) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    if (Date.now() > stored.expiresAt) {
      parkingOtpStore.delete(`parking_${req.user._id}`);
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    parkingOtpStore.delete(`parking_${req.user._id}`);

    let parsedSlotSizes = [];
    if (slotSizes) {
      try { parsedSlotSizes = JSON.parse(slotSizes); } catch { parsedSlotSizes = []; }
    }

    const space = await ParkingSpace.create({
      ownerId: req.user._id,
      title,
      description,
      photos,
      landProof: `/uploads/${landProofFile.filename}`,
      nationalIdProof: `/uploads/${nationalIdProofFile.filename}`,
      ownerPhoto: `/uploads/${ownerPhotoFile.filename}`,
      ownerName: ownerName || req.user.username,
      ownerPhone: ownerPhone || '',
      phoneVerified: phoneVerified === 'true' || phoneVerified === true,
      location: {
        address,
        city: city || '',
        pincode: pincode || '',
        landmark: landmark || '',
        lat: parseFloat(lat || 0),
        lng: parseFloat(lng || 0),
      },
      slotSizes: parsedSlotSizes,
      pricePerHour: parseFloat(pricePerHour),
      pricePerDay: pricePerDay ? parseFloat(pricePerDay) : undefined,
      cctvUrl,
      totalSpots: parseInt(totalSpots) || 1,
      approvalStatus: 'pending',
      isApproved: false,
    });
    res.status(201).json(space);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Browse approved spaces with vehicle-size-based optimal ordering
exports.getApprovedSpaces = async (req, res) => {
  try {
    const { minPrice, maxPrice, address, available, vehicleModel, vehicleType } = req.query;
    const filter = { isApproved: true, approvalStatus: 'approved' };
    if (available === 'true') filter.isAvailable = true;
    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerHour.$lte = parseFloat(maxPrice);
    }
    if (address) filter['location.address'] = { $regex: address, $options: 'i' };

    let spaces = await ParkingSpace.find(filter).populate('ownerId', 'username email phone');

    // If vehicle info provided, sort by best-fit (not first-come-first-serve)
    if (vehicleModel || vehicleType) {
      const predicted = predictVehicleSize(vehicleModel, vehicleType);
      const vehicleSizeOrder = sizeOrder[predicted.size] || 2;

      // Filter: only spaces that have slots big enough
      spaces = spaces.filter(space => {
        if (!space.slotSizes || space.slotSizes.length === 0) return true; // legacy spaces
        return space.slotSizes.some(slot => canFit(slot.category, predicted.size) && slot.count > 0);
      });

      // Sort: best-fit first (smallest adequate slot)
      spaces.sort((a, b) => {
        const aSlots = (a.slotSizes || []).filter(s => canFit(s.category, predicted.size));
        const bSlots = (b.slotSizes || []).filter(s => canFit(s.category, predicted.size));
        const aBestFit = aSlots.length > 0 ? Math.min(...aSlots.map(s => sizeOrder[s.category] || 5)) : 5;
        const bBestFit = bSlots.length > 0 ? Math.min(...bSlots.map(s => sizeOrder[s.category] || 5)) : 5;
        // Prefer the slot closest to vehicle size (best fit)
        const aDiff = Math.abs(aBestFit - vehicleSizeOrder);
        const bDiff = Math.abs(bBestFit - vehicleSizeOrder);
        return aDiff - bDiff;
      });

      // Attach predicted vehicle info to response
      return res.json({ spaces, vehicleInfo: predicted });
    }

    res.json({ spaces });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getSpaceById = async (req, res) => {
  try {
    const space = await ParkingSpace.findById(req.params.id).populate('ownerId', 'username email phone');
    if (!space) return res.status(404).json({ message: 'Space not found' });
    res.json(space);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOwnerSpaces = async (req, res) => {
  try {
    const spaces = await ParkingSpace.find({ ownerId: req.user._id });
    res.json(spaces);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateSpace = async (req, res) => {
  try {
    const space = await ParkingSpace.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!space) return res.status(404).json({ message: 'Space not found or not yours' });
    const fields = ['title','description','cctvUrl','ownerName','ownerPhone'];
    fields.forEach(f => { if (req.body[f] !== undefined) space[f] = req.body[f]; });
    if (req.body.address) space.location.address = req.body.address;
    if (req.body.city)    space.location.city     = req.body.city;
    if (req.body.pincode) space.location.pincode  = req.body.pincode;
    if (req.body.landmark)space.location.landmark = req.body.landmark;
    if (req.body.lat)     space.location.lat      = parseFloat(req.body.lat);
    if (req.body.lng)     space.location.lng      = parseFloat(req.body.lng);
    if (req.body.pricePerHour) space.pricePerHour = parseFloat(req.body.pricePerHour);
    if (req.body.pricePerDay)  space.pricePerDay  = parseFloat(req.body.pricePerDay);
    if (req.body.totalSpots)   space.totalSpots   = parseInt(req.body.totalSpots);
    if (req.body.slotSizes) {
      try { space.slotSizes = JSON.parse(req.body.slotSizes); } catch {}
    }
    if (req.body.isAvailable !== undefined)
      space.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
    if (req.files) {
      if (req.files.photos) {
        const newPhotos = req.files.photos.map(f => `/uploads/${f.filename}`);
        space.photos = [...space.photos, ...newPhotos];
      }
      if (req.files.landProof) {
        space.landProof = `/uploads/${req.files.landProof[0].filename}`;
      }
    }
    await space.save();
    res.json(space);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteSpace = async (req, res) => {
  try {
    const space = await ParkingSpace.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!space) return res.status(404).json({ message: 'Space not found or not yours' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Predict vehicle size endpoint
exports.predictSize = async (req, res) => {
  try {
    const { vehicleModel, vehicleType } = req.query;
    const result = predictVehicleSize(vehicleModel, vehicleType);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
