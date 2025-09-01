import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { TaskData } from '@/data/projectData';
import { KPICalculator, KPIResults, KPIConfig } from '@/services/kpiCalculator';
import { globalKPICache, KPICacheUtils } from '@/services/kpiCache';

// Interface para configuração do hook
interface UseKPIsOptions {
  config?: Partial<KPIConfig>;
  debounceMs?: number;
  cacheTTL?: number;
  enableCache?: boolean;
  cacheType?: 'dashboard' | 'analytics' | 'tasks';
  onCalculationStart?: () => void;
  onCalculationComplete?: (results: KPIResults) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook avançado para calcular KPIs com recálculo automático, debouncing e cache
 */
export const useKPIs = (
  tasks: TaskData[], 
  options: UseKPIsOptions = {}
): KPIResults & { 
  isCalculating: boolean; 
  lastUpdated: Date;
  cacheHit: boolean;
  invalidateCache: () => void;
} => {
  const {
    config,
    debounceMs = 300,
    cacheTTL = 5 * 60 * 1000, // 5 minutos
    enableCache = true,
    cacheType,
    onCalculationStart,
    onCalculationComplete,
    onError
  } = options;

  const [isCalculating, setIsCalculating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [cacheHit, setCacheHit] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Função para invalidar cache
  const invalidateCache = useCallback(() => {
    if (cacheType) {
      KPICacheUtils.invalidateByType(cacheType);
    } else {
      globalKPICache.clear();
    }
  }, [cacheType]);

  // Função para gerar chave do cache baseada no tipo
  const generateCacheKey = useCallback((tasks: TaskData[], config?: Partial<KPIConfig>) => {
    switch (cacheType) {
      case 'dashboard':
        return KPICacheUtils.dashboardKey(tasks, config);
      case 'analytics':
        return KPICacheUtils.analyticsKey(tasks, config);
      case 'tasks':
        return KPICacheUtils.tasksKey(tasks, config);
      default:
        return globalKPICache.generateKey(tasks, config, 'general');
    }
  }, [cacheType]);



  // Função de cálculo com tratamento de erro
  const calculateKPIs = useCallback(async (tasks: TaskData[], config?: Partial<KPIConfig>): Promise<KPIResults> => {
    try {
      const calculator = new KPICalculator(config);
      const results = calculator.calculateAll(tasks);
      return results;
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }, [onError]);

  // Função principal de cálculo com debouncing
  const debouncedCalculation = useCallback((tasks: TaskData[], config?: Partial<KPIConfig>) => {
    // Limpa timeout anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Cria novo timeout
    debounceRef.current = setTimeout(async () => {
      // Verifica cache primeiro (sem alterar estado aqui)
      const cacheKey = generateCacheKey(tasks, config);
      const cached = enableCache ? globalKPICache.get<KPIResults>(cacheKey) : null;
      
      if (cached) {
        setCacheHit(true);
        setKpiResults(cached);
        setLastUpdated(new Date());
        return;
      }

      // Se não há cache, calcula
      setIsCalculating(true);
      setCacheHit(false);
      
      if (onCalculationStart) {
        onCalculationStart();
      }

      try {
        const results = await calculateKPIs(tasks, config);
        
        // Salva no cache
        if (enableCache) {
          globalKPICache.set(cacheKey, results, cacheTTL, {
            type: cacheType || 'general',
            taskCount: tasks.length,
            calculatedAt: new Date().toISOString()
          });
        }
        
        setKpiResults(results);
        setLastUpdated(new Date());
        
        if (onCalculationComplete) {
          onCalculationComplete(results);
        }
      } catch (error) {
        console.error('Erro no cálculo de KPIs:', error);
        if (onError) {
          onError(error as Error);
        }
      } finally {
        setIsCalculating(false);
      }
    }, debounceMs);
  }, [debounceMs, generateCacheKey, enableCache, cacheTTL, cacheType, calculateKPIs, onCalculationStart, onCalculationComplete, onError]);

  // Efeito para recalcular quando dados mudam
  useEffect(() => {
    // Verifica cache imediatamente (sincronamente) para primeira renderização
    const cacheKey = generateCacheKey(tasks, config);
    const cached = enableCache ? globalKPICache.get<KPIResults>(cacheKey) : null;
    
    if (cached) {
      setCacheHit(true);
      setKpiResults(cached);
      setLastUpdated(new Date());
    } else {
      // Se não há cache, inicia cálculo com debounce
      debouncedCalculation(tasks, config);
    }
    
    // Cleanup
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [tasks, config]); // Removido debouncedCalculation das dependências para evitar loop

  // Estado para armazenar os resultados dos KPIs
  const [kpiResults, setKpiResults] = useState<KPIResults>(() => {
    // Inicialização com valores padrão
    return {
      projectDeadlineStatus: 'on-time' as const,
      projectCompletionPercentage: 0,
      averageDelay: 0,
      standardDeviation: 0,
      averageProduction: 0,
      mode: { value: 0, frequency: 0, percentage: 0 },
      median: 0,
      delayDistribution: [],
      taskDetails: [],
      totalTasks: 0,
      completedTasks: 0,
      lastUpdated: new Date(),
      calculationVersion: '1.0.0',
      calculationId: 'initial',
      processingTime: 0,
      dataHash: 'initial'
    };
  });

  return {
    ...kpiResults,
    isCalculating,
    lastUpdated,
    cacheHit,
    invalidateCache
  };
};

/**
 * Hook para obter apenas KPIs do dashboard com recálculo automático
 */
export const useDashboardKPIs = (tasks: TaskData[], options?: UseKPIsOptions) => {
  const allKPIs = useKPIs(tasks, {
    ...options,
    cacheType: 'dashboard',
    cacheTTL: options?.cacheTTL || 3 * 60 * 1000, // 3 minutos para dashboard
    onCalculationStart: () => {
      console.log('🔄 Recalculando KPIs do Dashboard...');
      options?.onCalculationStart?.();
    },
    onCalculationComplete: (results) => {
      console.log('✅ KPIs do Dashboard atualizados:', {
        status: results.projectDeadlineStatus,
        completion: results.projectCompletionPercentage,
        avgDelay: results.averageDelay
      });
      options?.onCalculationComplete?.(results);
    }
  });
  
  return useMemo(() => ({
    projectDeadlineStatus: allKPIs.projectDeadlineStatus,
    projectCompletionPercentage: allKPIs.projectCompletionPercentage,
    averageDelay: allKPIs.averageDelay,
    standardDeviation: allKPIs.standardDeviation,
    lastUpdated: allKPIs.lastUpdated,
    totalTasks: allKPIs.totalTasks,
    completedTasks: allKPIs.completedTasks,
    isCalculating: allKPIs.isCalculating,
    cacheHit: allKPIs.cacheHit,
    invalidateCache: allKPIs.invalidateCache,
    calculationId: allKPIs.calculationId,
    calculationVersion: allKPIs.calculationVersion,
    processingTime: allKPIs.processingTime,
    dataHash: allKPIs.dataHash
  }), [allKPIs]);
};

/**
 * Hook para obter apenas KPIs de analytics com recálculo automático
 */
export const useAnalyticsKPIs = (tasks: TaskData[], options?: UseKPIsOptions) => {
  const allKPIs = useKPIs(tasks, {
    ...options,
    cacheType: 'analytics',
    cacheTTL: options?.cacheTTL || 10 * 60 * 1000, // 10 minutos para analytics
    debounceMs: options?.debounceMs || 500, // Maior debounce para analytics
    onCalculationStart: () => {
      console.log('📊 Recalculando KPIs de Analytics...');
      options?.onCalculationStart?.();
    },
    onCalculationComplete: (results) => {
      console.log('✅ KPIs de Analytics atualizados:', {
        avgProduction: results.averageProduction,
        mode: results.mode.value,
        median: results.median
      });
      options?.onCalculationComplete?.(results);
    }
  });
  
  return useMemo(() => ({
    averageProduction: allKPIs.averageProduction,
    mode: allKPIs.mode,
    median: allKPIs.median,
    delayDistribution: allKPIs.delayDistribution,
    standardDeviation: allKPIs.standardDeviation,
    lastUpdated: allKPIs.lastUpdated,
    isCalculating: allKPIs.isCalculating,
    cacheHit: allKPIs.cacheHit,
    invalidateCache: allKPIs.invalidateCache,
    calculationId: allKPIs.calculationId,
    calculationVersion: allKPIs.calculationVersion,
    processingTime: allKPIs.processingTime,
    dataHash: allKPIs.dataHash,
    totalTasks: allKPIs.totalTasks
  }), [allKPIs]);
};

/**
 * Hook para obter apenas KPIs de tarefas com recálculo automático
 */
export const useTaskKPIs = (tasks: TaskData[], options?: UseKPIsOptions) => {
  const allKPIs = useKPIs(tasks, {
    ...options,
    cacheType: 'tasks',
    cacheTTL: options?.cacheTTL || 2 * 60 * 1000, // 2 minutos para tasks (mais dinâmico)
    onCalculationStart: () => {
      console.log('📋 Recalculando KPIs de Tarefas...');
      options?.onCalculationStart?.();
    },
    onCalculationComplete: (results) => {
      console.log('✅ KPIs de Tarefas atualizados:', {
        taskCount: results.taskDetails.length,
        avgDelay: results.averageDelay
      });
      options?.onCalculationComplete?.(results);
    }
  });
  
  return useMemo(() => ({
    taskDetails: allKPIs.taskDetails,
    averageDelay: allKPIs.averageDelay,
    lastUpdated: allKPIs.lastUpdated,
    isCalculating: allKPIs.isCalculating,
    cacheHit: allKPIs.cacheHit,
    invalidateCache: allKPIs.invalidateCache
  }), [allKPIs]);
};

/**
 * Hook para monitoramento global de KPIs
 * Útil para debug e monitoramento de performance
 */
export const useKPIMonitoring = () => {
  const [calculationCount, setCalculationCount] = useState(0);
  const [cacheMetrics, setCacheMetrics] = useState(globalKPICache.getMetrics());
  const calculationTimes = useRef<number[]>([]);

  // Atualiza métricas do cache periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheMetrics(globalKPICache.getMetrics());
    }, 5000); // Atualiza a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const onCalculationStart = useCallback(() => {
    setCalculationCount(prev => prev + 1);
  }, []);

