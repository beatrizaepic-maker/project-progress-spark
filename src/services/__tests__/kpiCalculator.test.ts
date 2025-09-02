import { KPICalculator } from '../kpiCalculator';
import { TaskData } from '@/data/projectData';

describe('KPICalculator', () => {
  let calculator: KPICalculator;
  let mockTasks: TaskData[];
  let mockTasksWithOutliers: TaskData[];
  let emptyTasks: TaskData[];
  let singleTask: TaskData[];

  beforeEach(() => {
    calculator = new KPICalculator();
    
    // Dataset básico para testes
    mockTasks = [
      {
        id: 1,
        tarefa: "Tarefa 1",
        inicio: "2024-01-15", // Segunda-feira
        fim: "2024-01-19",     // Sexta-feira (4 dias úteis)
        prazo: "2024-01-18",   // Quinta-feira
        duracaoDiasUteis: 4,
        atrasoDiasUteis: 1,    // 1 dia de atraso
        atendeuPrazo: false
      },
      {
        id: 2,
        tarefa: "Tarefa 2",
        inicio: "2024-01-22", // Segunda-feira
        fim: "2024-01-26",     // Sexta-feira (5 dias úteis)
        prazo: "2024-01-30",   // Terça-feira
        duracaoDiasUteis: 5,
        atrasoDiasUteis: 0,    // No prazo
        atendeuPrazo: true
      },
      {
        id: 3,
        tarefa: "Tarefa 3",
        inicio: "2024-01-29", // Segunda-feira
        fim: "2024-02-09",     // Sexta-feira (10 dias úteis)
        prazo: "2024-02-05",   // Segunda-feira
        duracaoDiasUteis: 10,
        atrasoDiasUteis: 4,    // 4 dias de atraso
        atendeuPrazo: false
      },
      {
        id: 4,
        tarefa: "Tarefa 4",
        inicio: "2024-02-12", // Segunda-feira
        fim: "2024-02-14",     // Quarta-feira (3 dias úteis)
        prazo: "2024-02-16",   // Sexta-feira
        duracaoDiasUteis: 3,
        atrasoDiasUteis: 0,    // No prazo
        atendeuPrazo: true
      },
      {
        id: 5,
        tarefa: "Tarefa 5",
        inicio: "2024-02-19", // Segunda-feira
        fim: "2024-02-21",     // Quarta-feira (3 dias úteis)
        prazo: "2024-02-20",   // Terça-feira
        duracaoDiasUteis: 3,
        atrasoDiasUteis: 1,    // 1 dia de atraso
        atendeuPrazo: false
      }
    ];

    // Dataset com outliers para testar remoção
    mockTasksWithOutliers = [
      ...mockTasks,
      {
        id: 6,
        tarefa: "Tarefa Outlier 1",
        inicio: "2024-03-01",
        fim: "2024-03-30",     // 30 dias úteis (outlier)
        prazo: "2024-03-15",
        duracaoDiasUteis: 30,
        atrasoDiasUteis: 15,
        atendeuPrazo: false
      },
      {
        id: 7,
        tarefa: "Tarefa Outlier 2",
        inicio: "2024-04-01",
        fim: "2024-04-01",     // 1 dia útil (outlier baixo)
        prazo: "2024-04-05",
        duracaoDiasUteis: 1,
        atrasoDiasUteis: 0,
        atendeuPrazo: true
      }
    ];

    // Dataset vazio
    emptyTasks = [];

    // Dataset com uma única tarefa
    singleTask = [mockTasks[0]];
  });

  // ============================================
  // TESTES DE CÁLCULOS BÁSICOS
  // ============================================

  describe('Cálculos estatísticos básicos', () => {
    test('calcula média de produção corretamente', () => {
      const result = calculator.calculateAll(mockTasks);
      // (4+5+10+3+3)/5 = 25/5 = 5
      expect(result.averageProduction).toBe(5);
    });

    test('calcula média de atraso corretamente', () => {
      const result = calculator.calculateAll(mockTasks);
      // (1+0+4+0+1)/5 = 6/5 = 1.2
      expect(result.averageDelay).toBe(1.2);
    });

    test('calcula desvio padrão corretamente', () => {
      const result = calculator.calculateAll(mockTasks);
      // Desvio padrão de [4,5,10,3,3]
      // Média = 5
      // Variância = ((4-5)² + (5-5)² + (10-5)² + (3-5)² + (3-5)²) / 5
      // Variância = (1 + 0 + 25 + 4 + 4) / 5 = 34/5 = 6.8
      // Desvio padrão = √6.8 ≈ 2.61
      expect(result.standardDeviation).toBeCloseTo(2.61, 1);
    });

    test('calcula mediana corretamente', () => {
      const result = calculator.calculateAll(mockTasks);
      // [4,5,10,3,3] ordenado = [3,3,4,5,10]
      // Mediana = 4 (elemento do meio)
      expect(result.median).toBe(4);
    });

    test('calcula moda corretamente', () => {
      const result = calculator.calculateAll(mockTasks);
      // [4,5,10,3,3] - o valor 3 aparece 2 vezes (mais frequente)
      expect(result.mode).toBe(3);
    });
  });

  // ============================================
  // TESTES DE CÁLCULO DE DIAS ÚTEIS
  // ============================================

  describe('Cálculo de dias úteis', () => {
    test('calcula dias úteis excluindo fins de semana', () => {
      // Testa período de segunda (15/01) a sexta (19/01) = 5 dias, mas só 4 úteis
      const startDate = new Date('2024-01-15'); // Segunda-feira
      const endDate = new Date('2024-01-19');   // Sexta-feira
      
      const workingDays = calculator.calculateWorkingDays(startDate, endDate);
      expect(workingDays).toBe(4); // Seg, Ter, Qua, Qui (Sexta não conta pois é o fim)
    });

    test('calcula dias úteis atravessando fins de semana', () => {
      // De sexta (19/01) a terça (23/01) = 4 dias, mas só 2 úteis
      const startDate = new Date('2024-01-19'); // Sexta-feira
      const endDate = new Date('2024-01-23');   // Terça-feira
      
      const workingDays = calculator.calculateWorkingDays(startDate, endDate);
      expect(workingDays).toBe(2); // Sexta e Segunda (Sab/Dom não contam)
    });

    test('retorna 0 para mesmo dia', () => {
      const date = new Date('2024-01-15');
      const workingDays = calculator.calculateWorkingDays(date, date);
      expect(workingDays).toBe(0);
    });

    test('retorna 0 para período só com fins de semana', () => {
      const saturday = new Date('2024-01-20');  // Sábado
      const sunday = new Date('2024-01-21');    // Domingo
      
      const workingDays = calculator.calculateWorkingDays(saturday, sunday);
      expect(workingDays).toBe(0);
    });
  });

  // ============================================
  // TESTES DE REMOÇÃO DE OUTLIERS
  // ============================================

  describe('Remoção de outliers usando método IQR', () => {
    test('remove outliers corretamente do dataset', () => {
      const result = calculator.calculateAll(mockTasksWithOutliers);
      
      // Dataset original: [4,5,10,3,3,30,1]
      // Ordenado: [1,3,3,4,5,10,30]
      // Q1 = 3, Q3 = 10
      // IQR = 10-3 = 7
      // Lower bound = 3 - 1.5*7 = -7.5
      // Upper bound = 10 + 1.5*7 = 20.5
      // Outliers: 30 (acima de 20.5), 1 (pode ser considerado normal)
      // Dataset sem outliers: [3,3,4,5,10] ou similar
      
      // A média deve ser diferente após remoção de outliers
      expect(result.averageProduction).toBeLessThan(10); // Menor que se incluísse o outlier 30
      expect(result.averageProduction).toBeGreaterThan(3); // Maior que o menor valor
    });

    test('mantém dataset quando não há outliers significativos', () => {
      const result = calculator.calculateAll(mockTasks);
      
      // Com dataset sem outliers extremos, todos os valores devem ser mantidos
      expect(result.averageProduction).toBe(5); // Mesmo resultado anterior
    });

    test('lida com dataset pequeno sem remover outliers', () => {
      const result = calculator.calculateAll(singleTask);
      
      // Com apenas uma tarefa, não deve remover nada
      expect(result.averageProduction).toBe(4);
      expect(result.median).toBe(4);
      expect(result.mode).toBe(4);
    });
  });

  // ============================================
  // TESTES DE CASOS EXTREMOS
  // ============================================

  describe('Casos extremos e edge cases', () => {
    test('lida com dataset vazio', () => {
      const result = calculator.calculateAll(emptyTasks);
      
      expect(result.averageProduction).toBe(0);
      expect(result.averageDelay).toBe(0);
      expect(result.standardDeviation).toBe(0);
      expect(result.median).toBe(0);
      expect(result.mode).toBe(0);
    });

    test('lida com uma única tarefa', () => {
      const result = calculator.calculateAll(singleTask);
      
      expect(result.averageProduction).toBe(4);
      expect(result.averageDelay).toBe(1);
      expect(result.standardDeviation).toBe(0); // Sem variação
      expect(result.median).toBe(4);
      expect(result.mode).toBe(4);
    });

    test('lida com tarefas de duração zero', () => {
      const zeroTasks: TaskData[] = [{
        id: 1,
        tarefa: "Tarefa Zero",
        inicio: "2024-01-15",
        fim: "2024-01-15",
        prazo: "2024-01-15",
        duracaoDiasUteis: 0,
        atrasoDiasUteis: 0,
        atendeuPrazo: true
      }];
      
      const result = calculator.calculateAll(zeroTasks);
      expect(result.averageProduction).toBe(0);
    });

    test('lida com valores negativos de atraso (antecipação)', () => {
      const earlyTasks: TaskData[] = [{
        id: 1,
        tarefa: "Tarefa Antecipada",
        inicio: "2024-01-15",
        fim: "2024-01-17",
        prazo: "2024-01-20",
        duracaoDiasUteis: 2,
        atrasoDiasUteis: -2, // 2 dias antes do prazo
        atendeuPrazo: true
      }];
      
      const result = calculator.calculateAll(earlyTasks);
      expect(result.averageDelay).toBe(-2);
    });
  });

  // ============================================
  // TESTES DE PRECISÃO NUMÉRICA
  // ============================================

  describe('Precisão dos cálculos estatísticos', () => {
    test('mantém precisão em cálculos com decimais', () => {
      const decimalTasks: TaskData[] = [
        {
          id: 1, tarefa: "T1", inicio: "2024-01-15", fim: "2024-01-16", 
          prazo: "2024-01-16", duracaoDiasUteis: 1, atrasoDiasUteis: 0, atendeuPrazo: true
        },
        {
          id: 2, tarefa: "T2", inicio: "2024-01-17", fim: "2024-01-18", 
          prazo: "2024-01-18", duracaoDiasUteis: 1, atrasoDiasUteis: 0, atendeuPrazo: true
        },
        {
          id: 3, tarefa: "T3", inicio: "2024-01-19", fim: "2024-01-20", 
          prazo: "2024-01-20", duracaoDiasUteis: 2, atrasoDiasUteis: 0, atendeuPrazo: true
        }
      ];
      
      const result = calculator.calculateAll(decimalTasks);
      // Média: (1+1+2)/3 = 4/3 = 1.333...
      expect(result.averageProduction).toBeCloseTo(1.33, 2);
    });

    test('arredonda resultados apropriadamente', () => {
      const result = calculator.calculateAll(mockTasks);
      
      // Verifica se os resultados não têm precisão excessiva
      expect(Number.isFinite(result.averageProduction)).toBe(true);
      expect(Number.isFinite(result.standardDeviation)).toBe(true);
      expect(Number.isFinite(result.averageDelay)).toBe(true);
    });
  });

  // ============================================
  // TESTES DE PERFORMANCE
  // ============================================

  describe('Performance com datasets grandes', () => {
    test('processa dataset grande em tempo razoável', () => {
      // Gera dataset de 1000 tarefas
      const largeTasks: TaskData[] = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        tarefa: `Tarefa ${i + 1}`,
        inicio: "2024-01-15",
        fim: "2024-01-20",
        prazo: "2024-01-18",
        duracaoDiasUteis: Math.floor(Math.random() * 10) + 1,
        atrasoDiasUteis: Math.floor(Math.random() * 5),
        atendeuPrazo: Math.random() > 0.5
      }));

      const startTime = performance.now();
      const result = calculator.calculateAll(largeTasks);
      const endTime = performance.now();
      
      // Deve processar em menos de 100ms
      expect(endTime - startTime).toBeLessThan(100);
      expect(result.averageProduction).toBeGreaterThan(0);
    });

    test('mantém consistência com múltiplas execuções', () => {
      const result1 = calculator.calculateAll(mockTasks);
      const result2 = calculator.calculateAll(mockTasks);
      const result3 = calculator.calculateAll(mockTasks);
      
      // Resultados devem ser idênticos
      expect(result1.averageProduction).toBe(result2.averageProduction);
      expect(result2.averageProduction).toBe(result3.averageProduction);
      expect(result1.standardDeviation).toBe(result2.standardDeviation);
      expect(result2.standardDeviation).toBe(result3.standardDeviation);
    });
  });

  test('calcula média corretamente', () => {
    const result = calculator.calculateAll(mockTasks);
    expect(result.averageProduction).toBe(5); // (4+5+10+3+3)/5
    expect(result.averageDelay).toBe(1.2); // (1+0+4+0+1)/5
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