const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  qty: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true },
  gstRate: { type: Number, default: 18 }, // percent
  amount: { type: Number },
});

LineItemSchema.pre('save', function (next) {
  this.amount = this.qty * this.rate;
  next();
});

const InvoiceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceNumber: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    lineItems: [LineItemSchema],
    subtotal: { type: Number, default: 0 },
    totalGst: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    notes: { type: String },
    customFields: { type: Map, of: mongoose.Schema.Types.Mixed },
    reminderSent: { type: Boolean, default: false },
    reminderChannels: [{ type: String, enum: ['sms', 'email', 'whatsapp'] }],
  },
  { timestamps: true }
);

// Auto-calc totals before save
InvoiceSchema.pre('save', function (next) {
  this.lineItems.forEach((item) => {
    item.amount = item.qty * item.rate;
  });
  this.subtotal = this.lineItems.reduce((s, i) => s + i.amount, 0);
  this.totalGst = this.lineItems.reduce((s, i) => s + (i.amount * i.gstRate) / 100, 0);
  this.total = this.subtotal + this.totalGst;
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
