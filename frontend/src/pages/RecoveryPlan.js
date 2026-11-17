import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Target, Dumbbell, Utensils, Plus, CheckCircle, Circle, Shield, TrendingUp, Sparkles } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import DischargeAutomationModal from '../components/DischargeAutomationModal';

const RecoveryPlan = () => {
  const [plan, setPlan] = useState(null);
  const [score, setScore] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', phase: 'acute', expectedEndDate: '', dietaryGuidelines: '', restrictions: '', goals: '' });

  const load = async () => {
    try {
      const [planRes, scoreRes, predRes] = await Promise.all([
        api.get('/recovery/plan'),
        api.get('/recovery/score'),
        api.get('/recovery/predict'),
      ]);
      setPlan(planRes.data.plan);
      setScore(scoreRes.data.score);
      setPrediction(predRes.data.prediction);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        dietaryGuidelines: form.dietaryGuidelines.split('\n').filter(Boolean),
        restrictions: form.restrictions.split('\n').filter(Boolean),
        goals: form.goals.split('\n').filter(Boolean).map(g => ({ description: g })),
      };
      await api.post('/recovery/plan', payload);
      toast.success('Recovery plan created!');
      setShowCreate(false);
      const { data } = await api.get('/recovery/plan');
      setPlan(data.plan);
    } catch { toast.error('Failed to create plan'); }
  };

  const riskColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
  const phaseColors = { acute: '#ef4444', subacute: '#f59e0b', maintenance: '#10b981' };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Recovery Plan</h1>
          <p className="page-subtitle">Your personalized post-discharge recovery roadmap</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button 
            whileHover={{ scale: 1.03 }} 
            onClick={() => setShowAutoModal(true)} 
            className="btn"
            style={{ background: 'var(--gradient-main)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 4px 14px rgba(14,165,233,0.3)' }}
          >
            <Sparkles size={16} /> Auto-Generate from Discharge Sheet
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => setShowCreate(true)} className="btn btn-primary">
            <Plus size={16} /> {plan ? 'Edit Manually' : 'Manual Plan'}
          </motion.button>
        </div>
      </div>

      {/* Score + Risk Row */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Recovery Score */}
        {score && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={18} color="var(--primary)" /> Recovery Score</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--glass-border)" strokeWidth="8" />
                  <motion.circle cx="50" cy="50" r="40" fill="none" stroke={score.total >= 70 ? '#10b981' : score.total >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="8"
                    strokeDasharray={251} strokeDashoffset={251 - (score.total / 100) * 251} strokeLinecap="round"
                    initial={{ strokeDashoffset: 251 }} animate={{ strokeDashoffset: 251 - (score.total / 100) * 251 }} transition={{ duration: 1.5 }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{score.total}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: score.total >= 70 ? '#10b981' : score.total >= 50 ? '#f59e0b' : '#ef4444', marginBottom: 8 }}>{score.category}</div>
                {Object.entries(score.breakdown || {}).map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
                      <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 3, background: 'var(--glass-border)', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (v / 30) * 100)}%` }} transition={{ duration: 1, delay: 0.3 }}
                        style={{ height: '100%', background: 'linear-gradient(90deg,#0ea5e9,#10b981)', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Risk Prediction */}
        {prediction && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} color="var(--primary)" /> Complication Risk</h3>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 24px', borderRadius: 20, background: `${riskColors[prediction.riskLevel] || '#10b981'}15`, border: `1px solid ${riskColors[prediction.riskLevel] || '#10b981'}40` }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: riskColors[prediction.riskLevel] || '#10b981' }} />
                <span style={{ fontWeight: 900, fontSize: '1.1rem', color: riskColors[prediction.riskLevel] || '#10b981', textTransform: 'capitalize' }}>{prediction.riskLevel} Risk</span>
              </div>
            </div>
            {prediction.risks?.length > 0 ? (
              prediction.risks.map((r, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.07)', borderRadius: 10, marginBottom: 8, border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 4 }}>⚠ {r.factor}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.recommendation}</div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px 0' }}>
                <CheckCircle size={28} color="#10b981" style={{ marginBottom: 8 }} />
                <p>No risk factors detected. Keep maintaining your routine!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recovery Plan Details */}
      {plan ? (
        <div>
          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 6 }}>{plan.title}</h2>
                {plan.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{plan.description}</p>}
                {plan.aiGenerated && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, marginTop: 6 }}>
                    <Sparkles size={12} /> AI Generated Plan
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: 10, background: `${phaseColors[plan.phase] || '#0ea5e9'}15`, color: phaseColors[plan.phase] || '#0ea5e9', textTransform: 'capitalize' }}>{plan.phase} Phase</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span>Started: {new Date(plan.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</span>
              {plan.expectedEndDate && <span>Expected End: {new Date(plan.expectedEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</span>}
              <span>Current Score: <strong style={{ color: 'var(--primary)' }}>{plan.currentScore}/100</strong></span>
            </div>
          </div>

          <div className="grid-2">
            {/* Goals */}
            {plan.goals?.length > 0 && (
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Target size={18} color="#6366f1" /> Recovery Goals</h3>
                {plan.goals.map((g, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10, padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    {g.isCompleted ? <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} /> : <Circle size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 1 }} />}
                    <span style={{ fontSize: '0.85rem', color: g.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: g.isCompleted ? 'line-through' : 'none' }}>{g.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Exercises */}
            {plan.exercises?.length > 0 && (
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Dumbbell size={18} color="#f59e0b" /> Exercises</h3>
                {plan.exercises.map((ex, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: 'var(--glass-bg)', borderRadius: 10, marginBottom: 8, border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 4 }}>{ex.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{[ex.frequency, ex.duration].filter(Boolean).join(' · ')}</div>
                    {ex.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{ex.description}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Dietary Guidelines */}
            {plan.dietaryGuidelines?.length > 0 && (
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Utensils size={18} color="#10b981" /> Dietary Guidelines</h3>
                {plan.dietaryGuidelines.map((g, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <span style={{ color: '#10b981' }}>✓</span> {g}
                  </div>
                ))}
              </div>
            )}

            {/* Restrictions */}
            {plan.restrictions?.length > 0 && (
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>🚫 Restrictions</h3>
                {plan.restrictions.map((r, i) => (
                  <div key={i} style={{ padding: '7px 12px', background: 'rgba(239,68,68,0.07)', borderRadius: 8, marginBottom: 6, fontSize: '0.85rem', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)' }}>⚠ {r}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ClipboardList size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No Recovery Plan Yet</p>
          <p style={{ fontSize: '0.88rem', marginBottom: 20 }}>Create a personalized recovery plan to track your progress</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => setShowCreate(true)} className="btn btn-primary"><Plus size={16} /> Create Recovery Plan</motion.button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}><Sparkles size={14} color="var(--accent)" /> Tip: Log vitals to get AI-powered score</div>
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: 24, overflowY: 'auto' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ width: '100%', maxWidth: 560, background: 'var(--bg-card)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 24 }}>Create Recovery Plan</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label className="form-label">Plan Title *</label><input className="form-input" required placeholder="e.g. Post Cardiac Surgery Recovery" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={2} placeholder="Brief description of the recovery plan..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'none' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="form-group"><label className="form-label">Phase</label>
                  <select className="form-input" value={form.phase} onChange={e => setForm(p => ({ ...p, phase: e.target.value }))}>
                    <option value="acute">Acute (0-2 weeks)</option>
                    <option value="subacute">Sub-acute (2-6 weeks)</option>
                    <option value="maintenance">Maintenance (6+ weeks)</option>
                  </select></div>
                <div className="form-group"><label className="form-label">Expected End Date</label><input className="form-input" type="date" value={form.expectedEndDate} onChange={e => setForm(p => ({ ...p, expectedEndDate: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Goals (one per line)</label><textarea className="form-input" rows={3} placeholder="Walk 10 minutes daily&#10;Maintain BP below 130/80&#10;Resume light activities" value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))} style={{ resize: 'none' }} /></div>
              <div className="form-group"><label className="form-label">Dietary Guidelines (one per line)</label><textarea className="form-input" rows={3} placeholder="Low sodium diet&#10;Avoid fried foods&#10;Drink 2L water daily" value={form.dietaryGuidelines} onChange={e => setForm(p => ({ ...p, dietaryGuidelines: e.target.value }))} style={{ resize: 'none' }} /></div>
              <div className="form-group"><label className="form-label">Restrictions (one per line)</label><textarea className="form-input" rows={2} placeholder="No strenuous exercise&#10;Avoid alcohol&#10;No driving for 2 weeks" value={form.restrictions} onChange={e => setForm(p => ({ ...p, restrictions: e.target.value }))} style={{ resize: 'none' }} /></div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '11px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, color: 'var(--text-muted)' }}>Cancel</button>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#0ea5e9,#10b981)', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, color: 'white' }}>Create Plan</motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Auto Pathway Modal */}
      <DischargeAutomationModal
        isOpen={showAutoModal}
        onClose={() => setShowAutoModal(false)}
        onPathwayApplied={() => load()}
      />
    </div>
  );
};

export default RecoveryPlan;
