import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import DischargeAutomationModal from '../components/DischargeAutomationModal';
import { 
  Activity, Heart, Thermometer, Wind, AlertTriangle, Calendar, Pill, 
  Bot, TrendingUp, TrendingDown, ChevronRight, Shield, PhoneCall, 
  Ambulance, Sparkles, Stethoscope, AlertCircle, Phone, Copy, Check, 
  MapPin, User, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Tooltip, Legend, Filler 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const RecoveryGauge = ({ score, category }) => {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#0ea5e9' : score >= 40 ? '#f59e0b' : '#ef4444';
  const r = 70, c = 2 * Math.PI * r, progress = ((100 - score) / 100) * c;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="90" cy="90" r={r} fill="none" stroke="var(--glass-border)" strokeWidth="12" />
          <motion.circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={c} strokeDashoffset={progress} strokeLinecap="round"
            initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: progress }}
            transition={{ duration: 1.5, ease: 'easeOut' }} />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontSize: '2.8rem', fontWeight: 900, color, lineHeight: 1 }}>{score}</motion.div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</div>
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <span style={{ fontWeight: 700, fontSize: '1rem', color }}>{category}</span>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Recovery Score</p>
      </div>
    </div>
  );
};

const VitalCard = ({ icon: Icon, label, value, unit, color, status }) => (
  <motion.div whileHover={{ y: -3 }} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value || '—'}</span>
        {unit && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unit}</span>}
      </div>
    </div>
    {status && <div style={{ width: 8, height: 8, borderRadius: '50%', background: status === 'normal' ? '#10b981' : '#ef4444', flexShrink: 0 }} />}
  </motion.div>
);

