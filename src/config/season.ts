// src/config/season.ts
// Configuração de Temporadas (Nome, Descrição, Período)

import { supabase } from '@/lib/supabase';

export type SeasonConfig = {
  id?: string;
  name: string;
  description: string;
  startIso: string; // ISO string (inclusive)
  endIso: string;   // ISO string (inclusive)
};

const SEASON_TABLE = 'season_config';

function startOfCurrentMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfCurrentMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function getDefaultSeason(): SeasonConfig {
  const start = startOfCurrentMonth();
  const end = endOfCurrentMonth();
  return {
    name: `Temporada ${start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
    description: 'Temporada padrão (mês vigente) gerada automaticamente.',
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function isValidSeason(cfg: SeasonConfig): boolean {
  if (!cfg?.name || !cfg.startIso || !cfg.endIso) return false;
  const s = new Date(cfg.startIso).getTime();
  const e = new Date(cfg.endIso).getTime();
  return Number.isFinite(s) && Number.isFinite(e) && s <= e;
}

export async function getSeasonConfig(): Promise<SeasonConfig> {
  try {
    // Busca a temporada mais recente; dá suporte a colunas novas e antigas
    const { data, error } = await supabase
      .from(SEASON_TABLE)
      .select('id, name, description, start_iso, end_iso, season_name, start_date, end_date, config_data, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.warn('Erro ao carregar configuração de temporada, usando padrões:', error);
      return getDefaultSeason();
    }
    
    if (!data || data.length === 0) {
      // Configuração não encontrada, retornar padrões
      return getDefaultSeason();
    }
    const row: any = data[0];
    const name: string = row.name ?? row.season_name ?? row?.config_data?.name ?? '';
    const description: string = row.description ?? row?.config_data?.description ?? '';
    const startIso: string | undefined = row.start_iso
      ?? (row.start_date ? new Date(row.start_date).toISOString() : undefined)
      ?? row?.config_data?.startIso;
    const endIso: string | undefined = row.end_iso
      ?? (row.end_date ? new Date(row.end_date).toISOString() : undefined)
      ?? row?.config_data?.endIso;

    const config: SeasonConfig = {
      id: row.id,
      name,
      description,
      startIso: startIso || '',
      endIso: endIso || '',
    };
    
    return isValidSeason(config) ? config : getDefaultSeason();
  } catch (error) {
    console.error('Erro inesperado ao carregar configuração de temporada:', error);
    return getDefaultSeason();
  }
}

export async function setSeasonConfig(cfg: SeasonConfig) {
  if (!isValidSeason(cfg)) {
    throw new Error('Configuração de temporada inválida. Verifique as datas e o nome.');
  }
  
  // Gera id se não existir
  if (!cfg.id) {
    cfg.id = crypto.randomUUID();
  }
  
  try {
    // Converte para snake_case e mantém compatibilidade com colunas antigas
    const startDate = new Date(cfg.startIso);
    const endDate = new Date(cfg.endIso);
    const row: any = {
      id: cfg.id,
      // novas colunas
      name: cfg.name,
      description: cfg.description ?? null,
      start_iso: startDate.toISOString(),
      end_iso: endDate.toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
      // colunas legadas para compatibilidade
      season_name: cfg.name,
      start_date: startDate.toISOString().slice(0, 10), // date (YYYY-MM-DD)
      end_date: endDate.toISOString().slice(0, 10)
    };

    // Insere ou atualiza se id já existir
    const { error } = await supabase
      .from(SEASON_TABLE)
      .upsert(row, { onConflict: 'id' })
      .select();
    
    if (error) {
      console.error('Erro ao salvar configuração de temporada:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro inesperado ao salvar configuração de temporada:', error);
    throw error;
  }
}

export async function isInSeason(dateString?: string): Promise<boolean> {
  if (!dateString) return false;
  const cfg = await getSeasonConfig();
  const t = new Date(dateString).getTime();
  const s = new Date(cfg.startIso).getTime();
  const e = new Date(cfg.endIso).getTime();
  if (!Number.isFinite(t) || !Number.isFinite(s) || !Number.isFinite(e)) return false;
  return t >= s && t <= e;
}
