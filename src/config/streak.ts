// src/config/streak.ts
// Configuração e registro do bônus diário de login (streak)

import { supabase } from '@/lib/supabase';

export interface StreakAwardEntry {
  user_id: string;
  date: string; // YYYY-MM-DD
  xp: number;
}

interface StreakState {
  dailyBonusXp: number;
  enabled: boolean;
  includeIn: { total: boolean; weekly: boolean; monthly: boolean };
  awards: StreakAwardEntry[];
}

const STREAK_CONFIG_TABLE = 'streak_config';
const STREAK_AWARDS_TABLE = 'streak_awards';

const DEFAULTS = {
  dailyBonusXp: 10,
  enabled: true,
  includeIn: { total: true, weekly: true, monthly: true },
};

  async function loadConfig(): Promise<StreakState> {
    try {
      const { data, error } = await supabase
        .from(STREAK_CONFIG_TABLE)
        .select('config_key, config_value');

      if (error) {
        console.warn('Erro ao carregar configuração de streak, usando padrões:', error);
        return { ...DEFAULTS, awards: [] } as StreakState;
      }

      if (!data || data.length === 0) {
        // Configuração não encontrada, usar padrões
        return { ...DEFAULTS, awards: [] } as StreakState;
      }

      // Converter dados da tabela em objeto de configuração
      const config: any = {};
      data.forEach(item => {
        config[item.config_key] = item.config_value;
      });

      // Básica validação e merge com defaults
      return {
        dailyBonusXp: typeof config.daily_login_xp === 'string' ? parseInt(config.daily_login_xp) : DEFAULTS.dailyBonusXp,
        enabled: true, // Sempre habilitado por padrão
        includeIn: DEFAULTS.includeIn, // Usar defaults por enquanto
        awards: []
      } as StreakState;
    } catch (error) {
      console.warn('Erro inesperado ao carregar configuração de streak:', error);
      return { ...DEFAULTS, awards: [] } as StreakState;
    }
  }

async function loadAwards(): Promise<StreakAwardEntry[]> {
  try {
    const { data, error } = await supabase
      .from(STREAK_AWARDS_TABLE)
      .select('*');
    
    if (error) {
      console.warn('Erro ao carregar prêmios de streak, retornando vazio:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro inesperado ao carregar prêmios de streak:', error);
    return [];
  }
}

async function saveConfig(config: Omit<StreakState, 'awards'>) {
  try {
    const { error } = await supabase
      .from(STREAK_CONFIG_TABLE)
      .upsert({ id: 1, ...config }, { onConflict: 'id' });
    
    if (error) {
      console.error('Erro ao salvar configuração de streak:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro inesperado ao salvar configuração de streak:', error);
    throw error;
  }
}

async function saveAward(award: StreakAwardEntry) {
  try {
    const { error } = await supabase
      .from(STREAK_AWARDS_TABLE)
      .insert([award]);

    if (error) {
      console.error('Erro ao salvar prêmio de streak:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro inesperado ao salvar prêmio de streak:', error);
    throw error;
  }
}

export async function getDailyStreakBonusXp(): Promise<number> {
  const config = await loadConfig();
  return config.dailyBonusXp;
}

export async function setDailyStreakBonusXp(xp: number) {
  const config = await loadConfig();
  const safe = Math.max(0, Math.round(xp));
  config.dailyBonusXp = safe;
  await saveConfig(config);
}

export async function isStreakEnabled(): Promise<boolean> {
  const config = await loadConfig();
  return config.enabled;
}

export async function setStreakEnabled(enabled: boolean) {
  const config = await loadConfig();
  config.enabled = !!enabled;
  await saveConfig(config);
}

export async function getStreakIncludeIn(): Promise<{ total: boolean; weekly: boolean; monthly: boolean }> {
  const config = await loadConfig();
  return config.includeIn;
}

export async function setStreakIncludeIn(includeIn: Partial<{ total: boolean; weekly: boolean; monthly: boolean }>) {
  const config = await loadConfig();
  config.includeIn = { ...config.includeIn, ...includeIn };
  await saveConfig(config);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function addStreakAwardIfNeeded(userId: string): Promise<{ awarded: boolean; xp: number }> {
  const config = await loadConfig();
  if (!config.enabled) return { awarded: false, xp: 0 };
  
  const today = formatDate(new Date());
  
  // Verificar se já existe um prêmio para este usuário hoje
  try {
    const { data, error } = await supabase
      .from(STREAK_AWARDS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    if (data) {
      // O usuário já recebeu o prêmio hoje
      return { awarded: false, xp: data.xp };
    }
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Erro ao verificar prêmio de streak existente:', error);
    }
  } catch (error) {
    console.error('Erro inesperado ao verificar prêmio de streak existente:', error);
  }
  
  // Adicionar novo prêmio
  const xp = config.dailyBonusXp;
  try {
    await saveAward({ user_id: userId, date: today, xp });
    return { awarded: true, xp };
  } catch (error) {
    console.error('Erro ao adicionar prêmio de streak:', error);
    return { awarded: false, xp: 0 };
  }
}

export async function getUserStreakAwards(userId: string): Promise<StreakAwardEntry[]> {
  try {
    const { data, error } = await supabase
      .from(STREAK_AWARDS_TABLE)
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Erro ao carregar prêmios de streak do usuário:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro inesperado ao carregar prêmios de streak do usuário:', error);
    return [];
  }
}

export async function getUserStreakXpLifetime(userId: string): Promise<number> {
  const awards = await getUserStreakAwards(userId);
  return awards.reduce((acc, a) => acc + a.xp, 0);
}

export async function getUserStreakXpThisWeek(userId: string): Promise<number> {
  const awards = await getUserStreakAwards(userId);
  const today = new Date();
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - today.getDay());
  firstDay.setHours(0, 0, 0, 0);
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);
  return awards
    .map(a => new Date(a.date))
    .filter(d => d >= firstDay && d <= lastDay)
    .reduce((acc, _, idx, arr) => acc + awards[idx].xp, 0);
}

export async function getUserStreakXpThisMonth(userId: string): Promise<number> {
  const awards = await getUserStreakAwards(userId);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  return awards
    .filter(a => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce((acc, a) => acc + a.xp, 0);
}
