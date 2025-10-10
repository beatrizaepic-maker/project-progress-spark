# TODO – Balanceamento 1v1 (Percentual de Produtividade → XP)

Fonte: ver especificação em `dashi-touch/plan/balanceamento1v1.md`.

## Modelo de dados e persistência
- [ ] Adicionar campos por tarefa: `classificacaoEntrega` (adiantada/no_prazo/atrasada/refacao), `percentualProdutividade` (0–100), `prazo`, `dataConclusao`, `emRefacao`.
- [ ] Garantir agregados por player/competição: `somaPercentuais`, `totalTarefas`, `mediaPercentual` (derivada), `xpExibido` (derivado: media × 10 ou materializado).
- [ ] Criar migração de banco para novos campos e índices (por `playerId`, `competicaoId`, datas).
- [ ] Backfill histórico: definir percentuais padrão para tarefas antigas e recalcular agregados/ranking.
- [ ] Documentar esquema e decisões (nullable, defaults, constraints 0–100).

## Serviço de pontuação (engine)
- [ ] Implementar cálculo: somar percentuais por tarefa; média = soma/total; XP = média × 10.
- [ ] Tornar o cálculo idempotente e reexecutável em mudanças de estado (concluída, reaberta, refação, alteração de prazo).
- [ ] Definir política de arredondamento do XP (floor/ceil/round; casas decimais) e aplicar globalmente.
- [ ] Validar limites por tarefa (clamp 0–100%) e por média.
- [ ] Recalcular agregados on-demand e via job assíncrono (ver seção de processos).

## Regras de desempate e penalidades
- [ ] Revisar desempate: 1) quem termina primeiro; 2) penalidade por submissões incorretas.
- [ ] Decidir como penalidades interagem: ajustam percentual da tarefa ou apenas desempate? Registrar decisão.
- [ ] Atualizar documentação das regras e testes de desempate.

## Fluxos de conclusão/refação
- [ ] No evento "tarefa concluída": classificar (adiantada/no prazo/atrasada/refação) com base em `prazo` × `dataConclusao` → calcular `percentualProdutividade` → atualizar agregados.
- [ ] No evento "refação"/"reaberta": reverter/ajustar percentual anterior e recomputar ao reconcluir.
- [ ] Garantir que o servidor calcula o percentual (não confiar em input do cliente).
- [ ] Confirmar se tarefas em refação entram no denominador e quando (decisão + implementação).

## APIs/DTOs e contratos
- [ ] Atualizar endpoints que expõem pontuação/ranking para incluir: `totalTarefas`, `somaPercentuais`, `mediaPercentual`, `xp`.
- [ ] Ajustar payloads de criação/conclusão de tarefa: enviar dados de prazo/fechamento/estado em vez de “pontos”.
- [ ] Ordenação do leaderboard por `xp` (derivado da média) + desempates atualizados.
- [ ] Versionar API se necessário e manter compatibilidade temporária.
- [ ] Testes de contrato (schema, tipos, campos obrigatórios, backward-compat).
 - [ ] Visibilidade dos dados: garantir que o endpoint de ranking NÃO exponha percentuais/média; percentuais disponíveis apenas no endpoint de perfil.

## UI/UX
- [ ] Leaderboard: exibir apenas `XP` (média × 10); NÃO exibir percentuais, médias ou critérios no ranking.
- [ ] Perfil do player: exibir percentuais detalhados por tarefa e a média de produtividade, além da distribuição de entregas (adiantadas/no prazo/atrasadas/refação) e evolução temporal.
- [ ] Textos/legendas: atualizar cópias substituindo “cada problema vale 1 ponto”.
- [ ] Estados vazios (0 tarefas → XP = 0) e explicações.
- [ ] i18n/locale: novos termos e percentuais.

## Processos assíncronos e cache
- [ ] Criar job para recomputar rankings (competição ativa e histórico) e reconciliação.
- [ ] Invalidar/atualizar caches do leaderboard ao mudar tarefa/estado.
- [ ] Emitir eventos (websocket/stream) com XP atualizado quando aplicável.

## Relatórios e exportações
- [ ] Atualizar relatórios que somavam “pontos” para usar média percentual e XP convertido.
- [ ] Incluir novas métricas: taxa de adiantadas/no prazo/atrasadas/refação por jogador e por competição.

## Testes e qualidade
- [ ] Unitários do cálculo por tarefa (classificação → percentual) e agregação (média/XP).
- [ ] Integrados de ranking (ordenação, desempates, atualização ao mudar estados).
- [ ] E2E dos principais fluxos (concluir, reabrir, refazer, alterar prazo → ranking).
- [ ] Casos-limite: 0 tarefas (evitar divisão por zero), múltiplas refações, alteração de prazo, fuso horário/DST.
- [ ] Testes de migração/backfill e consistência API ↔ UI.

## Configuração e administração
- [ ] Centralizar percentuais por classificação (100/90/50/40) em configuração editável (com limites/validação).
- [ ] Permissões e telas para alterar regras e acionar reprocessamento.
- [ ] Observabilidade: logs, métricas e dashboards para cálculo/tempo de recomputação/anomalias de XP.
- [ ] Feature flag/rollout por competição (ativação gradual e rollback).

## Documentação
- [ ] Atualizar `dashi-touch/problems/problems1v1.md` (Configurações): remover “cada problema vale 1 ponto” e descrever o novo cálculo e desempates.
- [ ] Garantir consistência com `dashi-touch/plan/balanceamento1v1.md` e docs em `docs/`.
- [ ] Changelog e guia de migração para equipes.
 - [ ] Documentar regra de visibilidade: percentuais de produtividade são exibidos somente no perfil do player; ranking exibe apenas XP convertido.

## Migração e cronograma
- [ ] Planejar janela de migração e impacto (tempo de recomputação, bloqueios temporários de ranking).
- [ ] Script de recalcular histórico (dry-run + execução) e validação de amostras.
- [ ] Comunicação aos usuários sobre mudanças no ranking e critérios.

## Verificações pós-release (quality gates)
- [ ] Monitorar divergência entre XP exibido e métricas de base.
- [ ] Validar leaderboard com casos de controle e amostras reais.
- [ ] Plano de rollback documentado e testado.

## Pendências de decisão (definir antes do build)
- [ ] Arredondamento do XP exibido: inteiro vs decimal; regra global (floor/ceil/round; casas decimais).
- [ ] Inclusão de tarefas em refação no denominador: quando e como contam.
- [ ] Penalidade por submissões incorretas: reduz percentual ou apenas desempate?
- [ ] Reprocessar histórico (sim/não) e período de abrangência.
