// src/services/supabaseData.ts
// Serviço centralizado para leitura e escrita de dados no backend Supabase

import { TaskData } from '@/data/projectData';
import { Task, User, calculateRankingXpFromTasks } from './gamificationService';
import { addSimpleXpHistory } from '@/services/xpHistoryService';
import { toOrderedRankingDTO, toPlayerProfileDTO } from './dtoTransformers';
import { RankingEntryDTO, PlayerProfileDTO } from '@/types/dto';
import type { ActiveMission } from './missionService';
import { supabase } from '@/lib/supabase';

// Dados iniciais para usar como fallback se não houver conexão com o backend
const DEFAULT_TASKS_DATA: TaskData[] = [];
const DEFAULT_PROJECT_METRICS = {
  totalTarefas: 0,
  tarefasNoPrazo: 0,
  tarefasAtrasadas: 0,
  mediaProducao: 0,
  mediaAtrasos: 0,
  desvioPadrao: 0,
  moda: 0,
  mediana: 0
};
const DEFAULT_USERS: User[] = [];
const DEFAULT_GAMIFICATION_TASKS: Task[] = [];

// Funções para gerenciar tarefas (DataContext, componentes UI)
export async function getTasksData(): Promise<TaskData[]> {
  try {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao carregar tarefas do backend:', error);
    return [];
  }
}

export async function saveTasksData(tasks: TaskData[]): Promise<void> {
  try {
    // Aplica a migração automaticamente antes de salvar
    const migratedTasks = migrateTaskResponsibles(tasks);
    
    const { error } = await supabase.from('tasks').upsert(migratedTasks);
    if (error) throw error;
    
    // Atualiza também as métricas calculadas
    await updateProjectMetrics(migratedTasks);
    
    // Espelha as tarefas do editor no modelo de gamificação (para ranking)
    try {
      // Snapshot anterior das tarefas de gamificação
      const prevGamTasks = await getGamificationTasks();
      // Novo snapshot a partir do TaskData atual
      const gamTasks = mapTaskDataToGamification(migratedTasks);

      // Calcular delta de XP por usuário responsável
      const usersSet = new Set<string>();
      for (const t of prevGamTasks) if (t.assignedTo) usersSet.add(t.assignedTo);
      for (const t of gamTasks) if (t.assignedTo) usersSet.add(t.assignedTo);

      // Detectar tarefas que passaram a "completed" nesta gravação
      const beforeById: Record<string, Task> = Object.fromEntries(prevGamTasks.map(t => [t.id, t]));
      const newlyCompletedByUser: Record<string, string[]> = {};
      for (const t of gamTasks) {
        if (!t.assignedTo) continue;
        const before = beforeById[t.id];
        const becameCompleted = t.status === 'completed' && (!before || before.status !== 'completed');
        if (becameCompleted) {
          if (!newlyCompletedByUser[t.assignedTo]) newlyCompletedByUser[t.assignedTo] = [];
          newlyCompletedByUser[t.assignedTo].push(t.title);
        }
      }

      // Para cada usuário, comparar XP de ranking baseado em tarefas (sem streak)
      for (const userId of usersSet) {
        const beforeList = prevGamTasks.filter(t => t.assignedTo === userId);
        const afterList = gamTasks.filter(t => t.assignedTo === userId);
        const xpBefore = await calculateRankingXpFromTasks(beforeList);
        const xpAfter = await calculateRankingXpFromTasks(afterList);
        const delta = xpAfter - xpBefore;
        if (delta !== 0) {
          // Monta descrição amigável
          const completed = newlyCompletedByUser[userId] || [];
          let desc = 'Atualização de XP por tarefas';
          if (completed.length === 1 && delta > 0) desc = `Tarefa concluída: ${completed[0]}`;
          else if (completed.length > 1 && delta > 0) desc = `${completed.length} tarefas concluídas`;
          else if (delta < 0) desc = 'Ajuste de XP por alterações de tarefas';
          // Registra evento no histórico (fonte: task)
          try { addSimpleXpHistory(userId, delta, 'task', desc); } catch {}
        }
      }

      // Persistir o novo snapshot para o ranking
      await saveGamificationTasks(gamTasks);
    } catch (e) {
      console.warn('Falha ao espelhar tarefas para gamificação:', e);
    }
    
    // Notifica outras páginas/abas e provedores para recarregar as tarefas
    try {
      window.dispatchEvent(new CustomEvent('tasks:changed'));
    } catch {}
  } catch (error) {
    console.error('Erro ao salvar tarefas no backend:', error);
  }
}

