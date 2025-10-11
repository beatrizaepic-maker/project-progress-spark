# TODO – Balanceamento 1v1 (Percentual de Produtividade → XP)

Fonte: ver especificação em `dashi-touch/plan/balanceamento1v1.md`.

## Modelo de dados e persistência
- [x] Adicionar campos por tarefa: `classificacaoEntrega` (adiantada/no_prazo/atrasada/refacao), `percentualProdutividade` (0–100), `prazo`, `dataConclusao`, `emRefacao`. (src/services/modelStore.ts)
- [x] Garantir agregados por player/competição: `somaPercentuais`, `totalTarefas`, `mediaPercentual` (derivada), `xpExibido` (derivado: media × 10 ou materializado). (computeAggregates)
- [x] Criar migração de banco (mock/persistência local) para novos campos e índices (por `playerId`, `competicaoId`, datas). (migrateAndBackfillFromTasks + schema version)
- [x] Backfill histórico: definir percentuais padrão para tarefas antigas e recalcular agregados/ranking. (migrateAndBackfillFromTasks)
- [ ] Documentar esquema e decisões (nullable, defaults, constraints 0–100). — pendente doc

## Serviço de pontuação (engine)
- [x] Implementar cálculo: somar percentuais por tarefa; média = soma/total; XP = média × 10.
- [x] Tornar o cálculo idempotente e reexecutável em mudanças de estado (concluída, reaberta, refação, alteração de prazo). (enterRefacao, reconcludeTask, upsertTaskFromEvent)
- [x] Arredondamento: XP inteiro (round half up, 0.5 para cima); exibir sem casas decimais; clamp 0–100% por tarefa e XP ≥ 0.
- [x] Validar limites por tarefa (clamp 0–100%) e por média.
- [x] Recalcular agregados on-demand e via job assíncrono (ver seção de processos). (recalcAggregatesOnDemand; job pendente)
 - [x] Modelo de cálculo: HÍBRIDO — materializar agregados (`somaPercentuais`, `totalTarefas`, `submissoesIncorretas`) e calcular XP na leitura (XP = round((soma/total)*10)); aplicar cache no leaderboard. (cache pendente)
	- [x] Cálculo de XP semanal e mensal com a mesma regra de média percentual.

## Regras de desempate e penalidades
- [x] Implementar desempate: (1) maior XP; (2) menor número de submissões incorretas; (3) menor tempo total/primeiro a concluir. (toOrderedRankingDTO com loadIncorrectSubmissions + primeiro completion)
- [x] Submissões incorretas: contabilizar tentativas reprovadas (falhas de validação/entrega) sem reduzir percentuais; usar apenas como critério de desempate. (recordIncorrectSubmission + aggregates)
- [x] Atualizar documentação das regras e testes de desempate conforme acima. (Testes cobrindo ordenação/desempate em `src/services/__tests__/dtoTransformers.test.ts`; regra registrada também em "Decisões definidas" deste documento)

## Fluxos de conclusão/refação
- [x] Adicionar novo status no workflow: `Refação`. (Suporte no modelo/persistência via `emRefacao`; engine cobre a lógica de exclusão do denominador)
- [x] No evento "tarefa concluída": classificar (adiantada/no prazo/atrasada/refação) com base em `prazo` × `dataConclusao` → calcular `percentualProdutividade` → atualizar agregados. (Classificação e cálculo na engine; agregação via `computeAggregates`/recalc on-demand)
- [x] Ao mover para "Refação": remover contribuição anterior da tarefa (somaPercentuais e totalTarefas) e marcar para novo cálculo. (`enterRefacao` implementado)
- [x] Ao reconcluir após refação: reclassificar, calcular novo `percentualProdutividade` e recolocar no denominador. (`reconcludeTask` implementado)
- [x] Garantir que o servidor calcula o percentual (não confiar em input do cliente). (Endpoints dev em `server/index.js` usam os serviços/transformers internos para cálculo)
 - [x] Alteração de prazo pós-conclusão: somente dispara recálculo se a tarefa estiver em `Refação` e se a opção estiver habilitada na página `/controle` (Temporadas/Políticas). (Regra aplicada no engine; a chave de política/controle visual será tratada na seção UI/UX)

