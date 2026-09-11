const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: ['Rent', 'Staff', 'Utilities', 'Marketing', 'Logistics', 'Raw Material', 'Miscellaneous'],
      required: true,
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    vendor: { type: String },
    paymentMode: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque'],
      default: 'UPI',
    },
    receipt: { type: String }, // file path / URL
    customFields: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', ExpenseSchema);
