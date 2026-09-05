// Import React core library and hooks
import React, { useState, useEffect } from 'react';

/**
 * ReportModal Component rendering interactive create/edit form with dynamic item builders
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Controls modal visibility state
 * @param {Function} props.onClose - Modal close event handler
 * @param {Function} props.onSave - Form submit save callback handler
 * @param {Object} props.initialData - Report object to prefill when editing, or null when creating
 * @returns {JSX.Element|null} Rendered Modal window or null when closed
 */
const ReportModal = ({ isOpen, onClose, onSave, initialData }) => {
  // Main form state object storing all controlled form values
  const [formData, setFormData] = useState({
    title: '',
    authorName: '',
    role: '',
    department: 'Engineering',
    weekEndDate: new Date().toISOString().split('T')[0],
    status: 'Submitted',
    productivityRating: 4,
    summaryNotes: ''
  });

  // Dynamic task lists state arrays
  const [completedTasks, setCompletedTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [blockers, setBlockers] = useState([]);
  const [nextWeekGoals, setNextWeekGoals] = useState([]);

  // Single item input text states for adding new items dynamically
  const [newCompleted, setNewCompleted] = useState('');
  const [newInProgress, setNewInProgress] = useState('');
  const [newBlocker, setNewBlocker] = useState('');
  const [newGoal, setNewGoal] = useState('');

  // Form submission loading state indicator
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form state when modal opens or initialData prop changes
  useEffect(() => {
    if (initialData) {
      // Prefill form values with existing report data for editing
      setFormData({
        title: initialData.title || '',
        authorName: initialData.authorName || '',
        role: initialData.role || '',
        department: initialData.department || 'Engineering',
        weekEndDate: initialData.weekEndDate ? new Date(initialData.weekEndDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: initialData.status || 'Submitted',
        productivityRating: initialData.productivityRating || 4,
        summaryNotes: initialData.summaryNotes || ''
      });
      // Set task array lists from initialData
      setCompletedTasks(initialData.completedTasks || []);
      setInProgressTasks(initialData.inProgressTasks || []);
      setBlockers(initialData.blockers || []);
      setNextWeekGoals(initialData.nextWeekGoals || []);
    } else {
      // Reset form to blank default state for new report creation
      setFormData({
        title: '',
        authorName: '',
        role: '',
        department: 'Engineering',
        weekEndDate: new Date().toISOString().split('T')[0],
        status: 'Submitted',
        productivityRating: 4,
        summaryNotes: ''
      });
      setCompletedTasks([]);
      setInProgressTasks([]);
      setBlockers([]);
      setNextWeekGoals([]);
    }
  }, [initialData, isOpen]);

  // Return null if modal is not open
  if (!isOpen) return null;

  // Handle generic input change event for text, select, and number inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler functions to append new items to specific task lists
  const handleAddCompleted = () => {
    if (newCompleted.trim()) {
      setCompletedTasks((prev) => [...prev, newCompleted.trim()]);
      setNewCompleted(''); // Reset single input box
    }
  };

  const handleAddInProgress = () => {
    if (newInProgress.trim()) {
      setInProgressTasks((prev) => [...prev, newInProgress.trim()]);
      setNewInProgress('');
    }
  };

  const handleAddBlocker = () => {
    if (newBlocker.trim()) {
      setBlockers((prev) => [...prev, newBlocker.trim()]);
      setNewBlocker('');
    }
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setNextWeekGoals((prev) => [...prev, newGoal.trim()]);
      setNewGoal('');
    }
  };

  // Handler functions to remove item at specific index from task lists
  const removeItem = (listSetter, index) => {
    listSetter((prev) => prev.filter((_, i) => i !== index));
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form refresh

    // Basic validation check
    if (!formData.title.trim() || !formData.authorName.trim() || !formData.role.trim()) {
      alert('Please fill out Title, Author Name, and Role fields.');
      return;
    }

    // Set loading indicator
    setIsSubmitting(true);

    // Assemble complete payload object
    const payload = {
      ...formData,
      productivityRating: Number(formData.productivityRating),
      completedTasks,
      inProgressTasks,
      blockers,
      nextWeekGoals
    };

    try {
      // Execute parent save callback function
      await onSave(payload);
      // Close modal upon successful save
      onClose();
    } catch (error) {
      console.error('Failed to submit report modal form:', error);
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal Dialog Window Container (Stop propagation prevents backdrop click close) */}
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header Bar */}
        <div className="modal-header">
          <h2 className="modal-title">
            {initialData ? '✏️ Edit Weekly Report' : '➕ Create Weekly Report'}
          </h2>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {/* Modal Form Content Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Row 1: Report Title Input */}
          <div className="form-group">
            <label className="form-label">Report Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Sprint 14 Accomplishments & API Launch"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Row 2: Author Name, Role, & Department */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Author Name *</label>
              <input
                type="text"
                name="authorName"
                className="form-input"
                placeholder="e.g. Alex Rivera"
                value={formData.authorName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Role *</label>
              <input
                type="text"
                name="role"
                className="form-input"
                placeholder="e.g. Full Stack Engineer"
                value={formData.role}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR</option>
              </select>
            </div>
          </div>

          {/* Row 3: Week End Date, Status, Productivity Rating */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Week Ending Date</label>
              <input
                type="date"
                name="weekEndDate"
                className="form-input"
                value={formData.weekEndDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Report Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Productivity Rating (1-5)</label>
              <select
                name="productivityRating"
                className="form-select"
                value={formData.productivityRating}
                onChange={handleChange}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Great Progress)</option>
                <option value={3}>⭐⭐⭐ (3 - On Track)</option>
                <option value={2}>⭐⭐ (2 - Moderate Blockers)</option>
                <option value={1}>⭐ (1 - Major Delays)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Builder 1: Completed Tasks */}
          <div className="task-builder-section">
            <label className="form-label" style={{ color: '#34d399' }}>
              ✓ Completed Tasks
            </label>
            <div className="task-input-row">
              <input
                type="text"
                className="form-input"
                placeholder="Add a finished objective..."
                value={newCompleted}
                onChange={(e) => setNewCompleted(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCompleted())}
              />
              <button type="button" className="btn-add-item" onClick={handleAddCompleted}>
                + Add
              </button>
            </div>
            {/* Added Completed Items Pills */}
            <div className="task-items-list">
              {completedTasks.map((task, idx) => (
                <div key={idx} className="task-item-pill">
                  <span>✓ {task}</span>
                  <button
                    type="button"
                    className="btn-remove-pill"
                    onClick={() => removeItem(setCompletedTasks, idx)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Builder 2: Tasks In Progress */}
          <div className="task-builder-section">
            <label className="form-label" style={{ color: '#fbbf24' }}>
              ⏳ Tasks In Progress
            </label>
            <div className="task-input-row">
              <input
                type="text"
                className="form-input"
                placeholder="Add an ongoing task..."
                value={newInProgress}
                onChange={(e) => setNewInProgress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInProgress())}
              />
              <button type="button" className="btn-add-item" onClick={handleAddInProgress}>
                + Add
              </button>
            </div>
            <div className="task-items-list">
              {inProgressTasks.map((task, idx) => (
                <div key={idx} className="task-item-pill">
                  <span>⏳ {task}</span>
                  <button
                    type="button"
                    className="btn-remove-pill"
                    onClick={() => removeItem(setInProgressTasks, idx)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Builder 3: Blockers / Challenges */}
          <div className="task-builder-section">
            <label className="form-label" style={{ color: '#fb7185' }}>
              ⚠️ Blockers & Impediments
            </label>
            <div className="task-input-row">
              <input
                type="text"
                className="form-input"
                placeholder="Add an obstacle or risk..."
                value={newBlocker}
                onChange={(e) => setNewBlocker(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBlocker())}
              />
              <button type="button" className="btn-add-item" onClick={handleAddBlocker}>
                + Add
              </button>
            </div>
            <div className="task-items-list">
              {blockers.map((task, idx) => (
                <div key={idx} className="task-item-pill">
                  <span>⚠️ {task}</span>
                  <button
                    type="button"
                    className="btn-remove-pill"
                    onClick={() => removeItem(setBlockers, idx)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Builder 4: Next Week Goals */}
          <div className="task-builder-section">
            <label className="form-label" style={{ color: '#818cf8' }}>
              🎯 Next Week Planned Goals
            </label>
            <div className="task-input-row">
              <input
                type="text"
                className="form-input"
                placeholder="Add upcoming target objective..."
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGoal())}
              />
              <button type="button" className="btn-add-item" onClick={handleAddGoal}>
                + Add
              </button>
            </div>
            <div className="task-items-list">
              {nextWeekGoals.map((task, idx) => (
                <div key={idx} className="task-item-pill">
                  <span>🎯 {task}</span>
                  <button
                    type="button"
                    className="btn-remove-pill"
                    onClick={() => removeItem(setNextWeekGoals, idx)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Notes Textarea */}
          <div className="form-group">
            <label className="form-label">Key Takeaways & Summary Notes</label>
            <textarea
              name="summaryNotes"
              className="form-textarea"
              placeholder="Additional comments or managerial summary notes..."
              value={formData.summaryNotes}
              onChange={handleChange}
            />
          </div>

          {/* Modal Action Buttons Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update Report' : 'Save Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Export ReportModal component for form rendering
export default ReportModal;
