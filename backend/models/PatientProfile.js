const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  height: { type: Number }, // cm
  weight: { type: Number }, // kg
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  emergencyContacts: [{
    name: { type: String, required: true },
    relationship: { type: String },
    phone: { type: String, required: true },
    email: { type: String }
  }],
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    validTill: Date
  },
  primaryDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  currentRecoveryPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'RecoveryPlan' }
}, { timestamps: true });



module.exports = mongoose.model('PatientProfile', patientProfileSchema);
