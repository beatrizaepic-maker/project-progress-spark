import { KPICalculator } from '../kpiCalculator';
import { TaskData } from '@/data/projectData';

describe('KPICalculator', () => {
  let calculator: KPICalculator;
  let mockTasks: TaskData[];

  beforeEach(() => {
    calculator = new KPICalculator();
    mockTasks = [
      {
        id: 1,
        tarefa: "Tarefa 1",
        inicio: "2024-01-15",
        fim: "2024-01-20",
        prazo: "2024-01-18",
        duracaoDiasUteis: 4,
        atrasoDiasUteis: 2,
        atendeuPrazo: false
      },
      {
        id: 2,
        tarefa: "Tarefa 2",
        inicio: "2024-01-22",
        fim: "2024-01-28",
        prazo: "2024-01-30",
        duracaoDiasUteis: 5,
        atrasoDiasUteis: 0,
        atendeuPrazo: true
      },
      {
        id: 3,
        tarefa: "Tarefa 3",
        inicio: "2024-01-29",
        fim: "2024-02-10",
        prazo: "2024-02-08",
        duracaoDiasUteis: 10,
        atrasoDiasUteis: 2,
        atendeuPrazo: false
      }
    ];
  });

  test('calcula média corretamente', () => {
    const result = calculator.calculateAll(mockTasks);
    expect(result.averageProduction).toBe(6.3); // (4+5+10)/3
    expect(result.averageDelay).toBe(1.3); // (2+0+2)/3
  });

  test('calcula desvio padrão corretamente', () => {
    const result = calculator.calculateAll(mockTasks);
    expect(result.standardDeviation).toBeGreaterThan(0);
  });

  test('calcula status do projeto corretamente', () => {
    const result = calculator.calculateAll(mockTasks);
    // 2 de 3 tarefas atrasadas = 66% > 20% = delayed
    expect(result.projectDeadlineStatus).toBe('delayed');
  });

  test('calcula porcentagem de conclusão', () => {
    const result = calculator.calculateAll(mockTasks);
    expect(result.projectCompletionPercentage).toBe(100); // Todas têm data de fim
  });

  test('remove outliers corretamente', () => {
    const values = [1, 2, 3, 4, 5, 100]; // 100 é outlier
    const filtered = calculator.removeOutliers(values);
    expect(filtered).not.toContain(100);
    expect(filtered.length).toBeLessThan(values.length);
  });

  test('calcula moda corretamente', () => {
    const values = [2, 2, 3, 4, 4, 4, 5];
    const result = calculator.calculateMode(values);
    expect(result.value).toBe(4); // Valor mais frequente
    expect(result.frequency).toBe(3);
  });

  test('calcula dias úteis excluindo fins de semana', () => {
    const start = new Date('2024-01-15'); // Segunda
    const end = new Date('2024-01-19'); // Sexta
    const workingDays = calculator.calculateWorkingDays(start, end);
    expect(workingDays).toBe(5); // Segunda a sexta
  });

  test('retorna resultados vazios para array vazio', () => {
    const result = calculator.calculateAll([]);
    expect(result.totalTasks).toBe(0);
    expect(result.averageDelay).toBe(0);
    expect(result.projectDeadlineStatus).toBe('on-time');
  });

  test('calcula distribuição de atrasos', () => {
    const result = calculator.calculateAll(mockTasks);
    expect(result.delayDistribution).toHaveLength(5);
    expect(result.delayDistribution[0].range).toBe('0 dias');
    expect(result.delayDistribution[1].range).toBe('1-2 dias');
  });

  test('calcula detalhes das tarefas', () => {
    const result = calculator.calculateAll(mockTasks);
    expect(result.taskDetails).toHaveLength(3);
    expect(result.taskDetails[0].deadlineStatus).toBe('delayed');
    expect(result.taskDetails[1].deadlineStatus).toBe('on-time');
  });
});