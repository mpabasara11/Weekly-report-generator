const mongoose = require('mongoose');

const TaskItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
  plannedPct: { type: Number, min: 0, max: 100, default: 100 },
  actualPct: { type: Number, min: 0, max: 100, default: 0 },
  status: { type: String, enum: ['COMPLETED', 'IN_PROGRESS', 'BLOCKED', 'NOT_STARTED'], default: 'IN_PROGRESS' },
  timePlanned: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },
  deliverable: { type: String, trim: true, default: '' }
});

const BlockerSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  isKeyIssue: { type: Boolean, default: false }
});

const AchievementSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  isKeyHighlight: { type: Boolean, default: false }
});

const ReviewCommentSchema = new mongoose.Schema({
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  version: { type: Number, default: 1 }
});

const ReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    weekStartDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'NEEDS_CORRECTION', 'APPROVED'],
      default: 'DRAFT'
    },
    tasks: {
      type: [TaskItemSchema],
      default: []
    },
    nextWeekPlan: {
      type: String,
      trim: true,
      default: ''
    },
    blockers: {
      type: [BlockerSchema],
      default: []
    },
    achievements: {
      type: [AchievementSchema],
      default: []
    },
    hoursWorked: {
      development: { type: Number, default: 0 },
      testing: { type: Number, default: 0 },
      meetings: { type: Number, default: 0 },
      documentation: { type: Number, default: 0 }
    },
    reviewComments: {
      type: [ReviewCommentSchema],
      default: []
    },
    versions: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Report', ReportSchema);
