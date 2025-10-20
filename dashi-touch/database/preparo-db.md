# Preparação do Banco de Dados para a Página /settings

## Análise Detalhada da Página /settings

A página de configurações (/settings) provavelmente contém diversos elementos que precisam ser persistidos em um banco de dados. Abaixo está uma análise detalhada dos possíveis componentes e suas necessidades de banco de dados:

### Perfil do Usuário
- **Informações pessoais**: nome, email, foto de perfil, bio
- **Preferências de conta**: idioma, fuso horário, modo escuro/claro
- **Segurança**: senha (hasheada), métodos de autenticação de dois fatores, dispositivos conectados

### Configurações de Notificação
- **Tipos de notificação**: email, push, SMS
- **Frequência de notificação**: imediata, resumos diários/semanais
- **Canais específicos**: notificações de projetos, mensagens, atualizações

### Configurações de Privacidade
- **Visibilidade do perfil**: público, privado, amigos
- **Compartilhamento de dados**: permissão para análise de dados
- **Conteúdo bloqueado**: listas de usuários bloqueados

### Integrações
- **Serviços conectados**: GitHub, Google, etc.
- **Webhooks**: URLs e configurações para integrações de terceiros

### Histórico e Atividade
- **Histórico de login**: registros de acesso
- **Atividade recente**: ações realizadas na plataforma

## Estrutura de Tabelas para Supabase

### Tabela: users
- id (UUID, primary key)
- email (TEXT, unique, not null)
- username (TEXT, unique, not null)
- full_name (TEXT)
- avatar_url (TEXT)
- bio (TEXT)
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())
- timezone (TEXT, default 'UTC')
- language_preference (TEXT, default 'pt-BR')
- theme_preference (TEXT, default 'light')

### Tabela: user_preferences
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- email_notifications_enabled (BOOLEAN, default true)
- push_notifications_enabled (BOOLEAN, default true)
- sms_notifications_enabled (BOOLEAN, default false)
- notification_frequency (TEXT, default 'immediate')
- privacy_level (TEXT, default 'public')
- data_sharing_consent (BOOLEAN, default false)

### Tabela: user_integrations
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- integration_type (TEXT, not null) # ex: 'github', 'google'
- integration_id (TEXT, not null) # ID do usuário no serviço externo
- access_token (TEXT)
- refresh_token (TEXT)
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())
- is_active (BOOLEAN, default true)

### Tabela: user_sessions
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- device_info (JSONB)
- ip_address (INET)
- login_at (TIMESTAMPTZ, default now())
- logout_at (TIMESTAMPTZ)
- is_active (BOOLEAN, default true)

### Tabela: blocked_users
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- blocked_user_id (UUID, foreign key para users.id)
- reason (TEXT)
- blocked_at (TIMESTAMPTZ, default now())

## Funções do Supabase necessárias

### Funções de segurança (Row Level Security - RLS)
- Garantir que usuários só acessem seus próprios dados
- Permissões específicas para operações CRUD

### Triggers
- Atualizar o campo updated_at em tabelas de usuário
- Registrar atividades de login/logout

## Considerações para Supabase

1. **Autenticação**: Usar o sistema de autenticação do Supabase com provedores OAuth (Google, GitHub, etc.)
2. **Storage**: Armazenamento de imagens de perfil no Supabase Storage
3. **RLS (Row Level Security)**: Implementar políticas de segurança para garantir que usuários só acessem seus próprios dados
4. **Índices**: Criar índices adequados para otimizar consultas frequentes
5. **Types**: Utilizar tipos customizados do PostgreSQL onde apropriado

## Chamadas de API necessárias para a página /settings

### Consultas
1. Obter informações do perfil do usuário
2. Obter preferências do usuário
3. Listar integrações ativas
4. Obter histórico de login
5. Listar usuários bloqueados

### Atualizações
1. Atualizar informações do perfil
2. Atualizar preferências
3. Ativar/desativar integrações
4. Bloquear/desbloquear usuários

## Exemplo de chamadas do lado do cliente (usando Supabase JS)

```javascript
// Obter perfil do usuário
const { data: profile, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()

// Atualizar perfil do usuário
const { error } = await supabase
  .from('users')
  .update({ full_name: 'Novo Nome', bio: 'Nova Bio' })
  .eq('id', userId)

// Obter preferências do usuário
const { data: preferences, error } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', userId)
  .single()

// Atualizar preferências
const { error } = await supabase
  .from('user_preferences')
  .update({ email_notifications_enabled: false })
  .eq('user_id', userId)
  .single()
```

Esta estrutura fornece uma base sólida para implementar todas as funcionalidades da página /settings com persistência em um banco de dados Supabase.

# Análise Detalhada da Página /editor

## Visão Geral da Página
A página /editor (DataEditor) é uma interface avançada de gerenciamento de tarefas que permite:

1. Visualização de tarefas em diferentes modos (tabela, Kanban, player)
2. Adição, edição e exclusão de tarefas
3. Atribuição de tarefas a responsáveis
4. Gestão de status, prazos e prioridades
5. Importação e exportação de dados
6. Visualização de métricas e KPIs
7. Integração com sistema de gamificação

## Estrutura de Tabelas para Supabase

### Tabela: tasks
- id (UUID, primary key)
- title (TEXT, not null) # Nome da tarefa
- description (TEXT)
- assigned_to (UUID, foreign key para users.id)
- status (TEXT, not null, default 'todo') # Valores possíveis: backlog, todo, in-progress, completed, refacao
- priority (TEXT, default 'media') # Valores possíveis: baixa, media, alta, critica
- start_date (DATE, not null)
- end_date (DATE)
- deadline (DATE, not null)
- duration_work_days (INTEGER, default 0) # Calculado automaticamente
- delay_work_days (INTEGER, default 0) # Calculado automaticamente
- on_time (BOOLEAN, default true) # Calculado automaticamente
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())
- project_id (UUID, foreign key para projects.id)

### Tabela: projects
- id (UUID, primary key)
- name (TEXT, not null)
- description (TEXT)
- created_by (UUID, foreign key para users.id)
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())
- start_date (DATE)
- deadline (DATE)

### Tabela: task_assignments
- id (UUID, primary key)
- task_id (UUID, foreign key para tasks.id)
- user_id (UUID, foreign key para users.id)
- assigned_at (TIMESTAMPTZ, default now())
- assigned_by (UUID, foreign key para users.id)

