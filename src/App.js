import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EventDashboard from './components/EventDashboard';
import EventsArchive from './components/admin/EventsArchive';

// RTL wrapper component to apply RTL direction when Hebrew is selected
function AppContent() {
  const { language } = useLanguage();
  
  useEffect(() => {
    // Update document direction based on language
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.body.dir = language === 'he' ? 'rtl' : 'ltr';
    
    // Add/remove RTL class from body
    if (language === 'he') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language]);

  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'he' ? 'rtl' : 'ltr'}`}>
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
