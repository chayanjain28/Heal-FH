const MedicalReport = require('../models/MedicalReport');
const HealthLog = require('../models/HealthLog');
const Medication = require('../models/Medication');
const RecoveryPlan = require('../models/RecoveryPlan');
const Alert = require('../models/Alert');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
let pdfParse;
try { pdfParse = require('pdf-parse'); } catch (e) { pdfParse = null; }

const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

// Lazy GROQ client — only initialized when first used
let groqClient = null;
const getGroq = () => {
  if (!groqClient) {
    const Groq = require('groq-sdk');
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

const getGroqModel = () => process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/reports');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => { cb(null, `report_${Date.now()}_${file.originalname}`); }
});
exports.upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

exports.chat = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(503).json({ success: false, message: 'GROQ_API_KEY not configured. Please add it to backend/.env' });
    const { message, conversationHistory = [] } = req.body;
    const systemPrompt = `You are MedAI, an intelligent post-discharge care assistant for "Heal From Home".
Help patients with recovery guidance, medical explanations, and health insights.
Always recommend consulting a doctor for serious concerns. Be compassionate and clear.`;
    const messages = [
      ...conversationHistory.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];
    const completion = await getGroq().chat.completions.create({
      model: getGroqModel(),
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1000, temperature: 0.7
    });
    res.json({ success: true, response: completion.choices[0]?.message?.content, usage: completion.usage });
  } catch (error) {
    console.error('GROQ Chat Error:', error.message);
    res.status(500).json({ success: false, message: 'AI assistant temporarily unavailable. Please check your GROQ_API_KEY.' });
  }
};

const extractTextFromRequest = async (req) => {
  let text = req.body.dischargeText || req.body.reportText || '';
  if (req.file) {
    const filePath = req.file.path;
    const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');
    if (isPdf && pdfParse) {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        if (typeof pdfParse === 'function') {
          const parsed = await pdfParse(dataBuffer);
          if (parsed?.text?.trim()) text = parsed.text;
        } else if (pdfParse.PDFParse) {
          const parser = new pdfParse.PDFParse({ data: dataBuffer });
          await parser.load();
          const parsed = await parser.getText();
          if (typeof parsed === 'string' && parsed.trim()) {
            text = parsed;
          } else if (parsed?.text?.trim()) {
            text = parsed.text;
          }
        }
      } catch (err) {
        console.warn('PDF parsing fallback:', err.message);
      }
    } else {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.trim()) text = content;
      } catch (err) {}
    }
    if (!text) text = `Medical file: ${req.file.originalname}`;
  }
  return text;
};

exports.analyzeReport = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(503).json({ success: false, message: 'GROQ_API_KEY not configured.' });
    const textToAnalyze = await extractTextFromRequest(req);
    const { reportType } = req.body;
    if (!textToAnalyze) return res.status(400).json({ success: false, message: 'No report content provided' });

    const prompt = `Analyze this medical report and return ONLY valid JSON (no markdown):
${textToAnalyze}

Return exactly this structure:
{"medications":[{"name":"","dosage":"","frequency":"","duration":"","instructions":""}],"diagnoses":[""],"labValues":[{"test":"","value":"","unit":"","normalRange":"","status":"normal"}],"restrictions":[""],"followUpInstructions":[""],"summary":"Plain language summary for patient"}`;

    const completion = await getGroq().chat.completions.create({
      model: getGroqModel(),
      messages: [{ role: 'system', content: 'You are a medical report analyzer. Return only valid JSON.' }, { role: 'user', content: prompt }],
      max_tokens: 2000, temperature: 0.2
    });

    const responseText = completion.choices[0]?.message?.content || '';
    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: responseText, medications: [], diagnoses: [], labValues: [], restrictions: [], followUpInstructions: [] };
    } catch { analysis = { summary: responseText, medications: [], diagnoses: [], labValues: [], restrictions: [], followUpInstructions: [] }; }

    const report = await MedicalReport.create({
      patient: req.user.id,
      filename: req.file?.filename || 'text_input',
      originalName: req.file?.originalname || 'Pasted Report',
      fileUrl: req.file ? `/uploads/reports/${req.file.filename}` : null,
      fileType: req.file?.mimetype?.includes('pdf') ? 'pdf' : 'other',
      reportType: reportType || 'other',
      analysis: { ...analysis, rawText: textToAnalyze },
      isAnalyzed: true, analyzedAt: new Date(), uploadedBy: req.user.id
    });

    res.json({ success: true, report, analysis });
  } catch (error) {
    console.error('Report Analysis Error:', error.message);
    res.status(500).json({ success: false, message: 'Report analysis failed. Please try again.' });
  }
};

