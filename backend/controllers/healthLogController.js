const HealthLog = require('../models/HealthLog');
const Alert = require('../models/Alert');

// Thresholds for alerts
const VITAL_THRESHOLDS = {
  heartRate: { low: 50, high: 120, critical_low: 40, critical_high: 150 },
  bloodPressureSystolic: { low: 90, high: 140, critical_low: 80, critical_high: 180 },
  bloodPressureDiastolic: { low: 60, high: 90, critical_low: 50, critical_high: 120 },
  temperature: { low: 36.0, high: 37.8, critical_low: 35.0, critical_high: 39.5 },
  oxygenSaturation: { low: 95, high: 100, critical_low: 90, critical_high: 100 },
  bloodGlucose: { low: 70, high: 180, critical_low: 50, critical_high: 300 }
};

const checkVitalAlerts = async (patientId, vitals) => {
  const alerts = [];
  for (const [vital, value] of Object.entries(vitals)) {
    if (!value || !VITAL_THRESHOLDS[vital]) continue;
    const threshold = VITAL_THRESHOLDS[vital];
    let severity = null, message = '';

    if (vital === 'oxygenSaturation') {
      if (value <= threshold.critical_low) { severity = 'critical'; message = `Critical: O2 saturation at ${value}%`; }
      else if (value <= threshold.low) { severity = 'high'; message = `Low oxygen saturation: ${value}%`; }
    } else {
      if (value <= threshold.critical_low || value >= threshold.critical_high) {
        severity = 'critical'; message = `Critical ${vital}: ${value}`;
      } else if (value <= threshold.low || value >= threshold.high) {
        severity = 'high'; message = `Abnormal ${vital}: ${value}`;
      }
    }

    if (severity) {
      alerts.push(await Alert.create({
        patient: patientId,
        type: 'vital',
        severity,
        title: `Abnormal ${vital.replace(/([A-Z])/g, ' $1')}`,
        message,
        data: { vital, value, threshold }
      }));
    }
  }
  return alerts;
};

exports.logHealth = async (req, res) => {
  try {
    const { vitals, symptoms, painLevel, mood, sleepHours, activityLevel, notes } = req.body;
    
    const log = await HealthLog.create({
      patient: req.user.id,
      vitals,
      symptoms,
      painLevel,
      mood,
      sleepHours,
      activityLevel,
      notes
    });

    // Check for vital alerts
    let alerts = [];
    if (vitals) {
      alerts = await checkVitalAlerts(req.user.id, vitals);
    }

    res.status(201).json({
      success: true,
      log,
      alerts: alerts.length > 0 ? { count: alerts.length, message: 'Health alerts generated' } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHealthLogs = async (req, res) => {
  try {
    const { limit = 30, page = 1, startDate, endDate } = req.query;
    const query = { patient: req.user.id };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const total = await HealthLog.countDocuments(query);
    const logs = await HealthLog.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLatestVitals = async (req, res) => {
  try {
    const latest = await HealthLog.findOne({ patient: req.user.id })
      .sort({ timestamp: -1 })
      .select('vitals timestamp painLevel mood');
    
    res.json({ success: true, vitals: latest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVitalsTrend = async (req, res) => {
  try {
    const { days = 7, vital } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await HealthLog.find({
      patient: req.user.id,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 }).select(`vitals timestamp`);

    const trend = logs.map(log => ({
      timestamp: log.timestamp,
      ...(vital ? { [vital]: log.vitals?.[vital] } : log.vitals)
    }));

    res.json({ success: true, trend });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
