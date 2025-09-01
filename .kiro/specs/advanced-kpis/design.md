# Design Document

## Overview

Este documento detalha o design técnico para implementar KPIs estatísticos avançados na plataforma Epic Board. A solução será distribuída em três páginas principais (Dashboard, Analytics, Tasks) com cálculos estatísticos precisos e interface intuitiva.

## Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │    │   Analytics     │    │     Tasks       │
│   (Executive)   │    │   (Detailed)    │    │  (Operational)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  KPI Calculator │
                    │    Service      │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Data Layer    │
                    │  (Task Data)    │
                    └─────────────────┘
```

### Data Flow
1. **Task Data** → **KPI Calculator** → **Component State** → **UI Rendering**
2. **Real-time Updates**: Quando dados mudam → Recálculo automático → UI atualizada
3. **Caching**: Resultados complexos são cached para performance

## Components and Interfaces

### 1. KPI Calculator Service (`/src/services/kpiCalculator.ts`)

```typescript
interface TaskData {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  plannedEndDate: Date;
  status: 'completed' | 'in-progress' | 'pending';
  duration: number; // em dias
}

interface KPIResults {
  // Dashboard KPIs
  projectDeadlineStatus: 'on-time' | 'at-risk' | 'delayed';
  projectCompletionPercentage: number;
  averageDelay: number;
  standardDeviation: number;
  
  // Analytics KPIs
  averageProduction: number;
  mode: { value: number; frequency: number };
  median: number;
  delayDistribution: Array<{ range: string; count: number }>;
  
  // Tasks KPIs
  taskDetails: Array<{
    id: string;
    workingDaysDelay: number;
    deadlineStatus: 'on-time' | 'at-risk' | 'delayed';
  }>;
}

class KPICalculator {
  calculateAll(tasks: TaskData[]): KPIResults;
  calculateWorkingDays(startDate: Date, endDate: Date): number;
  removeOutliers(values: number[]): number[];
  calculateMode(values: number[]): { value: number; frequency: number };
}
```

### 2. Dashboard KPI Cards (`/src/components/dashboard/KPICards.tsx`)

```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  status: 'success' | 'warning' | 'error';
  trend?: { direction: 'up' | 'down'; value: string };
  subtitle?: string;
  icon: React.ComponentType;
}

const KPICard: React.FC<KPICardProps>;
const ProjectDeadlineCard: React.FC<{ kpis: KPIResults }>;
const AverageDelayCard: React.FC<{ kpis: KPIResults }>;
const StandardDeviationCard: React.FC<{ kpis: KPIResults }>;
```

### 3. Analytics Statistical Charts (`/src/components/analytics/StatisticalCharts.tsx`)

```typescript
interface StatisticalChartsProps {
  kpis: KPIResults;
  tasks: TaskData[];
}

const ProductionAverageChart: React.FC<{ data: number[] }>;
const ModeFrequencyChart: React.FC<{ mode: { value: number; frequency: number } }>;
const MedianBoxPlot: React.FC<{ values: number[]; median: number }>;
const DelayDistributionChart: React.FC<{ distribution: Array<{ range: string; count: number }> }>;
```

### 4. Tasks Enhanced Table (`/src/components/tasks/EnhancedTaskTable.tsx`)

```typescript
interface EnhancedTaskTableProps {
  tasks: TaskData[];
  kpis: KPIResults;
}

interface TaskRowData extends TaskData {
  workingDaysDelay: number;
  deadlineStatus: 'on-time' | 'at-risk' | 'delayed';
  statusColor: string;
}

const EnhancedTaskTable: React.FC<EnhancedTaskTableProps>;
const StatusIndicator: React.FC<{ status: string }>;
const DelayTooltip: React.FC<{ delay: number }>;
```

## Data Models

### Extended Task Model
```typescript
interface ExtendedTaskData extends TaskData {
  // Calculated fields
  workingDaysDelay: number;
  deadlineStatus: 'on-time' | 'at-risk' | 'delayed';
  isOutlier: boolean;
  
