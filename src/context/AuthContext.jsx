import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

const getStoredToken = () => {
  try {
    const t = localStorage.getItem('access_token');
    return (t && t !== 'undefined' && t !== 'null' && t.trim() !== '') ? t : null;
  } catch {
    return null;
  }
};

const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('user_data');
    return (saved && saved !== 'undefined' && saved !== 'null' && saved.trim() !== '')
      ? JSON.parse(saved)
      : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  // If we already have cached token and user, render instantly without blocking loading spinner
  const [isLoading, setIsLoading] = useState(() => {
    const initialToken = getStoredToken();
    const initialUser = getStoredUser();
    return Boolean(initialToken && !initialUser);
  });

  const fetchCurrentUser = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      setUser(res.data);
      localStorage.setItem('user_data', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login(username, password);
    const { access, refresh, user: userData } = res.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    setToken(access);
    setUser(userData);
    return userData;
  };

  const demoLogin = async () => {
    return login('demo', 'password123');
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    const { access, refresh, user: userData } = res.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user_data', JSON.stringify(userData));

    setToken(access);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user?.profile || {},
        token,
        isAuthenticated: !!token,
        isLoading,
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
