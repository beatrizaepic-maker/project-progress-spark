# copia(Dashboard)

Este documento descreve detalhadamente a página `Dashboard.tsx` (painel principal de métricas e KPIs do projeto). O objetivo é permitir a reprodução fiel da página, cobrindo todos os cards, inputs, botões, fluxos, endpoints e comportamentos, SEM inserir dados mock, fictícios ou lógica de dados em localStorage.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Estrutura de Cards e Seções

- **KPIs Estatísticos Avançados**
	- Componente `DashboardKPIs` exibe métricas como média de produção, moda, mediana, desvio padrão, total de tarefas, tarefas concluídas, percentual de conclusão, entre outros.
	- Dados são processados pelo hook `useKPIs` a partir das tarefas carregadas do Supabase.
	- Exibição visual com títulos, subtítulos e valores destacados.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

- **Exportação de Relatório em PDF**
	- Botão "Exportar Relatório" aciona a função `exportReport`, que gera um PDF com todos os KPIs, análise de atrasos, distribuição de prioridades, próximas entregas e observações.
	- Utiliza a biblioteca `jsPDF` para formatação, cores, títulos, rodapé e paginação.
	- O relatório inclui dados reais do Supabase, sem mock.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

- **Métricas Complementares**
	- Componente `MetricsCards` exibe métricas adicionais de acompanhamento.
	- Organizado em seção própria, com título e subtítulo.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

- **Critical Players (Análise Individual)**
	- Três cards principais:
		- "Mais Tarefas Atrasadas": mostra o membro com mais atrasos, nome e quantidade.
		- "Pior Aproveitamento": mostra o membro com menor percentual de tarefas concluídas.
		- "Mais Refações": mostra o membro com mais tarefas em refação.
	- Cada card usa cálculos diretos sobre o array de tarefas (`taskData`).
	- Cards usam efeito de elevação com animação (framer-motion) e destaque visual.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

- **Resumo Estatístico**
	- Card visual com ícone, título, subtítulo e principais métricas calculadas automaticamente.
	- Exibe média de produção, moda, mediana e desvio padrão.
	- Efeito visual de brilho ao passar o mouse.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Fluxos e Comportamentos

- Ao carregar a página, faz fetch dos dados de tarefas do Supabase (`tasks`).
- KPIs são recalculados automaticamente ao atualizar os dados.
- Botão de exportação gera PDF com todos os dados atuais.
- Cards de Critical Players atualizam em tempo real conforme os dados carregados.
- Todos os cards e métricas são responsivos e acessíveis.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Inputs, Botões e Acessibilidade

- Botão "Exportar Relatório" com texto descritivo, cor gradiente e efeito de escala ao hover.
- Todos os cards possuem títulos, subtítulos e valores destacados.
- Layout responsivo com grid para cards individuais.
- Labels e textos acessíveis para leitores de tela.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Endpoints REST/Supabase Utilizados

- `GET tasks` — carrega todas as tarefas do projeto.
- Dados processados localmente para KPIs, atrasos, prioridades e próximas entregas.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Checklist para Recriação

1. Implementar todos os cards e seções conforme descrito.
2. Garantir que o botão de exportação gere PDF com todos os dados reais.
3. Garantir responsividade e acessibilidade dos cards.
4. Não usar dados mock, fictícios ou lógica de localStorage.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

---

Este documento cobre todos os detalhes necessários para a reprodução fiel da página Dashboard.tsx, seguindo as diretrizes do projeto.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

1. Implementar todos os cards e seções conforme descrito.
2. Garantir que o botão de exportação gere PDF com todos os dados reais.
3. Garantir responsividade e acessibilidade dos cards.
4. Não usar dados mock, fictícios ou lógica de localStorage.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Visão Geral

A página Dashboard apresenta um painel de métricas avançadas, KPIs estatísticos, análise de performance individual (Critical Players), exportação de relatório em PDF e cards de resumo estatístico. Todos os dados são carregados do Supabase e processados em tempo real para exibição e geração de relatórios.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.
