const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, required: true },
  timeSlot: { startTime: String, endTime: String },
  type: { type: String, enum: ['in-person', 'video', 'phone'], default: 'in-person' },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'], default: 'pending' },
  reason: { type: String },
  symptoms: [{ type: String }],
  notes: { type: String },
  prescription: { type: String },
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  consultationSummary: { type: String },
  fee: { type: Number },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' }
}, { timestamps: true });

appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
