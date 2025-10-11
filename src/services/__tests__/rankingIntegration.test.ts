// src/services/__tests__/rankingIntegration.test.ts
import { describe, it, expect } from 'vitest';
import { toOrderedRankingDTO } from '../dtoTransformers';
import type { Task, User } from '../gamificationService';

// Happy path + desempates (XP > menos incorretas > primeiro a concluir)
describe('Ranking integration ordering & tie-breakers', () => {
  const users: User[] = [
    { id: 'u1', name: 'A', avatar: 'a', xp: 0, level: 1, weeklyXp: 0, monthlyXp: 0, missionsCompleted: 0, consistencyBonus: 0, streak: 0 },
    { id: 'u2', name: 'B', avatar: 'b', xp: 0, level: 1, weeklyXp: 0, monthlyXp: 0, missionsCompleted: 0, consistencyBonus: 0, streak: 0 },
    { id: 'u3', name: 'C', avatar: 'c', xp: 0, level: 1, weeklyXp: 0, monthlyXp: 0, missionsCompleted: 0, consistencyBonus: 0, streak: 0 },
  ];

  it('orders by xp desc; when equal, by fewer incorrect (heuristic overdue); then by first completion time', () => {
    const base = Date.now();
    const tasks: Task[] = [
      // u1 e u2 terão mesmo XP médio: (100 + 90)/2 = 95 -> 950
      { id: 't1', title: 't', status: 'completed', completedDate: new Date(base - 1000).toISOString(), dueDate: new Date(base).toISOString(), assignedTo: 'u1' }, // on_time 90
      { id: 't2', title: 't', status: 'completed', completedDate: new Date(base - 2000).toISOString(), dueDate: new Date(base - 3000).toISOString(), assignedTo: 'u1' }, // early 100
      { id: 't3', title: 't', status: 'completed', completedDate: new Date(base - 1000).toISOString(), dueDate: new Date(base).toISOString(), assignedTo: 'u2' }, // on_time 90
      { id: 't4', title: 't', status: 'completed', completedDate: new Date(base - 2000).toISOString(), dueDate: new Date(base - 3000).toISOString(), assignedTo: 'u2' }, // early 100
      // Incorrect heurística para u2: uma overdue
      { id: 't5', title: 't', status: 'overdue', dueDate: new Date(base - 5000).toISOString(), assignedTo: 'u2' },
      // u3 terá XP inferior: apenas on_time 90 -> 900
      { id: 't6', title: 't', status: 'completed', completedDate: new Date(base - 1000).toISOString(), dueDate: new Date(base).toISOString(), assignedTo: 'u3' },
    ];

    const ordered = toOrderedRankingDTO(users, tasks);
    // u1 deve vir antes de u2 (mesmo XP, menos incorretas), e u3 por último
    expect(ordered.map(u => u.id)).toEqual(['u1','u2','u3']);
  });

  it('ignores refacao in denominator until reconcluded', () => {
    const base = Date.now();
    const tasks: Task[] = [
      { id: 't1', title: 't', status: 'refacao', dueDate: new Date(base).toISOString(), assignedTo: 'u1' },
      { id: 't2', title: 't', status: 'completed', completedDate: new Date(base - 1000).toISOString(), dueDate: new Date(base).toISOString(), assignedTo: 'u1' }, // on_time 90
    ];
    const ordered = toOrderedRankingDTO(users, tasks);
    const u1 = ordered.find(u => u.id === 'u1');
    expect(u1?.xp).toBe(900); // somente a concluída conta
  });
});
