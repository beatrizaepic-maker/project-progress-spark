# EPIC Space

## Sumário
1. [Visão Geral](#visão-geral)
2. [Estrutura de Dados](#estrutura-de-dados)
3. [Entidades e Relacionamentos](#entidades-e-relacionamentos)
4. [Tabelas do Banco de Dados](#tabelas-do-banco-de-dados)
5. [Operações CRUD](#operações-crud)
6. [Regras de Negócio e Cálculos](#regras-de-negócio-e-cálculos)
7. [Considerações de Segurança](#considerações-de-segurança)
8. [Performance e Indexação](#performance-e-indexação)
9. [Backup e Recuperação](#backup-e-recuperação)
10. [Integração com Frontend](#integração-com-frontend)
11. [Endpoints de API Relevantes](#endpoints-de-api-relevantes)
12. [Configurações e Variáveis de Ambiente](#configurações-e-variáveis-de-ambiente)

## Visão Geral

Este documento descreve a estrutura e funcionamento do banco de dados para o sistema Dashi-Touch, uma aplicação de gamificação para acompanhamento de produtividade e ranking de desenvolvedores, implementada no Supabase.

### Objetivo do Sistema
O sistema Dashi-Touch permite o acompanhamento de tarefas, cálculo de produtividade baseado em cumprimento de prazos, ranking de usuários e métricas de desempenho, com vistas a promover a melhoria contínua e engajamento dos desenvolvedores.

### Arquitetura Atual
- **Backend**: Servidor Express.js (Node.js) com persistência em Supabase (PostgreSQL)
- **Frontend**: Aplicação React com TypeScript
- **Persistência**: Supabase para dados principais, localStorage no frontend para dados locais
- **API**: REST API para comunicação entre frontend e backend
- **Autenticação**: Sistema de autenticação Supabase com provedores OAuth (Google, GitHub, etc.)
- **Storage**: Armazenamento de imagens de perfil e arquivos no Supabase Storage

## Estrutura de Dados

### Entidades Principais

#### 1. Usuário (User)
Representa um membro do time, jogador no sistema de gamificação.

**Atributos:**
- `id` (UUID): Identificador único do usuário (primary key)
- `email` (TEXT): Email do usuário (unique, not null)
- `username` (TEXT): Nome de usuário (unique, not null)
- `full_name` (TEXT): Nome completo do usuário
- `avatar_url` (TEXT): URL para imagem de avatar
- `bio` (TEXT): Biografia do usuário
- `created_at` (TIMESTAMPTZ): Data de criação da conta (default now())
- `updated_at` (TIMESTAMPTZ): Data de última atualização (default now())
- `timezone` (TEXT): Fuso horário do usuário (default 'UTC')
- `language_preference` (TEXT): Idioma preferido (default 'pt-BR')
- `theme_preference` (TEXT): Tema preferido (default 'light')

#### 2. Preferências do Usuário (UserPreferences)
Configurações de notificação e privacidade do usuário.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): Referência ao usuário (foreign key para users.id)
- `email_notifications_enabled` (BOOLEAN): Notificações por email ativadas (default true)
- `push_notifications_enabled` (BOOLEAN): Notificações push ativadas (default true)
- `sms_notifications_enabled` (BOOLEAN): Notificações SMS ativadas (default false)
- `notification_frequency` (TEXT): Frequência de notificações (default 'immediate')
- `privacy_level` (TEXT): Nível de privacidade do perfil (default 'public')
- `data_sharing_consent` (BOOLEAN): Consentimento para compartilhamento de dados (default false)

#### 3. Tarefa (Task)
Representa uma unidade de trabalho atribuída a um usuário.

**Atributos:**
- `id` (UUID): Identificador único da tarefa (primary key)
- `title` (TEXT): Título descritivo da tarefa (not null)
- `description` (TEXT): Descrição da tarefa
- `assigned_to` (UUID): ID do usuário responsável (foreign key para users.id)
- `status` (TEXT): Status da tarefa (default 'todo') - Valores possíveis: backlog, todo, in-progress, completed, refacao
- `priority` (TEXT): Prioridade da tarefa (default 'media') - Valores possíveis: baixa, media, alta, critica
- `start_date` (DATE): Data de início da tarefa (not null)
- `end_date` (DATE): Data de conclusão (pode ser nula)
- `deadline` (DATE): Data de vencimento da tarefa (not null)
- `duration_work_days` (INTEGER): Duração em dias úteis (default 0, calculado automaticamente)
- `delay_work_days` (INTEGER): Dias de atraso em dias úteis (default 0, calculado automaticamente)
- `on_time` (BOOLEAN): Indica se a tarefa foi entregue no prazo (default true, calculado automaticamente)
- `created_at` (TIMESTAMPTZ): Data de criação (default now())
- `updated_at` (TIMESTAMPTZ): Data de última atualização (default now())
- `project_id` (UUID): ID do projeto ao qual a tarefa pertence (foreign key para projects.id)

#### 4. Projeto (Project)
Agrupa tarefas relacionadas.

**Atributos:**
- `id` (UUID): Identificador único do projeto (primary key)
- `name` (TEXT): Nome do projeto (not null)
- `description` (TEXT): Descrição do projeto
- `created_by` (UUID): ID do usuário que criou o projeto (foreign key para users.id)
- `created_at` (TIMESTAMPTZ): Data de criação (default now())
- `updated_at` (TIMESTAMPTZ): Data de última atualização (default now())
- `start_date` (DATE): Data de início do projeto
- `deadline` (DATE): Data de vencimento do projeto

#### 5. Atribuição de Tarefa (TaskAssignments)
Histórico de atribuições de tarefas a usuários.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `task_id` (UUID): ID da tarefa (foreign key para tasks.id)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `assigned_at` (TIMESTAMPTZ): Data de atribuição (default now())
- `assigned_by` (UUID): ID do usuário que fez a atribuição (foreign key para users.id)

#### 6. Histórico de Tarefa (TaskHistory)
Registra alterações em tarefas para auditoria.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `task_id` (UUID): ID da tarefa (foreign key para tasks.id)
- `changed_by` (UUID): ID do usuário que fez a alteração (foreign key para users.id)
- `field_name` (TEXT): Nome do campo alterado (not null)
- `old_value` (TEXT): Valor antigo
- `new_value` (TEXT): Valor novo
- `changed_at` (TIMESTAMPTZ): Data da alteração (default now())

#### 7. Missão (Mission)
Objetivos específicos que os usuários podem completar para ganhar recompensas.

**Atributos:**
- `id` (UUID): Identificador único da missão (primary key)
- `user_id` (UUID): ID do usuário ao qual a missão está atribuída (foreign key para users.id)
- `config_id` (TEXT): Referência ao tipo de missão (not null)
- `name` (TEXT): Nome da missão (not null)
- `description` (TEXT): Descrição da missão
- `target` (INTEGER): Valor alvo para completar a missão (not null)
- `current_progress` (INTEGER): Progresso atual (default 0)
- `xp_reward` (INTEGER): XP recompensado ao completar (default 0)
- `deadline` (TIMESTAMPTZ): Data limite para completar a missão
- `completed` (BOOLEAN): Indica se a missão foi completada (default false)
- `completed_at` (TIMESTAMPTZ): Data de conclusão (pode ser nula)
- `created_at` (TIMESTAMPTZ): Data de criação (default now())

#### 8. Histórico de XP (XpHistory)
Registro de alterações de XP do usuário.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `amount` (INTEGER): Quantidade de XP ganha (positivo) ou perdida (negativo) (not null)
- `reason_type` (TEXT): Tipo de razão ('task_completion', 'mission', etc.) (not null)
- `reason_description` (TEXT): Descrição da razão
- `related_id` (TEXT): ID do item relacionado (tarefa, missão, etc.)
- `earned_at` (TIMESTAMPTZ): Data e hora do ganho (default now())

#### 9. Métricas de Usuário (UserMetrics)
Métricas e estatísticas de desempenho do usuário.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `task_completion_rate` (NUMERIC): Taxa de conclusão de tarefas
- `average_delay_days` (NUMERIC): Média de dias de atraso
- `total_tasks_completed` (INTEGER): Total de tarefas completadas (default 0)
- `total_tasks_delayed` (INTEGER): Total de tarefas atrasadas (default 0)
- `performance_score` (NUMERIC): Pontuação de desempenho
- `calculated_at` (TIMESTAMPTZ): Data de cálculo (default now())

#### 10. Perfil do Jogador (PlayerProfile)
Informações específicas de perfil do jogador com dados gamificados.

**Atributos:**
- `id` (UUID): Identificador único (primary key, referencia users.id)
- `user_id` (UUID): ID do usuário (foreign key para users.id, unique)
- `name` (TEXT): Nome do jogador (not null)
- `avatar` (TEXT): URL do avatar
- `role` (TEXT): Cargo/função do jogador
- `level` (INTEGER): Nível do jogador (default 1)
- `missions_completed` (INTEGER): Missões completadas (default 0)
- `streak` (INTEGER): Sequência atual de dias ativos (default 0)
- `best_streak` (INTEGER): Melhor sequência de dias ativos (default 0)
- `tasks_completion_rate` (NUMERIC): Taxa de conclusão de tarefas (default 0)
- `average_task_xp` (NUMERIC): Média de XP por tarefa (default 0)
- `joined_date` (DATE): Data de ingresso (default now())
- `profile_visibility` (TEXT): Visibilidade do perfil (default 'public') - 'public', 'team', 'private'
- `xp_visibility` (TEXT): Visibilidade de XP (default 'public') - 'public', 'team', 'private'
- `share_with_team` (BOOLEAN): Compartilhar com equipe (default true)
- `theme` (TEXT): Tema do perfil (default 'default')
- `created_at` (TIMESTAMPTZ): Data de criação (default now())
- `updated_at` (TIMESTAMPTZ): Data de última atualização (default now())

#### 11. Notificações do Usuário (UserNotifications)
Registros de notificações para os usuários.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `title` (TEXT): Título da notificação (not null)
- `message` (TEXT): Mensagem da notificação (not null)
- `type` (TEXT): Tipo da notificação (not null) - 'task', 'mission', 'achievement', 'warning', 'system'
- `is_read` (BOOLEAN): Indica se a notificação foi lida (default false)
- `xp_reward` (INTEGER): XP eventualmente associado à notificação
- `related_entity_type` (TEXT): Tipo de entidade relacionada - 'task', 'mission', 'achievement'
- `related_entity_id` (TEXT): ID da entidade relacionada
- `created_at` (TIMESTAMPTZ): Data de criação (default now())

#### 12. Status de Leitura de Notificação (NotificationReadStatus)
Registra quando notificações foram lidas.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `notification_id` (UUID): ID da notificação (foreign key para user_notifications.id)
- `read_at` (TIMESTAMPTZ): Data de leitura (default now())

#### 13. Métricas de Produtividade do Jogador (PlayerProductivityMetrics)
Métricas detalhadas de produtividade do jogador.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `season_name` (TEXT): Nome da temporada (not null)
- `average_percent` (NUMERIC): Média percentual de produtividade (not null)
- `total_considered` (INTEGER): Total de tarefas consideradas (not null)
- `delivery_distribution` (JSONB): Distribuição de entregas { early: number, on_time: number, late: number, refacao: number }
- `tasks_breakdown` (JSONB[]): Detalhamento das tarefas (array de objetos)
- `calculated_at` (TIMESTAMPTZ): Data de cálculo (default now())
- `calculated_from_tasks` (JSONB): IDs das tarefas usadas para cálculo

#### 14. Temporadas (PlayerSeasons)
Períodos para agrupamento de estatísticas e competições.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `name` (TEXT): Nome da temporada (not null)
- `start_date` (DATE): Data de início (not null)
- `end_date` (DATE): Data de término (not null)
- `is_active` (BOOLEAN): Indica se está ativa (default false)
- `created_at` (TIMESTAMPTZ): Data de criação (default now())

#### 15. Log de Atividade do Usuário (UserActivityLog)
Registra atividades realizadas pelos usuários.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `activity_type` (TEXT): Tipo de atividade (not null) - 'task_created', 'task_completed', 'xp_gained', 'mission_completed'
- `title` (TEXT): Título da atividade (not null)
- `description` (TEXT): Descrição da atividade
- `related_entity_type` (TEXT): Tipo de entidade relacionada
- `related_entity_id` (TEXT): ID da entidade relacionada
- `created_at` (TIMESTAMPTZ): Data de registro (default now())

#### 16. Rankings de Usuário (UserRankings)
Dados de ranking dos usuários.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id, unique)
- `total_xp` (INTEGER): XP total (default 0)
- `weekly_xp` (INTEGER): XP semanal (default 0)
- `monthly_xp` (INTEGER): XP mensal (default 0)
- `level` (INTEGER): Nível (default 1)
- `position` (INTEGER): Posição no ranking
- `missions_completed` (INTEGER): Missões completadas (default 0)
- `consistency_bonus` (INTEGER): Bônus de consistência (default 0)
- `streak` (INTEGER): Sequência atual (default 0)
- `last_updated` (TIMESTAMPTZ): Última atualização (default now())
- `calculated_at` (TIMESTAMPTZ): Data de cálculo (default now())
- `season_id` (UUID): ID da temporada (foreign key para player_seasons.id)

#### 17. Histórico de Ranking (RankingHistory)
Histórico de posições e dados de ranking ao longo do tempo.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `total_xp` (INTEGER): XP total
- `weekly_xp` (INTEGER): XP semanal
- `monthly_xp` (INTEGER): XP mensal
- `level` (INTEGER): Nível
- `position` (INTEGER): Posição no ranking
- `streak` (INTEGER): Sequência
- `date_recorded` (DATE): Data de registro (not null)
- `season_id` (UUID): ID da temporada (foreign key para player_seasons.id)

#### 18. Rankings por Temporada (SeasonRankings)
Dados de ranking específicos por temporada.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `season_id` (UUID): ID da temporada (foreign key para player_seasons.id)
- `total_xp` (INTEGER): XP total na temporada (default 0)
- `season_start_xp` (INTEGER): XP no início da temporada (default 0)
- `season_end_xp` (INTEGER): XP no final da temporada
- `position` (INTEGER): Posição no ranking da temporada
- `tasks_completed` (INTEGER): Tarefas completadas na temporada (default 0)
- `missions_completed` (INTEGER): Missões completadas na temporada (default 0)
- `created_at` (TIMESTAMPTZ): Data de criação (default now())
- `updated_at` (TIMESTAMPTZ): Data de última atualização (default now())

#### 19. Eventos de Ranking (RankingEvents)
Registra eventos relacionados a mudanças no ranking.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `event_type` (TEXT): Tipo do evento (not null) - 'ranking:update', 'xp:gain', 'mission:complete'
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `related_entity_type` (TEXT): Tipo de entidade relacionada - 'task', 'mission', 'bonus', 'penalty'
- `related_entity_id` (TEXT): ID da entidade relacionada
- `payload` (JSONB): Dados específicos do evento
- `created_at` (TIMESTAMPTZ): Data de criação (default now())

#### 20. Integrações do Usuário (UserIntegrations)
Integrações de serviços externos com as contas de usuário.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `integration_type` (TEXT): Tipo de integração (not null) - ex: 'github', 'google'
- `integration_id` (TEXT): ID do usuário no serviço externo (not null)
- `access_token` (TEXT): Token de acesso
- `refresh_token` (TEXT): Token de atualização
- `created_at` (TIMESTAMPTZ): Data de criação (default now())
- `updated_at` (TIMESTAMPTZ): Data de última atualização (default now())
- `is_active` (BOOLEAN): Indica se a integração está ativa (default true)

#### 21. Sessões de Usuário (UserSessions)
Registra as sessões de login dos usuários.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `device_info` (JSONB): Informações do dispositivo
- `ip_address` (INET): Endereço IP
- `login_at` (TIMESTAMPTZ): Data de login (default now())
- `logout_at` (TIMESTAMPTZ): Data de logout
- `is_active` (BOOLEAN): Indica se a sessão está ativa (default true)

#### 22. Usuários Bloqueados (BlockedUsers)
Lista de usuários bloqueados.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário que bloqueou (foreign key para users.id)
- `blocked_user_id` (UUID): ID do usuário bloqueado (foreign key para users.id)
- `reason` (TEXT): Motivo do bloqueio
- `blocked_at` (TIMESTAMPTZ): Data do bloqueio (default now())

#### 23. Comentários em Tarefas (TaskComments)
Comentários feitos nas tarefas.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `task_id` (UUID): ID da tarefa (foreign key para tasks.id)
- `user_id` (UUID): ID do usuário que comentou (foreign key para users.id)
- `comment` (TEXT): Conteúdo do comentário (not null)
- `parent_comment_id` (UUID): ID do comentário pai para respostas (nullable, foreign key para task_comments.id)
- `created_at` (TIMESTAMPTZ): Data de criação (default now())
- `updated_at` (TIMESTAMPTZ): Data de última atualização (default now())

#### 24. Histórico de Estatísticas do Jogador (PlayerStatsHistory)
Histórico de estatísticas do jogador ao longo do tempo.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `date_recorded` (DATE): Data do registro (not null)
- `level` (INTEGER): Nível
- `xp_total` (INTEGER): XP total
- `streak` (INTEGER): Sequência
- `best_streak` (INTEGER): Melhor sequência
- `missions_completed` (INTEGER): Missões completadas
- `tasks_completion_rate` (NUMERIC): Taxa de conclusão de tarefas
- `average_task_xp` (NUMERIC): Média de XP por tarefa

#### 25. Cache de Rankings (RankingCache)
Cache de dados de ranking para melhorar performance.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `ranking_type` (TEXT): Tipo de ranking (not null) - 'weekly', 'monthly', 'total'
- `season_id` (UUID): ID da temporada (foreign key para player_seasons.id)
- `cached_at` (TIMESTAMPTZ): Data de cache (default now())
- `expiration_at` (TIMESTAMPTZ): Data de expiração (not null)
- `ranking_data` (JSONB): Dados serializados do ranking
- `calculated_from_tasks` (JSONB): IDs das tarefas usadas para cálculo

#### 26. Log de Atualizações de Ranking (RankingUpdatesLog)
Registra quando e como os rankings são atualizados.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `triggered_by` (TEXT): Quem/qual acionou a atualização - 'manual', 'task_completion', 'schedule', 'api_event'
- `trigger_details` (JSONB): Detalhes específicos do gatilho
- `users_affected` (INTEGER): Número de usuários afetados
- `start_time` (TIMESTAMPTZ): Hora de início (default now())
- `end_time` (TIMESTAMPTZ): Hora de término
- `duration_ms` (INTEGER): Duração em milissegundos
- `success` (BOOLEAN): Indica sucesso (default true)
- `error_message` (TEXT): Mensagem de erro em caso de falha

#### 27. Sequências de Usuários (UserStreaks)
Mantém o controle das sequências de atividade dos usuários.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id, unique)
- `current_streak` (INTEGER): Sequência atual (default 0)
- `best_streak` (INTEGER): Melhor sequência (default 0)
- `last_active_date` (DATE): Última data de atividade
- `created_at` (TIMESTAMPTZ): Data de criação (default now())
- `updated_at` (TIMESTAMPTZ): Data de última atualização (default now())

#### 28. Filtros de Tarefa (TaskFilters)
Configurações de filtros personalizados para tarefas.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `filter_name` (TEXT): Nome do filtro (not null)
- `filter_type` (TEXT): Tipo do filtro (not null) - 'quick', 'custom', 'saved'
- `filter_config` (JSONB): Configuração específica do filtro (status, prioridade, datas, etc.)
- `created_at` (TIMESTAMPTZ): Data de criação (default now())
- `updated_at` (TIMESTAMPTZ): Data de última atualização (default now())

#### 29. Cache de Gráficos de Tarefa (TaskChartsCache)
Cache de dados para gráficos de tarefas.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `chart_type` (TEXT): Tipo do gráfico (not null) - 'line', 'bar', etc.
- `season_id` (UUID): ID da temporada (foreign key para player_seasons.id)
- `cached_data` (JSONB): Dados do gráfico (série temporal de tarefas)
- `calculated_at` (TIMESTAMPTZ): Data de cálculo (default now())
- `expires_at` (TIMESTAMPTZ): Data de expiração (not null)

#### 30. Estatísticas de Tarefa (TaskStatistics)
Estatísticas agregadas de tarefas.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `season_id` (UUID): ID da temporada (foreign key para player_seasons.id)
- `total_tasks` (INTEGER): Total de tarefas (default 0)
- `completed_tasks` (INTEGER): Tarefas completadas (default 0)
- `pending_tasks` (INTEGER): Tarefas pendentes (default 0)
- `overdue_tasks` (INTEGER): Tarefas atrasadas (default 0)
- `calculated_at` (TIMESTAMPTZ): Data de cálculo (default now())
- `calculated_from_tasks` (JSONB): IDs das tarefas usadas para cálculo

#### 31. Log de Importação de Tarefa (TaskImportsLog)
Registra operações de importação de tarefas.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `filename` (TEXT): Nome do arquivo importado (not null)
- `total_imported` (INTEGER): Total de tarefas importadas
- `success_count` (INTEGER): Contagem de sucesso
- `error_count` (INTEGER): Contagem de erros
- `import_errors` (JSONB): Detalhes dos erros de importação
- `imported_at` (TIMESTAMPTZ): Data de importação (default now())

#### 32. Log de Exportação de Tarefa (TaskExportsLog)
Registra operações de exportação de tarefas.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `export_format` (TEXT): Formato de exportação (not null) - 'json', 'csv', 'pdf'
- `task_count` (INTEGER): Número de tarefas exportadas
- `exported_at` (TIMESTAMPTZ): Data de exportação (default now())
- `file_path` (TEXT): Caminho do arquivo no storage

#### 33. Modelos de Tarefa (TaskTemplates)
Modelos de configuração padrão para criação de tarefas.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `name` (TEXT): Nome do modelo (not null)
- `description` (TEXT): Descrição do modelo
- `template_config` (JSONB): Configuração padrão de tarefa
- `created_by` (UUID): ID do usuário que criou (foreign key para users.id)
- `is_global` (BOOLEAN): Indica se é global (default false)
- `created_at` (TIMESTAMPTZ): Data de criação (default now())

#### 34. KPIs (Kpis)
Indicadores de desempenho calculados.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `project_id` (UUID): ID do projeto (foreign key para projects.id)
- `metric_name` (TEXT): Nome da métrica (not null)
- `metric_value` (NUMERIC): Valor da métrica (not null)
- `calculation_date` (DATE): Data do cálculo (not null)
- `calculated_from_tasks` (JSONB): Dados usados para cálculo

#### 35. Cache de Analytics (AnalyticsCache)
Cache de dados analíticos para melhorar performance.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `cache_key` (TEXT): Chave do cache (unique, not null) - CHAVE_COMPOSTA(tipo_grafico, projeto_id, periodo_inicio, periodo_fim)
- `chart_type` (TEXT): Tipo do gráfico (not null) - 'bar', 'pie', 'line', 'box_plot', 'distribution'
- `project_id` (UUID): ID do projeto (foreign key para projects.id, nullable)
- `calculated_data` (JSONB): Dados calculados para o gráfico
- `calculated_kpis` (JSONB): KPIs calculados (média, mediana, moda, etc.)
- `calculated_at` (TIMESTAMPTZ): Data de cálculo (default now())
- `expires_at` (TIMESTAMPTZ): Data de expiração (not null)
- `calculated_from_tasks` (JSONB): IDs das tarefas usadas para cálculo
- `processing_time_ms` (INTEGER): Tempo de processamento em milissegundos
- `cache_version` (INTEGER): Versão do algoritmo de cálculo (default 1)

#### 36. Cálculos de KPI (KpiCalculations)
Cálculos detalhados de KPIs estatísticos.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `calculation_id` (TEXT): ID do cálculo (unique, not null)
- `calculation_version` (TEXT): Versão do sistema de cálculo (not null)
- `total_tasks` (INTEGER): Total de tarefas
- `average_production` (NUMERIC): Média de produção em dias
- `median` (NUMERIC): Mediana
- `mode_value` (NUMERIC): Valor da moda
- `mode_frequency` (INTEGER): Frequência da moda
- `standard_deviation` (NUMERIC): Desvio padrão
- `tasks_on_time` (INTEGER): Tarefas no prazo
- `tasks_delayed` (INTEGER): Tarefas atrasadas
- `data_quality_score` (NUMERIC): Pontuação de qualidade dos dados
- `data_hash` (TEXT): Hash dos dados de entrada
- `calculation_metadata` (JSONB): Metadados adicionais do cálculo
- `calculated_at` (TIMESTAMPTZ): Data de cálculo (default now())
- `calculated_from_tasks` (JSONB): IDs das tarefas usadas para cálculo

#### 37. Configurações de Gráfico (ChartConfigurations)
Configurações personalizadas de gráficos.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id, nullable) - Configuração específica do usuário
- `chart_name` (TEXT): Nome do gráfico (not null)
- `chart_type` (TEXT): Tipo do gráfico (not null) - 'bar', 'pie', 'line', etc.
- `chart_config` (JSONB): Configuração específica do gráfico
- `is_global` (BOOLEAN): Disponível para todos os usuários (default false)
- `created_at` (TIMESTAMPTZ): Data de criação (default now())
- `updated_at` (TIMESTAMPTZ): Data de última atualização (default now())

#### 38. Log de Eventos de Analytics (AnalyticsEventsLog)
Registra eventos relacionados a analytics.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `event_type` (TEXT): Tipo do evento (not null) - 'chart_view', 'recalculate_trigger', 'export', 'filter_change'
- `chart_type` (TEXT): Tipo do gráfico afetado
- `project_id` (UUID): ID do projeto (foreign key para projects.id)
- `event_details` (JSONB): Detalhes específicos do evento
- `created_at` (TIMESTAMPTZ): Data de criação (default now())

#### 39. Preferências de Analytics (AnalyticsPreferences)
Preferências de visualização e cálculo de analytics.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id, unique)
- `default_chart_type` (TEXT): Tipo de gráfico padrão (default 'bar')
- `time_range_preference` (TEXT): Período preferido (default 'last_month') - 'last_week', 'last_month', 'last_quarter', 'custom'
- `show_cache_indicator` (BOOLEAN): Mostrar indicador de cache (default true)
- `recalculation_frequency` (INTEGER): Frequência de recálculo em segundos (default 300)
- `created_at` (TIMESTAMPTZ): Data de criação (default now())
- `updated_at` (TIMESTAMPTZ): Data de última atualização (default now())

#### 40. Outliers Estatísticos (StatisticalOutliers)
Identificação de valores atípicos nas métricas.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `task_id` (UUID): ID da tarefa (foreign key para tasks.id)
- `outlier_type` (TEXT): Tipo do outlier (not null) - 'duration', 'delay', 'start_time', 'completion_time'
- `outlier_value` (NUMERIC): Valor do outlier
- `threshold_used` (NUMERIC): Limiar usado para identificação
- `severity` (TEXT): Severidade ('low', 'medium', 'high', 'critical')
- `calculated_at` (TIMESTAMPTZ): Data de cálculo (default now())

#### 41. Widgets do Dashboard (DashboardWidgets)
Configuração de widgets no dashboard do usuário.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `widget_type` (TEXT): Tipo do widget (not null) - 'kpi_summary', 'chart', 'metric_card', 'trend_indicator'
- `position_order` (INTEGER): Ordem de posição (not null)
- `configuration` (JSONB): Configuração específica do widget
- `is_active` (BOOLEAN): Indica se está ativo (default true)
- `created_at` (TIMESTAMPTZ): Data de criação (default now())
- `updated_at` (TIMESTAMPTZ): Data de última atualização (default now())

#### 42. Métricas do Dashboard (DashboardMetrics)
Métricas principais exibidas no dashboard.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `project_id` (UUID): ID do projeto (foreign key para projects.id)
- `average_production` (NUMERIC): Média de produção em dias
- `average_delay` (NUMERIC): Média de atraso em dias
- `standard_deviation` (NUMERIC): Desvio padrão
- `median` (NUMERIC): Mediana
- `mode_value` (NUMERIC): Valor da moda
- `mode_frequency` (INTEGER): Frequência da moda
- `total_tasks` (INTEGER): Total de tarefas
- `completed_tasks` (INTEGER): Tarefas completadas
- `project_completion_percentage` (NUMERIC): Percentual de conclusão do projeto
- `tasks_on_time` (INTEGER): Tarefas no prazo
- `tasks_delayed` (INTEGER): Tarefas atrasadas
- `calculated_at` (TIMESTAMPTZ): Data de cálculo (default now())
- `calculated_from_tasks` (JSONB): IDs das tarefas usadas para cálculo
- `cache_key` (TEXT): Chave para cache de métricas (unique)

#### 43. Métricas de Performance do Usuário (UserPerformanceMetrics)
Métricas detalhadas de performance individual do usuário.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `period_start` (DATE): Data de início do período (not null)
- `period_end` (DATE): Data de término do período (not null)
- `total_tasks_assigned` (INTEGER): Total de tarefas atribuídas (default 0)
- `completed_tasks` (INTEGER): Tarefas completadas (default 0)
- `delayed_tasks` (INTEGER): Tarefas atrasadas (default 0)
- `refacao_tasks` (INTEGER): Tarefas em refação (default 0)
- `completion_rate` (NUMERIC): Taxa de conclusão (completed_tasks / total_tasks_assigned * 100)
- `average_delay_days` (NUMERIC): Média de dias de atraso
- `performance_score` (NUMERIC): Score calculado com base em múltiplas métricas
- `created_at` (TIMESTAMPTZ): Data de criação (default now())
- `updated_at` (TIMESTAMPTZ): Data de última atualização (default now())

#### 44. Cache do Dashboard (DashboardCache)
Cache de dados do dashboard para melhorar performance.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `cache_key` (TEXT): Chave do cache (unique, not null) - CHAVE_COMPOSTA(project_id, periodo_inicio, periodo_fim)
- `cache_type` (TEXT): Tipo de cache (not null) - 'dashboard_metrics', 'critical_players', 'executive_summary'
- `cached_data` (JSONB): Dados serializados do dashboard
- `calculated_at` (TIMESTAMPTZ): Data de cálculo (default now())
- `expires_at` (TIMESTAMPTZ): Data de expiração (not null)
- `calculated_from_tasks` (JSONB): IDs das tarefas usadas para cálculo
- `processing_time_ms` (INTEGER): Tempo de processamento em milissegundos

#### 45. Log de Exportações do Dashboard (DashboardExportsLog)
Registra operações de exportação de relatórios do dashboard.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `user_id` (UUID): ID do usuário (foreign key para users.id)
- `project_id` (UUID): ID do projeto (foreign key para projects.id)
- `export_format` (TEXT): Formato de exportação (not null) - 'pdf'
- `export_content_type` (TEXT): Tipo de conteúdo (not null) - 'executive_summary', 'full_report'
- `kpi_included` (JSONB): KPIs incluídos no relatório
- `exported_at` (TIMESTAMPTZ): Data de exportação (default now())
- `file_path` (TEXT): Caminho do arquivo no storage (se aplicável)

#### 46. Análise de Critical Players (CriticalPlayersAnalytics)
Análise de desempenho crítico dos membros da equipe.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `analysis_period_start` (DATE): Data de início da análise (not null)
- `analysis_period_end` (DATE): Data de término da análise (not null)
- `worst_delay_player` (TEXT): Nome do jogador com mais atrasos
- `worst_delay_count` (INTEGER): Quantidade de atrasos
- `worst_completion_player` (TEXT): Nome do jogador com pior aproveitamento
- `worst_completion_rate` (NUMERIC): Taxa de aproveitamento
- `most_refacao_player` (TEXT): Nome do jogador com mais refações
- `most_refacao_count` (INTEGER): Quantidade de refações
- `analysis_date` (DATE): Data da análise (default now())
- `calculated_from_tasks` (JSONB): IDs das tarefas usadas para análise

#### 47. Próximas Entregas (UpcomingDeliveries)
Lista de tarefas com datas de entrega próximas.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `project_id` (UUID): ID do projeto (foreign key para projects.id)
- `task_id` (UUID): ID da tarefa (foreign key para tasks.id)
- `delivery_date` (DATE): Data de entrega (not null)
- `task_priority` (TEXT): Prioridade da tarefa - 'baixa', 'media', 'alta', 'critica'
- `task_title` (TEXT): Título da tarefa (not null)
- `assigned_to` (UUID): ID do usuário responsável (foreign key para users.id)
- `status` (TEXT): Status da tarefa (default 'todo') - 'todo', 'in-progress', etc.
- `is_urgent` (BOOLEAN): Indica se está atrasada ou vence nos próximos 3 dias (default false)
- `created_at` (TIMESTAMPTZ): Data de criação (default now())

#### 48. Cache de Resumo Executivo (ExecutiveSummaryCache)
Cache de dados para o resumo executivo do dashboard.

**Atributos:**
- `id` (UUID): Identificador único (primary key)
- `project_id` (UUID): ID do projeto (foreign key para projects.id)
- `period_start` (DATE): Data de início do período (not null)
- `period_end` (DATE): Data de término do período (not null)
- `summary_data` (JSONB): Dados resumidos para o relatório executivo
- `priority_distribution` (JSONB): Distribuição por prioridade
- `upcoming_deliveries_preview` (JSONB[]): Prévia das próximas entregas
- `observations` (TEXT[]): Observações geradas automaticamente
- `calculated_at` (TIMESTAMPTZ): Data de cálculo (default now())
- `calculated_from_tasks` (JSONB): IDs das tarefas usadas para cálculo

## Entidades e Relacionamentos

### Diagrama de Entidades e Relacionamentos (DER)

```
[users] 1 ---- * [tasks] (assigned_to)
[users] 1 ---- * [projects] (created_by)
[users] 1 ---- * [missions] (user_id)
[users] 1 ---- * [xp_history] (user_id)
[users] 1 ---- * [user_preferences] (user_id)
[users] 1 ---- * [player_profiles] (user_id)
[users] 1 ---- * [user_notifications] (user_id)
[users] 1 ---- * [user_metrics] (user_id)
[users] 1 ---- * [user_integrations] (user_id)
[users] 1 ---- * [user_sessions] (user_id)
[users] 1 ---- * [blocked_users] (user_id)
[users] 1 ---- * [blocked_users] (blocked_user_id)
[users] 1 ---- * [task_comments] (user_id)
[users] 1 ---- * [user_activity_log] (user_id)
[users] 1 ---- * [user_rankings] (user_id)
[users] 1 ---- * [ranking_history] (user_id)
[users] 1 ---- * [season_rankings] (user_id)
[users] 1 ---- * [ranking_events] (user_id)
[users] 1 ---- * [task_assignments] (user_id)
[users] 1 ---- * [task_assignments] (assigned_by)
[users] 1 ---- * [task_history] (changed_by)
[users] 1 ---- * [task_filters] (user_id)
[users] 1 ---- * [analytics_preferences] (user_id)
[users] 1 ---- * [analytics_events_log] (user_id)
[users] 1 ---- * [dashboard_widgets] (user_id)
[users] 1 ---- * [user_performance_metrics] (user_id)
[users] 1 ---- * [dashboard_exports_log] (user_id)

[tasks] 1 ---- * [task_comments] (task_id)
[tasks] 1 ---- * [task_history] (task_id)
[tasks] 1 ---- * [task_assignments] (task_id)
[tasks] 1 ---- * [statistical_outliers] (task_id)
[tasks] 1 ---- * [upcoming_deliveries] (task_id)

[projects] 1 ---- * [tasks] (project_id)
[projects] 1 ---- * [kpis] (project_id)
[projects] 1 ---- * [upcoming_deliveries] (project_id)

[player_seasons] 1 ---- * [player_productivity_metrics] (season_id)
[player_seasons] 1 ---- * [user_rankings] (season_id)
[player_seasons] 1 ---- * [ranking_history] (season_id)
[player_seasons] 1 ---- * [season_rankings] (season_id)
[player_seasons] 1 ---- * [ranking_cache] (season_id)
[player_seasons] 1 ---- * [task_charts_cache] (season_id)

[analytics_cache] 1 ---- * [analytics_events_log] (project_id)
[dashboard_metrics] 1 ---- * [dashboard_exports_log] (project_id)
[dashboard_cache] 1 ---- * [dashboard_exports_log] (project_id)
[executive_summary_cache] 1 ---- * [dashboard_exports_log] (project_id)
[critical_players_analytics] 1 ---- * [dashboard_exports_log] (project_id)
```

### Relacionamentos
- Um usuário pode ter muitas tarefas atribuídas
- Um usuário pode criar muitos projetos
- Um usuário pode ter muitas missões atribuídas
- Um usuário pode ter muitos registros de histórico de XP
- Um usuário pode ter um perfil de jogador
- Um usuário pode ter muitas notificações
- Um usuário pode ter um registro de preferências
- Um projeto pode ter muitas tarefas
- Uma tarefa pode ter muitos comentários
- Uma tarefa pode ter muitos registros históricos
- Uma temporada pode ter muitos rankings
- Etc.

## Tabelas do Banco de Dados

### users
Armazena os dados básicos dos usuários.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  timezone TEXT DEFAULT 'UTC',
  language_preference TEXT DEFAULT 'pt-BR',
  theme_preference TEXT DEFAULT 'light'
);
```

### user_preferences
Configurações de notificação e privacidade do usuário.

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_notifications_enabled BOOLEAN DEFAULT true,
  push_notifications_enabled BOOLEAN DEFAULT true,
  sms_notifications_enabled BOOLEAN DEFAULT false,
  notification_frequency TEXT DEFAULT 'immediate',
  privacy_level TEXT DEFAULT 'public',
  data_sharing_consent BOOLEAN DEFAULT false
);
```

### projects
Armazena informações sobre projetos.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  start_date DATE,
  deadline DATE
);
```

### tasks
Armazena as tarefas atribuídas aos usuários.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT DEFAULT 'media',
  start_date DATE NOT NULL,
  end_date DATE,
  deadline DATE NOT NULL,
  duration_work_days INTEGER DEFAULT 0,
  delay_work_days INTEGER DEFAULT 0,
  on_time BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
);
```

### task_assignments
Histórico de atribuições de tarefas a usuários.

```sql
CREATE TABLE task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
```

### task_history
Registra alterações em tarefas para auditoria.

```sql
CREATE TABLE task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### missions
Objetivos específicos que os usuários podem completar para ganhar recompensas.

```sql
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  config_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target INTEGER NOT NULL,
  current_progress INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 0,
  deadline TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### xp_history
Registro de alterações de XP do usuário.

```sql
CREATE TABLE xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason_type TEXT NOT NULL,
  reason_description TEXT,
  related_id TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_metrics
Métricas e estatísticas de desempenho do usuário.

```sql
CREATE TABLE user_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_completion_rate NUMERIC,
  average_delay_days NUMERIC,
  total_tasks_completed INTEGER DEFAULT 0,
  total_tasks_delayed INTEGER DEFAULT 0,
  performance_score NUMERIC,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### player_profiles
Informações específicas de perfil do jogador com dados gamificados.

```sql
CREATE TABLE player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  role TEXT,
  level INTEGER DEFAULT 1,
  missions_completed INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  tasks_completion_rate NUMERIC DEFAULT 0,
  average_task_xp NUMERIC DEFAULT 0,
  joined_date DATE DEFAULT NOW(),
  profile_visibility TEXT DEFAULT 'public',
  xp_visibility TEXT DEFAULT 'public',
  share_with_team BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_notifications
Registros de notificações para os usuários.

```sql
CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  xp_reward INTEGER,
  related_entity_type TEXT,
  related_entity_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### notification_read_status
Registra quando notificações foram lidas.

```sql
CREATE TABLE notification_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES user_notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW()
);
```

### player_productivity_metrics
Métricas detalhadas de produtividade do jogador.

```sql
CREATE TABLE player_productivity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  season_name TEXT NOT NULL,
  average_percent NUMERIC NOT NULL,
  total_considered INTEGER NOT NULL,
  delivery_distribution JSONB,
  tasks_breakdown JSONB[],
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculated_from_tasks JSONB
);
```

### player_seasons
Períodos para agrupamento de estatísticas e competições.

```sql
CREATE TABLE player_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_activity_log
Registra atividades realizadas pelos usuários.

```sql
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  related_entity_type TEXT,
  related_entity_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### task_comments
Comentários feitos nas tarefas.

```sql
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  parent_comment_id UUID REFERENCES task_comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### player_stats_history
Histórico de estatísticas do jogador ao longo do tempo.

```sql
CREATE TABLE player_stats_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_recorded DATE NOT NULL,
  level INTEGER,
  xp_total INTEGER,
  streak INTEGER,
  best_streak INTEGER,
  missions_completed INTEGER,
  tasks_completion_rate NUMERIC,
  average_task_xp NUMERIC
);
```

### user_rankings
Dados de ranking dos usuários.

```sql
CREATE TABLE user_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  position INTEGER,
  missions_completed INTEGER DEFAULT 0,
  consistency_bonus INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  season_id UUID NOT NULL REFERENCES player_seasons(id) ON DELETE CASCADE
);
```

### ranking_history
Histórico de posições e dados de ranking ao longo do tempo.

```sql
CREATE TABLE ranking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_xp INTEGER,
  weekly_xp INTEGER,
  monthly_xp INTEGER,
  level INTEGER,
  position INTEGER,
  streak INTEGER,
  date_recorded DATE NOT NULL,
  season_id UUID NOT NULL REFERENCES player_seasons(id) ON DELETE CASCADE
);
```

### season_rankings
Dados de ranking específicos por temporada.

```sql
CREATE TABLE season_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES player_seasons(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  season_start_xp INTEGER DEFAULT 0,
  season_end_xp INTEGER,
  position INTEGER,
  tasks_completed INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### ranking_events
Registra eventos relacionados a mudanças no ranking.

```sql
CREATE TABLE ranking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  related_entity_type TEXT,
  related_entity_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_integrations
Integrações de serviços externos com as contas de usuário.

```sql
CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  integration_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

### user_sessions
Registra as sessões de login dos usuários.

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_info JSONB,
  ip_address INET,
  login_at TIMESTAMPTZ DEFAULT NOW(),
  logout_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);
```

### blocked_users
Lista de usuários bloqueados.

```sql
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  blocked_at TIMESTAMPTZ DEFAULT NOW()
);
```

### ranking_cache
Cache de dados de ranking para melhorar performance.

```sql
CREATE TABLE ranking_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranking_type TEXT NOT NULL,
  season_id UUID NOT NULL REFERENCES player_seasons(id) ON DELETE CASCADE,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expiration_at TIMESTAMPTZ NOT NULL,
  ranking_data JSONB,
  calculated_from_tasks JSONB
);
```

### ranking_updates_log
Registra quando e como os rankings são atualizados.

```sql
CREATE TABLE ranking_updates_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by TEXT DEFAULT 'manual',
  trigger_details JSONB,
  users_affected INTEGER,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT
);
```

### user_streaks
Mantém o controle das sequências de atividade dos usuários.

```sql
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### task_filters
Configurações de filtros personalizados para tarefas.

