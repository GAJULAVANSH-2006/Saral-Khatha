const express = require('express');
const { protect } = require('../middleware/auth');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');

const router = express.Router();

// GET /api/customers
router.get('/', protect, async (req, res, next) => {
  try {
    const customers = await Customer.find({ user: req.user._id }).sort({ name: 1 });
    res.json({ success: true, data: customers });
  } catch (err) {
    next(err);
  }
});

// POST /api/customers
router.post('/', protect, async (req, res, next) => {
  try {
    const customer = await Customer.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
});

// PUT /api/customers/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/customers/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Customer.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/profitability — revenue, costs, margin per customer
router.get('/profitability', protect, async (req, res, next) => {
  try {
    const customers = await Customer.find({ user: req.user._id });

    const results = await Promise.all(
      customers.map(async (cust) => {
        const paidInvoices = await Invoice.find({
          user: req.user._id,
          customer: cust._id,
          status: 'paid',
        });
        const revenue = paidInvoices.reduce((s, i) => s + i.total, 0);
        const invoiceCount = paidInvoices.length;

        // allocate expenses equally across customers for simplicity
        // (in a real system, direct expense linking would be better)
        const custExpenses = await Expense.aggregate([
          { $match: { user: req.user._id } },
        ]);
        const totalExpenses = custExpenses.reduce((s, e) => s + e.amount, 0);
        const custCount = customers.length;
        const allocatedExpenses = custCount > 0 ? totalExpenses / custCount : 0;

        const profit = revenue - allocatedExpenses;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          customer: { id: cust._id, name: cust.name, email: cust.email, phone: cust.phone },
          revenue,
          profit: Math.round(profit),
          margin: Math.round(margin * 10) / 10,
          invoiceCount,
        };
      })
    );

    results.sort((a, b) => b.revenue - a.revenue);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
