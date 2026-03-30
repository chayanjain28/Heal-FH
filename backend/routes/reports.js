// reports.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const MedicalReport = require('../models/MedicalReport');

router.get('/', protect, async (req, res) => {
  try {
    const reports = await MedicalReport.find({ patient: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const report = await MedicalReport.findOne({ _id: req.params.id, patient: req.user.id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, report });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await MedicalReport.findOneAndDelete({ _id: req.params.id, patient: req.user.id });
    res.json({ success: true, message: 'Report deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
