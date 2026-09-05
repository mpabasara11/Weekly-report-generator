// Import Report Mongoose model
const Report = require('../models/Report');

// Import User and Project Mongoose models for population checks
const User = require('../models/User');
const Project = require('../models/Project');

// Fallback in-memory reports store array for offline previewing
let memoryReports = [];

// Helper function checking MongoDB Mongoose connection state
const isMongoConnected = () => {
  return Report.db && Report.db.readyState === 1;
};

// ==========================================
// CONTROLLER: POST /api/reports
// DESCRIPTION: Save a new weekly report (default status DRAFT or SUBMITTED)
// ==========================================
const createReport = async (req, res) => {
  try {
    // Extract authenticated user ID from req.user (attached by auth middleware)
    const userId = req.user.id;

    // Destructure report attributes from JSON request payload
    const {
      weekStartDate,
      projectId,
      tasks,
      nextWeekPlan,
      blockers,
      achievements,
      hoursWorked,
      status
    } = req.body;

    // Validate required fields
    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID reference is required' });
    }

    // Default status to DRAFT if not explicitly submitted
    const assignedStatus = status === 'SUBMITTED' ? 'SUBMITTED' : 'DRAFT';

    if (isMongoConnected()) {
      // Create new Report document instance
      const newReport = new Report({
        userId,
        weekStartDate: weekStartDate ? new Date(weekStartDate) : new Date(),
        projectId,
        status: assignedStatus,
        tasks: Array.isArray(tasks) ? tasks : [],
        nextWeekPlan: nextWeekPlan || '',
        blockers: Array.isArray(blockers) ? blockers : [],
        achievements: Array.isArray(achievements) ? achievements : [],
        hoursWorked: hoursWorked || { development: 0, testing: 0, meetings: 0, documentation: 0 },
        reviewComments: [],
        versions: [] // Initialize empty versions snapshot array
      });

      // Save report document into MongoDB
      const savedReport = await newReport.save();
      await savedReport.populate('userId', 'name email role');
      await savedReport.populate('projectId', 'name description');

      return res.status(201).json({
        success: true,
        message: `Report created successfully as ${assignedStatus}`,
        data: savedReport
      });
    } else {
      // In-Memory Fallback mode
      const memoryReport = {
        _id: 'report-' + Date.now(),
        userId,
        userInfo: { id: userId, name: req.user.name, email: req.user.email, role: req.user.role },
        weekStartDate: weekStartDate ? new Date(weekStartDate).toISOString() : new Date().toISOString(),
        projectId,
        projectInfo: { id: projectId, name: 'Project Category' },
        status: assignedStatus,
        tasks: Array.isArray(tasks) ? tasks : [],
        nextWeekPlan: nextWeekPlan || '',
        blockers: Array.isArray(blockers) ? blockers : [],
        achievements: Array.isArray(achievements) ? achievements : [],
        hoursWorked: hoursWorked || { development: 0, testing: 0, meetings: 0, documentation: 0 },
        reviewComments: [],
        versions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      memoryReports.unshift(memoryReport);

      return res.status(201).json({
        success: true,
        message: `Report created successfully as ${assignedStatus} (In-Memory)`,
        data: memoryReport
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Failed to create weekly report',
      error: error.message
    });
  }
};

// ==========================================
// CONTROLLER: GET /api/reports/my
// DESCRIPTION: Fetch authenticated team member's own submitted/draft reports
// ==========================================
const getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;

    if (isMongoConnected()) {
      // Query MongoDB database for reports matching user ID
      const reports = await Report.find({ userId })
        .populate('userId', 'name email role')
        .populate('projectId', 'name description')
        .sort({ weekStartDate: -1 });

      return res.status(200).json({ success: true, count: reports.length, data: reports });
    } else {
      // Filter memory store by userId
      const filtered = memoryReports.filter((r) => String(r.userId) === String(userId));
      filtered.sort((a, b) => new Date(b.weekStartDate) - new Date(a.weekStartDate));
      return res.status(200).json({ success: true, count: filtered.length, data: filtered });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch personal reports',
      error: error.message
    });
  }
};

