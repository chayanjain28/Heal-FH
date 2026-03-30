import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, RefreshCw, Lightbulb, X, Upload } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const suggestions = [
  "What should I eat during recovery?",
  "How do I know if my wound is healing properly?",
  "What are signs I should call my doctor?",
  "How much exercise is safe for me?",
  "Can you explain my recovery plan?",
];

const Message = ({ msg }) => {
  const isAI = msg.role === 'assistant';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      style={{ display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: isAI ? 'flex-start' : 'flex-end', marginBottom: 16 }}>
      {isAI && (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bot size={18} color="white" />
        </div>
      )}
      <div style={{
        maxWidth: '75%', padding: '12px 16px', borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        background: isAI ? 'var(--glass-bg-strong)' : 'linear-gradient(135deg,#0ea5e9,#10b981)',
        border: isAI ? '1px solid var(--glass-border)' : 'none',
        color: isAI ? 'var(--text-primary)' : 'white', boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
        <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: 6, textAlign: isAI ? 'left' : 'right' }}>
          {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {!isAI && (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0ea5e9,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={18} color="white" />
        </div>
      )}
    </motion.div>
  );
};

const AIAssistant = () => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Hello! I'm MedAI, your intelligent recovery assistant. 🏥\n\nI'm here to help you with:\n• Recovery tips and guidance\n• Explaining medical terms in simple language\n• Understanding your reports\n• Answering health questions\n\nHow can I help you today?", timestamp: new Date() }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [reportText, setReportText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/ai/chat', { message: msg, conversationHistory: history });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. If this persists, check your GROQ API key configuration.", timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  const analyzeReport = async () => {
    if (!reportText.trim()) return toast.error('Please paste some report text first');
    setAnalyzing(true);
    try {
      const { data } = await api.post('/ai/analyze-report', { reportText, reportType: 'lab' });
      setAnalysis(data.analysis);
      toast.success('Report analyzed successfully!');
    } catch (e) {
      toast.error('Analysis failed. Please try again.');
    } finally { setAnalyzing(false); }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Chat cleared! How can I assist you with your recovery today?", timestamp: new Date() }]);
  };

  return (
    <div style={{ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} color="white" />
            </div>
            MedAI Assistant
          </h1>
          <p className="page-subtitle">Powered by GROQ · 24/7 intelligent recovery support</p>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--glass-bg)', borderRadius: 12, padding: 4, border: '1px solid var(--glass-border)' }}>
          {['chat', 'analyze'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.85rem',
              background: activeTab === tab ? 'linear-gradient(135deg,#6366f1,#0ea5e9)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-muted)'
            }}>
              {tab === 'chat' ? '💬 Chat' : '🔬 Analyze Report'}
            </button>
          ))}
        </div>
      </motion.div>

      {activeTab === 'chat' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          {/* Messages */}
          <div className="glass-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
            {/* Chat header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(14,165,233,0.1))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'alertPulse 2s infinite' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>MedAI is online</span>
              </div>
              <button onClick={clearChat} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                <RefreshCw size={14} /> Clear chat
              </button>
            </div>
            {/* Messages list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {loading && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={18} color="white" />
                  </div>
                  <div style={{ padding: '14px 18px', borderRadius: '4px 16px 16px 16px', background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {[0, 1, 2].map(i => <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Quick suggestions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {suggestions.map((s, i) => (
              <motion.button key={i} whileHover={{ scale: 1.03 }} onClick={() => sendMessage(s)} style={{ padding: '6px 14px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 20, cursor: 'pointer', fontFamily: 'Outfit', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                <Lightbulb size={12} style={{ marginRight: 4, display: 'inline' }} />{s}
              </motion.button>
            ))}
          </div>

          {/* Input */}
          <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask anything about your recovery..." disabled={loading}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'Outfit', fontSize: '0.95rem', color: 'var(--text-primary)' }} />
            {input.trim() && (
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setInput('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => sendMessage()} disabled={loading || !input.trim()}
              style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: !input.trim() ? 0.5 : 1 }}>
              <Send size={18} color="white" />
            </motion.button>
          </div>
        </div>
      ) : (
        /* Report Analyzer Tab */
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, minHeight: 0 }}>
          <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Upload size={18} color="var(--primary)" /> Paste Medical Report Text
            </h3>
            <textarea value={reportText} onChange={e => setReportText(e.target.value)} placeholder="Paste your medical report, lab results, prescription, or discharge summary here..."
              style={{ flex: 1, minHeight: 250, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '14px', fontFamily: 'Outfit', fontSize: '0.88rem', color: 'var(--text-primary)', resize: 'none', outline: 'none', lineHeight: 1.6 }} />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={analyzeReport} disabled={analyzing || !reportText.trim()}
              style={{ marginTop: 14, padding: '12px', background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: analyzing || !reportText.trim() ? 0.7 : 1 }}>
              {analyzing ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analyzing...</> : <><Sparkles size={16} /> Analyze with AI</>}
            </motion.button>
          </div>

          <div className="glass-card" style={{ padding: 24, overflow: 'auto' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--accent)" /> AI Analysis Results
            </h3>
            {!analysis ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', color: 'var(--text-muted)', textAlign: 'center' }}>
                <Sparkles size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                <p style={{ fontSize: '0.9rem' }}>Paste a medical report on the left and click "Analyze with AI" to get structured insights</p>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {analysis.summary && (
                    <div style={{ padding: 16, background: 'rgba(14,165,233,0.08)', borderRadius: 12, border: '1px solid rgba(14,165,233,0.2)', marginBottom: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 6 }}>📋 Summary</div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{analysis.summary}</p>
                    </div>
                  )}
                  {analysis.medications?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 8 }}>💊 Medications</div>
                      {analysis.medications.map((m, i) => (
                        <div key={i} style={{ padding: '10px 14px', background: 'var(--glass-bg)', borderRadius: 10, marginBottom: 6, border: '1px solid var(--glass-border)' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{m.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{[m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ')}</div>
                          {m.instructions && <div style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: 4 }}>ℹ {m.instructions}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  {analysis.restrictions?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 8 }}>🚫 Restrictions</div>
                      {analysis.restrictions.map((r, i) => (
                        <div key={i} style={{ padding: '7px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, marginBottom: 5, fontSize: '0.83rem', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}>⚠ {r}</div>
                      ))}
                    </div>
                  )}
                  {analysis.followUpInstructions?.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 8 }}>📅 Follow-up Instructions</div>
                      {analysis.followUpInstructions.map((f, i) => (
                        <div key={i} style={{ padding: '7px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, marginBottom: 5, fontSize: '0.83rem', color: 'var(--secondary)', border: '1px solid rgba(16,185,129,0.2)' }}>✓ {f}</div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
