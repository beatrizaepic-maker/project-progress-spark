import { supabase } from '@/lib/supabase';

// Interface para as configurações de produtividade
export interface ProductivityConfig {
  early: number;
  on_time: number;
  late: number;
  refacao: number;
}

// Interface para as configurações de temporada
export interface SeasonConfig {
  name: string;
  description: string;
  startIso: string;
  endIso: string;
}

// Interface para as configurações de missão
export interface MissionConfig {
  name: string;
  description: string;
  type: 
    | 'complete_tasks'           // Completar N tarefas
    | 'complete_early'           // Completar N tarefas adiantadas
    | 'attend_meetings'          // Participar de N reuniões
    | 'review_peer_tasks'        // Revisar N tarefas de colegas
    | 'streak_days'              // Manter sequência por N dias
    | 'no_delays'                // Não atrasar nenhuma tarefa
    | 'high_effort_tasks';       // Completar tarefas de alta dificuldade
  target: number;
  xpReward: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  start: string;
  end: string;
  continuous: boolean;
  active: boolean;
}

// Interface para as configurações de streak
export interface StreakConfig {
  dailyXp: number;
  enabled: boolean;
  includeTotal: boolean;
  includeWeekly: boolean;
  includeMonthly: boolean;
}

// Funções para buscar configurações do Supabase
export async function getProductivityConfig(): Promise<ProductivityConfig> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('config_value')
      .eq('config_key', 'productivity_config')
      .single();

    if (error) {
      // Se a tabela não existe, retorna valores padrão sem logar erro
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return {
          early: 110,
          on_time: 100,
          late: 50,
          refacao: 40
        };
      }
      console.warn('Erro ao buscar configurações de produtividade:', error);
      // Retorna valores padrão
      return {
        early: 110,
        on_time: 100,
        late: 50,
        refacao: 40
      };
    }

    // Supabase já retorna JSONB como objeto JS; não usar JSON.parse
    const cfg = (data?.config_value ?? null) as any;
    if (cfg && typeof cfg === 'object') {
      return cfg as ProductivityConfig;
    }
    return {
      early: 110,
      on_time: 100,
      late: 50,
      refacao: 40
    };
  } catch (error) {
    console.error('Erro ao parsear configurações de produtividade:', error);
    return {
      early: 110,
      on_time: 100,
      late: 50,
      refacao: 40
    };
  }
}

export async function getMissionList(): Promise<MissionConfig[]> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('config_value')
      .eq('config_key', 'mission_list')
      .single();

    if (error) {
      // Se a tabela não existe, retorna valores padrão sem logar erro
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return [];
      }
      console.warn('Erro ao buscar lista de missões:', error);
      return [];
    }

  // Supabase já retorna JSONB como objeto JS; não usar JSON.parse
  const list = (data?.config_value ?? null) as any;
  return Array.isArray(list) ? (list as MissionConfig[]) : [];
  } catch (error) {
    console.error('Erro ao parsear lista de missões:', error);
    return [];
  }
}

export async function getSeasonList(): Promise<SeasonConfig[]> {
  try {
    // Primeiro, tenta ler direto da tabela season_config (fonte de verdade)
    const { data, error } = await supabase
      .from('season_config')
      .select('id, name, description, start_iso, end_iso, season_name, start_date, end_date, config_data, updated_at, created_at')
      .order('start_iso', { ascending: true })
      .order('start_date', { ascending: true });

    if (!error && Array.isArray(data)) {
      const mapped = data.map((row: any) => {
        const name: string = row.name ?? row.season_name ?? row?.config_data?.name ?? '';
        const description: string = row.description ?? row?.config_data?.description ?? '';
        const startIso: string | undefined = row.start_iso
          ?? (row.start_date ? new Date(row.start_date).toISOString() : undefined)
          ?? row?.config_data?.startIso;
        const endIso: string | undefined = row.end_iso
          ?? (row.end_date ? new Date(row.end_date).toISOString() : undefined)
          ?? row?.config_data?.endIso;
        return {
          id: row.id,
          name,
          description,
          startIso: startIso || '',
          endIso: endIso || ''
        } as SeasonConfig;
      }).filter(s => s.name && s.startIso && s.endIso);
      return mapped;
    }

    // Fallback: se a tabela não existir ou erro específico, tenta system_settings (legado)
    if (error && (error.code === 'PGRST205' || error.code === '42P01')) {
      const legacy = await supabase
        .from('system_settings')
        .select('config_value')
        .eq('config_key', 'season_list')
        .single();
      if (legacy.error) return [];
      const list = (legacy.data?.config_value ?? null) as any;
      return Array.isArray(list) ? (list as SeasonConfig[]) : [];
    }

    console.warn('Erro ao buscar lista de temporadas:', error);
    return [];
  } catch (error) {
    console.error('Erro ao buscar lista de temporadas:', error);
    return [];
  }
}

