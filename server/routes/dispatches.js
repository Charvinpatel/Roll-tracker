const express = require('express');
const router = express.Router();
const Dispatch = require('../models/Dispatch');

// GET all dispatches (optionally filter by vendor)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.vendor) filter.vendor = req.query.vendor;
    const dispatches = await Dispatch.find(filter)
      .populate('vendor', 'name phone')
      .sort({ dispatchDate: -1 });
    res.json(dispatches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create dispatch
router.post('/', async (req, res) => {
  try {
    const dispatch = new Dispatch(req.body);
    const saved = await dispatch.save();
    const populated = await saved.populate('vendor', 'name phone');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update dispatch (edit date, quantity, notes)
router.put('/:id', async (req, res) => {
  try {
    const dispatch = await Dispatch.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('vendor', 'name phone');
    if (!dispatch) return res.status(404).json({ message: 'Dispatch not found' });
    res.json(dispatch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE dispatch
router.delete('/:id', async (req, res) => {
  try {
    await Dispatch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dispatch deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
