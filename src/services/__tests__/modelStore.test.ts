// src/services/__tests__/modelStore.test.ts
import { describe, it, expect } from 'vitest';
import { migrateAndBackfillFromTasks, computeAggregates } from '../modelStore';
import type { Task } from '../gamificationService';

describe('Modelo de dados e persistência (mock/localStorage)', () => {
  it('migra tarefas e computa agregados por player', () => {
    const base = new Date();
    const tasks: Task[] = [
      { id: 't1', title: 'A', status: 'completed', completedDate: base.toISOString(), dueDate: base.toISOString(), assignedTo: 'u1' }, // no_prazo (90)
      { id: 't2', title: 'B', status: 'completed', completedDate: new Date(base.getTime()-3600_000).toISOString(), dueDate: base.toISOString(), assignedTo: 'u1' }, // adiantada (100)
      { id: 't3', title: 'C', status: 'refacao', dueDate: base.toISOString(), assignedTo: 'u1' }, // ignora no denominador
      { id: 't4', title: 'D', status: 'completed', completedDate: new Date(base.getTime()+3600_000).toISOString(), dueDate: base.toISOString(), assignedTo: 'u2' }, // atrasada (50)
    ];
    const persisted = migrateAndBackfillFromTasks(tasks, 'comp1');
    expect(persisted.length).toBe(4);
    const aggs = computeAggregates(persisted);
    const a1 = aggs.find(a => a.playerId==='u1');
    const a2 = aggs.find(a => a.playerId==='u2');
    expect(a1?.totalTarefas).toBe(2);
    expect(a1?.xpExibido).toBe(950); // (100+90)/2 => 95*10
    expect(a2?.totalTarefas).toBe(1);
    expect(a2?.xpExibido).toBe(500);
  });
});
