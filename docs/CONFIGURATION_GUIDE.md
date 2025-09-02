# Guia de Configurações do Sistema de KPIs

## Visão Geral

Este documento detalha todas as configurações disponíveis no sistema de KPIs, incluindo opções padrão, exemplos de uso e considerações de performance.

## 1. Configuração do KPICalculator

### Interface KPIConfig

```typescript
interface KPIConfig {
  excludeWeekends: boolean;          // Excluir fins de semana dos cálculos
  removeOutliers: boolean;           // Remover valores extremos
  outlierMethod: 'IQR' | 'zscore';   // Método de remoção de outliers
  zScoreThreshold: number;           // Limiar para método z-score
  workingDaysOnly: boolean;          // Considerar apenas dias úteis
  minDataPoints: number;             // Mínimo de pontos para cálculos
  precision: number;                 // Casas decimais para resultados
  customWeekends: number[];          // Dias customizados como fim de semana
  holidays: Date[];                  // Lista de feriados a excluir
}
```

### Configuração Padrão

```typescript
const defaultConfig: KPIConfig = {
  excludeWeekends: true,
  removeOutliers: true,
  outlierMethod: 'IQR',
  zScoreThreshold: 2,
  workingDaysOnly: true,
  minDataPoints: 3,
  precision: 2,
  customWeekends: [0, 6], // Domingo e Sábado
  holidays: []
};
```

### Exemplos de Uso

#### Configuração Básica
```typescript
import { KPICalculator } from '@/services/kpiCalculator';

const calculator = new KPICalculator({
  excludeWeekends: true,
  removeOutliers: true
});

const results = calculator.calculateAll(tasks);
```

#### Configuração Personalizada
```typescript
const customConfig = {
  excludeWeekends: false,           // Incluir fins de semana
  removeOutliers: true,
  outlierMethod: 'zscore' as const, // Usar z-score em vez de IQR
  zScoreThreshold: 1.5,             // Mais restritivo
  minDataPoints: 5,                 // Requer mais dados
  precision: 3,                     // Mais precisão
  holidays: [
    new Date('2024-01-01'),         // Ano Novo
    new Date('2024-12-25')          // Natal
  ]
};

const calculator = new KPICalculator(customConfig);
```

## 2. Configuração do Hook useKPIs

### Interface UseKPIsOptions

```typescript
interface UseKPIsOptions {
  config?: Partial<KPIConfig>;      // Configuração do calculador
  debounceMs?: number;              // Tempo de debounce em ms
  cacheTTL?: number;                // Time-to-live do cache em ms
  enableCache?: boolean;            // Habilitar cache
  cacheType?: 'dashboard' | 'analytics' | 'tasks'; // Tipo de cache
  onCalculationStart?: () => void;   // Callback início do cálculo
  onCalculationComplete?: (results: KPIResults) => void; // Callback fim
  onError?: (error: Error) => void; // Callback de erro
}
```

### Configurações por Contexto

#### Dashboard
```typescript
const dashboardKPIs = useKPIs(tasks, {
  config: {
    excludeWeekends: true,
    removeOutliers: true,
    precision: 1
  },
  debounceMs: 300,
  cacheTTL: 5 * 60 * 1000, // 5 minutos
  cacheType: 'dashboard',
  enableCache: true
});
```

#### Analytics
```typescript
const analyticsKPIs = useKPIs(tasks, {
  config: {
    excludeWeekends: true,
    removeOutliers: true,
    precision: 3,
    minDataPoints: 10
  },
  debounceMs: 500,
  cacheTTL: 10 * 60 * 1000, // 10 minutos
  cacheType: 'analytics',
  enableCache: true
});
```

#### Tasks (Tempo Real)
```typescript
const tasksKPIs = useKPIs(tasks, {
  config: {
    excludeWeekends: true,
    removeOutliers: false, // Mais rápido sem remoção
    precision: 1
  },
  debounceMs: 100,        // Resposta mais rápida
  cacheTTL: 30 * 1000,    // Cache curto
  cacheType: 'tasks',
  enableCache: true
});
```

