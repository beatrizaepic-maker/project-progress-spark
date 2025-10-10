/**
 * Hook personalizado para funcionalidades de autenticação
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useAuthActions = () => {
  const { login, logout, register, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await login(email, password);
      if (response.success) {
        navigate('/dashboard');
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await register(email, password, name);
      if (response.success) {
        navigate('/dashboard');
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    return true;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    handleLogin,
    handleLogout,
    handleRegister,
    requireAuth
  };
};