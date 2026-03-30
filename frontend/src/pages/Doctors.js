import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, MapPin, Award, Clock, Calendar, Filter } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const specializations = ['All', 'Cardiologist', 'Orthopedic Surgeon', 'Neurologist', 'General Physician', 'Pulmonologist', 'Endocrinologist', 'Gastroenterologist', 'Physiotherapist'];

const BookingModal = ({ doctor, onClose, onBook }) => {
  const [form, setForm] = useState({ date: '', time: '', type: 'in-person', reason: '' });
  const [booking, setBooking] = useState(false);

  const handleBook = async () => {
    if (!form.date || !form.time) return toast.error('Please select date and time');
    setBooking(true);
    try {
      await api.post('/appointments', { doctorId: doctor._id, date: form.date, timeSlot: { startTime: form.time, endTime: form.time }, type: form.type, reason: form.reason });
      toast.success(`Appointment booked with ${doctor.name}! 🎉`);
      onBook();
      onClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Booking failed'); }
    finally { setBooking(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: 24 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', maxWidth: 480, background: 'var(--bg-card)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-lg)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Book Appointment</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 24 }}>with {doctor.name} · {doctor.specialization}</p>
        <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} min={new Date().toISOString().split('T')[0]} /></div>
        <div className="form-group"><label className="form-label">Preferred Time</label>
          <select className="form-input" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}>
            <option value="">Select time slot</option>
            {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Consultation Type</label>
          <select className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
            <option value="in-person">In-Person</option>
            <option value="video">Video Call</option>
            <option value="phone">Phone Call</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Reason (optional)</label><textarea className="form-input" rows={2} placeholder="Describe your concern..." value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} style={{ resize: 'none' }} /></div>
        {doctor.consultationFee && <div style={{ padding: '10px 14px', background: 'rgba(14,165,233,0.08)', borderRadius: 10, marginBottom: 16, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Consultation Fee: <strong style={{ color: 'var(--primary)' }}>₹{doctor.consultationFee}</strong>
        </div>}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, color: 'var(--text-muted)' }}>Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBook} disabled={booking} style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#0ea5e9,#10b981)', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, color: 'white', opacity: booking ? 0.7 : 1 }}>
            {booking ? 'Booking...' : 'Confirm Booking'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const DoctorCard = ({ doctor, onBook }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(14,165,233,0.15)' }} className="glass-card" style={{ padding: 24, cursor: 'default', transition: 'all 0.3s' }}>
    <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, overflow: 'hidden', flexShrink: 0, border: '2px solid var(--glass-border)' }}>
        <img src={doctor.photo || `https://i.pravatar.cc/60?u=${doctor._id}`} alt={doctor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = `https://i.pravatar.cc/60?u=${doctor.name}`; }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doctor.name}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>{doctor.specialization}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Star size={13} color="#f59e0b" fill="#f59e0b" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{doctor.rating}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({doctor.reviewCount} reviews)</span>
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}><Award size={13} color="var(--accent)" />{doctor.experience} yrs exp</div>
      {doctor.location?.city && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}><MapPin size={13} color="var(--secondary)" />{doctor.location.city}</div>}
      {doctor.consultationFee && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}><span>₹{doctor.consultationFee}</span></div>}
    </div>
    {doctor.hospital && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={12} />{doctor.hospital}</div>}
    {doctor.conditions?.length > 0 && (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {doctor.conditions.slice(0, 3).map((c, i) => <span key={i} className="badge badge-info" style={{ fontSize: '0.7rem' }}>{c}</span>)}
      </div>
    )}
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => onBook(doctor)} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg,#0ea5e9,#10b981)', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <Calendar size={14} /> Book Appointment
    </motion.button>
  </motion.div>
);

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('All');
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (spec !== 'All') params.specialization = spec;
      if (minRating > 0) params.minRating = minRating;
      const { data } = await api.get('/doctors', { params });
      if (data.doctors.length === 0) {
        await api.post('/doctors/seed');
        const { data: d2 } = await api.get('/doctors', { params });
        setDoctors(d2.doctors);
      } else { setDoctors(data.doctors); }
    } catch (e) { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  }, [spec, search, minRating]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Find Doctors</h1>
        <p className="page-subtitle">Discover and book appointments with qualified specialists</p>
      </div>
      {/* Search + Filters */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search doctors, hospitals..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} style={{ paddingLeft: 36 }} />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowFilters(f => !f)}
          style={{ padding: '10px 16px', background: showFilters ? 'linear-gradient(135deg,#6366f1,#0ea5e9)' : 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 12, color: showFilters ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} /> Filters
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} onClick={load} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#0ea5e9,#10b981)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Search size={14} /> Search
        </motion.button>
      </div>
      {showFilters && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card" style={{ padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Min Rating:</span>
            {[0, 3, 4, 4.5].map(r => (
              <button key={r} onClick={() => setMinRating(r)}
                style={{
                  padding: '4px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.8rem',
                  background: minRating === r ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'var(--glass-bg)',
                  color: minRating === r ? 'white' : 'var(--text-muted)',
                  border: minRating === r ? '1px solid transparent' : '1px solid var(--glass-border)'
                }}>
                {r === 0 ? 'Any' : `${r}★+`}
              </button>
            ))}
          </div>
        </motion.div>
      )}
      {/* Specialization Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {specializations.map(s => (
          <motion.button key={s} whileHover={{ scale: 1.03 }} onClick={() => setSpec(s)} style={{
            padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap',
            background: spec === s ? 'linear-gradient(135deg,#0ea5e9,#10b981)' : 'var(--glass-bg)',
            color: spec === s ? 'white' : 'var(--text-muted)',
            border: spec === s ? '1px solid transparent' : '1px solid var(--glass-border)'
          }}>
            {s}
          </motion.button>
        ))}
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
          {doctors.length > 0 ? doctors.map(d => <DoctorCard key={d._id} doctor={d} onBook={setBookingDoctor} />) :
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No doctors found. Try a different search.</div>}
        </div>
      )}
      {bookingDoctor && <BookingModal doctor={bookingDoctor} onClose={() => setBookingDoctor(null)} onBook={() => { }} />}
    </div>
  );
};

export default Doctors;