```sql
CREATE TABLE task_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filter_name TEXT NOT NULL,
  filter_type TEXT NOT NULL,
  filter_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### task_charts_cache
Cache de dados para gráficos de tarefas.

```sql
CREATE TABLE task_charts_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chart_type TEXT NOT NULL,
  season_id UUID NOT NULL REFERENCES player_seasons(id) ON DELETE CASCADE,
  cached_data JSONB,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);
```

### task_statistics
Estatísticas agregadas de tarefas.

```sql
CREATE TABLE task_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES player_seasons(id) ON DELETE CASCADE,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  pending_tasks INTEGER DEFAULT 0,
  overdue_tasks INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculated_from_tasks JSONB
);
```

### task_imports_log
Registra operações de importação de tarefas.

```sql
CREATE TABLE task_imports_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  total_imported INTEGER,
  success_count INTEGER,
  error_count INTEGER,
  import_errors JSONB,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);
```

### task_exports_log
Registra operações de exportação de tarefas.

```sql
CREATE TABLE task_exports_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  export_format TEXT NOT NULL,
  task_count INTEGER,
  exported_at TIMESTAMPTZ DEFAULT NOW(),
  file_path TEXT
);
```

### task_templates
Modelos de configuração padrão para criação de tarefas.

```sql
CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_config JSONB,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### kpis
Indicadores de desempenho calculados.

