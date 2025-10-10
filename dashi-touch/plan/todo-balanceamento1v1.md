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
- [ ] Arredondamento: XP inteiro (round half up, 0.5 para cima); exibir sem casas decimais; clamp 0–100% por tarefa e XP ≥ 0.
- [ ] Validar limites por tarefa (clamp 0–100%) e por média.
- [ ] Recalcular agregados on-demand e via job assíncrono (ver seção de processos).
 - [ ] Modelo de cálculo: HÍBRIDO — materializar agregados (`somaPercentuais`, `totalTarefas`, `submissoesIncorretas`) e calcular XP na leitura (XP = round((soma/total)*10)); aplicar cache no leaderboard.

## Regras de desempate e penalidades
- [ ] Implementar desempate: (1) maior XP; (2) menor número de submissões incorretas; (3) menor tempo total/primeiro a concluir.
- [ ] Submissões incorretas: contabilizar tentativas reprovadas (falhas de validação/entrega) sem reduzir percentuais; usar apenas como critério de desempate.
- [ ] Atualizar documentação das regras e testes de desempate conforme acima.

## Fluxos de conclusão/refação
- [ ] Adicionar novo status no workflow: `Refação`.
- [ ] No evento "tarefa concluída": classificar (adiantada/no prazo/atrasada/refação) com base em `prazo` × `dataConclusao` → calcular `percentualProdutividade` → atualizar agregados.
- [ ] Ao mover para "Refação": remover contribuição anterior da tarefa (somaPercentuais e totalTarefas) e marcar para novo cálculo.
- [ ] Ao reconcluir após refação: reclassificar, calcular novo `percentualProdutividade` e recolocar no denominador.
- [ ] Garantir que o servidor calcula o percentual (não confiar em input do cliente).
 - [ ] Alteração de prazo pós-conclusão: somente dispara recálculo se a tarefa estiver em `Refação` e se a opção estiver habilitada na página `/controle` (Temporadas/Políticas).

## APIs/DTOs e contratos
- [ ] Atualizar endpoints que expõem pontuação/ranking para incluir: `totalTarefas`, `somaPercentuais`, `mediaPercentual`, `xp`.
- [ ] Ajustar payloads de criação/conclusão de tarefa: enviar dados de prazo/fechamento/estado em vez de “pontos”.
- [ ] Ordenação do leaderboard por `xp` (derivado da média) + desempates atualizados.
- [ ] Versionar API se necessário e manter compatibilidade temporária.
- [ ] Testes de contrato (schema, tipos, campos obrigatórios, backward-compat).
 - [ ] Visibilidade dos dados: garantir que o endpoint de ranking NÃO exponha percentuais/média; percentuais disponíveis apenas no endpoint de perfil.
 - [ ] Submissões incorretas: armazenar/contabilizar para desempate; não expor no ranking (campo interno ou agregado no perfil, se necessário).

## UI/UX
- [ ] Leaderboard: exibir apenas `XP` (média × 10); NÃO exibir percentuais, médias ou critérios no ranking.
- [ ] Perfil do player: exibir percentuais detalhados por tarefa e a média de produtividade, além da distribuição de entregas (adiantadas/no prazo/atrasadas/refação) e evolução temporal.
- [ ] Textos/legendas: atualizar cópias substituindo “cada problema vale 1 ponto”.
- [ ] Estados vazios (0 tarefas → XP = 0) e explicações.
- [ ] i18n/locale: novos termos e percentuais.
 - [ ] Página `/controle`: adicionar card "Temporadas" para configurar período e ação manual de reprocessar ranking por temporada.

## Processos assíncronos e cache
- [ ] Criar job MANUAL para reprocessar rankings por temporada (acionado pela página `/controle`); sem agendamento automático para histórico.
- [ ] Invalidar/atualizar caches do leaderboard ao mudar tarefa/estado.
- [ ] Emitir eventos (websocket/stream) com XP atualizado quando aplicável.
 - [ ] Implementar camada de cache para leaderboard (in-memory/distribuído) com invalidação por eventos de tarefa e por reprocesso de temporada.

## Relatórios e exportações
- [ ] Atualizar relatórios que somavam “pontos” para usar média percentual e XP convertido.
- [ ] Incluir novas métricas: taxa de adiantadas/no prazo/atrasadas/refação por jogador e por competição.
 - [ ] (Opcional) Relatar contagem de submissões incorretas por jogador/competição em relatórios administrativos.

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
 - [ ] Documentar definição de "submissões incorretas" e a ordem de desempate.
 - [ ] Documentar o conceito de "Temporadas" e o reprocessamento manual por período na página `/controle`.

## Migração e cronograma
- [ ] Planejar janela de migração e impacto (tempo de recomputação, bloqueios temporários de ranking) por temporada.
- [ ] Script de reprocessar por temporada (dry-run + execução) e validação de amostras.
- [ ] Comunicação aos usuários sobre temporadas, mudanças no ranking e critérios.

## Verificações pós-release (quality gates)
- [ ] Monitorar divergência entre XP exibido e métricas de base.
- [ ] Validar leaderboard com casos de controle e amostras reais.
- [ ] Plano de rollback documentado e testado.

## Decisões definidas
- XP exibido é inteiro (round half up, sem casas decimais).
- Status "Refação" criado; não conta no denominador até reconclusão. Ao entrar em refação, remover contribuição anterior; ao reconcluir, reaplicar com novo percentual.
- Submissões incorretas não reduzem percentuais; usadas apenas como critério de desempate (ordem: XP > menos incorretas > menor tempo/primeiro a concluir).
- Não recalcular histórico automaticamente; reprocessamento manual por temporada via `/controle`.
 - Modelo adotado: HÍBRIDO (agregados materializados; XP calculado na leitura + cache de leaderboard).
 - Alteração de prazo após conclusão: recálculo somente quando a tarefa estiver em `Refação` e com a opção habilitada na página `/controle`.

## Pendências de decisão (definir antes do build)
Nenhuma pendência crítica — pronto para iniciar a implementação conforme o plano acima.
