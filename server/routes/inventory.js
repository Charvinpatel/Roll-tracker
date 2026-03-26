const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Dispatch = require('../models/Dispatch');
const Return = require('../models/Return');
const Vendor = require('../models/Vendor');

// GET full dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const inventory = await Inventory.findOne().sort({ createdAt: -1 });
    const totalStock = inventory?.totalRolls || 0;

    const dispatchAgg = await Dispatch.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const returnAgg = await Return.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const totalDispatched = dispatchAgg[0]?.total || 0;
    const totalReturned = returnAgg[0]?.total || 0;
    const rollsWithVendors = totalDispatched - totalReturned;
    const availableRolls = totalStock - rollsWithVendors;

    // Per-vendor summary
    const vendors = await Vendor.find({ isActive: true });
    const vendorStats = await Promise.all(vendors.map(async (v) => {
      const vDispatched = await Dispatch.aggregate([
        { $match: { vendor: v._id } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      const vReturned = await Return.aggregate([
        { $match: { vendor: v._id } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      const dispatched = vDispatched[0]?.total || 0;
      const returned = vReturned[0]?.total || 0;
      const lastDispatch = await Dispatch.findOne({ vendor: v._id }).sort({ dispatchDate: -1 });
      const lastReturn = await Return.findOne({ vendor: v._id }).sort({ returnDate: -1 });
      return {
        _id: v._id,
        name: v.name,
        phone: v.phone,
        totalDispatched: dispatched,
        totalReturned: returned,
        rollsWithVendor: dispatched - returned,
        lastDispatchDate: lastDispatch?.dispatchDate || null,
        lastReturnDate: lastReturn?.returnDate || null,
      };
    }));

    res.json({
      totalStock,
      totalDispatched,
      totalReturned,
      rollsWithVendors,
      availableRolls,
      vendorStats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET/SET total stock
router.get('/', async (req, res) => {
  try {
    const inventory = await Inventory.findOne().sort({ createdAt: -1 });
    res.json(inventory || { totalRolls: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const existing = await Inventory.findOne();
    if (existing) {
      existing.totalRolls = req.body.totalRolls;
      existing.lastUpdated = Date.now();
      existing.notes = req.body.notes;
      await existing.save();
      return res.json(existing);
    }
    const inv = new Inventory(req.body);
    const saved = await inv.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
