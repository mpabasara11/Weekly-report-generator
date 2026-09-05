import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * RegisterPage Component
 * @param {Object} props
 * @param {Function} props.onLogin - Callback to pass registered user and token up to App
 */
const RegisterPage = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TEAM_MEMBER');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Submit registration form handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register account');
      }

      if (onLogin) {
        onLogin(data.user, data.token);
      }

      if (data.user && data.user.role === 'MANAGER') {
        navigate('/dashboard');
      } else {
        navigate('/my-reports');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register account');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div style={{ maxWidth: '480px', margin: '30px auto 0 auto' }}>
      <div className="report-card" style={{ padding: '32px' }}>
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="brand-icon" style={{ margin: '0 auto 12px auto' }}>📝</div>
          <h2 style={{ fontSize: '1.5rem' }}>Create an Account</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Join your workspace team to submit & review weekly reports
          </p>
        </div>

        {/* Error Notification Alert Box */}
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Full Name Input */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Jordan Lee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email Address Input */}
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. jordan@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Role Selector Toggle Buttons */}
          <div className="form-group">
            <label className="form-label">Account Role *</label>
            <div className="status-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <button
                type="button"
                className={`tab-btn ${role === 'TEAM_MEMBER' ? 'active' : ''}`}
                onClick={() => setRole('TEAM_MEMBER')}
                style={{ textAlign: 'center', padding: '10px' }}
              >
                👤 Team Member
              </button>
              <button
                type="button"
                className={`tab-btn ${role === 'MANAGER' ? 'active' : ''}`}
                onClick={() => setRole('MANAGER')}
                style={{ textAlign: 'center', padding: '10px' }}
              >
                👑 Manager
              </button>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
              {role === 'MANAGER'
                ? 'Manager role grants access to Team Analytics Dashboard & Report Reviews.'
                : 'Team Member role lets you create, submit, and track weekly reports.'}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ justifyContent: 'center', width: '100%', marginTop: '8px' }}
          >
            {isSubmitting ? 'Registering Account...' : 'Complete Registration'}
          </button>
        </form>

        {/* Existing Account Link */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', fontWeight: 'bold', textDecoration: 'none' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

// Export RegisterPage component
export default RegisterPage;