## 3. Configuração de Cache

### Configuração Global

```typescript
import { globalKPICache } from '@/services/kpiCache';

// Configurar TTL padrão
globalKPICache.setDefaultTTL(5 * 60 * 1000); // 5 minutos

// Configurar tamanho máximo
globalKPICache.setMaxSize(100);

// Limpar cache periodicamente
setInterval(() => {
  globalKPICache.cleanup();
}, 60 * 60 * 1000); // A cada hora
```

### Configuração por Tipo

```typescript
import { KPICacheUtils } from '@/services/kpiCache';

// Configurar TTL específico por tipo
KPICacheUtils.setTypeTTL('dashboard', 5 * 60 * 1000);    // 5 min
KPICacheUtils.setTypeTTL('analytics', 15 * 60 * 1000);   // 15 min
KPICacheUtils.setTypeTTL('tasks', 60 * 1000);            // 1 min

// Configurar invalidação automática
KPICacheUtils.setAutoInvalidation('dashboard', true);
```

## 4. Configuração de Performance

### Monitor de Performance

```typescript
import { performanceMonitor } from '@/utils/performance-monitor';

// Configurar thresholds
performanceMonitor.setThresholds({
  calculationTime: 1000,  // ms
  memoryUsage: 100,       // MB
  cacheHitRate: 0.8,      // 80%
  renderTime: 500         // ms
});

// Configurar limpeza automática
performanceMonitor.cleanup(24 * 60 * 60 * 1000); // 24 horas
```

### Lazy Loading

```typescript
import { LazyChart } from '@/components/ui/lazy-chart';

// Configurar charts prioritários
<LazyChart
  type="production"
  props={{ tasks }}
  priority={true}  // Carregar primeiro
  height={400}
/>

// Configurar Intersection Observer
<IntersectionChart
  type="delay"
  props={{ tasks }}
  rootMargin="200px"  // Carregar 200px antes de ficar visível
/>
```

### Virtual Scrolling

```typescript
import { VirtualScrollTable } from '@/components/ui/virtual-scroll-table';

<VirtualScrollTable
  data={tasks}
  itemHeight={80}
  containerHeight={600}
  overscan={5}           // Itens extras para scroll suave
  renderItem={TaskRow}
/>

// Configuração adaptativa
const { shouldUseVirtualization } = useHeavyComponentOptimization(
  tasks,
  1000  // Threshold para ativação
);
```

## 5. Configuração de Acessibilidade

### Configuração Global

```typescript
import { AccessibilityConfig } from '@/utils/accessibility';

const a11yConfig = {
  announceCalculations: true,      // Anunciar cálculos para leitores de tela
  highContrastMode: false,         // Modo alto contraste
  reduceMotion: false,             // Reduzir animações
  keyboardNavigation: true,        // Navegação por teclado
  screenReaderOptimized: true      // Otimizações para leitores de tela
};

AccessibilityConfig.setGlobal(a11yConfig);
```

### Configuração por Componente

```typescript
// KPI Card com acessibilidade
<KPICard
  title="Média de Atraso"
  value={5.2}
  ariaLabel="Média de atraso de 5.2 dias"
  ariaDescription="Calculado com base em 150 tarefas concluídas"
  keyboardNavigable={true}
/>

// Gráficos com descrições
<ProductionChart
  tasks={tasks}
  ariaLabel="Gráfico de evolução da produção"
  ariaDescription="Mostra a variação da produtividade ao longo do tempo"
  keyboardControls={true}
/>
```

## 6. Configuração de Ambiente

### Desenvolvimento

```typescript
// .env.development
VITE_ENABLE_PERFORMANCE_MONITOR=true
VITE_CACHE_TTL=300000           # 5 minutos
VITE_DEBUG_CALCULATIONS=true
VITE_MOCK_DATA_SIZE=1000
```

