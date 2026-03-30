const mongoose = require('mongoose');

const recoveryPlanSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'HospitalRecord' },
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, default: Date.now },
  expectedEndDate: { type: Date },
  phase: { type: String, enum: ['acute', 'subacute', 'maintenance'], default: 'acute' },
  goals: [{
    description: { type: String },
    targetDate: { type: Date },
    isCompleted: { type: Boolean, default: false }
  }],
  exercises: [{
    name: { type: String },
    description: { type: String },
    frequency: { type: String },
    duration: { type: String },
    isActive: { type: Boolean, default: true }
  }],
  dietaryGuidelines: [{ type: String }],
  restrictions: [{ type: String }],
  milestones: [{
    title: { type: String },
    description: { type: String },
    targetDate: { type: Date },
    achievedDate: { type: Date },
    isAchieved: { type: Boolean, default: false }
  }],
  currentScore: { type: Number, min: 0, max: 100, default: 50 },
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
  aiGenerated: { type: Boolean, default: false }
}, { timestamps: true });

recoveryPlanSchema.index({ patient: 1, isActive: 1 });

module.exports = mongoose.model('RecoveryPlan', recoveryPlanSchema);
