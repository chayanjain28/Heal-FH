import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Activity, Pill, Stethoscope, Calendar,
  Bot, FileText, Bell, Building2, ClipboardList, User,
  LogOut, Sun, Moon, Heart, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/health-logs', icon: Activity, label: 'Health Logs' },
  { to: '/medications', icon: Pill, label: 'Medications' },
  { to: '/doctors', icon: Stethoscope, label: 'Find Doctors' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/ai-assistant', icon: Bot, label: 'AI Assistant', highlight: true },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/hospital-records', icon: Building2, label: 'Hospital Records' },
  { to: '/recovery-plan', icon: ClipboardList, label: 'Recovery Plan' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <motion.aside
      animate={{ width: expanded ? 260 : 70 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100,
        background: 'var(--bg-sidebar)', backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--glass-border)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(14,165,233,0.08)'
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(14,165,233,0.4)'
          }}>
            <Heart size={20} color="white" fill="white" />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.1, color: 'var(--text-primary)' }}>Heal From</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.1, background: 'linear-gradient(90deg,#0ea5e9,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Home</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(({ to, icon: Icon, label, highlight }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 3 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 12, transition: 'all 0.2s',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(16,185,129,0.2))'
                    : highlight
                      ? 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(14,165,233,0.1))'
                      : 'transparent',
                  border: isActive
                    ? '1px solid rgba(14,165,233,0.3)'
                    : highlight
                      ? '1px solid rgba(99,102,241,0.2)'
                      : '1px solid transparent',
                  color: isActive ? 'var(--primary)' : highlight ? 'var(--accent)' : 'var(--text-muted)',
                  position: 'relative', whiteSpace: 'nowrap'
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500, flex: 1 }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* ChevronRight shows on hover for active item */}
                <AnimatePresence>
                  {expanded && isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronRight size={14} color="var(--primary)" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
        <AnimatePresence>
          {expanded && user && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '10px 12px', marginBottom: 8, borderRadius: 12, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button whileHover={{ x: 3 }} onClick={toggleTheme} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
          borderRadius: 12, border: '1px solid transparent', background: 'transparent',
          cursor: 'pointer', color: 'var(--text-muted)', marginBottom: 2
        }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <AnimatePresence>
            {expanded && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button whileHover={{ x: 3 }} onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
          borderRadius: 12, border: '1px solid transparent', background: 'transparent',
          cursor: 'pointer', color: 'var(--danger)'
        }}>
          <LogOut size={20} />
          <AnimatePresence>
            {expanded && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
