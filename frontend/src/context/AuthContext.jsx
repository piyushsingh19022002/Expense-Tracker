import React, { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, logoutUser, fetchCurrentUser } from '../services/authService.js';

// Create the Context instance
export const AuthContext = createContext(null);

/**
 * @description Global Auth State Provider.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  // Helper to clear session variables
  const clearSession = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
  }, []);

  // Restore session on page refresh
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetchCurrentUser();
        if (response?.success && response.data) {
          setUser(response.data);
        } else {
          clearSession();
        }
      } catch (error) {
        // Token is likely invalid or expired
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [token, clearSession]);

  // Context Login wrapper
  const login = useCallback(async (email, password) => {
    try {
      const response = await loginUser(email, password);
      
      if (response?.success && response.data) {
        const { user: userData, token: jwtToken } = response.data;
        
        // Sync states and localStorage
        localStorage.setItem('auth_token', jwtToken);
        setToken(jwtToken);
        setUser(userData);
        
        return response.data;
      }
      throw new Error(response?.message || 'Login failed.');
    } catch (error) {
      clearSession();
      throw error;
    }
  }, [clearSession]);

  // Context Logout wrapper
  const logout = useCallback(async () => {
    try {
      // Notify backend to invalidate cookies
      await logoutUser();
    } catch (error) {
      // Non-blocking log - proceed to clear client-side token anyway
      console.warn('Backend session termination failed:', error);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
