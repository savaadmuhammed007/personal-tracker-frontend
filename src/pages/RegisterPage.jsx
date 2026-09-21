import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/UIComponents';

export const RegisterPage = () => {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('London');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({
        display_name: displayName,
        username,
        email,
        password,
        city,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      });
      showToast('Account Created', 'Welcome to Islamic Daily OS! Default habits have been initialized.');
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      const errData = err.response?.data;
      if (errData && typeof errData === 'object') {
        const messages = [];
        for (const [key, val] of Object.entries(errData)) {
          const cleanKey = key.replace('_', ' ');
          const text = Array.isArray(val) ? val.join(' ') : String(val);
          messages.push(`${cleanKey}: ${text}`);
        }
        setError(messages.join(' | ') || 'Please check your registration details.');
      } else if (err.message === 'Network Error') {
        setError('Unable to connect to the server. Please check your connection.');
      } else {
        setError(err.response?.data?.detail || 'Failed to create account. Please check your details.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-islamic-bg-light dark:bg-islamic-bg-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-islamic-primary-600 to-islamic-primary-950 flex items-center justify-center text-white shadow-picton-glow mx-auto mb-4">
          <span className="text-2xl font-bold font-arabic">☪</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create Your Account
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Start your personalized Islamic consistency journey
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass-card py-8 px-6 sm:px-10 rounded-3xl shadow-soft-lg space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name / Display Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Tariq Mansoor"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Username
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
                  placeholder="Choose unique username"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  City / Location (For Prayer Calculations)
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!navigator.geolocation) {
                      showToast('GPS Unavailable', 'Browser does not support geolocation.', 'error');
                      return;
                    }
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        const lat = Number(pos.coords.latitude.toFixed(4));
                        const lon = Number(pos.coords.longitude.toFixed(4));
                        try {
                          const geoRes = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
                            { headers: { 'Accept-Language': 'en' } }
                          );
                          if (geoRes.ok) {
                            const geoJson = await geoRes.json();
                            const addr = geoJson.address || {};
                            const detected = addr.city || addr.town || addr.municipality || addr.state || '';
                            if (detected) setCity(detected);
                            else setCity(`${lat}, ${lon}`);
                          } else {
                            setCity(`${lat}, ${lon}`);
                          }
                        } catch (e) {
                          setCity(`${lat}, ${lon}`);
                        }
                        showToast('Location Detected', 'Set to your current location.');
                      },
                      (err) => {
                        showToast('GPS Error', 'Please enter your city name manually.', 'error');
                      }
                    );
                  }}
                  className="text-[11px] font-bold text-islamic-primary-600 dark:text-islamic-primary-400 hover:underline"
                >
                  📍 Use Current GPS
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. London, Istanbul, Mecca, Chicago"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
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
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-islamic-border-light dark:border-islamic-border-dark bg-white dark:bg-islamic-card-dark text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-islamic-primary-500"
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
              {submitting ? 'Creating account...' : 'Complete Registration'}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-islamic-primary-600 dark:text-islamic-primary-400 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
