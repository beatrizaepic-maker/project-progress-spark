# copia(Index)

Este documento descreve detalhadamente a página `Index.tsx` (versão do dashboard index), servindo como ponto de entrada do fluxo de visualização de métricas, com estados de data insuficiente, editor de dados, KPIs e gráficos. O objetivo é permitir a reprodução fiel da página, cobrindo todos os componentes, cards, fluxos, endpoints e comportamentos, SEM inserir dados mock, fictícios ou lógica de dados em localStorage.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Visão Geral

A página Index centraliza o acesso ao dashboard e controla a exibição condicional com base na qualidade dos dados: estado vazio (sem tarefas), estado com dados insuficientes, estado de erro de cálculo e dashboard completo. Integra componentes como Header, MetricsCards, Charts, TaskTable e DataEditor. Os dados são carregados via `getTasksData` do Supabase e fornecidos ao contexto `DataProvider`.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Estados Condicionais e Fluxos

- **Estado: Sem Tarefas (Empty)**
	- Condição: `tasks.length === 0` no contexto `useData`.
	- Comportamento: Exibe `Header` e um `InsufficientDataDisplay` com ações: `onAddData` (navegar/abrir criação), `onRefresh` (reload da página), `onImport` (abrir fluxo de importação).

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

- **Estado: Dados Insuficientes para Análise**
	- Condição: `!dataQuality.hasMinimumData`.
	- Comportamento: Exibe `Header`, `DataEditor`, `DataQualityIndicator` e `InsufficientDataDisplay` com detalhes sobre contagem de tarefas e orientação.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

- **Estado: Erro Crítico nos KPIs**
	- Condição: `kpiResults?.criticalErrors`.
	- Comportamento: Exibe `Header`, `DataEditor`, `InsufficientDataDisplay` com tipo `calculation-failed` e `TaskTable` para inspeção.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

- **Estado: Dashboard Completo**
	- Condição: dados suficientes e sem erros.
	- Comportamento: Exibe `Header`, `DataEditor`, `DataQualityIndicator` condicional, `MetricsCards`, `Charts` e `TaskTable`.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Componentes e Roles

- `Header` — barra superior com navegação e título.
- `MetricsCards` — apresenta KPIs resumidos do projeto.
- `Charts` — visualizações avançadas (duração vs atraso, distribuição, etc.).
- `TaskTable` — tabela detalhada de tarefas (edição e filtros).
- `DataEditor` — editor de dados integrado (importação/exportação, ajustes, ID dedupe).
- `InsufficientDataDisplay` — componente de estado vazio/erro com ações contextuais.
- `DataQualityIndicator` — componente que exibe indicadores de qualidade e contagens.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Interações, Eventos e Ações

- `onAddData` — deve navegar para o fluxo de criação de tarefa.
- `onRefresh` — recarrega a página para forçar nova leitura de dados.
- `onImport` — abre o fluxo de importação (upload para Supabase Storage e leitura posterior).
- `DataProvider` — inicializado com `getTasksData()` (atual serviço baseado em Supabase), provê `tasks`, `dataQuality`, `kpiResults` via `useData()`.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Endpoints e Integrações

- `getTasksData()` — função que busca dados do Supabase (serviço `supabaseDataService`).
- Supabase queries: `from('tasks').select(...).order('created_at', { ascending: false })`.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Acessibilidade e Responsividade

- Layout usa container responsivo (`container mx-auto`) e `grid`/`flex` para cards.
- Componentes visuais usam contrastes e labels acessíveis para leitores de tela.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Checklist para Recriação

1. Implementar os estados condicionais (empty, insufficient, error, complete) exatamente como no `Index.tsx`.
2. Garantir integração com `DataProvider` e `getTasksData` do Supabase.
3. Implementar ações `onAddData`, `onRefresh`, `onImport` conforme descrito.
4. Garantir que todos os componentes (Header, MetricsCards, Charts, TaskTable, DataEditor) estejam presentes e funcionais.
5. Garantir responsividade e acessibilidade.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

---

Este documento cobre os detalhes necessários para reproduzir fielmente a página `Index.tsx`. Ao implementar, siga as convenções de contexto e composição do projeto.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.
