# Documentação de Dados Mock

Este documento lista todos os dados mock (fictícios) utilizados no projeto Progress Spark para facilitar a localização e manutenção futura.

## 1. Dados Principais - `src/data/projectData.ts`

Arquivo principal contendo os dados mock para tarefas do projeto:

### mockTaskData
Array de objetos `TaskData` com 6 tarefas representando um projeto completo:
1. Análise de Requisitos
2. Design UI/UX
3. Desenvolvimento Frontend
4. Desenvolvimento Backend
5. Testes e QA
6. Deploy e Documentação

### projectMetrics
Objeto contendo métricas calculadas com base nos dados mock:
- totalTarefas: 6
- tarefasNoPrazo: 3
- tarefasAtrasadas: 3
- mediaProducao: 5.5
- mediaAtrasos: 1.2
- desvioPadrao: 1.8
- moda: 2
- mediana: 5

## 2. Dados de Teste - `src/__tests__/e2e-flows.test.tsx`

### completeProjectData
Array de objetos `TaskData` com 10 tarefas mais detalhadas para testes E2E:
1. Análise de Requisitos
2. Design UI/UX
3. Desenvolvimento Backend
4. Desenvolvimento Frontend
5. Testes Unitários
6. Testes Integração
7. Deploy Homologação
8. Testes UAT
9. Correções UAT
10. Deploy Produção

### Mocks de Componentes
- MockDashboard
- MockAnalytics
- MockDataEditor

### Mocks de Contexto
- MockDataProvider
- MockAppProvider

## 3. Dados de Estado e Preferências - `src/services/appStateManager.ts`

### AppState
Interface contendo o estado global da aplicação:
- tasks: TaskData[]
- lastUpdate: Date
- kpiCache: Map<string, any>
- userPreferences: UserPreferences
- navigationContext: NavigationContext

### UserPreferences
Objeto contendo as preferências do usuário:
- theme: 'light' | 'dark' | 'system'
- defaultPage: 'dashboard' | 'analytics' | 'tasks'
- kpiRefreshInterval: number
- enableRealTimeUpdates: boolean
- chartAnimations: boolean
- compactView: boolean

### NavigationContext
Objeto contendo o contexto de navegação:
- currentPage: string
- previousPage: string
- breadcrumb: string[]
- lastAction: string
- timestamp: Date

## 4. Dados de Validação - `src/services/dataValidator.ts`

### ValidationConfig
Configurações para validação de dados:
- allowFutureDates: boolean
- maxTaskDuration: number (em dias)
- minTaskDuration: number (em dias)
- strictDateFormat: boolean
- allowEmptyEndDates: boolean
- maxDelayDays: number

### ValidationResult
Estrutura de retorno da validação:
- isValid: boolean
- errors: ValidationError[]
- warnings: ValidationWarning[]
- sanitizedData?: TaskData[]

## 5. Dados de KPIs - `src/services/kpiCalculator.ts`

### KPIConfig
Configurações para cálculo de KPIs:
- outlierThreshold: number (IQR multiplier)
- workingDaysOnly: boolean
- holidays: Date[]
- riskThresholdDays: number
- modeGroupingInterval: number

### KPIResults
Estrutura completa dos resultados de KPIs, incluindo:
- projectDeadlineStatus
- projectCompletionPercentage
- averageDelay
- standardDeviation
- averageProduction
- mode
- median
- delayDistribution
- taskDetails
- metadata (lastUpdated, totalTasks, etc.)
- error handling properties
- validation result

## 6. Utilização dos Dados Mock

### Páginas que utilizam mockTaskData:
- Dashboard (`src/pages/Dashboard.tsx`)
- Analytics (`src/pages/Analytics.tsx`)
- Tasks (`src/pages/Tasks.tsx`)
- DataEditor (`src/pages/DataEditor.tsx`)
- Index (`src/pages/Index.tsx`)
- Settings (`src/pages/Settings.tsx`)

### Testes que utilizam mockTaskData:
- integration-basic.test.ts
- integration-e2e.test.tsx
- performance-basic.test.ts

### Contextos que utilizam mockTaskData:
- GlobalContext (`src/contexts/GlobalContext.tsx`)
- DataProvider (`src/contexts/DataContext.tsx`)

### Serviços que utilizam dados mock:
- AppStateManager (`src/services/appStateManager.ts`)
- KPICalculator (`src/services/kpiCalculator.ts`)
- DataValidator (`src/services/dataValidator.ts`)

## 7. Estrutura de Dados

### Interface TaskData
```typescript
interface TaskData {
  id: number;
  tarefa: string;
  responsavel?: string;
  inicio: string; // Formato: YYYY-MM-DD
  fim?: string;  // Formato: YYYY-MM-DD (opcional)
  prazo: string; // Formato: YYYY-MM-DD
  duracaoDiasUteis: number;
  atrasoDiasUteis: number;
  atendeuPrazo: boolean;
  status: 'backlog' | 'todo' | 'in-progress' | 'completed';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
}
```

## 9. Atualização de Dados Mock

Para atualizar os dados mock:
1. Modifique `mockTaskData` em `src/data/projectData.ts`
2. Atualize `projectMetrics` com base nos novos dados
3. Verifique se todos os testes ainda passam
4. Atualize `completeProjectData` em `src/__tests__/e2e-flows.test.tsx` se necessário
5. Atualize as configurações em `appStateManager`, `kpiCalculator` e `dataValidator` se necessário

## 10. Diretrizes para Dados Mock

1. Manter consistência entre todas as fontes de dados mock
2. Usar datas realistas no formato YYYY-MM-DD
3. Incluir casos de sucesso e falha (tarefas no prazo e atrasadas)
4. Representar diferentes estágios de progresso (status)
5. Cobrir diferentes níveis de prioridade
6. Manter dados em português para consistência com o projeto

## 4. Estrutura de Dados

### Interface TaskData
```typescript
interface TaskData {
  id: number;
  tarefa: string;
  responsavel?: string;
  inicio: string; // Formato: YYYY-MM-DD
  fim?: string;  // Formato: YYYY-MM-DD (opcional)
  prazo: string; // Formato: YYYY-MM-DD
  duracaoDiasUteis: number;
  atrasoDiasUteis: number;
  atendeuPrazo: boolean;
  status: 'backlog' | 'todo' | 'in-progress' | 'completed';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
}
```

## 5. Atualização de Dados Mock

Para atualizar os dados mock:
1. Modifique `mockTaskData` em `src/data/projectData.ts`
2. Atualize `projectMetrics` com base nos novos dados
3. Verifique se todos os testes ainda passam
4. Atualize `completeProjectData` em `src/__tests__/e2e-flows.test.tsx` se necessário

## 6. Diretrizes para Dados Mock

1. Manter consistência entre todas as fontes de dados mock
2. Usar datas realistas no formato YYYY-MM-DD
3. Incluir casos de sucesso e falha (tarefas no prazo e atrasadas)
4. Representar diferentes estágios de progresso (status)
5. Cobrir diferentes níveis de prioridade
6. Manter dados em português para consistência com o projeto