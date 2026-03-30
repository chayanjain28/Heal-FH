const RecoveryPlan = require('../models/RecoveryPlan');
const HealthLog = require('../models/HealthLog');
const Medication = require('../models/Medication');
const Alert = require('../models/Alert');

// Calculate Recovery Score (0-100)
const calculateRecoveryScore = async (patientId) => {
  const scores = { vitals: 0, medication: 0, symptoms: 0, activity: 0, sleep: 0 };
  let total = 0;

  // Get last 7 days of health logs
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentLogs = await HealthLog.find({ patient: patientId, timestamp: { $gte: weekAgo } }).sort({ timestamp: -1 });

  if (recentLogs.length > 0) {
    const latestLog = recentLogs[0];

    // Vitals score (30 points)
    if (latestLog.vitals) {
      const { heartRate, oxygenSaturation, bloodPressureSystolic } = latestLog.vitals;
      let vitalScore = 30;
      if (heartRate && (heartRate < 50 || heartRate > 100)) vitalScore -= 8;
      if (oxygenSaturation && oxygenSaturation < 95) vitalScore -= 12;
      if (bloodPressureSystolic && (bloodPressureSystolic < 90 || bloodPressureSystolic > 140)) vitalScore -= 10;
      scores.vitals = Math.max(0, vitalScore);
    }

    // Pain/symptoms score (20 points)
    const avgPain = recentLogs.reduce((acc, l) => acc + (l.painLevel || 0), 0) / recentLogs.length;
    scores.symptoms = Math.max(0, 20 - avgPain * 2);

    // Activity score (20 points)
    const activityMap = { bedrest: 5, minimal: 10, light: 15, moderate: 18, active: 20 };
    scores.activity = activityMap[latestLog.activityLevel] || 10;

    // Sleep score (15 points)
    const avgSleep = recentLogs.reduce((acc, l) => acc + (l.sleepHours || 0), 0) / recentLogs.length;
    scores.sleep = avgSleep >= 7 && avgSleep <= 9 ? 15 : avgSleep >= 6 ? 10 : 5;
  } else {
    scores.vitals = 15;
    scores.symptoms = 10;
    scores.activity = 10;
    scores.sleep = 7;
  }

  // Medication adherence score (15 points)
  const medications = await Medication.find({ patient: patientId, isActive: true });
  if (medications.length > 0) {
    let totalDoses = 0, takenDoses = 0;
    medications.forEach(med => {
      const recentLogs = med.logs.filter(l => l.takenAt >= weekAgo);
      totalDoses += recentLogs.length;
      takenDoses += recentLogs.filter(l => l.status === 'taken').length;
    });
    scores.medication = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 15) : 10;
  } else {
    scores.medication = 10;
  }

  total = Object.values(scores).reduce((a, b) => a + b, 0);

  return {
    total: Math.min(100, Math.round(total)),
    breakdown: scores,
    category: total >= 80 ? 'Excellent' : total >= 60 ? 'Good' : total >= 40 ? 'Fair' : 'Needs Attention'
  };
};

// Predict complications using rule-based AI
const predictComplications = async (patientId) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentLogs = await HealthLog.find({ patient: patientId, timestamp: { $gte: weekAgo } });

  const risks = [];
  let riskLevel = 'low';

  if (recentLogs.length === 0) return { riskLevel, risks, message: 'Insufficient data for prediction' };

  const latestLog = recentLogs.sort((a, b) => b.timestamp - a.timestamp)[0];
  const { vitals, symptoms, painLevel } = latestLog;

  // Check for high-risk patterns
  if (vitals?.oxygenSaturation < 93) {
    risks.push({ factor: 'Low Oxygen', severity: 'high', recommendation: 'Seek immediate medical attention' });
    riskLevel = 'high';
  }
  if (vitals?.heartRate > 130 || vitals?.heartRate < 45) {
    risks.push({ factor: 'Abnormal Heart Rate', severity: 'high', recommendation: 'Consult cardiologist immediately' });
    riskLevel = 'high';
  }
  if (vitals?.temperature > 38.5) {
    risks.push({ factor: 'Fever', severity: 'medium', recommendation: 'Monitor temperature, take prescribed antipyretics' });
    if (riskLevel !== 'high') riskLevel = 'medium';
  }
  if (painLevel >= 7) {
    risks.push({ factor: 'Severe Pain', severity: 'medium', recommendation: 'Contact your doctor for pain management' });
    if (riskLevel !== 'high') riskLevel = 'medium';
  }
  if (vitals?.bloodPressureSystolic > 160) {
    risks.push({ factor: 'Hypertension', severity: 'high', recommendation: 'Take BP medication and consult immediately' });
    riskLevel = 'high';
  }

  const symptomNames = symptoms?.map(s => s.name?.toLowerCase()) || [];
  if (symptomNames.some(s => ['chest pain', 'difficulty breathing', 'shortness of breath'].includes(s))) {
    risks.push({ factor: 'Respiratory Distress', severity: 'critical', recommendation: 'Call emergency services immediately' });
    riskLevel = 'high';
  }

  return { riskLevel, risks, message: `${risks.length} risk factors identified`, analyzedAt: new Date() };
};

exports.getRecoveryScore = async (req, res) => {
  try {
    const score = await calculateRecoveryScore(req.user.id);
    
    // Update active recovery plan
    await RecoveryPlan.findOneAndUpdate(
      { patient: req.user.id, isActive: true },
      { currentScore: score.total, lastUpdated: new Date() }
    );

    res.json({ success: true, score });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getComplicationPrediction = async (req, res) => {
  try {
    const prediction = await predictComplications(req.user.id);

    if (prediction.riskLevel === 'high') {
      await Alert.create({
        patient: req.user.id,
        type: 'complication',
        severity: 'high',
        title: 'High Complication Risk Detected',
        message: `AI analysis detected ${prediction.risks.length} risk factors. Immediate attention required.`,
        data: prediction
      });
    }

    res.json({ success: true, prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecoveryPlan = async (req, res) => {
  try {
    const plan = await RecoveryPlan.findOne({ patient: req.user.id, isActive: true })
      .populate('hospitalRecord');
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRecoveryPlan = async (req, res) => {
  try {
    // Deactivate existing plans
    await RecoveryPlan.updateMany({ patient: req.user.id }, { isActive: false });
    
    const plan = await RecoveryPlan.create({ ...req.body, patient: req.user.id, isActive: true });
    res.status(201).json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRecoveryPlan = async (req, res) => {
  try {
    const plan = await RecoveryPlan.findOneAndUpdate(
      { _id: req.params.id, patient: req.user.id },
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    );
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const [score, prediction, alerts, latestLog] = await Promise.all([
      calculateRecoveryScore(req.user.id),
      predictComplications(req.user.id),
      Alert.find({ patient: req.user.id, isRead: false }).sort({ createdAt: -1 }).limit(5),
      HealthLog.findOne({ patient: req.user.id }).sort({ timestamp: -1 })
    ]);

    res.json({
      success: true,
      dashboard: { recoveryScore: score, riskPrediction: prediction, recentAlerts: alerts, latestVitals: latestLog?.vitals }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