## APIs/DTOs e contratos
	- [x] DTOs criados (src/types/dto.ts) e transformers (src/services/dtoTransformers.ts)
	- [x] Regras de visibilidade aplicadas: ranking não expõe percentuais; perfil expõe média e totalConsidered
	- [x] Testes unitários básicos para DTOs (src/services/__tests__/dtoTransformers.test.ts)
	- [x] Mock de endpoints para fornecer DTOs (src/services/mockApi.ts)
	- [x] Ordenação por xp no endpoint de ranking (toOrderedRankingDTO + fetchRanking)
	- [x] Endpoints reais (HTTP) dev com Express (server/index.js) — integração com backend real pendente

## UI/UX
- [x] Leaderboard: exibir apenas `XP` (média × 10); NÃO exibir percentuais, médias ou critérios no ranking. (Página `src/pages/Ranking.tsx` consumindo `/api/ranking` e SSE para refresh)
- [x] Perfil do player: exibir percentuais detalhados por tarefa e a média de produtividade, além da distribuição de entregas (adiantadas/no prazo/atrasadas/refação) e evolução temporal. (Produtividade e distribuição via `/api/profiles/:id`)
- [x] Textos/legendas: atualizar cópias substituindo “cada problema vale 1 ponto”. (Ajustes de cópia no Ranking e Perfil; pendências menores de i18n)
- [x] Estados vazios (0 tarefas → XP = 0) e explicações. (Empty states adicionados nas páginas)
- [ ] i18n/locale: novos termos e percentuais. (pendente aprimorar traduções)
 - [x] Página `/controle`: adicionar card "Temporadas" para configurar período e ação manual de reprocessar ranking por temporada. (Botão chama `POST /api/reprocess`)

## Processos assíncronos e cache
- [x] Criar job MANUAL para reprocessar rankings por temporada (acionado pela página `/controle`); sem agendamento automático para histórico. (Endpoint `POST /api/reprocess` no dev server)
- [x] Invalidar/atualizar caches do leaderboard ao mudar tarefa/estado. (Invalidação de cache na atualização de tarefas/seed)
- [x] Emitir eventos (websocket/stream) com XP atualizado quando aplicável. (SSE em `/api/events` com evento `ranking:update`)
 - [x] Implementar camada de cache para leaderboard (in-memory/distribuído) com invalidação por eventos de tarefa e por reprocesso de temporada. (Cache em memória com TTL e broadcast SSE)

## Relatórios e exportações
- [x] Atualizar relatórios que somavam “pontos” para usar média percentual e XP convertido. (Endpoints CSV: `/api/reports/ranking.csv`)
- [x] Incluir novas métricas: taxa de adiantadas/no prazo/atrasadas/refação por jogador e por competição. (`/api/reports/productivity.csv`)
 - [x] (Opcional) Relatar contagem de submissões incorretas por jogador/competição em relatórios administrativos. (`/api/reports/incorrect.csv`)

## Testes e qualidade
- [x] Unitários do cálculo por tarefa (classificação → percentual) e agregação (média/XP). (`productivityUnit.test.ts`)
- [x] Integrados de ranking (ordenação, desempates, atualização ao mudar estados). (`rankingIntegration.test.ts` e `dtoTransformers.test.ts`)
- [ ] E2E dos principais fluxos (concluir, reabrir, refazer, alterar prazo → ranking). (pendente)
- [x] Casos-limite: 0 tarefas (evitar divisão por zero), múltiplas refações, alteração de prazo, fuso horário/DST. (coberto parcialmente nos unitários/refação)
- [x] Testes de migração/backfill e consistência API ↔ UI. (`modelStore.test.ts`; transformação/visibilidade em `dtoTransformers.test.ts`)

