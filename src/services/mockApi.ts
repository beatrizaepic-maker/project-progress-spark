// src/services/mockApi.ts
// Mock API layer that returns DTOs enforcing visibility rules

import type { Task, User } from './gamificationService';
import { toOrderedRankingDTO, toPlayerProfileDTO } from './dtoTransformers';
import type { RankingEntryDTO, PlayerProfileDTO } from '@/types/dto';

// In-memory mock data sources; in real impl, fetch from backend
let usersStore: User[] = [];
let tasksStore: Task[] = [];

export function seedMockData(users: User[], tasks: Task[]) {
  usersStore = users;
  tasksStore = tasks;
}

export async function fetchRanking(): Promise<RankingEntryDTO[]> {
  // Simulate latency
  await new Promise(r => setTimeout(r, 50));
  // Ensure ordering by xp desc
  return toOrderedRankingDTO(usersStore, tasksStore);
}

export async function fetchPlayerProfile(userId: string): Promise<PlayerProfileDTO | null> {
  await new Promise(r => setTimeout(r, 50));
  const user = usersStore.find(u => u.id === userId);
  if (!user) return null;
  return toPlayerProfileDTO(user, tasksStore);
}
