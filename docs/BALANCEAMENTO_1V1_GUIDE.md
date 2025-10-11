# Guia de Balanceamento 1v1 — Percentual de Produtividade → XP

Este guia documenta as regras, fluxos e contratos do novo cálculo de XP baseado em produtividade.

## Cálculo
- Por tarefa: classificar entrega em early (100), on_time (90), late (50). Tarefas em refação não entram no denominador até reconclusão.
- Média: soma dos percentuais / totalConsidered.
- XP exibido: XP = roundHalfUp(média × 10), inteiro, sem casas decimais.

## Visibilidade
- Ranking: exibe apenas XP, nível e métricas derivadas (sem percentuais ou médias).
- Perfil: exibe produtividade média e distribuição de entregas.

## Desempate
1) Maior XP; 2) Menos submissões incorretas; 3) Primeiro a concluir.

## Fluxos de refação
- enterRefacao: remove contribuição anterior (tira do denominador).
- reconcludeTask: recoloca no denominador com nova classificação/percentual.
- Alteração de prazo pós-conclusão: só recalcula quando em refação e flag habilitada em /controle.

## Persistência (mock)
- Materializa: somaPercentuais, totalTarefas, submissoesIncorretas.
- XP calculado na leitura (com cache no leaderboard).

## APIs (dev)
- GET /api/ranking — ranking ordenado por XP (e desempates).
- GET /api/profiles/:id — perfil com produtividade e distribuição.
- POST /api/tasks/update — atualiza tarefa e invalida cache.
- POST /api/reprocess — reprocesso manual por temporada.
- GET /api/events — SSE para push de atualizações (ranking:update).

## Exportações
- /api/reports/ranking.csv — XP/nível/weekly/monthly.
- /api/reports/productivity.csv — distribuição + média de produtividade.
- /api/reports/incorrect.csv — contagem de submissões incorretas (heurística dev).

## Configuração
- Percentuais editáveis em runtime: `src/config/gamification.ts` e página `/controle`.
- Flag “Permitir recálculo de prazo pós-conclusão” em `/controle` (persistida em localStorage).

## Testes
- Unitários: classificação, agregação e arredondamento.
- Integrados: ordenação/desempates e refação.
- E2E: pendente.