### Tabela: task_history
- id (UUID, primary key)
- task_id (UUID, foreign key para tasks.id)
- changed_by (UUID, foreign key para users.id)
- field_name (TEXT, not null)
- old_value (TEXT)
- new_value (TEXT)
- changed_at (TIMESTAMPTZ, default now())

### Tabela: kpis
- id (UUID, primary key)
- project_id (UUID, foreign key para projects.id)
- metric_name (TEXT, not null)
- metric_value (NUMERIC, not null)
- calculation_date (DATE, not null)
- calculated_from_tasks (JSONB) # Dados usados para cálculo

### Tabela: user_metrics
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- task_completion_rate (NUMERIC)
- average_delay_days (NUMERIC)
- total_tasks_completed (INTEGER, default 0)
- total_tasks_delayed (INTEGER, default 0)
- performance_score (NUMERIC)
- calculated_at (TIMESTAMPTZ, default now())

### Tabela: missions
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- config_id (TEXT, not null) # Referência ao tipo de missão
- name (TEXT, not null)
- description (TEXT)
- target (INTEGER, not null)
- current_progress (INTEGER, default 0)
- xp_reward (INTEGER, default 0)
- deadline (TIMESTAMPTZ)
- completed (BOOLEAN, default false)
- completed_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ, default now())

### Tabela: xp_history
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- amount (INTEGER, not null)
- reason_type (TEXT, not null) # 'task_completion', 'mission', etc.
- reason_description (TEXT)
- related_id (TEXT) # ID do item relacionado (tarefa, missão, etc.)
- earned_at (TIMESTAMPTZ, default now())

## Funções do Supabase necessárias

### Funções de segurança (Row Level Security - RLS)
- Garantir que usuários só acessem tarefas e projetos que tenham permissão
- Permitir que usuários vejam apenas seus próprios dados de métricas e missões
- Restringir acesso a dados de outros usuários

### Triggers
- Atualizar o campo updated_at em tarefas e projetos
- Calcular automaticamente campos como duration_work_days, delay_work_days e on_time
- Registrar alterações na tabela task_history
- Atualizar métricas de usuário quando tarefas são completadas

## Considerações para Supabase

1. **Índices**: Criar índices adequados para otimizar consultas por status, responsável, data e projeto
2. **Storage**: Armazenamento de arquivos importados/exportados (JSON, CSV) no Supabase Storage
3. **RLS (Row Level Security)**: Implementar políticas de segurança rigorosas
4. **Real-time**: Usar recursos de real-time do Supabase para atualizações instantâneas
5. **Funções do lado do servidor**: Funções para cálculo de métricas complexas e KPIs

## Chamadas de API necessárias para a página /editor

### Consultas
1. Obter todas as tarefas de um projeto
2. Obter tarefas por status
3. Obter tarefas por responsável
4. Obter métricas do projeto
5. Obter KPIs calculados
6. Obter tarefas de um usuário específico (modo player)

### Atualizações
1. Criar nova tarefa
2. Editar tarefa existente
3. Alterar status de tarefa
4. Atribuir tarefa a usuário
5. Excluir tarefa
6. Importar múltiplas tarefas de uma vez

### Cálculos e métricas
1. Recalcular métricas do projeto
2. Validar dados das tarefas
3. Calcular KPIs avançados
4. Atualizar pontuação de gamificação

## Exemplo de chamadas do lado do cliente (usando Supabase JS)

```javascript
// Obter todas as tarefas de um projeto
const { data: tasks, error } = await supabase
  .from('tasks')
  .select(`
    *,
    assigned_user:assigned_to(id, full_name, avatar_url),
    project:project_id(name)
  `)
  .eq('project_id', projectId)
  .order('created_at', { ascending: false })

// Criar nova tarefa
const { data: newTask, error } = await supabase
  .from('tasks')
  .insert([{
    title: 'Nova Tarefa',
    description: 'Descrição da tarefa',
    assigned_to: userId,
    status: 'todo',
    start_date: '2023-10-01',
    deadline: '2023-10-15',
    project_id: projectId
  }])
  .select()
  .single()

// Atualizar tarefa
const { error } = await supabase
  .from('tasks')
  .update({ 
    status: 'completed',
    end_date: '2023-10-10'
  })
  .eq('id', taskId)

// Obter métricas do projeto
const { data: metrics, error } = await supabase
  .rpc('calculate_project_metrics', { project_id: projectId })

// Obter tarefas de um usuário (para modo player)
const { data: playerTasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('assigned_to', userId)
  .eq('project_id', projectId)
```

## Considerações Específicas para o Editor

### Importação/Exportação de Dados
- Implementar funções para importação/exportação de dados no formato JSON
- Validação de campos obrigatórios durante a importação
- Mapeamento de responsáveis para IDs de usuário

### Integração com Gamificação
- Sincronização automática de missões ao completar tarefas
- Cálculo de XP baseado na conclusão de tarefas
- Atualização de ranking de usuários

### Visualizações
- Suporte para diferentes modos de visualização (tabela, Kanban, player)
- Filtros dinâmicos por status, responsável, data e prioridade
- Ordenação personalizada

### Sistema de Notificações de Missões
- Identificação de progresso de missões ao completar tarefas
- Atualização automática do progresso de missões semanais
- Atribuição de recompensas de XP ao completar missões

Com esta estrutura, a página /editor terá todos os recursos necessários para funcionar de forma eficaz com um banco de dados Supabase, mantendo a integridade dos dados e oferecendo uma experiência rica para os usuários.

# Análise Detalhada da Página /profile/current

## Visão Geral da Página
A página /profile/current (PlayerProfilePage) é uma interface completa de perfil de jogador que permite:

1. Visualização de informações pessoais e estatísticas
2. Exibição de produtividade média e distribuição de entregas
3. Visualização de tarefas atrasadas e do dia
4. Exibição de histórico de atividades recentes
5. Gerenciamento de notificações
6. Visualização de conquistas e métricas gamificadas
7. Edição de informações do perfil

## Estrutura de Tabelas para Supabase

### Tabela: player_profiles
- id (UUID, primary key, referencia users.id)
- user_id (UUID, foreign key para users.id, unique)
- name (TEXT, not null)
- avatar (TEXT)
- role (TEXT)
- level (INTEGER, default 1)
- missions_completed (INTEGER, default 0)
- streak (INTEGER, default 0)
- best_streak (INTEGER, default 0)
- tasks_completion_rate (NUMERIC, default 0)
- average_task_xp (NUMERIC, default 0)
- joined_date (DATE, default now())
- profile_visibility (TEXT, default 'public') # 'public', 'team', 'private'
- xp_visibility (TEXT, default 'public') # 'public', 'team', 'private'
- share_with_team (BOOLEAN, default true)
- theme (TEXT, default 'default')
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())

