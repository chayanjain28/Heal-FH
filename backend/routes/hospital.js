const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const HospitalRecord = require('../models/HospitalRecord');

router.get('/contacts', protect, async (req, res) => {
  try {
    const records = await HospitalRecord.find({ patient: req.user.id }).sort({ dischargeDate: -1 }).limit(5);
    const contacts = records.map(r => ({
      hospital: r.hospitalName,
      doctor: r.attendingDoctor,
      admissionDate: r.admissionDate,
      dischargeDate: r.dischargeDate,
      diagnosis: r.primaryDiagnosis,
      followUpDate: r.followUpDate
    }));
    res.json({ success: true, contacts });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
