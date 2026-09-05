import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { authFetch } from '../utils/api';

/**
 * Helper function to format date strings
 */
const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  return new Date(dateVal).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Helper function to return CSS class for status pill badges
 */
const getStatusClass = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'approved';
    case 'SUBMITTED':
      return 'submitted';
    case 'NEEDS_CORRECTION':
      return 'rose';
    default:
      return 'draft';
  }
};

/**
 * MyReportsPage Component rendering list of user's personal weekly reports
 * @returns {JSX.Element} Rendered page JSX
 */
const MyReportsPage = () => {
  // State storing reports list array
  const [reports, setReports] = useState([]);
  // State for loading state and feedback banner message
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Instantiate navigate hook
  const navigate = useNavigate();

  // Load user's own reports on component mount
  const loadReports = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/reports/my');
      if (res && res.data) {
        setReports(res.data);
      }
    } catch (error) {
      console.error('Error fetching my reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Handle report submission to manager
  const handleSubmitReport = async (id) => {
    if (window.confirm('Submit this weekly report to your manager for review?')) {
      try {
        await authFetch(`/reports/${id}/submit`, { method: 'POST' });
        setMessage('Weekly report submitted successfully!');
        loadReports();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        alert(error.message || 'Failed to submit report');
      }
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.6rem' }}>My Weekly Reports</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Track, edit, and review your personal weekly accomplishment submissions
          </p>
        </div>

        {/* Create Report Button */}
        <Link to="/report/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          ➕ Create Weekly Report
        </Link>
      </div>

      {/* Success Notification Message Banner */}
      {message && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '12px 18px',
            borderRadius: '10px',
            fontWeight: '600'
          }}
        >
          ✅ {message}
        </div>
      )}

      {/* Reports Table / Grid Container */}
      {isLoading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <h3>Loading your reports...</h3>
        </div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <h3>No Weekly Reports Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            You haven't created any weekly reports yet. Click below to draft your first report!
          </p>
          <Link to="/report/new" className="btn-primary" style={{ textDecoration: 'none', marginTop: '12px' }}>
            ➕ Start First Report
          </Link>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <div key={report._id} className="report-card">
              {/* Top Row: Week Date & Status Badge */}
              <div className="card-header">
                <div>
                  <span className="dept-badge">
                    {report.projectId?.name || 'Project'}
                  </span>
                  <h3 className="card-title" style={{ marginTop: '6px' }}>
                    Week of {formatDate(report.weekStartDate)}
                  </h3>
                </div>
                <span className={`status-pill ${getStatusClass(report.status)}`}>
                  • {report.status.replace('_', ' ')}
                </span>
              </div>

              {/* Tasks Breakdown Counter Box */}
              <div className="task-summary-list">
                <div className="task-summary-row">
                  <span className="summary-label">
                    <span style={{ color: '#34d399' }}>✓</span> Tasks Completed
                  </span>
                  <span className="summary-count emerald">
                    {report.tasks ? report.tasks.filter((t) => t.status === 'COMPLETED').length : 0} / {report.tasks ? report.tasks.length : 0}
                  </span>
                </div>

                <div className="task-summary-row">
                  <span className="summary-label">
                    <span style={{ color: '#fb7185' }}>⚠️</span> Key Blockers
                  </span>
                  <span className="summary-count rose">
                    {report.blockers ? report.blockers.filter((b) => b.isKeyIssue).length : 0}
                  </span>
                </div>

                <div className="task-summary-row">
                  <span className="summary-label">
                    <span style={{ color: '#818cf8' }}>🕒</span> Total Hours Worked
                  </span>
                  <span className="summary-count" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                    {(report.hoursWorked?.development || 0) +
                      (report.hoursWorked?.testing || 0) +
                      (report.hoursWorked?.meetings || 0) +
                      (report.hoursWorked?.documentation || 0)}{' '}
                    hrs
                  </span>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="card-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate(`/report/${report._id}`)}
                >
                  👁️ View Details
                </button>

                <div className="action-btn-group">
                  {/* Show Edit Button if status is DRAFT or NEEDS_CORRECTION */}
                  {['DRAFT', 'NEEDS_CORRECTION'].includes(report.status) && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => navigate(`/report/edit/${report._id}`)}
                      title="Edit Report"
                    >
                      ✏️ Edit
                    </button>
                  )}

                  {/* Show Submit Button if status is DRAFT */}
                  {report.status === 'DRAFT' && (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                      onClick={() => handleSubmitReport(report._id)}
                    >
                      🚀 Submit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Export MyReportsPage component
export default MyReportsPage;
