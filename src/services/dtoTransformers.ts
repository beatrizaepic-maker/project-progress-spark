// src/services/dtoTransformers.ts
// Helper functions to convert internal models to DTOs respecting visibility rules.

import { Task, User, calculateLevelFromXp, calculateUserProductivity, updateRanking, getDeliveryDistribution } from './gamificationService';
import { loadIncorrectSubmissions } from './modelStore';
import type { RankingEntryDTO, PlayerProfileDTO } from '@/types/dto';

/**
 * Transforma a lista de usuários + tarefas em DTOs para o ranking.
 * Garante que percentuais não são expostos.
 */
export function toRankingDTO(users: User[], tasks: Task[]): RankingEntryDTO[] {
  const updated = updateRanking(users, tasks);
  return updated.map(u => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    xp: u.xp,
    level: calculateLevelFromXp(u.xp),
    weeklyXp: u.weeklyXp,
    monthlyXp: u.monthlyXp,
    missionsCompleted: u.missionsCompleted,
    consistencyBonus: u.consistencyBonus,
    streak: u.streak,
  }));
}

/**
 * Retorna o ranking já ordenado por XP (desc) e mantém estabilidade para futuros desempates.
 */
export function toOrderedRankingDTO(users: User[], tasks: Task[]): RankingEntryDTO[] {
  // Submissões incorretas oficiais (persistidas)
  const incorrect = loadIncorrectSubmissions();
  const incorrectByUser: Record<string, number> = {};
  for (const s of incorrect) {
    incorrectByUser[s.playerId] = (incorrectByUser[s.playerId] || 0) + 1;
  }

  // Fallback heurístico: se não houver registros, considerar 'overdue' como tentativa incorreta
  if (Object.keys(incorrectByUser).length === 0) {
    for (const t of tasks) {
      if (t.status === 'overdue') {
        incorrectByUser[t.assignedTo] = (incorrectByUser[t.assignedTo] || 0) + 1;
      }
    }
  }

  // Primeiro timestamp de conclusão por usuário
  const firstCompletionByUser: Record<string, number> = {};
  for (const t of tasks) {
    if (t.status === 'completed' && t.completedDate) {
      const ts = new Date(t.completedDate).getTime();
      const cur = firstCompletionByUser[t.assignedTo];
      if (!cur || ts < cur) firstCompletionByUser[t.assignedTo] = ts;
    }
  }

  const entries = toRankingDTO(users, tasks);
  return entries.slice().sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp; // 1) maior XP
    const aInc = incorrectByUser[a.id] || 0;
    const bInc = incorrectByUser[b.id] || 0;
    if (aInc !== bInc) return aInc - bInc; // 2) menos incorretas
    const aFirst = firstCompletionByUser[a.id] || Number.MAX_SAFE_INTEGER;
    const bFirst = firstCompletionByUser[b.id] || Number.MAX_SAFE_INTEGER;
    return aFirst - bFirst; // 3) primeiro a concluir vence
  });
}

/**
 * Cria o DTO de perfil com métricas de produtividade visíveis somente no perfil.
 */
export function toPlayerProfileDTO(user: User, tasks: Task[]): PlayerProfileDTO {
  const userTasks = tasks.filter(t => t.assignedTo === user.id);
  const prod = calculateUserProductivity(userTasks);
  const dist = getDeliveryDistribution(userTasks);
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    level: calculateLevelFromXp(user.xp),
    missionsCompleted: user.missionsCompleted,
    streak: user.streak,
    productivity: {
      totalConsidered: prod.totalConsidered,
      averagePercent: prod.averagePercentRounded,
    },
    deliveryDistribution: dist,
  };
}
