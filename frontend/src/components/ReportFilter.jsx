// Import React core library
import React from 'react';

/**
 * The filter/search toolbar at the top of the reports page.
 * Lets you search by text, filter by department, and switch between status tabs.
 */
const ReportFilter = ({
  searchQuery,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange
}) => {
  // All the department options in the dropdown
  const departments = ['All', 'Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations', 'HR'];

  // The status tabs you can click to filter
  const statusOptions = ['All', 'Submitted', 'Approved', 'Draft'];


  return (
    <div className="filter-toolbar">
      {/* The search box — just a text input with a magnifying glass icon */}
      <div className="search-box">
        {/* The little search icon */}
        <span style={{ fontSize: '1rem', color: '#94a3b8' }}>🔍</span>
        {/* Type here to search reports */}
        <input
          type="text"
          placeholder="Search by title, author name, or role..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Department and status filters sit next to each other */}
      <div className="filter-controls">
        {/* Pick a department from the list */}
        <select
          className="filter-select"
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          aria-label="Filter by department"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept === 'All' ? '🏢 All Departments' : `🏢 ${dept}`}
            </option>
          ))}
        </select>

        {/* Click a tab to filter by report status */}
        <div className="status-tabs" role="tablist">
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              className={`tab-btn ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => onStatusChange(status)}
              role="tab"
              aria-selected={selectedStatus === status}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportFilter;