```sql
CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  calculation_date DATE NOT NULL,
  calculated_from_tasks JSONB
);
```

### analytics_cache
Cache de dados analíticos para melhorar performance.

```sql
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  chart_type TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  calculated_data JSONB,
  calculated_kpis JSONB,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  calculated_from_tasks JSONB,
  processing_time_ms INTEGER,
  cache_version INTEGER DEFAULT 1
);
```

### kpi_calculations
Cálculos detalhados de KPIs estatísticos.

```sql
CREATE TABLE kpi_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id TEXT UNIQUE NOT NULL,
  calculation_version TEXT NOT NULL,
  total_tasks INTEGER,
  average_production NUMERIC,
  median NUMERIC,
  mode_value NUMERIC,
  mode_frequency INTEGER,
  standard_deviation NUMERIC,
  tasks_on_time INTEGER,
  tasks_delayed INTEGER,
  data_quality_score NUMERIC,
  data_hash TEXT,
  calculation_metadata JSONB,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculated_from_tasks JSONB
);
```

### chart_configurations
Configurações personalizadas de gráficos.

```sql
CREATE TABLE chart_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chart_name TEXT NOT NULL,
  chart_type TEXT NOT NULL,
  chart_config JSONB,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### analytics_events_log
Registra eventos relacionados a analytics.

```sql
CREATE TABLE analytics_events_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  chart_type TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### analytics_preferences
Preferências de visualização e cálculo de analytics.

