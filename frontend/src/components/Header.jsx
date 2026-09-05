// Import React core library
import React from 'react';

/**
 * Header Component displaying application branding logo, project title, and main action button
 * @param {Object} props - Component properties
 * @param {Function} props.onOpenCreateModal - Callback function to trigger open of new report creation modal
 * @returns {JSX.Element} Rendered Header JSX element
 */
const Header = ({ onOpenCreateModal }) => {
  // Return the JSX structure for the top application navigation banner
  return (
    <header className="app-header">
      {/* Brand branding area containing logo icon and title text */}
      <div className="header-brand">
        {/* Glowing gradient icon box element */}
        <div className="brand-icon" aria-label="Weekly Report Logo">
          📋
        </div>
        
        {/* Title and subtitle stack */}
        <div>
          <h1 className="brand-title">Weekly Report Generator</h1>
          <p className="brand-subtitle">Streamline team accomplishment updates & blocker tracking</p>
        </div>
      </div>

      {/* Hero primary call-to-action button opening report creation modal */}
      <button 
        className="btn-primary" 
        onClick={onOpenCreateModal}
        type="button"
      >
        {/* Plus icon symbol */}
        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>+</span>
        {/* Button label text */}
        <span>Create Weekly Report</span>
      </button>
    </header>
  );
};

// Export Header component as default export
export default Header;
