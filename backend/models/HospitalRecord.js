const mongoose = require('mongoose');

const hospitalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalName: { type: String, required: true },
  admissionDate: { type: Date, required: true },
  dischargeDate: { type: Date },
  diagnosis: [{ type: String }],
  primaryDiagnosis: { type: String },
  surgeries: [{
    name: String,
    date: Date,
    surgeon: String,
    notes: String
  }],
  treatmentSummary: { type: String },
  doctorNotes: { type: String },
  dischargeInstructions: { type: String },
  attendingDoctor: { type: String },
  ward: { type: String },
  roomNumber: { type: String },
  documents: [{ filename: String, url: String, uploadedAt: { type: Date, default: Date.now } }],
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  status: { type: String, enum: ['active', 'discharged', 'readmitted'], default: 'discharged' }
}, { timestamps: true });

hospitalRecordSchema.index({ patient: 1 });
hospitalRecordSchema.index({ dischargeDate: -1 });

module.exports = mongoose.model('HospitalRecord', hospitalRecordSchema);