  // Metadata
  lastUpdated: Date;
  calculationVersion: string;
}
```

### KPI Configuration
```typescript
interface KPIConfig {
  outlierThreshold: number; // IQR multiplier (default: 1.5)
  workingDaysOnly: boolean; // true
  holidays: Date[]; // lista de feriados
  riskThresholdDays: number; // dias para status 'at-risk'
  modeGroupingInterval: number; // agrupamento para moda (default: 0.5 dias)
}
```

## Error Handling

### Calculation Errors
```typescript
interface KPIError {
  type: 'calculation' | 'data' | 'validation';
  message: string;
  field?: string;
  fallbackValue?: any;
}

class KPIErrorHandler {
  handleCalculationError(error: Error, field: string): KPIError;
  getFallbackValue(field: string): any;
  logError(error: KPIError): void;
}
```

### Error States in UI
- **Calculation Failed**: Mostra último valor válido + timestamp
- **No Data**: Exibe placeholder com mensagem explicativa
- **Partial Data**: Calcula com dados disponíveis + aviso
- **Invalid Data**: Destaca problemas e sugere correções

## Testing Strategy

### Unit Tests
```typescript
// KPI Calculator Tests
describe('KPICalculator', () => {
  test('calculates working days correctly excluding weekends');
  test('removes outliers using IQR method');
  test('calculates mode with proper grouping');
  test('handles empty dataset gracefully');
  test('calculates standard deviation accurately');
});

// Component Tests
describe('KPICards', () => {
  test('displays correct status colors');
  test('formats numbers properly');
  test('shows trend indicators');
});
```

### Integration Tests
```typescript
describe('KPI Integration', () => {
  test('updates all KPIs when task data changes');
  test('maintains consistency across pages');
  test('handles real-time data updates');
});
```

### Performance Tests
- **Large Dataset**: 1000+ tarefas em <500ms
- **Real-time Updates**: Recálculo em <100ms
- **Memory Usage**: Monitoramento de vazamentos
- **Rendering**: 60fps em animações de gráficos

## Performance Considerations

### Optimization Strategies
1. **Memoization**: Cache cálculos complexos
2. **Debouncing**: Agrupa updates em 300ms
3. **Lazy Loading**: Carrega gráficos sob demanda
4. **Virtual Scrolling**: Para tabelas grandes
5. **Web Workers**: Cálculos pesados em background

### Caching Strategy
```typescript
interface KPICache {
  key: string; // hash dos dados de entrada
  results: KPIResults;
  timestamp: Date;
  ttl: number; // time to live em ms
}

class KPICacheManager {
  get(dataHash: string): KPIResults | null;
  set(dataHash: string, results: KPIResults): void;
  invalidate(pattern?: string): void;
}
```

## Accessibility

### WCAG Compliance
- **Color Contrast**: Mínimo 4.5:1 para texto
- **Keyboard Navigation**: Tab order lógico
- **Screen Readers**: ARIA labels em gráficos
- **Focus Indicators**: Visíveis em todos os elementos
- **Alternative Text**: Descrições para elementos visuais

### Responsive Design
- **Mobile First**: Design otimizado para mobile
- **Breakpoints**: 320px, 768px, 1024px, 1440px
- **Touch Targets**: Mínimo 44px para elementos interativos
- **Readable Text**: Mínimo 16px em dispositivos móveis

## Security Considerations

### Data Validation
```typescript
const validateTaskData = (task: any): TaskData | null => {
  // Validação de tipos, datas, valores numéricos
  // Sanitização de strings
  // Verificação de ranges válidos
};
```

### Input Sanitization
- **XSS Prevention**: Escape de HTML em tooltips
- **SQL Injection**: N/A (dados locais)
- **Data Integrity**: Validação de integridade dos cálculos