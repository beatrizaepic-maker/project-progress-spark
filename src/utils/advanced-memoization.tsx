import React, { useMemo, useCallback, useRef } from 'react';
import { TaskData } from '@/data/projectData';

// Cache avançado com LRU (Least Recently Used)
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move para o final (mais recente)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove o primeiro (mais antigo)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Sistema de memoização avançada para cálculos
class AdvancedMemoization {
  private static calculationCache = new LRUCache<string, any>(100);
  private static dependencyCache = new LRUCache<string, any[]>(50);

  /**
   * Cria uma chave estável para memoização baseada em dependências
   */
  static createStableKey(dependencies: any[]): string {
    try {
      return JSON.stringify(dependencies.map(dep => {
        if (dep && typeof dep === 'object') {
          // Para objetos, cria hash baseado em propriedades relevantes
          if (Array.isArray(dep)) {
            return dep.map(item => 
              item && typeof item === 'object' 
                ? `${item.id || ''}:${item.lastModified || ''}`
                : item
            );
          }
          return Object.keys(dep).sort().map(key => `${key}:${dep[key]}`);
        }
        return dep;
      }));
    } catch {
      return Math.random().toString(36);
    }
  }

  /**
   * Memoiza função com cache LRU e detecção de mudanças
   */
  static memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = keyGenerator 
        ? keyGenerator(...args)
        : this.createStableKey(args);
      
      const cached = this.calculationCache.get(key);
      if (cached !== undefined) {
        return cached;
      }

      const result = fn(...args);
      this.calculationCache.set(key, result);
      return result;
    }) as T;
  }

  /**
   * Limpa cache baseado em padrão de chave
   */
  static invalidatePattern(pattern: RegExp): void {
    // Implementação simplificada - em produção, usar Map com chaves organizadas
    this.calculationCache.clear();
  }

  /**
   * Obtém estatísticas do cache
   */
  static getStats() {
    return {
      calculationCacheSize: this.calculationCache.size(),
      dependencyCacheSize: this.dependencyCache.size()
    };
  }
}

// Hook otimizado para cálculos complexos
export const useOptimizedCalculation = <T, R>(
  data: T[],
  calculationFn: (data: T[]) => R,
  dependencies: any[] = []
): R => {
  // Memoiza a função de cálculo
  const memoizedCalculation = useMemo(
    () => AdvancedMemoization.memoize(calculationFn),
    [calculationFn]
  );

  // Cria chave estável para as dependências
  const depsKey = useMemo(
    () => AdvancedMemoization.createStableKey([data, ...dependencies]),
    [data, dependencies]
  );

  // Calcula resultado apenas quando necessário
  return useMemo(
    () => memoizedCalculation(data),
    [memoizedCalculation, depsKey]
  );
};

// Hook para otimização de componentes pesados
export const useHeavyComponentOptimization = <T,>(
  data: T[],
  threshold: number = 1000
) => {
  const shouldUseVirtualization = useMemo(
    () => data.length > threshold,
    [data.length, threshold]
  );

  const shouldUseLazyLoading = useMemo(
    () => data.length > threshold / 2,
    [data.length, threshold]
  );

  const chunkSize = useMemo(
    () => Math.min(100, Math.ceil(data.length / 10)),
    [data.length]
  );

  return {
    shouldUseVirtualization,
    shouldUseLazyLoading,
    chunkSize,
    dataSize: data.length
  };
};

// Componente com otimizações React.memo avançadas
export const OptimizedKPICard = React.memo<{
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}>(({ title, value, trend, icon, className = '', onClick }) => {
  const trendColor = useMemo(() => {
    if (trend === undefined || trend === 0) return 'text-gray-500';
    return trend > 0 ? 'text-green-500' : 'text-red-500';
  }, [trend]);

  const formattedValue = useMemo(() => {
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR', {
        maximumFractionDigits: 2
      });
    }
    return value;
  }, [value]);

  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 
        dark:border-gray-700 hover:shadow-md transition-shadow duration-200
        ${onClick ? 'cursor-pointer' : ''} ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {formattedValue}
          </p>
          {trend !== undefined && (
            <p className={`text-sm mt-1 ${trendColor}`}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renders desnecessários
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.trend === nextProps.trend &&
    prevProps.className === nextProps.className
  );
});

OptimizedKPICard.displayName = 'OptimizedKPICard';

// Hook para debounce otimizado
export const useOptimizedDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

// Exporta instância global para controle de cache
export { AdvancedMemoization };
