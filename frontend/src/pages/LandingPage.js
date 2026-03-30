import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Activity, Bot, Shield, Stethoscope, Bell,
  FileText, ArrowRight, ChevronRight, Sparkles, Zap, Star
} from 'lucide-react';

/* ─── Canvas Background ─────────────────────────────────────────────────── */
const BioCanvas = () => {
  const ref = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    /* ── Particles ── */
    const PARTICLE_COUNT = 80;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
      hue: Math.random() > 0.5 ? 190 : 160, // cyan vs teal
      pulse: Math.random() * Math.PI * 2,
    }));

    /* ── DNA Helix strands ── */
    const HELIXES = [
      { x: W * 0.08, color1: [0, 200, 255], color2: [0, 255, 180] },
      { x: W * 0.92, color1: [0, 255, 200], color2: [120, 80, 255] },
    ];

    /* ── Orbs ── */
    const orbs = [
      { x: W * 0.15, y: H * 0.3, r: 200, hue: 195, speed: 0.0008 },
      { x: W * 0.80, y: H * 0.6, r: 260, hue: 160, speed: 0.0006 },
      { x: W * 0.50, y: H * 0.85, r: 180, hue: 210, speed: 0.001 },
    ];
    const orbOffsets = orbs.map(() => Math.random() * Math.PI * 2);

    /* ── Neural network nodes ── */
    const NODES = 28;
    const nodes = Array.from({ length: NODES }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));

    let t = 0;

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, W, H);

      /* background */
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#020a14');
      bg.addColorStop(0.4, '#030d1a');
      bg.addColorStop(1, '#020810');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      /* ── Animated orbs ── */
      orbs.forEach((orb, i) => {
        const ox = orb.x + Math.sin(t * orb.speed * 1000 + orbOffsets[i]) * 60;
        const oy = orb.y + Math.cos(t * orb.speed * 800 + orbOffsets[i]) * 40;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
        g.addColorStop(0, `hsla(${orb.hue},100%,55%,0.12)`);
        g.addColorStop(0.5, `hsla(${orb.hue},90%,45%,0.06)`);
        g.addColorStop(1, `hsla(${orb.hue},80%,35%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ox, oy, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      /* ── Neural network ── */
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      for (let i = 0; i < NODES; i++) {
        for (let j = i + 1; j < NODES; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.18;
            ctx.strokeStyle = `rgba(0,210,220,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,230,220,0.35)';
        ctx.fill();
      });

      /* ── DNA Helixes ── */
      HELIXES.forEach(({ x, color1, color2 }) => {
        const PAIRS = 36;
        const AMPLITUDE = 38;
        const SPACING = H / PAIRS;
        for (let i = 0; i < PAIRS; i++) {
          const progress = i / PAIRS;
          const y = i * SPACING - (t * 30 % (SPACING));
          const phase = progress * Math.PI * 6 + t;
          const x1 = x + Math.sin(phase) * AMPLITUDE;
          const x2 = x + Math.sin(phase + Math.PI) * AMPLITUDE;
          const alpha = 0.55 + Math.sin(phase * 2) * 0.25;

          // strand 1 dot
          const g1 = ctx.createRadialGradient(x1, y, 0, x1, y, 5);
          g1.addColorStop(0, `rgba(${color1},${alpha})`);
          g1.addColorStop(1, `rgba(${color1},0)`);
          ctx.fillStyle = g1;
          ctx.beginPath(); ctx.arc(x1, y, 5, 0, Math.PI * 2); ctx.fill();

          // strand 2 dot
          const g2 = ctx.createRadialGradient(x2, y, 0, x2, y, 5);
          g2.addColorStop(0, `rgba(${color2},${alpha})`);
          g2.addColorStop(1, `rgba(${color2},0)`);
          ctx.fillStyle = g2;
          ctx.beginPath(); ctx.arc(x2, y, 5, 0, Math.PI * 2); ctx.fill();

          // rung (base pair bridge)
          if (i % 3 === 0) {
            const rungAlpha = alpha * 0.4;
            const rg = ctx.createLinearGradient(x1, y, x2, y);
            rg.addColorStop(0, `rgba(${color1},${rungAlpha})`);
            rg.addColorStop(1, `rgba(${color2},${rungAlpha})`);
            ctx.strokeStyle = rg;
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
          }

          // spine curve
          if (i > 0) {
            const py = (i - 1) * SPACING - (t * 30 % SPACING);
            const px1 = x + Math.sin(progress * Math.PI * 6 + t - (Math.PI * 6 / PAIRS)) * AMPLITUDE;
            const px2 = x + Math.sin(progress * Math.PI * 6 + t - (Math.PI * 6 / PAIRS) + Math.PI) * AMPLITUDE;
            ctx.strokeStyle = `rgba(${color1},${alpha * 0.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(px1, py); ctx.lineTo(x1, y); ctx.stroke();
            ctx.strokeStyle = `rgba(${color2},${alpha * 0.5})`;
            ctx.beginPath(); ctx.moveTo(px2, py); ctx.lineTo(x2, y); ctx.stroke();
          }
        }
      });

      /* ── EKG pulse line ── */
      const ekgY = H * 0.94;
      ctx.strokeStyle = 'rgba(0,255,160,0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let px = 0; px < W; px += 2) {
        const nx = (px / W) * 10 - t * 2;
        let dy = 0;
        const mod = ((nx % 1) + 1) % 1;
        if (mod < 0.05) dy = -8;
        else if (mod < 0.08) dy = 28;
        else if (mod < 0.12) dy = -18;
        else if (mod < 0.16) dy = 4;
        const wave = Math.sin(nx * Math.PI * 2) * 2;
        if (px === 0) ctx.moveTo(px, ekgY + dy + wave);
        else ctx.lineTo(px, ekgY + dy + wave);
      }
      ctx.stroke();

      /* ── Floating particles ── */
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.pulse += 0.03;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
        const a = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3);
        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        pg.addColorStop(0, `hsla(${p.hue},100%,70%,${a})`);
        pg.addColorStop(1, `hsla(${p.hue},100%,70%,0)`);
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas ref={ref} style={{
      position: 'fixed', inset: 0, width: '100%', height: '100%',
      zIndex: 0, display: 'block',
    }} />
  );
};

/* ─── Liquid Glass Button ────────────────────────────────────────────────── */
const GlassButton = ({ children, onClick, primary, large, icon: Icon }) => {
  const [ripples, setRipples] = useState([]);
  const [hovered, setHovered] = useState(false);

  const addRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { x, y, id }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 800);
  }, []);

  return (
    <motion.button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { addRipple(e); onClick && onClick(e); }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: large ? '16px 36px' : '12px 28px',
        borderRadius: 100,
        fontFamily: "'Clash Display', 'Outfit', sans-serif",
        fontWeight: 700,
        fontSize: large ? '1.05rem' : '0.95rem',
        cursor: 'pointer',
        border: 'none',
        color: 'white',
        background: primary
          ? 'linear-gradient(135deg, rgba(0,210,255,0.9) 0%, rgba(0,255,180,0.85) 100%)'
          : 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: hovered
          ? primary
            ? '0 0 40px rgba(0,210,255,0.55), 0 0 80px rgba(0,255,180,0.25), inset 0 1px 0 rgba(255,255,255,0.3)'
            : '0 0 30px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.2)'
          : primary
            ? '0 0 20px rgba(0,210,255,0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
            : 'inset 0 1px 0 rgba(255,255,255,0.1)',
        outline: primary ? 'none' : '1px solid rgba(255,255,255,0.15)',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Glass sheen layer */}
      <span style={{
        position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
        transform: hovered ? 'translateX(300%)' : 'translateX(0)',
        transition: 'transform 0.6s ease',
        pointerEvents: 'none',
      }} />

      {/* Top gloss */}
      <span style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '40%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
        borderRadius: '0 0 100% 100%',
        pointerEvents: 'none',
      }} />

      {/* Ripples */}
      {ripples.map(rp => (
        <motion.span key={rp.id}
          initial={{ width: 0, height: 0, opacity: 0.5, x: rp.x, y: rp.y, translateX: '-50%', translateY: '-50%' }}
          animate={{ width: 300, height: 300, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute', borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            pointerEvents: 'none', zIndex: 0,
          }}
        />
      ))}

      {Icon && <Icon size={large ? 20 : 17} style={{ position: 'relative', zIndex: 1 }} />}
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </motion.button>
  );
};

/* ─── Feature Card ───────────────────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, color, delay }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '28px 24px', borderRadius: 24,
        background: hovered
          ? `linear-gradient(135deg, rgba(${color},0.18) 0%, rgba(${color},0.08) 100%)`
          : 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid rgba(${color},${hovered ? 0.4 : 0.12})`,
        boxShadow: hovered ? `0 12px 48px rgba(${color},0.2), inset 0 1px 0 rgba(255,255,255,0.08)` : 'inset 0 1px 0 rgba(255,255,255,0.05)',
        cursor: 'default',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        position: 'relative', overflow: 'hidden',
      }}>
      {/* Top glass gloss */}
      <div style={{
        position: 'absolute', top: 0, left: '5%', right: '5%', height: 1,
        background: `linear-gradient(90deg, transparent, rgba(${color},0.5), transparent)`,
        opacity: hovered ? 1 : 0.3, transition: 'opacity 0.4s',
      }} />

      <div style={{
        width: 52, height: 52, borderRadius: 16, marginBottom: 18,
        background: `rgba(${color},0.15)`,
        border: `1px solid rgba(${color},0.3)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: hovered ? `0 0 20px rgba(${color},0.4)` : 'none',
        transition: 'box-shadow 0.4s',
      }}>
        <Icon size={22} color={`rgb(${color})`} />
      </div>

      <h3 style={{
        fontFamily: "'Outfit', sans-serif", fontWeight: 700,
        fontSize: '1rem', color: 'rgba(255,255,255,0.95)',
        marginBottom: 10, lineHeight: 1.3,
      }}>{title}</h3>
      <p style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)',
        lineHeight: 1.65,
      }}>{desc}</p>
    </motion.div>
  );
};

/* ─── Stat Counter ───────────────────────────────────────────────────────── */
const StatItem = ({ value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    style={{ textAlign: 'center' }}>
    <div style={{
      fontFamily: "'Outfit', sans-serif", fontWeight: 900,
      fontSize: 'clamp(2rem, 4vw, 2.8rem)',
      background: 'linear-gradient(135deg, #00d4ff, #00ffb4)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      lineHeight: 1,
    }}>{value}</div>
    <div style={{
      fontFamily: "'Outfit', sans-serif",
      fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)',
      marginTop: 6, letterSpacing: '0.05em', textTransform: 'uppercase',
    }}>{label}</div>
  </motion.div>
);

/* ─── Floating Badge ─────────────────────────────────────────────────────── */
const FloatingBadge = ({ children, style }) => (
  <motion.div
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '8px 16px', borderRadius: 100,
      background: 'rgba(0,210,255,0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(0,210,255,0.25)',
      fontSize: '0.8rem', fontWeight: 600, color: '#00d4ff',
      fontFamily: "'Outfit', sans-serif",
      boxShadow: '0 0 20px rgba(0,210,255,0.15)',
      ...style,
    }}>
    {children}
  </motion.div>
);

/* ─── Main Landing Page ──────────────────────────────────────────────────── */
const features = [
  { icon: Activity, title: 'Real-Time Vital Monitoring', desc: 'AI watches your heart rate, blood pressure, oxygen levels — and alerts you the moment something looks off.', color: '0,210,255', delay: 0 },
  { icon: Bot, title: 'MedAI Care Assistant', desc: '24/7 intelligent companion powered by GROQ. Ask anything about your recovery in plain language.', color: '120,80,255', delay: 0.08 },
  { icon: Shield, title: 'Complication Predictor', desc: 'Machine learning scans your health patterns to catch risks before they become emergencies.', color: '0,255,180', delay: 0.16 },
  { icon: Stethoscope, title: 'Smart Doctor Network', desc: 'Discover specialists, book appointments, track follow-ups — all in one seamless flow.', color: '255,180,0', delay: 0.24 },
  { icon: Bell, title: 'Emergency Alert System', desc: 'Severity-graded alerts delivered instantly to you and your caregivers. Silence is never golden.', color: '255,80,80', delay: 0.32 },
  { icon: FileText, title: 'AI Report Analyzer', desc: 'Drop in any discharge summary or lab report. GROQ extracts medications, restrictions, follow-ups — instantly.', color: '0,200,255', delay: 0.40 },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#020a14',
      color: 'white',
      fontFamily: "'Outfit', sans-serif",
      overflowX: 'hidden',
      position: 'relative',
    }}>
      {/* ── Animated Canvas Background ── */}
      <BioCanvas />

      {/* ── Noise texture overlay ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '256px',
        opacity: 0.6,
      }} />

      {/* ── Everything above the canvas ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ━━━━━━━━ NAVBAR ━━━━━━━━ */}
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            padding: '14px 48px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(2,10,20,0.7)',
            backdropFilter: 'blur(24px) saturate(200%)',
            WebkitBackdropFilter: 'blur(24px) saturate(200%)',
            borderBottom: '1px solid rgba(0,210,255,0.08)',
            boxShadow: '0 1px 40px rgba(0,0,0,0.4)',
          }}>
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.03 }} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'linear-gradient(135deg, rgba(0,210,255,0.9), rgba(0,255,180,0.85))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0,210,255,0.45)',
            }}>
              <Heart size={18} color="white" fill="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', lineHeight: 1.1, background: 'linear-gradient(90deg,#00d4ff,#00ffb4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Heal From Home
              </div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Intelligent Recovery</div>
            </div>
          </motion.div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {['Features', 'How it Works', 'About'].map(link => (
              <button key={link} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif',
                fontWeight: 500, fontSize: '0.88rem', padding: '6px 14px', borderRadius: 8,
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => { e.target.style.color = 'rgba(255,255,255,0.9)'; }}
                onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.5)'; }}>
                {link}
              </button>
            ))}
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            <button onClick={() => navigate('/login')} style={{
              padding: '8px 20px', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100,
              color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
              fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.88rem',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}>
              Sign In
            </button>
            <GlassButton onClick={() => navigate('/register')} primary>
              Get Started
            </GlassButton>
          </div>
        </motion.nav>

        {/* ━━━━━━━━ HERO ━━━━━━━━ */}
        <section ref={heroRef} style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '100px 24px 60px',
          position: 'relative',
        }}>
          <motion.div style={{ opacity: heroOpacity, y: heroY, textAlign: 'center', maxWidth: 800, position: 'relative' }}>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ marginBottom: 32 }}>
              <FloatingBadge>
                <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Sparkles size={13} />
                </motion.span>
                AI-Powered Post-Discharge Care · GROQ LLM
              </FloatingBadge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
                fontWeight: 900, lineHeight: 1.05,
                letterSpacing: '-0.03em', marginBottom: 28,
              }}>
              <span style={{ color: 'rgba(255,255,255,0.95)' }}>Heal Smarter,</span>
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #00ffb4 45%, #7850ff 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 4s ease infinite',
              }}>
                Recover Faster
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                color: 'rgba(255,255,255,0.52)',
                lineHeight: 1.7, marginBottom: 44,
                maxWidth: 600, margin: '0 auto 44px',
              }}>
              Hospital-to-home continuity of care with AI vitals monitoring,
              complication prediction, smart doctor connectivity, and 24/7 intelligent support.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
              <GlassButton primary large onClick={() => navigate('/register')} icon={ArrowRight}>
                Begin Your Recovery
              </GlassButton>
              <GlassButton large onClick={() => navigate('/login')}>
                Sign In
              </GlassButton>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { icon: Star, text: '4.9/5 Patient Rating' },
                { icon: Zap, text: 'Real-time Monitoring' },
                { icon: Shield, text: 'HIPAA Compliant' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
                  <Icon size={13} color="rgba(0,210,255,0.6)" />
                  {text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            animate={{ y: [0, 10, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
            <div style={{ width: 1, height: 48, background: 'linear-gradient(180deg, rgba(0,210,255,0) 0%, rgba(0,210,255,0.5) 100%)' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00d4ff' }} />
          </motion.div>
        </section>

        {/* ━━━━━━━━ STATS ━━━━━━━━ */}
        <section style={{ padding: '60px 48px' }}>
          <div style={{
            maxWidth: 900, margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32,
            padding: '40px 48px', borderRadius: 28,
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            <StatItem value="98%" label="Patient Satisfaction" delay={0} />
            <StatItem value="24/7" label="AI Monitoring" delay={0.1} />
            <StatItem value="500+" label="Doctors Available" delay={0.2} />
            <StatItem value="10k+" label="Patients Helped" delay={0.3} />
          </div>
        </section>

        {/* ━━━━━━━━ FEATURES ━━━━━━━━ */}
        <section style={{ padding: '80px 48px 100px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{ textAlign: 'center', marginBottom: 64 }}>

              <div style={{
                display: 'inline-block', padding: '5px 16px', borderRadius: 100,
                background: 'rgba(0,255,180,0.08)', border: '1px solid rgba(0,255,180,0.2)',
                fontSize: '0.75rem', fontWeight: 700, color: '#00ffb4',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20,
              }}>
                Everything You Need
              </div>

              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900,
                letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 16,
              }}>
                Recover Safely at{' '}
                <span style={{ background: 'linear-gradient(135deg,#00d4ff,#00ffb4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Home
                </span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.02rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
                A complete intelligent care system designed by healthcare experts for seamless post-discharge recovery.
              </p>
            </motion.div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 20,
            }}>
              {features.map(f => <FeatureCard key={f.title} {...f} />)}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━ HOW IT WORKS ━━━━━━━━ */}
        <section style={{ padding: '80px 48px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 14 }}>
                From Hospital to{' '}
                <span style={{ background: 'linear-gradient(135deg,#00d4ff,#7850ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Home</span>
                {' '}in 3 Steps
              </h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {[
                { step: '01', title: 'Create Your Profile', desc: 'Enter your discharge details, medications, and medical history. Our AI builds your personalised recovery plan instantly.', color: '0,210,255' },
                { step: '02', title: 'Track Daily', desc: 'Log vitals, symptoms, and medications. MedAI analyses your data in real-time and surfaces insights that matter.', color: '0,255,180' },
                { step: '03', title: 'Stay Connected', desc: 'Get alerts, connect with doctors, and let your caregivers stay in the loop — all from one intelligent dashboard.', color: '120,80,255' },
              ].map(({ step, title, desc, color }, i) => (
                <motion.div key={step}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    padding: '32px 28px', borderRadius: 24,
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(16px)',
                    border: `1px solid rgba(${color},0.15)`,
                    position: 'relative', overflow: 'hidden',
                  }}>
                  <div style={{
                    position: 'absolute', top: -20, right: -10,
                    fontWeight: 900, fontSize: '5rem', lineHeight: 1,
                    color: `rgba(${color},0.06)`,
                    fontFamily: 'Outfit, sans-serif',
                    userSelect: 'none',
                  }}>{step}</div>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, marginBottom: 18,
                    background: `rgba(${color},0.15)`, border: `1px solid rgba(${color},0.3)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 800, color: `rgb(${color})`,
                  }}>{step}</div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.9)', marginBottom: 10 }}>{title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━ CTA SECTION ━━━━━━━━ */}
        <section style={{ padding: '80px 48px 120px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              maxWidth: 760, margin: '0 auto', textAlign: 'center',
              padding: '64px 48px', borderRadius: 32,
              background: 'linear-gradient(135deg, rgba(0,210,255,0.08) 0%, rgba(0,255,180,0.06) 50%, rgba(120,80,255,0.08) 100%)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(0,210,255,0.15)',
              boxShadow: '0 0 80px rgba(0,210,255,0.08), 0 0 160px rgba(0,255,180,0.05), inset 0 1px 0 rgba(255,255,255,0.07)',
              position: 'relative', overflow: 'hidden',
            }}>
            {/* Corner glow */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,210,255,0.15), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,180,0.12), transparent 70%)', pointerEvents: 'none' }} />

            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} style={{ marginBottom: 20 }}>
              <Heart size={52} color="#00d4ff" fill="rgba(0,210,255,0.3)" />
            </motion.div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 16 }}>
              Your Recovery Starts Today
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 40, fontSize: '1.02rem', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 40px' }}>
              Join thousands of patients recovering safely at home with continuous AI-powered support and monitoring.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <GlassButton primary large onClick={() => navigate('/register')} icon={ChevronRight}>
                Create Free Account
              </GlassButton>
              <GlassButton large onClick={() => navigate('/login')}>
                Sign In Instead
              </GlassButton>
            </div>
          </motion.div>
        </section>

        {/* ━━━━━━━━ FOOTER ━━━━━━━━ */}
        <footer style={{
          padding: '24px 48px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
            <Heart size={13} color="#00d4ff" />
            <span>Heal From Home © 2025 · Intelligent Post-Discharge Care</span>
          </div>
          <div style={{ display: 'flex', gap: 20, color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>
            <span style={{ cursor: 'pointer' }}>Privacy</span>
            <span style={{ cursor: 'pointer' }}>Terms</span>
            <span style={{ cursor: 'pointer' }}>Contact</span>
          </div>
        </footer>
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
