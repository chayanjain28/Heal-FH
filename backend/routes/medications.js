const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Medication = require('../models/Medication');

router.get('/', protect, async (req, res) => {
  try {
    const meds = await Medication.find({ patient: req.user.id, isActive: true });
    res.json({ success: true, medications: meds });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const med = await Medication.create({ ...req.body, patient: req.user.id });
    res.status(201).json({ success: true, medication: med });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/:id/log', protect, async (req, res) => {
  try {
    const med = await Medication.findOne({ _id: req.params.id, patient: req.user.id });
    if (!med) return res.status(404).json({ success: false, message: 'Medication not found' });
    med.logs.push({ takenAt: new Date(), status: req.body.status || 'taken', notes: req.body.notes });
    await med.save();
    res.json({ success: true, medication: med });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const med = await Medication.findOneAndUpdate({ _id: req.params.id, patient: req.user.id }, req.body, { new: true });
    res.json({ success: true, medication: med });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Medication.findOneAndUpdate({ _id: req.params.id, patient: req.user.id }, { isActive: false });
    res.json({ success: true, message: 'Medication removed' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
