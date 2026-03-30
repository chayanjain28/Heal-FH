import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Activity, Heart, Thermometer, Wind, AlertTriangle, Calendar, Pill, Bot, TrendingUp, TrendingDown, ChevronRight, Shield } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
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
  const colors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#7f1d1d' };
  const bg = { low: 'rgba(16,185,129,0.1)', medium: 'rgba(245,158,11,0.1)', high: 'rgba(239,68,68,0.1)', critical: 'rgba(127,29,29,0.2)' };
  return (
    <div style={{ padding: '12px 16px', borderRadius: 12, background: bg[alert.severity], border: `1px solid ${colors[alert.severity]}30`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <AlertTriangle size={16} color={colors[alert.severity]} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 2 }}>{alert.title}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.message}</div>
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: colors[alert.severity], textTransform: 'uppercase', flexShrink: 0, padding: '2px 8px', borderRadius: 6, background: `${colors[alert.severity]}20` }}>{alert.severity}</span>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, trendRes, apptRes, medRes] = await Promise.all([
          api.get('/recovery/dashboard'),
          api.get('/health-logs/trend?days=7&vital=heartRate'),
          api.get('/appointments/upcoming'),
          api.get('/medications')
        ]);
        setData(dashRes.data.dashboard);
        setTrend(trendRes.data.trend || []);
        setAppointments(apptRes.data.appointments || []);
        setMedications(medRes.data.medications || []);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const vitals = data?.latestVitals || {};
  const score = data?.recoveryScore || { total: 0, category: 'Loading...', breakdown: {} };
  const prediction = data?.riskPrediction || { riskLevel: 'low', risks: [] };
  const alerts = data?.recentAlerts || [];

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
      <div style={{ textAlign: 'center' }}><div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 12px' }} /><p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p></div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1 className="page-title">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's your health summary for today, {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </motion.div>

      {/* Top Row: Recovery Score + Risk + Quick Actions */}
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

      {/* Bottom Row: Appointments + Medications */}
      <div className="grid-2">
        {/* Appointments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 24 }}>
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
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}><Pill size={18} color="#10b981" /> Today's Medications</h3>
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
              <Link to="/medications" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Add medication →</Link>
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
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>Ask MedAI — Your 24/7 AI Assistant</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get personalized recovery advice, report explanations, and health insights anytime</div>
            </div>
            <ChevronRight size={20} color="var(--accent)" />
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
};

export default Dashboard;