// ==========================================
// CONTROLLER: GET /api/reports/team
// DESCRIPTION: Get all team reports (Manager Only) with query filters
// ==========================================
const getTeamReports = async (req, res) => {
  try {
    // Role-based authorization check: Verify authenticated user has MANAGER role at top of controller
    if (!req.user || req.user.role !== 'MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Manager role required to access team analytics dashboard.'
      });
    }

    const { week, project, status, member } = req.query;

    if (isMongoConnected()) {
      const filter = {};

      if (status && status !== 'ALL') {
        filter.status = status;
      }
      if (project && project !== 'ALL') {
        filter.projectId = project;
      }
      if (member && member !== 'ALL') {
        filter.userId = member;
      }

      const reports = await Report.find(filter)
        .populate('userId', 'name email role')
        .populate('projectId', 'name description')
        .sort({ weekStartDate: -1 });

      return res.status(200).json({ success: true, count: reports.length, data: reports });
    } else {
      let filtered = [...memoryReports];

      if (status && status !== 'ALL') {
        filtered = filtered.filter((r) => r.status === status);
      }
      if (project && project !== 'ALL') {
        filtered = filtered.filter((r) => String(r.projectId) === String(project));
      }
      if (member && member !== 'ALL') {
        filtered = filtered.filter((r) => String(r.userId) === String(member));
      }

      filtered.sort((a, b) => new Date(b.weekStartDate) - new Date(a.weekStartDate));

      return res.status(200).json({ success: true, count: filtered.length, data: filtered });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch team reports',
      error: error.message
    });
  }
};

// ==========================================
// CONTROLLER: GET /api/reports/:id
// DESCRIPTION: Get single report details by ID with populated info & versions
// ==========================================
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const report = await Report.findById(id)
        .populate('userId', 'name email role')
        .populate('projectId', 'name description')
        .populate('reviewComments.managerId', 'name email');

      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      return res.status(200).json({ success: true, data: report });
    } else {
      const report = memoryReports.find((r) => String(r._id) === String(id));
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }
      return res.status(200).json({ success: true, data: report });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch report details',
      error: error.message
    });
  }
};

// ==========================================
// CONTROLLER: PUT /api/reports/:id
// DESCRIPTION: Update report content (pushes snapshot to versions array before modifying)
// ==========================================
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const {
      weekStartDate,
      projectId,
      tasks,
      nextWeekPlan,
      blockers,
      achievements,
      hoursWorked,
      status
    } = req.body;

    if (isMongoConnected()) {
      // Find existing report document
      const report = await Report.findById(id);

      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      // Check ownership (must be report author or manager)
      if (String(report.userId) !== String(userId) && req.user.role !== 'MANAGER') {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this report' });
      }

      // Create snapshot object of current state before modification
      const snapshot = {
        versionNumber: (report.versions ? report.versions.length : 0) + 1,
        savedAt: new Date(),
        status: report.status,
        tasks: report.tasks,
        nextWeekPlan: report.nextWeekPlan,
        blockers: report.blockers,
        achievements: report.achievements,
        hoursWorked: report.hoursWorked
      };

      // Push snapshot into versions array
      report.versions.push(snapshot);

      // Apply updated fields
      if (weekStartDate) report.weekStartDate = new Date(weekStartDate);
      if (projectId) report.projectId = projectId;
      if (tasks) report.tasks = tasks;
      if (nextWeekPlan !== undefined) report.nextWeekPlan = nextWeekPlan;
      if (blockers) report.blockers = blockers;
      if (achievements) report.achievements = achievements;
      if (hoursWorked) report.hoursWorked = hoursWorked;
      if (status) report.status = status;

      // Save updated document
      const updatedReport = await report.save();
      await updatedReport.populate('userId', 'name email role');
      await updatedReport.populate('projectId', 'name description');

      return res.status(200).json({
        success: true,
        message: 'Report updated and version snapshot saved successfully',
        data: updatedReport
      });
    } else {
      // Memory Fallback Mode
      const index = memoryReports.findIndex((r) => String(r._id) === String(id));
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      const existing = memoryReports[index];

      // Push version snapshot
      const snapshot = {
        versionNumber: (existing.versions ? existing.versions.length : 0) + 1,
        savedAt: new Date().toISOString(),
        status: existing.status,
        tasks: existing.tasks,
        nextWeekPlan: existing.nextWeekPlan,
        blockers: existing.blockers,
        achievements: existing.achievements,
        hoursWorked: existing.hoursWorked
      };

      if (!existing.versions) existing.versions = [];
      existing.versions.push(snapshot);

      // Update fields
      memoryReports[index] = {
        ...existing,
        ...(weekStartDate && { weekStartDate: new Date(weekStartDate).toISOString() }),
        ...(projectId && { projectId }),
        ...(tasks && { tasks }),
        ...(nextWeekPlan !== undefined && { nextWeekPlan }),
        ...(blockers && { blockers }),
        ...(achievements && { achievements }),
        ...(hoursWorked && { hoursWorked }),
        ...(status && { status }),
        updatedAt: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        message: 'Report updated and version snapshot saved successfully (In-Memory)',
        data: memoryReports[index]
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Failed to update report',
      error: error.message
    });
  }
};