```sql
CREATE TABLE analytics_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  default_chart_type TEXT DEFAULT 'bar',
  time_range_preference TEXT DEFAULT 'last_month',
  show_cache_indicator BOOLEAN DEFAULT true,
  recalculation_frequency INTEGER DEFAULT 300,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### statistical_outliers
Identificação de valores atípicos nas métricas.

```sql
CREATE TABLE statistical_outliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  outlier_type TEXT NOT NULL,
  outlier_value NUMERIC,
  threshold_used NUMERIC,
  severity TEXT,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### dashboard_widgets
Configuração de widgets no dashboard do usuário.

```sql
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  position_order INTEGER NOT NULL,
  configuration JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### dashboard_metrics
Métricas principais exibidas no dashboard.

```sql
CREATE TABLE dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  average_production NUMERIC,
  average_delay NUMERIC,
  standard_deviation NUMERIC,
  median NUMERIC,
  mode_value NUMERIC,
  mode_frequency INTEGER,
  total_tasks INTEGER,
  completed_tasks INTEGER,
  project_completion_percentage NUMERIC,
  tasks_on_time INTEGER,
  tasks_delayed INTEGER,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculated_from_tasks JSONB,
  cache_key TEXT UNIQUE
);
```

### user_performance_metrics
Métricas detalhadas de performance individual do usuário.

```sql
CREATE TABLE user_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_tasks_assigned INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  delayed_tasks INTEGER DEFAULT 0,
  refacao_tasks INTEGER DEFAULT 0,
  completion_rate NUMERIC,
  average_delay_days NUMERIC,
  performance_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### dashboard_cache
