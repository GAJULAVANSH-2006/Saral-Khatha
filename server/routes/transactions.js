const express = require('express');
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

const router = express.Router();

// GET /api/transactions
router.get('/', protect, async (req, res, next) => {
  try {
    const { type, category, from, to, page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (from || to) filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate('customer', 'name')
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // PnL summary
    const all = await Transaction.find({ user: req.user._id });
    const totalCredit = all.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const totalDebit = all.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

    res.json({ success: true, data: transactions, total, summary: { totalCredit, totalDebit, net: totalCredit - totalDebit } });
  } catch (err) {
    next(err);
  }
});

// POST /api/transactions
router.post('/', protect, async (req, res, next) => {
  try {
    const txn = await Transaction.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: txn });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
