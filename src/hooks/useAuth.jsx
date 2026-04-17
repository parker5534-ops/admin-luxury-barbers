import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../lib/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lbc_admin_token');
    if (!token) { setLoading(false); return; }
    getMe()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('lbc_admin_token'))
      .finally(() => setLoading(false));
  }, []);

  const loginUser = (token, user) => {
    localStorage.setItem('lbc_admin_token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('lbc_admin_token');
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, loginUser, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() { return useContext(AuthCtx); }
