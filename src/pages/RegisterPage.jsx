import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  User,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/UIComponents';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, demoLogin } = useAuth();
  const { showToast } = useNotification();

  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    city: 'Mecca',
    timezone: 'UTC',
    latitude: null,
    longitude: null,
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGPSDetect = () => {
    if (!('geolocation' in navigator)) {
      showToast('GPS Unsupported', 'Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
          timezone: tz,
          city: prev.city || 'My Location',
        }));
        setIsDetectingGPS(false);
        showToast('GPS Detected', `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`);
      },
      (err) => {
        console.warn('GPS detection failed:', err);
        setIsDetectingGPS(false);
        showToast('GPS Skipped', 'You can type your city name manually.', 'info');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Form Validations
    if (!formData.username.trim()) {
      setErrorMsg('Please choose a username.');
      return;
    }
    if (formData.username.trim().length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return;
    }
    if (!formData.password) {
      setErrorMsg('Please enter a secure password.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim(),
        password: formData.password,
        display_name: formData.displayName.trim() || formData.username.trim(),
        city: formData.city.trim() || 'Mecca',
        timezone: formData.timezone || 'UTC',
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      showToast('Account Created', 'Alhamdulillah! Your personal habit tracker is ready.');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      const data = err.response?.data;
      let msg = 'Registration failed. Please check the fields and try again.';
      if (data) {
        if (data.username) msg = Array.isArray(data.username) ? data.username[0] : data.username;
        else if (data.email) msg = Array.isArray(data.email) ? data.email[0] : data.email;
        else if (data.password) msg = Array.isArray(data.password) ? data.password[0] : data.password;
        else if (data.detail) msg = data.detail;
        else if (data.message) msg = data.message;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await demoLogin();
      showToast('Demo Mode', 'Signed in as Demo User with full preview data.');
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMsg('Failed to sign in with demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-islamic-bg-light dark:bg-islamic-bg-dark flex flex-col justify-center items-center py-8 sm:py-12 px-3 sm:px-6 relative overflow-hidden font-sans select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#1eb4eb]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-[#088ac1]/10 blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full z-10 space-y-5 sm:space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-[#088ac1] to-[#3dc3f3] flex items-center justify-center text-white shadow-picton-glow mx-auto mb-2 border border-white/20 transform hover:rotate-6 transition-transform">
            <span className="text-2xl sm:text-3xl font-bold font-arabic">☪</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create Your Account in <span className="text-[#088ac1] dark:text-[#3dc3f3] font-youmi font-bold text-3xl sm:text-4xl">يومي</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Start tracking your 5 daily prayers, Qur’an goals, and spiritual consistency
          </p>
        </div>

        {/* Card Form Container */}
        <div className="glass-card p-5 sm:p-8 rounded-3xl shadow-soft-lg border border-islamic-border-light dark:border-islamic-border-dark space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleChange('displayName', e.target.value)}
                    placeholder="e.g. Savaad Muhammed"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1eb4eb] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">@</span>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    placeholder="savaad"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1eb4eb] focus:border-transparent transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1eb4eb] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* City / Location (with GPS Detect) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  City (for Prayer Times)
                </label>
                <button
                  type="button"
                  onClick={handleGPSDetect}
                  disabled={isDetectingGPS}
                  className="text-[11px] font-semibold text-[#088ac1] dark:text-[#3dc3f3] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isDetectingGPS ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3 h-3" />
                      <span>Auto-Detect GPS</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. Kannur, Dubai, Mecca, London"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1eb4eb] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Min. 6 chars"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1eb4eb] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-[#1eb4eb] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Create Account Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#088ac1] to-[#076e9d] hover:from-[#1eb4eb] hover:to-[#088ac1] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#088ac1]/30 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Start Tracking</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-[#3dc3f3]/40 bg-[#088ac1]/10 hover:bg-[#088ac1]/20 text-[#088ac1] dark:text-[#3dc3f3] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Or Test Instant Demo Account</span>
            </button>
          </div>
        </div>

        {/* Footer: Sign In Link */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="font-bold text-[#088ac1] dark:text-[#3dc3f3] hover:underline ml-1"
          >
            Sign In Here →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