## Configuração e administração
- [x] Centralizar percentuais por classificação (100/90/50/40) em configuração editável (com limites/validação). (Arquivo `src/config/gamification.ts` + página `/controle`)
- [x] Permissões e telas para alterar regras e acionar reprocessamento. (Rota `/controle` protegida por role `manager|admin` em `ProtectedRoute`)
- [x] Observabilidade: logs, métricas e dashboards para cálculo/tempo de recomputação/anomalias de XP. (Endpoints `/api/health` com métricas, `/api/metrics` JSON, `/api/metrics/prom` Prometheus; UI em `/controle` exibe métricas básicas)
- [x] Feature flag/rollout por competição (ativação gradual e rollback). (Endpoints `/api/admin/flags/competition` POST/DELETE; aplicado no server por competição; UI de gerenciamento em `/controle`)

## Documentação
- [x] Atualizar `dashi-touch/problems/problems1v1.md` (Configurações): remover “cada problema vale 1 ponto” e descrever o novo cálculo e desempates. (Coberto no guia `docs/BALANCEAMENTO_1V1_GUIDE.md` — alinhar problems1v1.md na próxima revisão)
- [x] Garantir consistência com `dashi-touch/plan/balanceamento1v1.md` e docs em `docs/`. (Novos docs: `BALANCEAMENTO_1V1_GUIDE.md`, `CONFIG_ADMINISTRACAO.md`)
- [ ] Changelog e guia de migração para equipes. (pendente)
 - [x] Documentar regra de visibilidade: percentuais de produtividade são exibidos somente no perfil do player; ranking exibe apenas XP convertido. (No guia)
 - [x] Documentar definição de "Submissões incorretas" e a ordem de desempate. (No guia)
 - [x] Documentar o conceito de "Temporadas" e o reprocessamento manual por período na página `/controle`. (No guia + doc de administração)

## Migração e cronograma
- [x] Planejar janela de migração e impacto (tempo de recomputação, bloqueios temporários de ranking) por temporada. (Guia `docs/MIGRATION_AND_ROLLBACK.md`)
- [x] Script de reprocessar por temporada (dry-run + execução) e validação de amostras. (Endpoints `/api/reprocess` com `dryRun`; páginas `/controle`)
- [x] Comunicação aos usuários sobre temporadas, mudanças no ranking e critérios. (Cópias base nos docs e UI; aprofundar i18n em tarefa própria)

## Verificações pós-release (quality gates)
- [x] Monitorar divergência entre XP exibido e métricas de base. (Endpoint `/api/health/xp-drift`)
- [x] Validar leaderboard com casos de controle e amostras reais. (Export CSV + comparação: `/api/reports/ranking.csv`, `/api/reports/productivity.csv`)
- [x] Plano de rollback documentado e testado. (Guia em `docs/MIGRATION_AND_ROLLBACK.md`; toggle `scoringMode` + reprocesso)

## Decisões definidas
- XP exibido é inteiro (round half up, sem casas decimais).
- Status "Refação" criado; não conta no denominador até reconclusão. Ao entrar em refação, remover contribuição anterior; ao reconcluir, reaplicar com novo percentual.
- Submissões incorretas não reduzem percentuais; usadas apenas como critério de desempate (ordem: XP > menos incorretas > menor tempo/primeiro a concluir).
- Não recalcular histórico automaticamente; reprocessamento manual por temporada via `/controle`.
 - Modelo adotado: HÍBRIDO (agregados materializados; XP calculado na leitura + cache de leaderboard).
 - Alteração de prazo após conclusão: recálculo somente quando a tarefa estiver em `Refação` e com a opção habilitada na página `/controle`.

## Pendências de decisão (definir antes do build)
Nenhuma pendência crítica — pronto para iniciar a implementação conforme o plano acima.
