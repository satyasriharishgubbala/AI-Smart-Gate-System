import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, User, AlertCircle, RefreshCw } from 'lucide-react';
import { adminApi } from '../services/api';

function AdminLogin() {
  const navigate = useNavigate();

  // Input states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // UI status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Submit credentials check
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all credential fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await adminApi.login({ username, password });
      
      // Store session token or simple authenticated state
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('adminUser', response.data.admin.username);

      // Redirect to dashboard page
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || err.response.data.error || "Authentication failed.");
      } else {
        setError("Network error. Ensure the server is online at http://localhost:5000");
      }
    } finally {
      setLoading(false);
    }
  };

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
      <div style={{ width: '100%', maxWidth: '400px' }}>
        
        {/* Back Link */}
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
          transition: 'color var(--transition-fast)'
        }} onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
           onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Card wrapper */}
        <div className="glass-card fade-in" style={{ padding: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(59, 130, 246, 0.1)',
            color: 'var(--accent-primary)',
            marginBottom: '1.25rem',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <Lock size={22} />
          </div>

          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Authenticate to monitor gate check-ins.
          </p>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <User size={16} />
                </span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username" 
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: '#fff', fontSize: '0.95rem' }} 
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={16} />
                </span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password" 
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: '#fff', fontSize: '0.95rem' }} 
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{
                marginTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                height: '44px'
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Verifying Credentials...
                </>
              ) : (
                "Authenticate"
              )}
            </button>
          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AdminLogin;
