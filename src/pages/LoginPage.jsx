import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/UIComponents';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login, demoLogin } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      showToast('Welcome back', 'Logged in to Islamic Daily OS.');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      const errData = err.response?.data;
      if (errData?.detail) {
        setError(errData.detail);
      } else if (errData?.non_field_errors) {
        setError(Array.isArray(errData.non_field_errors) ? errData.non_field_errors.join(' ') : String(errData.non_field_errors));
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Please check your network or server status.');
      } else {
        setError('Invalid username, email, or password. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await demoLogin();
      showToast('Welcome to Demo', 'Logged in as Zayd Ibrahim with 30 days of data.');
      navigate('/');
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Failed to log in as demo user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-islamic-bg-light dark:bg-islamic-bg-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-islamic-primary-200">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-islamic-primary-500/10 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-islamic-primary-600 to-islamic-primary-950 flex items-center justify-center text-white shadow-picton-glow mx-auto mb-4">
          <span className="text-2xl font-bold font-arabic">☪</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Islamic Daily <span className="text-islamic-primary-600 dark:text-islamic-primary-400">OS</span>
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Sign in to access your personal Islamic habit & prayer system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass-card py-8 px-6 sm:px-10 rounded-3xl shadow-soft-lg space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Quick Demo Login Option */}
          <div className="p-4 rounded-2xl bg-[#e1f3fd]/70 dark:bg-[#0f4d6b]/30 border border-[#bce8fb] dark:border-[#0b5d81]/60 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#076e9d] dark:text-[#81d7f8] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Demo Account Ready
              </span>
              <span className="text-[10px] uppercase font-bold text-[#088ac1] dark:text-[#3dc3f3]">
                1-Click
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Explore with 30 days of pre-populated timestamped prayer records, awrad counters, Qur'an logs, and consistency heatmap.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full"
              disabled={submitting}
              onClick={handleDemoLogin}
            >
              Sign In as Demo User (Zayd)
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold">
              <span className="bg-white dark:bg-islamic-card-dark px-2 text-slate-400">
                Or with your account
              </span>
            </div>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username or email"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={submitting}
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-islamic-primary-600 dark:text-islamic-primary-400 hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
