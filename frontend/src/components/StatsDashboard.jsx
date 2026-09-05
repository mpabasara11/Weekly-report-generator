// Import React core library
import React from 'react';

/**
 * Four summary cards at the top of the manager dashboard.
 * Shows total reports, completed tasks, blockers, and average productivity.
 */
const StatsDashboard = ({ stats }) => {
  // Pull out each number, defaulting to 0 if the data hasn't loaded yet
  const {
    totalReports = 0,
    totalCompletedTasks = 0,
    totalBlockers = 0,
    avgProductivity = 0
  } = stats || {};


  return (
    <section className="stats-grid" aria-label="Dashboard Performance Summary Statistics">
      {/* Card 1: How many reports in total */}
      <div className="stat-card">
        {/* Blue/indigo icon */}
        <div className="stat-icon-box indigo">
          📁
        </div>
        {/* The number + label */}
        <div>
          <div className="stat-value">{totalReports}</div>
          <div className="stat-label">Total Reports</div>
        </div>
      </div>

      {/* Card 2: How many tasks got done */}
      <div className="stat-card">
        {/* Green icon */}
        <div className="stat-icon-box emerald">
          ✅
        </div>
        {/* The number + label */}
        <div>
          <div className="stat-value">{totalCompletedTasks}</div>
          <div className="stat-label">Completed Tasks</div>
        </div>
      </div>

      {/* Card 3: How many things are blocking the team */}
      <div className="stat-card">
        {/* Red/rose icon */}
        <div className="stat-icon-box rose">
          ⚠️
        </div>
        {/* The number + label */}
        <div>
          <div className="stat-value">{totalBlockers}</div>
          <div className="stat-label">Active Blockers</div>
        </div>
      </div>

      {/* Card 4: How productive is the team on average (out of 5) */}
      <div className="stat-card">
        {/* Yellow/amber icon */}
        <div className="stat-icon-box amber">
          ⭐
        </div>
        {/* The number + label */}
        <div>
          <div className="stat-value">{avgProductivity} / 5</div>
          <div className="stat-label">Avg. Productivity</div>
        </div>
      </div>
    </section>
  );
};

export default StatsDashboard;
