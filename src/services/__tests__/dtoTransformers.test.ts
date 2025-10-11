// src/services/__tests__/dtoTransformers.test.ts
import { describe, it, expect } from 'vitest';
import { toRankingDTO, toPlayerProfileDTO } from '../dtoTransformers';
import type { Task, User } from '../gamificationService';

describe('DTO Transformers', () => {
  const users: User[] = [
    { id: 'u1', name: 'Alice', avatar: 'a', xp: 0, level: 1, weeklyXp: 0, monthlyXp: 0, missionsCompleted: 0, consistencyBonus: 0, streak: 0 },
  ];
  const baseDate = new Date();
  const tasks: Task[] = [
    { id: 't1', title: 'T1', status: 'completed', completedDate: new Date(baseDate.getTime() - 3600_000).toISOString(), dueDate: baseDate.toISOString(), assignedTo: 'u1' }, // on_time (90)
    { id: 't2', title: 'T2', status: 'completed', completedDate: new Date(baseDate.getTime() - 2*3600_000).toISOString(), dueDate: new Date(baseDate.getTime() - 3600_000).toISOString(), assignedTo: 'u1', completedEarly: true }, // early (100)
  ];

  it('toRankingDTO hides percentages and computes xp', () => {
    const dto = toRankingDTO(users, tasks);
    expect(dto).toHaveLength(1);
    const u = dto[0];
    expect(u.xp).toBe(950); // (100+90)/2 *10
    expect('productivity' in (u as any)).toBe(false);
  });

  it('toPlayerProfileDTO exposes productivity metrics', () => {
    const profDto = toPlayerProfileDTO(users[0], tasks);
    expect(profDto.productivity.totalConsidered).toBe(2);
    expect(profDto.productivity.averagePercent).toBe(95);
  });
});
