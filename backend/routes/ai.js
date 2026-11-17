const express = require('express');
const router = express.Router();
const { chat, analyzeReport, autoGenerateCarePathway, getRecoverySuggestions, getHealthInsights, upload } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/chat', protect, chat);
router.post('/analyze-report', protect, upload.single('report'), analyzeReport);
router.post('/auto-pathway', protect, upload.single('dischargeSummary'), autoGenerateCarePathway);
router.post('/suggestions', protect, getRecoverySuggestions);
router.get('/insights', protect, getHealthInsights);

module.exports = router;