### Produção

```typescript
// .env.production
VITE_ENABLE_PERFORMANCE_MONITOR=false
VITE_CACHE_TTL=900000           # 15 minutos
VITE_DEBUG_CALCULATIONS=false
VITE_OPTIMIZE_BUNDLE=true
```

### Configuração Condicional

```typescript
const getEnvironmentConfig = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      enableDebug: true,
      performanceMonitoring: true,
      cacheTTL: 5 * 60 * 1000,
      mockData: true
    };
  }
  
  return {
    enableDebug: false,
    performanceMonitoring: false,
    cacheTTL: 15 * 60 * 1000,
    mockData: false
  };
};
```

## 7. Configuração de Gráficos

### Recharts

```typescript
const chartConfig = {
  responsive: true,
  maintainAspectRatio: false,
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  theme: {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444'
    }
  }
};

// Configuração de tooltip
const tooltipConfig = {
  contentStyle: {
    backgroundColor: 'var(--card-background)',
    border: '1px solid var(--border)',
    borderRadius: '8px'
  },
  formatter: (value: number) => [
    value.toLocaleString('pt-BR'),
    'Valor'
  ]
};
```

## 8. Configuração de Filtros

### Filtros Avançados

```typescript
interface FilterConfig {
  status: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  responsible: string[];
  delayRange: {
    min?: number;
    max?: number;
  };
  priority: ('Alta' | 'Média' | 'Baixa')[];
}

const defaultFilters: FilterConfig = {
  status: ['Concluído', 'Em Progresso'],
  dateRange: {},
  responsible: [],
  delayRange: {},
  priority: []
};
```

## 9. Configuração de Temas

### Dark/Light Mode

```typescript
const themeConfig = {
  light: {
    background: '#ffffff',
    foreground: '#000000',
    card: '#f8f9fa',
    border: '#e9ecef',
    primary: '#3B82F6'
  },
  dark: {
    background: '#1a1a1a',
    foreground: '#ffffff',
    card: '#2d3748',
    border: '#4a5568',
    primary: '#60A5FA'
  }
};

// Aplicação automática baseada na preferência do sistema
const useSystemTheme = () => {
  const [theme, setTheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setTheme(mediaQuery.matches ? 'dark' : 'light');
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return theme;
};
```

## 10. Troubleshooting de Configurações

### Problemas Comuns

#### Cache não funcionando
```typescript
// Verificar configuração
console.log('Cache habilitado:', cacheEnabled);
console.log('TTL configurado:', cacheTTL);
console.log('Estatísticas:', globalKPICache.getStats());

// Forçar limpeza se necessário
globalKPICache.clear();
```

#### Performance lenta
```typescript
// Verificar thresholds
console.log('Thresholds atuais:', performanceMonitor.getThresholds());

// Ajustar configurações
performanceMonitor.setThresholds({
  calculationTime: 2000,  // Mais tolerante
  memoryUsage: 200
});
```

#### Cálculos incorretos
```typescript
// Verificar configuração do calculador
const config = calculator.getConfig();
console.log('Configuração atual:', config);

// Validar dados de entrada
const validTasks = tasks.filter(task => calculator.validateTask(task));
console.log('Tarefas válidas:', validTasks.length, 'de', tasks.length);
```

### Configuração de Debug

```typescript
// Habilitar logs detalhados
localStorage.setItem('debug', 'kpi:*,cache:*,performance:*');

// Configurar console personalizado para debugging
const debugConfig = {
  enabled: process.env.NODE_ENV === 'development',
  levels: ['info', 'warn', 'error'],
  categories: ['calculations', 'cache', 'performance', 'rendering']
};
```

Este guia fornece todas as opções de configuração disponíveis para personalizar o comportamento do sistema de KPIs conforme suas necessidades específicas.
