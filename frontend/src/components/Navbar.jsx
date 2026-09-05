import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

/**
 * The top navigation bar.
 * Shows different links depending on whether you're a Manager or a Team Member.
 * Gets the user info and logout function passed in as props from App.jsx.
 */
const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const isManager = user?.role === 'MANAGER';

  // Clear state in App and send them back to the login page
  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  // Nobody logged in yet — just show the bare minimum header
  if (!user) {
    return (
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">📊</div>
          <div>
            <h1 className="brand-title">Weekly Report Generator</h1>
            <p className="brand-subtitle">Team Progress & Accomplishment Platform</p>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="app-header">
      {/* Clicking the logo takes you to your home page */}
      <Link to={isManager ? '/dashboard' : '/my-reports'} style={{ textDecoration: 'none' }}>
        <div className="header-brand">
          <div className="brand-icon">📊</div>
          <div>
            <h1 className="brand-title">Weekly Reports</h1>
            <p className="brand-subtitle">
              {isManager ? 'Manager Control Center' : 'Team Member Workspace'}
            </p>
          </div>
        </div>
      </Link>

      {/* The nav links and the user pill on the right */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Everyone can see this */}
        <NavLink
          to="/my-reports"
          className={({ isActive }) => `btn-secondary ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          📄 My Reports
        </NavLink>

        {/* Also for everyone */}
        <NavLink
          to="/report/new"
          className={({ isActive }) => `btn-primary ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          ➕ New Report
        </NavLink>

        {/* Managers only */}
        {isManager && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `btn-secondary ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            📈 Team Dashboard
          </NavLink>
        )}

        {/* Also managers only */}
        {isManager && (
          <NavLink
            to="/admin/projects"
            className={({ isActive }) => `btn-secondary ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            ⚙️ Projects Admin
          </NavLink>
        )}

        {/* Who's logged in — shows their name, role badge, and logout button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.85rem'
            }}
          >
            <strong style={{ color: '#f8fafc' }}>{user.name}</strong>{' '}
            <span className={`status-pill ${isManager ? 'approved' : 'submitted'}`} style={{ marginLeft: '6px', fontSize: '0.7rem' }}>
              {user.role}
            </span>
          </div>

          {/* Click this to log out */}
          <button type="button" className="btn-danger" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

