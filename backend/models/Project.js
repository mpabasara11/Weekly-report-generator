// Import the mongoose library to define project database schema
const mongoose = require('mongoose');

// Define the blueprint structure for Project categories
const ProjectSchema = new mongoose.Schema(
  {
    // Official name of the project or department initiative (e.g., "E-Commerce Core")
    name: {
      type: String, // Text string data type
      required: [true, 'Project name is required'], // Mandatory field
      trim: true // Remove whitespace
    },

    // Detailed description explaining the project scope and goals
    description: {
      type: String, // Text string data type
      trim: true, // Remove whitespace
      default: '' // Default to empty string if omitted
    },

    // Archival status flag indicating whether the project is active or archived
    isArchived: {
      type: Boolean, // Boolean flag (true/false)
      default: false // Active by default upon creation
    }
  },
  {
    // Automatically include createdAt and updatedAt timestamp fields
    timestamps: true
  }
);

// Compile schema into Mongoose model named 'Project' and export module
module.exports = mongoose.model('Project', ProjectSchema);
