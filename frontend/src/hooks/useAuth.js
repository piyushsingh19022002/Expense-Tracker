import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * @description Custom hook to easily consume AuthContext.
 * @returns {Object} AuthContext payload (user, token, loading, login, logout, isAuthenticated)
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider wrapper.');
  }
  return context;
};

export default useAuth;
