# Documentação Completa do Sistema de Gamificação, Pontuação e Ranking da Plataforma EPIC Space

## Visão Geral do Sistema

A plataforma EPIC Space implementa um sofisticado sistema de gamificação que visa aumentar o engajamento e produtividade dos desenvolvedores através de mecanismos de gamificação. O sistema é composto por múltiplos componentes interligados que geram XP (Experiência), níveis, rankings e missões com base no desempenho das tarefas.

## Componentes do Sistema de Gamificação

### 1. Cálculo de XP (Experiência)

O sistema implementa um modelo avançado de cálculo de XP baseado em produtividade percentual, substituindo o modelo antigo de pontos fixos por tarefa. O cálculo é feito da seguinte forma:

#### Classificação de Entregas:
- **Adiantada (early)**: Tarefa entregue antes do prazo → 110% de produtividade
- **No prazo (on_time)**: Tarefa entregue no prazo → 100% de produtividade  
- **Atrasada (late)**: Tarefa entregue após o prazo → 50% de produtividade
- **Em Refação (refacao)**: Tarefa em estado de refação → 40% de produtividade
- **Tarefa não completada**: Não entra no denominador da média

#### Fórmula de Cálculo de XP:
```
XP = roundHalfUp((somaPercentuais / totalTarefasConsideradas) * 10)
```

Onde:
- somaPercentuais = somatório dos percentuais das tarefas classificadas
- totalTarefasConsideradas = número total de tarefas que entraram no cálculo
- roundHalfUp = arredondamento half-up (0.5 arredonda para cima)

#### Configuração Editável:
Os percentuais são configuráveis em runtime através do arquivo `src/config/gamification.ts` e podem ser ajustados na página `/controle`. As configurações padrão são:
- early: 110%
- on_time: 100%
- late: 50%
- refacao: 40%

### 2. Sistema de Níveis

O sistema de níveis é baseado no XP total acumulado do usuário. As regras de níveis podem ser armazenadas no banco de dados (tabela `level_rules`) ou usar valores padrão:

Níveis Padrão:
- Nível 1: 0 XP
- Nível 2: 100 XP
- Nível 3: 300 XP
- Nível 4: 600 XP
- Nível 5: 1000 XP
- Nível 6: 1500 XP
- Nível 7: 2100 XP
- Nível 8: 2800 XP
- Nível 9: 3600 XP
- Nível 10: 4500 XP

A fórmula para determinar o nível é: encontrar o maior nível com XP necessário menor ou igual ao XP do usuário.

### 3. Bônus de Consistência e Streaks

O sistema implementa um mecanismo de streak (sequência de dias ativos) com bônus de XP:

#### Cálculo de Bônus de Consistência:
- 0-2 dias consecutivos: 0 XP de bônus
- 3-6 dias consecutivos: até 20 XP de bônus (2 por dia)
- 7+ dias consecutivos: até 50 XP de bônus (1 por dia, com máximo de 50)

#### Integração com Ranking:
O XP de streak é opcionalmente incluído no ranking total, semanal e mensal. As configurações de inclusão são controladas por flags:
- `includeIn.total`: Incluir XP de streak no ranking total
- `includeIn.weekly`: Incluir XP de streak no ranking semanal  
- `includeIn.monthly`: Incluir XP de streak no ranking mensal

O XP de streak é calculado diariamente e registrada na tabela `streak_awards` no Supabase.

### 4. Sistema de Missões

O sistema de missões implementa objetivos específicos que os usuários podem completar para ganhar recompensas de XP:

#### Tipos de Missões Disponíveis:
- `complete_tasks`: Completar N tarefas
- `complete_early`: Completar N tarefas adiantadas
- `attend_meetings`: Participar de N reuniões
- `review_peer_tasks`: Revisar N tarefas de colegas
- `streak_days`: Manter sequência por N dias
- `no_delays`: Não atrasar nenhuma tarefa
- `high_effort_tasks`: Completar tarefas de alta dificuldade

#### Distribuição de Missões:
- Missões semanais são geradas automaticamente no início de cada semana
- Sistematicamente 3 missões são atribuídas aleatoriamente de um pool de missões configuradas
- As missões têm diferentes recompensas de XP, prazos e objetivos

#### Processamento e Premiação:
O sistema avalia e aplica automaticamente missões completadas, registrando o XP ganho no histórico de XP do usuário. As tarefas que contribuem para missões são monitoradas e o progresso é atualizado automaticamente.

### 5. Sistema de Ranking

O ranking é calculado com base no XP de produtividade e inclui múltiplos períodos:

