# copia(Control)

Este documento descreve detalhadamente a página `Control.tsx` (painel de controle/administração de configurações e flags do sistema). O objetivo é permitir a reprodução fiel da página, cobrindo todos os cards, inputs, botões, fluxos, endpoints e comportamentos, SEM inserir dados mock, fictícios ou lógica de dados em localStorage.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Visão Geral

A página exibe cards para configuração de temporada, políticas de recálculo, percentuais de produtividade, modo de pontuação, saúde do sistema, métricas e rollout por competição. Permite acionar endpoints REST para reprocessamento, dry-run, alteração de flags e salvar configurações.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Estrutura de Cards e Seções

- **Card: Temporadas e Políticas**
	- Input de texto para temporada atual (`season`).
	- Checkbox para permitir recálculo de prazo após conclusão (flag salva em localStorage `epic_flag_allow_due_recalc`).
	- Botões:
		- "Reprocessar Ranking por Temporada": aciona endpoint POST `/api/reprocess` com `{ season }`.
		- "Dry-run": aciona endpoint POST `/api/reprocess` com `{ season, dryRun: true }` e exibe previewCount.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

- **Card: Configuração de Percentuais**
	- Inputs numéricos para percentuais de cada classificação: `early`, `on_time`, `late`, `refacao`.
	- Botão "Salvar Configurações": chama função `setProductivityConfig(form)` e exibe alert de sucesso.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

- **Card: Modo de Pontuação e Saúde**
	- Select para modo de pontuação: `productivity` ou `legacy`.
	- Botão "Aplicar": POST em `/api/admin/flags` com `{ scoringMode }`.
	- Exibe saúde do servidor (usuários, tarefas, cache) e métricas detalhadas (requests, cache, ranking, SSE, anomalias, etc), atualizadas a cada 10s.
	- Link para exportar métricas Prometheus.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

- **Card: Rollout por Competição**
	- Inputs: ID da competição, checkbox ativado, select modo, input rollout %.
	- Botão "Salvar/Atualizar Competição": POST em `/api/admin/flags/competition` com dados do formulário.
	- Lista de competições configuradas, com botões "Editar" (preenche form) e "Remover" (DELETE em `/api/admin/flags/competition/:id`).

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Fluxos e Comportamentos

- Ao alterar o checkbox de recálculo, salva flag em localStorage e reflete no input.
- Ao salvar percentuais, atualiza config global via função e alerta.
- Ao reprocessar ranking, faz POST e alerta sucesso/falha.
- Ao dry-run, faz POST e alerta previewCount.
- Ao aplicar modo de pontuação, faz POST e alerta.
- Ao salvar flag de competição, faz POST e atualiza lista.
- Ao remover flag, faz DELETE e atualiza lista.
- Métricas e saúde são atualizadas via fetch a cada 10s.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Inputs, Botões e Acessibilidade

- Todos os inputs possuem labels claras e são agrupados por contexto.
- Botões possuem textos descritivos e são estilizados com `rounded-none`.
- Inputs de número possuem restrições de min/max quando aplicável.
- Links externos abrem em nova aba e possuem `rel="noreferrer"`.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Endpoints REST Utilizados

- `POST /api/reprocess` — reprocessa ranking por temporada ou faz dry-run.
- `POST /api/admin/flags` — aplica modo de pontuação global.
- `POST /api/admin/flags/competition` — salva/atualiza flag de competição.
- `DELETE /api/admin/flags/competition/:id` — remove flag de competição.
- `GET /api/admin/flags` — carrega flags e modos atuais.
- `GET /api/health` — saúde do servidor.
- `GET /api/metrics` — métricas detalhadas.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

## Checklist para Recriação

1. Implementar todos os cards e inputs conforme descrito.
2. Garantir que todos os botões acionam os endpoints corretos e exibem alertas.
3. Atualizar métricas e saúde do servidor periodicamente.
4. Garantir acessibilidade e labels claros.
5. Não usar dados mock, fictícios ou lógica de localStorage além do flag de recálculo.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

---

Este documento cobre todos os detalhes necessários para a reprodução fiel da página Control.tsx, seguindo as diretrizes do projeto.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

1. Implementar todos os cards e inputs conforme descrito.
2. Garantir que todos os botões acionam os endpoints corretos e exibem alertas.
3. Atualizar métricas e saúde do servidor periodicamente.
4. Garantir acessibilidade e labels claros.
5. Não usar dados mock, fictícios ou lógica de localStorage além do flag de recálculo.

NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.
