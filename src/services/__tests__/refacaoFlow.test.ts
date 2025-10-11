// src/services/__tests__/refacaoFlow.test.ts
import { describe, it, expect } from 'vitest';
import { enterRefacao, reconcludeTask } from '../gamificationService';
import type { Task } from '../gamificationService';

describe('Fluxo de Refação', () => {
  it('enterRefacao remove completedDate e marca status refacao', () => {
    const tasks: Task[] = [
      { id: 't1', title: 'X', status: 'completed', completedDate: '2025-10-09', dueDate: '2025-10-10', assignedTo: 'u' }
    ];
    const out = enterRefacao(tasks, 't1');
    expect(out[0].status).toBe('refacao');
    expect(out[0].completedDate).toBeUndefined();
  });

  it('reconcludeTask volta para completed e pode recalc dueDate se permitido', () => {
    const tasks: Task[] = [
      { id: 't1', title: 'X', status: 'refacao', dueDate: '2025-10-10', assignedTo: 'u' }
    ];
    const out = reconcludeTask(tasks, 't1', '2025-10-10T10:00:00Z', { allowDueDateRecalc: true, newDueDate: '2025-10-11' });
    expect(out[0].status).toBe('completed');
    expect(out[0].completedDate).toBe('2025-10-10T10:00:00Z');
    expect(out[0].dueDate).toBe('2025-10-11');
  });
});
