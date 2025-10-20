-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABELAS PRINCIPAIS DO SISTEMA
-- ============================================================================

-- Tabela principal de usuários (integrada com Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
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

-- Tabela de projetos
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    start_date DATE,
    deadline DATE
);

-- Tabela principal de tarefas
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'in-progress', 'completed', 'refacao')),
    priority TEXT DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'critica')),
    start_date DATE NOT NULL,
    end_date DATE,
    deadline DATE NOT NULL,
    duration_work_days INTEGER DEFAULT 0,
    delay_work_days INTEGER DEFAULT 0,
    on_time BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABELAS DE CONFIGURAÇÕES DE USUÁRIO
-- ============================================================================

-- Preferências do usuário
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_notifications_enabled BOOLEAN DEFAULT true,
    push_notifications_enabled BOOLEAN DEFAULT true,
    sms_notifications_enabled BOOLEAN DEFAULT false,
    notification_frequency TEXT DEFAULT 'immediate',
    privacy_level TEXT DEFAULT 'public',
    data_sharing_consent BOOLEAN DEFAULT false
);

-- Integrações do usuário
CREATE TABLE user_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL,
    integration_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Sessões do usuário
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_info JSONB,
    ip_address INET,
    login_at TIMESTAMPTZ DEFAULT NOW(),
    logout_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- Usuários bloqueados
CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    blocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELAS DE GAMIFICAÇÃO E RANKING
-- ============================================================================

-- Temporadas de jogadores
CREATE TABLE player_seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perfis de jogadores
CREATE TABLE player_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'team', 'private')),
    xp_visibility TEXT DEFAULT 'public' CHECK (xp_visibility IN ('public', 'team', 'private')),
    share_with_team BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de XP
CREATE TABLE xp_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason_type TEXT NOT NULL,
    reason_description TEXT,
    related_id TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missões
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- Rankings de usuários
CREATE TABLE user_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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
    season_id UUID REFERENCES player_seasons(id) ON DELETE SET NULL
);

-- Histórico de rankings
CREATE TABLE ranking_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_xp INTEGER,
    weekly_xp INTEGER,
    monthly_xp INTEGER,
    level INTEGER,
    position INTEGER,
    streak INTEGER,
    date_recorded DATE NOT NULL,
    season_id UUID REFERENCES player_seasons(id) ON DELETE SET NULL
);

-- Streaks de usuários
CREATE TABLE user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rankings por temporada
CREATE TABLE season_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    season_id UUID REFERENCES player_seasons(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    season_start_xp INTEGER DEFAULT 0,
    season_end_xp INTEGER,
    position INTEGER,
    tasks_completed INTEGER DEFAULT 0,
    missions_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELAS DE NOTIFICAÇÕES E ATIVIDADES
-- ============================================================================

-- Notificações de usuários
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('task', 'mission', 'achievement', 'warning', 'system')),
    is_read BOOLEAN DEFAULT false,
    xp_reward INTEGER,
    related_entity_type TEXT,
    related_entity_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Status de leitura de notificações
CREATE TABLE notification_read_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES user_notifications(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de atividades do usuário
CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    related_entity_type TEXT,
    related_entity_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELAS DE MÉTRICAS E ANALYTICS
-- ============================================================================

-- Métricas de produtividade do jogador
CREATE TABLE player_productivity_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    season_name TEXT NOT NULL,
    average_percent NUMERIC NOT NULL,
    total_considered INTEGER NOT NULL,
    delivery_distribution JSONB,
    tasks_breakdown JSONB[],
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    calculated_from_tasks JSONB
);

-- Métricas de desempenho do usuário
CREATE TABLE user_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- Histórico de estatísticas do jogador
CREATE TABLE player_stats_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_recorded DATE NOT NULL,
    level INTEGER,
    xp_total INTEGER,
    streak INTEGER,
    best_streak INTEGER,
    missions_completed INTEGER,
    tasks_completion_rate NUMERIC,
    average_task_xp NUMERIC
);

-- KPIs do sistema
CREATE TABLE kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    calculation_date DATE NOT NULL,
    calculated_from_tasks JSONB
);

-- Cálculos de KPIs
CREATE TABLE kpi_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Métricas do dashboard
CREATE TABLE dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
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

