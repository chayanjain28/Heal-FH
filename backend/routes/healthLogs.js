const express = require('express');
const router = express.Router();
const { logHealth, getHealthLogs, getLatestVitals, getVitalsTrend } = require('../controllers/healthLogController');
const { protect } = require('../middleware/auth');

router.post('/', protect, logHealth);
router.get('/', protect, getHealthLogs);
router.get('/latest', protect, getLatestVitals);
router.get('/trend', protect, getVitalsTrend);

module.exports = router;