### Tabela: user_notifications
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- title (TEXT, not null)
- message (TEXT, not null)
- type (TEXT, not null) # 'task', 'mission', 'achievement', 'warning', 'system'
- is_read (BOOLEAN, default false)
- xp_reward (INTEGER)
- related_entity_type (TEXT) # 'task', 'mission', 'achievement'
- related_entity_id (TEXT)
- created_at (TIMESTAMPTZ, default now())

### Tabela: notification_read_status
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- notification_id (UUID, foreign key para user_notifications.id)
- read_at (TIMESTAMPTZ, default now())

### Tabela: player_productivity_metrics
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- season_name (TEXT, not null)
- average_percent (NUMERIC, not null)
- total_considered (INTEGER, not null)
- delivery_distribution (JSONB) # { early: number, on_time: number, late: number, refacao: number }
- tasks_breakdown (JSONB[]) # Array de objetos com { id: string, title: string, classificacao: string, percent: number, completedDate: string }
- calculated_at (TIMESTAMPTZ, default now())
- calculated_from_tasks (JSONB) # IDs das tarefas usadas para cálculo

### Tabela: player_seasons
- id (UUID, primary key)
- name (TEXT, not null)
- start_date (DATE, not null)
- end_date (DATE, not null)
- is_active (BOOLEAN, default false)
- created_at (TIMESTAMPTZ, default now())

### Tabela: user_activity_log
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- activity_type (TEXT, not null) # 'task_created', 'task_completed', 'xp_gained', 'mission_completed'
- title (TEXT, not null)
- description (TEXT)
- related_entity_type (TEXT)
- related_entity_id (TEXT)
- created_at (TIMESTAMPTZ, default now())

### Tabela: task_comments
- id (UUID, primary key)
- task_id (UUID, foreign key para tasks.id)
- user_id (UUID, foreign key para users.id)
- comment (TEXT, not null)
- parent_comment_id (UUID, foreign key para task_comments.id, nullable) # Para comentários encadeados
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())

### Tabela: player_stats_history
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- date_recorded (DATE, not null)
- level (INTEGER)
- xp_total (INTEGER)
- streak (INTEGER)
- best_streak (INTEGER)
- missions_completed (INTEGER)
- tasks_completion_rate (NUMERIC)
- average_task_xp (NUMERIC)

## Funções do Supabase necessárias

### Funções de segurança (Row Level Security - RLS)
- Permitir que usuários visualizem perfis com base na visibilidade configurada
- Restringir acesso a dados sensíveis com base nas preferências de privacidade
- Garantir que apenas o dono do perfil ou membros da equipe possam editar

### Triggers
- Atualizar o campo updated_at em perfis
- Registrar atividades quando tarefas forem concluídas ou atualizadas
- Atualizar métricas de produtividade automaticamente

## Considerações para Supabase

1. **Índices**: Criar índices em campos frequentemente consultados como user_id, season_name, created_at
2. **Storage**: Armazenamento de avatares e outros arquivos de perfil
3. **RLS (Row Level Security)**: Implementar políticas de privacidade rigorosas
4. **Real-time**: Recursos para atualizar notificações em tempo real
5. **Funções do lado do servidor**: Cálculo de métricas de produtividade e estatísticas

## Chamadas de API necessárias para a página /profile/current

### Consultas
1. Obter perfil do jogador (GET /api/profiles/:id)
2. Obter estatísticas do jogador
3. Obter métricas de produtividade
4. Obter notificações do usuário
5. Obter histórico de atividades
6. Obter temporadas disponíveis
7. Obter tarefas associadas ao usuário

### Atualizações
1. Atualizar informações do perfil
2. Marcar notificações como lidas
3. Atualizar preferências de notificação
4. Registrar interações com o perfil

## Exemplo de chamadas do lado do cliente (usando Supabase JS)

```javascript
// Obter perfil do jogador
const { data: profile, error } = await supabase
  .from('player_profiles')
  .select(`
    *,
    user:users(email, created_at)
  `)
  .eq('user_id', userId)
  .single()

// Obter métricas de produtividade
const { data: metrics, error } = await supabase
  .from('player_productivity_metrics')
  .select('*')
  .eq('user_id', userId)
  .eq('season_name', 'current')
  .order('calculated_at', { ascending: false })
  .limit(1)

// Obter notificações não lidas
const { data: notifications, error } = await supabase
  .from('user_notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// Marcar notificação como lida
const { error } = await supabase
  .from('notification_read_status')
  .insert({ 
    user_id: userId, 
    notification_id: notificationId,
    read_at: new Date().toISOString()
  })

// Atualizar perfil do jogador
const { error } = await supabase
  .from('player_profiles')
  .update({ 
    name: newName,
    role: newRole,
    theme: newTheme
  })
  .eq('user_id', userId)
```

## Considerações Específicas para o Perfil

### Visualização de Métricas
- A página exibe métricas de produtividade média com base em tarefas
- Distribuição de entregas (adiantadas, no prazo, atrasadas, refação)
- Histórico de atividades recentes baseado em tarefas e XP

### Interações Sociais
- Mensagens entre jogadores (funcionalidade futura)
- Níveis e conquistas gamificadas
- Sistema de notificações personalizadas

### Temporadas
- Suporte a múltiplas temporadas de desempenho
- Cálculo de métricas por temporada específica
- Seletor de temporadas para visualização

### Privacidade e Preferências
- Configurações de visibilidade do perfil
- Controles de notificação
- Preferências de interface (tema)

Com esta estrutura, a página /profile/current terá todos os recursos necessários para funcionar eficazmente com um banco de dados Supabase, oferecendo uma experiência completa de perfil de jogador com métricas detalhadas e recursos sociais.

# Análise Detalhada da Página /ranking

## Visão Geral da Página
A página /ranking é uma interface de sistema de gamificação que permite:

1. Visualização de ranking de usuários baseado em pontos de experiência (XP)
2. Exibição de XP total, semanal e mensal
3. Visualização de estatísticas resumo (total de XP, missões completas, etc.)
4. Detalhamento das informações de desempenho por usuário
5. Histórico de XP e missões semanais
6. Exportação de dados em CSV e PDF
7. Filtragem por temporadas e períodos (semanal/mensal)

## Estrutura de Tabelas para Supabase

