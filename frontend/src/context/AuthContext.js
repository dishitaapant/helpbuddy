// context/AuthContext.js — Global Auth State
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('hb_token'));

  // Load user on mount if token exists
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('hb_token', newToken);
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hb_token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = async () => {
    try {
      const res = await api.get('/user/dashboard');
      setUser((prev) => ({ ...prev, ...res.data.dashboard }));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
