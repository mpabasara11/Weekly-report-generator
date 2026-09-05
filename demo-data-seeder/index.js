/**
 * Standalone Demonstration Data Inserter / Seeder Tool
 * 
 * Usage:
 *   cd demo-data-seeder
 *   npm start
 * 
 * Description:
 *   Connects directly to MongoDB, clears existing collections (users, projects, reports),
 *   and populates complete demonstration data for application testing and demo purposes.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import local models
const User = require('./models/User');
const Project = require('./models/Project');
const Report = require('./models/Report');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weekly_reports';

async function runDataInsertion() {
  console.log('===========================================================');
  console.log('🚀 STANDALONE DEMONSTRATION DATA INSERTER');
  console.log('===========================================================');

  try {
    console.log(`📡 Connecting to MongoDB database...`);
    console.log(`   URI: ${MONGODB_URI.replace(/:([^@]+)@/, ':****@')}`);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected successfully to database.\n');

    // 1. Password Hashing
    const defaultPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);
    console.log('🔐 Password hash generated for demo accounts ("password123").');

    // 2. Clear Existing Collections
    console.log('🧹 Purging existing collections (users, projects, reports)...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Report.deleteMany({});
    console.log('✅ Existing collections cleared successfully.\n');

    // 3. Insert Users
    console.log('👤 Inserting Demonstration Users...');
    const usersData = [
      {
        name: 'Sarah Jenkins',
        email: 'manager@example.com',
        passwordHash,
        role: 'MANAGER'
      },
      {
        name: 'Alex Rivera',
        email: 'alex@example.com',
        passwordHash,
        role: 'TEAM_MEMBER'
      },
      {
        name: 'Michael Chen',
        email: 'michael@example.com',
        passwordHash,
        role: 'TEAM_MEMBER'
      },
      {
        name: 'Emily Davis',
        email: 'emily@example.com',
        passwordHash,
        role: 'TEAM_MEMBER'
      }
    ];

    const insertedUsers = await User.insertMany(usersData);
    console.log(`✅ Successfully inserted ${insertedUsers.length} user accounts:`);
    insertedUsers.forEach((u) => {
      console.log(`   • [${u.role.padEnd(11)}] ${u.name} (${u.email})`);
    });
    console.log('');

    const managerUser = insertedUsers.find((u) => u.role === 'MANAGER');
    const alexUser = insertedUsers.find((u) => u.email === 'alex@example.com');
    const michaelUser = insertedUsers.find((u) => u.email === 'michael@example.com');
    const emilyUser = insertedUsers.find((u) => u.email === 'emily@example.com');

    // 4. Insert Projects
    console.log('📁 Inserting Demonstration Projects...');
    const projectsData = [
      {
        name: 'E-Commerce Core Redesign',
        description: 'Major overhaul of customer checkout workflow, payment gateway integration, and product catalog performance.',
        isArchived: false
      },
      {
        name: 'Analytics & Reporting Pipeline',
        description: 'Real-time telemetry dashboard, Redis caching layer, and aggregated weekly stats reporting engine.',
        isArchived: false
      },
      {
        name: 'Mobile App iOS & Android',
        description: 'Cross-platform native companion app built with React Native for real-time notifications and mobile access.',
        isArchived: false
      },
      {
        name: 'Cloud Infrastructure & DevOps',
        description: 'Automated CI/CD deployment pipelines, Kubernetes cluster orchestration, and server monitoring setup.',
        isArchived: false
      }
    ];

    const insertedProjects = await Project.insertMany(projectsData);
    console.log(`✅ Successfully inserted ${insertedProjects.length} project categories:`);
    insertedProjects.forEach((p) => {
      console.log(`   • ${p.name}`);
    });
    console.log('');

    const ecommerceProj = insertedProjects[0];
    const analyticsProj = insertedProjects[1];
    const mobileProj = insertedProjects[2];

    // Helper dates
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 5. Insert Weekly Reports
    console.log('📊 Inserting Demonstration Weekly Reports...');
    const reportsData = [
      {
        userId: alexUser._id,
        projectId: ecommerceProj._id,
        weekStartDate: twoWeeksAgo,
        status: 'APPROVED',
        tasks: [
          {
            name: 'Build responsive product card grid component',
            priority: 'HIGH',
            plannedPct: 100,
            actualPct: 100,
            status: 'COMPLETED',
            timePlanned: 12,
            timeSpent: 12,
            deliverable: 'https://github.com/company/ecommerce/pull/101'
          },
          {
            name: 'Integrate Stripe payment gateway SDK and webhook handlers',
            priority: 'HIGH',
            plannedPct: 100,
            actualPct: 100,
            status: 'COMPLETED',
            timePlanned: 16,
            timeSpent: 16,
            deliverable: 'https://github.com/company/ecommerce/pull/104'
          },
          {
            name: 'Write unit tests for checkout form validation',
            priority: 'MEDIUM',
            plannedPct: 100,
            actualPct: 100,
            status: 'COMPLETED',
            timePlanned: 8,
            timeSpent: 8,
            deliverable: 'https://github.com/company/ecommerce/pull/108'
          }
        ],
        hoursWorked: {
          development: 28,
          testing: 6,
          meetings: 4,
          documentation: 2
        },
        blockers: [],
        achievements: [
          { text: 'Successfully reduced payment processing API latency by 35%', isKeyHighlight: true },
          { text: 'Achieved 92% automated code coverage on new checkout modules', isKeyHighlight: false }
        ],
        nextWeekPlan: 'Conduct cross-browser QA testing and optimize bundle loading speeds.',
        reviewComments: [
          {
            managerId: managerUser._id,
            comment: 'Outstanding work on the payment integration! All test cases passed with zero defects.',
            createdAt: new Date(twoWeeksAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
            version: 1
          }
        ]
      },
      {
        userId: michaelUser._id,
        projectId: analyticsProj._id,
        weekStartDate: oneWeekAgo,
        status: 'SUBMITTED',
        tasks: [
          {
            name: 'Optimize MongoDB aggregation queries for weekly stats',
            priority: 'HIGH',
            plannedPct: 100,
            actualPct: 90,
            status: 'IN_PROGRESS',
            timePlanned: 16,
            timeSpent: 14,
            deliverable: 'https://github.com/company/analytics/pull/45'
          },
          {
            name: 'Construct StatsDashboard interactive chart UI component',
            priority: 'MEDIUM',
            plannedPct: 100,
            actualPct: 75,
            status: 'IN_PROGRESS',
            timePlanned: 12,
            timeSpent: 10,
            deliverable: 'https://github.com/company/analytics/pull/48'
          },
          {
            name: 'Setup Redis cache layer for user session analytics',
            priority: 'HIGH',
            plannedPct: 100,
            actualPct: 50,
            status: 'IN_PROGRESS',
            timePlanned: 10,
            timeSpent: 8,
            deliverable: ''
          }
        ],
        hoursWorked: {
          development: 24,
          testing: 5,
          meetings: 3,
          documentation: 4
        },
        blockers: [
          { text: 'Awaiting production API access key approval from Security team', isKeyIssue: true }
        ],
        achievements: [
          { text: 'Database query execution time reduced from 1.2s to 180ms', isKeyHighlight: true }
        ],
        nextWeekPlan: 'Finalize Redis cache invalidation strategy and present metrics demo.'
      },
      {
        userId: emilyUser._id,
        projectId: mobileProj._id,
        weekStartDate: oneWeekAgo,
        status: 'NEEDS_CORRECTION',
        tasks: [
          {
            name: 'Implement APNS push notification handler for iOS app',
            priority: 'HIGH',
            plannedPct: 100,
            actualPct: 40,
            status: 'BLOCKED',
            timePlanned: 16,
            timeSpent: 12,
            deliverable: ''
          },
          {
            name: 'Fix navigation bar stack overflow crash on Android 14',
            priority: 'MEDIUM',
            plannedPct: 100,
            actualPct: 100,
            status: 'COMPLETED',
            timePlanned: 6,
            timeSpent: 6,
            deliverable: 'https://github.com/company/mobile/pull/89'
          }
        ],
        hoursWorked: {
          development: 18,
          testing: 8,
          meetings: 5,
          documentation: 1
        },
        blockers: [
          { text: 'Apple Developer Push Certificate expired and pending renewal by IT admin', isKeyIssue: true }
        ],
        achievements: [
          { text: 'Resolved critical navigation stack crash impacting Android users', isKeyHighlight: false }
        ],
        nextWeekPlan: 'Complete push notification handler once Apple certificate issue is resolved.',
        reviewComments: [
          {
            managerId: managerUser._id,
            comment: 'Please update the task deliverable field with PR link once push notification work resumes.',
            createdAt: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
            version: 1
          }
        ]
      },
      {
        userId: alexUser._id,
        projectId: ecommerceProj._id,
        weekStartDate: now,
        status: 'DRAFT',
        tasks: [
          {
            name: 'Implement dark mode color theme tokens in CSS module',
            priority: 'MEDIUM',
            plannedPct: 100,
            actualPct: 30,
            status: 'IN_PROGRESS',
            timePlanned: 10,
            timeSpent: 4,
            deliverable: ''
          }
        ],
        hoursWorked: {
          development: 4,
          testing: 0,
          meetings: 2,
          documentation: 0
        },
        blockers: [],
        achievements: [],
        nextWeekPlan: 'Finalize dark mode design tokens and conduct usability testing.'
      }
    ];

    const insertedReports = await Report.insertMany(reportsData);
    console.log(`✅ Successfully inserted ${insertedReports.length} weekly report entries:`);
    insertedReports.forEach((r) => {
      console.log(`   • [${r.status.padEnd(16)}] Week: ${r.weekStartDate.toISOString().split('T')[0]}`);
    });
    console.log('');

    console.log('===========================================================');
    console.log('🎉 DEMONSTRATION DATA INSERTION COMPLETE!');
    console.log('===========================================================');
    console.log('🔑 Credentials for Application Login Demonstration:');
    console.log('   --------------------------------------------------------');
    console.log('   Manager Account:');
    console.log('     Email:    manager@example.com');
    console.log('     Password: password123');
    console.log('   --------------------------------------------------------');
    console.log('   Team Member Accounts:');
    console.log('     Email:    alex@example.com     (password: password123)');
    console.log('     Email:    michael@example.com  (password: password123)');
    console.log('     Email:    emily@example.com    (password: password123)');
    console.log('===========================================================\n');

  } catch (error) {
    console.error('❌ Error during data insertion:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB database.');
  }
}

runDataInsertion();