### Tabela: user_rankings
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id, unique)
- total_xp (INTEGER, default 0)
- weekly_xp (INTEGER, default 0)
- monthly_xp (INTEGER, default 0)
- level (INTEGER, default 1)
- position (INTEGER)
- missions_completed (INTEGER, default 0)
- consistency_bonus (INTEGER, default 0)
- streak (INTEGER, default 0)
- last_updated (TIMESTAMPTZ, default now())
- calculated_at (TIMESTAMPTZ, default now())
- season_id (UUID, foreign key para player_seasons.id)

### Tabela: ranking_history
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- total_xp (INTEGER)
- weekly_xp (INTEGER)
- monthly_xp (INTEGER)
- level (INTEGER)
- position (INTEGER)
- streak (INTEGER)
- date_recorded (DATE, not null)
- season_id (UUID, foreign key para player_seasons.id)

### Tabela: ranking_cache
- id (UUID, primary key)
- ranking_type (TEXT, not null) # 'weekly', 'monthly', 'total'
- season_id (UUID, foreign key para player_seasons.id)
- cached_at (TIMESTAMPTZ, default now())
- expiration_at (TIMESTAMPTZ, not null)
- ranking_data (JSONB) # Dados serializados do ranking
- calculated_from_tasks (JSONB) # IDs das tarefas usadas para cálculo

### Tabela: ranking_updates_log
- id (UUID, primary key)
- triggered_by (TEXT) # 'manual', 'task_completion', 'schedule', 'api_event'
- trigger_details (JSONB) # Detalhes específicos do gatilho
- users_affected (INTEGER)
- start_time (TIMESTAMPTZ, default now())
- end_time (TIMESTAMPTZ)
- duration_ms (INTEGER)
- success (BOOLEAN, default true)
- error_message (TEXT)

### Tabela: user_streaks
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id, unique)
- current_streak (INTEGER, default 0)
- best_streak (INTEGER, default 0)
- last_active_date (DATE)
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())

### Tabela: season_rankings
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- season_id (UUID, foreign key para player_seasons.id)
- total_xp (INTEGER, default 0)
- season_start_xp (INTEGER, default 0)
- season_end_xp (INTEGER)
- position (INTEGER)
- tasks_completed (INTEGER, default 0)
- missions_completed (INTEGER, default 0)
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())

### Tabela: ranking_events
- id (UUID, primary key)
- event_type (TEXT, not null) # 'ranking:update', 'xp:gain', 'mission:complete'
- user_id (UUID, foreign key para users.id)
- related_entity_type (TEXT) # 'task', 'mission', 'bonus', 'penalty'
- related_entity_id (TEXT)
- payload (JSONB) # Dados específicos do evento
- created_at (TIMESTAMPTZ, default now())

## Funções do Supabase necessárias

### Funções de segurança (Row Level Security - RLS)
- Permitir que usuários visualizem apenas seus próprios detalhes em modo player
- Controlar acesso a rankings baseados em visibilidade configurada
- Restringir acesso a dados de outros usuários conforme regras de negócio

### Triggers
- Atualizar posição automaticamente quando rankings forem recalculados
- Registrar eventos ao ganhar XP ou completar missões
- Atualizar streaks quando atividades forem registradas

## Considerações para Supabase

1. **Índices**: Criar índices compostos para consultas por tipo de ranking e temporada
2. **Performance**: Implementar cache de ranking para evitar cálculos excessivos
3. **RLS (Row Level Security)**: Controle rigoroso de acesso baseado no papel do usuário
4. **Real-time**: Utilizar recursos de streaming de eventos para atualizações em tempo real
5. **Funções do lado do servidor**: Cálculo eficiente de rankings e posições

## Chamadas de API necessárias para a página /ranking

### Consultas
1. Obter ranking completo (GET /api/ranking)
2. Obter detalhes de desempenho de um usuário (GET /api/users/:id/details)
3. Obter eventos de atualização (SSE /api/events)
4. Obter histórico de um usuário específico
5. Obter temporadas disponíveis

### Atualizações
1. Recalcular ranking manualmente (POST /api/reprocess)
2. Atualizar posição quando XP for alterado
3. Registrar eventos de desempenho

### Exportação
1. Exportar ranking em CSV (GET /api/reports/ranking.csv)
2. Exportar ranking em PDF (cliente-side com dados da API)

## Exemplo de chamadas do lado do cliente (usando Supabase JS)

```javascript
// Obter ranking completo
const { data: ranking, error } = await supabase
  .from('user_rankings')
  .select(`
    *,
    user:users(name, avatar)
  `)
  .eq('season_id', seasonId)
  .order('position', { ascending: true })

// Obter ranking semanal
const { data: weeklyRanking, error } = await supabase
  .from('user_rankings')
  .select('*')
  .eq('season_id', seasonId)
  .order('weekly_xp', { ascending: false })

// Obter detalhes de desempenho de um usuário
const { data: userDetails, error } = await supabase
  .from('user_rankings')
  .select(`
    *,
    xp_history:user_xp_history(type, amount, date, description),
    missions:user_missions_made(name, completed, deadline, xp_reward)
  `)
  .eq('user_id', userId)
  .single()

// Registrar evento de atualização de ranking
const { error } = await supabase
  .from('ranking_events')
  .insert({
    event_type: 'ranking:update',
    user_id: userId,
    payload: { old_position: 5, new_position: 3, xp_gained: 150 }
  })

// Obter temporadas configuradas
const { data: seasons, error } = await supabase
  .from('player_seasons')
  .select('*')
  .eq('is_active', true)
  .order('start_date', { ascending: false })
```

## Considerações Específicas para o Ranking

### Cálculo de Posição
- Sistema de desempate baseado em XP total quando XP do período é igual
- Recálculo automático quando tarefas são concluídas ou eventos de XP ocorrem
- Atualizações em tempo real via Server-Sent Events (SSE)

### Períodos de Tempo
- Suporte a diferentes períodos (semanal, mensal, total)
- Filtragem por temporadas com datas específicas
- Cache de dados para diferentes períodos

### Exportação de Dados
- Exportação em CSV e PDF do ranking atual
- Exportação inclui todas as métricas relevantes
- Formatação adequada para relatórios

### Integração com Gamificação
- Atualização automática quando missões são completadas
- Cálculo de bônus de consistência
- Integração com sistema de streaks e níveis

Com esta estrutura, a página /ranking terá todos os recursos necessários para funcionar eficazmente com um banco de dados Supabase, oferecendo um sistema de gamificação completo com atualizações em tempo real e métricas detalhadas de desempenho.