Cache de dados do dashboard para melhorar performance.

```sql
CREATE TABLE dashboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  cache_type TEXT NOT NULL,
  cached_data JSONB,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  calculated_from_tasks JSONB,
  processing_time_ms INTEGER
);
```

### dashboard_exports_log
Registra operações de exportação de relatórios do dashboard.

```sql
CREATE TABLE dashboard_exports_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  export_format TEXT NOT NULL,
  export_content_type TEXT NOT NULL,
  kpi_included JSONB,
  exported_at TIMESTAMPTZ DEFAULT NOW(),
  file_path TEXT
);
```

### critical_players_analytics
Análise de desempenho crítico dos membros da equipe.

```sql
CREATE TABLE critical_players_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_period_start DATE NOT NULL,
  analysis_period_end DATE NOT NULL,
  worst_delay_player TEXT,
  worst_delay_count INTEGER,
  worst_completion_player TEXT,
  worst_completion_rate NUMERIC,
  most_refacao_player TEXT,
  most_refacao_count INTEGER,
  analysis_date DATE DEFAULT NOW(),
  calculated_from_tasks JSONB
);
```

### upcoming_deliveries
Lista de tarefas com datas de entrega próximas.

```sql
CREATE TABLE upcoming_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  delivery_date DATE NOT NULL,
  task_priority TEXT,
  task_title TEXT NOT NULL,
  assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'todo' - 'todo', 'in-progress', etc.
  is_urgent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### executive_summary_cache
Cache de dados para o resumo executivo do dashboard.

```sql
CREATE TABLE executive_summary_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  summary_data JSONB,
  priority_distribution JSONB,
  upcoming_deliveries_preview JSONB[],
  observations TEXT[],
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculated_from_tasks JSONB
);
```

## Operações CRUD

### Usuários (Users)
- **CREATE**: Inserir novo usuário com informações básicas
- **READ**: Obter informações completas de um ou mais usuários, incluindo XP e nível calculados
- **UPDATE**: Atualizar informações do usuário ou calcular novo XP/nível baseado em tarefas
- **DELETE**: Remover usuário e todas as entidades associadas (tarefas, histórico de XP, etc.)

### Tarefas (Tasks)
- **CREATE**: Inserir nova tarefa com status e datas
- **READ**: Obter tarefas de um usuário, todas as tarefas ou tarefas filtradas
- **UPDATE**: Atualizar status, datas de conclusão ou vencimento, ou mover para refação
- **DELETE**: Remover tarefa (cascata para histórico de XP relacionado)

### Missões (Missions)
- **CREATE**: Criar nova missão com recompensa e prazo
- **READ**: Obter missões de um usuário ou todas as missões ativas
- **UPDATE**: Marcar missão como completada ou atualizar informações
- **DELETE**: Remover missão

### Rankings (UserRankings)
- **CREATE**: Atualizar automaticamente ao ganhar XP
- **READ**: Obter o ranking completo ou posição de um usuário específico
- **UPDATE**: Recalcular automaticamente quando XP ou missões mudam
- **DELETE**: N/A (dados recalculados automaticamente)

## Regras de Negócio e Cálculos

### 1. Cálculo de XP
O XP é calculado baseado na média percentual de produtividade das tarefas, com a fórmula: `XP = roundHalfUp((somaPercentuais / totalTarefas) * 10)`

#### Classificação de Entrega e Percentuais:
- **Tarefa adiantada**: 100% de produtividade
- **Tarefa no prazo**: 90% de produtividade
- **Tarefa atrasada**: 50% de produtividade
- **Tarefa em refação**: 40% de produtividade (quando reconcluída)
- **Tarefa não completada**: 0% (não entra no cálculo da média)

### 2. Cálculo de Nível
O nível é determinado com base no XP total acumulado, seguindo a seguinte escala:
- Nível 1: 0 XP
- Nível 2: 100 XP
- Nível 3: 250 XP
- Nível 4: 500 XP
- Nível 5: 1000 XP
- Nível 6: 2000 XP
- Nível 7: 4000 XP
- Nível 8: 8000 XP

### 3. Cálculo de Bônus de Consistência
O bônus de consistência é calculado com base no streak (dias consecutivos de atividade):
- 0-2 dias: 0 XP de bônus
- 3-6 dias: até 20 XP de bônus (2 por dia)
- 7+ dias: até 50 XP de bônus (1 por dia, com máximo de 50)

### 4. Desempate no Ranking
Quando usuários têm o mesmo XP, o desempate é feito por:
1. Menor número de submissões incorretas
2. Primeiro a concluir tarefas (menor timestamp de primeira conclusão)

### 5. Atualização de Ranking
O ranking é recalculado automaticamente quando:
- Uma tarefa é atualizada (status, datas de conclusão ou vencimento)
- Uma missão é completada
- Uma flag de administração é alterada (afetando o modo de scoring)

### 6. Modo de Scoring
O sistema suporta dois modos de cálculo de produtividade:
- **Modo Legado**: Cada tarefa completada vale 10 XP
- **Modo Produtividade**: XP baseado na média percentual de completude (como descrito acima)

As flags de administração permitem aplicar diferentes modos por competição e fazer rollouts parciais entre modos.

### 7. Fórmulas Estatísticas
- **Média de Produção**: Soma de dias de produção / número de tarefas
- **Mediana**: Valor central quando os dados são ordenados
- **Moda**: Valor que aparece com mais frequência
- **Desvio Padrão**: Medida de dispersão dos dados em relação à média

## Considerações de Segurança

### 1. Autenticação e Autorização
- Implementar sistema de autenticação robusto (JWT, OAuth) com o Supabase Auth
- Controle de acesso baseado em funções (RBAC) para diferentes níveis de usuário (admin, dev, user)
- Proteger endpoints de gerenciamento e configuração
- Implementar Row Level Security (RLS) para garantir que usuários só acessem seus próprios dados

### 2. Validação de Dados
- Validar todos os inputs recebidos via API
- Verificar integridade das referências entre entidades
- Sanitizar dados antes de persistir no banco
- Implementar triggers para verificar consistência de dados

### 3. Privilégios de Banco de Dados
- Usar contas de banco de dados com privilégios mínimos
- Separar contas para leitura e escrita quando possível
- Criptografar conexão com o banco de dados
- Utilizar as políticas de segurança do Supabase

### 4. Auditoria
- Manter logs de todas as operações críticas
- Registrar tentativas de acesso não autorizado
- Monitorar alterações de flags administrativas
- Utilizar a tabela `task_history` para auditoria de alterações de tarefas

## Performance e Indexação

### Índices Recomendados
- `users(id)` - PK
- `tasks(assigned_to)` - FK e filtro comum
- `tasks(project_id)` - FK e agrupamento
- `tasks(due_date)` - Filtro por data de vencimento
- `tasks(status)` - Filtro por status
- `tasks(priority)` - Filtro por prioridade
- `tasks(created_at)` - Filtro por data de criação
- `projects(created_by)` - Filtro por criador
- `missions(user_id)` - FK e filtro por usuário
- `xp_history(user_id)` - FK e filtro por usuário
- `xp_history(earned_at)` - Filtro por data de ganho de XP
- `user_rankings(season_id, position)` - Índice composto para ranking
- `user_rankings(total_xp, user_id)` - Índice composto para ordenação
- `player_productivity_metrics(user_id, season_name)` - Índice composto
- `analytics_cache(cache_key)` - PK e acesso por chave
- `dashboard_metrics(cache_key)` - PK e acesso por chave

### Estratégias de Performance
- Cache de resultados de ranking (recálculo em segundo plano com cache no Supabase)
- Índices compostos para consultas frequentes (ex: user_id + season_name)
- Particionamento de dados históricos (antigos em tabelas separadas)
- Consultas otimizadas para endpoints de relatório (CSV export)
- Utilização de Real-time do Supabase para atualizações instantâneas

## Backup e Recuperação

### Estratégias de Backup
- Backup completo do banco de dados diariamente (gerenciado pelo Supabase)
- Backup incremental a cada 6 horas (gerenciado pelo Supabase)
- Cópias off-site para proteção contra desastres (gerenciado pelo Supabase)
- Testar periodicamente a restauração dos backups

### Recuperação de Dados
- Procedimentos documentados para recuperação de desastres
- Ponto de recuperação objetivo (RPO) de no máximo 1 hora
- Objetivo de tempo de recuperação (RTO) de no máximo 2 horas
- Recursos do Supabase para backup e recuperação

## Integração com Frontend

### DTOs (Data Transfer Objects)
O sistema utiliza DTOs para garantir que apenas os dados apropriados sejam expostos ao frontend, mantendo a lógica de negócio protegida:

#### DTO do Ranking (RankingEntryDTO)
- Exibe: ID, nome, avatar, XP, nível, XP semanal e mensal, missões completadas, bônus de consistência, streak
- Não inclui: percentuais de produtividade (apenas para desempate interno)

#### DTO do Perfil (PlayerProfileDTO)
- Exibe: ID, nome, avatar, nível, missões completadas, streak
- Também inclui: produtividade (total considerado, média percentual) e distribuição de entregas
- Detalhes de produtividade visíveis apenas no perfil individual

### Camadas de Serviço
- **gamificationService**: Lógica de negócio e cálculos
- **dtoTransformers**: Conversão de modelos internos para DTOs
- **supabaseApi**: Camada de abstração para chamadas API Supabase
- **modelStore**: Persistência local (localStorage) e migração de dados

## Endpoints de API Relevantes

### Rankings
- `GET /api/ranking` - Retorna o ranking completo
- `GET /api/reports/ranking.csv` - Exporta ranking em CSV

### Perfis de Jogadores
- `GET /api/profiles/:id` - Retorna perfil detalhado de um jogador
- `PUT /api/profiles/:id` - Atualiza informações do perfil

### Tarefas
- `POST /api/tasks` - Cria uma nova tarefa
- `PUT /api/tasks/:id` - Atualiza uma tarefa existente
- `GET /api/tasks` - Retorna tarefas com filtros
- `DELETE /api/tasks/:id` - Remove uma tarefa
- `GET /api/reports/productivity.csv` - Exporta produtividade em CSV

### Projetos
- `POST /api/projects` - Cria um novo projeto
- `GET /api/projects` - Lista todos os projetos
- `PUT /api/projects/:id` - Atualiza um projeto
- `DELETE /api/projects/:id` - Remove um projeto

### Administração
- `POST /api/seed` - Carrega dados iniciais (usuários e tarefas)
- `POST /api/reprocess` - Recalcula ranking manualmente
- `POST /api/admin/flags` - Define flags administrativas globais

### Métricas e Saúde
- `GET /api/health` - Verifica estado do sistema
- `GET /api/metrics` - Obtém métricas de desempenho
- `GET /api/analytics` - Retorna dados analíticos

### SSE (Server-Sent Events)
- `GET /api/events` - Eventos de atualização em tempo real (ex: ranking atualizado)

## Configurações e Variáveis de Ambiente

### Configurações do Supabase
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase (para uso no backend)

### Configurações de Gamificação
As configurações de percentuais de produtividade podem ser ajustadas via preferências:
- `early`: 100% (padrão) - Tarefa adiantada
- `on_time`: 90% (padrão) - Tarefa no prazo
- `late`: 50% (padrão) - Tarefa atrasada
- `refacao`: 40% (padrão) - Tarefa em refação

### Variáveis de Ambiente
- `PORT`: Porta do servidor (padrão: 3001)
- `NODE_ENV`: Ambiente de execução (development, production)
- `DATABASE_URL`: URL de conexão com o banco de dados (quando necessário)
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase

## Scripts de Inicialização (Seed)

### Inicialização de Dados
Scripts para popular o banco com dados iniciais:

```sql
-- Criar temporadas iniciais
INSERT INTO player_seasons (name, start_date, end_date, is_active) VALUES
('Temporada 2025', '2025-01-01', '2025-12-31', true),
('Temporada de Teste', '2024-01-01', '2024-12-31', false);

