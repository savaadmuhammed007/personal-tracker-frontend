import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PrayerProvider } from './context/PrayerContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';

// Pages
import { HomePage } from './pages/HomePage';
import { QuranPage } from './pages/QuranPage';
import { CalendarPage } from './pages/CalendarPage';
import { HabitsPage } from './pages/HabitsPage';
import { AwradPage } from './pages/AwradPage';
import { TasksPage } from './pages/TasksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MissedPage } from './pages/MissedPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-islamic-bg-light dark:bg-islamic-bg-dark flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-islamic-primary-600 to-islamic-primary-950 text-white flex items-center justify-center text-xl font-bold font-arabic animate-pulse shadow-picton-glow">
          ☪
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route (redirects to / if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-islamic-bg-light dark:bg-islamic-bg-dark flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-islamic-primary-600 to-islamic-primary-950 text-white flex items-center justify-center text-xl font-bold font-arabic animate-pulse shadow-picton-glow">
          ☪
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <PrayerProvider>
            <NotificationProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Auth Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <RegisterPage />
                      </PublicRoute>
                    }
                  />

                  {/* Protected App Routes */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/" element={<HomePage />} />
                    <Route path="/quran" element={<QuranPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/habits" element={<HabitsPage />} />
                    <Route path="/awrad" element={<AwradPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/missed" element={<MissedPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </PrayerProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
