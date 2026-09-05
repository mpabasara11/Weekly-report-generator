// Import Express framework and instantiate router handle
const express = require('express');
const router = express.Router();

// Import project controller handlers (role-based authorization checks enforced directly inside controllers)
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

// GET /api/projects - Get list of active projects (Accessible by authenticated users via server.js middleware)
router.get('/', getProjects);

// POST /api/projects - Create new project category (Manager role enforced in controller)
router.post('/', createProject);

// PUT /api/projects/:id - Update project metadata or archive status (Manager role enforced in controller)
router.put('/:id', updateProject);

// DELETE /api/projects/:id - Delete project entry (Manager role enforced in controller)
router.delete('/:id', deleteProject);

// Export router configuration module
module.exports = router;
