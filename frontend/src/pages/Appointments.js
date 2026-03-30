import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Video, Phone, X, CheckCircle, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const statusConfig = {
  confirmed: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Confirmed', icon: null },
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Pending', icon: null },
  completed: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', label: 'Completed', icon: 'check' },
  cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Cancelled', icon: null },
};

const typeIcon = { 'in-person': <MapPin size={13} />, 'video': <Video size={13} />, 'phone': <Phone size={13} /> };

const AppointmentCard = ({ appt, onCancel }) => {
  const conf = statusConfig[appt.status] || statusConfig.pending;
  const isPast = new Date(appt.date) < new Date();
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }}
      className="glass-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, overflow: 'hidden', border: '2px solid var(--glass-border)', flexShrink: 0 }}>
          <img src={appt.doctor?.photo || `https://i.pravatar.cc/52?u=${appt.doctor?._id}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = `https://i.pravatar.cc/52?u=${appt._id}`; }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 2 }}>{appt.doctor?.name || 'Doctor'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{appt.doctor?.specialization}</div>
          {appt.doctor?.hospital && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{appt.doctor.hospital}</div>}
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 10, background: conf.bg, color: conf.color, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {conf.icon === 'check' && <CheckCircle size={12} />}{conf.label}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <Calendar size={13} color="var(--primary)" />
          {new Date(appt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        {appt.timeSlot?.startTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <Clock size={13} color="var(--secondary)" />{appt.timeSlot.startTime}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
          {typeIcon[appt.type]}{appt.type?.replace('-', ' ')}
        </div>
      </div>
      {appt.reason && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px 12px', background: 'var(--glass-bg)', borderRadius: 8, marginBottom: 12 }}>📝 {appt.reason}</div>}
      {appt.fee && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>Fee: <strong style={{ color: 'var(--text-primary)' }}>₹{appt.fee}</strong></div>}
      {!isPast && appt.status !== 'cancelled' && appt.status !== 'completed' && (
        <button onClick={() => onCancel(appt._id)} style={{ width: '100%', padding: '9px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: 'var(--danger)', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <X size={13} /> Cancel Appointment
        </button>
      )}
      {appt.consultationSummary && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)', marginTop: 8 }}>
          <strong style={{ color: 'var(--secondary)' }}>Summary:</strong> {appt.consultationSummary}
        </div>
      )}
    </motion.div>
  );
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = tab === 'upcoming' ? { upcoming: true } : tab === 'history' ? { status: 'completed' } : {};
      const { data } = await api.get('/appointments', { params });
      setAppointments(data.appointments || []);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to cancel'); }
  };

  const stats = {
    upcoming: appointments.filter(a => new Date(a.date) >= new Date() && a.status !== 'cancelled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Manage your doctor appointments and follow-ups</p>
        </div>
        <Link to="/doctors">
          <motion.button whileHover={{ scale: 1.03 }} className="btn btn-primary">
            <Calendar size={16} /> Book New
          </motion.button>
        </Link>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Upcoming', value: stats.upcoming, color: '#0ea5e9', icon: '📅' },
          { label: 'Completed', value: stats.completed, color: '#10b981', icon: '✅' },
          { label: 'Cancelled', value: stats.cancelled, color: '#ef4444', icon: '❌' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '1.6rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--glass-bg)', borderRadius: 14, padding: 5, border: '1px solid var(--glass-border)', width: 'fit-content' }}>
        {[
          { key: 'upcoming', label: '📅 Upcoming' },
          { key: 'all', label: '📋 All' },
          { key: 'history', label: '✅ History' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.85rem', background: tab === t.key ? 'linear-gradient(135deg,#0ea5e9,#10b981)' : 'transparent', color: tab === t.key ? 'white' : 'var(--text-muted)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : appointments.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
          {appointments.map(a => <AppointmentCard key={a._id} appt={a} onCancel={handleCancel} />)}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No appointments found</p>
          <p style={{ fontSize: '0.88rem', marginBottom: 20 }}>Book your first appointment with a specialist</p>
          <Link to="/doctors"><motion.button whileHover={{ scale: 1.03 }} className="btn btn-primary"><ChevronRight size={16} /> Find Doctors</motion.button></Link>
        </div>
      )}
    </div>
  );
};

export default Appointments;
