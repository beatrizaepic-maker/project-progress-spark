export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_cache: {
        Row: {
          cache_key: string
          cache_version: number | null
          calculated_at: string | null
          calculated_data: Json | null
          calculated_from_tasks: Json | null
          calculated_kpis: Json | null
          chart_type: string
          expires_at: string
          id: string
          processing_time_ms: number | null
          project_id: string | null
        }
        Insert: {
          cache_key: string
          cache_version?: number | null
          calculated_at?: string | null
          calculated_data?: Json | null
          calculated_from_tasks?: Json | null
          calculated_kpis?: Json | null
          chart_type: string
          expires_at: string
          id?: string
          processing_time_ms?: number | null
          project_id?: string | null
        }
        Update: {
          cache_key?: string
          cache_version?: number | null
          calculated_at?: string | null
          calculated_data?: Json | null
          calculated_from_tasks?: Json | null
          calculated_kpis?: Json | null
          chart_type?: string
          expires_at?: string
          id?: string
          processing_time_ms?: number | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_cache_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events_log: {
        Row: {
          chart_type: string | null
          created_at: string | null
          event_details: Json | null
          event_type: string
          id: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          chart_type?: string | null
          created_at?: string | null
          event_details?: Json | null
          event_type: string
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          chart_type?: string | null
          created_at?: string | null
          event_details?: Json | null
          event_type?: string
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_preferences: {
        Row: {
          created_at: string | null
          default_chart_type: string | null
          id: string
          recalculation_frequency: number | null
          show_cache_indicator: boolean | null
          time_range_preference: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          default_chart_type?: string | null
          id?: string
          recalculation_frequency?: number | null
          show_cache_indicator?: boolean | null
          time_range_preference?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          default_chart_type?: string | null
          id?: string
          recalculation_frequency?: number | null
          show_cache_indicator?: boolean | null
          time_range_preference?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_users: {
        Row: {
          blocked_at: string | null
          blocked_user_id: string | null
          id: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          blocked_at?: string | null
          blocked_user_id?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          blocked_at?: string | null
          blocked_user_id?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_configurations: {
        Row: {
          chart_config: Json | null
          chart_name: string
          chart_type: string
          created_at: string | null
          id: string
          is_global: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chart_config?: Json | null
          chart_name: string
          chart_type: string
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chart_config?: Json | null
          chart_name?: string
          chart_type?: string
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_configurations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      critical_players_analytics: {
        Row: {
          analysis_date: string | null
          analysis_period_end: string
          analysis_period_start: string
          calculated_from_tasks: Json | null
          id: string
          most_refacao_count: number | null
          most_refacao_player: string | null
          worst_completion_player: string | null
          worst_completion_rate: number | null
          worst_delay_count: number | null
          worst_delay_player: string | null
        }
        Insert: {
          analysis_date?: string | null
          analysis_period_end: string
          analysis_period_start: string
          calculated_from_tasks?: Json | null
          id?: string
          most_refacao_count?: number | null
          most_refacao_player?: string | null
          worst_completion_player?: string | null
          worst_completion_rate?: number | null
          worst_delay_count?: number | null
          worst_delay_player?: string | null
        }
        Update: {
          analysis_date?: string | null
          analysis_period_end?: string
          analysis_period_start?: string
          calculated_from_tasks?: Json | null
          id?: string
          most_refacao_count?: number | null
          most_refacao_player?: string | null
          worst_completion_player?: string | null
          worst_completion_rate?: number | null
          worst_delay_count?: number | null
          worst_delay_player?: string | null
        }
        Relationships: []
      }
      dashboard_cache: {
        Row: {
          cache_key: string
          cache_type: string
          cached_data: Json | null
          calculated_at: string | null
          calculated_from_tasks: Json | null
          expires_at: string
          id: string
          processing_time_ms: number | null
        }
        Insert: {
          cache_key: string
          cache_type: string
          cached_data?: Json | null
          calculated_at?: string | null
          calculated_from_tasks?: Json | null
          expires_at: string
          id?: string
          processing_time_ms?: number | null
        }
        Update: {
          cache_key?: string
          cache_type?: string
          cached_data?: Json | null
          calculated_at?: string | null
          calculated_from_tasks?: Json | null
          expires_at?: string
          id?: string
          processing_time_ms?: number | null
        }
        Relationships: []
      }
      dashboard_exports_log: {
        Row: {
          export_content_type: string
          export_format: string
          exported_at: string | null
          file_path: string | null
          id: string
          kpi_included: Json | null
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          export_content_type: string
          export_format: string
          exported_at?: string | null
          file_path?: string | null
          id?: string
          kpi_included?: Json | null
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          export_content_type?: string
          export_format?: string
          exported_at?: string | null
          file_path?: string | null
          id?: string
          kpi_included?: Json | null
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_exports_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_exports_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_metrics: {
        Row: {
          average_delay: number | null
          average_production: number | null
          cache_key: string | null
          calculated_at: string | null
          calculated_from_tasks: Json | null
          completed_tasks: number | null
          id: string
          median: number | null
          mode_frequency: number | null
          mode_value: number | null
          project_completion_percentage: number | null
          project_id: string | null
          standard_deviation: number | null
          tasks_delayed: number | null
          tasks_on_time: number | null
          total_tasks: number | null
        }
        Insert: {
          average_delay?: number | null
          average_production?: number | null
          cache_key?: string | null
          calculated_at?: string | null
          calculated_from_tasks?: Json | null
          completed_tasks?: number | null
          id?: string
          median?: number | null
          mode_frequency?: number | null
          mode_value?: number | null
          project_completion_percentage?: number | null
          project_id?: string | null
          standard_deviation?: number | null
          tasks_delayed?: number | null
          tasks_on_time?: number | null
          total_tasks?: number | null
        }
        Update: {
          average_delay?: number | null
          average_production?: number | null
          cache_key?: string | null
          calculated_at?: string | null
          calculated_from_tasks?: Json | null
          completed_tasks?: number | null
          id?: string
          median?: number | null
          mode_frequency?: number | null
          mode_value?: number | null
          project_completion_percentage?: number | null
          project_id?: string | null
          standard_deviation?: number | null
          tasks_delayed?: number | null
          tasks_on_time?: number | null
          total_tasks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widgets: {
        Row: {
          configuration: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          position_order: number
          updated_at: string | null
          user_id: string | null
          widget_type: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position_order: number
          updated_at?: string | null
          user_id?: string | null
          widget_type: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position_order?: number
          updated_at?: string | null
          user_id?: string | null
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_summary_cache: {
        Row: {
          calculated_at: string | null
          calculated_from_tasks: Json | null
          id: string
          observations: string[] | null
          period_end: string
          period_start: string
          priority_distribution: Json | null
          project_id: string | null
          summary_data: Json | null
          upcoming_deliveries_preview: Json[] | null
        }
        Insert: {
          calculated_at?: string | null
          calculated_from_tasks?: Json | null
          id?: string
          observations?: string[] | null
          period_end: string
          period_start: string
          priority_distribution?: Json | null
          project_id?: string | null
          summary_data?: Json | null
          upcoming_deliveries_preview?: Json[] | null
        }
        Update: {
          calculated_at?: string | null
          calculated_from_tasks?: Json | null
          id?: string
          observations?: string[] | null
          period_end?: string
          period_start?: string
          priority_distribution?: Json | null
          project_id?: string | null
          summary_data?: Json | null
          upcoming_deliveries_preview?: Json[] | null
        }
        Relationships: [
          {
            foreignKeyName: "executive_summary_cache_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kpi_calculations: {
        Row: {
          average_production: number | null
          calculated_at: string | null
          calculated_from_tasks: Json | null
          calculation_id: string
          calculation_metadata: Json | null
          calculation_version: string
          data_hash: string | null
          data_quality_score: number | null
          id: string
          median: number | null
          mode_frequency: number | null
          mode_value: number | null
          standard_deviation: number | null
          tasks_delayed: number | null
          tasks_on_time: number | null
          total_tasks: number | null
        }
        Insert: {
          average_production?: number | null
          calculated_at?: string | null
          calculated_from_tasks?: Json | null
          calculation_id: string
          calculation_metadata?: Json | null
          calculation_version: string
          data_hash?: string | null
          data_quality_score?: number | null
          id?: string
          median?: number | null
          mode_frequency?: number | null
          mode_value?: number | null
          standard_deviation?: number | null
          tasks_delayed?: number | null
          tasks_on_time?: number | null
          total_tasks?: number | null
        }
        Update: {
          average_production?: number | null
          calculated_at?: string | null
          calculated_from_tasks?: Json | null
          calculation_id?: string
          calculation_metadata?: Json | null
          calculation_version?: string
          data_hash?: string | null
          data_quality_score?: number | null
          id?: string
          median?: number | null
          mode_frequency?: number | null
          mode_value?: number | null
          standard_deviation?: number | null
          tasks_delayed?: number | null
          tasks_on_time?: number | null
          total_tasks?: number | null
        }
        Relationships: []
      }
      kpis: {
        Row: {
          calculated_from_tasks: Json | null
          calculation_date: string
          id: string
          metric_name: string
          metric_value: number
          project_id: string | null
        }
        Insert: {
          calculated_from_tasks?: Json | null
          calculation_date: string
          id?: string
          metric_name: string
          metric_value: number
          project_id?: string | null
        }
        Update: {
          calculated_from_tasks?: Json | null
          calculation_date?: string
          id?: string
          metric_name?: string
          metric_value?: number
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          config_id: string
          created_at: string | null
          current_progress: number | null
          deadline: string | null
          description: string | null
          id: string
          name: string
          target: number
          user_id: string | null
          xp_reward: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          config_id: string
          created_at?: string | null
          current_progress?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          target: number
          user_id?: string | null
          xp_reward?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          config_id?: string
          created_at?: string | null
          current_progress?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          target?: number
          user_id?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_read_status: {
        Row: {
          id: string
          notification_id: string | null
          read_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          notification_id?: string | null
          read_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          notification_id?: string | null
          read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_read_status_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "user_notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_read_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      player_productivity_metrics: {
        Row: {
          average_percent: number
          calculated_at: string | null
          calculated_from_tasks: Json | null
          delivery_distribution: Json | null
          id: string
          season_name: string
          tasks_breakdown: Json[] | null
          total_considered: number
          user_id: string | null
        }
        Insert: {
          average_percent: number
          calculated_at?: string | null
          calculated_from_tasks?: Json | null
          delivery_distribution?: Json | null
          id?: string
          season_name: string
          tasks_breakdown?: Json[] | null
          total_considered: number
          user_id?: string | null
        }
        Update: {
          average_percent?: number
          calculated_at?: string | null
          calculated_from_tasks?: Json | null
          delivery_distribution?: Json | null
          id?: string
          season_name?: string
          tasks_breakdown?: Json[] | null
          total_considered?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_productivity_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      player_profiles: {
        Row: {
          avatar: string | null
          average_task_xp: number | null
          best_streak: number | null
          created_at: string | null
          id: string
          joined_date: string | null
          level: number | null
          missions_completed: number | null
          name: string
          profile_visibility: string | null
          role: string | null
          share_with_team: boolean | null
          streak: number | null
          tasks_completion_rate: number | null
          theme: string | null
          updated_at: string | null
          user_id: string | null
          xp_visibility: string | null
        }
        Insert: {
          avatar?: string | null
          average_task_xp?: number | null
          best_streak?: number | null
          created_at?: string | null
          id?: string
          joined_date?: string | null
          level?: number | null
          missions_completed?: number | null
          name: string
          profile_visibility?: string | null
          role?: string | null
          share_with_team?: boolean | null
          streak?: number | null
          tasks_completion_rate?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
          xp_visibility?: string | null
        }
        Update: {
          avatar?: string | null
          average_task_xp?: number | null
          best_streak?: number | null
          created_at?: string | null
          id?: string
          joined_date?: string | null
          level?: number | null
          missions_completed?: number | null
          name?: string
          profile_visibility?: string | null
          role?: string | null
          share_with_team?: boolean | null
          streak?: number | null
          tasks_completion_rate?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
          xp_visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      player_seasons: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      player_stats_history: {
        Row: {
          average_task_xp: number | null
          best_streak: number | null
          date_recorded: string
          id: string
          level: number | null
          missions_completed: number | null
          streak: number | null
          tasks_completion_rate: number | null
          user_id: string | null
          xp_total: number | null
        }
        Insert: {
          average_task_xp?: number | null
          best_streak?: number | null
          date_recorded: string
          id?: string
          level?: number | null
          missions_completed?: number | null
          streak?: number | null
          tasks_completion_rate?: number | null
          user_id?: string | null
          xp_total?: number | null
        }
        Update: {
          average_task_xp?: number | null
          best_streak?: number | null
          date_recorded?: string
          id?: string
          level?: number | null
          missions_completed?: number | null
          streak?: number | null
          tasks_completion_rate?: number | null
          user_id?: string | null
          xp_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          created_by: string | null
          deadline: string | null
          description: string | null
          id: string
          name: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_cache: {
        Row: {
          cached_at: string | null
          calculated_from_tasks: Json | null
          expiration_at: string
          id: string
          ranking_data: Json | null
          ranking_type: string
          season_id: string | null
        }
        Insert: {
          cached_at?: string | null
          calculated_from_tasks?: Json | null
          expiration_at: string
          id?: string
          ranking_data?: Json | null
          ranking_type: string
          season_id?: string | null
        }
        Update: {
          cached_at?: string | null
          calculated_from_tasks?: Json | null
          expiration_at?: string
          id?: string
          ranking_data?: Json | null
          ranking_type?: string
          season_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ranking_cache_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "player_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json | null
          related_entity_id: string | null
          related_entity_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ranking_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_history: {
        Row: {
          date_recorded: string
          id: string
          level: number | null
          monthly_xp: number | null
          position: number | null
          season_id: string | null
          streak: number | null
          total_xp: number | null
          user_id: string | null
          weekly_xp: number | null
        }
        Insert: {
          date_recorded: string
          id?: string
          level?: number | null
          monthly_xp?: number | null
          position?: number | null
          season_id?: string | null
          streak?: number | null
          total_xp?: number | null
          user_id?: string | null
          weekly_xp?: number | null
        }
        Update: {
          date_recorded?: string
          id?: string
          level?: number | null
          monthly_xp?: number | null
          position?: number | null
          season_id?: string | null
          streak?: number | null
          total_xp?: number | null
          user_id?: string | null
          weekly_xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ranking_history_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "player_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_updates_log: {
        Row: {
          duration_ms: number | null
          end_time: string | null
          error_message: string | null
          id: string
          start_time: string | null
          success: boolean | null
          trigger_details: Json | null
          triggered_by: string | null
          users_affected: number | null
        }
        Insert: {
          duration_ms?: number | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          start_time?: string | null
          success?: boolean | null
          trigger_details?: Json | null
          triggered_by?: string | null
          users_affected?: number | null
        }
        Update: {
          duration_ms?: number | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          start_time?: string | null
          success?: boolean | null
          trigger_details?: Json | null
          triggered_by?: string | null
          users_affected?: number | null
        }
        Relationships: []
      }
      season_config: {
        Row: {
          config_data: Json | null
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          season_name: string
          start_date: string
          updated_at: string | null
          xp_multiplier: number | null
        }
        Insert: {
          config_data?: Json | null
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          season_name: string
          start_date: string
          updated_at?: string | null
          xp_multiplier?: number | null
        }
        Update: {
          config_data?: Json | null
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          season_name?: string
          start_date?: string
          updated_at?: string | null
          xp_multiplier?: number | null
        }
        Relationships: []
      }
      season_rankings: {
        Row: {
          created_at: string | null
          id: string
          missions_completed: number | null
          position: number | null
          season_end_xp: number | null
          season_id: string | null
          season_start_xp: number | null
          tasks_completed: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          missions_completed?: number | null
          position?: number | null
          season_end_xp?: number | null
          season_id?: string | null
          season_start_xp?: number | null
          tasks_completed?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          missions_completed?: number | null
          position?: number | null
          season_end_xp?: number | null
          season_id?: string | null
          season_start_xp?: number | null
          tasks_completed?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "season_rankings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "player_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_rankings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      statistical_outliers: {
        Row: {
          calculated_at: string | null
          id: string
          outlier_type: string
          outlier_value: number | null
          severity: string | null
          task_id: string | null
          threshold_used: number | null
        }
        Insert: {
          calculated_at?: string | null
          id?: string
          outlier_type: string
          outlier_value?: number | null
          severity?: string | null
          task_id?: string | null
          threshold_used?: number | null
        }
        Update: {
          calculated_at?: string | null
          id?: string
          outlier_type?: string
          outlier_value?: number | null
          severity?: string | null
          task_id?: string | null
          threshold_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "statistical_outliers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_awards: {
        Row: {
          award_type: string | null
          created_at: string | null
          date: string
          id: string
          streak_days: number
          user_id: string | null
          xp: number
        }
        Insert: {
          award_type?: string | null
          created_at?: string | null
          date: string
          id?: string
          streak_days?: number
          user_id?: string | null
          xp?: number
        }
        Update: {
          award_type?: string | null
          created_at?: string | null
          date?: string
          id?: string
          streak_days?: number
          user_id?: string | null
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "streak_awards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_charts_cache: {
        Row: {
          cached_data: Json | null
          calculated_at: string | null
          chart_type: string
          expires_at: string
          id: string
          season_id: string | null
        }
        Insert: {
          cached_data?: Json | null
          calculated_at?: string | null
          chart_type: string
          expires_at: string
          id?: string
          season_id?: string | null
        }
        Update: {
          cached_data?: Json | null
          calculated_at?: string | null
          chart_type?: string
          expires_at?: string
          id?: string
          season_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_charts_cache_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "player_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          task_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "task_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_exports_log: {
        Row: {
          export_format: string
          exported_at: string | null
          file_path: string | null
          id: string
          task_count: number | null
          user_id: string | null
        }
        Insert: {
          export_format: string
          exported_at?: string | null
          file_path?: string | null
          id?: string
          task_count?: number | null
          user_id?: string | null
        }
        Update: {
          export_format?: string
          exported_at?: string | null
          file_path?: string | null
          id?: string
          task_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_exports_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_filters: {
        Row: {
          created_at: string | null
          filter_config: Json | null
          filter_name: string
          filter_type: string
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filter_config?: Json | null
          filter_name: string
          filter_type: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filter_config?: Json | null
          filter_name?: string
          filter_type?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_filters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_imports_log: {
        Row: {
          error_count: number | null
          filename: string
          id: string
          import_errors: Json | null
          imported_at: string | null
          success_count: number | null
          total_imported: number | null
          user_id: string | null
        }
        Insert: {
          error_count?: number | null
          filename: string
          id?: string
          import_errors?: Json | null
          imported_at?: string | null
          success_count?: number | null
          total_imported?: number | null
          user_id?: string | null
        }
        Update: {
          error_count?: number | null
          filename?: string
          id?: string
          import_errors?: Json | null
          imported_at?: string | null
          success_count?: number | null
          total_imported?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_imports_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_statistics: {
        Row: {
          calculated_at: string | null
          calculated_from_tasks: Json | null
          completed_tasks: number | null
          id: string
          overdue_tasks: number | null
          pending_tasks: number | null
          season_id: string | null
          total_tasks: number | null
        }
        Insert: {
          calculated_at?: string | null
          calculated_from_tasks?: Json | null
          completed_tasks?: number | null
          id?: string
          overdue_tasks?: number | null
          pending_tasks?: number | null
          season_id?: string | null
          total_tasks?: number | null
        }
        Update: {
          calculated_at?: string | null
          calculated_from_tasks?: Json | null
          completed_tasks?: number | null
          id?: string
          overdue_tasks?: number | null
          pending_tasks?: number | null
          season_id?: string | null
          total_tasks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "task_statistics_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "player_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_global: boolean | null
          name: string
          template_config: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_global?: boolean | null
          name: string
          template_config?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_global?: boolean | null
          name?: string
          template_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          deadline: string
          delay_work_days: number | null
          description: string | null
          duration_work_days: number | null
          end_date: string | null
          id: string
          on_time: boolean | null
          priority: string | null
          project_id: string | null
          start_date: string
          status: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          deadline: string
          delay_work_days?: number | null
          description?: string | null
          duration_work_days?: number | null
          end_date?: string | null
          id?: string
          on_time?: boolean | null
          priority?: string | null
          project_id?: string | null
          start_date: string
          status?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          deadline?: string
          delay_work_days?: number | null
          description?: string | null
          duration_work_days?: number | null
          end_date?: string | null
          id?: string
          on_time?: boolean | null
          priority?: string | null
          project_id?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      upcoming_deliveries: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          delivery_date: string
          id: string
          is_urgent: boolean | null
          project_id: string | null
          status: string | null
          task_id: string | null
          task_priority: string | null
          task_title: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          delivery_date: string
          id?: string
          is_urgent?: boolean | null
          project_id?: string | null
          status?: string | null
          task_id?: string | null
          task_priority?: string | null
          task_title: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          delivery_date?: string
          id?: string
          is_urgent?: boolean | null
          project_id?: string | null
          status?: string | null
          task_id?: string | null
          task_priority?: string | null
          task_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "upcoming_deliveries_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_deliveries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upcoming_deliveries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_access_log: {
        Row: {
          access_type: string
          accessed_at: string | null
          device_info: Json | null
          id: string
          ip_address: unknown | null
          location_info: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_type?: string
          accessed_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown | null
          location_info?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown | null
          location_info?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_access_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_app_states: {
        Row: {
          id: string
          last_updated: string | null
          state_key: string
          state_value: Json | null
          user_id: string | null
        }
        Insert: {
          id?: string
          last_updated?: string | null
          state_key: string
          state_value?: Json | null
          user_id?: string | null
        }
        Update: {
          id?: string
          last_updated?: string | null
          state_key?: string
          state_value?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_app_states_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_integrations: {
        Row: {
          access_token: string | null
          created_at: string | null
          id: string
          integration_id: string
          integration_type: string
          is_active: boolean | null
          refresh_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          integration_id: string
          integration_type: string
          is_active?: boolean | null
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          integration_id?: string
          integration_type?: string
          is_active?: boolean | null
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string | null
          xp_reward: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id?: string | null
          xp_reward?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_performance_metrics: {
        Row: {
          average_delay_days: number | null
          completed_tasks: number | null
          completion_rate: number | null
          created_at: string | null
          delayed_tasks: number | null
          id: string
          performance_score: number | null
          period_end: string
          period_start: string
          refacao_tasks: number | null
          total_tasks_assigned: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          average_delay_days?: number | null
          completed_tasks?: number | null
          completion_rate?: number | null
          created_at?: string | null
          delayed_tasks?: number | null
          id?: string
          performance_score?: number | null
          period_end: string
          period_start: string
          refacao_tasks?: number | null
          total_tasks_assigned?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          average_delay_days?: number | null
          completed_tasks?: number | null
          completion_rate?: number | null
          created_at?: string | null
          delayed_tasks?: number | null
          id?: string
          performance_score?: number | null
          period_end?: string
          period_start?: string
          refacao_tasks?: number | null
          total_tasks_assigned?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_performance_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          data_sharing_consent: boolean | null
          email_notifications_enabled: boolean | null
          id: string
          notification_frequency: string | null
          preferences: Json | null
          privacy_level: string | null
          push_notifications_enabled: boolean | null
          sms_notifications_enabled: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          data_sharing_consent?: boolean | null
          email_notifications_enabled?: boolean | null
          id?: string
          notification_frequency?: string | null
          preferences?: Json | null
          privacy_level?: string | null
          push_notifications_enabled?: boolean | null
          sms_notifications_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          data_sharing_consent?: boolean | null
          email_notifications_enabled?: boolean | null
          id?: string
          notification_frequency?: string | null
          preferences?: Json | null
          privacy_level?: string | null
          push_notifications_enabled?: boolean | null
          sms_notifications_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rankings: {
        Row: {
          calculated_at: string | null
          consistency_bonus: number | null
          id: string
          last_updated: string | null
          level: number | null
          missions_completed: number | null
          monthly_xp: number | null
          position: number | null
          season_id: string | null
          streak: number | null
          total_xp: number | null
          user_id: string | null
          weekly_xp: number | null
        }
        Insert: {
          calculated_at?: string | null
          consistency_bonus?: number | null
          id?: string
          last_updated?: string | null
          level?: number | null
          missions_completed?: number | null
          monthly_xp?: number | null
          position?: number | null
          season_id?: string | null
          streak?: number | null
          total_xp?: number | null
          user_id?: string | null
          weekly_xp?: number | null
        }
        Update: {
          calculated_at?: string | null
          consistency_bonus?: number | null
          id?: string
          last_updated?: string | null
          level?: number | null
          missions_completed?: number | null
          monthly_xp?: number | null
          position?: number | null
          season_id?: string | null
          streak?: number | null
          total_xp?: number | null
          user_id?: string | null
          weekly_xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_rankings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "player_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rankings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          device_info: Json | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          login_at: string | null
          logout_at: string | null
          user_id: string | null
        }
        Insert: {
          device_info?: Json | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          login_at?: string | null
          logout_at?: string | null
          user_id?: string | null
        }
        Update: {
          device_info?: Json | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          login_at?: string | null
          logout_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          best_streak: number | null
          created_at: string | null
          current_streak: number | null
          id: string
          last_active_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          best_streak?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          best_streak?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          language_preference: string | null
          role: string | null
          theme_preference: string | null
          timezone: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          language_preference?: string | null
          role?: string | null
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          language_preference?: string | null
          role?: string | null
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      xp_history: {
        Row: {
          amount: number
          earned_at: string | null
          id: string
          player_id: string | null
          reason_description: string | null
          reason_type: string
          related_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          earned_at?: string | null
          id?: string
          player_id?: string | null
          reason_description?: string | null
          reason_type: string
          related_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          earned_at?: string | null
          id?: string
          player_id?: string | null
          reason_description?: string | null
          reason_type?: string
          related_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xp_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      armor: {
        Args: { "": string }
        Returns: string
      }
      dearmor: {
        Args: { "": string }
        Returns: string
      }
      gen_random_bytes: {
        Args: { "": number }
        Returns: string
      }
      gen_random_uuid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      gen_salt: {
        Args: { "": string }
        Returns: string
      }
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      pgp_key_id: {
        Args: { "": string }
        Returns: string
      }
      uuid_generate_v1: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_generate_v1mc: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_generate_v3: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_generate_v4: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_generate_v5: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_nil: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_ns_dns: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_ns_oid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_ns_url: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uuid_ns_x500: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