export async function addTaskData(task: TaskData): Promise<void> {
  try {
    const { error } = await supabase.from('tasks').insert([task]);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
  }
}

export async function updateTaskData(id: number, updates: Partial<TaskData>): Promise<void> {
  try {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
  }
}

export async function deleteTaskData(id: number): Promise<void> {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
  }
}

// Funções para métricas de projeto
export async function getProjectMetrics() {
  try {
    const { data, error } = await supabase.from('project_metrics').select('*').single();
    if (error) throw error;
    return data || DEFAULT_PROJECT_METRICS;
  } catch (error) {
    console.error('Erro ao carregar métricas do backend:', error);
    return DEFAULT_PROJECT_METRICS;
  }
}

export async function updateProjectMetrics(tasks: TaskData[]): Promise<void> {
  try {
    // Cálculo básico de métricas a partir das tarefas
    const totalTarefas = tasks.length;
    const tarefasNoPrazo = tasks.filter(t => t.atendeuPrazo).length;
    const tarefasAtrasadas = tasks.filter(t => !t.atendeuPrazo).length;
    
    const duracoes = tasks.map(t => t.duracaoDiasUteis).filter(d => !isNaN(d));
    const atrasos = tasks.map(t => t.atrasoDiasUteis).filter(d => !isNaN(d));
    
    const mediaProducao = duracoes.length > 0 
      ? duracoes.reduce((sum, d) => sum + d, 0) / duracoes.length 
      : 0;
      
    const mediaAtrasos = atrasos.length > 0 
      ? atrasos.reduce((sum, d) => sum + d, 0) / atrasos.length 
      : 0;
    
    // Valores predefinidos para estatísticas mais complexas
    // Em uma implementação completa, estas seriam calculadas dinamicamente
    const desvioPadrao = 1.8;
    const moda = 2;
    const mediana = 5;
    
    const metrics = {
      totalTarefas,
      tarefasNoPrazo,
      tarefasAtrasadas,
      mediaProducao,
      mediaAtrasos,
      desvioPadrao,
      moda,
      mediana
    };
    
    const { error } = await supabase.from('project_metrics').upsert(metrics);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar métricas do projeto:', error);
  }
}

// Funções para o sistema de gamificação (perfis, ranking)
export async function getGamificationUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase.from('user_gamification_profiles').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao carregar usuários de gamificação do backend:', error);
    return [];
  }
}

export async function getSystemUsers(): Promise<Array<{ id: string; name: string; email: string; role?: string; avatar?: string }>> {
  try {
    const { data, error } = await supabase.from('users').select('id, name, email, role, avatar');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao carregar usuários do sistema do backend:', error);
    return [];
  }
}

// Função para mapear nome de usuário para ID no formato compatível com gamificação
export async function resolveUserIdByName(name?: string): Promise<string | undefined> {
  if (!name) return undefined;
  
  try {
    const systemUsers = await getSystemUsers();
    const trimmed = name.trim().toLowerCase();
    
    // 1) match exato por nome completo
    let hit = systemUsers.find(u => (u.name || u.email).trim().toLowerCase() === trimmed);
    if (hit) return hit.id;
    
    // 2) match por primeiro nome contido
    const first = trimmed.split(' ')[0];
    hit = systemUsers.find(u => (u.name || '').toLowerCase().includes(first));
    if (hit) return hit.id;
    
    return undefined;
  } catch {
    return undefined;
  }
}

