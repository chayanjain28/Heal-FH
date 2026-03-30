import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => (
  <div style={{
    position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-primary)', zIndex: 9999
  }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: 'center' }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', boxShadow: '0 0 40px rgba(14,165,233,0.4)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: 36 }}
        >
          ❤️
        </motion.div>
      </div>
      <h2 style={{
        fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem',
        background: 'linear-gradient(135deg, #0ea5e9, #10b981)', WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent', marginBottom: 8
      }}>
        Heal From Home
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading your care companion...</p>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20 }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9' }}
          />
        ))}
      </div>
    </motion.div>
  </div>
);

export default LoadingScreen;