#### Tipos de Ranking:
- **Ranking Total**: Baseado no XP total acumulado
- **Ranking Semanal**: Baseado no XP ganho na semana atual
- **Ranking Mensal**: Baseado no XP ganho no mês atual

#### Atualização do Ranking:
O ranking é recalculado automaticamente quando:
- Uma tarefa é atualizada (status, datas de conclusão ou vencimento)
- Uma missão é completada
- Um usuário faz login diário (bônus de streak)
- Um administrador aciona um reprocessamento manual

#### Desempate no Ranking:
Quando usuários têm o mesmo XP, o desempate é feito por:
1. **Maior XP total** (prioridade principal)
2. **Menor número de submissões incorretas** (tarefas atrasadas ou em refação)
3. **Primeiro a concluir** (menor timestamp de primeira conclusão de XP)

#### Persistência de Rankings:
As informações de ranking são armazenadas nas seguintes tabelas no Supabase:
- `user_rankings`: Dados atuais de ranking dos usuários
- `ranking_history`: Histórico de posições e dados de ranking ao longo do tempo
- `season_rankings`: Rankings específicos por temporada
- `ranking_cache`: Cache de dados para melhorar performance
- `ranking_updates_log`: Registro de quando e como os rankings são atualizados

### 6. Sistema de Temporadas

O sistema suporta temporadas para agrupamento de estatísticas e competições:

#### Características:
- Temporadas são definidas com datas de início e término
- Cada temporada pode ter rankings separados
- XP e estatísticas são redefinidos ou reiniciados em cada temporada
- Os dados históricos são mantidos para análise comparativa

#### Tabela relacionada:
- `player_seasons`: Define as temporadas ativas e passadas

### 7. Histórico e Auditoria de XP

O sistema mantém um histórico completo de ganho e perda de XP:

#### Tabela `xp_history`:
- Armazena todos os eventos de alteração de XP
- Inclui razão, descrição e entidade relacionada
- Usado para auditoria, análise e rollback se necessário

#### Tipos de Eventos de XP:
- `task`: XP ganho por conclusão de tarefa
- `mission`: XP ganho por conclusão de missão
- `bonus`: XP bônus especial
- `penalty`: XP perdido por penalidades
- `streak`: XP ganho por streak diário

### 8. Balanceamento e Modos de Scoring

O sistema suporta dois modos de cálculo de produtividade:

#### Modo Produtividade (Padrão):
- XP baseado na média percentual de completude das tarefas
- Considera classificação de entrega (adiantada/no prazo/atrás/reação)
- Mais justo e reflete verdadeira produtividade

#### Modo Legado:
- Cada tarefa completa vale 10 XP
- Simples mas menos representativo de verdadeira produtividade

#### Flags de Administração:
- Flags administrativas permitem controle granular
- Rollout parcial entre modos de scoring
- Aplicação diferenciada por competição (projeto ou grupo)

### 9. Recursos de Persistência

Todos os dados do sistema de gamificação são persistidos no Supabase:

#### Tabelas Principais:
- `user_rankings`: Ranking atual dos usuários
- `player_profiles`: Perfil gamificado dos jogadores
- `xp_history`: Histórico de XP
- `missions`: Missões ativas e completadas
- `user_streaks`: Controle de streaks
- `player_productivity_metrics`: Métricas de produtividade detalhadas

### 10. Considerações de Desempenho

#### Caching:
- Dados de ranking são cacheados para melhor performance
- Cache com TTL configurável (padrão: 15 segundos)
- Recálculo em segundo plano com atualização de cache

#### Índices:
- Índices compostos para consultas rápidas (user_id + season_id)
- Índices para ordenação de XP e posição
- Otimização para consultas frequentes de ranking

#### API Endpoints:
- `GET /api/ranking`: Ranking completo
- `GET /api/profiles/:id`: Perfil detalhado com métricas
- `POST /api/reprocess`: Recálculo manual de ranking
- `GET /api/events`: SSE para atualizações em tempo real

## Conclusão

O sistema de gamificação da plataforma EPIC Space é uma implementação sofisticada que combina elementos de produtividade, competição saudável e engajamento contínuo. O sistema é altamente configurável, com mecanismos de balanceamento, persistência robusta e mecanismos de desempate justos. A abordagem baseada em produtividade percentual oferece uma representação mais justa e precisa do desempenho real dos desenvolvedores em comparação com sistemas baseados em pontos simples por tarefa.

O sistema está integrado com o banco de dados Supabase para persistência segura e eficiente, com políticas de segurança (RLS) para proteger os dados dos usuários e mecanismos de cache para garantir bom desempenho mesmo com grande volume de dados.