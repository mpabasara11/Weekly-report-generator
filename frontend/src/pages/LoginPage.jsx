import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * The login page. Just a simple form with email and password.
 * When it succeeds, it tells App.jsx who logged in via the onLogin prop.
 */
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // When they hit Submit, send the email+password to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password credentials');
      }

      // Tell App.jsx who logged in so it can update the user state
      if (onLogin) {
        onLogin(data.user, data.token);
      }

      // Send managers to the dashboard, everyone else to their reports
      if (data.user && data.user.role === 'MANAGER') {
        navigate('/dashboard');
      } else {
        navigate('/my-reports');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password credentials');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div style={{ maxWidth: '440px', margin: '40px auto 0 auto' }}>
      <div className="report-card" style={{ padding: '32px' }}>
        {/* Page header with icon and title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="brand-icon" style={{ margin: '0 auto 12px auto' }}>🔐</div>
          <h2 style={{ fontSize: '1.5rem' }}>Welcome Back</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Sign in to manage your weekly reports & team updates
          </p>
        </div>

        {/* Show an error message if login fails */}
        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              marginBottom: '18px'
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* The actual form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email field */}
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password field */}
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ justifyContent: 'center', width: '100%', marginTop: '8px' }}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Link to the register page */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#818cf8', fontWeight: 'bold', textDecoration: 'none' }}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