-- Analytics de Critical Players
CREATE TABLE critical_players_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Próximas entregas
CREATE TABLE upcoming_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    delivery_date DATE NOT NULL,
    task_priority TEXT CHECK (task_priority IN ('baixa', 'media', 'alta', 'critica')),
    task_title TEXT NOT NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'todo',
    is_urgent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELAS DE CACHE E PERFORMANCE
-- ============================================================================

-- Cache de analytics
CREATE TABLE analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT UNIQUE NOT NULL,
    chart_type TEXT NOT NULL CHECK (chart_type IN ('bar', 'pie', 'line', 'box_plot', 'distribution')),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    calculated_data JSONB,
    calculated_kpis JSONB,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    calculated_from_tasks JSONB,
    processing_time_ms INTEGER,
    cache_version INTEGER DEFAULT 1
);

-- Cache de rankings
CREATE TABLE ranking_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ranking_type TEXT NOT NULL CHECK (ranking_type IN ('weekly', 'monthly', 'total')),
    season_id UUID REFERENCES player_seasons(id) ON DELETE SET NULL,
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    expiration_at TIMESTAMPTZ NOT NULL,
    ranking_data JSONB,
    calculated_from_tasks JSONB
);

-- Cache do dashboard
CREATE TABLE dashboard_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT UNIQUE NOT NULL,
    cache_type TEXT NOT NULL CHECK (cache_type IN ('dashboard_metrics', 'critical_players', 'executive_summary')),
    cached_data JSONB,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    calculated_from_tasks JSONB,
    processing_time_ms INTEGER
);

-- Cache de gráficos de tarefas
CREATE TABLE task_charts_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chart_type TEXT NOT NULL CHECK (chart_type IN ('line', 'bar')),
    season_id UUID REFERENCES player_seasons(id) ON DELETE SET NULL,
    cached_data JSONB,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Cache de resumo executivo
CREATE TABLE executive_summary_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    summary_data JSONB,
    priority_distribution JSONB,
    upcoming_deliveries_preview JSONB[],
    observations TEXT[],
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    calculated_from_tasks JSONB
);

-- ============================================================================
-- TABELAS DE CONFIGURAÇÕES E PREFERÊNCIAS
-- ============================================================================

-- Configurações de gráficos
CREATE TABLE chart_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chart_name TEXT NOT NULL,
    chart_type TEXT NOT NULL,
    chart_config JSONB,
    is_global BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preferências de analytics
CREATE TABLE analytics_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    default_chart_type TEXT DEFAULT 'bar',
    time_range_preference TEXT DEFAULT 'last_month',
    show_cache_indicator BOOLEAN DEFAULT true,
    recalculation_frequency INTEGER DEFAULT 300,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Filtros de tarefas
CREATE TABLE task_filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filter_name TEXT NOT NULL,
    filter_type TEXT NOT NULL CHECK (filter_type IN ('quick', 'custom', 'saved')),
    filter_config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates de tarefas
CREATE TABLE task_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    template_config JSONB,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_global BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Widgets do dashboard
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    widget_type TEXT NOT NULL CHECK (widget_type IN ('kpi_summary', 'chart', 'metric_card', 'trend_indicator')),
    position_order INTEGER NOT NULL,
    configuration JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABELAS DE HISTÓRICO E AUDITORIA
-- ============================================================================

-- Atribuições de tarefas
CREATE TABLE task_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Histórico de tarefas
CREATE TABLE task_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários em tarefas
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    parent_comment_id UUID REFERENCES task_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estatísticas de tarefas
CREATE TABLE task_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID REFERENCES player_seasons(id) ON DELETE SET NULL,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    pending_tasks INTEGER DEFAULT 0,
    overdue_tasks INTEGER DEFAULT 0,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    calculated_from_tasks JSONB
);

-- ============================================================================
-- TABELAS DE LOGS E EVENTOS
-- ============================================================================

-- Log de atualizações de ranking
CREATE TABLE ranking_updates_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    triggered_by TEXT,
    trigger_details JSONB,
    users_affected INTEGER,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- Eventos de ranking
CREATE TABLE ranking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    related_entity_type TEXT,
    related_entity_id TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de eventos de analytics
CREATE TABLE analytics_events_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    chart_type TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de importações de tarefas
CREATE TABLE task_imports_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    total_imported INTEGER,
    success_count INTEGER,
    error_count INTEGER,
    import_errors JSONB,
    imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de exportações de tarefas
CREATE TABLE task_exports_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    export_format TEXT NOT NULL CHECK (export_format IN ('json', 'csv', 'pdf')),
    task_count INTEGER,
    exported_at TIMESTAMPTZ DEFAULT NOW(),
    file_path TEXT
);

