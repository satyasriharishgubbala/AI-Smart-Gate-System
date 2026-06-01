import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, ShieldAlert, CheckCircle, XCircle, RefreshCw, Upload, AlertCircle } from 'lucide-react';
import { securityApi } from '../services/api';

function SecurityVerify() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Form payload states
  const [visitorId, setVisitorId] = useState('');
  const [capturedFile, setCapturedFile] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState('');
  
  // Camera stream states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // API query statuses
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  // Initialize camera stream on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Request browser video stream
  const startCamera = async () => {
    setCameraError(false);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError(true);
      setCameraActive(false);
    }
  };

  // Close stream resources
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Draw the current video frame onto a canvas and save it as a File
  const captureFrame = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'live_capture.jpg', { type: 'image/jpeg' });
          setCapturedFile(file);
          setCapturedPreview(URL.createObjectURL(file));
          setError('');
        }
      }, 'image/jpeg');
    } catch (err) {
      console.error("Failed to capture frame:", err);
      setError("Failed to capture snapshot from webcam.");
    }
  };

  // Fallback upload file handler for systems without camera
  const handleFallbackImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCapturedFile(file);
      setCapturedPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  // Submit check-in payload to Flask backend
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setVerifyResult(null);

    if (!visitorId.trim()) {
      setError("Please scan or enter a Visitor ID.");
      return;
    }

    if (!capturedFile) {
      setError("Please capture a live photo or upload a verification image.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('visitor_id', visitorId);
      formData.append('image', capturedFile);

      // Connect with POST /api/verify
      const response = await securityApi.verify(formData);
      
      // Response includes status ('Allowed' or 'Denied')
      setVerifyResult(response.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || err.response.data.error || "Verification failed.");
      } else {
        setError("Network error. Verify that the Flask server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset verify workspace
  const handleReset = () => {
    setVisitorId('');
    setCapturedFile(null);
    setCapturedPreview('');
    setVerifyResult(null);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1d',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Header bar */}
      <nav style={{
        background: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', display: 'inline-flex' }}>
          <ArrowLeft size={22} />
        </Link>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
          Security Guard Console
        </span>
      </nav>

      {/* Main Container */}
      <main style={{ padding: '2.5rem 2rem', flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
        
        {/* Verification Result Display */}
        {verifyResult && (
          <div className="glass-card fade-in" style={{
            padding: '2rem',
            border: verifyResult.status === 'Allowed' ? '2px solid var(--success)' : '2px solid var(--danger)',
            background: verifyResult.status === 'Allowed' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ color: verifyResult.status === 'Allowed' ? 'var(--success)' : 'var(--danger)' }}>
                {verifyResult.status === 'Allowed' ? <CheckCircle size={48} /> : <XCircle size={48} />}
              </div>
              <div>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
                  Access {verifyResult.status === 'Allowed' ? 'Granted' : 'Denied'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {verifyResult.message}
                </p>
                {verifyResult.visitor && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                    <strong>Name:</strong> {verifyResult.visitor.name} {verifyResult.visitor.purpose && `| Purpose: ${verifyResult.visitor.purpose}`}
                  </div>
                )}
              </div>
            </div>
            
            <button onClick={handleReset} className="btn-primary" style={{ background: verifyResult.status === 'Allowed' ? 'var(--success)' : 'var(--danger)', boxShadow: 'none' }}>
              Clear and Scan Next
            </button>
          </div>
        )}

        {/* Global Errors */}
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
            marginBottom: '2rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Section 1: Webcam Stream Capture Console */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={18} style={{ color: 'var(--accent-primary)' }} />
              Live Check-In Camera
            </h3>

            {cameraActive ? (
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                <button 
                  type="button"
                  onClick={captureFrame}
                  style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--accent-gradient)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                  }}
                  title="Capture live image frame"
                >
                  <Camera size={22} />
                </button>
              </div>
            ) : (
              /* Fallback file input if camera blocks/lacks hardware */
              <div style={{
                aspectRatio: '4/3',
                background: 'var(--bg-secondary)',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <ShieldAlert size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>Webcam Stream Offline</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 1rem 0' }}>
                  {cameraError ? "Camera permissions blocked or device is missing." : "Activating camera..."}
                </span>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={startCamera} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', borderRadius: '4px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Retry Camera
                  </button>
                  
                  <label style={{ background: 'var(--accent-primary)', padding: '0.4rem 0.8rem', borderRadius: '4px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Upload size={12} />
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handleFallbackImage} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            )}

            {/* Captured verification preview display */}
            {capturedPreview && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <img src={capturedPreview} alt="Live check" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Captured Gate Frame</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Ready for verification</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Scanned QR Pass Inputs Verification Console */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Verify Gate Pass</h3>
            
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Visitor ID (from QR Scan)
                </label>
                <input 
                  type="number" 
                  value={visitorId}
                  onChange={(e) => setVisitorId(e.target.value)}
                  placeholder="Enter or paste visitor ID" 
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: '#fff', fontSize: '0.95rem' }} 
                  disabled={loading || !!verifyResult}
                />
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Simulate QR scan: input the Visitor ID printed on the pass.
                </span>
              </div>

              {/* QR Code upload simulator helper */}
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                  <Upload size={18} style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Simulate Scan by uploading QR Pass file</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Extracts ID from name (e.g. qr_1.png)</span>
                  
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Extract visitor_id from naming convention: qr_X.png -> X
                        const match = file.name.match(/qr_(\d+)/);
                        if (match && match[1]) {
                          setVisitorId(match[1]);
                          setError('');
                        } else {
                          setError("Could not parse visitor ID from filename. Please type it in directly.");
                        }
                      }
                    }} 
                    style={{ display: 'none' }}
                    disabled={loading || !!verifyResult}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={handleReset} 
                  style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff', cursor: 'pointer', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}
                  disabled={loading}
                >
                  Reset
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  disabled={loading || !!verifyResult}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Comparing Faces...
                    </>
                  ) : (
                    "Verify Access Pass"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
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

export default SecurityVerify;
