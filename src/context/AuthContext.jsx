import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('user_data');
    if (saved && saved !== 'undefined' && saved !== 'null' && saved.trim() !== '') {
      return JSON.parse(saved);
    }
  } catch {}
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('access_token') || null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Validate session and refresh user profile non-blockingly in the background
  useEffect(() => {
    let isMounted = true;
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user_data');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {}
      }
      authApi.getMe()
        .then((res) => {
          if (isMounted && res.data) {
            setUser(res.data);
            localStorage.setItem('user_data', JSON.stringify(res.data));
          }
        })
        .catch((err) => {
          console.warn('Background profile refresh error:', err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      localStorage.removeItem('explicit_logout');
      const res = await authApi.login(username, password);
      const data = res.data;

      if (data.access) {
        localStorage.setItem('access_token', data.access);
        setToken(data.access);
      }
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }
      if (data.user) {
        localStorage.setItem('user_data', JSON.stringify(data.user));
        setUser(data.user);
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const ownerLogin = async () => {
    return login('savaadmuhammed', 'password123');
  };

  const demoLogin = async () => {
    return login('demo', 'password123');
  };

  const register = async (formData) => {
    setIsLoading(true);
    try {
      localStorage.removeItem('explicit_logout');
      const res = await authApi.register(formData);
      const data = res.data;

      if (data.access) {
        localStorage.setItem('access_token', data.access);
        setToken(data.access);
      }
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }
      if (data.user) {
        localStorage.setItem('user_data', JSON.stringify(data.user));
        setUser(data.user);
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.setItem('explicit_logout', 'true');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('user_data', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Failed to refresh profile:', err);
    }
  };

  const isAuthenticated = Boolean(
    (token || (typeof localStorage !== 'undefined' && localStorage.getItem('access_token'))) &&
    (user || (typeof localStorage !== 'undefined' && localStorage.getItem('user_data')))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user?.profile || {},
        token,
        isAuthenticated,
        isLoading,
        login,
        ownerLogin,
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

export default AuthContext;
