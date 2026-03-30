const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  qualifications: [{ type: String }],
  experience: { type: Number, required: true }, // years
  hospital: { type: String },
  clinic: { type: String },
  photo: { type: String, default: null },
  rating: { type: Number, min: 0, max: 5, default: 4.0 },
  reviewCount: { type: Number, default: 0 },
  consultationFee: { type: Number },
  phone: { type: String },
  email: { type: String },
  availableSlots: [{
    day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    slots: [{ startTime: String, endTime: String, isBooked: { type: Boolean, default: false } }]
  }],
  conditions: [{ type: String }], // conditions they treat
  bio: { type: String },
  isAvailable: { type: Boolean, default: true },
  languages: [{ type: String }],
  location: { city: String, state: String }
}, { timestamps: true });

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ rating: -1 });
doctorSchema.index({ conditions: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