-- Criar usuários de exemplo
INSERT INTO users (email, username, full_name) VALUES
('admin@dashi-touch.com', 'admin', 'Administrador'),
('dev1@dashi-touch.com', 'dev1', 'Desenvolvedor 1'),
('dev2@dashi-touch.com', 'dev2', 'Desenvolvedor 2');

-- Criar projetos de exemplo
INSERT INTO projects (name, description, created_by) VALUES
('Projeto Alpha', 'Projeto de demonstração', (SELECT id FROM users WHERE username = 'admin')),
('Projeto Beta', 'Segundo projeto de demonstração', (SELECT id FROM users WHERE username = 'admin'));

-- Criar tarefas de exemplo
INSERT INTO tasks (title, description, assigned_to, status, priority, start_date, deadline, project_id) VALUES
('Criar componente de dashboard', 'Desenvolver componente de dashboard inicial', 
 (SELECT id FROM users WHERE username = 'dev1'), 'completed', 'alta', '2024-12-01', '2024-12-10',
 (SELECT id FROM projects WHERE name = 'Projeto Alpha')),
('Implementar sistema de autenticação', 'Implementar login com OAuth', 
 (SELECT id FROM users WHERE username = 'dev2'), 'in-progress', 'critica', '2024-12-05', '2024-12-15',
 (SELECT id FROM projects WHERE name = 'Projeto Alpha'));
