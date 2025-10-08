// src/types/player.ts

// Interface para representar o perfil do player
export interface PlayerProfile {
  id: string;                    // ID único do usuário
  name: string;                  // Nome completo do usuário
  username?: string;             // Nome de usuário (opcional)
  avatar: string;                // URL ou caminho para o avatar
  role?: string;                 // Cargo ou função do usuário (opcional)
  department?: string;           // Departamento do usuário (opcional)
  joinedDate: string;            // Data de entrada/join
  isActive: boolean;             // Se o usuário está ativo
  
  // Informações de progresso
  xp: number;                    // XP total acumulado
  level: number;                 // Nível atual
  weeklyXp: number;              // XP acumulado na semana
  monthlyXp: number;             // XP acumulado no mês
  streak: number;                // Sequência atual de dias ativos
  bestStreak: number;            // Melhor sequência de dias ativos
  missionsCompleted: number;     // Número total de missões completas
  tasksCompleted: number;        // Total de tarefas completadas
  
  // Configurações de perfil
  notificationPreferences?: NotificationPreferences;
  privacySettings?: PrivacySettings;
  theme?: 'light' | 'dark' | 'system';  // Preferência de tema
}

// Preferências de notificação
export interface NotificationPreferences {
  email: boolean;                // Receber notificações por email
  inApp: boolean;                // Receber notificações dentro do app
  push: boolean;                 // Receber notificações push
  weeklySummary: boolean;        // Receber resumo semanal
  missionUpdates: boolean;       // Receber atualizações de missões
  taskReminders: boolean;        // Receber lembretes de tarefas
}

// Configurações de privacidade
export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';  // Visibilidade do perfil
  xpVisibility: 'public' | 'team' | 'private';        // Visibilidade de XP
  activityVisibility: 'public' | 'team' | 'private';  // Visibilidade de atividades
  shareWithTeam: boolean;        // Compartilhar informações com o time
}

// Interface para estatísticas do player
export interface PlayerStats {
  totalXp: number;
  currentLevel: number;
  xpToNextLevel: number;
  weeklyProgress: number;
  monthlyProgress: number;
  streak: number;
  bestStreak: number;
  missionsCompleted: number;
  tasksCompleted: number;
  tasksCompletionRate: number;   // Porcentagem de tarefas completadas
  averageTaskXp: number;         // Média de XP por tarefa completada
}

// Interface para histórico de XP
export interface XpHistory {
  id: string;
  playerId: string;
  date: string;
  xp: number;
  source: 'task' | 'mission' | 'bonus' | 'penalty' | 'streak';
  description: string;
  taskId?: string;
  missionId?: string;
}