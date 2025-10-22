// src/services/modelStore.ts
// Modelo de dados e persistência (via Supabase) + migração/backfill

import { Task } from './gamificationService';
import { getPercentageForClass } from '@/config/gamification';

export type ClassificacaoEntrega = 'adiantada' | 'no_prazo' | 'atrasada' | 'refacao';

export interface PersistentTask {
  id: string;
  playerId: string; // assignedTo
  competitionId?: string | null;
  titulo?: string;
  prazo: string; // dueDate
  dataConclusao?: string; // completedDate
  emRefacao: boolean;
  classificacaoEntrega: ClassificacaoEntrega;
  percentualProdutividade: number; // 0-100 (ignorados no denominador quando em refação ou sem conclusão)
}

export interface PlayerAggregate {
  playerId: string;
  competitionId?: string | null;
  somaPercentuais: number;
  totalTarefas: number;
  mediaPercentual: number; // derivado
  xpExibido: number; // derivado (media * 10 arredondado)
  submissoesIncorretas: number; // agregado
}

const STORAGE_TASKS_KEY = 'epic_tasks_v2';
const STORAGE_SCHEMA_KEY = 'epic_schema_version_v2';
const STORAGE_INCORRECT_SUB_KEY = 'epic_incorrect_submissions_v1';

export interface IncorrectSubmission {
  id: string;
  playerId: string;
  taskId?: string;
  competitionId?: string | null;
  timestamp: string;
}

/**
 * Classifica tarefa em termos do modelo persistente (PT-BR)
 */
function classificarEntrega(task: Task): ClassificacaoEntrega | 'ignorar' {
  if (task.status === 'refacao') return 'refacao';
  if (task.status !== 'completed') return 'ignorar';
  const due = task.dueDate ? new Date(task.dueDate).getTime() : undefined;
  const done = task.completedDate ? new Date(task.completedDate).getTime() : undefined;
  if (!due || !done) return 'no_prazo';
  if (done < due) return 'adiantada';
  if (done === due) return 'no_prazo';
  return 'atrasada';
}

function percentualPorClassificacao(cls: ClassificacaoEntrega): number {
  switch (cls) {
    case 'adiantada':
      return getPercentageForClass('early');
    case 'no_prazo':
      return getPercentageForClass('on_time');
    case 'atrasada':
      return getPercentageForClass('late');
    case 'refacao':
      return getPercentageForClass('refacao');
  }
}

export async function migrateAndBackfillFromTasks(tasks: Task[], competitionId?: string | null): Promise<PersistentTask[]> {
  // Exemplo de chamada para Supabase para obter schema
  // const { data: schemaData, error: schemaError } = await supabase
  //   .from('model_schema')
  //   .select('version')
  //   .eq('id', 'model_store_schema')
  //   .single();
  
  // let schema = schemaData?.version || 0;
  
  // Para este projeto, apenas definimos a versão 1 como atual
  // if (schema < 1) {
  //   const { error } = await supabase
  //   .from('model_schema')
  //   .upsert({
  //     id: 'model_store_schema',
  //     version: 1
  //   });
  // }

  const persisted: PersistentTask[] = tasks.map(t => {
    const cls = classificarEntrega(t);
    const isInRefacao = t.status === 'refacao';
    const pct = cls === 'ignorar' ? 0 : percentualPorClassificacao(cls as ClassificacaoEntrega);
    return {
      id: t.id,
      playerId: t.assignedTo,
      competitionId: competitionId ?? null,
      titulo: t.title,
      prazo: t.dueDate,
      dataConclusao: t.completedDate,
      emRefacao: isInRefacao,
      classificacaoEntrega: (cls === 'ignorar' ? 'no_prazo' : cls) as ClassificacaoEntrega,
      percentualProdutividade: Math.max(0, Math.min(100, Math.round(pct))),
    };
  });

  // Exemplo de chamada para Supabase para salvar tarefas
  // const { error } = await supabase
  //   .from('persistent_tasks')
  //   .upsert(persisted);
  
  return persisted;
}

