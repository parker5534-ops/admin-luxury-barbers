import React, { useState } from 'react';
import { login } from '../lib/api';
import { useAuth } from '../hooks/useAuth.jsx';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      loginUser(token, user);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050505', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>Luxury Barber Culture</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Admin Dashboard</div>
        </div>

        <div className="a-card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit}>
            <div className="a-field">
              <label className="a-label">Email</label>
              <input className="a-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@luxurybarberculture.com" required autoFocus />
            </div>
            <div className="a-field">
              <label className="a-label">Password</label>
              <input className="a-input" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required />
            </div>
            {error && (
              <div style={{ background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.25)', borderRadius: 8, padding: '9px 12px', fontSize: '0.82rem', color: 'var(--red)', marginBottom: 14 }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn-save" style={{ width: '100%', padding: '11px' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Default: admin@luxurybarberculture.com / LuxuryAdmin2024!
        </div>
      </div>
    </div>
  );
}
