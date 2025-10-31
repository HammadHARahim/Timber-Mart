import { createContext, useContext, useState, useEffect } from 'react';
import { api, ApiError } from '../utils/apiClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    const savedUser = sessionStorage.getItem('auth_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const data = await api.post('/api/auth/login', { username, password }, { requiresAuth: false });
      // Backend returns accessToken, not token
      const token = data.accessToken || data.token;
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('auth_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}