# Análise Detalhada da PÁGINA /tasks

## Visão Geral da Página
A página /tasks é uma interface completa de gerenciamento de tarefas que permite:

1. Visualização detalhada de todas as tarefas do projeto
2. Filtragem por prioridade, status, datas e responsáveis
3. Criação e edição de tarefas
4. Visualização de métricas e estatísticas de tarefas
5. Geração de gráficos de evolução de tarefas
6. Exportação e importação de dados
7. Filtro por temporadas
8. Visualização de gráficos de tarefas concluídas vs pendentes

## Estrutura de Tabelas para Supabase

### Tabela: tasks (já definida na seção do editor)
- id (UUID, primary key)
- title (TEXT, not null) # Nome da tarefa
- description (TEXT)
- assigned_to (UUID, foreign key para users.id)
- status (TEXT, not null, default 'todo') # Valores possíveis: backlog, todo, in-progress, completed, refacao
- priority (TEXT, default 'media') # Valores possíveis: baixa, media, alta, critica
- start_date (DATE, not null)
- end_date (DATE)
- deadline (DATE, not null)
- duration_work_days (INTEGER, default 0) # Calculado automaticamente
- delay_work_days (INTEGER, default 0) # Calculado automaticamente
- on_time (BOOLEAN, default true) # Calculado automaticamente
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())
- project_id (UUID, foreign key para projects.id)

### Tabela: task_filters
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- filter_name (TEXT, not null)
- filter_type (TEXT, not null) # 'quick', 'custom', 'saved'
- filter_config (JSONB) # Configuração específica do filtro (status, prioridade, datas, etc.)
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())

### Tabela: task_charts_cache
- id (UUID, primary key)
- chart_type (TEXT, not null) # 'line', 'bar', etc.
- season_id (UUID, foreign key para player_seasons.id)
- cached_data (JSONB) # Dados do gráfico (série temporal de tarefas)
- calculated_at (TIMESTAMPTZ, default now())
- expires_at (TIMESTAMPTZ, not null)

### Tabela: task_statistics
- id (UUID, primary key)
- season_id (UUID, foreign key para player_seasons.id)
- total_tasks (INTEGER, default 0)
- completed_tasks (INTEGER, default 0)
- pending_tasks (INTEGER, default 0)
- overdue_tasks (INTEGER, default 0)
- calculated_at (TIMESTAMPTZ, default now())
- calculated_from_tasks (JSONB) # IDs das tarefas usadas para cálculo

### Tabela: task_imports_log
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- filename (TEXT, not null)
- total_imported (INTEGER)
- success_count (INTEGER)
- error_count (INTEGER)
- import_errors (JSONB)
- imported_at (TIMESTAMPTZ, default now())

### Tabela: task_exports_log
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- export_format (TEXT, not null) # 'json', 'csv', 'pdf'
- task_count (INTEGER)
- exported_at (TIMESTAMPTZ, default now())
- file_path (TEXT) # Caminho do arquivo no storage

### Tabela: task_templates
- id (UUID, primary key)
- name (TEXT, not null)
- description (TEXT)
- template_config (JSONB) # Configuração padrão de tarefa
- created_by (UUID, foreign key para users.id)
- is_global (BOOLEAN, default false)
- created_at (TIMESTAMPTZ, default now())

## Funções do Supabase necessárias

### Funções de segurança (Row Level Security - RLS)
- Permitir que usuários visualizem tarefas atribuídas a eles
- Permitir que administradores visualizem todas as tarefas
- Controlar acesso baseado na propriedade do projeto
- Restringir edição de tarefas baseado em permissões

### Triggers
- Atualizar estatísticas quando tarefas forem criadas/atualizadas
- Registrar histórico de alterações em tarefas
- Atualizar cache de gráficos quando dados relevantes mudarem

## Considerações para Supabase

1. **Índices**: Criar índices compostos por status, priority, assigned_to e datas
2. **Storage**: Armazenamento de arquivos exportados e backups
3. **RLS (Row Level Security)**: Controle rigoroso de acesso baseado em papel e projeto
4. **Real-time**: Atualizações em tempo real das listagens quando tarefas forem alteradas
5. **Funções do lado do servidor**: Cálculo eficiente de estatísticas e geração de gráficos

## Chamadas de API necessárias para a página /tasks

### Consultas
1. Obter todas as tarefas (GET /api/tasks)
2. Obter tarefas por filtro (status, prioridade, datas, etc.)
3. Obter tarefas por temporada
4. Obter estatísticas de tarefas
5. Obter dados para gráficos de evolução
6. Obter templates de tarefas
7. Obter histórico de importação/exportação

### Atualizações
1. Criar nova tarefa (POST /api/tasks)
2. Atualizar tarefa existente (PUT /api/tasks/:id)
3. Atualizar status de tarefa (PATCH /api/tasks/:id/status)
4. Importar tarefas (POST /api/tasks/import)
5. Exportar tarefas (GET /api/tasks/export)

### Exportação
1. Exportar tarefas em JSON (GET /api/tasks/export/json)
2. Exportar tarefas em PDF (GET /api/tasks/export/pdf)

## Exemplo de chamadas do lado do cliente (usando Supabase JS)

```javascript
// Obter tarefas com paginação e filtros
const { data: tasks, error } = await supabase
  .from('tasks')
  .select(`
    *,
    assigned_user:assigned_to(id, full_name, avatar_url),
    project:project_id(name)
  `)
  .eq('project_id', projectId)
  .in('status', ['todo', 'in-progress'])
  .order('deadline', { ascending: true })

// Obter estatísticas de tarefas por temporada
const { data: stats, error } = await supabase
  .from('task_statistics')
  .select('*')
  .eq('season_id', seasonId)
  .single()

// Obter dados para gráfico de evolução
const { data: chartData, error } = await supabase
  .from('task_charts_cache')
  .select('cached_data')
  .eq('season_id', seasonId)
  .eq('chart_type', 'line')
  .single()

// Criar nova tarefa
const { data: newTask, error } = await supabase
  .from('tasks')
  .insert([{
    title: 'Nova Tarefa',
    description: 'Descrição da tarefa',
    assigned_to: userId,
    status: 'todo',
    priority: 'alta',
    start_date: '2023-10-01',
    deadline: '2023-10-15',
    project_id: projectId
  }])
  .select()
  .single()

// Atualizar tarefa
const { error } = await supabase
  .from('tasks')
  .update({ 
    status: 'completed',
    end_date: '2023-10-10'
  })
  .eq('id', taskId)

// Filtrar tarefas por prioridade
const { data: highPriorityTasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('priority', 'alta')
  .eq('project_id', projectId)

// Obter tarefas por temporada
const { data: seasonTasks, error } = await supabase
  .from('tasks')
  .select('*')
  .gte('deadline', seasonStart)
  .lte('deadline', seasonEnd)
```

