const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    category: {
      type: String,
      enum: ['Invoice Payment', 'Expense', 'Salary', 'Tax', 'Loan', 'Owner Withdrawal', 'Other'],
      default: 'Other',
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    reference: { type: String }, // invoice or expense ID
    paymentMode: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque'], default: 'UPI' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customFields: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
