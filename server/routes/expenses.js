const express = require('express');
const { protect } = require('../middleware/auth');
const Expense = require('../models/Expense');

const router = express.Router();

// Industry benchmarks (% of revenue) — static reference
const BENCHMARKS = {
  Rent: 0.15,
  Staff: 0.30,
  Utilities: 0.08,
  Marketing: 0.10,
  Logistics: 0.12,
  'Raw Material': 0.35,
  Miscellaneous: 0.05,
};

// GET /api/expenses
router.get('/', protect, async (req, res, next) => {
  try {
    const { category, from, to, page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };
    if (category) filter.category = category;
    if (from || to) filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);

    const total = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: expenses, total });
  } catch (err) {
    next(err);
  }
});

// POST /api/expenses
router.post('/', protect, async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
});

// PUT /api/expenses/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

// GET /api/expenses/analytics - spending by category + benchmark comparison
router.get('/analytics', protect, async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filter = { user: req.user._id };
    if (from || to) filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);

    const byCategory = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const totalSpend = byCategory.reduce((s, c) => s + c.total, 0);

    const analytics = byCategory.map((c) => ({
      category: c._id,
      total: c.total,
      count: c.count,
      shareOfSpend: totalSpend > 0 ? c.total / totalSpend : 0,
      benchmark: BENCHMARKS[c._id] || null,
    }));

    res.json({ success: true, data: analytics, totalSpend, benchmarks: BENCHMARKS });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
