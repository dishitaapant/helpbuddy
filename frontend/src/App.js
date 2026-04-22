// App.js — Main App with Routing
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import AuthPage from './pages/Auth/AuthPage';
import Dashboard from './pages/Dashboard/Dashboard';
import ChatPage from './pages/Chat/ChatPage';
import HelpPage from './pages/Help/HelpPage';
import QuizPage from './pages/Quiz/QuizPage';
import MusicPage from './pages/Music/MusicPage';
import EmergencyPage from './pages/Emergency/EmergencyPage';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-white/50 text-sm">Loading HelpBuddy...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
      <Route path="/music" element={<ProtectedRoute><MusicPage /></ProtectedRoute>} />
      <Route path="/emergency" element={<ProtectedRoute><EmergencyPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
