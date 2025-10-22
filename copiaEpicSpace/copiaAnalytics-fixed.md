# copia(Analytics-fixed)

Visão geral da página Analytics-fixed: essa página apresenta uma visão analítica dos dados de tarefas, mostrando KPIs estatísticos, indicadores de status, controles de cache e uma área de gráficos. A página é responsiva e organizada em seções claras para header, KPIs, status/controles e gráficos. 

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Visão Geral

A página consome um array de tarefas (`tasks`) vindo do contexto global e utiliza um hook de cálculo de KPIs (`useAnalyticsKPIs`) que retorna um objeto com métricas estatísticas e funções de controle (por exemplo `invalidateCache`). A interação principal com backend (Supabase) é feita via hooks/contextos externos; a UI apenas exibe os estados e aciona funções como `refreshData`.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Componentes Principais

- `Charts`: componente que renderiza os gráficos da página (área destinada a múltiplos tipos de chart). 
- `KPILoadingIndicator`: indicador visual de cálculo/caching com props: `isCalculating`, `lastUpdated`, `cacheHit`, `variant`.
- `KPIVersionIndicator`: exibe a versão dos KPIs, recebe `version` e classes de estilo.
- Botões e Badges: `Button`, `Badge`, com variações `outline`, `default`, `secondary`.
- Ícones: utiliza `RefreshCw`, `TrendingUp`, `BarChart3` e SVGs inline nas cartas.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Layout e Estrutura

- Container principal: `<main className="container mx-auto px-6 py-8 space-y-8">`.
- Seção Header: título, descrição, badges com contagem de tarefas e status do analytics; botão de atualizar dados.
- Seção KPI Cards: grid 1-2 colunas responsiva (`grid grid-cols-1 lg:grid-cols-2 gap-6`) com 4 cards de métricas principais.
- Seção Status e Controles: duas colunas com card de status e card de controles avançados (limpar cache e versão).
- Seção Gráficos: área que contém o componente `Charts` (carrega gráficos mais pesados).

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Header (Detalhes e Interações)

- Título: "Análise Visual" e subtítulo de contexto.
- Badges:
  - Badge 1: ícone `BarChart3` + texto `{tasks.length} Tarefas` (dinâmico, número de tarefas do contexto).
  - Badge 2: ícone `TrendingUp` + texto `Supabase: {analyticsKPIs.isCalculating ? 'Calculando...' : 'Ativo'}` (indica se os KPIs estão sendo recalculados).
- Botão "Atualizar Dados":
  - `variant="outline"`, `size="sm"`, `onClick={refreshData}`.
  - `disabled` quando `isLoading || analyticsKPIs.isCalculating`.
  - Ícone `RefreshCw` que adiciona `animate-spin` se o botão estiver desabilitado por cálculo/refresh.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Indicadores de Status Rápido

- Badge de conexão: `Status: {connectionStatus}` com `variant` condicional: `'default'` quando `'connected'`, `'secondary'` em outros casos.
- Texto com `Última atualização: {lastUpdate.toLocaleTimeString()}`.
- Badge secundário quando `analyticsKPIs.isCalculating` exibindo `Processando Gráficos...` com ícone girando.
- `KPILoadingIndicator` posicionado logo abaixo do header, com props passadas do hook (`isCalculating`, `lastUpdated`, `cacheHit`) e `variant="badge"`.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## KPI Cards (Lista completa)

Cada cartão é um bloco com borda, background `bg-card`, padding e sombras com hover. Todos possuem um ícone colorido à esquerda, título, descrição curta e valor principal grande.

1) Média de Produção
- Título: "Média de Produção"
- Descrição: "Tempo médio por tarefa"
- Ícone: relógio estilizado (SVG inline)
- Valor exibido: `analyticsKPIs.averageProduction.toFixed(1) + ' dias'` (número decimal formatado)
- Observações: deve mostrar placeholder ou um estado de loading se `analyticsKPIs.isCalculating`.

2) Moda Estatística
- Título: "Moda Estatística"
- Descrição: "Duração mais comum"
- Ícone: estatísticas (SVG inline)
- Valor exibido: `{analyticsKPIs.mode.value} dias ({analyticsKPIs.mode.frequency}x)` — `mode` é um objeto com `value` e `frequency`.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

3) Mediana
- Título: "Mediana"
- Descrição: "Valor central"
- Ícone: indicador verde
- Valor exibido: `analyticsKPIs.median.toFixed(1) + ' dias'`.

4) Desvio Padrão
- Título: "Desvio Padrão"
- Descrição: "Variação dos dados"
- Ícone: painel roxo
- Valor exibido: `analyticsKPIs.standardDeviation.toFixed(1) + ' dias'`.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Status do Cálculo (Card)

- Estrutura: título, pequena descrição e 3 linhas de status:
  - `Status`: texto condicional que mostra `⚡ Processando` (quando `analyticsKPIs.isCalculating`) ou `✅ Atualizado` (caso contrário); estilo de cor muda conforme o estado.
  - `Fonte`: mostra `💾 Supabase` se `analyticsKPIs.cacheHit` for true, caso contrário `🔄 Recalculado`.
  - `Última Atualização`: `analyticsKPIs.lastUpdated.toLocaleTimeString('pt-BR')`.
- Observação: o card deve ter estados visuais distintos quando calculando (e.g., texto em azul) e quando atualizado (texto em verde).

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Controles Avançados (Card)

- Título: "Controles Avançados"
- Botão: "Limpar Cache" (`onClick={analyticsKPIs.invalidateCache}`) com `variant="outline"` tamanho `sm`.
- Indicador de Versão dos KPIs: componente `KPIVersionIndicator` recebendo `analyticsKPIs.version` para exibir a versão do algoritmo/dados.
- Observação: o botão deve estar habilitado mesmo quando os cálculos estão ativos, mas a UX pode mostrar um spinner ou confirmar a ação.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Seção de Gráficos

