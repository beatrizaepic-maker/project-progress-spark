/**
 * Utilitário para sincronização de dados do usuário
 * Garante que todas as partes do sistema usem os dados mais atuais
 */

import { User } from '@/services/authService';

/**
 * Obtém o nome de exibição consistente do usuário
 * Prioriza firstName, depois o primeiro nome do name completo
 */
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return 'Usuário';
  
  if (user.firstName && user.firstName.trim()) {
    return user.firstName;
  }
  
  if (user.name && user.name.trim()) {
    return user.name.split(' ')[0];
  }
  
  return 'Usuário';
};

/**
 * Obtém o nome completo do usuário
 */
export const getUserFullName = (user: User | null): string => {
  if (!user) return 'Usuário';
  return user.name || 'Usuário';
};

/**
 * Obtém o avatar do usuário com fallback
 */
export const getUserAvatar = (user: User | null): string => {
  if (!user || !user.avatar) return '/avatars/user1.png';
  return user.avatar;
};

/**
 * Obtém a posição/cargo do usuário
 */
export const getUserPosition = (user: User | null): string => {
  if (!user) return 'Membro da Equipe';
  return user.position || 'Membro da Equipe';
};

/**
 * Obtém dados completos do usuário para componentes que precisam de profile
 */
export const getUserAsProfile = (user: User | null) => {
  if (!user) {
    return {
      name: 'Usuário',
      avatar: '/avatars/user1.png',
      role: 'Membro da Equipe',
      email: '',
      joinedDate: new Date().toISOString()
    };
  }

  return {
    name: user.name || 'Usuário',
    avatar: user.avatar || '/avatars/user1.png',
    role: user.position || 'Membro da Equipe',
    email: user.email || '',
    joinedDate: new Date().toISOString()
  };
};

/**
 * Valida se os dados do usuário estão sincronizados
 */
export const validateUserSync = (authUser: User | null, profileUser: any): boolean => {
  if (!authUser || !profileUser) return false;
  
  return (
    authUser.name === profileUser.name &&
    authUser.avatar === profileUser.avatar &&
    authUser.position === profileUser.role
  );
};

/**
 * Força sincronização de dados entre contextos
 */
export const syncUserData = (authUser: User | null, updateCallback: (data: any) => void) => {
  if (!authUser) return;
  
  const syncedData = getUserAsProfile(authUser);
  updateCallback(syncedData);
};