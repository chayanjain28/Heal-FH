const express = require('express');
const router = express.Router();
const { bookAppointment, getMyAppointments, getAppointmentById, cancelAppointment, getFollowUpHistory, getUpcomingAppointments } = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, bookAppointment);
router.get('/', protect, getMyAppointments);
router.get('/upcoming', protect, getUpcomingAppointments);
router.get('/follow-ups', protect, getFollowUpHistory);
router.get('/:id', protect, getAppointmentById);
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;