// Função para migrar tarefas existentes do formato antigo (por nome) para o novo (por ID)
export function migrateTaskResponsibles(tasks: TaskData[]): TaskData[] {
  return tasks.map(task => {
    // Se já tem userId, mantém como está
    if (task.userId) {
      return task;
    }
    
    // Caso contrário, tenta converter do nome para ID
    if (task.responsavel) {
      // Aqui precisaríamos resolver assíncrono, o que requer uma nova abordagem
      // Por enquanto, mantendo a lógica síncrona para compatibilidade
      return task;
    }
    
    // Se não conseguir converter, retorna a tarefa original
    return task;
  });
}

export async function saveGamificationUsers(users: User[]): Promise<void> {
  try {
    const { error } = await supabase.from('users').upsert(users);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar usuários de gamificação:', error);
  }
}

export async function getGamificationTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase.from('gamification_tasks').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao carregar tarefas de gamificação do backend:', error);
    return [];
  }
}

export async function saveGamificationTasks(tasks: Task[]): Promise<void> {
  try {
    const { error } = await supabase.from('gamification_tasks').upsert(tasks);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar tarefas de gamificação:', error);
  }
}

// --------- Mapeamento TaskData -> Gamification Task ---------

export function mapTaskDataToGamification(tasks: TaskData[]): Task[] {
  const now = new Date();
  return tasks.map<Task>((t) => {
    // Necessário resolver o ID de forma assíncrona em outro lugar
    const assignedTo = ''; // Será atualizado posteriormente
    // Status de gamificação
    let status: Task['status'] = 'pending';
    if (t.status === 'refacao') status = 'refacao';
    else if (t.status === 'completed' || (!!t.fim && t.fim !== '')) status = 'completed';
    else if (t.prazo && new Date(t.prazo) < now) status = 'overdue';
    else status = 'pending';

    const completedDate = t.fim && t.fim !== '' ? new Date(t.fim).toISOString() : undefined;
    const dueDate = t.prazo ? new Date(t.prazo).toISOString() : '';

    return {
      id: String(t.id ?? `td-${Math.random().toString(36).slice(2,8)}`),
      title: t.tarefa || `Tarefa ${t.id ?? ''}`,
      status,
      completedDate,
      dueDate,
      assignedTo,
      completedEarly: undefined,
    }
  });
}

// Exportar funções para armazenamento e recuperação de missões de usuário
export async function getUserMissions(userId: string): Promise<ActiveMission[]> {
  try {
    const { data, error } = await supabase.from('user_missions').select('*').eq('user_id', userId);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao carregar missões do usuário do backend:', error);
    return [];
  }
}

export async function saveUserMissions(userId: string, missions: ActiveMission[]): Promise<void> {
  try {
    const missionsWithUserId = missions.map(m => ({ ...m, user_id: userId }));
    const { error } = await supabase.from('user_missions').upsert(missionsWithUserId);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar missões do usuário:', error);
  }
}

// API service com dados do backend

export async function fetchRanking(): Promise<RankingEntryDTO[]> {
  try {
    // Simula latência de rede
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const { data, error } = await supabase.from('user_gamification_profiles').select('*').order('xp', { ascending: false });
    if (error) throw error;
    
    // Fetch tasks
    const { data: tasksData, error: tasksError } = await supabase.from('gamified_tasks').select('*');
    if (tasksError) throw tasksError;
    
    return toOrderedRankingDTO(data || [], tasksData || []);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return [];
  }
}

export async function fetchPlayerProfile(userId: string): Promise<PlayerProfileDTO | null> {
  try {
    // Simula latência de rede
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const { data, error } = await supabase.from('player_profiles').select('*').eq('user_id', userId).single();
    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      throw error;
    }
    
    // Fetch tasks
    const { data: tasksData, error: tasksError } = await supabase.from('gamified_tasks').select('*');
    if (tasksError) throw tasksError;
    
    return toPlayerProfileDTO(data, tasksData || []);
  } catch (error) {
    console.error('Erro ao buscar perfil do jogador:', error);
    return null;
  }
}

export async function seedMockData(users: User[], tasks: Task[]): Promise<void> {
  await saveGamificationUsers(users);
  await saveGamificationTasks(tasks);
}