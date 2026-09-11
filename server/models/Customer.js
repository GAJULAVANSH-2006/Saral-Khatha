const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String },
    phone: { type: String },
    gstin: { type: String },
    address: { type: String },
    state: { type: String },
    industry: { type: String },
    notes: { type: String },
    customFields: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', CustomerSchema);
