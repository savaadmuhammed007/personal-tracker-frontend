import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PrayerProvider } from './context/PrayerContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { AppLogo } from './components/common/AppLogo';

// Page Imports
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

/**
 * Route guard for authenticated user sessions.
 * Shows sleek loading state during session validation and redirects unauthenticated users to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-islamic-bg-light dark:bg-islamic-bg-dark flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center justify-center">
          <AppLogo className="w-16 h-16 animate-pulse" />
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
          Loading your sanctuary...
        </p>
      </div>
    );
  }

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Route guard for public-only auth pages (Login, Register).
 * Redirects already authenticated users to the home dashboard.
 */
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (isLoading) {
    return null;
  }

  if (isAuthenticated || token) {
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
                  {/* Public Authentication Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicOnlyRoute>
                        <LoginPage />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicOnlyRoute>
                        <RegisterPage />
                      </PublicOnlyRoute>
                    }
                  />

                  {/* Protected Application Workspace Routes */}
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

                  {/* Catch-all fallback */}
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