// ==========================================
// CONTROLLER: POST /api/reports/:id/submit
// DESCRIPTION: Submit report to manager (transitions status to SUBMITTED)
// ==========================================
const submitReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      report.status = 'SUBMITTED';
      await report.save();

      return res.status(200).json({
        success: true,
        message: 'Weekly report submitted to manager for review!',
        data: report
      });
    } else {
      const index = memoryReports.findIndex((r) => String(r._id) === String(id));
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      memoryReports[index].status = 'SUBMITTED';

      return res.status(200).json({
        success: true,
        message: 'Weekly report submitted to manager for review! (In-Memory)',
        data: memoryReports[index]
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: error.message
    });
  }
};

// ==========================================
// CONTROLLER: PATCH /api/reports/:id/review
// DESCRIPTION: Review report (Manager Only): Approve or Request Correction
// ==========================================
const reviewReport = async (req, res) => {
  try {
    // Role-based authorization check: Verify authenticated user has MANAGER role at top of controller
    if (!req.user || req.user.role !== 'MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Manager role required to submit report reviews.'
      });
    }

    const { id } = req.params;
    const managerId = req.user.id;
    const { status, comment } = req.body;

    if (!status || !['APPROVED', 'NEEDS_CORRECTION'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Review status must be either APPROVED or NEEDS_CORRECTION'
      });
    }

    if (isMongoConnected()) {
      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      // Update status
      report.status = status;

      // Append review comment if provided
      if (comment && comment.trim() !== '') {
        report.reviewComments.push({
          managerId,
          comment: comment.trim(),
          createdAt: new Date(),
          version: (report.versions ? report.versions.length : 0) + 1
        });
      }

      await report.save();
      await report.populate('userId', 'name email role');
      await report.populate('projectId', 'name description');

      return res.status(200).json({
        success: true,
        message: `Report status updated to ${status}`,
        data: report
      });
    } else {
      const index = memoryReports.findIndex((r) => String(r._id) === String(id));
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      memoryReports[index].status = status;

      if (!memoryReports[index].reviewComments) {
        memoryReports[index].reviewComments = [];
      }

      if (comment && comment.trim() !== '') {
        memoryReports[index].reviewComments.push({
          managerId,
          managerName: req.user.name,
          comment: comment.trim(),
          createdAt: new Date().toISOString(),
          version: (memoryReports[index].versions ? memoryReports[index].versions.length : 0) + 1
        });
      }

      return res.status(200).json({
        success: true,
        message: `Report status updated to ${status} (In-Memory)`,
        data: memoryReports[index]
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to complete report review',
      error: error.message
    });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getTeamReports,
  getReportById,
  updateReport,
  submitReport,
  reviewReport,
  memoryReports
};
