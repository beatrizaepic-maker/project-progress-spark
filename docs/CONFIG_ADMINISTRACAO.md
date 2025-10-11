# Configuração e Administração

## Configurações de Produtividade
- Arquivo: `src/config/gamification.ts`
- Chaves: early, on_time, late, refacao (0–100). Validação com clamp e persistência em localStorage.
- UI: Página `/controle` permite editar percentuais.

## Políticas e Temporadas
- Página `/controle` — seção "Temporadas e Políticas".
- Ação: Reprocessar Ranking por Temporada (POST `/api/reprocess`).
- Flag: "Permitir recálculo de prazo pós-conclusão" (apenas quando em refação). Persistida em `localStorage: epic_flag_allow_due_recalc`.

## Permissões
- Rota `/controle` protegida por role: exige `manager` ou `admin`.
- Implementação: `src/components/ProtectedRoute.tsx` (prop `requireRole`).

## Observabilidade e Flags (pendente)
- Logs/métricas de tempo de recomputação e anomalias de XP: a definir.
- Feature flags por competição: a definir.
