import React, { useState, useEffect } from 'react';

import { authFetch } from '../utils/api';



const AdminProjectsPage = () => {
  // State storing list of projects
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form input states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load projects list
  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/projects');
      if (res && res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Save project form handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      if (editingProjectId) {
        await authFetch(`/projects/${editingProjectId}`, {
          method: 'PUT',
          body: JSON.stringify({ name, description })
        });
        setMessage('Project updated successfully!');
      } else {
        await authFetch('/projects', {
          method: 'POST',
          body: JSON.stringify({ name, description })
        });
        setMessage('New project category created successfully!');
      }

      // Reset form
      setName('');
      setDescription('');
      setEditingProjectId(null);
      loadProjects();

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving project:', err);
      setError(err.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Populate form for editing existing project
  const handleEdit = (project) => {
    setEditingProjectId(project._id);
    setName(project.name);
    setDescription(project.description || '');
  };

  // Toggle archive status
  const handleToggleArchive = async (project) => {
    try {
      await authFetch(`/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: project.name,
          description: project.description,
          isArchived: !project.isArchived
        })
      });
      loadProjects();
    } catch (err) {
      alert(err.message || 'Failed to update archive status');
    }
  };

  // Delete project handler
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project category?')) {
      try {
        await authFetch(`/projects/${id}`, { method: 'DELETE' });
        setMessage('Project deleted successfully');
        loadProjects();
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        alert(err.message || 'Failed to delete project');
      }
    }
  };


  // Cancel edit mode reset handler
  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setName('');
    setDescription('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem' }}>⚙️ Project & Initiative Administration</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Manage workspace project categories for team member weekly report assignments
        </p>
      </div>

      {/* Notification Banner */}
      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '12px', borderRadius: '8px' }}>
          ✅ {message}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', padding: '12px', borderRadius: '8px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Project Form Box */}
      <div className="report-card">
        <h3 style={{ fontSize: '1.15rem' }}>
          {editingProjectId ? '✏️ Edit Project Category' : '➕ Add New Project Category'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Mobile Application v2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Scope, microservice endpoints, or initiative goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            {editingProjectId && (
              <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingProjectId ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>

      {/* Projects Data Table */}
      {isLoading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <h3>Loading Project Categories...</h3>
        </div>
      ) : (
        <div className="report-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.7)', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '14px 18px' }}>Project Name</th>
                  <th style={{ padding: '14px 18px' }}>Description</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <strong style={{ color: '#f8fafc' }}>{project.name}</strong>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1', maxWidth: '300px' }}>
                      {project.description || '—'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`status-pill ${project.isArchived ? 'draft' : 'approved'}`}>
                        {project.isArchived ? 'Archived' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                          onClick={() => handleToggleArchive(project)}
                        >
                          {project.isArchived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleEdit(project)}
                          title="Edit Project"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn-icon delete"
                          onClick={() => handleDelete(project._id)}
                          title="Delete Project"
                        >
                          🗑️
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

// Export AdminProjectsPage component
export default AdminProjectsPage;
