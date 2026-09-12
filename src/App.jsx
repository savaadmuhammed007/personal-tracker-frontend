import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PrayerProvider } from './context/PrayerContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';

// Home page loaded directly for instant first paint
import { HomePage } from './pages/HomePage';

// Other pages lazy-loaded to keep initial bundle tiny and eliminate opening lag
const QuranPage = React.lazy(() => import('./pages/QuranPage').then(m => ({ default: m.QuranPage })));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const HabitsPage = React.lazy(() => import('./pages/HabitsPage').then(m => ({ default: m.HabitsPage })));
const AwradPage = React.lazy(() => import('./pages/AwradPage').then(m => ({ default: m.AwradPage })));
const TasksPage = React.lazy(() => import('./pages/TasksPage').then(m => ({ default: m.TasksPage })));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const MissedPage = React.lazy(() => import('./pages/MissedPage').then(m => ({ default: m.MissedPage })));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));

const PageLoader = () => (
  <div className="py-24 flex items-center justify-center">
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#088ac1] to-[#076e9d] text-white flex items-center justify-center text-lg font-bold font-arabic animate-pulse shadow-picton-glow">
      ☪
    </div>
  </div>
);

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
                <Suspense fallback={<PageLoader />}>
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
                </Suspense>
              </BrowserRouter>
            </NotificationProvider>
          </PrayerProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
