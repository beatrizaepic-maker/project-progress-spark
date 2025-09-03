/**
 * Teste de Performance Simplificado
 * 
 * Testa performance básica sem dependências problemáticas
 */

import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';
import { appStateManager } from '@/services/appStateManager';
import { mockTaskData } from '@/data/projectData';

// Gerador de dados simples
const generateTestData = (size: number) => {
  return Array.from({ length: size }, (_, i) => ({
    ...mockTaskData[i % mockTaskData.length],
    id: i,
    tarefa: `Teste ${i}`
  }));
};

describe('Performance - Testes Básicos', () => {
  it('deve atualizar estado rapidamente', () => {
    const largeDataset = generateTestData(1000);
    
    const startTime = performance.now();
    appStateManager.updateTasks(largeDataset);
    const endTime = performance.now();
    
    const executionTime = endTime - startTime;
    
    // Deve ser rápido (< 100ms)
    expect(executionTime).toBeLessThan(100);
    
    // Verificar se dados foram atualizados
    const state = appStateManager.getState();
    expect(state.tasks.length).toBe(1000);
  });

  it('deve gerenciar cache eficientemente', () => {
    const startTime = performance.now();
    
    // Adicionar 100 entradas ao cache
    for (let i = 0; i < 100; i++) {
      appStateManager.updateKPICache(`test-${i}`, {
        value: i,
        timestamp: new Date()
      });
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Deve ser eficiente (< 50ms)
    expect(executionTime).toBeLessThan(50);
    
    // Verificar cache
    const metrics = appStateManager.getAppMetrics();
    expect(metrics.cacheSize).toBe(100);
  });

  it('deve notificar listeners rapidamente', () => {
    let notificationCount = 0;
    const listeners: (() => void)[] = [];
    
    // Registrar 10 listeners
    for (let i = 0; i < 10; i++) {
      const unsubscribe = appStateManager.subscribe(() => {
        notificationCount++;
      });
      listeners.push(unsubscribe);
    }
    
    const startTime = performance.now();
    appStateManager.updateTasks(generateTestData(500));
    const endTime = performance.now();
    
    const executionTime = endTime - startTime;
    
    // Deve ser rápido
    expect(executionTime).toBeLessThan(20);
    expect(notificationCount).toBe(10);
    
    // Cleanup
    listeners.forEach(unsubscribe => unsubscribe());
  });

  it('deve escalar linearmente', () => {
    const sizes = [100, 200, 400];
    const times: number[] = [];
    
    for (const size of sizes) {
      const dataset = generateTestData(size);
      
      const startTime = performance.now();
      appStateManager.updateTasks(dataset);
      const endTime = performance.now();
      
      times.push(endTime - startTime);
    }
    
    // Crescimento deve ser aproximadamente linear
    // (tempo para 400 não deve ser > 5x tempo para 100)
    const ratio = times[2] / times[0];
    expect(ratio).toBeLessThan(5);
  });

  it('deve manter uso de memória controlado', () => {
    const memoryBefore = appStateManager.getAppMetrics().memoryUsage;
    
    // Adicionar dados grandes
    const largeDataset = generateTestData(2000);
    appStateManager.updateTasks(largeDataset);
    
    const memoryAfter = appStateManager.getAppMetrics().memoryUsage;
    const memoryIncrease = memoryAfter - memoryBefore;
    
    // Aumento deve ser proporcional mas não excessivo
    expect(memoryIncrease).toBeGreaterThan(0);
    expect(memoryIncrease).toBeLessThan(1000000); // < 1MB
  });

  it('deve limpar memória após reset', () => {
    // Adicionar dados
    appStateManager.updateTasks(generateTestData(1000));
    appStateManager.updateKPICache('large-data', {
      data: Array.from({ length: 1000 }, (_, i) => `item-${i}`)
    });
    
    const memoryWithData = appStateManager.getAppMetrics().memoryUsage;
    
    // Reset
    appStateManager.reset();
    const memoryAfterReset = appStateManager.getAppMetrics().memoryUsage;
    
    // Memória deve diminuir significativamente
    expect(memoryAfterReset).toBeLessThan(memoryWithData * 0.5);
  });
});
