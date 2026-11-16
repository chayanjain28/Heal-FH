import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Activity, Bot, Stethoscope, Bell,
  FileText, ArrowRight, ChevronRight, Sparkles, CheckCircle2,
  Clock, AlertTriangle, ShieldCheck,
  UserCheck, Compass, HeartPulse, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Calming Therapeutic Ambient Canvas ────────────────────────────────── */
const CalmingBioCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const onResize = () => {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Soothing ambient light orbs in soft sky blue, gentle sage mint, and warm pearl
    const orbs = [
      { x: W * 0.15, y: H * 0.25, r: 280, color: 'rgba(219, 234, 254, 0.65)', vx: 0.15, vy: 0.12 }, // soft blue
      { x: W * 0.85, y: H * 0.35, r: 320, color: 'rgba(209, 250, 229, 0.60)', vx: -0.12, vy: 0.14 }, // soft mint
      { x: W * 0.50, y: H * 0.80, r: 260, color: 'rgba(224, 242, 254, 0.55)', vx: 0.10, vy: -0.10 }, // gentle cyan
      { x: W * 0.70, y: H * 0.75, r: 240, color: 'rgba(254, 243, 199, 0.40)', vx: -0.08, vy: -0.08 }, // warm pearl
    ];

    // Gentle floating restorative particles
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 1.2,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.15,
      hue: Math.random() > 0.5 ? '199, 89%, 48%' : '160, 84%, 39%', // teal vs emerald
    }));

    let animId;
    let t = 0;

    const render = () => {
      t += 0.005;
      ctx.clearRect(0, 0, W, H);

      // Base background: soothing layered therapeutic gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#f8fafc');   // clean soft slate
      bg.addColorStop(0.4, '#f0fdf4'); // hint of restorative meadow
      bg.addColorStop(0.8, '#f0f9ff'); // hint of calming clear sky
      bg.addColorStop(1, '#f8fafc');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Render breathing light orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -100 || orb.x > W + 100) orb.vx *= -1;
        if (orb.y < -100 || orb.y > H + 100) orb.vy *= -1;

        const pulse = Math.sin(t * 1.5) * 20;
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, Math.max(10, orb.r + pulse));
        g.addColorStop(0, orb.color);
        g.addColorStop(0.7, orb.color.replace(/[\d.]+\)$/, '0.15)'));
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, Math.max(10, orb.r + pulse), 0, Math.PI * 2);
        ctx.fill();
      });

      // Render subtle resting heartbeat wave at bottom
      const ekgY = H * 0.96;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)'; // gentle sage
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let px = 0; px < W; px += 3) {
        const nx = (px / W) * 8 - t * 1.5;
        let dy = 0;
        const mod = ((nx % 1) + 1) % 1;
        if (mod < 0.04) dy = -5;
        else if (mod < 0.07) dy = 18;
        else if (mod < 0.10) dy = -12;
        else if (mod < 0.13) dy = 3;
        const wave = Math.sin(nx * Math.PI * 2) * 1.5;
        if (px === 0) ctx.moveTo(px, ekgY + dy + wave);
        else ctx.lineTo(px, ekgY + dy + wave);
      }
      ctx.stroke();

      // Gentle floating restorative particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

