import React, { useState } from 'react';

// Turns a date like "2026-09-01T00:00:00Z" into something readable like "Monday, September 1, 2026"
const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  return new Date(dateVal).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * This is the popup that shows a full read-only view of a weekly report.
 * Pass in isOpen to show/hide it, onClose to close it, and report for the data.
 */
const ReportDetailModal = ({ isOpen, onClose, report }) => {
  // Tracks whether we just copied the summary — flips the button label to "Copied!" briefly
  const [copied, setCopied] = useState(false);

  // Nothing to show if the modal is closed or there's no report data yet
  if (!isOpen || !report) return null;

  // Builds a plain text version of the report and copies it to the clipboard
  const handleCopySummary = () => {
    // Start building the text block
    let text = `=========================================\n`;
    text += `WEEKLY REPORT: ${report.title}\n`;
    text += `=========================================\n`;
    text += `Author: ${report.authorName} (${report.role})\n`;
    text += `Department: ${report.department}\n`;
    text += `Week Ending: ${formatDate(report.weekEndDate)}\n`;
    text += `Status: ${report.status}\n`;
    text += `Productivity Rating: ${report.productivityRating} / 5\n\n`;

    text += `--- COMPLETED TASKS (${report.completedTasks ? report.completedTasks.length : 0}) ---\n`;
    if (report.completedTasks && report.completedTasks.length > 0) {
      report.completedTasks.forEach((t) => (text += `  [x] ${t}\n`));
    } else {
      text += `  (No completed tasks listed)\n`;
    }

    text += `\n--- TASKS IN PROGRESS (${report.inProgressTasks ? report.inProgressTasks.length : 0}) ---\n`;
    if (report.inProgressTasks && report.inProgressTasks.length > 0) {
      report.inProgressTasks.forEach((t) => (text += `  [-] ${t}\n`));
    } else {
      text += `  (No ongoing tasks listed)\n`;
    }

    text += `\n--- BLOCKERS & RISKS (${report.blockers ? report.blockers.length : 0}) ---\n`;
    if (report.blockers && report.blockers.length > 0) {
      report.blockers.forEach((t) => (text += `  [!] ${t}\n`));
    } else {
      text += `  (None reported)\n`;
    }

    text += `\n--- NEXT WEEK GOALS (${report.nextWeekGoals ? report.nextWeekGoals.length : 0}) ---\n`;
    if (report.nextWeekGoals && report.nextWeekGoals.length > 0) {
      report.nextWeekGoals.forEach((t) => (text += `  [>] ${t}\n`));
    } else {
      text += `  (None listed)\n`;
    }

    if (report.summaryNotes) {
      text += `\n--- SUMMARY NOTES ---\n${report.summaryNotes}\n`;
    }

    // Actually write it to the clipboard
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // flip back after 2 seconds
    });
  };

  // Open the browser's print dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Clicking outside the modal box closes it */}
      <div className="modal-container" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        {/* The white box that contains everything */}
        <div className="modal-header">
          <h2 className="modal-title">📄 Weekly Report Details</h2>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {/* The scrollable content area */}
        <div className="modal-body detail-document">
          {/* Top section: shows title, author, department, and date */}
          <div className="detail-header-card">
            <div>
              <span className="dept-badge" style={{ marginBottom: '8px', display: 'inline-block' }}>
                {report.department}
              </span>
              <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '6px' }}>
                {report.title}
              </h2>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                <strong style={{ color: '#f8fafc' }}>{report.authorName}</strong> — {report.role}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                Week Ending: {formatDate(report.weekEndDate)}
              </div>
            </div>

            {/* Right side: status badge and star rating */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span className="status-pill submitted">
                • {report.status}
              </span>
              <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.95rem' }}>
                ⭐ {report.productivityRating} / 5 Rating
              </div>
            </div>
          </div>

          {/* What did they finish this week? */}
          <div>
            <h4 className="detail-section-title">
              <span style={{ color: '#34d399' }}>✓</span> Completed Tasks ({report.completedTasks ? report.completedTasks.length : 0})
            </h4>
            {report.completedTasks && report.completedTasks.length > 0 ? (
              <ul className="detail-tasks-list">
                {report.completedTasks.map((t, idx) => (
                  <li key={idx} className="detail-task-item">
                    <span style={{ color: '#34d399', fontWeight: 'bold' }}>✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.88rem', fontStyle: 'italic' }}>No completed tasks recorded.</p>
            )}
          </div>

          {/* What are they still working on? */}
          <div>
            <h4 className="detail-section-title">
              <span style={{ color: '#fbbf24' }}>⏳</span> Tasks In Progress ({report.inProgressTasks ? report.inProgressTasks.length : 0})
            </h4>
            {report.inProgressTasks && report.inProgressTasks.length > 0 ? (
              <ul className="detail-tasks-list">
                {report.inProgressTasks.map((t, idx) => (
                  <li key={idx} className="detail-task-item">
                    <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>⏳</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.88rem', fontStyle: 'italic' }}>No active tasks in progress.</p>
            )}
          </div>

          {/* Anything blocking them from getting stuff done? */}
          <div>
            <h4 className="detail-section-title">
              <span style={{ color: '#fb7185' }}>⚠️</span> Blockers & Impediments ({report.blockers ? report.blockers.length : 0})
            </h4>
            {report.blockers && report.blockers.length > 0 ? (
              <ul className="detail-tasks-list">
                {report.blockers.map((t, idx) => (
                  <li key={idx} className="detail-task-item" style={{ borderLeft: '3px solid #f43f5e' }}>
                    <span style={{ color: '#fb7185', fontWeight: 'bold' }}>⚠️</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#34d399', fontSize: '0.88rem' }}>🎉 No active blockers reported this week!</p>
            )}
          </div>

          {/* What are they planning for next week? */}
          <div>
            <h4 className="detail-section-title">
              <span style={{ color: '#818cf8' }}>🎯</span> Next Week Goals ({report.nextWeekGoals ? report.nextWeekGoals.length : 0})
            </h4>
            {report.nextWeekGoals && report.nextWeekGoals.length > 0 ? (
              <ul className="detail-tasks-list">
                {report.nextWeekGoals.map((t, idx) => (
                  <li key={idx} className="detail-task-item">
                    <span style={{ color: '#818cf8', fontWeight: 'bold' }}>🎯</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.88rem', fontStyle: 'italic' }}>No next week goals specified.</p>
            )}
          </div>

          {/* Any extra notes they wrote? */}
          {report.summaryNotes && (
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h4 className="detail-section-title">📝 Executive Summary & Notes</h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{report.summaryNotes}</p>
            </div>
          )}
        </div>

        {/* Bottom buttons: copy the report text, print it, or close the modal */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {/* Copy & Print buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={handleCopySummary}>
              {copied ? '✅ Copied to Clipboard!' : '📋 Copy Text Summary'}
            </button>
            <button type="button" className="btn-secondary" onClick={handlePrint}>
              🖨️ Print / Export PDF
            </button>
          </div>

          {/* Done reading? Close the modal */}
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;
