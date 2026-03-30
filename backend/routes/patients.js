// patients.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const PatientProfile = require('../models/PatientProfile');
const HospitalRecord = require('../models/HospitalRecord');

router.get('/profile', protect, async (req, res) => {
  try {
    let profile = await PatientProfile.findOne({ user: req.user.id }).populate('primaryDoctor');
    if (!profile) profile = await PatientProfile.create({ user: req.user.id });
    res.json({ success: true, profile });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const profile = await PatientProfile.findOneAndUpdate({ user: req.user.id }, req.body, { new: true, upsert: true });
    res.json({ success: true, profile });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/hospital-records', protect, async (req, res) => {
  try {
    const records = await HospitalRecord.find({ patient: req.user.id }).sort({ admissionDate: -1 });
    res.json({ success: true, records });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/hospital-records', protect, async (req, res) => {
  try {
    const record = await HospitalRecord.create({ ...req.body, patient: req.user.id });
    res.status(201).json({ success: true, record });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
