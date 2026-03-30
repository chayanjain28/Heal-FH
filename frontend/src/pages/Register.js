import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'patient' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created! Welcome to Heal From Home 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inp = (field, icon, type, placeholder) => (
    <div className="form-group">
      <label className="form-label" style={{ textTransform: 'capitalize' }}>{field.replace(/([A-Z])/g, ' $1')}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</div>
        {field === 'password' ? (
          <>
            <input className="form-input" type={showPass ? 'text' : 'password'} placeholder={placeholder} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} required style={{ paddingLeft: 40, paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </>
        ) : (
          <input className="form-input" type={type} placeholder={placeholder} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} required={field !== 'phone'} style={{ paddingLeft: 40 }} />
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(14,165,233,0.08)', filter: 'blur(80px)', top: -100, right: -100 }} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: 440, background: 'var(--bg-card)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: 40, boxShadow: 'var(--shadow-lg)', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#0ea5e9,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(14,165,233,0.4)' }}>
              <Heart size={28} color="white" fill="white" />
            </div>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Join your intelligent care companion</p>
        </div>
        <form onSubmit={handleSubmit}>
          {inp('name', <User size={16} />, 'text', 'Your full name')}
          {inp('email', <Mail size={16} />, 'email', 'your@email.com')}
          {inp('phone', <Phone size={16} />, 'tel', '+91 98765 43210')}
          {inp('password', <Lock size={16} />, 'password', 'Min. 6 characters')}
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select className="form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option value="patient">Patient</option>
              <option value="caregiver">Caregiver</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#0ea5e9,#10b981)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</> : <>Create Account <ArrowRight size={16} /></>}
          </motion.button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
