# Tasks.tsx — Documentação Estruturada

## Visão Geral
A página `Tasks.tsx` é o painel completo de gerenciamento de tarefas do sistema EPIC Space. Permite visualização, filtragem, importação, exportação, geração de relatórios e análise gráfica de tarefas por temporada, com integração total ao contexto de dados e componentes visuais customizados.

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

## Estrutura Visual e Componentes
- **Tabela de Tarefas:**
  - Componente `TaskTable` exibe todas as tarefas filtradas, com suporte a filtros rápidos (prioridade, status, concluídas hoje).
  - Ref controlado por hook para aplicar filtros programaticamente.
- **Seletor de Temporada:**
  - Dropdown para selecionar temporada, filtrando tarefas por datas de início, prazo ou conclusão.
- **Cards e Gráficos:**
  - Cards de estatísticas: total de tarefas, concluídas, pendentes.
  - Gráfico de linhas (Recharts) mostra evolução diária de tarefas concluídas e pendentes na temporada selecionada.
  - Componentes visuais customizados para tooltip, legenda e container do gráfico.
- **Ações:**
  - Botões para exportar dados (JSON), importar dados (JSON) e gerar relatório PDF das tarefas.
  - Toasts de feedback para todas as ações.

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

## Fluxos e Lógica
- **Filtragem de Tarefas:**
  - Filtra tarefas por temporada selecionada, considerando datas de início, prazo e conclusão.
  - Filtros rápidos aplicam prioridade ou status diretamente na tabela.
- **Estatísticas:**
  - Calcula total de tarefas, concluídas (no prazo), pendentes.
- **Exportação e Importação:**
  - Exporta tarefas filtradas como JSON.
  - Importa tarefas de arquivo JSON, validando formato.
- **Relatório PDF:**
  - Gera relatório PDF com estatísticas e tabela detalhada das tarefas.
- **Gráfico de Evolução:**
  - Gera dados diários de tarefas concluídas e pendentes para o gráfico de linhas.
- **Feedback Visual:**
  - Toasts para sucesso/erro em todas as operações.
  - Cards com efeito de elevação visual.

## Estados e Hooks
- `useState`: controla lista de tarefas, temporadas, seleção, filtros, etc.
- `useRef`: referência para aplicar filtros rápidos na tabela.
- `useMemo`: otimiza filtragem de tarefas e geração de dados do gráfico.

## Funções e Eventos
- `applyQuickFilter`: aplica filtros rápidos na tabela.
- `handleExportData`, `handleImportData`: exportam/importam tarefas em JSON.
- `handleGeneratePDF`: gera relatório PDF das tarefas.
- `generateChartData`: gera dados para o gráfico de evolução.
- `setSelectedSeasonIdx`: seleciona temporada ativa.

## Checklist de Elementos e Fluxos
- [x] Tabela de tarefas com filtros rápidos
- [x] Seletor de temporada
- [x] Cards de estatísticas (total, concluídas, pendentes)
- [x] Gráfico de linhas de evolução diária
- [x] Exportação/importação de dados em JSON
- [x] Geração de relatório PDF
- [x] Toasts de feedback para todas as ações
- [x] Sem dados mock ou lógica de localStorage

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

---

> Esta documentação detalha todos os elementos, fluxos, estados e comportamentos da página `Tasks.tsx` para permitir a reprodução fiel da tela, conforme implementado no sistema original.
