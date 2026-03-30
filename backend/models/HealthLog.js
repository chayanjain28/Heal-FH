const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  vitals: {
    heartRate: { type: Number, min: 30, max: 250 }, // bpm
    bloodPressureSystolic: { type: Number, min: 60, max: 250 }, // mmHg
    bloodPressureDiastolic: { type: Number, min: 40, max: 150 }, // mmHg
    temperature: { type: Number, min: 34, max: 42 }, // Celsius
    oxygenSaturation: { type: Number, min: 70, max: 100 }, // %
    respiratoryRate: { type: Number, min: 5, max: 60 }, // breaths/min
    bloodGlucose: { type: Number }, // mg/dL
    weight: { type: Number } // kg
  },
  symptoms: [{
    name: { type: String },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
    notes: { type: String }
  }],
  painLevel: { type: Number, min: 0, max: 10, default: 0 },
  mood: { type: String, enum: ['excellent', 'good', 'fair', 'poor', 'terrible'] },
  sleepHours: { type: Number, min: 0, max: 24 },
  activityLevel: { type: String, enum: ['bedrest', 'minimal', 'light', 'moderate', 'active'] },
  notes: { type: String },
  loggedBy: { type: String, enum: ['patient', 'caregiver', 'nurse'], default: 'patient' }
}, { timestamps: true });

healthLogSchema.index({ patient: 1, timestamp: -1 });

module.exports = mongoose.model('HealthLog', healthLogSchema);
