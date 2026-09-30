import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

const defaultInitialUser = {
  id: 2,
  username: 'savaadmuhammed',
  first_name: 'Savaad Muhammed',
  email: 'savaadmuhammed786@gmail.com',
  profile: {
    display_name: 'Savaad Muhammed',
    city: 'Kannur',
    country: 'India',
    latitude: 11.5867,
    longitude: 76.1074,
    timezone: 'Asia/Calcutta',
    calculation_method: 'Karachi',
    asr_method: 'Standard',
    sound_enabled: true,
    haptic_enabled: true,
    prayer_notifications: true,
    habit_notifications: true,
    task_notifications: true,
  }
};

const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('user_data');
    if (saved && saved !== 'undefined' && saved !== 'null' && saved.trim() !== '') {
      return JSON.parse(saved);
    }
  } catch {}
  return defaultInitialUser;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('user_data', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Fetched user data with local fallback:', err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await authApi.login(username, password);
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('user_data', JSON.stringify(res.data.user));
        if (res.data.access) localStorage.setItem('access_token', res.data.access);
        if (res.data.refresh) localStorage.setItem('refresh_token', res.data.refresh);
        return res.data.user;
      }
    } catch {
      await fetchCurrentUser();
    }
    return user;
  };

  const demoLogin = async () => {
    return login('demo', 'password123');
  };

  const register = async (formData) => {
    try {
      const res = await authApi.register(formData);
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('user_data', JSON.stringify(res.data.user));
        if (res.data.access) localStorage.setItem('access_token', res.data.access);
        if (res.data.refresh) localStorage.setItem('refresh_token', res.data.refresh);
        return res.data.user;
      }
    } catch {
      await fetchCurrentUser();
    }
    return user;
  };

  const logout = () => {
    // In single-user mode, logout simply re-synchronizes the user's data
    fetchCurrentUser();
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user?.profile || defaultInitialUser.profile,
        token: 'single-user-session',
        isAuthenticated: true,
        isLoading: false,
        login,
        demoLogin,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
