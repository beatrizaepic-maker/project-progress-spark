import React, { Suspense, lazy, useMemo } from 'react';
import { TaskData } from '@/data/projectData';

// Interface para props comuns dos gráficos
interface LazyChartProps {
  tasks: TaskData[];
  [key: string]: any;
}

// Loading fallback component
const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <div 
    className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg"
    style={{ height: `${height}px` }}
  >
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-500 dark:text-gray-400">
        Carregando gráfico...
      </div>
    </div>
  </div>
);

// Lazy load dos componentes de gráfico
const LazyProductionAverageChart = lazy(() => 
  import('@/components/analytics/ProductionAverageChart').then(module => ({
    default: module.default
  }))
);

const LazyModeFrequencyChart = lazy(() => 
  import('@/components/analytics/ModeFrequencyChart').then(module => ({
    default: module.default
  }))
);

const LazyMedianBoxPlot = lazy(() => 
  import('@/components/analytics/MedianBoxPlot').then(module => ({
    default: module.default
  }))
);

const LazyDelayDistributionChart = lazy(() => 
  import('@/components/analytics/DelayDistributionChart').then(module => ({
    default: module.default
  }))
);

// Componente wrapper para lazy loading com otimizações
export const LazyChart: React.FC<{
  type: 'production' | 'mode' | 'median' | 'delay';
  props: LazyChartProps;
  height?: number;
  priority?: boolean; // Para charts críticos que devem carregar primeiro
}> = ({ type, props, height = 300, priority = false }) => {
  
  // Memoriza o componente baseado no tipo para evitar re-renders
  const ChartComponent = useMemo(() => {
    switch (type) {
      case 'production':
        return LazyProductionAverageChart;
      case 'mode':
        return LazyModeFrequencyChart;
      case 'median':
        return LazyMedianBoxPlot;
      case 'delay':
        return LazyDelayDistributionChart;
      default:
        return null;
    }
  }, [type]);

  // Se é um chart prioritário, pode usar preload
  React.useEffect(() => {
    if (priority && ChartComponent) {
      // Para componentes prioritários, podemos implementar preload personalizado
      // Por enquanto, apenas registramos a intenção
      console.log(`Priority chart ${type} marked for preload`);
    }
  }, [priority, ChartComponent, type]);

  if (!ChartComponent) {
    return <div>Tipo de gráfico não suportado</div>;
  }

  return (
    <Suspense fallback={<ChartSkeleton height={height} />}>
      <ChartComponent {...props} />
    </Suspense>
  );
};

// Hook para otimizar renderização de múltiplos charts
export const useOptimizedCharts = (
  tasks: TaskData[],
  visibleCharts: string[] = []
) => {
  // Só prepara dados para charts visíveis
  const optimizedData = useMemo(() => {
    if (tasks.length === 0) return {};
    
    const data: Record<string, any> = {};
    
    if (visibleCharts.includes('production')) {
      data.production = tasks; // Pode ser processado aqui se necessário
    }
    
    if (visibleCharts.includes('mode')) {
      data.mode = tasks;
    }
    
    if (visibleCharts.includes('median')) {
      data.median = tasks;
    }
    
    if (visibleCharts.includes('delay')) {
      data.delay = tasks;
    }
    
    return data;
  }, [tasks, visibleCharts]);

  return optimizedData;
};

// Componente para carregamento inteligente baseado na visibilidade
export const IntersectionChart: React.FC<{
  type: 'production' | 'mode' | 'median' | 'delay';
  props: LazyChartProps;
  height?: number;
  rootMargin?: string;
}> = ({ type, props, height = 300, rootMargin = '100px' }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {isVisible ? (
        <LazyChart type={type} props={props} height={height} />
      ) : (
        <ChartSkeleton height={height} />
      )}
    </div>
  );
};
