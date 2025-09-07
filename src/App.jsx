import React, { useEffect } from 'react';
// Toaster is mounted globally in index.jsx
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EventDashboard from './components/events/EventDashboard';
import EventsArchive from './components/admin/EventsArchive';

function AppContent() {
  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.body.dir = 'rtl';
    document.body.classList.add('rtl');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <EventDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/archive"
          element={
            <ProtectedRoute>
              <EventsArchive />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
