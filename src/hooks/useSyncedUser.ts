/**
 * Hook personalizado para sincronização automática de dados do usuário
 * Garante que componentes sejam atualizados quando dados do perfil mudam
 */

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAsProfile, validateUserSync } from '@/utils/userSync';

interface UseSyncedUserOptions {
  onUserChange?: (user: any) => void;
  syncProfile?: boolean;
  autoRefresh?: boolean;
}

export const useSyncedUser = (options: UseSyncedUserOptions = {}) => {
  const { user, refreshUser } = useAuth();
  const { onUserChange, syncProfile = true, autoRefresh = true } = options;

  // Callback para notificar mudanças
  const notifyUserChange = useCallback(() => {
    if (onUserChange && user) {
      const profileData = getUserAsProfile(user);
      onUserChange(profileData);
    }
  }, [user, onUserChange]);

  // Escuta mudanças no usuário
  useEffect(() => {
    if (user && onUserChange) {
      notifyUserChange();
    }
  }, [user, notifyUserChange]);

  // Auto-refresh periódico (opcional)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshUser();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, refreshUser]);

  return {
    user,
    refreshUser,
    isAuthenticated: !!user,
    profileData: user ? getUserAsProfile(user) : null,
    forceSync: notifyUserChange
  };
};

/**
 * Hook específico para componentes que precisam de sincronização com PlayerContext
 */
export const usePlayerSync = (updatePlayerCallback?: (data: any) => void) => {
  return useSyncedUser({
    onUserChange: updatePlayerCallback,
    syncProfile: true,
    autoRefresh: false // Deixa o componente controlar quando atualizar
  });
};