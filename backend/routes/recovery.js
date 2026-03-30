const express = require('express');
const router = express.Router();
const { getRecoveryScore, getComplicationPrediction, getRecoveryPlan, createRecoveryPlan, updateRecoveryPlan, getDashboardSummary } = require('../controllers/recoveryController');
const { protect } = require('../middleware/auth');

router.get('/score', protect, getRecoveryScore);
router.get('/predict', protect, getComplicationPrediction);
router.get('/plan', protect, getRecoveryPlan);
router.post('/plan', protect, createRecoveryPlan);
router.put('/plan/:id', protect, updateRecoveryPlan);
router.get('/dashboard', protect, getDashboardSummary);

module.exports = router;
