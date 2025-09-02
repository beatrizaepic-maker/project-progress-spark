# Documentação do Sistema de KPIs Avançados

## Visão Geral

O Sistema de KPIs Avançados é um conjunto abrangente de ferramentas para análise estatística e monitoramento de performance de projetos, implementado com React, TypeScript e otimizações de performance avançadas.

## Principais Funcionalidades

### 1. Dashboard de KPIs

#### 1.1 Cards de Indicadores
- **KPICard Base**: Componente reutilizável com suporte a status colorido
- **Indicador de Prazo**: Status do projeto com semáforo (verde/amarelo/vermelho)
- **Média de Atraso**: Cálculo considerando apenas dias úteis
- **Desvio Padrão**: Classificação de variabilidade com tooltips explicativos

```typescript
// Exemplo de uso
<KPICard
  title="Média de Atraso"
  value={averageDelay}
  trend={trendPercentage}
  status="warning"
  icon={<ClockIcon />}
/>
```

### 2. Analytics Avançado

#### 2.1 Gráficos Estatísticos
- **Gráfico de Produção**: Evolução temporal da média de produção
- **Análise de Moda**: Histograma de frequência com percentuais
- **Box Plot de Mediana**: Visualização de quartis com remoção automática de outliers
- **Distribuição de Atrasos**: Análise por faixas e padrões temporais

#### 2.2 Cálculos Estatísticos
- **Remoção de Outliers**: Método IQR (Interquartile Range)
- **Dias Úteis**: Exclusão automática de fins de semana
- **Estatísticas Descritivas**: Média, moda, mediana, desvio padrão

```typescript
// Exemplo de configuração de cálculo
const kpiConfig = {
  excludeWeekends: true,
  removeOutliers: true,
  outlierMethod: 'IQR' as const,
  workingDaysOnly: true
};
```

### 3. Sistema de Cache Inteligente

#### 3.1 Cache LRU (Least Recently Used)
- **Armazenamento Eficiente**: Cache com limite configurável
- **Invalidação Automática**: Baseada em mudanças nos dados
- **Chaves Contextuais**: Diferentes caches para Dashboard, Analytics e Tasks

#### 3.2 Hash de Dados
- **Detecção de Mudanças**: Hash baseado em propriedades relevantes
- **Versionamento**: Controle de versão dos cálculos
- **TTL Configurável**: Time-to-live personalizável por contexto

```typescript
// Configuração de cache
const cacheConfig = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutos
  type: 'dashboard',
  maxSize: 50
};
```

### 4. Otimizações de Performance

#### 4.1 Lazy Loading
- **Carregamento Sob Demanda**: Gráficos carregam apenas quando necessário
- **Intersection Observer**: Detecção de visibilidade automática
- **Preload Inteligente**: Componentes críticos têm prioridade

#### 4.2 Virtual Scrolling
- **Tabelas Grandes**: Renderização apenas de itens visíveis
- **Overscan Configurável**: Itens extras para scroll suave
- **Memory Efficient**: Baixo uso de memória mesmo com milhares de itens

#### 4.3 Memoização Avançada
- **LRU Cache**: Sistema de cache inteligente para cálculos
- **Stable Keys**: Chaves estáveis para evitar recalculações
- **React.memo**: Otimização de re-renders desnecessários

```typescript
// Exemplo de uso de virtual scrolling
<VirtualScrollTable
  data={tasks}
  itemHeight={80}
  containerHeight={600}
  renderItem={(task, index, style) => (
    <TaskRow task={task} style={style} />
  )}
  overscan={5}
/>
```

### 5. Monitoramento de Performance

#### 5.1 Métricas Automáticas
- **Tempo de Cálculo**: Medição automática de operações
- **Uso de Memória**: Monitoramento do heap JavaScript
- **Cache Hit Rate**: Taxa de acerto do cache
- **Tempo de Renderização**: Performance de componentes

#### 5.2 Sistema de Alertas
- **Limites Configuráveis**: Thresholds personalizáveis
- **Alertas em Tempo Real**: Notificações de performance degradada
- **Categorização**: Info, Warning, Error

#### 5.3 Dashboard de Monitoramento
- **Estatísticas em Tempo Real**: Métricas atualizadas automaticamente
- **Histórico de Performance**: Análise temporal
- **Identificação de Gargalos**: Piores performers por componente

```typescript
// Uso do monitor de performance
const { measureCalculation, getStats } = usePerformanceMonitor('KPICalculator');

const result = await measureCalculation(
  () => calculator.calculateAll(tasks),
  'calculateAll'
);
```

### 6. Sistema de Tratamento de Erros

#### 6.1 Recuperação Automática
- **Fallbacks**: Valores padrão para cálculos que falham
- **Try-Catch Inteligente**: Captura e tratamento de erros específicos
- **Logging Estruturado**: Informações detalhadas para debugging

#### 6.2 Validação de Dados
- **Sanitização**: Limpeza automática de dados de entrada
- **Verificação de Integridade**: Validação de consistência entre datas
- **Mensagens Claras**: Feedback acionável para o usuário

### 7. Acessibilidade e Responsividade

