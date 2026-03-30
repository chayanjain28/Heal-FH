const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, type, reason, symptoms } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      type: type || 'in-person',
      reason,
      symptoms,
      fee: doctor.consultationFee,
      status: 'confirmed'
    });

    await appointment.populate('doctor', 'name specialization hospital photo');
    res.status(201).json({ success: true, appointment, message: 'Appointment booked successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const query = { patient: req.user.id };
    if (status) query.status = status;
    if (upcoming === 'true') query.date = { $gte: new Date() };

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization hospital photo rating')
      .sort({ date: upcoming === 'true' ? 1 : -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user.id })
      .populate('doctor');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user.id });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${appointment.status} appointment` });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ success: true, message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFollowUpHistory = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user.id,
      status: 'completed'
    }).populate('doctor', 'name specialization photo').sort({ date: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUpcomingAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user.id,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    }).populate('doctor', 'name specialization hospital photo').sort({ date: 1 }).limit(5);

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
