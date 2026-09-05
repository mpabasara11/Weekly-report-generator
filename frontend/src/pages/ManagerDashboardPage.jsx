import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { authFetch } from '../utils/api';

/** Helper function to format date */
const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  return new Date(dateVal).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/** Helper function for status pill badge styling */
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
 * ManagerDashboardPage Component rendering team analytics, summary cards, and review queues
 * @returns {JSX.Element} Rendered Manager Dashboard page JSX
 */
const ManagerDashboardPage = () => {
  // State storing team reports array
  const [reports, setReports] = useState([]);
  // State storing projects list array
  const [projects, setProjects] = useState([]);

  // Filter parameter states
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState('ALL');

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Instantiate navigate hook
  const navigate = useNavigate();

  // Load team reports and projects list
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch projects list
      const projRes = await authFetch('/projects');
      if (projRes && projRes.data) {
        setProjects(projRes.data);
      }

      // Fetch filtered team reports
      const params = new URLSearchParams();
      if (selectedProject && selectedProject !== 'ALL') params.append('project', selectedProject);
      if (selectedStatus && selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedMember && selectedMember !== 'ALL') params.append('member', selectedMember);

      const query = params.toString() ? `?${params.toString()}` : '';
      const reportRes = await authFetch(`/reports/team${query}`);

      if (reportRes && reportRes.data) {
        setReports(reportRes.data);
      }
    } catch (error) {
      console.error('Error fetching manager dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, selectedStatus, selectedMember]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);


  // Compute analytics card totals
  const totalTeamReports = reports.length;
  const submittedCount = reports.filter((r) => r.status === 'SUBMITTED').length;
  const needsCorrectionCount = reports.filter((r) => r.status === 'NEEDS_CORRECTION').length;
  const approvedCount = reports.filter((r) => r.status === 'APPROVED').length;
  const keyBlockersCount = reports.reduce(
    (acc, r) => acc + (r.blockers ? r.blockers.filter((b) => b.isKeyIssue).length : 0),
    0
  );

  // Extract unique team members list for filter dropdown
  const uniqueMembers = Array.from(
    new Set(
      reports
        .map((r) => r.userId)
        .filter(Boolean)
        .map((u) => JSON.stringify({ id: u._id || u.id, name: u.name }))
    )
  ).map((s) => JSON.parse(s));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem' }}>👑 Manager Analytics & Review Control Center</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Overview of team weekly performance, pending review queues, and blocker tracking
        </p>
      </div>

      {/* Analytics Summary Metric Cards Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box indigo">📁</div>
          <div>
            <div className="stat-value">{totalTeamReports}</div>
            <div className="stat-label">Total Reports</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box amber">⏳</div>
          <div>
            <div className="stat-value">{submittedCount}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box rose">⚠️</div>
          <div>
            <div className="stat-value">{needsCorrectionCount}</div>
            <div className="stat-label">Needs Correction</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box emerald">✅</div>
          <div>
            <div className="stat-value">{approvedCount}</div>
            <div className="stat-label">Approved Reports</div>
          </div>
        </div>
      </section>

      {/* Filter Control Toolbar */}
      <div className="filter-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>
          <span>🔍 Filter Team Queue:</span>
        </div>

        <div className="filter-controls">
          {/* Project Filter */}
          <select
            className="filter-select"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="ALL">🏢 All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                🏢 {p.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">📌 All Statuses</option>
            <option value="SUBMITTED">⏳ SUBMITTED (Pending)</option>
            <option value="NEEDS_CORRECTION">⚠️ NEEDS CORRECTION</option>
            <option value="APPROVED">✅ APPROVED</option>
            <option value="DRAFT">📝 DRAFT</option>
          </select>

          {/* Member Filter */}
          <select
            className="filter-select"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
          >
            <option value="ALL">👤 All Team Members</option>
            {uniqueMembers.map((m) => (
              <option key={m.id} value={m.id}>
                👤 {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Reports Data Table */}
      {isLoading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <h3>Loading Team Reports Dashboard...</h3>
        </div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No Team Reports Match Filter</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Adjust your project, status, or member filter parameters.
          </p>
        </div>
      ) : (
        <div className="report-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.7)', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '14px 18px' }}>Team Member</th>
                  <th style={{ padding: '14px 18px' }}>Project</th>
                  <th style={{ padding: '14px 18px' }}>Week Date</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px' }}>Tasks Completed</th>
                  <th style={{ padding: '14px 18px' }}>Blockers</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <strong style={{ color: '#f8fafc' }}>
                        {report.userId?.name || report.userInfo?.name || 'Team Member'}
                      </strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {report.userId?.email || report.userInfo?.email || ''}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="dept-badge">{report.projectId?.name || 'Project'}</span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                      {formatDate(report.weekStartDate)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`status-pill ${getStatusClass(report.status)}`}>
                        • {report.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="summary-count emerald">
                        {report.tasks ? report.tasks.filter((t) => t.status === 'COMPLETED').length : 0} / {report.tasks ? report.tasks.length : 0}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`summary-count ${report.blockers && report.blockers.some((b) => b.isKeyIssue) ? 'rose' : ''}`}>
                        {report.blockers ? report.blockers.length : 0}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {/* Direct link to Manager Review page if SUBMITTED or NEEDS_CORRECTION */}
                        {['SUBMITTED', 'NEEDS_CORRECTION', 'APPROVED'].includes(report.status) && (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => navigate(`/manager/review/${report._id}`)}
                          >
                            🔎 Review Report
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => navigate(`/report/${report._id}`)}
                        >
                          👁️ View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Export ManagerDashboardPage component
export default ManagerDashboardPage;
