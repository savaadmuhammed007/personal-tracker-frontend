import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/UIComponents';
import { AppLogo } from '../components/common/AppLogo';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, ownerLogin, demoLogin } = useAuth();
  const { showToast } = useNotification();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await login(username.trim(), password);
      showToast('Welcome Back', `Alhamdulillah! Signed in successfully.`);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        err.message ||
        'Invalid username/email or password. Please try again.';
      setErrorMsg(detail);
      setLoading(false);
    }
  };

  const handleOwnerLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await ownerLogin();
      showToast('Welcome Savaad', 'Signed in as Savaad Muhammed (Main Account).');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Owner login failed:', err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        'Failed to authenticate. Please check password or network.';
      setErrorMsg(detail);
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await demoLogin();
      showToast('Demo Mode', 'Signed in as Demo User with preview data.');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Demo login failed:', err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        'Failed to sign in with demo account.';
      setErrorMsg(detail);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-islamic-bg-light dark:bg-islamic-bg-dark flex flex-col justify-center items-center py-8 sm:py-12 px-3 sm:px-6 relative overflow-hidden font-sans select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#1eb4eb]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-[#088ac1]/10 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full z-10 space-y-5 sm:space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-2">
            <AppLogo className="w-16 h-16 sm:w-20 sm:h-20 hover:scale-105 transition-transform" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to <span className="text-[#088ac1] dark:text-[#3dc3f3] font-youmi font-bold text-3xl sm:text-4xl">يومي</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Sign in to track your 5 daily prayers, habits, and digital dhikr
          </p>
        </div>

        {/* Card Form Container */}
        <div className="glass-card p-5 sm:p-8 rounded-3xl shadow-soft-lg border border-islamic-border-light dark:border-islamic-border-dark space-y-4">
          {/* Quick 1-Click Main Account Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleOwnerLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#088ac1] via-[#1eb4eb] to-[#076e9d] hover:brightness-110 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-[#088ac1]/30 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
              <span>1-Click Sign In: Savaad Muhammed</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
          </div>

          <div className="flex items-center gap-3 my-2 text-slate-400 text-xs">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            <span>or sign in with password</span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading && (
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-900 text-sky-700 dark:text-sky-300 text-xs flex items-center justify-center gap-2 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#088ac1] dark:text-[#3dc3f3]" />
              <span>Connecting to cloud database & waking up server...</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* Username or Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. savaadmuhammed or user@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1eb4eb] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1eb4eb] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#088ac1] focus:ring-[#1eb4eb] border-slate-300 dark:border-slate-600"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Sign In Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Preview Instant Demo Account</span>
            </button>
          </div>
        </div>

        {/* Footer: Register Link */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Don't have an account yet? </span>
          <Link
            to="/register"
            className="font-bold text-[#088ac1] dark:text-[#3dc3f3] hover:underline ml-1"
          >
            Create New Account →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