exports.getRecoverySuggestions = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(503).json({ success: false, message: 'GROQ_API_KEY not configured.' });
    const { condition, currentSymptoms, medications, recoveryDay } = req.body;
    const prompt = `Patient recovering from: ${condition || 'recent surgery/illness'}
Recovery Day: ${recoveryDay || 'unknown'}. Symptoms: ${currentSymptoms?.join(', ') || 'none'}.
Medications: ${medications?.join(', ') || 'none'}.

Return JSON only:
{"suggestions":[{"category":"activity","title":"","description":"","priority":"medium"}],"motivationalMessage":""}`;

    const completion = await getGroq().chat.completions.create({
      model: getGroqModel(),
      messages: [{ role: 'system', content: 'Recovery specialist. Return valid JSON only.' }, { role: 'user', content: prompt }],
      max_tokens: 1000, temperature: 0.5
    });
    const responseText = completion.choices[0]?.message?.content || '';
    let suggestions;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestions: [], motivationalMessage: responseText };
    } catch { suggestions = { suggestions: [], motivationalMessage: responseText }; }
    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to generate suggestions.' });
  }
};

exports.getHealthInsights = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.json({ success: true, insights: { message: 'Add GROQ_API_KEY to enable AI health insights.' } });
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = await HealthLog.find({ patient: req.user.id, timestamp: { $gte: weekAgo } }).sort({ timestamp: -1 }).limit(7);
    if (recentLogs.length === 0) return res.json({ success: true, insights: { message: 'Start logging your health data to get AI-powered insights.' } });

    const logSummary = recentLogs.map(l => ({ date: l.timestamp, heartRate: l.vitals?.heartRate, o2: l.vitals?.oxygenSaturation, pain: l.painLevel, mood: l.mood, sleep: l.sleepHours }));
    const completion = await getGroq().chat.completions.create({
      model: getGroqModel(),
      messages: [
        { role: 'system', content: 'Health analyst. Return valid JSON only.' },
        { role: 'user', content: `Analyze: ${JSON.stringify(logSummary)}\nReturn: {"trends":[{"metric":"","trend":"improving","note":""}],"positives":[""],"concerns":[""],"recommendations":[""]}` }
      ],
      max_tokens: 800, temperature: 0.3
    });
    const responseText = completion.choices[0]?.message?.content || '';
    let insights;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: responseText };
    } catch { insights = { message: responseText }; }
    res.json({ success: true, insights });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to generate insights.' });
  }
};

