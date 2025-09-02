import { describe, it, expect, beforeEach } from 'vitest';
import { KPICalculator } from '../kpiCalculator';
import type { TaskData } from '../../data/projectData';

describe('Advanced KPIs - Statistical Functions', () => {
  let calculator: KPICalculator;
  let complexDataset: TaskData[];
  let outliersDataset: TaskData[];

  beforeEach(() => {
    calculator = new KPICalculator();
    
    // Dataset complexo para testes estatísticos
    complexDataset = [
      {
        id: 1,
        tarefa: 'Task A - Early',
        inicio: '2024-01-01',
        fim: '2024-01-05',
        prazo: '2024-01-10',
        duracaoDiasUteis: 5,
        atrasoDiasUteis: -3, // 3 dias adiantado
        atendeuPrazo: true
      },
      {
        id: 2,
        tarefa: 'Task B - On Time',
        inicio: '2024-01-01',
        fim: '2024-01-10',
        prazo: '2024-01-10',
        duracaoDiasUteis: 8,
        atrasoDiasUteis: 0,
        atendeuPrazo: true
      },
      {
        id: 3,
        tarefa: 'Task C - Slight Delay',
        inicio: '2024-01-01',
        fim: '2024-01-12',
        prazo: '2024-01-10',
        duracaoDiasUteis: 9,
        atrasoDiasUteis: 2,
        atendeuPrazo: false
      },
      {
        id: 4,
        tarefa: 'Task D - Moderate Delay',
        inicio: '2024-01-01',
        fim: '2024-01-17',
        prazo: '2024-01-10',
        duracaoDiasUteis: 13,
        atrasoDiasUteis: 5,
        atendeuPrazo: false
      },
      {
        id: 5,
        tarefa: 'Task E - High Delay',
        inicio: '2024-01-01',
        fim: '2024-01-25',
        prazo: '2024-01-10',
        duracaoDiasUteis: 18,
        atrasoDiasUteis: 11,
        atendeuPrazo: false
      }
    ];

    // Dataset com outliers extremos
    outliersDataset = [
      ...complexDataset,
      {
        id: 6,
        tarefa: 'Task F - Extreme Outlier',
        inicio: '2024-01-01',
        fim: '2024-03-15',
        prazo: '2024-01-10',
        duracaoDiasUteis: 55,
        atrasoDiasUteis: 42, // Outlier extremo
        atendeuPrazo: false
      },
      {
        id: 7,
        tarefa: 'Task G - Negative Outlier',
        inicio: '2024-01-01',
        fim: '2024-01-02',
        prazo: '2024-01-20',
        duracaoDiasUteis: 1,
        atrasoDiasUteis: -14, // Outlier negativo
        atendeuPrazo: true
      }
    ];
  });

  describe('Working Days Calculation', () => {
    it('should calculate working days excluding weekends', () => {
      // Monday (01/01/2024) to Friday (05/01/2024) = 5 working days
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');
      const result = calculator.calculateWorkingDays(startDate, endDate);
      expect(result).toBe(5);
    });

    it('should handle periods spanning weekends', () => {
      // Monday (01/01) to Monday (08/01) = 6 working days (excludes Sat/Sun)
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-08');
      const result = calculator.calculateWorkingDays(startDate, endDate);
      expect(result).toBe(6);
    });

    it('should handle leap year February correctly', () => {
      // 2024 is leap year - test in February
      const startDate = new Date('2024-02-28');
      const endDate = new Date('2024-03-01');
      const result = calculator.calculateWorkingDays(startDate, endDate);
      expect(result).toBe(2); // 29/02 (Thursday) and 01/03 (Friday)
    });

    it('should handle end-of-year transitions', () => {
      const startDate = new Date('2023-12-29');
      const endDate = new Date('2024-01-02');
      const result = calculator.calculateWorkingDays(startDate, endDate);
      expect(result).toBe(2); // 29/12 (Friday) and 02/01 (Monday)
    });

    it('should return 0 for weekend-only periods', () => {
      const startDate = new Date('2024-01-06'); // Saturday
      const endDate = new Date('2024-01-07');   // Sunday
      const result = calculator.calculateWorkingDays(startDate, endDate);
      expect(result).toBe(0);
    });

    it('should handle same day calculation', () => {
      const date = new Date('2024-01-01');
      const result = calculator.calculateWorkingDays(date, date);
      expect(result).toBe(1);
    });
  });

  describe('Outlier Detection and Removal', () => {
    it('should remove outliers using IQR method', () => {
      const delays = [1, 2, 3, 4, 5, 6, 7, 50]; // 50 is outlier
      const cleaned = calculator.removeOutliers(delays);
      
      expect(cleaned).not.toContain(50);
      expect(cleaned.length).toBeLessThan(delays.length);
    });

    it('should preserve data when no outliers exist', () => {
      const delays = [1, 2, 3, 4, 5];
      const cleaned = calculator.removeOutliers(delays);
      
      expect(cleaned).toEqual(delays);
    });

    it('should handle multiple outliers', () => {
      const delays = [1, 2, 3, 4, 5, 50, 100]; // 50 and 100 are outliers
      const cleaned = calculator.removeOutliers(delays);
      
      expect(cleaned).not.toContain(50);
      expect(cleaned).not.toContain(100);
      expect(cleaned).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle edge cases', () => {
      expect(calculator.removeOutliers([])).toEqual([]);
      expect(calculator.removeOutliers([5])).toEqual([5]);
      expect(calculator.removeOutliers([5, 5, 5])).toEqual([5, 5, 5]);
    });

    it('should handle negative outliers', () => {
      const delays = [-50, 1, 2, 3, 4, 5]; // -50 is negative outlier
      const cleaned = calculator.removeOutliers(delays);
      
      expect(cleaned).not.toContain(-50);
    });
  });

  describe('Comprehensive KPI Calculation', () => {
    it('should calculate all KPIs with outlier removal', () => {
      const result = calculator.calculateAll(outliersDataset);
      
      // Verifica presença de todos os KPIs principais
      expect(result).toHaveProperty('averageDelay');
      expect(result).toHaveProperty('standardDeviation');
      expect(result).toHaveProperty('delayDistribution');
      expect(result).toHaveProperty('totalTasks');
      expect(result).toHaveProperty('lastUpdated');

      // Verifica se outliers foram considerados no total
      expect(result.totalTasks).toBe(7); // Todos os tasks são contados
    });

    it('should maintain accuracy with clean dataset', () => {
      const result = calculator.calculateAll(complexDataset);
      
      // Cálculos esperados para o dataset complexo
      expect(result.totalTasks).toBe(5);
      
      // Média deve estar na faixa esperada (-3, 0, 2, 5, 11)
      expect(result.averageDelay).toBeGreaterThan(-5);
      expect(result.averageDelay).toBeLessThan(15);
    });

    it('should handle performance with large datasets', () => {
      // Gera dataset grande para teste de performance
      const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        tarefa: `Task ${i + 1}`,
        inicio: '2024-01-01',
        fim: '2024-01-10',
        prazo: '2024-01-10',
        duracaoDiasUteis: 8,
        atrasoDiasUteis: Math.floor(Math.random() * 20) - 5, // -5 to 15 days
        atendeuPrazo: Math.random() > 0.3
      }));

      const startTime = performance.now();
      const result = calculator.calculateAll(largeTasks);
      const endTime = performance.now();

      expect(result.totalTasks).toBe(1000);
      expect(endTime - startTime).toBeLessThan(500); // Less than 500ms
    });
  });

  describe('Delay Distribution Analysis', () => {
    it('should categorize delays into proper ranges', () => {
      const result = calculator.calculateAll(complexDataset);
      
      expect(result.delayDistribution).toBeDefined();
      expect(Array.isArray(result.delayDistribution)).toBe(true);
      expect(result.delayDistribution.length).toBeGreaterThan(0);
      
      // Each distribution entry should have required properties
      result.delayDistribution.forEach(dist => {
        expect(dist).toHaveProperty('range');
        expect(dist).toHaveProperty('count');
        expect(dist).toHaveProperty('percentage');
      });
    });

    it('should handle empty dataset', () => {
      const result = calculator.calculateAll([]);
      
      expect(result.totalTasks).toBe(0);
      expect(result.averageDelay).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed task data gracefully', () => {
      const malformedTasks = [
        {
          id: 1,
          tarefa: 'Incomplete Task',
          inicio: 'invalid-date',
          fim: '2024-01-10',
          prazo: '2024-01-10',
          duracaoDiasUteis: 0,
          atrasoDiasUteis: 0,
          atendeuPrazo: true
        }
      ];

      expect(() => calculator.calculateAll(malformedTasks)).not.toThrow();
    });

    it('should handle tasks with negative durations', () => {
      const negativeTasks = [{
        id: 1,
        tarefa: 'Negative Duration',
        inicio: '2024-01-10',
        fim: '2024-01-05', // End before start
        prazo: '2024-01-10',
        duracaoDiasUteis: -3,
        atrasoDiasUteis: 0,
        atendeuPrazo: true
      }];

      const result = calculator.calculateAll(negativeTasks);
      expect(result.totalTasks).toBe(1);
    });

    it('should handle extreme date ranges', () => {
      const extremeTasks = [{
        id: 1,
        tarefa: 'Future Task',
        inicio: '2024-01-01',
        fim: '2030-01-01',
        prazo: '2024-01-10',
        duracaoDiasUteis: 1500,
        atrasoDiasUteis: 1490,
        atendeuPrazo: false
      }];

      expect(() => calculator.calculateAll(extremeTasks)).not.toThrow();
    });
  });

  describe('Statistical Accuracy', () => {
    it('should provide consistent results', () => {
      // Test multiple calculations with same data
      const result1 = calculator.calculateAll(complexDataset);
      const result2 = calculator.calculateAll(complexDataset);
      
      expect(result1.averageDelay).toBe(result2.averageDelay);
      expect(result1.standardDeviation).toBe(result2.standardDeviation);
      expect(result1.totalTasks).toBe(result2.totalTasks);
    });

    it('should handle floating point precision', () => {
      const precisionTasks = [{
        id: 1,
        tarefa: 'Precision Test',
        inicio: '2024-01-01',
        fim: '2024-01-01',
        prazo: '2024-01-01',
        duracaoDiasUteis: 0.1,
        atrasoDiasUteis: 0.1,
        atendeuPrazo: false
      }];

      const result = calculator.calculateAll(precisionTasks);
      expect(typeof result.averageDelay).toBe('number');
      expect(result.averageDelay).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Validation and Error Reporting', () => {
    it('should report validation results', () => {
      const result = calculator.calculateAll(complexDataset);
      
      expect(result).toHaveProperty('hasErrors');
      expect(result).toHaveProperty('errorCount');
      expect(result).toHaveProperty('criticalErrors');
      
      // With valid data, should have no critical errors
      expect(result.criticalErrors).toBe(false);
    });

    it('should handle calculation errors gracefully', () => {
      // Simulate error conditions
      const problematicTasks = [{
        id: 1,
        tarefa: 'Problem Task',
        inicio: '2024-01-01',
        fim: '2024-01-01',
        prazo: '2024-01-01',
        duracaoDiasUteis: null as any, // Null value should be handled
        atrasoDiasUteis: undefined as any, // Undefined value should be handled
        atendeuPrazo: true
      }];

      const result = calculator.calculateAll(problematicTasks);
      
      // Should not crash and should report errors
      expect(result.hasErrors).toBe(true);
      expect(result.errorCount).toBeGreaterThan(0);
    });
  });

  describe('Metadata and Performance', () => {
    it('should include calculation metadata', () => {
      const result = calculator.calculateAll(complexDataset);
      
      expect(result).toHaveProperty('lastUpdated');
      expect(result).toHaveProperty('calculationVersion');
      expect(result).toHaveProperty('calculationId');
      expect(result).toHaveProperty('processingTime');
      expect(result).toHaveProperty('dataHash');
      
      expect(result.lastUpdated).toBeInstanceOf(Date);
      expect(typeof result.processingTime).toBe('number');
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should generate unique calculation IDs', () => {
      const result1 = calculator.calculateAll(complexDataset);
      const result2 = calculator.calculateAll(complexDataset);
      
      expect(result1.calculationId).not.toBe(result2.calculationId);
    });

    it('should generate consistent data hashes for same data', () => {
      const result1 = calculator.calculateAll(complexDataset);
      const result2 = calculator.calculateAll([...complexDataset]); // Copy array
      
      expect(result1.dataHash).toBe(result2.dataHash);
    });
  });
});
