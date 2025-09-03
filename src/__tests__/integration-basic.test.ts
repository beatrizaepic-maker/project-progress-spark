/**
 * Teste de Integração Simplificado
 * 
 * Testa integração básica sem dependências problemáticas
 */

import { describe, it, expect } from 'vitest';
import { appStateManager } from '@/services/appStateManager';
import { mockTaskData } from '@/data/projectData';

describe('Integração End-to-End - Básica', () => {
  it('deve integrar corretamente o gerenciador de estado', () => {
    // Teste básico de integração
    appStateManager.updateTasks(mockTaskData);
    const state = appStateManager.getState();
    
    expect(state.tasks.length).toBe(mockTaskData.length);
    expect(state.lastUpdate).toBeInstanceOf(Date);
  });

  it('deve gerenciar cache de KPIs', () => {
    const testData = { test: 'data', timestamp: new Date() };
    
    appStateManager.updateKPICache('test-key', testData);
    const cached = appStateManager.getKPIFromCache('test-key');
    
    expect(cached).toEqual(testData);
  });

  it('deve atualizar preferências do usuário', () => {
    const newPrefs = { theme: 'dark' as const, compactView: true };
    
    appStateManager.updateUserPreferences(newPrefs);
    const prefs = appStateManager.getUserPreferences();
    
    expect(prefs.theme).toBe('dark');
    expect(prefs.compactView).toBe(true);
  });

  it('deve resetar estado corretamente', () => {
    // Adicionar dados
    appStateManager.updateTasks(mockTaskData);
    appStateManager.updateKPICache('test', { data: 'test' });
    
    // Reset
    appStateManager.reset();
    const state = appStateManager.getState();
    
    expect(state.tasks.length).toBe(0);
    expect(state.kpiCache.size).toBe(0);
  });

  it('deve calcular métricas da aplicação', () => {
    appStateManager.updateTasks(mockTaskData);
    const metrics = appStateManager.getAppMetrics();
    
    expect(metrics.totalTasks).toBe(mockTaskData.length);
    expect(metrics.lastUpdate).toBeInstanceOf(Date);
    expect(typeof metrics.memoryUsage).toBe('number');
  });

  it('deve gerenciar contexto de navegação', () => {
    appStateManager.updateNavigationContext('analytics', 'user-click');
    const context = appStateManager.getNavigationContext();
    
    expect(context.currentPage).toBe('analytics');
    expect(context.lastAction).toBe('user-click');
    expect(context.breadcrumb).toContain('Análise Visual');
  });
});