```

## Funções e Triggers do Banco de Dados

### Trigger para Atualizar Data de Atualização
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar o trigger a todas as tabelas que têm updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repetir para outras tabelas com updated_at...
```

### Função para Calcular Métricas de Usuário
```sql
CREATE OR REPLACE FUNCTION calculate_user_metrics(user_id_param UUID)
RETURNS user_metrics
LANGUAGE plpgsql
AS $$
DECLARE
    result user_metrics;
BEGIN
    -- Atualizar métricas de usuário com base em suas tarefas
    INSERT INTO user_metrics (
        user_id,
        task_completion_rate,
        average_delay_days,
        total_tasks_completed,
        total_tasks_delayed,
        performance_score,
        calculated_at
    )
    SELECT
        user_id_param,
        COALESCE(
            (COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)),
            0
        ) as task_completion_rate,
        COALESCE(
            AVG(CASE 
                WHEN status = 'completed' AND end_date > deadline 
                THEN end_date - deadline 
                ELSE NULL 
            END),
            0
        ) as average_delay_days,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as total_tasks_completed,
        COUNT(CASE 
            WHEN status = 'completed' AND end_date > deadline 
            THEN 1 
            ELSE NULL 
        END) as total_tasks_delayed,
        0 as performance_score,  -- Calculado por outro processo
        NOW() as calculated_at
    FROM tasks
    WHERE assigned_to = user_id_param
    GROUP BY assigned_to
    ON CONFLICT (user_id) 
    DO UPDATE SET
        task_completion_rate = EXCLUDED.task_completion_rate,
        average_delay_days = EXCLUDED.average_delay_days,
        total_tasks_completed = EXCLUDED.total_tasks_completed,
        total_tasks_delayed = EXCLUDED.total_tasks_delayed,
        performance_score = EXCLUDED.performance_score,
        calculated_at = EXCLUDED.calculated_at;

    -- Retornar as métricas atualizadas
    SELECT * INTO result FROM user_metrics WHERE user_id = user_id_param;
    RETURN result;
END;
$$;
```

