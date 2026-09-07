// Import React core library and hooks
import React, { useState, useEffect } from 'react';

// Import useParams, useNavigate from react-router-dom
import { useParams, useNavigate } from 'react-router-dom';

// Import authFetch utility
import { authFetch } from '../utils/api';

/**
 * ReportFormPage Component rendering interactive report editor & creation form
 * @returns {JSX.Element} Rendered form page JSX
 */
const ReportFormPage = () => {
  // Extract id parameter from URL route params (if present, mode is EDIT, else CREATE)
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Instantiate navigate hook
  const navigate = useNavigate();

  // State 1: Projects list array for dropdown
  const [projects, setProjects] = useState([]);

  // State 2: Main form values
  const [projectId, setProjectId] = useState('');
  const [weekStartDate, setWeekStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextWeekPlan, setNextWeekPlan] = useState('');

  // State 3: Hours worked object
  const [hoursWorked, setHoursWorked] = useState({
    development: 0,
    testing: 0,
    meetings: 0,
    documentation: 0
  });

  // State 4: Structured items list arrays
  const [tasks, setTasks] = useState([
    {
      name: '',
      priority: 'MEDIUM',
      plannedPct: 100,
      actualPct: 0,
      status: 'IN_PROGRESS',
      timePlanned: 8,
      timeSpent: 0,
      deliverable: ''
    }
  ]);

  const [blockers, setBlockers] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Input states for appending new blocker/achievement items
  const [newBlockerText, setNewBlockerText] = useState('');
  const [newBlockerIsKey, setNewBlockerIsKey] = useState(false);

  const [newAchievementText, setNewAchievementText] = useState('');
  const [newAchievementIsKey, setNewAchievementIsKey] = useState(false);

  // Loading and submit states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load available projects and initial report data if in edit mode
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch projects list
        const projRes = await authFetch('/projects');
        if (projRes && projRes.data) {
          setProjects(projRes.data);
          if (!projectId && projRes.data.length > 0) {
            setProjectId(projRes.data[0]._id);
          }
        }

        // If edit mode, fetch target report data
        if (isEditMode) {
          const reportRes = await authFetch(`/reports/${id}`);
          if (reportRes && reportRes.data) {
            const r = reportRes.data;
            setProjectId(r.projectId?._id || r.projectId || '');
            setWeekStartDate(r.weekStartDate ? new Date(r.weekStartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            setNextWeekPlan(r.nextWeekPlan || '');
            if (r.hoursWorked) setHoursWorked(r.hoursWorked);
            if (r.tasks && r.tasks.length > 0) setTasks(r.tasks);
            if (r.blockers) setBlockers(r.blockers);
            if (r.achievements) setAchievements(r.achievements);
          }
        }
      } catch (err) {
        console.error('Error loading report form data:', err);
        setError('Failed to load initial form data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [id, isEditMode]);

  // Tasks handlers
  const handleTaskChange = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleAddTask = () => {
    setTasks((prev) => [
      ...prev,
      {
        name: '',
        priority: 'MEDIUM',
        plannedPct: 100,
        actualPct: 0,
        status: 'IN_PROGRESS',
        timePlanned: 8,
        timeSpent: 0,
        deliverable: ''
      }
    ]);
  };

  const handleRemoveTask = (index) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  // Blockers handlers
  const handleAddBlocker = () => {
    if (newBlockerText.trim()) {
      setBlockers((prev) => [...prev, { text: newBlockerText.trim(), isKeyIssue: newBlockerIsKey }]);
      setNewBlockerText('');
      setNewBlockerIsKey(false);
    }
  };

  const handleRemoveBlocker = (index) => {
    setBlockers((prev) => prev.filter((_, i) => i !== index));
  };

  // Achievements handlers
  const handleAddAchievement = () => {
    if (newAchievementText.trim()) {
      setAchievements((prev) => [...prev, { text: newAchievementText.trim(), isHighlight: newAchievementIsKey }]);
      setNewAchievementText('');
      setNewAchievementIsKey(false);
    }
  };

  const handleRemoveAchievement = (index) => {
    setAchievements((prev) => prev.filter((_, i) => i !== index));
  };

  // Save the report as a draft or submit it to the manager.
  const handleSave = async (status) => {
    if (!projectId) {
      alert('Please select a Project Category');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const payload = {
      projectId,
      weekStartDate,
      status,
      tasks: tasks.filter((t) => t.name.trim() !== ''),
      nextWeekPlan,
      blockers,
      achievements,
      hoursWorked: {
        development: Number(hoursWorked.development) || 0,
        testing: Number(hoursWorked.testing) || 0,
        meetings: Number(hoursWorked.meetings) || 0,
        documentation: Number(hoursWorked.documentation) || 0
      }
    };

    try {
      if (isEditMode) {
        await authFetch(`/reports/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await authFetch('/reports', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      navigate('/my-reports');
    } catch (err) {
      console.error('Error saving report:', err);
      setError(err.message || 'Failed to save weekly report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⏳</div>
        <h3>Loading Weekly Report Form...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem' }}>
            {isEditMode ? '✏️ Edit Weekly Report' : '➕ Create New Weekly Report'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Document your completed tasks, blockers, achievements, and hours breakdown
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={() => navigate('/my-reports')}>
          ← Back to My Reports
        </button>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', padding: '12px', borderRadius: '8px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Form Box */}
      <div className="report-card" style={{ gap: '24px' }}>
        {/* Section 1: Basic Info (Project & Week Start Date) */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Project Category *</label>
            <select
              className="form-select"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="">-- Select Project --</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Week Start Date *</label>
            <input
              type="date"
              className="form-input"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Section 2: Dynamic Tasks Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#f8fafc' }}>📌 Weekly Tasks Breakdown</h4>
            <button type="button" className="btn-add-item" onClick={handleAddTask}>
              + Add Task Row
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15,23,42,0.6)', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '10px' }}>Task Name</th>
                  <th style={{ padding: '10px', width: '110px' }}>Priority</th>
                  <th style={{ padding: '10px', width: '130px' }}>Status</th>
                  <th style={{ padding: '10px', width: '90px' }}>Actual %</th>
                  <th style={{ padding: '10px', width: '90px' }}>Time (hrs)</th>
                  <th style={{ padding: '10px' }}>Deliverable PR/Link</th>
                  <th style={{ padding: '10px', width: '50px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Task title description..."
                        value={task.name}
                        onChange={(e) => handleTaskChange(idx, 'name', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <select
                        className="form-select"
                        value={task.priority}
                        onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                      >
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <select
                        className="form-select"
                        value={task.status}
                        onChange={(e) => handleTaskChange(idx, 'status', e.target.value)}
                      >
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="BLOCKED">BLOCKED</option>
                        <option value="NOT_STARTED">NOT_STARTED</option>
                      </select>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        max="100"
                        value={task.actualPct}
                        onChange={(e) => handleTaskChange(idx, 'actualPct', Number(e.target.value))}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        value={task.timeSpent}
                        onChange={(e) => handleTaskChange(idx, 'timeSpent', Number(e.target.value))}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="http://..."
                        value={task.deliverable}
                        onChange={(e) => handleTaskChange(idx, 'deliverable', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-remove-pill"
                        onClick={() => handleRemoveTask(idx)}
                        title="Remove Task Row"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Blockers with isKeyIssue toggle */}
        <div className="task-builder-section">
          <label className="form-label" style={{ color: '#fb7185' }}>
            ⚠️ Blockers & Impediments
          </label>
          <div className="task-input-row">
            <input
              type="text"
              className="form-input"
              placeholder="Describe obstacle..."
              value={newBlockerText}
              onChange={(e) => setNewBlockerText(e.target.value)}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#fb7185', whiteSpace: 'nowrap' }}>
              <input
                type="checkbox"
                checked={newBlockerIsKey}
                onChange={(e) => setNewBlockerIsKey(e.target.checked)}
              />
              Key Issue?
            </label>
            <button type="button" className="btn-add-item" onClick={handleAddBlocker}>
              + Add Blocker
            </button>
          </div>

          <div className="task-items-list">
            {blockers.map((b, idx) => (
              <div key={idx} className="task-item-pill">
                <span>
                  {b.isKeyIssue ? '🔥 [KEY ISSUE] ' : '⚠️ '} {b.text}
                </span>
                <button type="button" className="btn-remove-pill" onClick={() => handleRemoveBlocker(idx)}>
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Achievements with isKeyHighlight toggle */}
        <div className="task-builder-section">
          <label className="form-label" style={{ color: '#34d399' }}>
            🏆 Key Achievements & Accomplishments
          </label>
          <div className="task-input-row">
            <input
              type="text"
              className="form-input"
              placeholder="Describe achievement..."
              value={newAchievementText}
              onChange={(e) => setNewAchievementText(e.target.value)}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#34d399', whiteSpace: 'nowrap' }}>
              <input
                type="checkbox"
                checked={newAchievementIsKey}
                onChange={(e) => setNewAchievementIsKey(e.target.checked)}
              />
              Key Highlight?
            </label>
            <button type="button" className="btn-add-item" onClick={handleAddAchievement}>
              + Add Achievement
            </button>
          </div>

          <div className="task-items-list">
            {achievements.map((a, idx) => (
              <div key={idx} className="task-item-pill">
                <span>
                  {a.isKeyHighlight ? '🌟 [KEY HIGHLIGHT] ' : '🏆 '} {a.text}
                </span>
                <button type="button" className="btn-remove-pill" onClick={() => handleRemoveAchievement(idx)}>
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Hours Worked Breakdown Grid */}
        <div>
          <h4 style={{ fontSize: '1.05rem', color: '#f8fafc', marginBottom: '12px' }}>
            🕒 Hours Worked Breakdown
          </h4>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Development (hrs)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={hoursWorked.development}
                onChange={(e) => setHoursWorked({ ...hoursWorked, development: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Testing (hrs)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={hoursWorked.testing}
                onChange={(e) => setHoursWorked({ ...hoursWorked, testing: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Meetings (hrs)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={hoursWorked.meetings}
                onChange={(e) => setHoursWorked({ ...hoursWorked, meetings: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Documentation (hrs)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={hoursWorked.documentation}
                onChange={(e) => setHoursWorked({ ...hoursWorked, documentation: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Section 6: Next Week Planned Goals */}
        <div className="form-group">
          <label className="form-label">🎯 Next Week Planned Goals</label>
          <textarea
            className="form-textarea"
            placeholder="Outline main goals and planned focus areas for next week..."
            value={nextWeekPlan}
            onChange={(e) => setNextWeekPlan(e.target.value)}
          />
        </div>

        {/* Action Buttons Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate('/my-reports')}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={isSubmitting}
            onClick={() => handleSave('DRAFT')}
          >
            💾 Save Draft
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={isSubmitting}
            onClick={() => handleSave('SUBMITTED')}
          >
            🚀 Submit to Manager
          </button>
        </div>
      </div>
    </div>
  );
};

// Export ReportFormPage component
export default ReportFormPage;
