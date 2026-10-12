import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { settingsApi } from '../api/settingsApi';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { profile, isAuthenticated } = useAuth();
  const [theme, setThemeState] = useState(() => {
    return profile?.theme || (typeof localStorage !== 'undefined' ? localStorage.getItem('app_theme') : null) || 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState('light');

  // When cloud profile loads or changes, sync theme from cloud
  useEffect(() => {
    if (profile?.theme && profile.theme !== theme) {
      setThemeState(profile.theme);
    }
  }, [profile?.theme]);

  // Apply CSS class to document root
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        isDark = mediaQuery.matches;
      }

      setEffectiveTheme(isDark ? 'dark' : 'light');
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    // Cache theme choice locally only as instant flash fallback before auth resolves
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('app_theme', theme);
      }
    } catch {}

    const listener = () => {
      if (theme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  // Set theme and persist immediately to cloud profile
  const setTheme = useCallback(
    async (newTheme) => {
      setThemeState(newTheme);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('app_theme', newTheme);
        }
      } catch {}

      if (isAuthenticated) {
        try {
          await settingsApi.updateSettings({ theme: newTheme });
        } catch (err) {
          console.warn('Failed to sync theme preference to cloud:', err);
        }
      }
    },
    [isAuthenticated]
  );

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
