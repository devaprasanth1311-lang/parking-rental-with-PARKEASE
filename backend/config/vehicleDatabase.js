// backend/config/vehicleDatabase.js
// Vehicle model → size lookup table for smart slot allocation

const vehicleDB = [
  // Bikes / Scooters — small (3 ft)
  { model: 'Activa',    type: 'bike', size: 'small', widthFt: 3 },
  { model: 'Splendor',  type: 'bike', size: 'small', widthFt: 3 },
  { model: 'Pulsar',    type: 'bike', size: 'small', widthFt: 3 },
  { model: 'Duke',      type: 'bike', size: 'small', widthFt: 3 },
  { model: 'R15',       type: 'bike', size: 'small', widthFt: 3 },
  { model: 'Jupiter',   type: 'bike', size: 'small', widthFt: 3 },
  { model: 'Access',    type: 'bike', size: 'small', widthFt: 3 },
  { model: 'Classic',   type: 'bike', size: 'small', widthFt: 3 },
  { model: 'Bullet',    type: 'bike', size: 'small', widthFt: 3 },
  { model: 'Apache',    type: 'bike', size: 'small', widthFt: 3 },
  { model: 'FZ',        type: 'bike', size: 'small', widthFt: 3 },
  { model: 'Dio',       type: 'bike', size: 'small', widthFt: 3 },
  { model: 'Ntorq',     type: 'bike', size: 'small', widthFt: 3 },
  { model: 'Fascino',   type: 'bike', size: 'small', widthFt: 3 },
  { model: 'Raider',    type: 'bike', size: 'small', widthFt: 3 },

  // Hatchbacks — medium (7 ft)
  { model: 'Swift',     type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'i10',       type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'i20',       type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'WagonR',    type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'Alto',      type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'Celerio',   type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'Tiago',     type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'Polo',      type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'Baleno',    type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'Glanza',    type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'Punch',     type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'Kwid',      type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'Ignis',     type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'Santro',    type: 'hatchback', size: 'medium', widthFt: 7 },
  { model: 'S-Presso',  type: 'hatchback', size: 'medium', widthFt: 7 },

  // Sedans — medium-large (8 ft)
  { model: 'City',      type: 'sedan', size: 'medium-large', widthFt: 8 },
  { model: 'Verna',     type: 'sedan', size: 'medium-large', widthFt: 8 },
  { model: 'Ciaz',      type: 'sedan', size: 'medium-large', widthFt: 8 },
  { model: 'Rapid',     type: 'sedan', size: 'medium-large', widthFt: 8 },
  { model: 'Amaze',     type: 'sedan', size: 'medium-large', widthFt: 8 },
  { model: 'Dzire',     type: 'sedan', size: 'medium-large', widthFt: 8 },
  { model: 'Slavia',    type: 'sedan', size: 'medium-large', widthFt: 8 },
  { model: 'Virtus',    type: 'sedan', size: 'medium-large', widthFt: 8 },
  { model: 'Tigor',     type: 'sedan', size: 'medium-large', widthFt: 8 },
  { model: 'Aura',      type: 'sedan', size: 'medium-large', widthFt: 8 },

  // SUVs / MUVs — large (9 ft)
  { model: 'Creta',     type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Seltos',    type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Fortuner',  type: 'suv', size: 'large', widthFt: 9 },
  { model: 'XUV700',    type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Thar',      type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Scorpio',   type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Hector',    type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Brezza',    type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Nexon',     type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Venue',     type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Sonet',     type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Harrier',   type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Safari',    type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Innova',    type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Ertiga',    type: 'suv', size: 'large', widthFt: 9 },
  { model: 'XL6',       type: 'suv', size: 'large', widthFt: 9 },
  { model: 'Carens',    type: 'suv', size: 'large', widthFt: 9 },

  // Trucks / Large vans — extra-large (10 ft)
  { model: 'Bolero',    type: 'truck', size: 'extra-large', widthFt: 10 },
  { model: 'Tata Ace',  type: 'truck', size: 'extra-large', widthFt: 10 },
  { model: 'Dost',      type: 'truck', size: 'extra-large', widthFt: 10 },
  { model: 'Pickup',    type: 'truck', size: 'extra-large', widthFt: 10 },
];

// Size priority order: small < medium < medium-large < large < extra-large
const sizeOrder = { 'small': 1, 'medium': 2, 'medium-large': 3, 'large': 4, 'extra-large': 5 };

// Fallback mapping when vehicle type is given but model is unknown
const typeSizeMap = {
  bike:      { size: 'small',        widthFt: 3 },
  hatchback: { size: 'medium',       widthFt: 7 },
  sedan:     { size: 'medium-large', widthFt: 8 },
  suv:       { size: 'large',        widthFt: 9 },
  truck:     { size: 'extra-large',  widthFt: 10 },
};

/**
 * Predict vehicle size from model name (fuzzy match).
 * Falls back to vehicleType if no model match found.
 */
function predictVehicleSize(modelName, vehicleType) {
  if (modelName) {
    const q = modelName.toLowerCase().trim();
    const match = vehicleDB.find(v =>
      q.includes(v.model.toLowerCase()) || v.model.toLowerCase().includes(q)
    );
    if (match) return { type: match.type, size: match.size, widthFt: match.widthFt };
  }
  if (vehicleType && typeSizeMap[vehicleType]) {
    const fb = typeSizeMap[vehicleType];
    return { type: vehicleType, size: fb.size, widthFt: fb.widthFt };
  }
  // Default to medium
  return { type: 'hatchback', size: 'medium', widthFt: 7 };
}

/**
 * Check if a slot category can fit a vehicle of given size.
 * A slot can fit a vehicle if the slot's size order >= vehicle's size order.
 */
function canFit(slotCategory, vehicleSize) {
  return (sizeOrder[slotCategory] || 2) >= (sizeOrder[vehicleSize] || 2);
}

module.exports = { vehicleDB, sizeOrder, typeSizeMap, predictVehicleSize, canFit };
