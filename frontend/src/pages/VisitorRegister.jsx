import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { visitorApi } from '../services/api';

function VisitorRegister() {
  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // UI state variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);

  // Validate form inputs
  const validateForm = () => {
    if (!name.trim()) return "Full Name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "A valid email address is required.";
    if (!phone.trim() || phone.length < 8) return "Please enter a valid phone number (at least 8 digits).";
    if (!purpose.trim()) return "Purpose of visit is required.";
    if (!imageFile) return "Please upload a clear photograph of your face.";
    return null;
  };

  // Handle image attachment
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  // Handle submission API request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Package payload as FormData
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('purpose', purpose);
      formData.append('image', imageFile);

      const response = await visitorApi.register(formData);
      
      // Store API response data
      setRegisteredData(response.data.data);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || err.response.data.error || "Failed to register visitor.");
      } else {
        setError("Network error. Make sure the Flask backend is running on http://localhost:5000");
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear states to register a new visitor
  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPurpose('');
    setImageFile(null);
    setImagePreview('');
    setSuccess(false);
    setRegisteredData(null);
    setError('');
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
      <div style={{ width: '100%', maxWidth: '520px' }}>
        
        {/* Header Back Button */}
        {!success && (
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
        )}

        {/* Success Gate Pass Modal Panel */}
        {success && registeredData ? (
          <div className="glass-card fade-in" style={{
            padding: '3rem 2.5rem',
            textAlign: 'center',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>
              <CheckCircle size={48} style={{ margin: '0 auto' }} />
            </div>
            
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Registration Successful!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Your gate entry pass has been generated. 
              {registeredData.email_sent ? " A copy has also been sent to your email." : " Save or screenshot the pass details below."}
            </p>

            {/* Gate Pass Wrapper */}
            <div style={{
              background: '#ffffff',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '300px',
              margin: '0 auto 2.5rem auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              color: '#000000'
            }}>
              {/* QR Code static rendering */}
              <img 
                src={`http://localhost:5000/${registeredData.qr_code}`} 
                alt="Gate Pass QR Code" 
                style={{ width: '100%', height: 'auto', display: 'block', marginBottom: '1.5rem', border: '1px solid #e5e7eb', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
              />
              <div style={{ borderTop: '2px dashed #d1d5db', paddingTop: '1rem', textAlign: 'center' }}>
                <h4 style={{ color: '#111827', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{registeredData.name}</h4>
                <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0.25rem 0 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Visitor ID: #{registeredData.id}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/" className="btn-primary" style={{ textDecoration: 'none', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff', boxShadow: 'none' }}>
                Go to Home
              </Link>
              <button onClick={handleReset} className="btn-primary">
                Register Another Pass
              </button>
            </div>
          </div>
        ) : (
          /* Form Content Panel */
          <div className="glass-card fade-in" style={{ padding: '2.5rem 2rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Visitor Entry Pass</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Provide your details and a clear face photo.
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
                fontSize: '0.9rem',
                marginBottom: '1.5rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter your name" 
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: '#fff', fontSize: '0.95rem', transition: 'border-color var(--transition-fast)' }} 
                  disabled={loading}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter your email" 
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: '#fff', fontSize: '0.95rem' }} 
                  disabled={loading}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Enter your contact number" 
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: '#fff', fontSize: '0.95rem' }} 
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Purpose of Visit</label>
                <input 
                  type="text" 
                  value={purpose} 
                  onChange={(e) => setPurpose(e.target.value)} 
                  placeholder="e.g. Client Meeting, Maintenance, Interview" 
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: '#fff', fontSize: '0.95rem' }} 
                  disabled={loading}
                />
              </div>

              {/* Photo Upload Area */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Face Photograph</label>
                
                {imagePreview ? (
                  <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img 
                      src={imagePreview} 
                      alt="Upload Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => { setImageFile(null); setImagePreview(''); }}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
                      disabled={loading}
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem 1rem',
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-fast)'
                  }} onDragOver={(e) => e.preventDefault()}
                     onDrop={(e) => {
                       e.preventDefault();
                       const file = e.dataTransfer.files[0];
                       if (file) {
                         setImageFile(file);
                         setImagePreview(URL.createObjectURL(file));
                       }
                     }}>
                    <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Click to upload face image</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>PNG, JPG, or JPEG (Max 16MB)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      style={{ display: 'none' }} 
                      disabled={loading}
                    />
                  </label>
                )}
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  height: '46px'
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Processing Face Verification...
                  </>
                ) : (
                  "Generate Gate Pass"
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Basic Keyframe Spinner styling injected for quick spinner support */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default VisitorRegister;
