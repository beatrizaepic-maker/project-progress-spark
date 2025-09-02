import React from 'react';
import { TaskData } from '@/data/projectData';

// Interface para métricas de performance
interface PerformanceMetrics {
  calculationTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  renderTime: number;
  dataSize: number;
  timestamp: Date;
  component?: string;
  operation?: string;
}

// Interface para alertas de performance
interface PerformanceAlert {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metrics: PerformanceMetrics;
  timestamp: Date;
  resolved?: boolean;
}

// Classe principal para monitoramento de performance
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private thresholds = {
    calculationTime: 1000, // ms
    memoryUsage: 100, // MB
    cacheHitRate: 0.7, // 70%
    renderTime: 500 // ms
  };

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Registra métricas de performance
   */
  recordMetrics(metrics: Partial<PerformanceMetrics>, component?: string): void {
    const fullMetrics: PerformanceMetrics = {
      calculationTime: 0,
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: 0,
      renderTime: 0,
      dataSize: 0,
      timestamp: new Date(),
      component,
      ...metrics
    };

    this.metrics.push(fullMetrics);
    this.checkThresholds(fullMetrics);
    
    // Mantém apenas os últimos 1000 registros
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metrics:', fullMetrics);
    }
  }

  /**
   * Verifica limites e gera alertas
   */
  private checkThresholds(metrics: PerformanceMetrics): void {
    const alerts: Omit<PerformanceAlert, 'id' | 'timestamp'>[] = [];

    if (metrics.calculationTime > this.thresholds.calculationTime) {
      alerts.push({
        level: 'warning',
        message: `Tempo de cálculo elevado: ${metrics.calculationTime}ms`,
        metrics
      });
    }

    if (metrics.memoryUsage > this.thresholds.memoryUsage) {
      alerts.push({
        level: 'error',
        message: `Uso de memória elevado: ${metrics.memoryUsage}MB`,
        metrics
      });
    }

    if (metrics.cacheHitRate > 0 && metrics.cacheHitRate < this.thresholds.cacheHitRate) {
      alerts.push({
        level: 'info',
        message: `Taxa de acerto do cache baixa: ${(metrics.cacheHitRate * 100).toFixed(1)}%`,
        metrics
      });
    }

    if (metrics.renderTime > this.thresholds.renderTime) {
      alerts.push({
        level: 'warning',
        message: `Tempo de renderização elevado: ${metrics.renderTime}ms`,
        metrics
      });
    }

    // Adiciona alertas gerados
    alerts.forEach(alert => {
      this.alerts.push({
        ...alert,
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      });
    });
  }

  /**
   * Obtém uso aproximado de memória
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * Mede tempo de execução de uma função
   */
  async measureExecutionTime<T>(
    fn: () => Promise<T> | T,
    component?: string,
    operation?: string
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      const result = await Promise.resolve(fn());
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();

      const metrics: PerformanceMetrics = {
        calculationTime: endTime - startTime,
        memoryUsage: endMemory,
        cacheHitRate: 0,
        renderTime: 0,
        dataSize: 0,
        timestamp: new Date(),
        component,
        operation
      };

      this.recordMetrics(metrics, component);
      
      return { result, metrics };
    } catch (error) {
      const endTime = performance.now();
      const metrics: PerformanceMetrics = {
        calculationTime: endTime - startTime,
        memoryUsage: this.getMemoryUsage(),
        cacheHitRate: 0,
        renderTime: 0,
        dataSize: 0,
        timestamp: new Date(),
        component,
        operation: `${operation} (ERROR)`
      };

      this.recordMetrics(metrics, component);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de performance
   */
  getStatistics(timeWindow?: number): {
    averageCalculationTime: number;
    averageMemoryUsage: number;
    averageCacheHitRate: number;
    totalOperations: number;
    alertsCount: number;
    worstPerformers: { component: string; avgTime: number }[];
  } {
    const cutoffTime = timeWindow 
      ? new Date(Date.now() - timeWindow)
      : new Date(0);

    const relevantMetrics = this.metrics.filter(m => m.timestamp > cutoffTime);

    if (relevantMetrics.length === 0) {
      return {
        averageCalculationTime: 0,
        averageMemoryUsage: 0,
        averageCacheHitRate: 0,
        totalOperations: 0,
        alertsCount: 0,
        worstPerformers: []
      };
    }

    const avgCalcTime = relevantMetrics.reduce((sum, m) => sum + m.calculationTime, 0) / relevantMetrics.length;
    const avgMemory = relevantMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / relevantMetrics.length;
    const avgCacheHit = relevantMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / relevantMetrics.length;

    // Identifica piores performers por componente
    const componentStats = new Map<string, { total: number; count: number }>();
    relevantMetrics.forEach(m => {
      if (m.component) {
        const current = componentStats.get(m.component) || { total: 0, count: 0 };
        componentStats.set(m.component, {
          total: current.total + m.calculationTime,
          count: current.count + 1
        });
      }
    });

    const worstPerformers = Array.from(componentStats.entries())
      .map(([component, stats]) => ({
        component,
        avgTime: stats.total / stats.count
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    return {
      averageCalculationTime: avgCalcTime,
      averageMemoryUsage: avgMemory,
      averageCacheHitRate: avgCacheHit,
      totalOperations: relevantMetrics.length,
      alertsCount: this.alerts.filter(a => !a.resolved && a.timestamp > cutoffTime).length,
      worstPerformers
    };
  }

  /**
   * Obtém alertas ativos
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Resolve um alerta
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * Limpa métricas antigas
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoffTime = new Date(Date.now() - maxAge);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffTime);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoffTime);
  }

  /**
   * Configura novos limites
   */
  setThresholds(newThresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * Exporta dados para análise
   */
  exportData(): {
    metrics: PerformanceMetrics[];
    alerts: PerformanceAlert[];
    statistics: ReturnType<typeof this.getStatistics>;
  } {
    return {
      metrics: [...this.metrics],
      alerts: [...this.alerts],
      statistics: this.getStatistics()
    };
  }
}

// Hook para usar o monitor de performance em componentes React
export const usePerformanceMonitor = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();

  const measureRender = React.useCallback((fn: () => void) => {
    const startTime = performance.now();
    fn();
    const endTime = performance.now();
    
    monitor.recordMetrics({
      renderTime: endTime - startTime,
      component: componentName
    });
  }, [monitor, componentName]);

  const measureCalculation = React.useCallback(
    async <T,>(fn: () => Promise<T> | T, operation?: string) => {
      return monitor.measureExecutionTime(fn, componentName, operation);
    },
    [monitor, componentName]
  );

  return {
    measureRender,
    measureCalculation,
    getStats: () => monitor.getStatistics(),
    getAlerts: () => monitor.getActiveAlerts()
  };
};

// Componente para exibir dashboard de performance
export const PerformanceDashboard: React.FC = () => {
  const [stats, setStats] = React.useState(PerformanceMonitor.getInstance().getStatistics());
  const [alerts, setAlerts] = React.useState(PerformanceMonitor.getInstance().getActiveAlerts());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(PerformanceMonitor.getInstance().getStatistics());
      setAlerts(PerformanceMonitor.getInstance().getActiveAlerts());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Só mostra em desenvolvimento
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50 max-w-sm">
      <h3 className="font-semibold text-sm mb-2">Performance Monitor</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Tempo médio de cálculo:</span>
          <span className="ml-2 font-mono">{stats.averageCalculationTime.toFixed(1)}ms</span>
        </div>
        
        <div>
          <span className="text-gray-600 dark:text-gray-400">Memória:</span>
          <span className="ml-2 font-mono">{stats.averageMemoryUsage.toFixed(1)}MB</span>
        </div>
        
        <div>
          <span className="text-gray-600 dark:text-gray-400">Cache hit rate:</span>
          <span className="ml-2 font-mono">{(stats.averageCacheHitRate * 100).toFixed(1)}%</span>
        </div>
        
        <div>
          <span className="text-gray-600 dark:text-gray-400">Operações:</span>
          <span className="ml-2 font-mono">{stats.totalOperations}</span>
        </div>
        
        {alerts.length > 0 && (
          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border">
            <div className="text-yellow-800 dark:text-yellow-200 font-medium">
              {alerts.length} alertas ativos
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Instância global
export const performanceMonitor = PerformanceMonitor.getInstance();

export default PerformanceMonitor;
