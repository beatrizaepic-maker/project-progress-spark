import { TaskData } from '@/data/projectData';

export interface KPIResults {
  // Dashboard KPIs
  projectDeadlineStatus: 'on-time' | 'at-risk' | 'delayed';
  projectCompletionPercentage: number;
  averageDelay: number;
  standardDeviation: number;
  
  // Analytics KPIs
  averageProduction: number;
  mode: { value: number; frequency: number; percentage: number };
  median: number;
  delayDistribution: Array<{ range: string; count: number; percentage: number }>;
  
  // Tasks KPIs
  taskDetails: Array<{
    id: number;
    workingDaysDelay: number;
    deadlineStatus: 'on-time' | 'at-risk' | 'delayed';
  }>;
  
  // Metadata
  lastUpdated: Date;
  totalTasks: number;
  completedTasks: number;
}

export interface KPIConfig {
  outlierThreshold: number; // IQR multiplier (default: 1.5)
  workingDaysOnly: boolean; // true
  holidays: Date[]; // lista de feriados
  riskThresholdDays: number; // dias para status 'at-risk'
  modeGroupingInterval: number; // agrupamento para moda (default: 0.5 dias)
}

export class KPICalculator {
  private config: KPIConfig;

  constructor(config: Partial<KPIConfig> = {}) {
    this.config = {
      outlierThreshold: 1.5,
      workingDaysOnly: true,
      holidays: [],
      riskThresholdDays: 1,
      modeGroupingInterval: 0.5,
      ...config
    };
  }

  /**
   * Calcula todos os KPIs baseado nos dados das tarefas
   */
  calculateAll(tasks: TaskData[]): KPIResults {
    if (!tasks || tasks.length === 0) {
      return this.getEmptyResults();
    }

    const durations = tasks.map(t => t.duracaoDiasUteis);
    const delays = tasks.map(t => t.atrasoDiasUteis);
    const completedTasks = tasks.filter(t => t.fim !== '').length;

    return {
      // Dashboard KPIs
      projectDeadlineStatus: this.calculateProjectDeadlineStatus(tasks),
      projectCompletionPercentage: this.calculateCompletionPercentage(tasks),
      averageDelay: this.calculateAverage(delays),
      standardDeviation: this.calculateStandardDeviation(durations),
      
      // Analytics KPIs
      averageProduction: this.calculateAverage(durations),
      mode: this.calculateMode(durations),
      median: this.calculateMedian(this.removeOutliers(durations)),
      delayDistribution: this.calculateDelayDistribution(delays),
      
      // Tasks KPIs
      taskDetails: this.calculateTaskDetails(tasks),
      
      // Metadata
      lastUpdated: new Date(),
      totalTasks: tasks.length,
      completedTasks: completedTasks
    };
  }

  /**
   * Calcula o número de dias úteis entre duas datas
   */
  calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      // 0 = Domingo, 6 = Sábado
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Verifica se não é feriado
        if (!this.isHoliday(current)) {
          count++;
        }
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  /**
   * Remove outliers usando o método IQR (Interquartile Range)
   */
  removeOutliers(values: number[]): number[] {
    if (values.length < 4) return values;

    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - (this.config.outlierThreshold * iqr);
    const upperBound = q3 + (this.config.outlierThreshold * iqr);
    
    return values.filter(value => value >= lowerBound && value <= upperBound);
  }

  /**
   * Calcula a moda (valor mais frequente) com agrupamento
   */
  calculateMode(values: number[]): { value: number; frequency: number; percentage: number } {
    if (values.length === 0) return { value: 0, frequency: 0, percentage: 0 };

    // Agrupa valores por intervalos
    const grouped: { [key: string]: number[] } = {};
    
    values.forEach(value => {
      const groupKey = Math.floor(value / this.config.modeGroupingInterval) * this.config.modeGroupingInterval;
      const key = groupKey.toString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(value);
    });

    // Encontra o grupo com maior frequência
    let maxFrequency = 0;
    let modeGroup = '0';
    
    Object.entries(grouped).forEach(([key, group]) => {
      if (group.length > maxFrequency) {
        maxFrequency = group.length;
        modeGroup = key;
      }
    });

    const modeValue = parseFloat(modeGroup);
    const percentage = (maxFrequency / values.length) * 100;

    return {
      value: modeValue,
      frequency: maxFrequency,
      percentage: Math.round(percentage * 10) / 10
    };
  }

