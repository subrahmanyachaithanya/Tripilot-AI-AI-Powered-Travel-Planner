import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tripilot_token');
    if (!token) {
      setLoading(false);
      return;
    }
    apiRequest('/api/auth/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('tripilot_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function saveAuth(result) {
    localStorage.setItem('tripilot_token', result.token);
    setUser(result.user);
  }

  async function login(email, password) {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password })
    });
    saveAuth(result);
    return result;
  }

  async function register(fullName, email, password) {
    const result = await apiRequest('/api/auth/register', {
      method: 'POST', body: JSON.stringify({ fullName, email, password })
    });
    saveAuth(result);
    return result;
  }

  async function completeGoogleLogin(token) {
    localStorage.setItem('tripilot_token', token);
    const profile = await apiRequest('/api/auth/me');
    setUser(profile);
  }

  function logout() {
    localStorage.removeItem('tripilot_token');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout, completeGoogleLogin }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
