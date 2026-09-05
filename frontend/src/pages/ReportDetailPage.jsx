import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { authFetch } from '../utils/api';

/** Helper function to format date string */
const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  return new Date(dateVal).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * ReportDetailPage Component displaying read-only report view, manager comments, and version snapshots
 * @returns {JSX.Element} Rendered Detail page JSX
 */
const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State storing target report object
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVersionSnapshot, setActiveVersionSnapshot] = useState(null);

  // Fetch report details by ID
  useEffect(() => {
    const loadReport = async () => {
      setIsLoading(true);
      try {
        const res = await authFetch(`/reports/${id}`);
        if (res && res.data) {
          setReport(res.data);
        }
      } catch (error) {
        console.error('Error fetching report details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();

  }, [id]);

  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⏳</div>
        <h3>Loading Weekly Report Details...</h3>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>Report Not Found</h3>
        <button type="button" className="btn-secondary" onClick={() => navigate('/my-reports')}>
          Back to Reports
        </button>
      </div>
    );
  }

  // Active view payload (either version snapshot or current live report)
  const currentContent = activeVersionSnapshot || report;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="dept-badge">{report.projectId?.name || 'Project Category'}</span>
          <h2 style={{ fontSize: '1.6rem', marginTop: '6px' }}>
            Weekly Report — Week of {formatDate(report.weekStartDate)}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Submitted by <strong style={{ color: '#f8fafc' }}>{report.userId?.name || 'Team Member'}</strong> ({report.userId?.role || 'TEAM_MEMBER'})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`status-pill ${(report.status || 'draft').toLowerCase().replace('_', '-')}`}>
            • {report.status}
          </span>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>

      {/* Version History Snapshot Selector (If snapshots exist) */}
      {report.versions && report.versions.length > 0 && (
        <div
          style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <h4 style={{ color: '#818cf8', fontSize: '0.95rem' }}>🕒 Edit History Version Snapshots</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
              Select a version snapshot to view previous state iterations across review cycles
            </p>
          </div>

          <div className="status-tabs">
            <button
              type="button"
              className={`tab-btn ${activeVersionSnapshot === null ? 'active' : ''}`}
              onClick={() => setActiveVersionSnapshot(null)}
            >
              Current Live State
            </button>
            {report.versions.map((ver, idx) => (
              <button
                key={idx}
                type="button"
                className={`tab-btn ${activeVersionSnapshot === ver ? 'active' : ''}`}
                onClick={() => setActiveVersionSnapshot(ver)}
              >
                Version {ver.versionNumber || idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Report Document Box */}
      <div className="report-card" style={{ gap: '20px' }}>
        {/* Version banner indicator if viewing historical snapshot */}
        {activeVersionSnapshot && (
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
            ℹ️ Viewing Historical Snapshot Version #{activeVersionSnapshot.versionNumber} (Saved at: {formatDate(activeVersionSnapshot.savedAt)})
          </div>
        )}

        {/* Section 1: Tasks Breakdown Table */}
        <div>
          <h3 className="detail-section-title">📌 Tasks Accomplished & In Progress</h3>
          {currentContent.tasks && currentContent.tasks.length > 0 ? (
            <div style={{ overflowX: 'auto', marginTop: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(15,23,42,0.6)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '10px' }}>Task Name</th>
                    <th style={{ padding: '10px' }}>Priority</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Actual %</th>
                    <th style={{ padding: '10px' }}>Hours</th>
                    <th style={{ padding: '10px' }}>Deliverable</th>
                  </tr>
                </thead>
                <tbody>
                  {currentContent.tasks.map((task, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '10px', color: '#f8fafc', fontWeight: '500' }}>{task.name}</td>
                      <td style={{ padding: '10px' }}>
                        <span className="dept-badge" style={{ fontSize: '0.7rem' }}>{task.priority}</span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span className={`summary-count ${task.status === 'COMPLETED' ? 'emerald' : task.status === 'BLOCKED' ? 'rose' : 'amber'}`}>
                          {task.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>{task.actualPct}%</td>
                      <td style={{ padding: '10px' }}>{task.timeSpent || 0} hrs</td>
                      <td style={{ padding: '10px', color: '#818cf8' }}>
                        {task.deliverable ? (
                          <a href={task.deliverable} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8' }}>
                            🔗 Link
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.88rem', fontStyle: 'italic' }}>No tasks listed.</p>
          )}
        </div>

        {/* Section 2: Blockers */}
        <div>
          <h3 className="detail-section-title" style={{ color: '#fb7185' }}>⚠️ Blockers & Impediments</h3>
          {currentContent.blockers && currentContent.blockers.length > 0 ? (
            <ul className="detail-tasks-list">
              {currentContent.blockers.map((b, idx) => (
                <li key={idx} className="detail-task-item" style={{ borderLeft: b.isKeyIssue ? '4px solid #f43f5e' : 'none' }}>
                  <span>{b.isKeyIssue ? '🔥 [KEY ISSUE] ' : '⚠️ '}</span>
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#34d399', fontSize: '0.88rem' }}>🎉 No active blockers reported for this week!</p>
          )}
        </div>

        {/* Section 3: Achievements */}
        <div>
          <h3 className="detail-section-title" style={{ color: '#34d399' }}>🏆 Achievements & Wins</h3>
          {currentContent.achievements && currentContent.achievements.length > 0 ? (
            <ul className="detail-tasks-list">
              {currentContent.achievements.map((a, idx) => (
                <li key={idx} className="detail-task-item">
                  <span>{a.isKeyHighlight ? '🌟 [KEY HIGHLIGHT] ' : '🏆 '}</span>
                  <span>{a.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.88rem', fontStyle: 'italic' }}>No achievements listed.</p>
          )}
        </div>

        {/* Section 4: Hours Breakdown Grid */}
        <div>
          <h3 className="detail-section-title" style={{ color: '#818cf8' }}>🕒 Hours Worked Breakdown</h3>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <div className="task-summary-list" style={{ textAlign: 'center' }}>
              <span className="stat-label">Development</span>
              <span className="stat-value" style={{ fontSize: '1.2rem', color: '#818cf8' }}>
                {currentContent.hoursWorked?.development || 0} hrs
              </span>
            </div>
            <div className="task-summary-list" style={{ textAlign: 'center' }}>
              <span className="stat-label">Testing</span>
              <span className="stat-value" style={{ fontSize: '1.2rem', color: '#34d399' }}>
                {currentContent.hoursWorked?.testing || 0} hrs
              </span>
            </div>
            <div className="task-summary-list" style={{ textAlign: 'center' }}>
              <span className="stat-label">Meetings</span>
              <span className="stat-value" style={{ fontSize: '1.2rem', color: '#fbbf24' }}>
                {currentContent.hoursWorked?.meetings || 0} hrs
              </span>
            </div>
            <div className="task-summary-list" style={{ textAlign: 'center' }}>
              <span className="stat-label">Documentation</span>
              <span className="stat-value" style={{ fontSize: '1.2rem', color: '#06b6d4' }}>
                {currentContent.hoursWorked?.documentation || 0} hrs
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Next Week Goals */}
        {currentContent.nextWeekPlan && (
          <div>
            <h3 className="detail-section-title">🎯 Next Week Planned Goals</h3>
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '14px', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>
              {currentContent.nextWeekPlan}
            </div>
          </div>
        )}

        {/* Section 6: Manager Review Comments History */}
        {report.reviewComments && report.reviewComments.length > 0 && (
          <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <h3 className="detail-section-title" style={{ color: '#fbbf24' }}>💬 Manager Review Comments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {report.reviewComments.map((rc, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '8px',
                    padding: '12px 16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fbbf24', marginBottom: '4px' }}>
                    <strong>Reviewer: {rc.managerId?.name || rc.managerName || 'Manager'}</strong>
                    <span>{formatDate(rc.createdAt)} (v{rc.version || 1})</span>
                  </div>
                  <p style={{ color: '#f8fafc', fontSize: '0.88rem' }}>{rc.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export ReportDetailPage component
export default ReportDetailPage;