export async function loadPersistentTasks(): Promise<PersistentTask[]> {
  try {
    // Exemplo de chamada para Supabase
    // const { data, error } = await supabase.from('persistent_tasks').select('*');
    // if (error) throw error;
    // return data as PersistentTask[];
    return [];
  } catch {
    return [];
  }
}

function roundHalfUp(n: number): number { return Math.floor(n + 0.5); }

export function computeAggregates(tasks?: PersistentTask[]): PlayerAggregate[] {
  const list = tasks ?? loadPersistentTasks();
  const byKey = new Map<string, { sum: number; count: number; playerId: string; competitionId?: string | null }>();
  for (const t of list) {
    // Ignorar no denominador quando em refação ou sem dataConclusao
    if (t.emRefacao || !t.dataConclusao) continue;
    const key = `${t.playerId}::${t.competitionId ?? ''}`;
    const bucket = byKey.get(key) ?? { sum: 0, count: 0, playerId: t.playerId, competitionId: t.competitionId };
    const pct = Math.max(0, Math.min(100, t.percentualProdutividade));
    bucket.sum += pct;
    bucket.count += 1;
    byKey.set(key, bucket);
  }

  // Agregar submissões incorretas (apenas desempate; não afeta percentuais)
  const incorrect = loadIncorrectSubmissions();
  const incorrectByKey = incorrect.reduce<Record<string, number>>((acc, s) => {
    const key = `${s.playerId}::${s.competitionId ?? ''}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const aggs: PlayerAggregate[] = [];
  for (const b of byKey.values()) {
    const media = b.count > 0 ? b.sum / b.count : 0;
    aggs.push({
      playerId: b.playerId,
      competitionId: b.competitionId,
      somaPercentuais: b.sum,
      totalTarefas: b.count,
      mediaPercentual: media,
      xpExibido: roundHalfUp(media * 10),
      submissoesIncorretas: incorrectByKey[`${b.playerId}::${b.competitionId ?? ''}`] || 0,
    });
  }
  return aggs;
}

// Registro/Leitura de submissões incorretas
export async function recordIncorrectSubmission(playerId: string, taskId?: string, competitionId?: string | null, timestamp?: string) {
  const list = await loadIncorrectSubmissions();
  const entry: IncorrectSubmission = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    playerId, taskId, competitionId: competitionId ?? null,
    timestamp: timestamp ?? new Date().toISOString()
  };
  list.push(entry);
  await updateIncorrectSubmissions(list);
}

export async function loadIncorrectSubmissions(): Promise<IncorrectSubmission[]> {
  try {
    // Exemplo de chamada para Supabase
    // const { data, error } = await supabase.from('incorrect_submissions').select('*');
    // if (error) throw error;
    // return data as IncorrectSubmission[];
    return [];
  } catch {
    return [];
  }
}

// Upsert idempotente de tarefas a partir de eventos
export async function upsertTaskFromEvent(eventTask: Task, competitionId?: string | null) {
  const current = await loadPersistentTasks();
  const idx = current.findIndex(x => x.id === eventTask.id);
  const cls = classificarEntrega(eventTask);
  const isRef = eventTask.status === 'refacao';
  const pct = cls === 'ignorar' ? 0 : percentualPorClassificacao(cls as ClassificacaoEntrega);
  const formatted: PersistentTask = {
    id: eventTask.id,
    playerId: eventTask.assignedTo,
    competitionId: competitionId ?? null,
    titulo: eventTask.title,
    prazo: eventTask.dueDate,
    dataConclusao: eventTask.completedDate,
    emRefacao: isRef,
    classificacaoEntrega: (cls === 'ignorar' ? 'no_prazo' : cls) as ClassificacaoEntrega,
    percentualProdutividade: Math.max(0, Math.min(100, Math.round(pct))),
  };
  if (idx >= 0) current[idx] = formatted; else current.push(formatted);
  // Exemplo de chamada para Supabase
  // const { error } = await supabase.from('persistent_tasks').upsert(current);
  // if (error) throw error;
}

// Recalcular agregados on-demand (retorna lista); cache é responsabilidade do chamador
export function recalcAggregatesOnDemand(): PlayerAggregate[] {
  return computeAggregates();
}
