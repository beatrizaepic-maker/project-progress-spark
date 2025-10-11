// src/config/streak.ts
// Configuração e registro do bônus diário de login (streak)

export interface StreakAwardEntry {
  userId: string;
  date: string; // YYYY-MM-DD
  xp: number;
}

interface StreakState {
  dailyBonusXp: number;
  enabled: boolean;
  includeIn: { total: boolean; weekly: boolean; monthly: boolean };
  awards: StreakAwardEntry[];
}

const LS_KEY = 'epic_streak_state_v1';
const DEFAULTS: StreakState = {
  dailyBonusXp: 10,
  enabled: true,
  includeIn: { total: true, weekly: true, monthly: true },
  awards: [],
};

function loadState(): StreakState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    // Básica validação e merge com defaults
    return {
      dailyBonusXp: typeof parsed.dailyBonusXp === 'number' ? parsed.dailyBonusXp : DEFAULTS.dailyBonusXp,
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULTS.enabled,
      includeIn: parsed.includeIn && typeof parsed.includeIn === 'object' ? {
        total: !!parsed.includeIn.total,
        weekly: !!parsed.includeIn.weekly,
        monthly: !!parsed.includeIn.monthly,
      } : { ...DEFAULTS.includeIn },
      awards: Array.isArray(parsed.awards) ? parsed.awards : [],
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveState(state: StreakState) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export function getDailyStreakBonusXp(): number {
  return loadState().dailyBonusXp;
}

export function setDailyStreakBonusXp(xp: number) {
  const s = loadState();
  const safe = Math.max(0, Math.round(xp));
  s.dailyBonusXp = safe;
  saveState(s);
}

export function isStreakEnabled(): boolean {
  return loadState().enabled;
}

export function setStreakEnabled(enabled: boolean) {
  const s = loadState();
  s.enabled = !!enabled;
  saveState(s);
}

export function getStreakIncludeIn(): { total: boolean; weekly: boolean; monthly: boolean } {
  return loadState().includeIn;
}

export function setStreakIncludeIn(includeIn: Partial<{ total: boolean; weekly: boolean; monthly: boolean }>) {
  const s = loadState();
  s.includeIn = { ...s.includeIn, ...includeIn };
  saveState(s);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addStreakAwardIfNeeded(userId: string): { awarded: boolean; xp: number } {
  const state = loadState();
  if (!state.enabled) return { awarded: false, xp: 0 };
  const today = formatDate(new Date());
  const already = state.awards.find(a => a.userId === userId && a.date === today);
  if (already) return { awarded: false, xp: already.xp };
  const xp = state.dailyBonusXp;
  state.awards.push({ userId, date: today, xp });
  saveState(state);
  return { awarded: true, xp };
}

export function getUserStreakAwards(userId: string): StreakAwardEntry[] {
  return loadState().awards.filter(a => a.userId === userId);
}

export function getUserStreakXpLifetime(userId: string): number {
  return getUserStreakAwards(userId).reduce((acc, a) => acc + a.xp, 0);
}

export function getUserStreakXpThisWeek(userId: string): number {
  const awards = getUserStreakAwards(userId);
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

export function getUserStreakXpThisMonth(userId: string): number {
  const awards = getUserStreakAwards(userId);
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
