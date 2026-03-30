import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const pageNames = {
    '/dashboard': 'Dashboard',
    '/health-logs': 'Health Logs',
    '/medications': 'Medications',
    '/doctors': 'Find Doctors',
    '/appointments': 'Appointments',
    '/ai-assistant': 'AI Assistant',
    '/reports': 'Medical Reports',
    '/alerts': 'Health Alerts',
    '/hospital-records': 'Hospital Records',
    '/recovery-plan': 'Recovery Plan',
    '/profile': 'My Profile',
};

const TopBar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [unread, setUnread] = useState(0);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQ, setSearchQ] = useState('');

    useEffect(() => {
        api.get('/alerts?limit=1').then(({ data }) => setUnread(data.unreadCount || 0)).catch(() => { });
    }, [location.pathname]);

    const searchRoutes = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Health Logs', path: '/health-logs' },
        { label: 'Medications', path: '/medications' },
        { label: 'Find Doctors', path: '/doctors' },
        { label: 'Appointments', path: '/appointments' },
        { label: 'AI Assistant', path: '/ai-assistant' },
        { label: 'Medical Reports', path: '/reports' },
        { label: 'Health Alerts', path: '/alerts' },
        { label: 'Hospital Records', path: '/hospital-records' },
        { label: 'Recovery Plan', path: '/recovery-plan' },
        { label: 'My Profile', path: '/profile' },
    ];

    const filtered = searchQ.trim()
        ? searchRoutes.filter(r => r.label.toLowerCase().includes(searchQ.toLowerCase()))
        : [];

    const handleNav = (path) => {
        navigate(path);
        setShowSearch(false);
        setSearchQ('');
    };

    return (
        <>
            <div style={{
                position: 'fixed', top: 0, left: 260, right: 0, height: 64, zIndex: 90,
                background: 'var(--bg-sidebar)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 24px', gap: 16,
                boxShadow: '0 2px 12px rgba(14,165,233,0.06)',
                transition: 'left 0.3s ease',
            }}>
                {/* Page title */}
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {pageNames[location.pathname] || 'Heal From Home'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Search trigger */}
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSearch(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                            borderRadius: 10, cursor: 'pointer', color: 'var(--text-muted)',
                            fontFamily: 'Outfit', fontSize: '0.85rem',
                        }}>
                        <Search size={15} />
                        <span style={{ minWidth: 120 }}>Quick navigate...</span>
                        <span style={{
                            padding: '1px 6px', borderRadius: 5, fontSize: '0.7rem', fontWeight: 700,
                            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)'
                        }}>⌘K</span>
                    </motion.button>

                    {/* Alerts bell */}
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/alerts')}
                        style={{
                            position: 'relative', width: 40, height: 40, borderRadius: 10,
                            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-muted)',
                        }}>
                        <Bell size={18} />
                        {unread > 0 && (
                            <motion.span
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                style={{
                                    position: 'absolute', top: -4, right: -4, width: 18, height: 18,
                                    background: 'var(--danger)', borderRadius: '50%', fontSize: '0.65rem',
                                    fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid var(--bg-primary)',
                                }}>
                                {unread > 9 ? '9+' : unread}
                            </motion.span>
                        )}
                    </motion.button>

                    {/* Avatar */}
                    <motion.div
                        whileHover={{ scale: 1.05 }} onClick={() => navigate('/profile')}
                        style={{
                            width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
                            background: 'linear-gradient(135deg,#0ea5e9,#10b981)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '1rem', color: 'white',
                            boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
                        }}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </motion.div>
                </div>
            </div>

            {/* Command palette / search modal */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => { setShowSearch(false); setSearchQ(''); }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 200,
                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                            paddingTop: 120,
                        }}>
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '100%', maxWidth: 520,
                                background: 'var(--bg-card)', backdropFilter: 'blur(24px)',
                                border: '1px solid var(--glass-border)', borderRadius: 20,
                                boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
                            }}>
                            {/* Search input */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
                                borderBottom: '1px solid var(--glass-border)',
                            }}>
                                <Search size={18} color="var(--primary)" />
                                <input
                                    autoFocus
                                    value={searchQ}
                                    onChange={e => setSearchQ(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Escape') { setShowSearch(false); setSearchQ(''); }
                                        if (e.key === 'Enter' && filtered.length > 0) handleNav(filtered[0].path);
                                    }}
                                    placeholder="Navigate to..."
                                    style={{
                                        flex: 1, background: 'none', border: 'none', outline: 'none',
                                        fontFamily: 'Outfit', fontSize: '1rem', color: 'var(--text-primary)',
                                    }}
                                />
                                <button onClick={() => { setShowSearch(false); setSearchQ(''); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Results */}
                            <div style={{ padding: '8px', maxHeight: 320, overflowY: 'auto' }}>
                                {(searchQ.trim() ? filtered : searchRoutes).map((r, i) => (
                                    <motion.div
                                        key={r.path} whileHover={{ x: 4 }}
                                        onClick={() => handleNav(r.path)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                                            background: location.pathname === r.path ? 'linear-gradient(135deg,rgba(14,165,233,0.15),rgba(16,185,129,0.15))' : 'transparent',
                                            border: location.pathname === r.path ? '1px solid rgba(14,165,233,0.25)' : '1px solid transparent',
                                            color: location.pathname === r.path ? 'var(--primary)' : 'var(--text-primary)',
                                            marginBottom: 2, transition: 'all 0.15s',
                                        }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: location.pathname === r.path ? 700 : 500 }}>{r.label}</span>
                                        {location.pathname === r.path && (
                                            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>Current</span>
                                        )}
                                    </motion.div>
                                ))}
                                {searchQ.trim() && filtered.length === 0 && (
                                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        No pages found for "{searchQ}"
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '10px 20px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 16, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                <span>↵ Navigate</span>
                                <span>Esc Close</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default TopBar;
