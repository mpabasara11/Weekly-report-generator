// Import Project Mongoose model
const Project = require('../models/Project');

// Fallback memory store array for projects
let memoryProjects = [
  {
    _id: 'proj-1',
    name: 'E-Commerce Core Platform',
    description: 'Core storefront, payment checkout gateway, and inventory catalog microservices.',
    isArchived: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'proj-2',
    name: 'Analytics Dashboard',
    description: 'Real-time metrics pipeline, data reporting visualizations, and manager telemetry.',
    isArchived: false,
    createdAt: new Date().toISOString()
  }
];

// Helper to check MongoDB connection state
const isMongoConnected = () => {
  return Project.db && Project.db.readyState === 1;
};

// ==========================================
// CONTROLLER: GET /api/projects
// DESCRIPTION: Get all projects (accessible by both Team Members & Managers)
// ==========================================
const getProjects = async (req, res) => {
  try {
    if (isMongoConnected()) {
      // Query projects from database collection
      const projects = await Project.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: projects.length, data: projects });
    } else {
      // Return memory projects array
      return res.status(200).json({ success: true, count: memoryProjects.length, data: memoryProjects });
    }
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

    if (isMongoConnected()) {
      const newProject = new Project({ name, description: description || '', isArchived: false });
      const savedProject = await newProject.save();
      return res.status(201).json({ success: true, message: 'Project created successfully', data: savedProject });
    } else {
      const newMemoryProject = {
        _id: 'proj-' + Date.now(),
        name,
        description: description || '',
        isArchived: false,
        createdAt: new Date().toISOString()
      };
      memoryProjects.unshift(newMemoryProject);
      return res.status(201).json({ success: true, message: 'Project created successfully (In-Memory)', data: newMemoryProject });
    }
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

    if (isMongoConnected()) {
      const updatedProject = await Project.findByIdAndUpdate(
        id,
        { name, description, isArchived },
        { new: true, runValidators: true }
      );
      if (!updatedProject) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      return res.status(200).json({ success: true, message: 'Project updated successfully', data: updatedProject });
    } else {
      const index = memoryProjects.findIndex((p) => p._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      memoryProjects[index] = {
        ...memoryProjects[index],
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isArchived !== undefined && { isArchived }),
        updatedAt: new Date().toISOString()
      };
      return res.status(200).json({ success: true, message: 'Project updated successfully (In-Memory)', data: memoryProjects[index] });
    }
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

    if (isMongoConnected()) {
      const deletedProject = await Project.findByIdAndDelete(id);
      if (!deletedProject) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      return res.status(200).json({ success: true, message: 'Project deleted successfully' });
    } else {
      const index = memoryProjects.findIndex((p) => p._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      memoryProjects.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Project deleted successfully (In-Memory)' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete project', error: error.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  memoryProjects
};
