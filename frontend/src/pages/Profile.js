import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Heart, AlertTriangle, Save, Plus, Trash2, Camera, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Section = ({ title, icon: Icon, color, children }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={18} color={color} />{title}
    </h3>
    {children}
  </motion.div>
);

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    dateOfBirth: '', gender: '', bloodGroup: '', height: '', weight: '',
    allergies: '', chronicConditions: '',
    address: { city: '', state: '', pincode: '' },
    emergencyContacts: [],
  });
  const [userForm, setUserForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '', email: '' });
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/patients/profile');
        const p = data.profile;
        setProfile({
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
          gender: p.gender || '', bloodGroup: p.bloodGroup || '',
          height: p.height || '', weight: p.weight || '',
          allergies: (p.allergies || []).join(', '),
          chronicConditions: (p.chronicConditions || []).join(', '),
          address: p.address || { city: '', state: '', pincode: '' },
          emergencyContacts: p.emergencyContacts || [],
        });
      } catch { toast.error('Failed to load profile'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        ...profile,
        allergies: profile.allergies.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: profile.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
        height: Number(profile.height) || undefined,
        weight: Number(profile.weight) || undefined,
      };
      await Promise.all([
        api.put('/patients/profile', payload),
        api.put('/auth/profile', userForm),
      ]);
      setUser(u => ({ ...u, ...userForm }));
      toast.success('Profile saved successfully! ✅');
    } catch { toast.error('Failed to save profile'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) return toast.error('New passwords do not match');
    if (pwForm.newPw.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw });
      toast.success('Password changed successfully!');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to change password'); }
    finally { setSavingPw(false); }
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) return toast.error('Name and phone are required');
    setProfile(p => ({ ...p, emergencyContacts: [...p.emergencyContacts, { ...newContact }] }));
    setNewContact({ name: '', relationship: '', phone: '', email: '' });
    toast.success('Contact added — click Save Profile to persist');
  };
  const removeContact = (i) => setProfile(p => ({ ...p, emergencyContacts: p.emergencyContacts.filter((_, idx) => idx !== i) }));

  const bmi = profile.height && profile.weight
    ? (Number(profile.weight) / Math.pow(Number(profile.height) / 100, 2)).toFixed(1)
    : null;
  const bmiLabel = bmi ? (bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese') : null;
  const bmiColor = bmi ? (bmi < 18.5 ? '#f59e0b' : bmi < 25 ? '#10b981' : bmi < 30 ? '#f59e0b' : '#ef4444') : null;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  const tabs = ['personal', 'medical', 'emergency', 'security'];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal, medical, and security settings</p>
        </div>
        {activeTab !== 'security' && (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={saveProfile} disabled={saving} className="btn btn-primary">
            {saving ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</>
              : <><Save size={16} /> Save Profile</>}
          </motion.button>
        )}
      </div>

      {/* Profile Hero Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card" style={{ padding: 28, marginBottom: 24, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 90, height: 90, borderRadius: 24,
            background: 'linear-gradient(135deg,#0ea5e9,#10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem', fontWeight: 900, color: 'white',
            boxShadow: '0 8px 24px rgba(14,165,233,0.35)',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div style={{
            position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 8,
            background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Camera size={14} color="var(--primary)" />
          </div>
        </div>

        {/* User info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: 4 }}>{user?.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>
            <Mail size={14} /> {user?.email}
          </div>
          {user?.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>
              <Phone size={14} /> {user?.phone}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            {profile.bloodGroup && <span className="badge badge-danger">🩸 {profile.bloodGroup}</span>}
            {bmi && <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${bmiColor}20`, color: bmiColor, border: `1px solid ${bmiColor}40` }}>BMI {bmi} — {bmiLabel}</span>}
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Height', value: profile.height ? `${profile.height} cm` : '—' },
            { label: 'Weight', value: profile.weight ? `${profile.weight} kg` : '—' },
            { label: 'Blood Group', value: profile.bloodGroup || '—' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--glass-bg)', borderRadius: 14, padding: 5, border: '1px solid var(--glass-border)', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize',
            background: activeTab === t ? 'linear-gradient(135deg,#0ea5e9,#10b981)' : 'transparent',
            color: activeTab === t ? 'white' : 'var(--text-muted)',
          }}>{t === 'emergency' ? '🆘 Emergency' : t === 'security' ? '🔒 Security' : t === 'medical' ? '🏥 Medical' : '👤 Personal'}</button>
        ))}
      </div>

      {/* Personal Tab */}
      {activeTab === 'personal' && (
        <Section title="Personal Information" icon={User} color="#0ea5e9">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0 24px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={userForm.name} onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={13} color="var(--primary)" /> Phone Number</label>
              <input className="form-input" value={userForm.phone} onChange={e => setUserForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input className="form-input" type="date" value={profile.dateOfBirth} onChange={e => setProfile(p => ({ ...p, dateOfBirth: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-input" value={profile.gender} onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input className="form-input" type="number" placeholder="170" min="50" max="250" value={profile.height} onChange={e => setProfile(p => ({ ...p, height: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input className="form-input" type="number" placeholder="70" min="10" max="300" value={profile.weight} onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" placeholder="Mumbai" value={profile.address.city} onChange={e => setProfile(p => ({ ...p, address: { ...p.address, city: e.target.value } }))} />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" placeholder="Maharashtra" value={profile.address.state} onChange={e => setProfile(p => ({ ...p, address: { ...p.address, state: e.target.value } }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input className="form-input" placeholder="400001" value={profile.address.pincode} onChange={e => setProfile(p => ({ ...p, address: { ...p.address, pincode: e.target.value } }))} />
            </div>
          </div>
        </Section>
      )}

      {/* Medical Tab */}
      {activeTab === 'medical' && (
        <Section title="Medical Information" icon={Heart} color="#ef4444">
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                <button key={g} onClick={() => setProfile(p => ({ ...p, bloodGroup: g }))}
                  style={{
                    padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem',
                    background: profile.bloodGroup === g ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'var(--glass-bg)',
                    color: profile.bloodGroup === g ? 'white' : 'var(--text-muted)',
                    border: profile.bloodGroup === g ? '1px solid transparent' : '1px solid var(--glass-border)',
                  }}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Allergies <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span></label>
            <input className="form-input" placeholder="Penicillin, Peanuts, Latex, Shellfish..." value={profile.allergies} onChange={e => setProfile(p => ({ ...p, allergies: e.target.value }))} />
            {profile.allergies && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {profile.allergies.split(',').filter(s => s.trim()).map((a, i) => (
                  <span key={i} className="badge badge-danger">⚠ {a.trim()}</span>
                ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Chronic Conditions <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span></label>
            <input className="form-input" placeholder="Diabetes Type 2, Hypertension, Asthma..." value={profile.chronicConditions} onChange={e => setProfile(p => ({ ...p, chronicConditions: e.target.value }))} />
            {profile.chronicConditions && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {profile.chronicConditions.split(',').filter(s => s.trim()).map((c, i) => (
                  <span key={i} className="badge badge-warning">{c.trim()}</span>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Emergency Contacts Tab */}
      {activeTab === 'emergency' && (
        <Section title="Emergency Contacts" icon={AlertTriangle} color="#f59e0b">
          {profile.emergencyContacts.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              {profile.emergencyContacts.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px', background: 'var(--glass-bg)', borderRadius: 12, marginBottom: 10, border: '1px solid var(--glass-border)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(239,68,68,0.2))', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem' }}>
                    {i === 0 ? '👨‍👩‍👧' : i === 1 ? '👫' : '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                      {c.name} {c.relationship && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.82rem' }}>({c.relationship})</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> {c.phone}</span>
                      {c.email && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11} /> {c.email}</span>}
                    </div>
                  </div>
                  <button onClick={() => removeContact(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <div style={{ padding: '18px', background: 'rgba(245,158,11,0.06)', borderRadius: 14, border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 14 }}>Add New Emergency Contact</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="Contact name" value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Relationship</label>
                <input className="form-input" placeholder="Spouse, Parent, Sibling..." value={newContact.relationship} onChange={e => setNewContact(p => ({ ...p, relationship: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={13} color="var(--warning)" /> Phone *</label>
                <input className="form-input" placeholder="+91 98765 43210" value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={13} color="var(--warning)" /> Email</label>
                <input className="form-input" placeholder="contact@email.com" value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={addContact}
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={15} /> Add Contact
            </motion.button>
          </div>
        </Section>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Section title="Change Password" icon={Lock} color="#6366f1">
          <form onSubmit={changePassword} style={{ maxWidth: 420 }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" placeholder="Enter current password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters" value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" placeholder="Repeat new password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
              {pwForm.confirm && pwForm.newPw && (
                <div style={{ marginTop: 6, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, color: pwForm.newPw === pwForm.confirm ? '#10b981' : '#ef4444' }}>
                  {pwForm.newPw === pwForm.confirm ? <><CheckCircle size={13} /> Passwords match</> : '✗ Passwords do not match'}
                </div>
              )}
            </div>
            <motion.button type="submit" disabled={savingPw} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8, opacity: savingPw ? 0.7 : 1 }}>
              {savingPw ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Changing...</> : <><Lock size={15} /> Change Password</>}
            </motion.button>
          </form>
        </Section>
      )}
    </div>
  );
};

export default Profile;
