// src/services/xpHistoryService.ts
// Serviço para registrar e recuperar histórico de XP por usuário no localStorage

import type { XpHistory } from '@/types/player';

const LS_KEY = 'epic_xp_history_v1';

type HistoryMap = Record<string, XpHistory[]>; // userId -> entries

function loadAll(): HistoryMap {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function saveAll(map: HistoryMap) {
  localStorage.setItem(LS_KEY, JSON.stringify(map));
}

export function getUserXpHistory(userId: string): XpHistory[] {
  const map = loadAll();
  return map[userId] || [];
}

export function addXpHistory(entry: XpHistory) {
  const map = loadAll();
  const list = map[entry.playerId] || [];
  // de-dup básico: evita entradas idênticas por id
  if (list.some(e => e.id === entry.id)) return;
  map[entry.playerId] = [entry, ...list].slice(0, 1000); // limita crescimento
  saveAll(map);
}

export function addSimpleXpHistory(
  userId: string,
  xp: number,
  source: XpHistory['source'],
  description: string,
  opts?: { taskId?: string; missionId?: string; dateIso?: string }
) {
  const entry: XpHistory = {
    id: `xph_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    playerId: userId,
    date: opts?.dateIso || new Date().toISOString(),
    xp,
    source,
    description,
    taskId: opts?.taskId,
    missionId: opts?.missionId,
  };
  addXpHistory(entry);
}
