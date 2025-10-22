import { describe, it, expect, beforeEach } from 'vitest';
import { KPICalculator } from '../kpiCalculator';
import { TaskData } from '@/data/projectData';

describe('KPICalculator', () => {
  let calculator: KPICalculator;

  beforeEach(() => {
    calculator = new KPICalculator();
  });

  describe('Cálculos estatísticos básicos', () => {
    it('retorna valores padrão para dataset vazio', () => {
      const result = calculator.calculateAll([]);
      expect(result.averageProduction).toBe(0);
      expect(result.averageDelay).toBe(0);
      expect(result.standardDeviation).toBe(0);
      expect(result.median).toBe(0);
      expect(result.mode).toBe(0);
    });

    it('calcula corretamente para dataset com uma tarefa', () => {
      const testTask: TaskData = {
        id: 1,
        tarefa: "Teste",
        inicio: "2024-01-15",
        fim: "2024-01-19",
        prazo: "2024-01-18",
        duracaoDiasUteis: 4,
        atrasoDiasUteis: 1,
        atendeuPrazo: false,
        status: 'completed',
        prioridade: 'media'
      };
      const result = calculator.calculateAll([testTask]);
      expect(result.averageProduction).toBe(4);
      expect(result.averageDelay).toBe(1);
    });
  });

  describe('Cálculo de dias úteis', () => {
    it('calcula dias úteis excluindo fins de semana', () => {
      const startDate = new Date('2024-01-15'); // Segunda-feira
      const endDate = new Date('2024-01-19');   // Sexta-feira

      const workingDays = calculator.calculateWorkingDays(startDate, endDate);
      expect(workingDays).toBe(4);
    });

    it('retorna 0 para mesmo dia', () => {
      const date = new Date('2024-01-15');
      const workingDays = calculator.calculateWorkingDays(date, date);
      expect(workingDays).toBe(0);
    });
  });
});