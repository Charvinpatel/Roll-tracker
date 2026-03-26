const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  totalRolls: { type: Number, required: true, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
