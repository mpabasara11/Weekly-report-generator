// Import the mongoose library to define user database schema
const mongoose = require('mongoose');

// Define the blueprint structure for User accounts
const UserSchema = new mongoose.Schema(
  {
    // User's full name (e.g., "Alex Rivera")
    name: {
      type: String, // Text string data type
      required: [true, 'Full name is required'], // Mandatory field
      trim: true // Remove unnecessary leading/trailing whitespace
    },

    // User's unique email address used for authentication login
    email: {
      type: String, // Text string data type
      required: [true, 'Email address is required'], // Mandatory field
      unique: true, // Enforce unique index constraint in database
      lowercase: true, // Automatically convert email to lowercase before saving
      trim: true // Remove whitespace
    },

    // Securely hashed password string generated using bcryptjs
    passwordHash: {
      type: String, // Text string data type storing hashed password
      required: [true, 'Password hash is required'] // Mandatory field
    },

    // User's authorization role dictating access permissions
    role: {
      type: String, // Text string data type
      enum: ['TEAM_MEMBER', 'MANAGER'], // Restrict values to TEAM_MEMBER or MANAGER
      default: 'TEAM_MEMBER' // Default assigned role for new registrations
    }
  },
  {
    // Automatically manage createdAt and updatedAt timestamps for user documents
    timestamps: true
  }
);

// Compile schema into Mongoose model named 'User' and export module
module.exports = mongoose.model('User', UserSchema);
