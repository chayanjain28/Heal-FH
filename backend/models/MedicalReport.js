const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String },
  fileUrl: { type: String },
  fileType: { type: String, enum: ['pdf', 'image', 'other'] },
  reportType: { type: String, enum: ['lab', 'radiology', 'prescription', 'discharge', 'other'], default: 'other' },
  reportDate: { type: Date },
  analyzedAt: { type: Date },
  analysis: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    diagnoses: [{ type: String }],
    labValues: [{
      test: String,
      value: String,
      unit: String,
      normalRange: String,
      status: { type: String, enum: ['normal', 'abnormal', 'critical'] }
    }],
    restrictions: [{ type: String }],
    followUpInstructions: [{ type: String }],
    summary: { type: String },
    rawText: { type: String }
  },
  isAnalyzed: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

medicalReportSchema.index({ patient: 1 });

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
