// src/services/playerService.ts

import { PlayerProfile, PlayerStats, XpHistory, NotificationPreferences, PrivacySettings } from '@/types/player';
import { User as GamificationUser } from './gamificationService';

// Serviço para gerenciar o perfil do player

/**
 * Cria um novo perfil de player com valores iniciais
 * @param name Nome completo do usuário
 * @param avatar URL do avatar
 * @param role Cargo/função (opcional)
 * @returns Perfil de player inicializado
 */
export function createPlayerProfile(
  name: string, 
  avatar: string, 
  role?: string
): PlayerProfile {
  const id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name,
    avatar,
    role,
    joinedDate: new Date().toISOString(),
    isActive: true,
    xp: 0,
    level: 1,
    weeklyXp: 0,
    monthlyXp: 0,
    streak: 0,
    bestStreak: 0,
    missionsCompleted: 0,
    tasksCompleted: 0,
    notificationPreferences: {
      email: true,
      inApp: true,
      push: false,
      weeklySummary: true,
      missionUpdates: true,
      taskReminders: true
    },
    privacySettings: {
      profileVisibility: 'team',
      xpVisibility: 'team',
      activityVisibility: 'team',
      shareWithTeam: true
    },
    theme: 'dark'
  };
}

/**
 * Atualiza o perfil do player com novas informações
 * @param profile Perfil existente
 * @param updates Informações para atualizar
 * @returns Perfil atualizado
 */
export function updatePlayerProfile(
  profile: PlayerProfile, 
  updates: Partial<PlayerProfile>
): PlayerProfile {
  return {
    ...profile,
    ...updates,
    // Garantir que certos campos não sejam sobrescritos
    id: profile.id,
    joinedDate: profile.joinedDate
  };
}

/**
 * Calcula as estatísticas do player com base em seu perfil
 * @param profile Perfil do player
 * @returns Estatísticas calculadas
 */
export function calculatePlayerStats(profile: PlayerProfile): PlayerStats {
  // Importar a função de cálculo de nível do serviço de gamificação
  // (simulando a importação - na implementação real seria importado do módulo apropriado)
  const xpToNextLevel = 100 * (profile.level + 1); // Fórmula de exemplo
  
  return {
    totalXp: profile.xp,
    currentLevel: profile.level,
    xpToNextLevel,
    weeklyProgress: profile.weeklyXp,
    monthlyProgress: profile.monthlyXp,
    streak: profile.streak,
    bestStreak: profile.bestStreak,
    missionsCompleted: profile.missionsCompleted,
    tasksCompleted: profile.tasksCompleted,
    tasksCompletionRate: profile.tasksCompleted > 0 ? 
      Math.round((profile.tasksCompleted / (profile.tasksCompleted + 5)) * 100) : 0, // Simplificado
    averageTaskXp: profile.tasksCompleted > 0 ? 
      Math.round(profile.xp / profile.tasksCompleted) : 0
  };
}

/**
 * Atualiza as estatísticas do player baseado em novas informações de gamificação
 * @param profile Perfil atual do player
 * @param gamificationUser Dados do usuário do sistema de gamificação
 * @returns Perfil atualizado
 */
export function updatePlayerStatsFromGamification(
  profile: PlayerProfile, 
  gamificationUser: GamificationUser
): PlayerProfile {
  return {
    ...profile,
    xp: gamificationUser.xp,
    level: gamificationUser.level,
    weeklyXp: gamificationUser.weeklyXp || 0,
    monthlyXp: gamificationUser.monthlyXp || 0,
    streak: gamificationUser.streak || 0,
    missionsCompleted: gamificationUser.missionsCompleted || 0
  };
}

/**
 * Gera um histórico de XP para o player
 * @param playerId ID do player
 * @param xp Quantidade de XP
 * @param source Origem do XP
 * @param description Descrição
 * @returns Registro de histórico
 */
export function createXpHistory(
  playerId: string,
  xp: number,
  source: 'task' | 'mission' | 'bonus' | 'penalty' | 'streak',
  description: string,
  taskId?: string,
  missionId?: string
): XpHistory {
  return {
    id: `xp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    playerId,
    date: new Date().toISOString(),
    xp,
    source,
    description,
    taskId,
    missionId
  };
}

/**
 * Formata o nome do usuário para exibição
 * @param profile Perfil do player
 * @returns Nome formatado
 */
export function formatPlayerName(profile: PlayerProfile): string {
  return profile.name;
}

/**
 * Obtém o caminho do avatar, com fallback para avatar padrão
 * @param profile Perfil do player
 * @returns URL do avatar
 */
export function getPlayerAvatar(profile: PlayerProfile): string {
  if (profile.avatar && profile.avatar !== '') {
    return profile.avatar;
  }
  // Avatar padrão
  return '/avatars/default-avatar.png';
}

/**
 * Verifica se o player tem permissão para ver certas informações de outro player
 * @param viewer Perfil de quem está visualizando
 * @param subject Perfil de quem está sendo visualizado
 * @returns Permissões de visualização
 */
export function checkViewPermissions(
  viewer: PlayerProfile, 
  subject: PlayerProfile
): {
  canViewProfile: boolean;
  canViewXp: boolean;
  canViewActivity: boolean;
} {
  // Lógica simplificada de permissões
  const isSameUser = viewer.id === subject.id;
  
  // Determinar permissões com base nas configurações de privacidade
  const canViewProfile = isSameUser || 
    subject.privacySettings?.profileVisibility === 'public' || 
    (subject.privacySettings?.profileVisibility === 'team' && viewer.isActive);
    
  const canViewXp = isSameUser || 
    subject.privacySettings?.xpVisibility === 'public' || 
    (subject.privacySettings?.xpVisibility === 'team' && viewer.isActive);
    
  const canViewActivity = isSameUser || 
    subject.privacySettings?.activityVisibility === 'public' || 
    (subject.privacySettings?.activityVisibility === 'team' && viewer.isActive);
  
  return {
    canViewProfile,
    canViewXp,
    canViewActivity
  };
}