// Import the mongoose library to define database schema blueprints
const mongoose = require('mongoose');

// Define sub-schema for individual tasks contained within a weekly report
const TaskItemSchema = new mongoose.Schema({
  // Name or description of the specific task
  name: { type: String, required: true, trim: true },
  // Priority level of the task (e.g., "HIGH", "MEDIUM", "LOW")
  priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
  // Planned completion percentage target at start of week (0 to 100)
  plannedPct: { type: Number, min: 0, max: 100, default: 100 },
  // Actual completion percentage achieved by end of week (0 to 100)
  actualPct: { type: Number, min: 0, max: 100, default: 0 },
  // Current status state of the individual task item
  status: { type: String, enum: ['COMPLETED', 'IN_PROGRESS', 'BLOCKED', 'NOT_STARTED'], default: 'IN_PROGRESS' },
  // Time planned for task in hours
  timePlanned: { type: Number, default: 0 },
  // Actual time spent on task in hours
  timeSpent: { type: Number, default: 0 },
  // Output link, pull request URL, or description of final deliverable
  deliverable: { type: String, trim: true, default: '' }
});

// Define sub-schema for blockers and obstacles reported
const BlockerSchema = new mongoose.Schema({
  // Text description of the blocker or impediment
  text: { type: String, required: true, trim: true },
  // Boolean flag marking whether this is a critical key issue requiring manager escalation
  isKeyIssue: { type: Boolean, default: false }
});

// Define sub-schema for key achievements highlighted
const AchievementSchema = new mongoose.Schema({
  // Text description of the accomplishment
  text: { type: String, required: true, trim: true },
  // Boolean flag marking whether this achievement is a major key highlight
  isKeyHighlight: { type: Boolean, default: false }
});

// Define sub-schema for manager review comments appended during review cycles
const ReviewCommentSchema = new mongoose.Schema({
  // Reference to the manager user who left the comment
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Text comment feedback string provided by the manager
  comment: { type: String, required: true, trim: true },
  // Timestamp when comment was added
  createdAt: { type: Date, default: Date.now },
  // Report version iteration number at the time comment was submitted
  version: { type: Number, default: 1 }
});

// Define main Weekly Report Schema structure
const ReportSchema = new mongoose.Schema(
  {
    // Reference pointer to the team member User who created the report
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required']
    },

    // Starting date of the reported work week (e.g. Monday date)
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required'],
      default: Date.now
    },

    // Reference pointer to the associated Project category
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID reference is required']
    },

    // Current review workflow status of the weekly report
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'NEEDS_CORRECTION', 'APPROVED'],
      default: 'DRAFT'
    },

    // List of structured task items completed or in progress during the week
    tasks: {
      type: [TaskItemSchema],
      default: []
    },

    // Free text string outlining planned goals for the upcoming week
    nextWeekPlan: {
      type: String,
      trim: true,
      default: ''
    },

    // List of blockers or impediments encountered during the week
    blockers: {
      type: [BlockerSchema],
      default: []
    },

    // List of achievements and major wins accomplished
    achievements: {
      type: [AchievementSchema],
      default: []
    },

    // Breakdown object of hours worked categorized by activity type
    hoursWorked: {
      development: { type: Number, default: 0 },
      testing: { type: Number, default: 0 },
      meetings: { type: Number, default: 0 },
      documentation: { type: Number, default: 0 }
    },

    // Array of review comments submitted by managers across review cycles
    reviewComments: {
      type: [ReviewCommentSchema],
      default: []
    },

    // Array of version snapshots maintaining full edit history across review cycles
    versions: {
      type: [mongoose.Schema.Types.Mixed], // Stores full snapshot object of report state at each version step
      default: []
    }
  },
  {
    // Automatically include createdAt and updatedAt timestamps
    timestamps: true
  }
);

// Compile schema into Mongoose model named 'Report' and export module
module.exports = mongoose.model('Report', ReportSchema);
