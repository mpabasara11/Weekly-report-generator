// Import React core library
import React from 'react';

// Import ReactDOM client library for rendering React elements into browser DOM
import ReactDOM from 'react-dom/client';

// Import App main component
import App from './App.jsx';

// Import global CSS design system stylesheet
import './index.css';

// Locate HTML container element with ID 'root' and instantiate React 18 root node
ReactDOM.createRoot(document.getElementById('root')).render(
  // Wrap application in React StrictMode to activate runtime development warnings
  <React.StrictMode>
    {/* Render main App component */}
    <App />
  </React.StrictMode>
);
