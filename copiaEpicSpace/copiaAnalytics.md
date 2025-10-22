# copia(Analytics)

Este documento descreve a página `Analytics.tsx` (versão rica em interatividade) em detalhes: layout, seções, componentes, toasts, partículas, comportamentos, hooks, props e acessibilidade. O objetivo é permitir a reprodução fiel da página sem inserir dados mock, armazenamento local ou lógica de dados local.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Visão Geral

A página apresenta visualizações analíticas avançadas com KPIs, versão de cálculo, indicadores de status, cards de métricas e um conjunto de gráficos `Charts`. Inclui um botão principal que dispara um efeito de partículas (sucesso) e força recálculo/callbacks.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Componentes Principais

- `SuccessParticles`: componente que cria um efeito visual de partículas no centro do botão de recálculo. Usa `framer-motion` (`motion` e `AnimatePresence`) e é posicionado usando as dimensões do botão (`getBoundingClientRect`).
- `Charts`: renderiza os gráficos da página.
- `useAnalyticsKPIs`: hook que calcula KPIs (debounce, cache, callbacks) com retorno similar ao usado em `Analytics-fixed` mas com propriedades adicionais (processingTime, dataHash, calculationId/version).
- `KPILoadingIndicator` e `KPIVersionIndicator`.
- `toast` para notificações com mensagens customizadas e classes de estilo para destaque.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Header e Badges

- Título: "Análise Visual" com subtítulo descritivo: "Visualização detalhada dos dados de duração, atrasos e performance".
- Badges/indicators:
	- `KPILoadingIndicator`: exibido apenas para usuários com `role === 'dev'` (verificar `user?.role`).
	- Informações adicionais (timestamp e versionamento) exibidas em cards no topo, com `lastUpdated` e `processingTime`.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Partículas (SuccessParticles)

- Implementação: usa `getBoundingClientRect` do botão para posicionar as partículas no centro do botão e `framer-motion` para animação.
- Comportamento: gera 46 partículas, cada uma com animação escalonada por delay (i * 0.04s), duração 1.8s, e movimento aleatório em X/Y.
- Uso: exibido por um estado `showParticles` que é ativado ao clicar no botão de recálculo e desativado após 1600ms; botão fica oculto por 1800ms para evitar cliques repetidos.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Cards de KPIs e Status

- Cards de métricas (Resumo Estatístico): média, moda, mediana, desvio padrão, com valores formatados via `toFixed(1)`.
- Card de status (Última Atualização, Status, Fonte, Tempo de Processamento) com cores e textos condicionais:
	- Status: '⚡ Recalculando' (quando isCalculating) ou '✅ Atualizado'.
	- Fonte: 'Supabase' (cacheHit) ou 'Tempo Real' (recalculation).

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Toasts e Estilizações

- onCalculationStart: toast com title "Atualizando Analytics" e description "Recalculando gráficos e estatísticas..." duração 2000ms.
- onCalculationComplete: toast com title "Analytics Atualizado" e description dinâmica mostrando `results.totalTasks`, duração 3000ms. Neste arquivo a toast de conclusão inclui `className` customizado: `bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] text-white rounded-none shadow-lg`.
- onError: toast com variant `destructive` e mensagem "Falha ao processar dados para analytics." duração 5000ms.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Ação do Botão Forçar Recálculo

- Ação principal ao clicar:
	1. Exibe partículas (setShowParticles(true)).
	2. Oculta o botão (setIsButtonHidden(true)).
	3. Chama `analyticsKPIs.invalidateCache()`.
	4. Chama `refreshData()` para buscar dados atualizados do backend.
	5. Remove partículas após 1600ms e reexibe o botão após 1800ms.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Hooks e Tipos Esperados

- `useGlobalContext`: retorna `tasks`, `refreshData`, possivelmente `isLoading` (dependendo da implementação).
- `useAuth`: fornece `user` com campo `role`.
- `useAnalyticsKPIs(validTasks, options)`: retorna `analyticsKPIs` com propriedades adicionais detectadas:
	- calculationId, calculationVersion, processingTime, dataHash, totalTasks, além dos campos padrão (isCalculating, lastUpdated, cacheHit, averageProduction, median, mode, standardDeviation, invalidateCache).

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Detalhes do `KPIVersionIndicator`

- Propriedades suportadas (observadas na página):
	- `calculationId`: string (UUID/identificador do cálculo)
	- `calculationVersion`: string (versão do algoritmo/rolagem)
	- `lastUpdated`: Date
	- `processingTime`: number (ms)
	- `cacheHit`: boolean
	- `dataHash`: string (hash dos dados de entrada)
	- `totalTasks`: number

- Comportamento: exibir informações técnicas em um layout compacto; quando `cacheHit` for true, mostrar indicador de cache com cor distinta.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Estrutura das Partículas e Acessibilidade

- Cada partícula é um elemento `div` com classe `particle`, tamanho 4x4 px, e cor `#FF0066`.
- As partículas são posicionadas `fixed` com coordenadas baseadas no botão. Elas não devem ser expostas a leitores de tela (usar `aria-hidden="true"`).

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Comportamento Responsivo

- Em telas pequenas, empilhar cards e reduzir espaçamentos; garantir que o botão de recálculo permaneça visível e acessível.
- Garantir que o componente `Charts` suporte `width: 100%` e que os gráficos usem `responsive` config para renderizar corretamente em containers estreitos.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Acessibilidade e Performance

- Recomendações de acessibilidade:
	- `KPILoadingIndicator` com `aria-live="polite"` quando o cálculo iniciar.
	- Botão de recálculo com `aria-label="Forçar Recálculo"` e `title` claro.
- Performance:
	- Validar e filtrar tarefas para garantir dados mínimos (`validTasks`) antes do cálculo.
	- Uso de debounce e cache TTL para reduzir carga de cálculo.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Checklist para Recriação

1. Implementar `SuccessParticles` usando `framer-motion`, posicionado com `getBoundingClientRect`.
2. Criar layout de cards e `Charts` com área principal responsiva.
3. Ligar `useAnalyticsKPIs` com callbacks de toast conforme o arquivo.
4. Implementar lógica do botão com estados `showParticles` e `isButtonHidden`.
5. Garantir tipagem e testes para `useAnalyticsKPIs` (validação de inputs e outputs).

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.