### Função para Atualizar Ranking de Usuário
```sql
CREATE OR REPLACE FUNCTION update_user_ranking(user_id_param UUID, season_id_param UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    season_id_used UUID;
BEGIN
    -- Se não for fornecido season_id_param, usar a temporada ativa
    IF season_id_param IS NULL THEN
        SELECT id INTO season_id_used FROM player_seasons WHERE is_active = true LIMIT 1;
    ELSE
        season_id_used := season_id_param;
    END IF;

    -- Atualizar ou inserir ranking do usuário
    INSERT INTO user_rankings (
        user_id,
        total_xp,
        weekly_xp,
        monthly_xp,
        level,
        position,
        missions_completed,
        consistency_bonus,
        streak,
        last_updated,
        calculated_at,
        season_id
    )
    SELECT
        user_id_param,
        u.total_xp,
        u.weekly_xp,
        u.monthly_xp,
        u.level,
        0, -- posição será atualizada em processo separado
        u.missions_completed,
        u.consistency_bonus,
        u.streak,
        NOW(),
        NOW(),
        season_id_used
    FROM (
        SELECT
            COALESCE(SUM(xh.amount), 0) as total_xp,
            COALESCE(SUM(CASE WHEN xh.earned_at >= NOW() - INTERVAL '7 days' THEN xh.amount ELSE 0 END), 0) as weekly_xp,
            COALESCE(SUM(CASE WHEN xh.earned_at >= NOW() - INTERVAL '30 days' THEN xh.amount ELSE 0 END), 0) as monthly_xp,
            FLOOR(COALESCE(SUM(xh.amount), 0) / 100) + 1 as level,
            COALESCE(SUM(CASE WHEN m.completed = true THEN 1 ELSE 0 END), 0) as missions_completed,
            COALESCE(us.current_streak, 0) as consistency_bonus,
            COALESCE(us.current_streak, 0) as streak
        FROM xp_history xh
        LEFT JOIN missions m ON m.user_id = user_id_param AND m.completed = true
        LEFT JOIN user_streaks us ON us.user_id = user_id_param
        WHERE xh.user_id = user_id_param
    ) u
    ON CONFLICT (user_id, season_id) 
    DO UPDATE SET
        total_xp = EXCLUDED.total_xp,
        weekly_xp = EXCLUDED.weekly_xp,
        monthly_xp = EXCLUDED.monthly_xp,
        level = EXCLUDED.level,
        missions_completed = EXCLUDED.missions_completed,
        consistency_bonus = EXCLUDED.consistency_bonus,
        streak = EXCLUDED.streak,
        last_updated = EXCLUDED.last_updated,
        calculated_at = EXCLUDED.calculated_at;
END;
$$;
```

## Políticas de Segurança (Row Level Security - RLS)

### Ativar RLS para Tabelas Críticas
```sql
-- Ativar RLS para tabelas sensíveis
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Políticas para user_preferences
CREATE POLICY user_preferences_select_policy ON user_preferences
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY user_preferences_insert_policy ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY user_preferences_update_policy ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY user_preferences_delete_policy ON user_preferences
    FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Políticas para user_notifications
CREATE POLICY user_notifications_select_policy ON user_notifications
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY user_notifications_insert_policy ON user_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Outras políticas semelhantes para as demais tabelas...
```