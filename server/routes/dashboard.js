const express = require('express');
const { protect } = require('../middleware/auth');
const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const { computeHealthScore } = require('../utils/healthScore');

const router = express.Router();

// GET /api/dashboard/summary
router.get('/summary', protect, async (req, res, next) => {
  try {
    const uid = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [invoices, expenses, overdueInvoices, lastMonthInvoices, customers] = await Promise.all([
      Invoice.find({ user: uid, issueDate: { $gte: startOfMonth }, status: { $ne: 'cancelled' } }),
      Expense.find({ user: uid, date: { $gte: startOfMonth } }),
      Invoice.find({ user: uid, status: 'overdue' }),
      Invoice.find({ user: uid, issueDate: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: { $ne: 'cancelled' } }),
      Customer.find({ user: uid }),
    ]);

    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const overdueAmount = overdueInvoices.reduce((s, i) => s + i.total, 0);
    const pendingAmount = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0);
    const prevMonthRevenue = lastMonthInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);

    // Per-customer revenue for concentration
    const customerRevMap = {};
    invoices.filter(i => i.status === 'paid').forEach(inv => {
      const cid = inv.customer.toString();
      customerRevMap[cid] = (customerRevMap[cid] || 0) + inv.total;
    });
    const customerRevenues = Object.values(customerRevMap);

    const { score, breakdown } = computeHealthScore({
      totalRevenue,
      totalExpenses,
      overdueAmount,
      customerRevenues,
      prevMonthRevenue,
    });

    // Cashflow by month (last 6)
    const cashflowMonths = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const mInv = await Invoice.find({ user: uid, issueDate: { $gte: mStart, $lte: mEnd }, status: 'paid' });
      const mExp = await Expense.find({ user: uid, date: { $gte: mStart, $lte: mEnd } });
      cashflowMonths.push({
        month: mStart.toLocaleString('default', { month: 'short' }),
        revenue: mInv.reduce((s, i) => s + i.total, 0),
        expenses: mExp.reduce((s, e) => s + e.amount, 0),
      });
    }

    res.json({
      success: true,
      data: {
        healthScore: score,
        breakdown,
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        overdueAmount,
        pendingAmount,
        totalInvoices: invoices.length,
        totalCustomers: customers.length,
        cashflow: cashflowMonths,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
