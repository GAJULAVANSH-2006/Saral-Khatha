const mongoose = require('mongoose');

const CustomFieldSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    entity: { type: String, enum: ['invoice', 'expense', 'customer', 'transaction'], required: true },
    label: { type: String, required: true },
    fieldType: { type: String, enum: ['text', 'number', 'date', 'dropdown', 'boolean'], default: 'text' },
    options: [{ type: String }], // for dropdown
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomField', CustomFieldSchema);
