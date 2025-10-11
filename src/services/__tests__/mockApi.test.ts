// src/services/__tests__/mockApi.test.ts
import { describe, it, expect } from 'vitest';
import { seedMockData, fetchRanking, fetchPlayerProfile } from '../mockApi';
import type { Task, User } from '../gamificationService';

describe('mockApi ranking/profile DTOs', () => {
  it('returns ranking ordered by xp and hides percentages', async () => {
    const base = new Date();
    const users: User[] = [
      { id: 'u1', name: 'Alice', avatar: 'a', xp: 0, level: 1, weeklyXp: 0, monthlyXp: 0, missionsCompleted: 0, consistencyBonus: 0, streak: 0 },
      { id: 'u2', name: 'Bob', avatar: 'b', xp: 0, level: 1, weeklyXp: 0, monthlyXp: 0, missionsCompleted: 0, consistencyBonus: 0, streak: 0 },
    ];
    const tasks: Task[] = [
      // u1: early(100), on_time(90) => avg 95 => xp 950
      { id: 't1', title: 'A', status: 'completed', completedDate: base.toISOString(), dueDate: base.toISOString(), assignedTo: 'u1' },
      { id: 't2', title: 'B', status: 'completed', completedDate: new Date(base.getTime() - 3600_000).toISOString(), dueDate: base.toISOString(), assignedTo: 'u1', completedEarly: true },
      // u2: late(50) => xp 500
      { id: 't3', title: 'C', status: 'completed', completedDate: new Date(base.getTime() + 3600_000).toISOString(), dueDate: base.toISOString(), assignedTo: 'u2' },
    ];
    seedMockData(users, tasks);
    const ranking = await fetchRanking();
    expect(ranking.map(r => r.id)).toEqual(['u1', 'u2']);
    // visibility: should not have productivity percentages
    expect('productivity' in (ranking[0] as any)).toBe(false);
  });

  it('returns profile DTO with productivity for a user', async () => {
    const profile = await fetchPlayerProfile('u1');
    expect(profile).not.toBeNull();
    expect(profile!.productivity.totalConsidered).toBeGreaterThan(0);
  });
});
