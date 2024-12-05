import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/users/me/');
      
      // Restore portal type for developer users
      const portalType = localStorage.getItem('portal_type');
      
      setUser({
        ...response.data,
        portal: portalType || response.data.user_type
      });
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('portal_type');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    // Listen for token refresh events
    const handleTokenRefresh = (event) => {
      const { access } = event.detail;
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    };

    // Listen for auth errors
    const handleAuthError = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('portal_type');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      setError('Authentication failed');
      navigate('/developer/login');
    };

    window.addEventListener('tokenRefreshed', handleTokenRefresh);
    window.addEventListener('authError', handleAuthError);

    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
      window.removeEventListener('authError', handleAuthError);
    };
  }, [navigate]);

  const login = async (data) => {
    try {
      // Store tokens
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      
      // Store portal type for developer users
      if (data.user.portal === 'developer') {
        localStorage.setItem('portal_type', 'developer');
      }
      
      // Set default auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${data.tokens.access}`;
      
      // Ensure portal is set in user data
      const userData = {
        ...data.user,
        portal: data.user.portal || data.user.user_type
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    try {
      // Clear tokens and portal type
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('portal_type');
      
      // Clear auth header
      delete api.defaults.headers.common['Authorization'];
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Redirect based on previous portal type
      const wasDevPortal = user?.portal === 'developer';
      navigate(wasDevPortal ? '/developer/login' : '/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed');
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    isAuthenticated,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 