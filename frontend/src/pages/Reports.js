import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Sparkles, Trash2, Eye, Calendar, Pill } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportType, setReportType] = useState('lab');
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/reports');
      setReports(data.reports || []);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const analyze = async () => {
    if (!reportText.trim()) return toast.error('Paste report text first');
    setAnalyzing(true);
    try {
      const { data } = await api.post('/ai/analyze-report', { reportText, reportType });
      toast.success('Report analyzed and saved!');
      setShowAnalyzer(false);
      setReportText('');
      load();
      setSelectedReport(data.report);
    } catch { toast.error('Analysis failed. Check GROQ API key.'); }
    finally { setAnalyzing(false); }
  };

  const deleteReport = async (id) => {
    try {
      await api.delete(`/reports/${id}`);
      toast.success('Report deleted');
      if (selectedReport?._id === id) setSelectedReport(null);
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const typeColors = { lab: '#0ea5e9', radiology: '#6366f1', prescription: '#10b981', discharge: '#f59e0b', other: '#94a3b8' };

  return (
    <div style={{ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <h1 className="page-title">Medical Reports</h1>
          <p className="page-subtitle">Upload and AI-analyze your medical reports</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} onClick={() => setShowAnalyzer(true)} className="btn btn-primary">
          <Upload size={16} /> Analyze New Report
        </motion.button>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, minHeight: 0 }}>
        {/* Reports List */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            All Reports ({reports.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><div className="spinner" /></div> :
              reports.length > 0 ? reports.map(r => (
                <motion.div key={r._id} whileHover={{ x: 3 }} onClick={() => setSelectedReport(r)}
                  style={{ padding: '12px 14px', borderRadius: 12, cursor: 'pointer', marginBottom: 4, background: selectedReport?._id === r._id ? 'linear-gradient(135deg,rgba(14,165,233,0.15),rgba(16,185,129,0.15))' : 'transparent', border: selectedReport?._id === r._id ? '1px solid rgba(14,165,233,0.3)' : '1px solid transparent', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, minWidth: 0 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${typeColors[r.reportType] || '#94a3b8'}20`, border: `1px solid ${typeColors[r.reportType] || '#94a3b8'}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={14} color={typeColors[r.reportType] || '#94a3b8'} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.originalName || r.filename}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: 6, marginTop: 2 }}>
                          <span style={{ textTransform: 'capitalize' }}>{r.reportType}</span>
                          <span>·</span>
                          <span>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteReport(r._id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, flexShrink: 0 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                  <FileText size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                  <p style={{ fontSize: '0.85rem' }}>No reports yet</p>
                  <button onClick={() => setShowAnalyzer(true)} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.82rem' }}>Upload your first report →</button>
                </div>
              )}
          </div>
        </div>

        {/* Report Detail / Analysis */}
        <div className="glass-card" style={{ padding: 24, overflow: 'auto' }}>
          {selectedReport ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 4 }}>{selectedReport.originalName || 'Report Analysis'}</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{selectedReport.reportType}</span>
                    {selectedReport.isAnalyzed && <span className="badge badge-success"><Sparkles size={10} /> AI Analyzed</span>}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(selectedReport.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              {selectedReport.analysis?.summary && (
                <div style={{ padding: 16, background: 'rgba(14,165,233,0.08)', borderRadius: 14, border: '1px solid rgba(14,165,233,0.2)', marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={14} /> AI Summary</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>{selectedReport.analysis.summary}</p>
                </div>
              )}

              {selectedReport.analysis?.medications?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Pill size={15} color="#10b981" /> Medications</h4>
                  {selectedReport.analysis.medications.map((m, i) => (
                    <div key={i} style={{ padding: '12px 16px', background: 'var(--glass-bg)', borderRadius: 10, marginBottom: 8, border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{m.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{[m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ')}</div>
                      {m.instructions && <div style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: 4 }}>ℹ {m.instructions}</div>}
                    </div>
                  ))}
                </div>
              )}

              {selectedReport.analysis?.restrictions?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 10 }}>🚫 Restrictions</h4>
                  {selectedReport.analysis.restrictions.map((r, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.07)', borderRadius: 8, marginBottom: 6, fontSize: '0.85rem', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)' }}>⚠ {r}</div>
                  ))}
                </div>
              )}

              {selectedReport.analysis?.followUpInstructions?.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={15} color="#f59e0b" /> Follow-up Instructions</h4>
                  {selectedReport.analysis.followUpInstructions.map((f, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'rgba(16,185,129,0.07)', borderRadius: 8, marginBottom: 6, fontSize: '0.85rem', color: 'var(--secondary)', border: '1px solid rgba(16,185,129,0.15)' }}>✓ {f}</div>
                  ))}
                </div>
              )}

              {selectedReport.analysis?.labValues?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 10 }}>🔬 Lab Values</h4>
                  <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--glass-bg)' }}>
                          {['Test', 'Value', 'Normal Range', 'Status'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.analysis.labValues.map((l, i) => {
                          const stColor = l.status === 'normal' ? '#10b981' : l.status === 'critical' ? '#ef4444' : '#f59e0b';
                          return (
                            <tr key={i} style={{ borderTop: '1px solid var(--glass-border)' }}>
                              <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{l.test}</td>
                              <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{l.value} {l.unit}</td>
                              <td style={{ padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{l.normalRange || '—'}</td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${stColor}20`, color: stColor, textTransform: 'capitalize' }}>{l.status}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center' }}>
              <Eye size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Select a Report</p>
              <p style={{ fontSize: '0.85rem' }}>Choose a report from the list to view AI analysis, or upload a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* Analyze Modal */}
      {showAnalyzer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: 24 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ width: '100%', maxWidth: 600, background: 'var(--bg-card)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Upload size={20} color="var(--primary)" /> Analyze Medical Report
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 24 }}>Powered by GROQ AI — extracts medications, restrictions, lab values, and follow-up instructions</p>
            <div className="form-group">
              <label className="form-label">Report Type</label>
              <select className="form-input" value={reportType} onChange={e => setReportType(e.target.value)}>
                {['lab', 'radiology', 'prescription', 'discharge', 'other'].map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)} Report</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Paste Report Text</label>
              <textarea value={reportText} onChange={e => setReportText(e.target.value)} placeholder="Paste your medical report text here — lab results, prescriptions, discharge summaries, radiology reports..." rows={10}
                style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 14, fontFamily: 'Outfit', fontSize: '0.88rem', color: 'var(--text-primary)', resize: 'vertical', outline: 'none', lineHeight: 1.6 }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowAnalyzer(false)} style={{ flex: 1, padding: '11px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, color: 'var(--text-muted)' }}>Cancel</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={analyze} disabled={analyzing || !reportText.trim()}
                style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: analyzing || !reportText.trim() ? 0.7 : 1 }}>
                {analyzing ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analyzing with AI...</> : <><Sparkles size={16} /> Analyze Report</>}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Reports;