  const onCalculationComplete = useCallback((results: KPIResults) => {
    // Simula tempo de cálculo (em produção, seria medido)
    const calculationTime = Math.random() * 100 + 50; // 50-150ms simulado
    
    calculationTimes.current.push(calculationTime);
    if (calculationTimes.current.length > 10) {
      calculationTimes.current.shift(); // Mantém apenas os últimos 10
    }
    
    // Atualiza métricas do cache
    setCacheMetrics(globalKPICache.getMetrics());
  }, []);

  const getDetailedStats = useCallback(() => {
    return {
      dashboard: KPICacheUtils.getStatsByType('dashboard'),
      analytics: KPICacheUtils.getStatsByType('analytics'),
      tasks: KPICacheUtils.getStatsByType('tasks'),
      general: KPICacheUtils.getStatsByType('general')
    };
  }, []);

  const averageCalculationTime = calculationTimes.current.length > 0
    ? calculationTimes.current.reduce((a, b) => a + b, 0) / calculationTimes.current.length
    : 0;

  return {
    calculationCount,
    cacheMetrics,
    averageCalculationTime: Math.round(averageCalculationTime),
    onCalculationStart,
    onCalculationComplete,
    getDetailedStats,
    // Utilitários do cache
    clearCache: () => globalKPICache.clear(),
    cleanupCache: () => globalKPICache.cleanup(),
    invalidateByType: KPICacheUtils.invalidateByType,
    getCacheKeys: () => globalKPICache.getKeys()
  };
};

/**
 * Hook para controle avançado do cache
 */
export const useCacheControl = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [metrics, setMetrics] = useState(globalKPICache.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(globalKPICache.getMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const actions = useMemo(() => ({
    enable: () => setIsEnabled(true),
    disable: () => setIsEnabled(false),
    clear: () => {
      globalKPICache.clear();
      setMetrics(globalKPICache.getMetrics());
    },
    cleanup: () => {
      const removed = globalKPICache.cleanup();
      setMetrics(globalKPICache.getMetrics());
      return removed;
    },
    getEntry: (key: string) => globalKPICache.getEntryInfo(key),
    deleteEntry: (key: string) => {
      const deleted = globalKPICache.delete(key);
      setMetrics(globalKPICache.getMetrics());
      return deleted;
    },
    getStatsByType: KPICacheUtils.getStatsByType,
    invalidateByType: (type: 'dashboard' | 'analytics' | 'tasks' | 'all') => {
      KPICacheUtils.invalidateByType(type);
      setMetrics(globalKPICache.getMetrics());
    }
  }), []);

  return {
    isEnabled,
    metrics,
    actions
  };
};