#### 7.1 ARIA e Navegação por Teclado
- **ARIA Labels**: Descrições para leitores de tela
- **Navegação por Tab**: Ordem lógica de foco
- **Feedback Visual**: Indicadores de foco visíveis

#### 7.2 Design Responsivo
- **Layout Adaptável**: Cards se reorganizam em telas pequenas
- **Touch-Friendly**: Elementos apropriados para dispositivos móveis
- **Contraste Adequado**: Mínimo de 4.5:1 para acessibilidade

## Configuração e Uso

### Instalação
```bash
npm install
npm run dev
```

### Configuração Básica
```typescript
import { useKPIs } from '@/hooks/useKPIs';
import { TaskData } from '@/data/projectData';

const MyComponent = ({ tasks }: { tasks: TaskData[] }) => {
  const kpis = useKPIs(tasks, {
    config: {
      excludeWeekends: true,
      removeOutliers: true
    },
    enableCache: true,
    cacheType: 'dashboard'
  });

  return (
    <div>
      <KPICard
        title="Média de Atraso"
        value={kpis.averageDelay}
        trend={kpis.delayTrend}
      />
    </div>
  );
};
```

### Configuração Avançada
```typescript
// Configuração personalizada de thresholds
import { performanceMonitor } from '@/utils/performance-monitor';

performanceMonitor.setThresholds({
  calculationTime: 500, // ms
  memoryUsage: 50, // MB
  cacheHitRate: 0.8 // 80%
});

// Configuração de cache personalizada
import { globalKPICache } from '@/services/kpiCache';

globalKPICache.setDefaultTTL(10 * 60 * 1000); // 10 minutos
```

## Estrutura de Arquivos

```
src/
├── components/
│   ├── analytics/          # Gráficos e visualizações
│   ├── dashboard/          # Cards de KPI e dashboard
│   └── ui/                 # Componentes base reutilizáveis
├── hooks/
│   ├── useKPIs.ts         # Hook principal para KPIs
│   └── usePerformance.ts  # Hook de monitoramento
├── services/
│   ├── kpiCalculator.ts   # Lógica de cálculos estatísticos
│   ├── kpiCache.ts        # Sistema de cache
│   └── errorHandler.ts    # Tratamento de erros
├── utils/
│   ├── performance-monitor.tsx  # Monitor de performance
│   ├── advanced-memoization.tsx # Sistema de memoização
│   └── accessibility.ts   # Utilitários de acessibilidade
└── types/
    └── kpi.types.ts       # Definições de tipos
```

## Performance e Escalabilidade

### Benchmarks
- **Até 1.000 tarefas**: <100ms para cálculo completo
- **Até 10.000 tarefas**: Virtual scrolling mantém 60fps
- **Cache hit rate**: >90% em uso típico
- **Uso de memória**: <50MB para datasets médios

### Otimizações Implementadas
1. **Lazy Loading**: Componentes carregam sob demanda
2. **Virtual Scrolling**: Renderização eficiente de listas grandes
3. **Memoização**: Cache inteligente para cálculos repetitivos
4. **Debouncing**: Evita cálculos excessivos durante digitação
5. **React.memo**: Prevenção de re-renders desnecessários

## Troubleshooting

### Problemas Comuns

#### Performance Lenta
1. Verifique o dashboard de performance (disponível em desenvolvimento)
2. Ajuste os thresholds de cache
3. Considere reduzir o número de gráficos visíveis simultaneamente

#### Cache Não Funcionando
1. Verifique se `enableCache` está `true`
2. Confirme se os dados têm propriedades estáveis (id, timestamp)
3. Verifique o TTL do cache

#### Erros de Cálculo
1. Valide os dados de entrada (datas válidas, formatos corretos)
2. Verifique se há tarefas suficientes para cálculos estatísticos
3. Consulte os logs do console para detalhes específicos

### Logs e Debugging
```typescript
// Habilitar logs detalhados
localStorage.setItem('debug', 'kpi:*');

// Verificar estatísticas de cache
console.log(globalKPICache.getStats());

// Exportar dados de performance
console.log(performanceMonitor.exportData());
```

## Contribuição

### Adicionando Novos KPIs
1. Adicione o cálculo em `KPICalculator`
2. Crie interface no `KPIResults`
3. Implemente componente visual
4. Adicione testes unitários

### Criando Novos Gráficos
1. Use o padrão de lazy loading
2. Implemente memorização para dados processados
3. Adicione acessibilidade (ARIA labels)
4. Teste em diferentes tamanhos de tela

## Versioning e Changelog

### v1.0.0 - Sistema Base
- ✅ Cálculos estatísticos básicos
- ✅ Dashboard de KPIs
- ✅ Gráficos de analytics

### v2.0.0 - Otimizações Avançadas
- ✅ Sistema de cache LRU
- ✅ Lazy loading e virtual scrolling
- ✅ Monitoramento de performance
- ✅ Acessibilidade completa

### v2.1.0 - Próximas Melhorias
- [ ] Exportação de relatórios
- [ ] Filtros avançados
- [ ] Comparação temporal
- [ ] API para dados externos

## Suporte e Contato

Para questões técnicas, consulte:
1. Esta documentação
2. Comentários no código
3. Testes unitários como exemplos
4. Dashboard de performance para métricas
