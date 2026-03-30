const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['vital', 'medication', 'complication', 'emergency', 'reminder', 'system'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notifiedCaregivers: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

alertSchema.index({ patient: 1, isRead: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
