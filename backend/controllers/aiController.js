const MedicalReport = require('../models/MedicalReport');
const HealthLog = require('../models/HealthLog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Lazy GROQ client — only initialized when first used
let groqClient = null;
const getGroq = () => {
  if (!groqClient) {
    const Groq = require('groq-sdk');
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

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
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1000, temperature: 0.7
    });
    res.json({ success: true, response: completion.choices[0]?.message?.content, usage: completion.usage });
  } catch (error) {
    console.error('GROQ Chat Error:', error.message);
    res.status(500).json({ success: false, message: 'AI assistant temporarily unavailable. Please check your GROQ_API_KEY.' });
  }
};

exports.analyzeReport = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(503).json({ success: false, message: 'GROQ_API_KEY not configured.' });
    const { reportText, reportType } = req.body;
    const textToAnalyze = reportText || (req.file ? `Medical report file: ${req.file.originalname}` : null);
    if (!textToAnalyze) return res.status(400).json({ success: false, message: 'No report content provided' });

    const prompt = `Analyze this medical report and return ONLY valid JSON (no markdown):
${textToAnalyze}

Return exactly this structure:
{"medications":[{"name":"","dosage":"","frequency":"","duration":"","instructions":""}],"diagnoses":[""],"labValues":[{"test":"","value":"","unit":"","normalRange":"","status":"normal"}],"restrictions":[""],"followUpInstructions":[""],"summary":"Plain language summary for patient"}`;

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
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
      model: 'llama-3.3-70b-versatile',
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
      model: 'llama-3.3-70b-versatile',
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
