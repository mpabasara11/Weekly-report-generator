// Import defineConfig helper function from Vite bundler configuration API
import { defineConfig } from 'vite';

// Import official Vite React plugin enabling Fast Refresh & JSX transpilation
import react from '@vitejs/plugin-react';

// Export Vite configuration object with React plugin & backend API proxy setup
export default defineConfig({
  // Register React plugin plugin suite
  plugins: [react()],

  // Configure local development server settings
  server: {
    // Port number on which the Vite development server will run
    port: 3000,
    // Automatically open application in default web browser upon server start
    open: false,
    // Proxy configuration forwarding API calls to backend Express server on port 5000
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Express backend base server URL
        changeOrigin: true, // Modify origin header to match target URL
        secure: false // Disable SSL verification for local HTTP environment
      }
    }
  }
});
