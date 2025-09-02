import { TaskData } from '@/data/projectData';
import { kpiErrorHandler, ErrorType, ErrorSeverity } from './errorHandler';
import { dataValidator, ValidationResult } from './dataValidator';

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
  calculationVersion: string;
  calculationId: string;
  processingTime: number;
  dataHash: string;
  
  // Error handling
  hasErrors: boolean;
  errorCount: number;
  criticalErrors: boolean;
  
  // Validation results
  validationResult?: ValidationResult;
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
  private static readonly VERSION = '1.2.0';

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
   * Executa uma operação com tratamento de erro seguro
   */
  private safeExecute<T>(operation: () => T, defaultValue: T, context?: string): T {
    try {
      return operation();
    } catch (error) {
      kpiErrorHandler.createError(
        ErrorType.CALCULATION,
        ErrorSeverity.MEDIUM,
        error instanceof Error ? error.message : 'Erro desconhecido',
        context || 'KPICalculator',
        { originalError: error }
      );
      return defaultValue;
    }
  }

  /**
   * Gera ID único para o cálculo
   */
  private generateCalculationId(): string {
    return `calc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Gera hash dos dados de entrada
   */
  private generateDataHash(tasks: TaskData[]): string {
    const hashData = tasks.map(t => `${t.id}-${t.inicio}-${t.fim}-${t.prazo}`).join('|');
    let hash = 0;
    for (let i = 0; i < hashData.length; i++) {
      const char = hashData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Calcula todos os KPIs baseado nos dados das tarefas
   */
  calculateAll(tasks: TaskData[]): KPIResults {
    const startTime = performance.now();
    
    // Validação inicial dos dados
    if (!tasks || tasks.length === 0) {
      return this.getEmptyResults();
    }

    // Validação e sanitização dos dados
    const validationResult = dataValidator.validateAndSanitize(tasks);
    
    // Se há erros críticos de validação, retorna resultados vazios
    if (!validationResult.isValid) {
      const emptyResults = this.getEmptyResults();
      emptyResults.validationResult = validationResult;
      return emptyResults;
    }

    // Usa dados sanitizados para os cálculos
    const sanitizedTasks = validationResult.sanitizedData || tasks;
    const calculationId = this.generateCalculationId();
    const dataHash = this.generateDataHash(sanitizedTasks);

    // Executa cálculos com tratamento de erro
    const results = {
      // Dashboard KPIs
      projectDeadlineStatus: this.safeExecute(
        () => this.calculateProjectDeadlineStatus(tasks),
        'on-time' as const
      ),
      projectCompletionPercentage: this.safeExecute(
        () => this.calculateCompletionPercentage(tasks),
        0,
        'calculateCompletionPercentage'
      ),
      averageDelay: this.safeExecute(
        () => this.calculateAverage(tasks.map(t => t.atrasoDiasUteis)),
        0,
        'calculateAverageDelay'
      ),
      standardDeviation: this.safeExecute(
        () => this.calculateStandardDeviation(tasks.map(t => t.duracaoDiasUteis)),
        0,
        'calculateStandardDeviation'
      ),
      
      // Analytics KPIs
      averageProduction: this.safeExecute(
        () => this.calculateAverage(tasks.map(t => t.duracaoDiasUteis)),
        0,
        'calculateAverageProduction'
      ),
      mode: this.safeExecute(
        () => this.calculateMode(tasks.map(t => t.duracaoDiasUteis)),
        { value: 0, frequency: 0, percentage: 0 },
        'calculateMode'
      ),
      median: this.safeExecute(
        () => this.calculateMedian(this.removeOutliers(tasks.map(t => t.duracaoDiasUteis))),
        0,
        'calculateMedian'
      ),
      delayDistribution: this.safeExecute(
        () => this.calculateDelayDistribution(tasks.map(t => t.atrasoDiasUteis)),
        [],
        'calculateDelayDistribution'
      ),
      
      // Tasks KPIs
      taskDetails: this.safeExecute(
        () => this.calculateTaskDetails(tasks),
        [],
        'calculateTaskDetails'
      ),
      
      // Metadata
      lastUpdated: new Date(),
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.fim !== '').length,
      calculationVersion: KPICalculator.VERSION,
      calculationId: calculationId,
      processingTime: Math.round(performance.now() - startTime),
      dataHash: dataHash,
      
      // Error handling
      hasErrors: kpiErrorHandler.getErrorHistory().length > 0,
      errorCount: kpiErrorHandler.getErrorHistory().length,
      criticalErrors: kpiErrorHandler.hasCriticalErrors()
    };

    return results;
  }

  /**
   * Calcula o número de dias úteis entre duas datas
   */
  calculateWorkingDays(startDate: Date, endDate: Date): number {
    try {
      if (!startDate || !endDate) {
        throw new Error('Datas de início e fim são obrigatórias');
      }

      if (startDate > endDate) {
        throw new Error('Data de início não pode ser posterior à data de fim');
      }

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
    } catch (error) {
      console.error('Erro em calculateWorkingDays:', error);
      return 0;
    }
  }

  /**
   * Remove outliers usando o método IQR (Interquartile Range)
   */
  removeOutliers(values: number[]): number[] {
    try {
      if (!Array.isArray(values)) {
        throw new Error('Valores devem ser um array');
      }

    if (values.length < 4) {
      console.warn('Dados insuficientes para remoção de outliers, retornando valores originais');
      return values;
    }

    // Valida se todos os valores são números
    const invalidValues = values.filter(v => typeof v !== 'number' || isNaN(v));
    if (invalidValues.length > 0) {
      throw new Error(`Valores inválidos encontrados: ${invalidValues.length} itens`);
    }

    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    if (iqr === 0) {
      // Todos os valores são iguais, não há outliers
      return values;
    }
    
    const lowerBound = q1 - (this.config.outlierThreshold * iqr);
    const upperBound = q3 + (this.config.outlierThreshold * iqr);
    
    const filtered = values.filter(value => value >= lowerBound && value <= upperBound);
    
    // Log se muitos outliers foram removidos
    const removedCount = values.length - filtered.length;
    if (removedCount > values.length * 0.3) {
      kpiErrorHandler.createError(
        ErrorType.CALCULATION,
        ErrorSeverity.MEDIUM,
        `Muitos outliers detectados: ${removedCount} de ${values.length} valores foram removidos`,
        'removeOutliers',
        { 
          originalCount: values.length, 
          filteredCount: filtered.length,
          percentage: (removedCount / values.length) * 100
        }
      );
    }
    
    return filtered;
    } catch (error) {
      console.error('Erro em removeOutliers:', error);
      return [];
    }
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
      completedTasks: 0,
      calculationVersion: KPICalculator.VERSION,
      calculationId: this.generateCalculationId(),
      processingTime: 0,
      dataHash: 'empty',
      hasErrors: kpiErrorHandler.getErrorHistory().length > 0,
      errorCount: kpiErrorHandler.getErrorHistory().length,
      criticalErrors: kpiErrorHandler.hasCriticalErrors()
    };
  }

  /**
   * Obtém relatório de erros do último cálculo
   */
  getErrorReport() {
    const errors = kpiErrorHandler.getErrorHistory();
    return {
      totalErrors: errors.length,
      criticalErrors: errors.filter(e => e.severity === ErrorSeverity.CRITICAL).length,
      errors: errors
    };
  }

  /**
   * Obtém histórico de erros
   */
  getErrorHistory() {
    return kpiErrorHandler.getErrorHistory();
  }

  /**
   * Limpa histórico de erros
   */
  clearErrors() {
    kpiErrorHandler.clearErrorHistory();
  }
}

// Instância padrão do calculador
export const kpiCalculator = new KPICalculator();