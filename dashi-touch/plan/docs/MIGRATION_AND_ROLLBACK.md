# Migração por Temporada e Plano de Rollback

## Objetivo
Aplicar o novo cálculo (produtividade → XP) por temporada, com capacidade de dry-run, reprocesso manual e rollback seguro.

## Passos de Migração (por temporada)
1) Preparação
- Congelar alterações de configuração na janela de manutenção.
- Exportar relatórios atuais (CSV) para amostra de validação.
- Verificar saúde do servidor: GET `/api/health`.

2) Dry-run
- POST `/api/reprocess` com `{ season, dryRun: true }`.
- Validar contagem de linhas, ordenar por XP e comparar top-N com amostras.

3) Aplicação
- Confirmar flags: GET `/api/admin/flags` (scoringMode = productivity).
- POST `/api/reprocess` sem `dryRun` para invalidar cache e propagar SSE.

4) Validação
- GET `/api/health/xp-drift` deve retornar `maxDrift=0` (produtividade) para consistência interna.
- Validar leaderboard visualmente + exportar `/api/reports/ranking.csv` e `/api/reports/productivity.csv` para conferência.

5) Comunicação
- Avisar usuários do período e mudanças (cópias preparadas na UI e docs).

## Rollback
- Trocar modo de pontuação para `legacy` via POST `/api/admin/flags` `{ scoringMode: 'legacy' }`.
- POST `/api/reprocess` para nova invalidação de cache e broadcast.
- Monitorar `/api/health/xp-drift` e validar ranking.

## Notas
- Histórico não é recalculado automaticamente; sempre use reprocesso manual por temporada.
- Alteração de prazo pós-conclusão só recalcula quando em refação e com a flag habilitada.
