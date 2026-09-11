const express = require('express');
const { protect } = require('../middleware/auth');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

const router = express.Router();

// GET /api/invoices
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, customer, from, to, page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (from || to) filter.issueDate = {};
    if (from) filter.issueDate.$gte = new Date(from);
    if (to) filter.issueDate.$lte = new Date(to);

    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: invoices, total, page: Number(page) });
  } catch (err) {
    next(err);
  }
});

// POST /api/invoices
router.post('/', protect, async (req, res, next) => {
  try {
    // auto-generate invoice number
    const count = await Invoice.countDocuments({ user: req.user._id });
    const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
    const invoice = await Invoice.create({ ...req.body, user: req.user._id, invoiceNumber });
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
});

// GET /api/invoices/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id }).populate('customer');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
});

// PUT /api/invoices/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    let invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const wasPaid = invoice.status === 'paid';
    Object.assign(invoice, req.body);
    await invoice.save();

    // Auto-create transaction when marked paid
    if (!wasPaid && invoice.status === 'paid') {
      const cust = await Customer.findById(invoice.customer);
      await Transaction.create({
        user: req.user._id,
        type: 'credit',
        category: 'Invoice Payment',
        description: `Payment received — ${cust?.name || 'Customer'} (${invoice.invoiceNumber})`,
        amount: invoice.total,
        reference: invoice._id.toString(),
        customer: invoice.customer,
      });
    }

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/invoices/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/invoices/:id/remind (mock reminder)
router.post('/:id/remind', protect, async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    const { channels = ['email'] } = req.body;
    invoice.reminderSent = true;
    invoice.reminderChannels = channels;
    await invoice.save();
    res.json({ success: true, message: `Reminder sent via ${channels.join(', ')}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