exports.autoGenerateCarePathway = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ success: false, message: 'GROQ_API_KEY not configured.' });
    }

    const textToAnalyze = await extractTextFromRequest(req);
    if (!textToAnalyze || !textToAnalyze.trim()) {
      return res.status(400).json({ success: false, message: 'Please upload a discharge summary or provide summary text.' });
    }

    const systemPrompt = `You are a Senior Hospital Discharge Director and Clinical Pharmacist specializing in post-surgical recovery care.
Your task is to analyze the hospital discharge summary and convert it into a completely automated, actionable recovery care pathway.
Perform a strict Clinical Safety Drug-Drug Interaction check and food/lifestyle contraindications check.
Return ONLY valid, parseable JSON matching the exact schema below. No markdown fences, no conversational prose.`;

    const userPrompt = `DISCHARGE SUMMARY DOCUMENT:
"""
${textToAnalyze}
"""

Return a JSON object with this EXACT schema:
{
  "summary": "Clear 2-sentence patient-friendly explanation of their procedure, current status, and healing roadmap.",
  "procedureOrDiagnosis": "Exact surgery or medical condition name",
  "phase": "acute",
  "expectedRecoveryDays": 14,
  "medications": [
    {
      "name": "Medication Trade Name",
      "genericName": "Generic pharmaceutical name",
      "dosage": "e.g. 500mg or 1 tablet",
      "frequency": "e.g. Twice daily (BD) or Once daily (OD) or Every 8 hours (TDS)",
      "route": "oral",
      "reminderTimes": ["08:00", "20:00"],
      "instructions": "e.g. Take immediately after meals with plenty of water",
      "durationDays": 7,
      "sideEffects": ["Mild nausea", "Drowsiness"]
    }
  ],
  "drugInteractions": [
    {
      "severity": "critical",
      "drugs": ["Drug 1", "Drug 2"],
      "description": "Clinical mechanism of interaction",
      "recommendation": "Specific clinical countermeasure"
    }
  ],
  "foodConflicts": [
    {
      "drug": "Drug Name",
      "food": "e.g. Grapefruit / High-calcium dairy / Alcohol",
      "warning": "Why this food interacts with the drug",
      "recommendation": "Timing or avoidance advice"
    }
  ],
  "recoveryPlan": {
    "title": "Post-Discharge Recovery Roadmap",
    "phase": "acute",
    "goals": [
      "Keep surgical site clean, dry, and free of signs of infection",
      "Control post-operative pain to <= 3/10",
      "Ambulate independently at least 500 steps daily by Day 4"
    ],
    "exercises": [
      {
        "name": "Incentive Spirometry & Deep Breathing",
        "description": "Perform 10 deep breaths every 2 hours while awake to prevent atelectasis and pneumonia",
        "frequency": "Every 2 hours",
        "duration": "5 minutes"
      },
      {
        "name": "Ankle Pumps & Circulation",
        "description": "Flex and point toes 20 times per hour to stimulate blood flow and prevent DVT",
        "frequency": "Hourly",
        "duration": "3 minutes"
      }
    ],
    "dietaryGuidelines": [
      "Maintain adequate hydration (2-2.5 liters of water daily)",
      "Eat easily digestible, high-protein foods to support wound tissue repair"
    ],
    "restrictions": [
      "No lifting objects heavier than 5 kg (10 lbs) for 2-3 weeks",
      "No submersion of surgical incision in bath/pool until cleared by surgeon"
    ],
    "milestones": [
      {
        "title": "Day 3 Wound & Dressing Inspection",
        "description": "Check incision for dry borders and normal healing without redness spread",
        "targetDay": 3
      },
      {
        "title": "Day 7 Mobility & Suture Check",
        "description": "Follow-up visit or dressing change as scheduled",
        "targetDay": 7
      }
    ],
    "warningSigns": [
      "Fever over 100.4°F (38°C) or chills",
      "Spreading redness, warmth, or purulent yellow/green drainage around incision",
      "Sudden shortness of breath or persistent chest discomfort"
    ]
  }
}`;

    const completion = await getGroq().chat.completions.create({
      model: getGroqModel(),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 3500,
      temperature: 0.2
    });

    const responseText = completion.choices[0]?.message?.content || '';
    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error('Failed to parse JSON from Groq:', e.message);
    }

    if (!parsed) {
      return res.status(500).json({
        success: false,
        message: 'Could not extract structured clinical data from summary.'
      });
    }

    const mapFrequencyToReminders = (freq) => {
      const f = (freq || '').toLowerCase();
      if (f.includes('three') || f.includes('tds') || f.includes('tid') || f.includes('8 hour')) return ['08:00', '14:00', '20:00'];
      if (f.includes('four') || f.includes('qid') || f.includes('qds') || f.includes('6 hour')) return ['08:00', '12:00', '16:00', '20:00'];
      if (f.includes('twice') || f.includes('bd') || f.includes('bid') || f.includes('12 hour')) return ['09:00', '21:00'];
      if (f.includes('night') || f.includes('bedtime') || f.includes('hs')) return ['21:30'];
      return ['09:00'];
    };

    const applyDirectly = req.body.applyDirectly === 'true' || req.body.applyDirectly === true;
    let savedMedications = [];
    let savedPlan = null;
    let createdAlerts = [];

    if (applyDirectly) {
      // 1. Save Medical Report
      await MedicalReport.create({
        patient: req.user.id,
        filename: req.file?.filename || 'discharge_summary',
        originalName: req.file?.originalname || 'Hospital Discharge Summary',
        fileUrl: req.file ? `/uploads/reports/${req.file.filename}` : null,
        fileType: req.file?.mimetype?.includes('pdf') ? 'pdf' : 'other',
        reportType: 'discharge',
        analysis: {
          summary: parsed.summary,
          procedureOrDiagnosis: parsed.procedureOrDiagnosis,
          medications: parsed.medications,
          drugInteractions: parsed.drugInteractions,
          foodConflicts: parsed.foodConflicts,
          recoveryPlan: parsed.recoveryPlan,
          rawText: textToAnalyze.substring(0, 5000)
        },
        isAnalyzed: true,
        analyzedAt: new Date(),
        uploadedBy: req.user.id
      });

      // 2. Automate Medications
      if (Array.isArray(parsed.medications) && parsed.medications.length > 0) {
        for (const med of parsed.medications) {
          const reminders = (med.reminderTimes && med.reminderTimes.length > 0)
            ? med.reminderTimes
            : mapFrequencyToReminders(med.frequency);

          const days = parseInt(med.durationDays) || 14;
          const createdMed = await Medication.create({
            patient: req.user.id,
            name: med.name || 'Prescribed Medication',
            genericName: med.genericName || '',
            dosage: med.dosage || '1 unit',
            frequency: med.frequency || 'Once daily',
            route: ['oral', 'injection', 'topical', 'inhaled', 'other'].includes(med.route) ? med.route : 'oral',
            startDate: new Date(),
            endDate: new Date(Date.now() + days * 86400000),
            instructions: med.instructions || 'Take as directed on discharge summary',
            sideEffects: med.sideEffects || [],
            reminderTimes: reminders,
            isActive: true
          });
          savedMedications.push(createdMed);
        }
      }

      // 3. Automate Recovery Plan
      await RecoveryPlan.updateMany({ patient: req.user.id }, { isActive: false });

      const planData = parsed.recoveryPlan || {};
      const recoveryDays = parseInt(parsed.expectedRecoveryDays) || 14;

      savedPlan = await RecoveryPlan.create({
        patient: req.user.id,
        title: planData.title || `Post-Op Recovery: ${parsed.procedureOrDiagnosis || 'Hospital Discharge'}`,
        description: parsed.summary,
        phase: ['acute', 'subacute', 'maintenance'].includes(planData.phase) ? planData.phase : 'acute',
        startDate: new Date(),
        expectedEndDate: new Date(Date.now() + recoveryDays * 86400000),
        goals: (planData.goals || []).map(g => ({
          description: typeof g === 'string' ? g : g.description,
          isCompleted: false
        })),
        exercises: (planData.exercises || []).map(e => ({
          name: e.name,
          description: e.description,
          frequency: e.frequency,
          duration: e.duration,
          isActive: true
        })),
        dietaryGuidelines: planData.dietaryGuidelines || [],
        restrictions: planData.restrictions || [],
        milestones: (planData.milestones || []).map(m => ({
          title: m.title,
          description: m.description,
          targetDate: new Date(Date.now() + (parseInt(m.targetDay) || 3) * 86400000),
          isAchieved: false
        })),
        currentScore: 60,
        isActive: true,
        aiGenerated: true
      });

      // 4. Automate Safety Alerts for Drug Conflicts
      if (Array.isArray(parsed.drugInteractions)) {
        for (const inter of parsed.drugInteractions) {
          if (inter.severity === 'critical' || inter.severity === 'warning') {
            const alt = await Alert.create({
              patient: req.user.id,
              type: 'medication',
              severity: inter.severity === 'critical' ? 'critical' : 'high',
              title: `⚠️ Drug Conflict Alert: ${(inter.drugs || []).join(' + ')}`,
              message: `${inter.description}. Action: ${inter.recommendation}`,
              data: inter
            });
            createdAlerts.push(alt);
          }
        }
      }

      // 5. Automate Warning Signs Alert
      if (Array.isArray(planData.warningSigns) && planData.warningSigns.length > 0) {
        const warningAlert = await Alert.create({
          patient: req.user.id,
          type: 'complication',
          severity: 'medium',
          title: `🏥 Critical Red-Flags for ${parsed.procedureOrDiagnosis || 'Recovery'}`,
          message: `Watch for: ${planData.warningSigns.slice(0, 3).join('; ')}. If observed, call 108 or your doctor immediately.`,
          data: { warningSigns: planData.warningSigns }
        });
        createdAlerts.push(warningAlert);
      }
    }

    res.json({
      success: true,
      analysis: parsed,
      applied: applyDirectly,
      medicationsCount: savedMedications.length,
      recoveryPlan: savedPlan,
      alertsCreatedCount: createdAlerts.length,
      message: applyDirectly
        ? `Successfully automated: ${savedMedications.length} medications scheduled, recovery plan activated, and ${createdAlerts.length} safety alerts monitored.`
        : 'Discharge summary parsed successfully. Ready to apply.'
    });

  } catch (error) {
    console.error('Care Pathway Generation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate care pathway: ' + error.message });
  }
};
