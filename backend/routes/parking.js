// backend/routes/parking.js
const router = require('express').Router();
const ctrl   = require('../controllers/parkingController');
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/',              ctrl.getApprovedSpaces);
router.get('/predict-size',  ctrl.predictSize);
router.get('/my-spaces',     verifyToken, ctrl.getOwnerSpaces);
router.get('/:id',           ctrl.getSpaceById);
router.post('/send-otp',     verifyToken, ctrl.sendParkingOtp);
router.post('/',             verifyToken, upload.fields([
  { name: 'photos', maxCount: 8 },
  { name: 'landProof', maxCount: 1 },
  { name: 'nationalIdProof', maxCount: 1 },
  { name: 'ownerPhoto', maxCount: 1 },
]), ctrl.createSpace);
router.put('/:id',           verifyToken, upload.fields([
  { name: 'photos', maxCount: 8 },
  { name: 'landProof', maxCount: 1 },
  { name: 'nationalIdProof', maxCount: 1 },
  { name: 'ownerPhoto', maxCount: 1 },
]), ctrl.updateSpace);
router.delete('/:id',        verifyToken, ctrl.deleteSpace);

module.exports = router;
