// Import Express framework and instantiate router handle
const express = require('express');
const router = express.Router();

// Import report controller handlers (role-based authorization checks enforced directly inside controllers)
const {
  createReport,
  getMyReports,
  getTeamReports,
  getReportById,
  updateReport,
  submitReport,
  reviewReport
} = require('../controllers/reportController');

// POST /api/reports - Save draft or new weekly report
router.post('/', createReport);

// GET /api/reports/my - Fetch authenticated user's own reports
router.get('/my', getMyReports);

// GET /api/reports/team - Fetch all team reports with filters (Manager role enforced in controller)
router.get('/team', getTeamReports);

// GET /api/reports/:id - Fetch single weekly report by ID
router.get('/:id', getReportById);

// PUT /api/reports/:id - Update draft or NEEDS_CORRECTION report (pushes snapshot to versions)
router.put('/:id', updateReport);

// POST /api/reports/:id/submit - Transition report status to SUBMITTED
router.post('/:id/submit', submitReport);

// PATCH /api/reports/:id/review - Approve or request changes on report (Manager role enforced in controller)
router.patch('/:id/review', reviewReport);

// Export router configuration module
module.exports = router;
