// src/config/season.ts
// Configuração de Temporadas (Nome, Descrição, Período)

export type SeasonConfig = {
  name: string;
  description?: string;
  startIso: string; // ISO string (inclusive)
  endIso: string;   // ISO string (inclusive)
};

const LS_KEY = 'epic_season_config_v1';

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

export function getSeasonConfig(): SeasonConfig {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return getDefaultSeason();
    const parsed = JSON.parse(raw);
    const merged: SeasonConfig = {
      name: parsed?.name ?? '',
      description: parsed?.description ?? '',
      startIso: parsed?.startIso ?? '',
      endIso: parsed?.endIso ?? '',
    };
    return isValidSeason(merged) ? merged : getDefaultSeason();
  } catch {
    return getDefaultSeason();
  }
}

export function setSeasonConfig(cfg: SeasonConfig) {
  if (!isValidSeason(cfg)) {
    throw new Error('Configuração de temporada inválida. Verifique as datas e o nome.');
  }
  localStorage.setItem(LS_KEY, JSON.stringify(cfg));
}

export function isInSeason(dateString?: string): boolean {
  if (!dateString) return false;
  const cfg = getSeasonConfig();
  const t = new Date(dateString).getTime();
  const s = new Date(cfg.startIso).getTime();
  const e = new Date(cfg.endIso).getTime();
  if (!Number.isFinite(t) || !Number.isFinite(s) || !Number.isFinite(e)) return false;
  return t >= s && t <= e;
}