/* ─── Interactive Live Recovery Companion Widget (Hero) ──────────────────── */
const LiveRecoveryWidget = () => {
  const [tasks, setTasks] = useState([
    { id: 1, time: '08:00 AM', title: 'Morning Blood Pressure & SpO2', completed: true, detail: '118/76 mmHg · SpO2 98%' },
    { id: 2, time: '12:30 PM', title: 'Take Metoprolol (25mg)', completed: false, detail: '1 tablet with post-lunch meal' },
    { id: 3, time: '03:30 PM', title: 'Guided 15-min Gentle Ambulation', completed: false, detail: 'Pacing goal: 600 steps' },
    { id: 4, time: '07:30 PM', title: 'Evening Pain & Symptom Check', completed: false, detail: 'Log comfort rating (0-10)' },
  ]);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          toast.success(`Milestone completed: "${t.title}"`, { icon: '🌿' });
        }
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const dynamicScore = 78 + Math.round((completedCount / tasks.length) * 16);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      style={{
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 28,
        border: '1px solid rgba(2, 132, 199, 0.16)',
        boxShadow: '0 20px 50px rgba(15, 60, 100, 0.08), 0 4px 12px rgba(16, 185, 129, 0.05)',
        padding: '28px 24px',
        maxWidth: 460,
        width: '100%',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative calm header glow */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, #0284c7, #10b981)',
      }} />

      {/* Patient Profile Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid #f1f5f9', paddingBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, #e0f2fe, #d1fae5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0369a1', fontWeight: 800, fontSize: '1rem',
            border: '1px solid rgba(2, 132, 199, 0.2)',
          }}>
            ER
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>Elena Rostova</h4>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 100, background: '#ecfdf5', color: '#059669', fontWeight: 600 }}>Active Care</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Post-Cardiac Care · Day 4 of 30</div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#f0fdf4', padding: '6px 12px', borderRadius: 100,
          border: '1px solid rgba(16, 185, 129, 0.25)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46' }}>On Track</span>
        </div>
      </div>

      {/* Dynamic Recovery Score Gauge */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)',
        borderRadius: 20, padding: '16px 18px',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        marginBottom: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Recovery Index
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0369a1', lineHeight: 1 }}>{dynamicScore}</span>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, marginTop: 4 }}>
            {dynamicScore >= 85 ? '🌟 Excellent Healing Velocity' : '🌱 Positive Recovery Progress'}
          </div>
        </div>

        {/* Small circular visual indicator */}
        <div style={{ position: 'relative', width: 68, height: 68 }}>
          <svg width="68" height="68" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3.2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="3.2"
              strokeDasharray={`${dynamicScore}, 100`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 800, color: '#0f172a',
          }}>
            {Math.round((completedCount / tasks.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Guided Tasks Checklist (Interactive!) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
            Today's Guided Milestones <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 500 }}>(Interactive — click to complete)</span>
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{completedCount} of {tasks.length} done</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map(task => (
            <motion.div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              whileHover={{ scale: 1.01, backgroundColor: '#f8fafc' }}
              whileTap={{ scale: 0.99 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 14,
                background: task.completed ? 'rgba(240, 253, 244, 0.7)' : 'white',
                border: task.completed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                color: task.completed ? '#10b981' : '#cbd5e1',
                display: 'flex', alignItems: 'center',
              }}>
                <CheckCircle2 size={19} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.83rem', fontWeight: 600,
                  color: task.completed ? '#065f46' : '#1e293b',
                  textDecoration: task.completed ? 'line-through' : 'none',
                }}>
                  {task.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{task.detail}</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{task.time}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reassuring MedAI Clinical Note */}
      <div style={{
        marginTop: 14, padding: '12px 14px', borderRadius: 14,
        background: 'rgba(2, 132, 199, 0.06)',
        border: '1px solid rgba(2, 132, 199, 0.15)',
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <Bot size={17} color="#0284c7" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: '0.77rem', color: '#0369a1', lineHeight: 1.45 }}>
          <strong>MedAI Assistant:</strong> "Elena’s SpO2 (98%) is stable. Great job taking morning meds on schedule! Remember to rest for 30 minutes after your afternoon walk."
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Interactive Care Pathways Explorer ─────────────────────────────────── */
const PathwaysExplorer = () => {
  const [activeTab, setActiveTab] = useState('cardiac');

  const pathways = {
    cardiac: {
      title: 'Cardiovascular & Post-Op Recovery',
      badge: 'Bypass, Stents & Heart Health',
      duration: '4 to 6 Weeks Guided Journey',
      icon: HeartPulse,
      color: '#0284c7',
      bgLight: '#f0f9ff',
      milestones: [
        { day: 'Days 1–3', label: 'Vitals Stabilization', desc: 'Continuous SpO2, heart rate, and blood pressure monitoring. Fluid balance monitoring.' },
        { day: 'Days 4–10', label: 'Gradual Mobility', desc: 'Guided indoor walking milestones (500-1,000 steps/day). Medication titration tracking.' },
        { day: 'Days 11–30', label: 'Cardio-Endurance', desc: 'Heart-rate targeted stamina exercises, dietary sodium limits (<2g/day) guidance.' },
      ],
      aiGuidance: 'MedAI automatically watches for swelling, sudden weight changes (+2 lbs/day), and shortness of breath to alert your cardiologist before complications escalate.',
    },
    ortho: {
      title: 'Orthopedic & Joint Replacement',
      badge: 'Knee, Hip & Spine Surgery',
      duration: '6 to 8 Weeks Guided Journey',
      icon: Activity,
      color: '#059669',
      bgLight: '#ecfdf5',
      milestones: [
        { day: 'Days 1–5', label: 'Swelling & Pain Control', desc: 'Scheduled ice therapy, anti-inflammatory medication adherence, non-weight bearing guidance.' },
        { day: 'Days 6–14', label: 'Joint Flexion & Physical Therapy', desc: 'Daily flexion angle logging, assisted walking, blood clot prevention monitoring.' },
        { day: 'Days 15–45', label: 'Unassisted Ambulation', desc: 'Independent walking drills, stair navigation safely, strength recovery scoring.' },
      ],
      aiGuidance: 'The Complication Predictor flags deep vein thrombosis (DVT) risks or unusual localized warmth/redness, alerting your surgeon instantly.',
    },
    respiratory: {
      title: 'Pulmonary & Respiratory Care',
      badge: 'Pneumonia, COPD & Post-Infection',
      duration: '3 to 5 Weeks Guided Journey',
      icon: Compass,
      color: '#0d9488',
      bgLight: '#f0fdfa',
      milestones: [
        { day: 'Days 1–4', label: 'Oxygen Saturation Watch', desc: 'Strict SpO2 alert threshold (trigger alert if <93%). Incentive spirometer exercises.' },
        { day: 'Days 5–12', label: 'Airway Clearance & Energy', desc: 'Scheduled breathing drills, cough hygiene, fever monitoring (<38.5°C).' },
        { day: 'Days 13–28', label: 'Full Pulmonary Recovery', desc: 'Stair tolerance testing, inhaler technique checks, lung recovery index tracking.' },
      ],
      aiGuidance: 'Instant notification dispatched to caregivers if nocturnal oxygen dips occur or if respiratory rate exceeds 24 breaths/minute.',
    },
    general: {
      title: 'General Post-Surgical & Acute Care',
      badge: 'Abdominal, Minimally Invasive & Wound Care',
      duration: '2 to 4 Weeks Guided Journey',
      icon: Stethoscope,
      color: '#6366f1',
      bgLight: '#eef2ff',
      milestones: [
        { day: 'Days 1–3', label: 'Incision & Infection Watch', desc: 'Daily wound visual checks, temperature logs, hydration and gentle movement.' },
        { day: 'Days 4–7', label: 'Digestive & Pain Regulation', desc: 'Nutrition re-introduction, bowel motility checks, tapering analgesic doses.' },
        { day: 'Days 8–21', label: 'Full Independence', desc: 'Resuming light daily household activities, lifting restrictions adherence.' },
      ],
      aiGuidance: 'Discharge report analyzer breaks down complex post-op precautions into simple daily check-offs for you and your family.',
    },
  };

  const curr = pathways[activeTab];

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      {/* Pathway Switcher Tabs */}
      <div style={{
        display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap',
        marginBottom: 32,
      }}>
        {Object.entries(pathways).map(([key, item]) => {
          const isSelected = activeTab === key;
          const Icon = item.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', borderRadius: 100,
                border: isSelected ? `2px solid ${item.color}` : '1px solid #e2e8f0',
                background: isSelected ? 'white' : 'rgba(255, 255, 255, 0.6)',
                color: isSelected ? item.color : '#475569',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: isSelected ? 700 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: isSelected ? `0 6px 20px rgba(2, 132, 199, 0.12)` : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              <Icon size={16} />
              {item.badge}
            </button>
          );
        })}
      </div>

      {/* Pathway Detailed Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          style={{
            background: 'white',
            borderRadius: 24,
            padding: '36px 32px',
            border: '1px solid rgba(2, 132, 199, 0.12)',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 20 }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: curr.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Guided Pathway Roadmap
              </span>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px' }}>
                {curr.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#64748b', fontSize: '0.86rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color={curr.color} /> {curr.duration}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} color="#10b981" /> Clinically Grounded Protocols
                </span>
              </div>
            </div>
            <div style={{
              background: curr.bgLight, padding: '8px 18px', borderRadius: 100,
              border: `1px solid ${curr.color}30`,
              color: curr.color, fontWeight: 700, fontSize: '0.82rem',
            }}>
              Personalized Plan
            </div>
          </div>

          {/* Stepped Milestones */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginBottom: 24 }}>
            {curr.milestones.map((m, idx) => (
              <div key={idx} style={{
                background: '#f8fafc', borderRadius: 18, padding: '20px 18px',
                border: '1px solid #edf2f7', position: 'relative',
              }}>
                <div style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 100,
                  background: curr.bgLight, color: curr.color, fontWeight: 700,
                  fontSize: '0.72rem', marginBottom: 10,
                }}>
                  {m.day}
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                  {m.label}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>

          {/* AI Clinical Guardrail */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)',
            padding: '16px 20px', borderRadius: 16,
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <Bot size={20} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#065f46', marginBottom: 2 }}>
                AI Proactive Recovery Protection:
              </div>
              <div style={{ fontSize: '0.81rem', color: '#334155', lineHeight: 1.5 }}>
                {curr.aiGuidance}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ─── Interactive AI Report Simplifier Sandbox ───────────────────────────── */
const ReportSimplifierSandbox = () => {
  const [sampleKey, setSampleKey] = useState('cardiac');
  const [analyzing, setAnalyzing] = useState(false);

  const samples = {
    cardiac: {
      label: 'Sample 1: Post-Cardiac Discharge Order',
      raw: 'Pt discharged post-op Day 3. Rx: Metoprolol tartrate 50mg PO BID; Lasix 20mg PO QAM; Eliquis 5mg PO BID x30d. Restrict Na+ < 2000mg/d. Strict fluid restriction 1500mL/d. Return to ED if dyspnea, pedal edema, or SpO2 < 93%. F/U with cardiology in 14d.',
      meds: [
        { icon: '💊', title: 'Heart Rate Pill (Metoprolol)', desc: 'Take 1 tablet twice daily (morning & evening) with meals.' },
        { icon: '💧', title: 'Water Pill (Lasix)', desc: 'Take 1 tablet every morning with breakfast to prevent fluid accumulation.' },
        { icon: '🛡️', title: 'Blood Thinner (Eliquis)', desc: 'Take 1 tablet twice daily with or without food. Do not skip doses.' },
      ],
      diet: 'Limit salt intake to under 1 teaspoon daily. Drink no more than 6 standard cups of liquid daily.',
      warning: 'Call clinic immediately if oxygen drops under 93% or if your feet/ankles swell rapidly.',
    },
    ortho: {
      label: 'Sample 2: Total Knee Replacement Order',
      raw: 'Post-op TKR Day 2. Rx: Enoxaparin 40mg SC daily x14d; Oxycodone 5mg PO Q4-6H PRN severe pain; Celecoxib 100mg PO BID. Non-weight bearing left LE x10d. Cryotherapy 20min QID. Call if calf erythema, fever >38.5C, or calf tenderness.',
      meds: [
        { icon: '💉', title: 'Clot Prevention (Enoxaparin)', desc: '1 injection once daily under skin for 14 days to prevent leg clots.' },
        { icon: '🩹', title: 'Anti-Inflammatory (Celecoxib)', desc: 'Take 1 capsule twice daily with meals to reduce joint swelling.' },
        { icon: '💊', title: 'Pain Relief (Oxycodone)', desc: 'Take only as needed for severe breakthrough pain (max 1 every 4-6 hours).' },
      ],
      diet: 'Apply cold ice pack for 20 minutes, 4 times daily. Keep operated leg elevated while resting.',
      warning: 'Contact clinic immediately if calf turns red/swollen, or if body temperature exceeds 38.5°C.',
    },
  };

  const current = samples[sampleKey];

  const handleSimulate = (key) => {
    setSampleKey(key);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      toast.success('MedAI extracted and simplified the clinical orders!', { icon: '✨' });
    }, 450);
  };

  return (
    <div style={{
      maxWidth: 960, margin: '0 auto',
      background: 'white', borderRadius: 28,
      border: '1px solid rgba(2, 132, 199, 0.15)',
      boxShadow: '0 20px 48px rgba(15, 60, 100, 0.06)',
      padding: '36px 32px',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 100, background: '#e0f2fe',
          color: '#0369a1', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          <Sparkles size={13} /> Interactive Feature Demo
        </span>
        <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
          Translating Confusing Medical Jargon into Plain English
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: 620, margin: '8px auto 0' }}>
          Over 60% of post-discharge complications stem from misunderstanding discharge orders. Click a sample below to see how MedAI transforms complex clinical text:
        </p>

        {/* Sample Selection Pills */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
          {Object.entries(samples).map(([k, s]) => (
            <button
              key={k}
              onClick={() => handleSimulate(k)}
              style={{
                padding: '8px 18px', borderRadius: 100,
                border: sampleKey === k ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: sampleKey === k ? '#f0f9ff' : 'white',
                color: sampleKey === k ? '#0369a1' : '#475569',
                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.82rem',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Left: What the hospital gives you */}
        <div style={{
          background: '#f8fafc', borderRadius: 20, padding: '22px 20px',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <FileText size={17} color="#64748b" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Original Hospital Discharge Order
            </span>
          </div>
          <div style={{
            fontFamily: 'Consolas, monospace', fontSize: '0.8rem',
            color: '#334155', background: 'white', padding: '14px 16px',
            borderRadius: 12, border: '1px solid #e2e8f0', lineHeight: 1.65, minHeight: 180,
          }}>
            "{current.raw}"
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 10, fontStyle: 'italic' }}>
            ⚠️ Latin abbreviations, dose timing, and clinical thresholds confuse most recovering patients.
          </div>
        </div>

        {/* Right: What Heal From Home provides */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)',
          borderRadius: 20, padding: '22px 20px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.08)',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bot size={18} color="#059669" />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>
                MedAI Patient-Friendly Guide
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>
              AI Simplified
            </span>
          </div>

          {analyzing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220, gap: 10 }}>
              <Activity className="animate-spin" size={28} color="#0284c7" />
              <div style={{ fontSize: '0.84rem', color: '#0369a1', fontWeight: 600 }}>MedAI analyzing clinical terms...</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {current.meds.map((m, i) => (
                <div key={i} style={{ background: 'white', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{m.icon} {m.title}</div>
                  <div style={{ fontSize: '0.76rem', color: '#475569' }}>{m.desc}</div>
                </div>
              ))}

              <div style={{ background: 'white', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>🥗 Care & Activity Guidance</div>
                <div style={{ fontSize: '0.76rem', color: '#475569' }}>{current.diet}</div>
              </div>

              <div style={{ background: '#fef2f2', padding: '10px 14px', borderRadius: 12, border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c' }}>🚨 Immediate Alert Warning</div>
                <div style={{ fontSize: '0.76rem', color: '#991b1b' }}>{current.warning}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Calming Main Landing Page Component ────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* ── Calming BioCanvas Ambient Motion ── */}
      <CalmingBioCanvas />

      {/* ── Main Foreground Content ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ━━━━━━━━ TOP NAVIGATION ━━━━━━━━ */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(2, 132, 199, 0.12)',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
        }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            padding: '14px 24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, #0284c7, #10b981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(2, 132, 199, 0.25)',
                color: 'white',
              }}>
                <Heart size={20} fill="white" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.08rem', color: '#0f294a', lineHeight: 1.1 }}>
                  Heal From Home
                </div>
                <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Guided Home Recovery System
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <a href="#how-it-guides" style={{ textDecoration: 'none', color: '#475569', fontSize: '0.88rem', fontWeight: 600 }}>
                Guided Process
              </a>
              <a href="#pathways" style={{ textDecoration: 'none', color: '#475569', fontSize: '0.88rem', fontWeight: 600 }}>
                Care Pathways
              </a>
              <a href="#ai-analyzer" style={{ textDecoration: 'none', color: '#475569', fontSize: '0.88rem', fontWeight: 600 }}>
                Report Simplifier
              </a>
              <a href="#clinical-safety" style={{ textDecoration: 'none', color: '#475569', fontSize: '0.88rem', fontWeight: 600 }}>
                Clinical Safety
              </a>
            </nav>

            {/* Auth Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '9px 20px', borderRadius: 100,
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  color: '#1e293b', fontWeight: 600, fontSize: '0.88rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Sign In
              </button>

              <button
                onClick={() => navigate('/register')}
                style={{
                  padding: '10px 24px', borderRadius: 100,
                  background: 'linear-gradient(135deg, #0284c7 0%, #10b981 100%)',
                  border: 'none', color: 'white', fontWeight: 700, fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(2, 132, 199, 0.28)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(2, 132, 199, 0.38)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(2, 132, 199, 0.28)'; }}
              >
                <span>Start Recovery</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* ━━━━━━━━ HERO SECTION ━━━━━━━━ */}
        <section style={{
          padding: '60px 24px 80px',
          maxWidth: 1200, margin: '0 auto',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 48,
            alignItems: 'center',
          }}>
            {/* Left Column: Reassuring Patient-Centered Message */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 100,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#065f46', fontSize: '0.8rem', fontWeight: 700,
                marginBottom: 20,
              }}>
                <Sparkles size={14} color="#10b981" />
                <span>Intelligent Guided Post-Discharge Care</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
                fontWeight: 900,
                color: '#0f294a',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: 20,
              }}>
                Never Walk Your <br />
                <span style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #10b981 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Recovery Journey Alone.
                </span>
              </h1>

              <p style={{
                fontSize: '1.05rem',
                color: '#475569',
                lineHeight: 1.68,
                marginBottom: 32,
                maxWidth: 540,
              }}>
                Heal From Home replaces confusing paper summaries and stressful guesswork with a comforting, <strong>guided home recovery system</strong>. We track your vitals dynamically, break down medications into simple daily steps, catch complications before they escalate, and keep your loved ones and doctors connected.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 36 }}>
                <button
                  onClick={() => navigate('/register')}
                  style={{
                    padding: '14px 32px', borderRadius: 100,
                    background: 'linear-gradient(135deg, #0284c7, #10b981)',
                    border: 'none', color: 'white', fontWeight: 700, fontSize: '0.98rem',
                    cursor: 'pointer',
                    boxShadow: '0 10px 28px rgba(2, 132, 199, 0.3)',
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <span>Begin Guided Recovery</span>
                  <ArrowRight size={17} />
                </button>

                <a
                  href="#how-it-guides"
                  style={{
                    padding: '14px 28px', borderRadius: 100,
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    color: '#334155', fontWeight: 600, fontSize: '0.95rem',
                    textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <Compass size={17} color="#0284c7" />
                  <span>See How It Guides You</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 24,
                flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', paddingTop: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#475569', fontSize: '0.82rem', fontWeight: 600 }}>
                  <ShieldCheck size={17} color="#10b981" />
                  <span>HIPAA Privacy Aligned</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#475569', fontSize: '0.82rem', fontWeight: 600 }}>
                  <UserCheck size={17} color="#0284c7" />
                  <span>Verified Doctor Oversight</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#475569', fontSize: '0.82rem', fontWeight: 600 }}>
                  <Bell size={17} color="#f59e0b" />
                  <span>Early Complication Alerts</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Recovery Companion Simulator */}
            <div>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Live Patient Experience Preview
                </span>
              </div>
              <LiveRecoveryWidget />
            </div>
          </div>
        </section>

        {/* ━━━━━━━━ STATS: CLINICAL EVIDENCE ━━━━━━━━ */}
        <section style={{
          background: 'white',
          borderTop: '1px solid rgba(2, 132, 199, 0.08)',
          borderBottom: '1px solid rgba(2, 132, 199, 0.08)',
          padding: '40px 24px',
        }}>
          <div style={{
            maxWidth: 1100, margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 32, textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0284c7', lineHeight: 1 }}>0.85 AUC</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 6, fontWeight: 600 }}>
                Readmission Prediction Accuracy (Nature 2023)
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>5-Factor</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 6, fontWeight: 600 }}>
                Continuous Dynamic Recovery Index
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f294a', lineHeight: 1 }}>100%</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 6, fontWeight: 600 }}>
                Deterministic Safety Alert Guardrails
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0d9488', lineHeight: 1 }}>24 / 7</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 6, fontWeight: 600 }}>
                MedAI Patient Companion Guidance
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━ HOW IT GUIDES YOU: 4-STEP RECOVERY JOURNEY ━━━━━━━━ */}
        <section id="how-it-guides" style={{ padding: '90px 24px', maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{
              display: 'inline-block', padding: '5px 16px', borderRadius: 100,
              background: '#e0f2fe', color: '#0369a1',
              fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.06em', marginBottom: 12,
            }}>
              Step-by-Step Patient Support
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.7rem)', fontWeight: 900, color: '#0f294a', marginBottom: 14 }}>
              How Heal From Home Guides You to Full Health
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: 620, margin: '0 auto', lineHeight: 1.6 }}>
              From the minute you step out of the hospital doors until you celebrate your recovery graduation, our system actively supports you every single day.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 22,
          }}>
            {[
              {
                step: '1', title: 'Smart Discharge Onboarding',
                desc: 'Upload or snap a photo of your discharge summary. MedAI decodes complicated prescriptions into clear daily times and creates your tailored recovery plan.',
                icon: FileText, color: '#0284c7', bg: '#f0f9ff',
              },
              {
                step: '2', title: 'Daily Guided Check-Ins',
                desc: 'Quick 1-minute daily logging of vitals (blood pressure, pulse, SpO2), pain scale, and sleep. Visual trend graphs show your healing progress in real time.',
                icon: Activity, color: '#10b981', bg: '#ecfdf5',
              },
              {
                step: '3', title: 'Continuous Complication Guard',
                desc: 'Our deterministic medical rule engine watches for early warning signs (hypoxia, tachycardia, spike in fever). If a parameter drops, smart alerts notify you immediately.',
                icon: ShieldAlert, color: '#f59e0b', bg: '#fffbeb',
              },
              {
                step: '4', title: 'Connected Doctor Care',
                desc: 'Need advice? Chat 24/7 with MedAI for compassionate explanations, or schedule an appointment with verified medical specialists in one click.',
                icon: Stethoscope, color: '#6366f1', bg: '#eef2ff',
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.step} style={{
                  background: 'white', borderRadius: 22, padding: '28px 22px',
                  border: '1px solid rgba(2, 132, 199, 0.1)',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                  position: 'relative',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, background: item.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 18, color: item.color, border: `1px solid ${item.color}30`,
                  }}>
                    <Icon size={22} />
                  </div>
                  <div style={{
                    position: 'absolute', top: 20, right: 20,
                    fontSize: '1.8rem', fontWeight: 900, color: '#f1f5f9',
                    fontFamily: 'Outfit, sans-serif', userSelect: 'none',
                  }}>
                    0{item.step}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f294a', marginBottom: 8 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ━━━━━━━━ CARE PATHWAYS EXPLORER ━━━━━━━━ */}
        <section id="pathways" style={{
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          padding: '80px 24px 90px',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <div style={{ maxWidth: 1140, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <span style={{
                display: 'inline-block', padding: '5px 16px', borderRadius: 100,
                background: '#dcfce7', color: '#15803d',
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: 12,
              }}>
                Targeted Clinical Care
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.7rem)', fontWeight: 900, color: '#0f294a', marginBottom: 12 }}>
                Explore Your Specific Recovery Pathway
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: 580, margin: '0 auto' }}>
                Every surgery and illness requires distinct care. Select your situation to see how the system guides your specific recovery roadmap:
              </p>
            </div>

            <PathwaysExplorer />
          </div>
        </section>

        {/* ━━━━━━━━ AI REPORT SIMPLIFIER DEMO ━━━━━━━━ */}
        <section id="ai-analyzer" style={{ padding: '90px 24px' }}>
          <ReportSimplifierSandbox />
        </section>

        {/* ━━━━━━━━ TRADITIONAL RECOVERY VS HEAL FROM HOME ━━━━━━━━ */}
        <section id="clinical-safety" style={{
          background: 'white', padding: '90px 24px',
          borderTop: '1px solid #e2e8f0',
        }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <span style={{
                display: 'inline-block', padding: '5px 16px', borderRadius: 100,
                background: '#fee2e2', color: '#b91c1c',
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: 12,
              }}>
                The Problem We Solve
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.7rem)', fontWeight: 900, color: '#0f294a', marginBottom: 12 }}>
                Traditional Recovery vs. Heal From Home
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: 620, margin: '0 auto' }}>
                Post-discharge care shouldn't be a solo trial of anxiety. Here is how our guided system changes the outcome:
              </p>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 24,
            }}>
              {/* Traditional Care */}
              <div style={{
                background: '#fff1f2', borderRadius: 24, padding: '32px 28px',
                border: '1px solid #fecdd3',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <AlertTriangle size={24} color="#e11d48" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#9f1239', margin: 0 }}>
                    Traditional Manual Recovery
                  </h3>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    'Discharge instructions given on confusing multi-page paper forms.',
                    'Medications forgotten, misread, or taken at wrong intervals.',
                    'Warning signs like mild fever or dropping SpO2 go unnoticed at home.',
                    'Patients wait until acute emergencies occur before seeking medical help.',
                    'Nearly 1 in 5 patients end up readmitted to the hospital within 30 days.',
                  ].map((text, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.86rem', color: '#881337', lineHeight: 1.5 }}>
                      <span style={{ color: '#e11d48', fontWeight: 800 }}>✕</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Heal From Home */}
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)',
                borderRadius: 24, padding: '32px 28px',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 12px 32px rgba(16, 185, 129, 0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <ShieldCheck size={26} color="#059669" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#065f46', margin: 0 }}>
                    Heal From Home Guided System
                  </h3>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    'AI decodes discharge orders into a plain-English, interactive daily checklist.',
                    'Automated dose tracking with one-click adherence logging and alerts.',
                    'Smart deterministic rules detect vital anomalies immediately.',
                    'Family caregivers receive proactive notifications if thresholds are breached.',
                    'Predictive 0–100 recovery score keeps patients on track for safe healing.',
                  ].map((text, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.86rem', color: '#064e3b', lineHeight: 1.5 }}>
                      <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━ FINAL CALL TO ACTION ━━━━━━━━ */}
        <section style={{
          padding: '90px 24px 110px',
          maxWidth: 900, margin: '0 auto', textAlign: 'center',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #059669 100%)',
            borderRadius: 32, padding: '54px 36px',
            color: 'white',
            boxShadow: '0 24px 60px rgba(2, 132, 199, 0.28)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              width: 58, height: 58, borderRadius: 18,
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Heart size={30} fill="white" />
            </div>

            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, lineHeight: 1.2, marginBottom: 14 }}>
              Take the Anxiety Out of Recovery.
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.9)', maxWidth: 520, margin: '0 auto 34px', lineHeight: 1.6 }}>
              Join recovering patients and caregivers who enjoy clear, guided, step-by-step healing right from the comfort of their home.
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/register')}
                style={{
                  padding: '14px 36px', borderRadius: 100,
                  background: 'white', color: '#0369a1',
                  fontWeight: 800, fontSize: '1rem', border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                <span>Create Your Free Account</span>
                <ChevronRight size={18} />
              </button>

              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '14px 28px', borderRadius: 100,
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: 'white', border: '1px solid rgba(255, 255, 255, 0.35)',
                  fontWeight: 700, fontSize: '0.95rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                }}
              >
                Sign In Instead
              </button>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━ FOOTER ━━━━━━━━ */}
        <footer style={{
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          padding: '28px 24px',
        }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: '0.85rem' }}>
              <Heart size={16} color="#0284c7" />
              <span><strong>Heal From Home</strong> © 2026 · Intelligent Post-Discharge Care Companion</span>
            </div>

            <div style={{ display: 'flex', gap: 20, color: '#64748b', fontSize: '0.82rem' }}>
              <span style={{ cursor: 'pointer' }}>HIPAA Privacy Policy</span>
              <span style={{ cursor: 'pointer' }}>Clinical Disclaimer</span>
              <span style={{ cursor: 'pointer' }}>Caregiver Support</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;
