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

    // Per-vendor summary using mass aggregation
    const vendors = await Vendor.find({ isActive: true }).lean();
    
    const dispatchStats = await Dispatch.aggregate([
      { $group: { 
          _id: '$vendor', 
          total: { $sum: '$quantity' },
          lastDate: { $max: '$dispatchDate' }
      }}
    ]);

    const returnStats = await Return.aggregate([
      { $group: { 
          _id: '$vendor', 
          total: { $sum: '$quantity' },
          lastDate: { $max: '$returnDate' }
      }}
    ]);

    const dMap = dispatchStats.reduce((acc, s) => { acc[s._id] = s; return acc; }, {});
    const rMap = returnStats.reduce((acc, s) => { acc[s._id] = s; return acc; }, {});

    const vendorStats = vendors.map(v => {
      const d = dMap[v._id] || { total: 0, lastDate: null };
      const r = rMap[v._id] || { total: 0, lastDate: null };
      return {
        ...v,
        totalDispatched: d.total,
        totalReturned: r.total,
        rollsWithVendor: d.total - r.total,
        lastDispatchDate: d.lastDate,
        lastReturnDate: r.lastDate,
      };
    });

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
