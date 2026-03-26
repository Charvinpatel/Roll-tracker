const express = require('express');
const router = express.Router();
const Return = require('../models/Return');

// GET all returns (optionally filter by vendor)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.vendor) filter.vendor = req.query.vendor;
    const returns = await Return.find(filter)
      .populate('vendor', 'name phone')
      .sort({ returnDate: -1 });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create return
router.post('/', async (req, res) => {
  try {
    const ret = new Return(req.body);
    const saved = await ret.save();
    const populated = await saved.populate('vendor', 'name phone');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update return
router.put('/:id', async (req, res) => {
  try {
    const ret = await Return.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('vendor', 'name phone');
    if (!ret) return res.status(404).json({ message: 'Return not found' });
    res.json(ret);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE return
router.delete('/:id', async (req, res) => {
  try {
    await Return.findByIdAndDelete(req.params.id);
    res.json({ message: 'Return deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
