# copia(DataEditor)

Este documento descreve detalhadamente a página `DataEditor.tsx` (editor avançado de tarefas e dados do projeto). O objetivo é permitir a reprodução fiel da página, cobrindo todos os fluxos, inputs, botões, endpoints, estados e comportamentos, SEM inserir dados mock, fictícios ou lógica de dados em localStorage.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Estrutura de Componentes e Seções

- **Editor de Dados (DataEditor)**
	- Permite visualizar, editar, adicionar e excluir tarefas do projeto.
	- Suporte a múltiplos modos de visualização: tabela, Kanban, player.
	- Edição inline de campos: título, responsável, status, prioridade, datas, etc.
	- Importação e exportação de dados (JSON/CSV) via Supabase Storage.
	- Garantia de IDs únicos para tarefas ao carregar e atualizar.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

- **Debug e Monitoramento (DEV only)**
	- Seção visível apenas para usuários com role/access DEV.
	- Exibe métricas técnicas e KPIs detalhados das tarefas.
	- Utiliza o componente `KPIDebugSection` para análise avançada.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Fluxos e Comportamentos

- Ao carregar a página, busca todas as tarefas do Supabase usando `getTasksData`.
- Garante IDs únicos para todas as tarefas carregadas e ao receber eventos de atualização.
- Atualiza o estado global de tarefas via `DataProvider`.
- Escuta eventos `tasks:changed` para atualizar a lista em tempo real.
- Permite edição, exclusão, criação e importação/exportação de tarefas.
- Seção de debug só aparece para usuários DEV.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Inputs, Botões e Acessibilidade

- Inputs inline para edição de campos das tarefas.
- Botões para adicionar, editar, excluir, importar e exportar tarefas.
- Layout responsivo e acessível, com labels claros e agrupamento por contexto.
- Seção de debug com títulos e métricas acessíveis.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Endpoints REST/Supabase Utilizados

- `GET tasks` — carrega todas as tarefas do projeto.
- `POST/PUT/DELETE tasks` — cria, edita e remove tarefas.
- `GET/PUT Storage` — importa e exporta dados de tarefas.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Checklist para Recriação

1. Implementar todos os fluxos e componentes conforme descrito.
2. Garantir que todos os botões e inputs estejam funcionais e acessíveis.
3. Garantir responsividade e acessibilidade da interface.
4. Não usar dados mock, fictícios ou lógica de localStorage.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

---

Este documento cobre todos os detalhes necessários para a reprodução fiel da página DataEditor.tsx, seguindo as diretrizes do projeto.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

1. Implementar todos os fluxos e componentes conforme descrito.
2. Garantir que todos os botões e inputs estejam funcionais e acessíveis.
3. Garantir responsividade e acessibilidade da interface.
4. Não usar dados mock, fictícios ou lógica de localStorage.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Visão Geral

A página DataEditor oferece uma interface para gerenciamento completo das tarefas do projeto, com suporte a múltiplos modos de visualização, edição, importação/exportação, debug e monitoramento (DEV only). Todos os dados são carregados do Supabase e processados em tempo real.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.