## Considerações Específicas para a Página de Tarefas

### Filtros e Ordenação
- Suporte a filtros complexos por status, prioridade, datas e responsáveis
- Filtros rápidos para tarefas críticas, concluídas hoje, etc.
- Ordenação personalizada por diferentes critérios

### Temporadas
- Filtragem de tarefas por temporadas específicas
- Estatísticas baseadas em temporadas
- Integração com sistema de temporadas existente

### Geração de Relatórios
- Exportação em múltiplos formatos (JSON, PDF)
- Gráficos de evolução de tarefas ao longo do tempo
- Estatísticas resumidas e detalhadas

### Performance
- Cache de dados para melhor performance
- Paginação para grandes volumes de tarefas
- Índices adequados para consultas rápidas

Com esta estrutura, a página /tasks terá todos os recursos necessários para funcionar eficazmente com um banco de dados Supabase, oferecendo um sistema completo de gerenciamento de tarefas com filtros avançados, visualizações gráficas e funcionalidades de importação/exportação.

# Análise Detalhada da PÁGINA /analytics

## Visão Geral da Página
A página /analytics é uma interface avançada de análise de dados que permite:

1. Visualização de gráficos de duração vs atraso por tarefa
2. Visualização de distribuição de tarefas por pontualidade (gráfico de pizza)
3. Análise estatística avançada (média de produção, moda, mediana)
4. Distribuição de atrasos
5. Visualização de KPIs e métricas em tempo real
6. Recálculo e cache de dados analíticos
7. Análise por responsáveis e projetos
8. Visualização de dados em diferentes formatos (barras, pizza, box plot)

## Estrutura de Tabelas para Supabase

### Tabela: analytics_cache
- id (UUID, primary key)
- cache_key (TEXT, unique, not null) # CHAVE_COMPOSTA(tipo_grafico, projeto_id, periodo_inicio, periodo_fim)
- chart_type (TEXT, not null) # 'bar', 'pie', 'line', 'box_plot', 'distribution'
- project_id (UUID, foreign key para projects.id, nullable)
- calculated_data (JSONB) # Dados calculados para o gráfico
- calculated_kpis (JSONB) # KPIs calculados (média, mediana, moda, etc.)
- calculated_at (TIMESTAMPTZ, default now())
- expires_at (TIMESTAMPTZ, not null)
- calculated_from_tasks (JSONB) # IDs das tarefas usadas para cálculo
- processing_time_ms (INTEGER) # Tempo de processamento em milissegundos
- cache_version (INTEGER, default 1) # Versão do algoritmo de cálculo

### Tabela: kpi_calculations
- id (UUID, primary key)
- calculation_id (TEXT, unique, not null) # UUID do cálculo
- calculation_version (TEXT, not null) # Versão do sistema de cálculo
- total_tasks (INTEGER)
- average_production (NUMERIC) # Média de produção em dias
- median (NUMERIC) # Mediana em dias
- mode_value (NUMERIC) # Valor da moda
- mode_frequency (INTEGER) # Frequência da moda
- standard_deviation (NUMERIC) # Desvio padrão
- tasks_on_time (INTEGER) # Tarefas no prazo
- tasks_delayed (INTEGER) # Tarefas atrasadas
- data_quality_score (NUMERIC) # Pontuação de qualidade dos dados
- data_hash (TEXT) # Hash dos dados de entrada
- calculation_metadata (JSONB) # Metadados adicionais do cálculo
- calculated_at (TIMESTAMPTZ, default now())
- calculated_from_tasks (JSONB) # IDs das tarefas usadas para cálculo

### Tabela: chart_configurations
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id, nullable) # Configuração específica do usuário
- chart_name (TEXT, not null)
- chart_type (TEXT, not null) # 'bar', 'pie', 'line', etc.
- chart_config (JSONB) # Configuração específica do gráfico
- is_global (BOOLEAN, default false) # Disponível para todos os usuários
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())

### Tabela: analytics_events_log
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- event_type (TEXT, not null) # 'chart_view', 'recalculate_trigger', 'export', 'filter_change'
- chart_type (TEXT) # Tipo do gráfico afetado
- project_id (UUID, foreign key para projects.id)
- event_details (JSONB) # Detalhes específicos do evento
- created_at (TIMESTAMPTZ, default now())

### Tabela: analytics_preferences
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id, unique)
- default_chart_type (TEXT, default 'bar') # Tipo de gráfico padrão
- time_range_preference (TEXT, default 'last_month') # 'last_week', 'last_month', 'last_quarter', 'custom'
- show_cache_indicator (BOOLEAN, default true)
- recalculation_frequency (INTEGER, default 300) # Em segundos
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())

### Tabela: statistical_outliers
- id (UUID, primary key)
- task_id (UUID, foreign key para tasks.id)
- outlier_type (TEXT, not null) # 'duration', 'delay', 'start_time', 'completion_time'
- outlier_value (NUMERIC)
- threshold_used (NUMERIC) # Limiar usado para identificação
- severity (TEXT) # 'low', 'medium', 'high', 'critical'
- calculated_at (TIMESTAMPTZ, default now())

### Tabela: dashboard_widgets
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- widget_type (TEXT, not null) # 'kpi_summary', 'chart', 'metric_card', 'trend_indicator'
- position_order (INTEGER, not null)
- configuration (JSONB) # Configuração específica do widget
- is_active (BOOLEAN, default true)
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())

## Funções do Supabase necessárias

### Funções de segurança (Row Level Security - RLS)
- Permitir que usuários acessem apenas seus próprios dados de configuração
- Controlar acesso a dados de analytics baseado em permissões de projeto
- Restringir visualização de dados sensíveis

### Triggers
- Atualizar cache de analytics quando tarefas forem alteradas
- Registrar eventos de analytics quando gráficos forem visualizados
- Atualizar estatísticas quando novos dados forem processados

## Considerações para Supabase

