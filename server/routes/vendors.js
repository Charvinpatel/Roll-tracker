const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const Dispatch = require('../models/Dispatch');
const Return = require('../models/Return');

// GET all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single vendor with stats
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const totalDispatched = await Dispatch.aggregate([
      { $match: { vendor: vendor._id } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const totalReturned = await Return.aggregate([
      { $match: { vendor: vendor._id } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const dispatched = totalDispatched[0]?.total || 0;
    const returned = totalReturned[0]?.total || 0;

    res.json({
      ...vendor.toObject(),
      totalDispatched: dispatched,
      totalReturned: returned,
      rollsWithVendor: dispatched - returned
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create vendor
router.post('/', async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    const saved = await vendor.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update vendor
router.put('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE vendor
router.delete('/:id', async (req, res) => {
  try {
    await Vendor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vendor deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
