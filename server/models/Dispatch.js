const mongoose = require('mongoose');

const dispatchSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  quantity: { type: Number, required: true, min: 1 },
  dispatchDate: { type: Date, required: true, default: Date.now },
  notes: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'delivered', 'cancelled'], default: 'delivered' },
}, { timestamps: true });

module.exports = mongoose.model('Dispatch', dispatchSchema);
