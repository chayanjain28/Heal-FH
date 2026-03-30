import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Calendar, User, FileText, Stethoscope, ChevronDown, ChevronUp, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const statusColors = {
  discharged: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  active: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  readmitted: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
};

const RecordCard = ({ record, onSelect, isSelected }) => {
  const conf = statusColors[record.status] || statusColors.discharged;
  const duration = record.admissionDate && record.dischargeDate
    ? Math.round((new Date(record.dischargeDate) - new Date(record.admissionDate)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onClick={() => onSelect(record)}
      className="glass-card"
      style={{
        padding: 20, cursor: 'pointer', marginBottom: 14,
        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
        background: isSelected ? 'linear-gradient(135deg,rgba(14,165,233,0.08),rgba(16,185,129,0.08))' : 'var(--glass-bg-strong)',
      }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,rgba(14,165,233,0.15),rgba(16,185,129,0.15))', border: '1px solid rgba(14,165,233,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.5rem' }}>
          🏥
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.hospitalName}</div>
          {record.primaryDiagnosis && (
            <div style={{ fontSize: '0.83rem', color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>{record.primaryDiagnosis}</div>
          )}
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: conf.bg, color: conf.color, border: `1px solid ${conf.border}`, textTransform: 'capitalize', flexShrink: 0 }}>
          {record.status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        {record.admissionDate && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={11} /> {new Date(record.admissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
        {duration !== null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            🕒 {duration} day{duration !== 1 ? 's' : ''}
          </span>
        )}
        {record.attendingDoctor && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Stethoscope size={11} color="var(--secondary)" /> {record.attendingDoctor}
          </span>
        )}
      </div>

      {record.followUpRequired && record.followUpDate && (
        <div style={{ marginTop: 10, padding: '6px 12px', background: 'rgba(245,158,11,0.1)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.78rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 6 }}>
          📅 Follow-up: {new Date(record.followUpDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
      )}
    </motion.div>
  );
};

const DetailPanel = ({ record, onClose }) => {
  const [expandSummary, setExpandSummary] = React.useState(true);
  if (!record) return null;
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
      className="glass-card" style={{ padding: 28, position: 'sticky', top: 0, maxHeight: '85vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Record Details</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, padding: '14px', background: 'linear-gradient(135deg,rgba(14,165,233,0.08),rgba(16,185,129,0.08))', borderRadius: 12, border: '1px solid rgba(14,165,233,0.15)' }}>
        <div style={{ fontSize: '2rem' }}>🏥</div>
        <div>
          <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{record.hospitalName}</div>
          {record.primaryDiagnosis && <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{record.primaryDiagnosis}</div>}
        </div>
      </div>

      {[
        { label: 'Admission Date', value: record.admissionDate ? new Date(record.admissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null, icon: Calendar },
        { label: 'Discharge Date', value: record.dischargeDate ? new Date(record.dischargeDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null, icon: Calendar },
        { label: 'Attending Doctor', value: record.attendingDoctor, icon: Stethoscope },
        { label: 'Ward / Room', value: record.ward || record.roomNumber, icon: Building2 },
      ].filter(f => f.value).map(({ label, value, icon: Icon }) => (
        <div key={label} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon size={11} /> {label}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{value}</div>
        </div>
      ))}

      {record.diagnosis?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>All Diagnoses</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {record.diagnosis.map((d, i) => <span key={i} className="badge badge-info">{d}</span>)}
          </div>
        </div>
      )}

      {record.treatmentSummary && (
        <div style={{ marginBottom: 14 }}>
          <button onClick={() => setExpandSummary(e => !e)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 6 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
              <User size={11} /> Treatment Summary
            </div>
            {expandSummary ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
          </button>
          <AnimatePresence>
            {expandSummary && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.7, padding: '12px', background: 'var(--glass-bg)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
                  {record.treatmentSummary}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {record.dischargeInstructions && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <FileText size={11} /> Discharge Instructions
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.7, padding: '12px', background: 'rgba(14,165,233,0.06)', borderRadius: 10, border: '1px solid rgba(14,165,233,0.15)' }}>
            {record.dischargeInstructions}
          </div>
        </div>
      )}

      {record.followUpDate && (
        <div style={{ padding: '12px 14px', background: 'rgba(245,158,11,0.1)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.25)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Calendar size={16} color="var(--warning)" />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning)' }}>Follow-up Scheduled</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {new Date(record.followUpDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const HospitalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    hospitalName: '', admissionDate: '', dischargeDate: '', primaryDiagnosis: '',
    diagnosis: '', attendingDoctor: '', ward: '', treatmentSummary: '',
    dischargeInstructions: '', followUpRequired: false, followUpDate: '', status: 'discharged'
  });

  const load = async () => {
    try {
      const { data } = await api.get('/patients/hospital-records');
      setRecords(data.records || []);
    } catch { toast.error('Failed to load hospital records'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        diagnosis: form.diagnosis.split(',').map(d => d.trim()).filter(Boolean),
      };
      await api.post('/patients/hospital-records', payload);
      toast.success('Hospital record added successfully!');
      setShowForm(false);
      setForm({ hospitalName: '', admissionDate: '', dischargeDate: '', primaryDiagnosis: '', diagnosis: '', attendingDoctor: '', ward: '', treatmentSummary: '', dischargeInstructions: '', followUpRequired: false, followUpDate: '', status: 'discharged' });
      load();
    } catch { toast.error('Failed to add record'); }
  };

  const totalDays = records.reduce((acc, r) => {
    if (r.admissionDate && r.dischargeDate) {
      return acc + Math.round((new Date(r.dischargeDate) - new Date(r.admissionDate)) / (1000 * 60 * 60 * 24));
    }
    return acc;
  }, 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Hospital Records</h1>
          <p className="page-subtitle">Your complete hospital stay history and discharge summaries</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={16} /> Add Record
        </motion.button>
      </div>

      {/* Summary stats */}
      {records.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Admissions', value: records.length, icon: '🏥', color: '#0ea5e9' },
            { label: 'Total Days Hospitalised', value: `${totalDays}d`, icon: '📅', color: '#10b981' },
            { label: 'Follow-ups Needed', value: records.filter(r => r.followUpRequired && !r.followUpDate).length + records.filter(r => r.followUpDate && new Date(r.followUpDate) > new Date()).length, icon: '📋', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: '1.6rem' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : records.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 20, alignItems: 'start' }}>
          <div>
            {records.map(r => (
              <RecordCard key={r._id} record={r} onSelect={rec => setSelected(selected?._id === rec._id ? null : rec)} isSelected={selected?._id === r._id} />
            ))}
          </div>
          <AnimatePresence>
            {selected && <DetailPanel record={selected} onClose={() => setSelected(null)} />}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Building2 size={52} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>No Hospital Records Yet</p>
          <p style={{ fontSize: '0.9rem', marginBottom: 24 }}>Add your hospital discharge records to build your complete medical history</p>
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> Add First Record</motion.button>
        </div>
      )}

      {/* Add Record Modal */}
      <AnimatePresence>
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: 24, overflowY: 'auto' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ width: '100%', maxWidth: 600, background: 'var(--bg-card)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-lg)', maxHeight: '92vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={20} color="var(--primary)" /> Add Hospital Record
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="form-group"><label className="form-label">Hospital Name *</label><input className="form-input" required placeholder="e.g. Apollo Hospital, Mumbai" value={form.hospitalName} onChange={e => setForm(p => ({ ...p, hospitalName: e.target.value }))} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <div className="form-group"><label className="form-label">Admission Date *</label><input className="form-input" type="date" required value={form.admissionDate} onChange={e => setForm(p => ({ ...p, admissionDate: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Discharge Date</label><input className="form-input" type="date" value={form.dischargeDate} onChange={e => setForm(p => ({ ...p, dischargeDate: e.target.value }))} /></div>
                </div>
                <div className="form-group"><label className="form-label">Primary Diagnosis</label><input className="form-input" placeholder="Main condition treated" value={form.primaryDiagnosis} onChange={e => setForm(p => ({ ...p, primaryDiagnosis: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Other Diagnoses <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span></label><input className="form-input" placeholder="Hypertension, Anaemia, Infection..." value={form.diagnosis} onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Stethoscope size={13} color="var(--secondary)" /> Attending Doctor</label>
                    <input className="form-input" placeholder="Dr. Name" value={form.attendingDoctor} onChange={e => setForm(p => ({ ...p, attendingDoctor: e.target.value }))} />
                  </div>
                  <div className="form-group"><label className="form-label">Ward / Room</label><input className="form-input" placeholder="e.g. ICU / Room 204" value={form.ward} onChange={e => setForm(p => ({ ...p, ward: e.target.value }))} /></div>
                </div>
                <div className="form-group"><label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="discharged">Discharged</option><option value="active">Active Admission</option><option value="readmitted">Readmitted</option>
                  </select></div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><User size={13} color="var(--primary)" /> Treatment Summary</label>
                  <textarea className="form-input" rows={3} placeholder="Brief summary of treatments, procedures, and interventions..." value={form.treatmentSummary} onChange={e => setForm(p => ({ ...p, treatmentSummary: e.target.value }))} style={{ resize: 'none' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FileText size={13} color="var(--accent)" /> Discharge Instructions</label>
                  <textarea className="form-input" rows={3} placeholder="Instructions given at time of discharge..." value={form.dischargeInstructions} onChange={e => setForm(p => ({ ...p, dischargeInstructions: e.target.value }))} style={{ resize: 'none' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 14px', background: 'rgba(245,158,11,0.06)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)' }}>
                  <input type="checkbox" id="followUp" checked={form.followUpRequired} onChange={e => setForm(p => ({ ...p, followUpRequired: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--warning)', cursor: 'pointer' }} />
                  <label htmlFor="followUp" style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>Follow-up appointment required</label>
                  {form.followUpRequired && (
                    <input className="form-input" type="date" value={form.followUpDate} onChange={e => setForm(p => ({ ...p, followUpDate: e.target.value }))} style={{ marginLeft: 'auto', width: 'auto' }} />
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, color: 'var(--text-muted)' }}>Cancel</button>
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg,#0ea5e9,#10b981)', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, color: 'white' }}>
                    Save Record
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HospitalRecords;