const AlertCard = ({ alert }) => {
  const colors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#ef4444' };
  const bg = { low: 'rgba(16,185,129,0.1)', medium: 'rgba(245,158,11,0.1)', high: 'rgba(239,68,68,0.1)', critical: 'rgba(239,68,68,0.18)' };
  return (
    <div style={{ padding: '12px 16px', borderRadius: 12, background: bg[alert.severity] || bg.medium, border: `1px solid ${colors[alert.severity] || colors.medium}30`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <AlertTriangle size={16} color={colors[alert.severity] || colors.medium} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 2 }}>{alert.title}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.message}</div>
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: colors[alert.severity] || colors.medium, textTransform: 'uppercase', flexShrink: 0, padding: '2px 8px', borderRadius: 6, background: `${colors[alert.severity] || colors.medium}20` }}>{alert.severity}</span>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    try {
      const [dashRes, trendRes, apptRes, medRes, docRes] = await Promise.all([
        api.get('/recovery/dashboard'),
        api.get('/health-logs/trend?days=7&vital=heartRate'),
        api.get('/appointments/upcoming'),
        api.get('/medications'),
        api.get('/doctors?limit=3&minRating=4.5')
      ]);
      setData(dashRes.data.dashboard);
      setTrend(trendRes.data.trend || []);
      setAppointments(apptRes.data.appointments || []);
      setMedications(medRes.data.medications || []);
      setTopDoctors(docRes.data.doctors || []);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const vitals = data?.latestVitals || {};
  const score = data?.recoveryScore || { total: 0, category: 'Loading...', breakdown: {} };
  const prediction = data?.riskPrediction || { riskLevel: 'low', risks: [] };
  const alerts = data?.recentAlerts || [];
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  const handleCallAmbulance = () => {
    window.location.href = 'tel:108';
    setShowEmergencyModal(true);
  };

  const handleTriggerSOS = async () => {
    try {
      await api.post('/alerts/sos', {
        reason: 'Patient triggered 1-Click Distress SOS from Dashboard',
        vitals: vitals
      });
      setSosSent(true);
      toast.success('🚨 EMERGENCY SOS SENT! Caregiver & Medical Triage Team Alerted.');
      loadData();
    } catch (e) {
      toast.error('Failed to dispatch SOS alert.');
    }
  };

  const handleCopyEmergencyInfo = () => {
    const text = `HEAL FROM HOME - EMERGENCY PATIENT SUMMARY
Patient Name: ${user?.name || 'Patient'}
Condition: Post-Op Recovery
Latest Vitals: Heart Rate: ${vitals.heartRate || 'N/A'} bpm, BP: ${vitals.bloodPressureSystolic ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}` : 'N/A'} mmHg, SpO2: ${vitals.oxygenSaturation || 'N/A'}%, Temp: ${vitals.temperature || 'N/A'}°C
Current Medications: ${medications.map(m => m.name).join(', ') || 'None recorded'}
Emergency Contact: Call immediately`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Emergency summary copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const chartData = {
    labels: trend.map(t => new Date(t.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Heart Rate (bpm)',
      data: trend.map(t => t.heartRate),
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14,165,233,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#0ea5e9',
      pointRadius: 4,
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'var(--text-muted)', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'var(--text-muted)', font: { size: 11 } } }
    }
  };

  const riskColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}><div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 12px' }} /><p style={{ color: 'var(--text-muted)' }}>Loading your recovery dashboard...</p></div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your real-time recovery status for {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>

        {/* Quick Action Top Right */}
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button 
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowAutoModal(true)}
            className="btn"
            style={{ background: 'var(--gradient-main)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 4px 14px rgba(14,165,233,0.3)' }}
          >
            <Sparkles size={16} /> Auto-Pathway Ingestion
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleCallAmbulance}
            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer' }}
          >
            <Ambulance size={18} /> 1-Click 108
          </motion.button>
        </div>
      </motion.div>

      {/* Prominent High-Visibility Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '14px 20px', borderRadius: 16, marginBottom: 20,
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.15))',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                🚨 {criticalAlerts[0].title}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {criticalAlerts[0].message}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleCallAmbulance}
              style={{
                padding: '6px 14px', borderRadius: 8, background: '#ef4444', color: '#fff',
                border: 'none', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Ambulance size={14} /> Call 108 Ambulance
            </button>
            <Link
              to="/doctors"
              style={{
                padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'var(--text-primary)',
                textDecoration: 'none', fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Stethoscope size={14} /> Consult Doctor
            </Link>
          </div>
        </motion.div>
      )}

      {/* Feature Highlight: Zero-Click Discharge Summary -> Care Pathway */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '20px 24px', borderRadius: 20, marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(16, 185, 129, 0.12))',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 650 }}>
          <div style={{ width: 50, height: 50, borderRadius: 16, background: 'linear-gradient(135deg, #0ea5e9, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, boxShadow: '0 8px 20px rgba(14,165,233,0.3)' }}>
            <Sparkles size={26} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 2 }}>
              Autonomous Post-Discharge Care Pathway
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Upload your hospital discharge sheet: the system autonomously extracts all medications, checks drug interactions, sets reminder timetables, and generates day-by-day rehabilitation exercises without manual typing.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => setShowAutoModal(true)}
            style={{
              padding: '10px 20px', borderRadius: 12, background: 'var(--gradient-main)',
              color: '#fff', border: 'none', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 15px rgba(14,165,233,0.35)'
            }}
          >
            <Sparkles size={16} /> Run Auto-Pathway Ingestion
          </button>
          <Link
            to="/recovery-plan"
            style={{
              padding: '10px 16px', borderRadius: 12, background: 'var(--glass-bg)',
              color: 'var(--text-primary)', border: '1px solid var(--glass-border)',
              fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            View Roadmap <ChevronRight size={16} />
          </Link>
        </div>
      </motion.div>

      {/* Top Row: Recovery Score + Vitals & Chart + Risk */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 280px', gap: 20, marginBottom: 20 }}>
        {/* Recovery Score */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <RecoveryGauge score={score.total} category={score.category} />
          <div style={{ marginTop: 16, width: '100%' }}>
            {Object.entries(score.breakdown || {}).map(([key, val]) => (
              <div key={key} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 3 }}>
                  <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{val}</span>
                </div>
                <div style={{ height: 4, borderRadius: 4, background: 'var(--glass-border)', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(val / 30) * 100}%` }} transition={{ duration: 1, delay: 0.5 }}
                    style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#0ea5e9,#10b981)' }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Vitals Grid + Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            <VitalCard icon={Heart} label="Heart Rate" value={vitals.heartRate} unit="bpm" color="#ef4444" status={vitals.heartRate ? (vitals.heartRate >= 60 && vitals.heartRate <= 100 ? 'normal' : 'abnormal') : null} />
            <VitalCard icon={Activity} label="Blood Pressure" value={vitals.bloodPressureSystolic ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}` : null} unit="mmHg" color="#0ea5e9" />
            <VitalCard icon={Thermometer} label="Temperature" value={vitals.temperature} unit="°C" color="#f59e0b" status={vitals.temperature ? (vitals.temperature >= 36 && vitals.temperature <= 37.8 ? 'normal' : 'abnormal') : null} />
            <VitalCard icon={Wind} label="O₂ Saturation" value={vitals.oxygenSaturation} unit="%" color="#10b981" status={vitals.oxygenSaturation ? (vitals.oxygenSaturation >= 95 ? 'normal' : 'abnormal') : null} />
          </div>
          {/* Chart */}
          <div className="glass-card" style={{ padding: 20, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Heart Rate Trend (7 days)</h3>
                {trend.length >= 2 && (() => {
                  const first = trend[0]?.heartRate;
                  const last = trend[trend.length - 1]?.heartRate;
                  const diff = last - first;
                  const improving = diff <= 0;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: improving ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                      {improving ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                      {improving ? 'Stabilizing' : `+${diff} bpm vs start`}
                    </div>
                  );
                })()}
              </div>
              <Link to="/health-logs" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>View all <ChevronRight size={14} /></Link>
            </div>
            <div style={{ height: 140 }}>
              {trend.length > 0 ? <Line data={chartData} options={chartOptions} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data yet. Log your vitals to see trends!</div>}
            </div>
          </div>
        </div>

        {/* Right Column: Risk + Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Risk Prediction */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Shield size={18} color={riskColors[prediction.riskLevel] || '#10b981'} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Risk Assessment</h3>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 20px', borderRadius: 20, background: `${riskColors[prediction.riskLevel] || '#10b981'}20`, border: `1px solid ${riskColors[prediction.riskLevel] || '#10b981'}40` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: riskColors[prediction.riskLevel] || '#10b981', animation: prediction.riskLevel === 'high' ? 'alertPulse 2s infinite' : 'none' }} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: riskColors[prediction.riskLevel] || '#10b981', textTransform: 'capitalize' }}>{prediction.riskLevel} Risk</span>
              </div>
            </div>
            {prediction.risks?.length > 0 ? prediction.risks.slice(0, 3).map((r, i) => (
              <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '6px 10px', background: 'rgba(239,68,68,0.07)', borderRadius: 8, marginBottom: 6 }}>⚠ {r.factor}</div>
            )) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>No risk factors detected. Keep it up! 🎉</p>}
          </motion.div>

          {/* Alerts */}
          <div className="glass-card" style={{ padding: 20, flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Alerts</h3>
              <Link to="/alerts" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>View all</Link>
            </div>
            {alerts.length > 0 ? alerts.slice(0, 3).map(a => <AlertCard key={a._id} alert={a} />) :
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                <Shield size={28} color="#10b981" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: '0.82rem', textAlign: 'center' }}>All clear! No active alerts</p>
              </div>}
          </div>
        </div>
      </div>

      {/* QUICK ACCESS EMERGENCY & HIGHLY SUGGESTED RECOVERY DOCTORS BLOCK */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Card 1: 1-Click Emergency Access & Rapid Response Hub */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card" style={{ padding: 24, border: '1px solid rgba(239, 68, 68, 0.25)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(14, 165, 233, 0.05))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Ambulance size={20} color="#ef4444" /> 1-Click Emergency & Rapid Care
            </h3>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              24/7 ACTIVE
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
            <button
              onClick={handleCallAmbulance}
              style={{
                padding: '14px 16px', borderRadius: 14, background: '#ef4444', color: '#fff',
                border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4,
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.35)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Ambulance size={22} />
                <span style={{ fontSize: '0.75rem', fontWeight: 900, background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: 6 }}>108</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', marginTop: 4 }}>Call Ambulance</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>1-Tap Emergency Response</div>
            </button>

            <button
              onClick={handleTriggerSOS}
              style={{
                padding: '14px 16px', borderRadius: 14, background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <ShieldAlert size={22} color="#ef4444" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>ALERT</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', marginTop: 4 }}>Caregiver SOS</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Notify Family & Doctor</div>
            </button>
          </div>

          {/* Quick Info Strip */}
          <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <User size={16} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Quick Triage ID: #{user?.id ? user.id.slice(-6).toUpperCase() : 'HFH-01'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Status: Post-Op Care Active · High-Speed Tele-Triage</div>
              </div>
            </div>
            <button
              onClick={() => setShowEmergencyModal(true)}
              style={{ padding: '6px 12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              View Card
            </button>
          </div>
        </motion.div>

        {/* Card 2: Highly Recommended Recovery Specialists */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Stethoscope size={20} color="var(--primary)" /> Suggested Recovery Specialists
            </h3>
            <Link to="/doctors" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              All Doctors ({topDoctors.length > 0 ? 8 : 0}) →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topDoctors.length > 0 ? topDoctors.slice(0, 3).map(doc => (
              <div key={doc._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem', flexShrink: 0 }}>
                  👨‍⚕️
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doc.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {doc.specialization} · ⭐ {doc.rating || 4.8} ({doc.experience} yrs)
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10b981' }}>₹{doc.consultationFee || 500}</div>
                  <Link
                    to="/appointments"
                    style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}
                  >
                    1-Click Book <ArrowUpRight size={12} />
                  </Link>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <Stethoscope size={24} style={{ opacity: 0.4, marginBottom: 4 }} />
                <p>Loading suggested specialists...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Appointments + Medications */}
      <div className="grid-2">
        {/* Appointments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={18} color="#0ea5e9" /> Upcoming Appointments</h3>
            <Link to="/appointments" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Book new</Link>
          </div>
          {appointments.length > 0 ? appointments.slice(0, 3).map(appt => (
            <div key={appt._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#0ea5e9,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem' }}>👨‍⚕️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.doctor?.name || 'Doctor'}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{appt.doctor?.specialization}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>{new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appt.timeSlot?.startTime || 'TBD'}</div>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              <Calendar size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p style={{ fontSize: '0.85rem' }}>No upcoming appointments</p>
              <Link to="/doctors" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Find a doctor →</Link>
            </div>
          )}
        </motion.div>

        {/* Medications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}><Pill size={18} color="#10b981" /> Today's Medications ({medications.length})</h3>
            <Link to="/medications" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Manage</Link>
          </div>
          {medications.length > 0 ? medications.slice(0, 4).map(med => (
            <div key={med._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>💊</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{med.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{med.dosage} · {med.frequency}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {med.reminderTimes?.slice(0, 2).map((t, i) => (
                  <span key={i} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(14,165,233,0.15)', color: 'var(--primary)', fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              <Pill size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p style={{ fontSize: '0.85rem' }}>No medications added</p>
              <button 
                onClick={() => setShowAutoModal(true)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                ⚡ Ingest from Discharge Sheet →
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Assistant Quick Access */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ marginTop: 20 }}>
        <Link to="/ai-assistant" style={{ textDecoration: 'none' }}>
          <motion.div whileHover={{ y: -3, boxShadow: '0 20px 60px rgba(99,102,241,0.2)' }} style={{ padding: '20px 28px', borderRadius: 20, background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(14,165,233,0.15))', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
              <Bot size={24} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>Ask MedAI — Your 24/7 AI Clinical Assistant</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get instant guidance on symptoms, medication side-effects, and recovery protocols anytime</div>
            </div>
            <ChevronRight size={20} color="var(--accent)" />
          </motion.div>
        </Link>
      </motion.div>

      {/* Zero-Click Discharge Summary Automation Modal */}
      <DischargeAutomationModal
        isOpen={showAutoModal}
        onClose={() => setShowAutoModal(false)}
        onPathwayApplied={() => loadData()}
      />

      {/* 1-Click Emergency Card Modal */}
      {showEmergencyModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: '100%', maxWidth: 520, background: 'var(--bg-card)',
              borderRadius: 24, border: '1px solid rgba(239, 68, 68, 0.4)',
              boxShadow: '0 25px 60px rgba(239, 68, 68, 0.3)', padding: 24
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Ambulance size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Emergency Dispatch Card</h3>
                  <div style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 700 }}>Ambulance Dial Initiated (108 / 112)</div>
                </div>
              </div>
              <button onClick={() => setShowEmergencyModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ background: 'var(--glass-bg)', padding: 16, borderRadius: 14, border: '1px solid var(--glass-border)', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 8 }}>Paramedic Live Handover Summary:</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <div>• <strong>Patient:</strong> {user?.name || 'Patient'} ({user?.email})</div>
                <div>• <strong>Heart Rate:</strong> {vitals.heartRate || '—'} bpm</div>
                <div>• <strong>Blood Pressure:</strong> {vitals.bloodPressureSystolic ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg` : '—'}</div>
                <div>• <strong>SpO2:</strong> {vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : '—'}</div>
                <div>• <strong>Active Meds:</strong> {medications.map(m => m.name).slice(0, 3).join(', ') || 'None'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleCopyEmergencyInfo}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontWeight: 700,
                  fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Summary'}
              </button>
              <button
                onClick={() => {
                  window.location.href = 'tel:108';
                }}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, background: '#ef4444',
                  border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.85rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <PhoneCall size={16} /> Redial 108
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
