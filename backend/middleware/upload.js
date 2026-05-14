// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`),
});

const fileFilter = (req, file, cb) => {
  // Allow images + PDF for land proof documents
  const allowed = /jpeg|jpg|png|webp|pdf/;
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
