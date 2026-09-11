const express = require('express');
const { protect } = require('../middleware/auth');
const CustomField = require('../models/CustomField');

const router = express.Router();

// GET /api/custom-fields?entity=invoice
router.get('/', protect, async (req, res, next) => {
  try {
    const { entity } = req.query;
    const filter = { user: req.user._id };
    if (entity) filter.entity = entity;
    const fields = await CustomField.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: fields });
  } catch (err) {
    next(err);
  }
});

// POST /api/custom-fields
router.post('/', protect, async (req, res, next) => {
  try {
    const count = await CustomField.countDocuments({ user: req.user._id, entity: req.body.entity });
    const field = await CustomField.create({ ...req.body, user: req.user._id, order: count });
    res.status(201).json({ success: true, data: field });
  } catch (err) {
    next(err);
  }
});

// PUT /api/custom-fields/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const field = await CustomField.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!field) return res.status(404).json({ success: false, message: 'Field not found' });
    res.json({ success: true, data: field });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/custom-fields/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await CustomField.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
