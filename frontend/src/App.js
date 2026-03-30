import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HealthLogs from './pages/HealthLogs';
import Medications from './pages/Medications';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import AIAssistant from './pages/AIAssistant';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Alerts from './pages/Alerts';
import HospitalRecords from './pages/HospitalRecords';
import RecoveryPlan from './pages/RecoveryPlan';
import AppLayout from './components/common/AppLayout';
import LoadingScreen from './components/common/LoadingScreen';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
    <Route path="/health-logs" element={<ProtectedRoute><AppLayout><HealthLogs /></AppLayout></ProtectedRoute>} />
    <Route path="/medications" element={<ProtectedRoute><AppLayout><Medications /></AppLayout></ProtectedRoute>} />
    <Route path="/doctors" element={<ProtectedRoute><AppLayout><Doctors /></AppLayout></ProtectedRoute>} />
    <Route path="/appointments" element={<ProtectedRoute><AppLayout><Appointments /></AppLayout></ProtectedRoute>} />
    <Route path="/ai-assistant" element={<ProtectedRoute><AppLayout><AIAssistant /></AppLayout></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
    <Route path="/alerts" element={<ProtectedRoute><AppLayout><Alerts /></AppLayout></ProtectedRoute>} />
    <Route path="/hospital-records" element={<ProtectedRoute><AppLayout><HospitalRecords /></AppLayout></ProtectedRoute>} />
    <Route path="/recovery-plan" element={<ProtectedRoute><AppLayout><RecoveryPlan /></AppLayout></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)', borderRadius: '12px', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem' }, success: { iconTheme: { primary: '#10b981', secondary: 'white' } }, error: { iconTheme: { primary: '#ef4444', secondary: 'white' } } }} />
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
