import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { authFetch } from '../utils/api';

/** Helper date formatter */
const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  return new Date(dateVal).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};


const ManagerReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State storing target report object
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Review decision modal state
  const [reviewStatus, setReviewStatus] = useState('APPROVED'); // 'APPROVED' | 'NEEDS_CORRECTION'
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Fetch report details
  useEffect(() => {
    const loadReport = async () => {
      setIsLoading(true);
      try {
        const res = await authFetch(`/reports/${id}`);
        if (res && res.data) {
          setReport(res.data);
        }
      } catch (error) {
        console.error('Error loading report for review:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [id]);

  // Submit review decision handler
  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    setFeedbackMessage('');

    try {
      await authFetch(`/reports/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: reviewStatus,
          comment: commentText
        })
      });

      setFeedbackMessage(`Report successfully marked as ${reviewStatus}!`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert(error.message || 'Error submitting review decision');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⏳</div>
        <h3>Loading Manager Review Workspace...</h3>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>Report Not Found</h3>
        <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="dept-badge">{report.projectId?.name || 'Project Category'}</span>
          <h2 style={{ fontSize: '1.6rem', marginTop: '6px' }}>
            🔎 Manager Review: Week of {formatDate(report.weekStartDate)}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Submitted by <strong style={{ color: '#f8fafc' }}>{report.userId?.name || 'Team Member'}</strong> ({report.userId?.email})
          </p>
        </div>

        <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '14px', borderRadius: '8px' }}>
          ✅ {feedbackMessage}
        </div>
      )}

      {/* Review Action Control Panel */}
      <div
        className="report-card"
        style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid var(--border-highlight)'
        }}
      >
        <h3 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>⚖️ Review Evaluation & Feedback Panel</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
          Approve this weekly report submission or request changes from the team member with feedback notes.
        </p>

        {/* Status Decision Radio Selector */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
          <button
            type="button"
            className={`btn-secondary ${reviewStatus === 'APPROVED' ? 'active' : ''}`}
            style={{
              flex: 1,
              justify: 'center',
              padding: '12px',
              border: reviewStatus === 'APPROVED' ? '2px solid #10b981' : '1px solid var(--border-light)',
              background: reviewStatus === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: reviewStatus === 'APPROVED' ? '#34d399' : '#94a3b8'
            }}
            onClick={() => setReviewStatus('APPROVED')}
          >
            ✅ Approve Report
          </button>

          <button
            type="button"
            className={`btn-secondary ${reviewStatus === 'NEEDS_CORRECTION' ? 'active' : ''}`}
            style={{
              flex: 1,
              justify: 'center',
              padding: '12px',
              border: reviewStatus === 'NEEDS_CORRECTION' ? '2px solid #f43f5e' : '1px solid var(--border-light)',
              background: reviewStatus === 'NEEDS_CORRECTION' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
              color: reviewStatus === 'NEEDS_CORRECTION' ? '#fb7185' : '#94a3b8'
            }}
            onClick={() => setReviewStatus('NEEDS_CORRECTION')}
          >
            ⚠️ Request Changes (Needs Correction)
          </button>
        </div>

        {/* Manager Comment Input */}
        <div className="form-group" style={{ marginTop: '12px' }}>
          <label className="form-label">Review Feedback Comment / Manager Notes</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder={
              reviewStatus === 'APPROVED'
                ? 'Optional recognition note or feedback for team member...'
                : 'Specify required corrections or missing details...'
            }
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
        </div>

        {/* Submit Review Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            type="button"
            className="btn-primary"
            disabled={isSubmitting}
            onClick={handleSubmitReview}
          >
            {isSubmitting ? 'Submitting Review...' : `Confirm & Save Decision (${reviewStatus})`}
          </button>
        </div>
      </div>

      {/* Submitted Report Content Inspection Box */}
      <div className="report-card" style={{ gap: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#818cf8' }}>📄 Submitted Report Content Inspection</h3>

        {/* Tasks Table */}
        <div>
          <h4 className="detail-section-title">📌 Tasks Breakdown</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15,23,42,0.6)', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '8px' }}>Task Name</th>
                  <th style={{ padding: '8px' }}>Priority</th>
                  <th style={{ padding: '8px' }}>Status</th>
                  <th style={{ padding: '8px' }}>Actual %</th>
                  <th style={{ padding: '8px' }}>Spent</th>
                  <th style={{ padding: '8px' }}>Deliverable</th>
                </tr>
              </thead>
              <tbody>
                {report.tasks && report.tasks.map((task, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '8px', color: '#f8fafc' }}>{task.name}</td>
                    <td style={{ padding: '8px' }}>
                      <span className="dept-badge">{task.priority}</span>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span className={`summary-count ${task.status === 'COMPLETED' ? 'emerald' : 'amber'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>{task.actualPct}%</td>
                    <td style={{ padding: '8px' }}>{task.timeSpent || 0} hrs</td>
                    <td style={{ padding: '8px', color: '#818cf8' }}>{task.deliverable || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Blockers */}
        <div>
          <h4 className="detail-section-title" style={{ color: '#fb7185' }}>⚠️ Blockers & Key Issues</h4>
          {report.blockers && report.blockers.length > 0 ? (
            <ul className="detail-tasks-list">
              {report.blockers.map((b, idx) => (
                <li key={idx} className="detail-task-item">
                  <span>{b.isKeyIssue ? '🔥 [KEY ISSUE] ' : '⚠️ '}</span>
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#34d399', fontSize: '0.88rem' }}>No active blockers reported.</p>
          )}
        </div>

        {/* Achievements */}
        <div>
          <h4 className="detail-section-title" style={{ color: '#34d399' }}>🏆 Achievements</h4>
          {report.achievements && report.achievements.length > 0 ? (
            <ul className="detail-tasks-list">
              {report.achievements.map((a, idx) => (
                <li key={idx} className="detail-task-item">
                  <span>{a.isKeyHighlight ? '🌟 [KEY HIGHLIGHT] ' : '🏆 '}</span>
                  <span>{a.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>No achievements listed.</p>
          )}
        </div>

        {/* Hours Worked */}
        <div>
          <h4 className="detail-section-title">🕒 Hours Breakdown</h4>
          <p style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>
            Dev: {report.hoursWorked?.development || 0} hrs | Testing: {report.hoursWorked?.testing || 0} hrs | Meetings: {report.hoursWorked?.meetings || 0} hrs | Docs: {report.hoursWorked?.documentation || 0} hrs
          </p>
        </div>

        {/* Next Week Plan */}
        {report.nextWeekPlan && (
          <div>
            <h4 className="detail-section-title">🎯 Next Week Plan</h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>{report.nextWeekPlan}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Export ManagerReviewPage component
export default ManagerReviewPage;
