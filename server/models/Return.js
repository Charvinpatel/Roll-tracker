const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  quantity: { type: Number, required: true, min: 1 },
  returnDate: { type: Date, required: true, default: Date.now },
  notes: { type: String, trim: true },
}, { timestamps: true });

returnSchema.index({ vendor: 1 });
returnSchema.index({ returnDate: -1 });

module.exports = mongoose.model('Return', returnSchema);
