import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, CheckCircle2, XCircle, LogOut, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { visitorApi, adminApi } from '../services/api';

function AdminDashboard() {
  const navigate = useNavigate();

  // Data states
  const [visitors, setVisitors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active view tab state ('visitors' or 'logs')
  const [activeTab, setActiveTab] = useState('visitors');
  
  // Search query states
  const [visitorSearch, setVisitorSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');

  // Redirect check to verify if the admin is logged in
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (isAuthenticated !== 'true') {
      navigate('/login');
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  // Request all dashboard records from the Flask backend
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Execute parallel requests to speed up load time
      const [visitorsRes, logsRes] = await Promise.all([
        visitorApi.getAll(),
        adminApi.getLogs()
      ]);
      
      setVisitors(visitorsRes.data.visitors || []);
      setLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard data. Ensure the server is online.");
    } finally {
      setLoading(false);
    }
  };

  // Sign out administrator
  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  // Compute metric cards counters
  const totalVisitors = visitors.length;
  const totalEntries = logs.length;
  const allowedEntries = logs.filter(log => log.status === 'Allowed').length;
  const deniedEntries = logs.filter(log => log.status === 'Denied').length;

  // Filter lists based on search criteria
  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(visitorSearch.toLowerCase()) ||
    v.email.toLowerCase().includes(visitorSearch.toLowerCase()) ||
    v.phone.includes(visitorSearch) ||
    v.purpose.toLowerCase().includes(visitorSearch.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    l.visitor_name.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.visitor_email.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.status.toLowerCase().includes(logSearch.toLowerCase()) ||
    (l.visitor_purpose && l.visitor_purpose.toLowerCase().includes(logSearch.toLowerCase()))
  );

  // Helper to format timestamps to readable strings
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1d',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Navigation Bar */}
      <nav style={{
        background: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: 'var(--accent-primary)', display: 'inline-flex' }}>
            <ShieldCheck size={28} />
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Smart Gate Admin
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={fetchDashboardData} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color var(--transition-fast)' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            disabled={loading}
          >
            <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--danger)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'background var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Body */}
      <main style={{ padding: '2.5rem 2rem', flex: 1, maxWidth: '1300px', width: '100%', margin: '0 auto' }}>
        
        {/* Error notification */}
        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {/* 1. Metrics Cards Dashboard Summary Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {/* Card: Total Visitors */}
          <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-md)' }}>
              <Users size={26} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Visitors</h4>
              <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem' }}>{loading ? "..." : totalVisitors}</p>
            </div>
          </div>

          {/* Card: Total Entries */}
          <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-secondary)', borderRadius: 'var(--radius-md)' }}>
              <FileText size={26} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Verification Logs</h4>
              <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem' }}>{loading ? "..." : totalEntries}</p>
            </div>
          </div>

          {/* Card: Allowed Entries */}
          <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle2 size={26} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Allowed Access</h4>
              <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--success)' }}>{loading ? "..." : allowedEntries}</p>
            </div>
          </div>

          {/* Card: Denied Entries */}
          <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)' }}>
              <XCircle size={26} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Denied Access</h4>
              <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--danger)' }}>{loading ? "..." : deniedEntries}</p>
            </div>
          </div>
        </div>

        {/* 2. Content Tabs & Search controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button 
              onClick={() => setActiveTab('visitors')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'visitors' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'visitors' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                padding: '0.75rem 0.5rem',
                fontSize: '1.05rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Registered Visitors ({totalVisitors})
            </button>
            
            <button 
              onClick={() => setActiveTab('logs')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'logs' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'logs' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                padding: '0.75rem 0.5rem',
                fontSize: '1.05rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Entry Verification Logs ({totalEntries})
            </button>
          </div>

          {/* Search Input Box */}
          <div style={{ position: 'relative', marginBottom: '0.5rem', width: '100%', maxWidth: '300px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={16} />
            </span>
            {activeTab === 'visitors' ? (
              <input 
                type="text"
                placeholder="Search visitors..."
                value={visitorSearch}
                onChange={(e) => setVisitorSearch(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: '#fff', fontSize: '0.85rem' }}
              />
            ) : (
              <input 
                type="text"
                placeholder="Search access events..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: '#fff', fontSize: '0.85rem' }}
              />
            )}
          </div>
        </div>

        {/* 3. Dynamic Grid Tables */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
            <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto', animation: 'spin 1s linear infinite' }} />
            Loading system records from APIs...
          </div>
        ) : (
          <div className="glass-card" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
            {activeTab === 'visitors' ? (
              /* Visitors Table */
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Face</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Name</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Phone</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Purpose</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.length > 0 ? (
                    filteredVisitors.map((visitor) => (
                      <tr key={visitor.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background var(--transition-fast)' }} 
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        
                        {/* Face Preview image served dynamically */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <img 
                            src={`http://localhost:5000/${visitor.image_path}`} 
                            alt={visitor.name} 
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border-color)' }}
                            onError={(e) => { e.target.src = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>👤</text></svg>" }}
                          />
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{visitor.name}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{visitor.email}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{visitor.phone}</td>
                        <td style={{ padding: '1rem' }}><span style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '0.85rem' }}>{visitor.purpose}</span></td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(visitor.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No matching visitor records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              /* Access Verification Logs Table */
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Log ID</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Visitor Name</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Entry Time</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.log_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background var(--transition-fast)' }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>#{log.log_id}</td>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{log.visitor_name}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{log.visitor_email}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{formatDate(log.entry_time)}</td>
                        
                        {/* Allowed/Denied status color labels */}
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: log.status === 'Allowed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: log.status === 'Allowed' ? 'var(--success)' : 'var(--danger)'
                          }}>
                            {log.status === 'Allowed' ? 'Allowed' : 'Denied'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No check-in security logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
