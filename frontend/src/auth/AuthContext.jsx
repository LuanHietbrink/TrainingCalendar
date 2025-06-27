import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ email: data.email, token: data.access_token });
        return { success: true };
      }
      return { success: false, message: data.msg || 'Login failed' };
    } catch (err) {
      return { success: false, message: 'Network error' };
    }
  };

  const register = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Optionally auto-login after register
        return await login(email, password);
      }
      return { success: false, message: data.msg || 'Registration failed' };
    } catch (err) {
      return { success: false, message: 'Network error' };
    }
  };

  const logout = () => setUser(null);

  // Helper for authenticated fetch
  const authFetch = async (url, options = {}) => {
    if (!user?.token) throw new Error('Not authenticated');
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${user.token}`,
    };
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 