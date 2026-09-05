// Import React core library
import React from 'react';

// Get initials from a name (e.g., "Alex Johnson" -> "AJ")
const getInitials = (name) => {
  if (!name) return 'WR'; // default if the name is missing
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Formats a date like "2026-09-01T00:00:00Z" into "Sep 1, 2026"
const formatDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Shows a grid of report cards. If there's nothing to show, it displays an empty state.
 * Each card has view, edit, and delete buttons.
 */
const ReportList = ({ reports, onViewReport, onEditReport, onDeleteReport }) => {
  // No reports? Show a friendly empty state message instead of an empty grid
  if (!reports || reports.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📄</div>
        <h3>No Weekly Reports Found</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '400px' }}>
          No weekly reports match your current filter parameters. Try adjusting your search query or create a new report!
        </p>
      </div>
    );
  }

  // We have reports! Loop through and render a card for each one
  return (
    <div className="reports-grid">
      {reports.map((report) => {
        // Build a 5-star rating array so we can colour the filled ones
        const stars = [1, 2, 3, 4, 5];
        const rating = report.productivityRating || 4;

        // Work out the CSS class for the status colour (e.g. approved = green)
        const statusClass = (report.status || 'Submitted').toLowerCase().replace(' ', '-');

        return (
          <div key={report._id} className="report-card">
            {/* Card top: title and department badge */}
            <div>
              <div className="card-header">
                <h3 className="card-title">{report.title}</h3>
                <span className="dept-badge">{report.department}</span>
              </div>

              {/* Who wrote it and when */}
              <div className="author-meta" style={{ marginTop: '14px' }}>
                <div className="author-avatar">
                  {getInitials(report.authorName)}
                </div>
                <div>
                  <div className="author-name">{report.authorName}</div>
                  <div className="author-role">
                    {report.role} • {formatDate(report.weekEndDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Stars and task counts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* The stars */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="rating-stars">
                  {stars.map((star) => (
                    <span key={star} className={star <= rating ? 'star-filled' : 'star-empty'}>
                      ★
                    </span>
                  ))}
                </div>
                {/* Status Pill Badge */}
                <span className={`status-pill ${statusClass}`}>
                  • {report.status}
                </span>
              </div>

              {/* Quick summary of how many tasks, blockers, etc. */}
              <div className="task-summary-list">
                {/* How many things did they finish? */}
                <div className="task-summary-row">
                  <span className="summary-label">
                    <span style={{ color: '#34d399' }}>✓</span> Completed Tasks
                  </span>
                  <span className="summary-count emerald">
                    {report.completedTasks ? report.completedTasks.length : 0}
                  </span>
                </div>

                {/* How many are still in progress? */}
                <div className="task-summary-row">
                  <span className="summary-label">
                    <span style={{ color: '#fbbf24' }}>⏳</span> In Progress
                  </span>
                  <span className="summary-count amber">
                    {report.inProgressTasks ? report.inProgressTasks.length : 0}
                  </span>
                </div>

                {/* Any blockers? */}
                <div className="task-summary-row">
                  <span className="summary-label">
                    <span style={{ color: '#fb7185' }}>⚠️</span> Blockers / Impediments
                  </span>
                  <span className="summary-count rose">
                    {report.blockers ? report.blockers.length : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom: action buttons for view, edit, delete */}
            <div className="card-actions">
              {/* Main button to open the full report */}
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                onClick={() => onViewReport(report)}
              >
                👁️ View Details
              </button>

              {/* Small icon buttons for edit and delete */}
              <div className="action-btn-group">
                {/* Edit */}
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => onEditReport(report)}
                  title="Edit Report"
                  aria-label="Edit Report"
                >
                  ✏️
                </button>

                {/* Delete */}
                <button
                  type="button"
                  className="btn-icon delete"
                  onClick={() => onDeleteReport(report._id)}
                  title="Delete Report"
                  aria-label="Delete Report"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportList;
