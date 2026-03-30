const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  genericName: { type: String },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  route: { type: String, enum: ['oral', 'injection', 'topical', 'inhaled', 'other'], default: 'oral' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  instructions: { type: String },
  sideEffects: [{ type: String }],
  prescribedBy: { type: String },
  isActive: { type: Boolean, default: true },
  reminderTimes: [{ type: String }], // e.g., ["08:00", "14:00", "21:00"]
  logs: [{
    takenAt: { type: Date },
    status: { type: String, enum: ['taken', 'missed', 'skipped'], default: 'taken' },
    notes: { type: String }
  }]
}, { timestamps: true });

medicationSchema.index({ patient: 1, isActive: 1 });

module.exports = mongoose.model('Medication', medicationSchema);
