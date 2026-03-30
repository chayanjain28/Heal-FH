import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, Check, CheckCheck, Shield } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const severityConfig = {
  low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', icon: '🟢' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', icon: '🟡' },
  high: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', icon: '🔴' },
  critical: { color: '#7f1d1d', bg: 'rgba(127,29,29,0.15)', borderColor: 'rgba(239,68,68,0.5)', icon: '🚨' },
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const { data } = await api.get('/alerts?limit=50');
      setAlerts(data.alerts || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { toast.error('Failed to load alerts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = async (id) => {
    try { await api.put(`/alerts/${id}/read`); load(); } catch { }
  };
  const markAllRead = async () => {
    try { await api.put('/alerts/mark-all-read'); toast.success('All alerts marked as read'); load(); } catch { }
  };
  const resolve = async (id) => {
    try { await api.put(`/alerts/${id}/resolve`); toast.success('Alert resolved'); load(); } catch { }
  };

  const filtered = alerts.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !a.isRead;
    return a.severity === filter;
  });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={28} color="var(--primary)" /> Health Alerts
            {unreadCount > 0 && (
              <span style={{ fontSize: '0.9rem', fontWeight: 700, padding: '2px 10px', borderRadius: 12, background: 'var(--danger)', color: 'white' }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="page-subtitle">Monitor health anomalies and complication warnings</p>
        </div>
        {unreadCount > 0 && (
          <motion.button whileHover={{ scale: 1.02 }} onClick={markAllRead}
            className="btn btn-glass" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCheck size={16} /> Mark All Read
          </motion.button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'unread', 'critical', 'high', 'medium', 'low'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
            fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize',
            background: filter === f ? 'linear-gradient(135deg,#0ea5e9,#10b981)' : 'var(--glass-bg)',
            color: filter === f ? 'white' : 'var(--text-muted)',
            border: filter === f ? '1px solid transparent' : '1px solid var(--glass-border)',
          }}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : filtered.length > 0 ? filtered.map((alert, i) => {
        const conf = severityConfig[alert.severity] || severityConfig.low;
        return (
          <motion.div key={alert._id}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            style={{
              padding: '16px 20px', borderRadius: 14,
              background: conf.bg, border: `1px solid ${conf.borderColor}`,
              marginBottom: 12, display: 'flex', gap: 14, alignItems: 'flex-start',
              opacity: alert.isRead ? 0.75 : 1, position: 'relative'
            }}>
            {/* Pulse dot for unread */}
            {!alert.isRead && (
              <div style={{
                position: 'absolute', top: 16, left: -4, width: 8, height: 8,
                borderRadius: '50%', background: conf.color,
                animation: (alert.severity === 'high' || alert.severity === 'critical') ? 'alertPulse 2s infinite' : 'none'
              }} />
            )}

            {/* AlertTriangle icon — shown for medium/high/critical */}
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              {(alert.severity === 'medium' || alert.severity === 'high' || alert.severity === 'critical') ? (
                <AlertTriangle size={20} color={conf.color} />
              ) : (
                <span style={{ fontSize: '1.2rem' }}>{conf.icon}</span>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{alert.title}</div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: `${conf.color}20`, color: conf.color, textTransform: 'uppercase' }}>{alert.severity}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'var(--glass-bg)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{alert.type}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4, marginBottom: 8, lineHeight: 1.5 }}>{alert.message}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(alert.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                {!alert.isRead && (
                  <button onClick={() => markRead(alert._id)}
                    style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={12} /> Mark Read
                  </button>
                )}
                {!alert.isResolved && (
                  <button onClick={() => resolve(alert._id)}
                    style={{ fontSize: '0.75rem', color: 'var(--secondary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600 }}>
                    Resolve
                  </button>
                )}
                {alert.isResolved && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>✓ Resolved</span>
                )}
              </div>
            </div>
          </motion.div>
        );
      }) : (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Shield size={48} color="#10b981" style={{ marginBottom: 16, opacity: 0.6 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>All Clear!</p>
          <p style={{ fontSize: '0.88rem' }}>No {filter !== 'all' ? filter : ''} alerts. Your health looks good! 🎉</p>
        </div>
      )}
    </div>
  );
};

export default Alerts;
