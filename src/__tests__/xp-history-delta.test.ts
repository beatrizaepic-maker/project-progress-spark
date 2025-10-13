import { describe, it, expect, beforeEach } from 'vitest';
import { saveTasksData, getGamificationTasks } from '@/services/localStorageData';
import { getUserXpHistory } from '@/services/xpHistoryService';
import type { TaskData } from '@/data/projectData';

const KEYS = [
  'epic_tasks_data_v1',
  'epic_gamification_tasks_v1',
  'epic_xp_history_v1',
  'epic_users_db',
  'epic_users_v1',
];

describe('XP History delta on task completion', () => {
  beforeEach(() => {
    // reset relevant storage between tests
    KEYS.forEach(k => localStorage.removeItem(k));
    // seed canonical auth DB with one user to resolve assignedTo
    localStorage.setItem('epic_users_db', JSON.stringify([
      { id: 'u1', email: 'gabriel@epic.com', name: 'Gabriel' },
    ]));
  });

  it('records positive XP delta when a task becomes completed', () => {
    const base: TaskData = {
      id: 1,
      tarefa: 'Implementar feature X',
      responsavel: 'Gabriel',
      descricao: 'Teste de conclusão',
      inicio: '2025-01-01',
      prazo: '2025-01-10',
      fim: '',
      duracaoDiasUteis: 0,
      atrasoDiasUteis: 0,
      atendeuPrazo: true,
      status: 'in-progress',
      prioridade: 'media',
    };

    // First save: not completed yet -> no XP history
    saveTasksData([base]);
    expect(getUserXpHistory('u1').length).toBe(0);

    // Second save: mark as completed before the deadline
    const completed: TaskData = {
      ...base,
      fim: '2025-01-09',
      atendeuPrazo: true,
      status: 'completed',
      duracaoDiasUteis: 7,
      atrasoDiasUteis: 0,
    };
    saveTasksData([completed]);

    const hist = getUserXpHistory('u1');
    expect(hist.length).toBe(1);
    expect(hist[0].xp).toBeGreaterThan(0);
    expect(hist[0].source).toBe('task');
    // Friendly description should include a completion hint
    expect(hist[0].description.toLowerCase()).toContain('tarefa');

    // Gamification tasks should reflect completion
    const gamTasks = getGamificationTasks();
    expect(gamTasks.length).toBe(1);
    expect(gamTasks[0].status).toBe('completed');
    expect(gamTasks[0].assignedTo).toBe('u1');

    // Idempotency: saving again without changes should not add a new entry
    saveTasksData([completed]);
    const hist2 = getUserXpHistory('u1');
    expect(hist2.length).toBe(1);
  });
});
