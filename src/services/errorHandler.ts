/**
 * Sistema de tratamento de erros para KPIs
 */

export enum ErrorType {
  CALCULATION = 'CALCULATION',
  VALIDATION = 'VALIDATION',
  DATA_INTEGRITY = 'DATA_INTEGRITY',
  PERFORMANCE = 'PERFORMANCE',
  SYSTEM = 'SYSTEM'
}

export enum ErrorSeverity {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

export interface KPIError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  context: string;
  timestamp: Date;
  stack?: string;
  metadata?: Record<string, any>;
  suggestions?: string[];
}

/**
 * Classe principal para tratamento de erros de KPI
 */
export class KPIErrorHandler {
  private errorHistory: KPIError[] = [];
  private maxHistorySize = 100;
  private logLevel = ErrorSeverity.LOW;

  /**
   * Criar um novo erro de KPI
   */
  createError(
    type: ErrorType,
    severity: ErrorSeverity,
    message: string,
    context: string,
    metadata?: Record<string, any>
  ): KPIError {
    const error: KPIError = {
      id: this.generateErrorId(),
      type,
      severity,
      message,
      context,
      timestamp: new Date(),
      stack: new Error().stack,
      metadata,
      suggestions: this.getDefaultActionSuggestions(type)
    };

    this.logError(error);
    this.addToHistory(error);
    
    return error;
  }

  /**
   * Registrar erro no console baseado na severidade
   */
  private logError(error: KPIError): void {
    if (this.getLogLevel() >= error.severity) {
      switch (error.severity) {
        case ErrorSeverity.LOW:
          console.info(`[KPI-INFO] ${error.context}: ${error.message}`, error);
          break;
        case ErrorSeverity.MEDIUM:
          console.warn(`[KPI-WARN] ${error.context}: ${error.message}`, error);
          break;
        case ErrorSeverity.HIGH:
          console.error(`[KPI-ERROR] ${error.context}: ${error.message}`, error);
          break;
        case ErrorSeverity.CRITICAL:
          console.error(`[KPI-CRITICAL] ${error.context}: ${error.message}`, error);
          break;
      }
    }
  }

  /**
   * Adicionar erro ao histórico
   */
  private addToHistory(error: KPIError): void {
    this.errorHistory.unshift(error);
    
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Obter sugestões de ação baseadas no tipo de erro
   */
  private getDefaultActionSuggestions(type: ErrorType): string[] {
    const suggestions: Record<ErrorType, string[]> = {
      [ErrorType.CALCULATION]: [
        'Verifique se todos os dados de entrada são válidos',
        'Confirme se as datas estão no formato correto',
        'Verifique se há valores nulos ou indefinidos'
      ],
      [ErrorType.VALIDATION]: [
        'Verifique a integridade dos dados de entrada',
        'Confirme se todos os campos obrigatórios estão preenchidos',
        'Valide o formato das datas e números'
      ],
      [ErrorType.DATA_INTEGRITY]: [
        'Verifique se há dados corrompidos',
        'Confirme a consistência entre diferentes fontes',
        'Execute uma validação completa dos dados'
      ],
      [ErrorType.PERFORMANCE]: [
        'Considere otimizar a quantidade de dados processados',
        'Verifique se há operações custosas desnecessárias',
        'Implemente cache para cálculos repetitivos'
      ],
      [ErrorType.SYSTEM]: [
        'Verifique a disponibilidade de recursos do sistema',
        'Confirme se todas as dependências estão funcionando',
        'Reinicie o processo se necessário'
      ]
    };

    return suggestions[type] || ['Consulte a documentação para mais informações'];
  }

  /**
   * Utilitários para validação
   */
  isValidDate(dateString: string): boolean {
    if (!dateString || dateString.trim() === '') return false;
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return false;
    
    const isoString = date.toISOString().split('T')[0];
    return dateString === isoString;
  }

  /**
   * Gerar ID único para erro
   */
  private generateErrorId(): string {
    return `kpi-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obter nível de log atual
   */
  private getLogLevel(): number {
    return this.logLevel;
  }

  /**
   * Obter histórico de erros
   */
  getErrorHistory(): KPIError[] {
    return [...this.errorHistory];
  }

  /**
   * Limpar histórico de erros
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Obter erros por severidade
   */
  getErrorsBySeverity(severity: ErrorSeverity): KPIError[] {
    return this.errorHistory.filter(error => error.severity === severity);
  }

  /**
   * Obter erros por tipo
   */
  getErrorsByType(type: ErrorType): KPIError[] {
    return this.errorHistory.filter(error => error.type === type);
  }

  /**
   * Verificar se há erros críticos
   */
  hasCriticalErrors(): boolean {
    return this.errorHistory.some(error => error.severity === ErrorSeverity.CRITICAL);
  }
}

// Instância global do handler de erro
export const kpiErrorHandler = new KPIErrorHandler();

/**
 * Função utilitária para criar erros rapidamente
 */
export function handleErrors<T>(
  defaultValue: T,
  context: string,
  operation: () => T
): T {
  try {
    return operation();
  } catch (error) {
    kpiErrorHandler.createError(
      ErrorType.CALCULATION,
      ErrorSeverity.MEDIUM,
      error instanceof Error ? error.message : 'Erro desconhecido',
      context,
      { originalError: error }
    );
    return defaultValue;
  }
}

/**
 * Utilitários para tratamento de erro
 */
export class ErrorUtils {
  /**
   * Verificar se um erro é crítico
   */
  static isCriticalError(error: KPIError): boolean {
    return error.severity === ErrorSeverity.CRITICAL;
  }

  /**
   * Obter classificação de erro baseada no tipo
   */
  static getErrorClassification(type: ErrorType): string {
    switch (type) {
      case ErrorType.CALCULATION: return 'Erro de Cálculo';
      case ErrorType.VALIDATION: return 'Erro de Validação';
      case ErrorType.DATA_INTEGRITY: return 'Erro de Integridade';
      case ErrorType.PERFORMANCE: return 'Problema de Performance';
      case ErrorType.SYSTEM: return 'Erro de Sistema';
      default: return 'Erro Desconhecido';
    }
  }

  /**
   * Obter cor baseada na severidade
   */
  static getSeverityColor(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW: return 'text-blue-600';
      case ErrorSeverity.MEDIUM: return 'text-yellow-600';
      case ErrorSeverity.HIGH: return 'text-red-600';
      case ErrorSeverity.CRITICAL: return 'text-red-800';
      default: return 'text-gray-600';
    }
  }

  /**
   * Converter erro para formato legível
   */
  static formatError(error: KPIError): string {
    const timestamp = error.timestamp.toLocaleString('pt-BR');
    const classification = this.getErrorClassification(error.type);
    
    return `[${timestamp}] ${classification}: ${error.message} (Contexto: ${error.context})`;
  }
}
