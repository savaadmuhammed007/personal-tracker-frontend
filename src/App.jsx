import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PrayerProvider } from './context/PrayerContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';

// Direct Page Imports
import { HomePage } from './pages/HomePage';
import { QuranPage } from './pages/QuranPage';
import { CalendarPage } from './pages/CalendarPage';
import { HabitsPage } from './pages/HabitsPage';
import { AwradPage } from './pages/AwradPage';
import { TasksPage } from './pages/TasksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MissedPage } from './pages/MissedPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <PrayerProvider>
            <NotificationProvider>
              <BrowserRouter>
                <Routes>
                  {/* Direct App Routes - No Login/Auth Required */}
                  <Route element={<Layout />}>
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

                  {/* Redirect any auth or unknown route straight to Home */}
                  <Route path="/login" element={<Navigate to="/" replace />} />
                  <Route path="/register" element={<Navigate to="/" replace />} />
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