1. **Índices**: Criar índices em campos frequentemente usados para cálculos estatísticos
2. **Performance**: Implementar sistema de cache eficiente para cálculos pesados
3. **RLS (Row Level Security)**: Controle rigoroso de acesso baseado em papel e projeto
4. **Real-time**: Atualizações em tempo real quando os dados subjacentes mudarem
5. **Funções do lado do servidor**: Cálculo eficiente de estatísticas e KPIs complexos

## Chamadas de API necessárias para a página /analytics

### Consultas
1. Obter dados para gráficos (GET /api/analytics/charts)
2. Obter KPIs calculados (GET /api/analytics/kpis)
3. Obter configurações de usuário (GET /api/analytics/preferences)
4. Obter cache de analytics (GET /api/analytics/cache/:key)
5. Obter configurações de gráficos (GET /api/analytics/chart-configs)

### Atualizações
1. Forçar recálculo de analytics (POST /api/analytics/recalculate)
2. Atualizar preferências de usuário (PUT /api/analytics/preferences)
3. Atualizar configurações de gráficos (PUT /api/analytics/chart-configs/:id)
4. Limpar cache de analytics (DELETE /api/analytics/cache)

### Exportação
1. Exportar dados analíticos (GET /api/analytics/export)

## Exemplo de chamadas do lado do cliente (usando Supabase JS)

```javascript
// Obter KPIs calculados
const { data: kpis, error } = await supabase
  .from('kpi_calculations')
  .select('*')
  .order('calculated_at', { ascending: false })
  .limit(1)
  .single()

// Obter dados do cache de analytics
const { data: cachedData, error } = await supabase
  .from('analytics_cache')
  .select('calculated_data, calculated_kpis, calculated_at')
  .eq('cache_key', 'bar_chart_project_123_last_month')
  .single()

// Forçar recálculo de analytics
const { data: newKPIs, error } = await supabase.rpc('recalculate_analytics', {
  project_id: projectId,
  recalculate_all: true
})

// Atualizar preferências de analytics
const { error } = await supabase
  .from('analytics_preferences')
  .update({ 
    default_chart_type: 'line',
    recalculation_frequency: 600
  })
  .eq('user_id', userId)

// Obter configurações de gráficos
const { data: chartConfigs, error } = await supabase
  .from('chart_configurations')
  .select('*')
  .or('is_global.eq.true,user_id.eq.${userId}')
  .order('created_at', { ascending: false })

// Registrar evento de visualização de gráfico
const { error } = await supabase
  .from('analytics_events_log')
  .insert({
    user_id: userId,
    event_type: 'chart_view',
    chart_type: 'bar',
    project_id: projectId,
    event_details: { cache_hit: true, processing_time: 150 }
  })
```

## Considerações Específicas para a Página de Analytics

### Caching e Performance
- Implementação de sistema de cache com TTL configurável
- Identificação de cache baseada em dados e parâmetros
- Indicadores visuais de cache e recalculo

### Gráficos Avançados
- Tipos variados de visualizações (barras, pizza, box plot, etc.)
- Cálculos estatísticos complexos (média, mediana, moda, desvio padrão)
- Lazy loading para gráficos pesados

### KPIs e Métricas
- Cálculo de KPIs avançados baseados em duração e atrasos
- Visualização em tempo real com indicadores de status
- Controle de qualidade dos dados

### Interatividade
- Botão de recalculo com animações
- Preferências de usuário para visualização
- Eventos de auditoria para rastreamento de uso

Com esta estrutura, a página /analytics terá todos os recursos necessários para funcionar eficazmente com um banco de dados Supabase, oferecendo um sistema avançado de análise de dados com visualizações gráficas, cálculos estatísticos complexos e sistema de cache eficiente.

# Análise Detalhada da PÁGINA /dashboard

## Visão Geral da Página
A página /dashboard é uma interface central de visualização de métricas e KPIs que permite:

1. Visualização de KPIs estatísticos avançados (média de produção, moda, mediana, desvio padrão)
2. Visualização de métricas complementares
3. Análise de performance individual dos membros da equipe (Critical Players)
4. Identificação de membros com mais atrasos, pior aproveitamento e mais refações
5. Geração de relatórios PDF com dados do dashboard
6. Apresentação de resumo executivo com principais indicadores
7. Visualização de próximas entregas e distribuição de prioridades

## Estrutura de Tabelas para Supabase

### Tabela: dashboard_metrics
- id (UUID, primary key)
- project_id (UUID, foreign key para projects.id)
- average_production (NUMERIC) # Média de produção em dias
- average_delay (NUMERIC) # Média de atraso em dias
- standard_deviation (NUMERIC) # Desvio padrão
- median (NUMERIC) # Mediana
- mode_value (NUMERIC) # Valor da moda
- mode_frequency (INTEGER) # Frequência da moda
- total_tasks (INTEGER)
- completed_tasks (INTEGER)
- project_completion_percentage (NUMERIC)
- tasks_on_time (INTEGER)
- tasks_delayed (INTEGER)
- calculated_at (TIMESTAMPTZ, default now())
- calculated_from_tasks (JSONB) # IDs das tarefas usadas para cálculo
- cache_key (TEXT, unique) # Chave para cache de métricas

### Tabela: user_performance_metrics
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- period_start (DATE, not null)
- period_end (DATE, not null)
- total_tasks_assigned (INTEGER, default 0)
- completed_tasks (INTEGER, default 0)
- delayed_tasks (INTEGER, default 0)
- refacao_tasks (INTEGER, default 0)
- completion_rate (NUMERIC) # (completed_tasks / total_tasks_assigned) * 100
- average_delay_days (NUMERIC)
- performance_score (NUMERIC) # Score calculado com base em múltiplas métricas
- created_at (TIMESTAMPTZ, default now())
- updated_at (TIMESTAMPTZ, default now())

### Tabela: dashboard_cache
- id (UUID, primary key)
- cache_key (TEXT, unique, not null) # CHAVE_COMPOSTA(project_id, periodo_inicio, periodo_fim)
- cache_type (TEXT, not null) # 'dashboard_metrics', 'critical_players', 'executive_summary'
- cached_data (JSONB) # Dados serializados do dashboard
- calculated_at (TIMESTAMPTZ, default now())
- expires_at (TIMESTAMPTZ, not null)
- calculated_from_tasks (JSONB) # IDs das tarefas usadas para cálculo
- processing_time_ms (INTEGER) # Tempo de processamento em milissegundos

