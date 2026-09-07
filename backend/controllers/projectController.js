// Import Project Mongoose model
const Project = require('../models/Project');

// ==========================================
// CONTROLLER: GET /api/projects
// DESCRIPTION: Get all projects (accessible by both Team Members & Managers)
// ==========================================
const getProjects = async (req, res) => {
  try {
    // Query projects from database collection
    const projects = await Project.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch projects', error: error.message });
  }
};

// ==========================================
// CONTROLLER: POST /api/projects
// DESCRIPTION: Create a new project (Manager Only)
// ==========================================
const createProject = async (req, res) => {
  try {
    // Role-based authorization check: Verify authenticated user has MANAGER role at top of controller
    if (!req.user || req.user.role !== 'MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Manager role required to create new project categories.'
      });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const newProject = new Project({ name, description: description || '', isArchived: false });
    const savedProject = await newProject.save();
    return res.status(201).json({ success: true, message: 'Project created successfully', data: savedProject });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Failed to create project', error: error.message });
  }
};

// ==========================================
// CONTROLLER: PUT /api/projects/:id
// DESCRIPTION: Update project details or archive status (Manager Only)
// ==========================================
const updateProject = async (req, res) => {
  try {
    // Role-based authorization check: Verify authenticated user has MANAGER role at top of controller
    if (!req.user || req.user.role !== 'MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Manager role required to update project categories.'
      });
    }

    const { id } = req.params;
    const { name, description, isArchived } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { name, description, isArchived },
      { new: true, runValidators: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    return res.status(200).json({ success: true, message: 'Project updated successfully', data: updatedProject });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Failed to update project', error: error.message });
  }
};

// ==========================================
// CONTROLLER: DELETE /api/projects/:id
// DESCRIPTION: Delete project entry (Manager Only)
// ==========================================
const deleteProject = async (req, res) => {
  try {
    // Role-based authorization check: Verify authenticated user has MANAGER role at top of controller
    if (!req.user || req.user.role !== 'MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Manager role required to delete project categories.'
      });
    }

    const { id } = req.params;

    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    return res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete project', error: error.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject
};
