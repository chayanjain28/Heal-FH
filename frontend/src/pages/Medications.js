import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, Plus, Check, X, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MedCard = ({ med, onLog, onDelete }) => {
  const today = new Date().toDateString();
  const todayLogs = med.logs?.filter(l => new Date(l.takenAt).toDateString() === today) || [];
  const takenToday = todayLogs.some(l => l.status === 'taken');

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }} className="glass-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: takenToday ? 'rgba(16,185,129,0.15)' : 'rgba(14,165,233,0.12)', border: `1px solid ${takenToday ? 'rgba(16,185,129,0.3)' : 'rgba(14,165,233,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>💊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 2 }}>{med.name}</div>
            {med.genericName && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{med.genericName}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {takenToday && <span className="badge badge-success"><Check size={11} /> Taken</span>}
          <button onClick={() => onDelete(med._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><Trash2 size={14} /></button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dosage: <strong style={{ color: 'var(--text-primary)' }}>{med.dosage}</strong></div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Frequency: <strong style={{ color: 'var(--text-primary)' }}>{med.frequency}</strong></div>
        {med.prescribedBy && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By: <strong style={{ color: 'var(--text-primary)' }}>{med.prescribedBy}</strong></div>}
        {med.route && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Route: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{med.route}</strong></div>}
      </div>
      {med.reminderTimes?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {med.reminderTimes.map((t, i) => <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', padding: '3px 10px', borderRadius: 8, background: 'rgba(14,165,233,0.1)', color: 'var(--primary)', border: '1px solid rgba(14,165,233,0.2)', fontWeight: 600 }}><Clock size={11} />{t}</span>)}
        </div>
      )}
      {med.instructions && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '8px 12px', background: 'rgba(245,158,11,0.08)', borderRadius: 8, marginBottom: 14, border: '1px solid rgba(245,158,11,0.2)' }}><AlertTriangle size={12} color="#f59e0b" style={{ marginRight: 5, display: 'inline' }} />{med.instructions}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={() => onLog(med._id, 'taken')} style={{ flex: 1, padding: '9px', background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Check size={13} /> Mark Taken
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} onClick={() => onLog(med._id, 'missed')} style={{ flex: 1, padding: '9px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: 'var(--danger)', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <X size={13} /> Missed
        </motion.button>
      </div>
    </motion.div>
  );
};

const Medications = () => {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', genericName: '', dosage: '', frequency: '', route: 'oral', startDate: '', endDate: '', instructions: '', prescribedBy: '', reminderTimes: '08:00,14:00,21:00' });

  const load = async () => {
    try {
      const { data } = await api.get('/medications');
      setMeds(data.medications || []);
    } catch { toast.error('Failed to load medications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, startDate: form.startDate || new Date().toISOString(), reminderTimes: form.reminderTimes.split(',').map(t => t.trim()).filter(Boolean) };
      await api.post('/medications', payload);
      toast.success('Medication added!');
      setShowForm(false);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to add medication'); }
  };

  const handleLog = async (id, status) => {
    try {
      await api.post(`/medications/${id}/log`, { status });
      toast.success(status === 'taken' ? '✅ Medication logged as taken!' : '⚠ Marked as missed');
      load();
    } catch { toast.error('Failed to log medication'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/medications/${id}`);
      toast.success('Medication removed');
      load();
    } catch { toast.error('Failed to remove'); }
  };

  const adherenceRate = () => {
    const allLogs = meds.flatMap(m => m.logs || []);
    if (!allLogs.length) return 0;
    const taken = allLogs.filter(l => l.status === 'taken').length;
    return Math.round((taken / allLogs.length) * 100);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1 className="page-title">Medications</h1><p className="page-subtitle">Track and manage your prescribed medications</p></div>
        <motion.button whileHover={{ scale: 1.03 }} onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> Add Medication</motion.button>
      </div>

      {/* Adherence stat */}
      {meds.length > 0 && (
        <div className="glass-card" style={{ padding: '16px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Pill size={24} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{adherenceRate()}%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Overall Medication Adherence</div>
          </div>
          <div style={{ flex: 1, height: 8, background: 'var(--glass-border)', borderRadius: 4, overflow: 'hidden', marginLeft: 10 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${adherenceRate()}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: 'linear-gradient(90deg,#10b981,#059669)', borderRadius: 4 }} />
          </div>
        </div>
      )}

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div> :
        meds.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
            {meds.map(m => <MedCard key={m._id} med={m} onLog={handleLog} onDelete={handleDelete} />)}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Pill size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No medications added yet</p>
            <p style={{ fontSize: '0.88rem', marginBottom: 20 }}>Add your prescribed medications to track adherence</p>
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> Add First Medication</motion.button>
          </div>
        )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: 24 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', maxWidth: 520, background: 'var(--bg-card)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>Add Medication</h2>
            <form onSubmit={handleAdd}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="form-group"><label className="form-label">Medication Name *</label><input className="form-input" required placeholder="e.g. Metformin" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Generic Name</label><input className="form-input" placeholder="Generic/scientific name" value={form.genericName} onChange={e => setForm(p => ({ ...p, genericName: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Dosage *</label><input className="form-input" required placeholder="e.g. 500mg" value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Frequency *</label><input className="form-input" required placeholder="e.g. Twice daily" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Route</label>
                  <select className="form-input" value={form.route} onChange={e => setForm(p => ({ ...p, route: e.target.value }))}>
                    {['oral', 'injection', 'topical', 'inhaled', 'other'].map(r => <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Prescribed By</label><input className="form-input" placeholder="Doctor name" value={form.prescribedBy} onChange={e => setForm(p => ({ ...p, prescribedBy: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Reminder Times (comma separated)</label><input className="form-input" placeholder="08:00,14:00,21:00" value={form.reminderTimes} onChange={e => setForm(p => ({ ...p, reminderTimes: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Instructions</label><textarea className="form-input" rows={2} placeholder="Take with food, avoid alcohol..." value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} style={{ resize: 'none' }} /></div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, color: 'var(--text-muted)' }}>Cancel</button>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#0ea5e9,#10b981)', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, color: 'white' }}>Add Medication</motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Medications;