### Tabela: dashboard_exports_log
- id (UUID, primary key)
- user_id (UUID, foreign key para users.id)
- project_id (UUID, foreign key para projects.id)
- export_format (TEXT, not null) # 'pdf'
- export_content_type (TEXT, not null) # 'executive_summary', 'full_report'
- kpi_included (JSONB) # KPIs incluídos no relatório
- exported_at (TIMESTAMPTZ, default now())
- file_path (TEXT) # Caminho do arquivo no storage (se aplicável)

### Tabela: critical_players_analytics
- id (UUID, primary key)
- analysis_period_start (DATE, not null)
- analysis_period_end (DATE, not null)
- worst_delay_player (TEXT) # Nome do jogador com mais atrasos
- worst_delay_count (INTEGER) # Quantidade de atrasos
- worst_completion_player (TEXT) # Nome do jogador com pior aproveitamento
- worst_completion_rate (NUMERIC) # Taxa de aproveitamento
- most_refacao_player (TEXT) # Nome do jogador com mais refações
- most_refacao_count (INTEGER) # Quantidade de refações
- analysis_date (DATE, default now())
- calculated_from_tasks (JSONB) # IDs das tarefas usadas para análise

### Tabela: upcoming_deliveries
- id (UUID, primary key)
- project_id (UUID, foreign key para projects.id)
- task_id (UUID, foreign key para tasks.id)
- delivery_date (DATE, not null)
- task_priority (TEXT) # 'baixa', 'media', 'alta', 'critica'
- task_title (TEXT, not null)
- assigned_to (UUID, foreign key para users.id)
- status (TEXT, default 'todo') # 'todo', 'in-progress', etc.
- is_urgent (BOOLEAN, default false) # Se está atrasada ou vence nos próximos 3 dias
- created_at (TIMESTAMPTZ, default now())

### Tabela: executive_summary_cache
- id (UUID, primary key)
- project_id (UUID, foreign key para projects.id)
- period_start (DATE, not null)
- period_end (DATE, not null)
- summary_data (JSONB) # Dados resumidos para o relatório executivo
- priority_distribution (JSONB) # Distribuição por prioridade
- upcoming_deliveries_preview (JSONB[]) # Prévia das próximas entregas
- observations (TEXT[]) # Observações geradas automaticamente
- calculated_at (TIMESTAMPTZ, default now())
- calculated_from_tasks (JSONB) # IDs das tarefas usadas para cálculo

## Funções do Supabase necessárias

### Funções de segurança (Row Level Security - RLS)
- Permitir que usuários acessem apenas dados de projetos nos quais têm permissão
- Controlar acesso a métricas de desempenho individuais baseado em permissões
- Restringir visualização de dados sensíveis de outros usuários

### Triggers
- Atualizar cache do dashboard quando tarefas forem alteradas
- Atualizar métricas de desempenho individual quando tarefas forem atualizadas
- Registrar eventos de exportação de relatórios

## Considerações para Supabase

1. **Índices**: Criar índices em campos frequentemente usados para cálculos de métricas
2. **Performance**: Implementar sistema de cache eficiente para cálculos pesados
3. **RLS (Row Level Security)**: Controle rigoroso de acesso baseado em papel e projeto
4. **Real-time**: Atualizações em tempo real quando os dados subjacentes mudarem
5. **Funções do lado do servidor**: Cálculo eficiente de estatísticas e KPIs complexos

## Chamadas de API necessárias para a página /dashboard

### Consultas
1. Obter métricas do dashboard (GET /api/dashboard/metrics)
2. Obter KPIs estatísticos (GET /api/dashboard/kpis)
3. Obter análise de Critical Players (GET /api/dashboard/critical-players)
4. Obter cache de dashboard (GET /api/dashboard/cache/:key)
5. Obter próximas entregas (GET /api/dashboard/upcoming-deliveries)

### Atualizações
1. Atualizar cache de dashboard (PUT /api/dashboard/cache)
2. Forçar recálculo de métricas (POST /api/dashboard/recalculate)
3. Registrar exportação de relatório (POST /api/dashboard/export-log)

### Exportação
1. Exportar relatório em PDF (GET /api/dashboard/export/pdf)

## Exemplo de chamadas do lado do cliente (usando Supabase JS)

```javascript
// Obter métricas do dashboard
const { data: metrics, error } = await supabase
  .from('dashboard_metrics')
  .select('*')
  .eq('project_id', projectId)
  .order('calculated_at', { ascending: false })
  .limit(1)
  .single()

// Obter análise de Critical Players
const { data: criticalPlayers, error } = await supabase
  .from('critical_players_analytics')
  .select('*')
  .order('analysis_date', { ascending: false })
  .limit(1)
  .single()

// Obter próximas entregas
const { data: upcomingDeliveries, error } = await supabase
  .from('upcoming_deliveries')
  .select(`
    *,
    assigned_user:assigned_to(name, avatar),
    task:task_id(title, status, priority)
  `)
  .eq('project_id', projectId)
  .gte('delivery_date', new Date().toISOString().split('T')[0])
  .order('delivery_date', { ascending: true })
  .limit(5)

// Obter cache de dashboard
const { data: cachedData, error } = await supabase
  .from('dashboard_cache')
  .select('cached_data, calculated_at')
  .eq('cache_key', `dashboard_project_${projectId}`)
  .single()

// Atualizar cache de dashboard
const { error } = await supabase.rpc('update_dashboard_cache', {
  project_id: projectId,
  user_id: userId
})

// Registrar exportação de relatório
const { error } = await supabase
  .from('dashboard_exports_log')
  .insert({
    user_id: userId,
    project_id: projectId,
    export_format: 'pdf',
    export_content_type: 'executive_summary',
    kpi_included: ['average_production', 'completion_rate', 'delay_metrics']
  })
```

## Considerações Específicas para a Página de Dashboard

### Caching e Performance
- Implementação de sistema de cache com TTL configurável
- Identificação de cache baseada em projeto e período
- Indicadores visuais de cache e recalculo

### Métricas Avançadas
- Cálculo de estatísticas complexas (média, mediana, moda, desvio padrão)
- Análise comparativa entre diferentes períodos
- Visualização de tendências

### Análise de Desempenho
- Identificação de membros com desempenho crítico
- Avaliação de aproveitamento individual
- Monitoramento de refações e qualidade

### Exportação de Relatórios
- Geração de relatórios PDF com dados do dashboard
- Inclusão de resumo executivo e análises específicas
- Histórico de exportações

Com esta estrutura, a página /dashboard terá todos os recursos necessários para funcionar eficazmente com um banco de dados Supabase, oferecendo um sistema completo de visualização de métricas e KPIs com análise de desempenho individual e geração de relatórios.