-- Log de exportações do dashboard
CREATE TABLE dashboard_exports_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    export_format TEXT NOT NULL CHECK (export_format IN ('pdf')),
    export_content_type TEXT NOT NULL CHECK (export_content_type IN ('executive_summary', 'full_report')),
    kpi_included JSONB,
    exported_at TIMESTAMPTZ DEFAULT NOW(),
    file_path TEXT
);

-- Outliers estatísticos
CREATE TABLE statistical_outliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    outlier_type TEXT NOT NULL CHECK (outlier_type IN ('duration', 'delay', 'start_time', 'completion_time')),
    outlier_value NUMERIC,
    threshold_used NUMERIC,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para consultas frequentes
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

CREATE INDEX idx_user_rankings_user_id ON user_rankings(user_id);
CREATE INDEX idx_user_rankings_season_id ON user_rankings(season_id);
CREATE INDEX idx_user_rankings_position ON user_rankings(position);

CREATE INDEX idx_xp_history_user_id ON xp_history(user_id);
CREATE INDEX idx_xp_history_earned_at ON xp_history(earned_at);

CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_is_read ON user_notifications(is_read);

CREATE INDEX idx_analytics_cache_cache_key ON analytics_cache(cache_key);
CREATE INDEX idx_analytics_cache_expires_at ON analytics_cache(expires_at);

CREATE INDEX idx_dashboard_cache_cache_key ON dashboard_cache(cache_key);
CREATE INDEX idx_ranking_cache_ranking_type ON ranking_cache(ranking_type);

-- Índices compostos
CREATE INDEX idx_tasks_status_assigned ON tasks(status, assigned_to);
CREATE INDEX idx_tasks_deadline_status ON tasks(deadline, status);
CREATE INDEX idx_player_productivity_user_season ON player_productivity_metrics(user_id, season_name);

-- ============================================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Aplicar trigger de updated_at nas tabelas necessárias
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_player_profiles_updated_at BEFORE UPDATE ON player_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_integrations_updated_at BEFORE UPDATE ON user_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_season_rankings_updated_at BEFORE UPDATE ON season_rankings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_performance_metrics_updated_at BEFORE UPDATE ON user_performance_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chart_configurations_updated_at BEFORE UPDATE ON chart_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_preferences_updated_at BEFORE UPDATE ON analytics_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_filters_updated_at BEFORE UPDATE ON task_filters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_productivity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para usuários (podem acessar apenas seus próprios dados)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own integrations" ON user_integrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own blocked users" ON blocked_users FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own player profile" ON player_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notifications" ON user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own activity log" ON user_activity_log FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own productivity metrics" ON player_productivity_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own performance metrics" ON user_performance_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own stats history" ON player_stats_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own XP history" ON xp_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own missions" ON missions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rankings" ON user_rankings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own analytics preferences" ON analytics_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chart configurations" ON chart_configurations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own task filters" ON task_filters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own dashboard widgets" ON dashboard_widgets FOR ALL USING (auth.uid() = user_id);

-- Políticas para rankings (visíveis para todos)
CREATE POLICY "Rankings are publicly viewable" ON user_rankings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Ranking history is publicly viewable" ON ranking_history FOR SELECT TO authenticated USING (true);

-- Políticas para temporadas (visíveis para todos)
CREATE POLICY "Seasons are publicly viewable" ON player_seasons FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================

-- Inserir temporada padrão
INSERT INTO player_seasons (name, start_date, end_date, is_active) 
VALUES ('Temporada Atual', CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', true);

-- ============================================================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================================================

COMMENT ON TABLE users IS 'Tabela principal de usuários integrada com Supabase Auth';
COMMENT ON TABLE projects IS 'Projetos do sistema';
COMMENT ON TABLE tasks IS 'Tarefas dos projetos com métricas de performance';
COMMENT ON TABLE player_profiles IS 'Perfis de jogadores com dados de gamificação';
COMMENT ON TABLE user_rankings IS 'Rankings dos usuários baseados em XP';
COMMENT ON TABLE analytics_cache IS 'Cache para dados analíticos pesados';
COMMENT ON TABLE dashboard_metrics IS 'Métricas calculadas para o dashboard';
COMMENT ON TABLE kpi_calculations IS 'Cálculos de KPIs do sistema';

-- Verificar se todas as tabelas foram criadas
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;