const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, suggestDoctors, seedDoctors } = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAllDoctors);
router.get('/:id', protect, getDoctorById);
router.post('/suggest', protect, suggestDoctors);
router.post('/seed', seedDoctors); // Dev only - seed sample doctors

module.exports = router;
