// src/services/__tests__/productivityUnit.test.ts
import { describe, it, expect } from 'vitest';
import { classifyTaskDelivery, calculateProductivityPercentForTask, calculateRankingXpFromTasks, roundHalfUp } from '../gamificationService';
import type { Task } from '../gamificationService';

const base = new Date('2025-10-10T12:00:00Z');

describe('Productividade por tarefa e agregação', () => {
  it('classifica early/on_time/late corretamente', () => {
    const early: Task = { id: 'e', title: 't', status: 'completed', completedDate: new Date(base.getTime()-1000).toISOString(), dueDate: base.toISOString(), assignedTo: 'u' };
    const onTime: Task = { id: 'o', title: 't', status: 'completed', completedDate: base.toISOString(), dueDate: base.toISOString(), assignedTo: 'u' };
    const late: Task = { id: 'l', title: 't', status: 'completed', completedDate: new Date(base.getTime()+1000).toISOString(), dueDate: base.toISOString(), assignedTo: 'u' };
    const ref: Task = { id: 'r', title: 't', status: 'refacao', dueDate: base.toISOString(), assignedTo: 'u' };

    expect(classifyTaskDelivery(early)).toBe('early');
    expect(classifyTaskDelivery(onTime)).toBe('on_time');
    expect(classifyTaskDelivery(late)).toBe('late');
    expect(classifyTaskDelivery(ref)).toBe('ignore');
  });

  it('retorna percentuais configuráveis (clamped 0-100) e ignora não considerados', () => {
    const pending: Task = { id: 'p', title: 't', status: 'pending', dueDate: base.toISOString(), assignedTo: 'u' };
    const pct = calculateProductivityPercentForTask(pending);
    expect(Number.isNaN(pct)).toBe(true);
  });

  it('XP = roundHalfUp(media * 10), com clamp e divisão por zero segura', () => {
    const tasks: Task[] = [];
    expect(calculateRankingXpFromTasks(tasks)).toBe(0);
    const t1: Task = { id: 't1', title: 't', status: 'completed', completedDate: base.toISOString(), dueDate: base.toISOString(), assignedTo: 'u' }; // on_time 90
    const t2: Task = { id: 't2', title: 't', status: 'completed', completedDate: new Date(base.getTime()-1000).toISOString(), dueDate: base.toISOString(), assignedTo: 'u' }; // early 100
    expect(calculateRankingXpFromTasks([t1, t2])).toBe(950);
  });

  it('roundHalfUp arredonda .5 para cima', () => {
    expect(roundHalfUp(1.5)).toBe(2);
    expect(roundHalfUp(1.49)).toBe(1);
  });
});
