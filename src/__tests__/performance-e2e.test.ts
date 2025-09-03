/**
 * Testes de Performance da Aplicação Integrada
 * 
 * Testa performance, memória e responsividade
 * da aplicação com datasets grandes.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { performance } from 'perf_hooks';

import { appStateManager } from '@/services/appStateManager';
import { KPICalculator } from '@/services/kpiCalculator';
import { TaskData } from '@/data/projectData';

// Gerador de dados de teste grandes
const generateLargeDataset = (size: number): TaskData[] => {
  const tasks: TaskData[] = [];
  const startDate = new Date('2024-01-01');
  
  for (let i = 0; i < size; i++) {
    const dataInicio = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const prazoFinal = new Date(dataInicio.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);
    const dataFim = new Date(dataInicio.getTime() + Math.random() * 16 * 24 * 60 * 60 * 1000);
    
    tasks.push({
      id: i,
      tarefa: `Tarefa ${i}`,
      responsavel: `Responsável ${i % 10}`,
      dataInicio: dataInicio.toISOString().split('T')[0],
      prazoFinal: prazoFinal.toISOString().split('T')[0],
      dataFim: dataFim.toISOString().split('T')[0],
      atendeuPrazo: dataFim <= prazoFinal,
      observacoes: `Observações da tarefa ${i}`
    });
  }
  
  return tasks;
};

describe('Testes de Performance - Aplicação Integrada', () => {
  let calculator: KPICalculator;
  let largeDataset: TaskData[];
  
  beforeEach(() => {
    calculator = new KPICalculator();
    largeDataset = generateLargeDataset(1000); // 1000 tarefas
    
    // Limpar cache entre testes
    appStateManager.clearCache();
  });

  afterEach(() => {
    // Limpeza
    appStateManager.reset();
  });

  describe('Performance de Cálculos KPI', () => {
    it('deve calcular KPIs rapidamente com dataset grande (< 100ms)', async () => {
      const startTime = performance.now();
      
      const averageDelay = calculator.calculateAverageDelay(largeDataset);
      const standardDeviation = calculator.calculateStandardDeviation(largeDataset);
      const mode = calculator.calculateMode(largeDataset);
      const median = calculator.calculateMedian(largeDataset);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Verificar se todos os cálculos foram realizados
      expect(typeof averageDelay).toBe('number');
      expect(typeof standardDeviation).toBe('number');
      expect(typeof mode).toBe('number');
      expect(typeof median).toBe('number');
      
      // Verificar performance (deve ser < 100ms para 1000 tarefas)
      expect(executionTime).toBeLessThan(100);
      
      console.log(`KPI Calculation time for ${largeDataset.length} tasks: ${executionTime.toFixed(2)}ms`);
    });

    it('deve manter performance linear com aumento de dados', async () => {
      const sizes = [100, 500, 1000, 2000];
      const times: number[] = [];
      
      for (const size of sizes) {
        const dataset = generateLargeDataset(size);
        const startTime = performance.now();
        
        calculator.calculateAverageDelay(dataset);
        calculator.calculateStandardDeviation(dataset);
        
        const endTime = performance.now();
        times.push(endTime - startTime);
      }
      
      // Verificar se crescimento é aproximadamente linear
      const ratio1 = times[1] / times[0]; // 500/100
      const ratio2 = times[2] / times[1]; // 1000/500
      const ratio3 = times[3] / times[2]; // 2000/1000
      
      // Ratios devem estar dentro de uma faixa razoável (não exponencial)
      expect(ratio1).toBeLessThan(10);
      expect(ratio2).toBeLessThan(5);
      expect(ratio3).toBeLessThan(5);
      
      console.log('Performance scaling:', times.map((t, i) => `${sizes[i]}: ${t.toFixed(2)}ms`));
    });

    it('deve usar cache eficientemente para cálculos repetidos', async () => {
      const dataset = generateLargeDataset(500);
      
      // Primeira execução (sem cache)
      const startTime1 = performance.now();
      const result1 = calculator.calculateAverageDelay(dataset);
      const endTime1 = performance.now();
      const time1 = endTime1 - startTime1;
      
      // Segunda execução (com cache, se implementado)
      const startTime2 = performance.now();
      const result2 = calculator.calculateAverageDelay(dataset);
      const endTime2 = performance.now();
      const time2 = endTime2 - startTime2;
      
      // Resultados devem ser idênticos
      expect(result1).toBe(result2);
      
      // Segunda execução deve ser mais rápida (se cache estiver ativo)
      // ou pelo menos não significativamente mais lenta
      expect(time2).toBeLessThanOrEqual(time1 * 1.1);
      
      console.log(`Cache performance: First: ${time1.toFixed(2)}ms, Second: ${time2.toFixed(2)}ms`);
    });
  });

  describe('Performance de Gerenciamento de Estado', () => {
    it('deve atualizar estado rapidamente com datasets grandes', async () => {
      const dataset = generateLargeDataset(2000);
      
      const startTime = performance.now();
      appStateManager.updateTasks(dataset);
      const endTime = performance.now();
      
      const updateTime = endTime - startTime;
      
      // Atualização deve ser rápida (< 50ms)
      expect(updateTime).toBeLessThan(50);
      
      // Verificar se dados foram atualizados corretamente
      const state = appStateManager.getState();
      expect(state.tasks.length).toBe(2000);
      
      console.log(`State update time for ${dataset.length} tasks: ${updateTime.toFixed(2)}ms`);
    });

    it('deve gerenciar cache de KPIs eficientemente', async () => {
      const dataset = generateLargeDataset(500);
      
      // Adicionar múltiplos resultados ao cache
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        appStateManager.updateKPICache(`test-key-${i}`, {
          averageDelay: Math.random() * 10,
          standardDeviation: Math.random() * 5,
          totalTasks: dataset.length,
          timestamp: new Date()
        });
      }
      
      const endTime = performance.now();
      const cacheTime = endTime - startTime;
      
      // Cache deve ser eficiente (< 20ms para 100 entradas)
      expect(cacheTime).toBeLessThan(20);
      
      // Verificar se cache foi populado
      const metrics = appStateManager.getAppMetrics();
      expect(metrics.cacheSize).toBe(100);
      
      console.log(`Cache management time for 100 entries: ${cacheTime.toFixed(2)}ms`);
    });

    it('deve notificar listeners rapidamente', async () => {
      const dataset = generateLargeDataset(1000);
      let notificationCount = 0;
      
      // Registrar múltiplos listeners
      const listeners = [];
      for (let i = 0; i < 10; i++) {
        const unsubscribe = appStateManager.subscribe(() => {
          notificationCount++;
        });
        listeners.push(unsubscribe);
      }
      
      const startTime = performance.now();
      appStateManager.updateTasks(dataset);
      const endTime = performance.now();
      
      const notificationTime = endTime - startTime;
      
      // Notificação deve ser rápida
      expect(notificationTime).toBeLessThan(10);
      
      // Todos os listeners devem ter sido notificados
      expect(notificationCount).toBe(10);
      
      // Cleanup
      listeners.forEach(unsubscribe => unsubscribe());
      
      console.log(`Listener notification time for 10 listeners: ${notificationTime.toFixed(2)}ms`);
    });
  });

  describe('Performance de Renderização', () => {
    it('deve renderizar componentes rapidamente com muitos dados', async () => {
      // Este teste seria mais completo com React Testing Library
      // mas vamos simular o cenário
      
      const dataset = generateLargeDataset(500);
      
      const startTime = performance.now();
      
      // Simular processamento que aconteceria durante renderização
      const processedData = dataset.map(task => ({
        ...task,
        delay: calculator.calculateTaskDelay(task),
        status: task.atendeuPrazo ? 'completed' : 'delayed'
      }));
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Processamento deve ser eficiente
      expect(processingTime).toBeLessThan(50);
      expect(processedData.length).toBe(dataset.length);
      
      console.log(`Data processing time for rendering ${dataset.length} tasks: ${processingTime.toFixed(2)}ms`);
    });

    it('deve manter responsividade durante operações pesadas', async () => {
      const dataset = generateLargeDataset(1000);
      
      // Simular múltiplas operações simultâneas
      const operations = [
        () => calculator.calculateAverageDelay(dataset),
        () => calculator.calculateStandardDeviation(dataset),
        () => calculator.calculateMode(dataset),
        () => calculator.calculateMedian(dataset),
        () => appStateManager.updateTasks(dataset)
      ];
      
      const startTime = performance.now();
      
      // Executar operações em paralelo
      const results = await Promise.all(operations.map(op => 
        new Promise(resolve => {
          setTimeout(() => resolve(op()), 0);
        })
      ));
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Operações paralelas devem completar rapidamente
      expect(totalTime).toBeLessThan(200);
      expect(results.length).toBe(operations.length);
      
      console.log(`Parallel operations time: ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Uso de Memória', () => {
    it('deve manter uso de memória dentro de limites aceitáveis', () => {
      const dataset = generateLargeDataset(5000); // Dataset muito grande
      
      // Medir uso de memória antes
      const memoryBefore = appStateManager.getAppMetrics().memoryUsage;
      
      // Adicionar dados
      appStateManager.updateTasks(dataset);
      
      // Adicionar cache
      for (let i = 0; i < 50; i++) {
        appStateManager.updateKPICache(`memory-test-${i}`, {
          averageDelay: Math.random() * 10,
          data: new Array(100).fill('test')
        });
      }
      
      // Medir uso de memória depois
      const memoryAfter = appStateManager.getAppMetrics().memoryUsage;
      const memoryIncrease = memoryAfter - memoryBefore;
      
      // Aumento de memória deve ser proporcional aos dados
      expect(memoryIncrease).toBeGreaterThan(0);
      
      // Mas não deve ser excessivo (< 10MB para 5000 tarefas)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      
      console.log(`Memory usage increase: ${(memoryIncrease / 1024).toFixed(2)}KB`);
    });

    it('deve liberar memória adequadamente após limpeza', () => {
      const dataset = generateLargeDataset(1000);
      
      // Adicionar dados e cache
      appStateManager.updateTasks(dataset);
      appStateManager.updateKPICache('test', { data: 'large data' });
      
      const memoryWithData = appStateManager.getAppMetrics().memoryUsage;
      
      // Limpar dados
      appStateManager.reset();
      
      const memoryAfterReset = appStateManager.getAppMetrics().memoryUsage;
      
      // Memória deve ter diminuído significativamente
      expect(memoryAfterReset).toBeLessThan(memoryWithData * 0.1);
      
      console.log(`Memory before reset: ${(memoryWithData / 1024).toFixed(2)}KB`);
      console.log(`Memory after reset: ${(memoryAfterReset / 1024).toFixed(2)}KB`);
    });
  });

  describe('Benchmarks Comparativos', () => {
    it('deve superar benchmarks mínimos de performance', async () => {
      const benchmarks = {
        'kpi-calculation-1000-tasks': 100, // 100ms máximo
        'state-update-2000-tasks': 50,     // 50ms máximo
        'cache-operations-100-entries': 20, // 20ms máximo
      };
      
      // Teste 1: Cálculo de KPIs
      const dataset1000 = generateLargeDataset(1000);
      const start1 = performance.now();
      calculator.calculateAverageDelay(dataset1000);
      calculator.calculateStandardDeviation(dataset1000);
      const time1 = performance.now() - start1;
      
      expect(time1).toBeLessThan(benchmarks['kpi-calculation-1000-tasks']);
      
      // Teste 2: Atualização de Estado
      const dataset2000 = generateLargeDataset(2000);
      const start2 = performance.now();
      appStateManager.updateTasks(dataset2000);
      const time2 = performance.now() - start2;
      
      expect(time2).toBeLessThan(benchmarks['state-update-2000-tasks']);
      
      // Teste 3: Operações de Cache
      const start3 = performance.now();
      for (let i = 0; i < 100; i++) {
        appStateManager.updateKPICache(`bench-${i}`, { test: 'data' });
      }
      const time3 = performance.now() - start3;
      
      expect(time3).toBeLessThan(benchmarks['cache-operations-100-entries']);
      
      console.log('Benchmark Results:');
      console.log(`  KPI Calculation (1000 tasks): ${time1.toFixed(2)}ms (limit: ${benchmarks['kpi-calculation-1000-tasks']}ms)`);
      console.log(`  State Update (2000 tasks): ${time2.toFixed(2)}ms (limit: ${benchmarks['state-update-2000-tasks']}ms)`);
      console.log(`  Cache Operations (100 entries): ${time3.toFixed(2)}ms (limit: ${benchmarks['cache-operations-100-entries']}ms)`);
    });
  });
});
