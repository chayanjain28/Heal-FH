const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Alert = require('../models/Alert');

router.get('/', protect, async (req, res) => {
  try {
    const { isRead, severity, limit = 20 } = req.query;
    const query = { patient: req.user.id };
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (severity) query.severity = severity;
    const alerts = await Alert.find(query).sort({ createdAt: -1 }).limit(parseInt(limit));
    const unreadCount = await Alert.countDocuments({ patient: req.user.id, isRead: false });
    res.json({ success: true, alerts, unreadCount });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    await Alert.findOneAndUpdate({ _id: req.params.id, patient: req.user.id }, { isRead: true });
    res.json({ success: true, message: 'Alert marked as read' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Alert.updateMany({ patient: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/:id/resolve', protect, async (req, res) => {
  try {
    await Alert.findOneAndUpdate({ _id: req.params.id, patient: req.user.id }, { isResolved: true, resolvedAt: new Date() });
    res.json({ success: true, message: 'Alert resolved' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
