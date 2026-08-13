import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';
import { apiFetch, setAuthToken, setSavedUser } from '../utils/api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('warden');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and Password are mandatory.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      setAuthToken(res.token);
      setSavedUser(res.user);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <Lock size={26} />
          </div>
          <h1 className="auth-title">Hostel Admin Portal</h1>
          <p className="auth-subtitle">Sign in to access & submit the Daily Hostel Report</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Username <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
              <User
                size={18}
                style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <KeyRound
                size={18}
                style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Access Form'}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.825rem', color: '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', marginBottom: '0.4rem', color: '#0f172a' }}>
            <ShieldCheck size={16} color="#0284c7" />
            <span>Default System Accounts:</span>
          </div>
          <div style={{ marginBottom: '0.3rem' }}>Warden: <strong>warden</strong> / <strong>admin123</strong></div>
          <div>Dean Admin: <strong>deanadmin</strong> / <strong>admin123</strong></div>
        </div>
      </div>
    </div>
  );
}