export async function getStreakConfig(): Promise<StreakConfig> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('config_value')
      .eq('config_key', 'streak_config')
      .single();

    if (error) {
      // Se a tabela não existe, retorna valores padrão sem logar erro
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return {
          dailyXp: 5,
          enabled: true,
          includeTotal: true,
          includeWeekly: false,
          includeMonthly: false
        };
      }
      console.warn('Erro ao buscar configurações de streak:', error);
      // Retorna valores padrão
      return {
        dailyXp: 5,
        enabled: true,
        includeTotal: true,
        includeWeekly: false,
        includeMonthly: false
      };
    }

    // Supabase já retorna JSONB como objeto JS; não usar JSON.parse
    const cfg = (data?.config_value ?? null) as any;
    if (cfg && typeof cfg === 'object') {
      return cfg as StreakConfig;
    }
    return {
      dailyXp: 5,
      enabled: true,
      includeTotal: true,
      includeWeekly: false,
      includeMonthly: false
    };
  } catch (error) {
    console.error('Erro ao parsear configurações de streak:', error);
    return {
      dailyXp: 5,
      enabled: true,
      includeTotal: true,
      includeWeekly: false,
      includeMonthly: false
    };
  }
}

// Funções para salvar configurações no Supabase
export async function saveProductivityConfig(config: ProductivityConfig): Promise<void> {
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        config_key: 'productivity_config',
        config_value: JSON.stringify(config),
        updated_at: new Date().toISOString()
      }, { onConflict: 'config_key' });

    if (error) {
      console.error('Erro ao salvar configurações de produtividade:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar configurações de produtividade:', error);
    throw error;
  }
}

export async function saveMissionList(missions: MissionConfig[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        config_key: 'mission_list',
        config_value: JSON.stringify(missions),
        updated_at: new Date().toISOString()
      }, { onConflict: 'config_key' });

    if (error) {
      console.error('Erro ao salvar lista de missões:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar lista de missões:', error);
    throw error;
  }
}

export async function saveSeasonList(seasons: SeasonConfig[]): Promise<void> {
  try {
    if (!Array.isArray(seasons) || seasons.length === 0) return;

    // Prepara linhas para a tabela season_config (mantém compatibilidade com colunas legadas)
    const rows = seasons.map((s) => {
      // Gera id se não existir
      if (!s.id) {
        s.id = crypto.randomUUID();
      }
      
      const startDate = new Date(s.startIso);
      const endDate = new Date(s.endIso);
      return {
        id: s.id,
        name: s.name,
        description: s.description ?? null,
        start_iso: startDate.toISOString(),
        end_iso: endDate.toISOString(),
        is_active: true,
        updated_at: new Date().toISOString(),
        season_name: s.name,
        start_date: startDate.toISOString().slice(0, 10),
        end_date: endDate.toISOString().slice(0, 10)
      };
    });

    const { error } = await supabase
      .from('season_config')
      .upsert(rows, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Erro ao salvar lista de temporadas em season_config:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar lista de temporadas:', error);
    throw error;
  }
}

export async function saveStreakConfig(config: StreakConfig): Promise<void> {
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        config_key: 'streak_config',
        config_value: JSON.stringify(config),
        updated_at: new Date().toISOString()
      }, { onConflict: 'config_key' });

    if (error) {
      console.error('Erro ao salvar configurações de streak:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar configurações de streak:', error);
    throw error;
  }
}