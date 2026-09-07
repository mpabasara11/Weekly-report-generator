import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyReportsPage from './pages/MyReportsPage';
import ReportFormPage from './pages/ReportFormPage';
import ReportDetailPage from './pages/ReportDetailPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import ManagerReviewPage from './pages/ManagerReviewPage';
import AdminProjectsPage from './pages/AdminProjectsPage';

import './App.css';

function App() {
  // Who's logged in? We check localStorage so they stay logged in on refresh
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Called after a successful login or register — save the user info and token
  const handleLogin = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // Called when the user clicks Logout — wipe everything and reset
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const homeRoute = user?.role === 'MANAGER' ? '/dashboard' : '/my-reports';

  return (
    <Router>
      <div className="app-container">
        {/* The top bar — shows the logo, nav links, and who's logged in */}
        <Navbar user={user} onLogout={handleLogout} />

        {/* This swaps out which page to show based on the URL */}
        <main style={{ width: '100%' }}>
          <Routes>
            {/* Anyone can visit these, no login needed */}
            <Route
              path="/login"
              element={user ? <Navigate to={homeRoute} replace /> : <LoginPage onLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to={homeRoute} replace /> : <RegisterPage onLogin={handleLogin} />}
            />

            {/* Must be logged in to see these pages */}
            <Route element={<ProtectedRoute user={user} />}>
              <Route path="/my-reports" element={<MyReportsPage />} />
              <Route path="/report/new" element={<ReportFormPage />} />
              <Route path="/report/edit/:id" element={<ReportFormPage />} />
              <Route path="/report/:id" element={<ReportDetailPage />} />
            </Route>

            {/* Manager-only pages — regular members get redirected away */}
            <Route element={<ProtectedRoute user={user} allowedRoles={['MANAGER']} />}>
              <Route path="/dashboard" element={<ManagerDashboardPage />} />
              <Route path="/manager/review/:id" element={<ManagerReviewPage />} />
              <Route path="/admin/projects" element={<AdminProjectsPage />} />
            </Route>

            {/* Unknown URL? Just send them to the login page */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