  /**
   * Calcula a média de um array de números
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }

  /**
   * Calcula o desvio padrão
   */
  private calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = this.calculateAverage(values);
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const variance = this.calculateAverage(squaredDifferences);
    
    return Math.round(Math.sqrt(variance) * 10) / 10;
  }

  /**
   * Calcula a mediana
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  /**
   * Calcula o status do prazo do projeto
   */
  private calculateProjectDeadlineStatus(tasks: TaskData[]): 'on-time' | 'at-risk' | 'delayed' {
    const delayedTasks = tasks.filter(t => !t.atendeuPrazo).length;
    const totalTasks = tasks.length;
    const delayedPercentage = (delayedTasks / totalTasks) * 100;

    if (delayedPercentage === 0) return 'on-time';
    if (delayedPercentage <= 20) return 'at-risk';
    return 'delayed';
  }

  /**
   * Calcula a porcentagem de conclusão do projeto
   */
  private calculateCompletionPercentage(tasks: TaskData[]): number {
    const completedTasks = tasks.filter(t => t.fim !== '').length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  /**
   * Calcula a distribuição de atrasos por faixas
   */
  private calculateDelayDistribution(delays: number[]): Array<{ range: string; count: number; percentage: number }> {
    const ranges = [
      { range: '0 dias', min: 0, max: 0 },
      { range: '1-2 dias', min: 1, max: 2 },
      { range: '3-5 dias', min: 3, max: 5 },
      { range: '6-10 dias', min: 6, max: 10 },
      { range: '10+ dias', min: 11, max: Infinity }
    ];

    return ranges.map(range => {
      const count = delays.filter(delay => delay >= range.min && delay <= range.max).length;
      const percentage = delays.length > 0 ? (count / delays.length) * 100 : 0;
      
      return {
        range: range.range,
        count,
        percentage: Math.round(percentage * 10) / 10
      };
    });
  }

  /**
   * Calcula detalhes específicos de cada tarefa
   */
  private calculateTaskDetails(tasks: TaskData[]): Array<{
    id: number;
    workingDaysDelay: number;
    deadlineStatus: 'on-time' | 'at-risk' | 'delayed';
  }> {
    return tasks.map(task => ({
      id: task.id,
      workingDaysDelay: task.atrasoDiasUteis,
      deadlineStatus: this.getTaskDeadlineStatus(task.atrasoDiasUteis)
    }));
  }

  /**
   * Determina o status de prazo de uma tarefa individual
   */
  private getTaskDeadlineStatus(delay: number): 'on-time' | 'at-risk' | 'delayed' {
    if (delay === 0) return 'on-time';
    if (delay <= this.config.riskThresholdDays) return 'at-risk';
    return 'delayed';
  }

  /**
   * Verifica se uma data é feriado
   */
  private isHoliday(date: Date): boolean {
    return this.config.holidays.some(holiday => 
      holiday.getTime() === date.getTime()
    );
  }

  /**
   * Retorna resultados vazios para quando não há dados
   */
  private getEmptyResults(): KPIResults {
    return {
      projectDeadlineStatus: 'on-time',
      projectCompletionPercentage: 0,
      averageDelay: 0,
      standardDeviation: 0,
      averageProduction: 0,
      mode: { value: 0, frequency: 0, percentage: 0 },
      median: 0,
      delayDistribution: [],
      taskDetails: [],
      lastUpdated: new Date(),
      totalTasks: 0,
      completedTasks: 0
    };
  }
}

// Instância padrão do calculador
export const kpiCalculator = new KPICalculator();