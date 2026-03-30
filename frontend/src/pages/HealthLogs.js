import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Thermometer, Wind, Plus, TrendingUp, Droplets } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const VitalInput = ({ label, field, unit, min, max, value, onChange, icon: Icon, color }) => (
  <div className="form-group">
    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon size={14} color={color} />{label} {unit && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({unit})</span>}</label>
    <input className="form-input" type="number" placeholder={`${min}-${max}`} value={value} onChange={e => onChange(field, e.target.value)} min={min} max={max} />
  </div>
);

const HealthLogs = () => {
  const [logs, setLogs] = useState([]);
  const [trend, setTrend] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedVital, setSelectedVital] = useState('heartRate');
  const [form, setForm] = useState({ heartRate: '', systolic: '', diastolic: '', temperature: '', oxygenSaturation: '', respiratoryRate: '', bloodGlucose: '', weight: '', painLevel: 0, mood: 'good', sleepHours: '', activityLevel: 'light', notes: '', symptoms: '' });

  const updateField = (field, val) => setForm(p => ({ ...p, [field]: val }));

  useEffect(() => {
    const load = async () => {
      try {
        const [logsRes, trendRes] = await Promise.all([api.get('/health-logs?limit=10'), api.get(`/health-logs/trend?days=7&vital=${selectedVital}`)]);
        setLogs(logsRes.data.logs || []);
        setTrend(trendRes.data.trend || []);
      } catch { toast.error('Failed to load health logs'); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedVital]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const vitals = {};
      if (form.heartRate) vitals.heartRate = Number(form.heartRate);
      if (form.systolic) vitals.bloodPressureSystolic = Number(form.systolic);
      if (form.diastolic) vitals.bloodPressureDiastolic = Number(form.diastolic);
      if (form.temperature) vitals.temperature = Number(form.temperature);
      if (form.oxygenSaturation) vitals.oxygenSaturation = Number(form.oxygenSaturation);
      if (form.bloodGlucose) vitals.bloodGlucose = Number(form.bloodGlucose);
      if (form.weight) vitals.weight = Number(form.weight);
      const symptoms = form.symptoms ? form.symptoms.split(',').map(s => ({ name: s.trim(), severity: 'mild' })) : [];
      const { data } = await api.post('/health-logs', { vitals, symptoms, painLevel: Number(form.painLevel), mood: form.mood, sleepHours: Number(form.sleepHours), activityLevel: form.activityLevel, notes: form.notes });
      toast.success(data.alerts ? `Log saved! ${data.alerts.count} health alert(s) generated.` : 'Health log saved successfully!');
      setShowForm(false);
      const logsRes = await api.get('/health-logs?limit=10');
      setLogs(logsRes.data.logs || []);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save log'); }
    finally { setSubmitting(false); }
  };

  const vitalOptions = [
    { key: 'heartRate', label: 'Heart Rate', color: '#ef4444', unit: 'bpm' },
    { key: 'oxygenSaturation', label: 'O₂ Saturation', color: '#0ea5e9', unit: '%' },
    { key: 'bloodPressureSystolic', label: 'Blood Pressure', color: '#6366f1', unit: 'mmHg' },
    { key: 'temperature', label: 'Temperature', color: '#f59e0b', unit: '°C' },
  ];

  const selected = vitalOptions.find(v => v.key === selectedVital);
  const chartData = {
    labels: trend.map(t => new Date(t.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
    datasets: [{ label: selected?.label, data: trend.map(t => t[selectedVital]), borderColor: selected?.color || '#0ea5e9', backgroundColor: `${selected?.color || '#0ea5e9'}15`, fill: true, tension: 0.4, pointBackgroundColor: selected?.color, pointRadius: 5, borderWidth: 2 }]
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1 className="page-title">Health Logs</h1><p className="page-subtitle">Track your vitals and symptoms daily for best recovery insights</p></div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={16} /> Log Today's Health
        </motion.button>
      </div>

      {/* Trend Chart */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={18} color="var(--primary)" /> Vital Trends (7 Days)</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {vitalOptions.map(v => (
              <button key={v.key} onClick={() => setSelectedVital(v.key)} style={{ padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.78rem', background: selectedVital === v.key ? v.color : 'var(--glass-bg)', color: selectedVital === v.key ? 'white' : 'var(--text-muted)', border: selectedVital === v.key ? '1px solid transparent' : '1px solid var(--glass-border)' }}>{v.label}</button>
            ))}
          </div>
        </div>
        <div style={{ height: 220 }}>
          {trend.length > 0 ? <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'var(--text-muted)', font: { size: 11 } } }, y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'var(--text-muted)', font: { size: 11 } } } } }} /> :
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.88rem' }}>No data yet. Start logging your vitals!</div>}
        </div>
      </div>

      {/* Recent Logs */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 16 }}>Recent Logs</h3>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner" /></div> :
          logs.length > 0 ? logs.map((log, i) => (
            <motion.div key={log._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--glass-border)', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,rgba(14,165,233,0.15),rgba(16,185,129,0.15))', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem' }}>🫀</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  {log.vitals?.heartRate && <span className="badge badge-danger">❤ {log.vitals.heartRate} bpm</span>}
                  {log.vitals?.oxygenSaturation && <span className="badge badge-info">O₂ {log.vitals.oxygenSaturation}%</span>}
                  {log.vitals?.bloodPressureSystolic && <span className="badge badge-primary">BP {log.vitals.bloodPressureSystolic}/{log.vitals.bloodPressureDiastolic}</span>}
                  {log.vitals?.temperature && <span className="badge badge-warning">🌡 {log.vitals.temperature}°C</span>}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {log.painLevel > 0 && <span>Pain: {log.painLevel}/10</span>}
                  {log.mood && <span>Mood: {log.mood}</span>}
                  {log.sleepHours > 0 && <span>Sleep: {log.sleepHours}h</span>}
                  {log.activityLevel && <span>Activity: {log.activityLevel}</span>}
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(log.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
            </motion.div>
          )) : <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No logs yet. Click "Log Today's Health" to start!</div>}
      </div>

      {/* Log Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: 24, overflowY: 'auto' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', maxWidth: 580, background: 'var(--bg-card)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>Log Today's Health</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <VitalInput label="Heart Rate" field="heartRate" unit="bpm" min={30} max={250} value={form.heartRate} onChange={updateField} icon={Heart} color="#ef4444" />
                <VitalInput label="O₂ Saturation" field="oxygenSaturation" unit="%" min={70} max={100} value={form.oxygenSaturation} onChange={updateField} icon={Wind} color="#0ea5e9" />
                <VitalInput label="BP Systolic" field="systolic" unit="mmHg" min={60} max={250} value={form.systolic} onChange={updateField} icon={Activity} color="#6366f1" />
                <VitalInput label="BP Diastolic" field="diastolic" unit="mmHg" min={40} max={150} value={form.diastolic} onChange={updateField} icon={Activity} color="#6366f1" />
                <VitalInput label="Temperature" field="temperature" unit="°C" min={34} max={42} value={form.temperature} onChange={updateField} icon={Thermometer} color="#f59e0b" />
                <VitalInput label="Blood Glucose" field="bloodGlucose" unit="mg/dL" min={40} max={500} value={form.bloodGlucose} onChange={updateField} icon={Droplets} color="#10b981" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="form-group"><label className="form-label">Pain Level: {form.painLevel}/10</label>
                  <input type="range" min={0} max={10} value={form.painLevel} onChange={e => updateField('painLevel', e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} /></div>
                <div className="form-group"><label className="form-label">Mood</label>
                  <select className="form-input" value={form.mood} onChange={e => updateField('mood', e.target.value)}>
                    {['excellent', 'good', 'fair', 'poor', 'terrible'].map(m => <option key={m} value={m} style={{ textTransform: 'capitalize' }}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Sleep Hours</label><input className="form-input" type="number" min={0} max={24} placeholder="7" value={form.sleepHours} onChange={e => updateField('sleepHours', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Activity Level</label>
                  <select className="form-input" value={form.activityLevel} onChange={e => updateField('activityLevel', e.target.value)}>
                    {['bedrest', 'minimal', 'light', 'moderate', 'active'].map(a => <option key={a} value={a} style={{ textTransform: 'capitalize' }}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                  </select></div>
              </div>
              <div className="form-group"><label className="form-label">Symptoms (comma separated)</label><input className="form-input" placeholder="e.g. headache, fatigue, nausea" value={form.symptoms} onChange={e => updateField('symptoms', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Notes</label><textarea className="form-input" rows={2} placeholder="Any additional notes..." value={form.notes} onChange={e => updateField('notes', e.target.value)} style={{ resize: 'none' }} /></div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, color: 'var(--text-muted)' }}>Cancel</button>
                <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#0ea5e9,#10b981)', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, color: 'white', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving...' : 'Save Health Log'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HealthLogs;
