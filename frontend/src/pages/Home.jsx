import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, ShieldCheck, Lock, ScanLine } from 'lucide-react';

function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at 50% 50%, #111827 0%, #0a0f1d 100%)',
      minHeight: '100vh'
    }}>
      <div className="glass-card fade-in" style={{
        padding: '3.5rem 2.5rem',
        width: '100%',
        maxWidth: '650px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '30%',
          width: '250px',
          height: '250px',
          background: 'rgba(59, 130, 246, 0.15)',
          filter: 'blur(80px)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          right: '20%',
          width: '250px',
          height: '250px',
          background: 'rgba(139, 92, 246, 0.15)',
          filter: 'blur(80px)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}></div>

        {/* Logo/Icon */}
        <div style={{
          display: 'inline-flex',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(59, 130, 246, 0.1)',
          color: 'var(--accent-primary)',
          marginBottom: '1.5rem',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <ScanLine size={40} />
        </div>

        {/* Title & Description */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          marginBottom: '1rem',
          lineHeight: 1.2,
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.03em'
        }}>
          AI Smart Gate<br />
          <span style={{
            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Access Management System
          </span>
        </h1>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.05rem',
          maxWidth: '500px',
          margin: '0 auto 2.5rem auto',
          lineHeight: 1.6
        }}>
          A digital check-in platform utilizing QR-based entry passes, real-time logs logging, and advanced OpenCV face verification.
        </p>

        {/* Quick Links / Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1rem',
          maxWidth: '450px',
          margin: '0 auto'
        }}>
          <Link to="/register" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontSize: '1.05rem',
            fontWeight: 500
          }} className="btn-primary">
            <UserPlus size={20} />
            Visitor Registration
          </Link>
          
          <Link to="/verify" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontSize: '1.05rem',
            fontWeight: 500,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            color: '#ffffff',
            transition: 'background var(--transition-fast)'
          }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
             onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
            <ShieldCheck size={20} style={{ color: 'var(--success)' }} />
            Security Verification
          </Link>

          <Link to="/login" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            marginTop: '1.5rem',
            transition: 'color var(--transition-fast)'
          }} onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
             onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <Lock size={14} />
            Admin Portal Access &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