- `Charts` é renderizado sem props explicitadas no arquivo (provavelmente lê do contexto/hooks). Deve suportar múltiplos tipos de gráficos: barras, pizza, box-plot e distribuições de atraso/duração.
- O espaço dos charts deve usar lazy-loading se os gráficos forem pesados; demonstrar placeholders ou skeletons enquanto `analyticsKPIs.isCalculating`.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Hooks e Fluxo de Dados

- `useGlobalContext()` fornece: `tasks`, `isLoading`, `refreshData`, `lastUpdate`, `connectionStatus`.
- `useAnalyticsKPIs(tasks, options)` retorna um objeto `analyticsKPIs` com pelo menos os campos: `isCalculating`, `lastUpdated`, `cacheHit`, `averageProduction`, `median`, `mode: { value, frequency }`, `standardDeviation`, `version`, `invalidateCache`, `isCalculating` e possivelmente `isError`.
- `useToast()` é usado para exibir notificações em três momentos: início do cálculo, conclusão (com número de tarefas processadas) e erro.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Contrato da Implementação (Inputs / Outputs)

- Inputs: `tasks` (Array de objetos de tarefa com campos essenciais como `start_date`, `end_date`, `deadline`), contexto de conexão.
- Outputs: `analyticsKPIs` com métricas (números e metadados) e funções (`invalidateCache`).
- Erros: o hook pode expor `error` ou acionar `onError` para tratamento.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Estados e Edge Cases

- Lista vazia de `tasks`: exibir estado vazio e desabilitar botão de atualizar (ou mantê-lo habilitado mas com aviso).
- Cálculos longos: exibir `KPILoadingIndicator` e badge "Processando Gráficos...".
- Erros de Supabase: exibir toast com variant `destructive` e manter a UI estável.
- Cache vs Recalculo: `analyticsKPIs.cacheHit` determina a fonte; `invalidateCache` força recálculo.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Acessibilidade e UX

- Botões devem ter foco visível e labels claros (e.g., `aria-label` para o botão de atualizar).
- Badges e estados devem ser legíveis em leitores de tela (usar `aria-live` para notificações dinâmicas se necessário).
- Cores devem respeitar contraste mínimo e não serem única forma de comunicação (usar ícones/texto além da cor).

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Como Recriar a Página (Checklist de Desenvolvimento)

1. Criar o layout principal com `container`, header, grid para KPIs e seção de gráficos.
2. Implementar hooks/contextos necessários (`useGlobalContext`, `useAnalyticsKPIs`).
3. Implementar componentes visuais: `KPILoadingIndicator`, `KPIVersionIndicator`, `Charts`.
4. Ligar toasts nos callbacks `onCalculationStart`, `onCalculationComplete` e `onError`.
5. Implementar o botão `refreshData` com condição de desabilitar.
6. Testar cenários: sem tarefas, com cache, com cálculo em progresso e com erro.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Observações Finais

- Este documento descreve todos os elementos visuais e comportamentos presentes em `Analytics-fixed.tsx` e serve como referência para recriação fiel da página. 
- Mantenha a separação entre apresentação e lógica: não persistir estados em localStorage nem criar mocks embutidos na UI.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Textos exatos de Toasts e Mensagens

- Ao iniciar o cálculo (onCalculationStart):
  - title: "Atualizando Analytics"
  - description: "Recalculando gráficos e estatísticas..."
  - duration: 2000

- Ao completar o cálculo (onCalculationComplete):
  - title: "Analytics Atualizado"
  - description: `Gráficos atualizados com dados de ${results.totalTasks} tarefas` (valor dinâmico do hook)
  - duration: 3000

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

- Ao ocorrer erro (onError):
  - title: "Erro na Análise"
  - description: "Falha ao processar dados para analytics."
  - variant: "destructive"
  - duration: 5000

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Propriedades e Tipos Esperados do Hook `useAnalyticsKPIs`

- Parâmetros de entrada:
  - `tasks`: Array<any> — lista de tarefas com campos mínimos: `id`, `start_date`, `end_date`, `deadline`, `status`.
  - `options`: objeto com propriedades:
    - `debounceMs`: number
    - `cacheTTL`: number (ms)
    - `enableCache`: boolean
    - `onCalculationStart`: () => void
    - `onCalculationComplete`: (results: { totalTasks: number }) => void
    - `onError`: (error: Error) => void

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

- Retorno esperado (obj):
  - `isCalculating`: boolean
  - `lastUpdated`: Date
  - `cacheHit`: boolean
  - `averageProduction`: number
  - `median`: number
  - `mode`: { value: number, frequency: number }
  - `standardDeviation`: number
  - `version`: string
  - `invalidateCache`: () => void

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Atributos e Acessibilidade Recomendados

- Botão "Atualizar Dados":
  - aria-label="Atualizar dados de analytics"
  - title="Atualizar dados"
  - role="button"

- Badges: usar `aria-hidden` para ícones e fornecer texto alternativo claro para leitores de tela.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Responsividade e Estilos

- Header: em telas pequenas (mobile), os badges e botão devem empilhar-se verticalmente e ocupar largura total.
- Grid de KPIs: `grid-cols-1` no mobile e `lg:grid-cols-2` em telas maiores.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Exemplo de Acessibilidade para KPILoadingIndicator

- Incluir `aria-live="polite"` no `KPILoadingIndicator` para anunciar mudanças de status para leitores de tela.
- Garantir `role="status"` para elementos que anunciam progresso.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.
