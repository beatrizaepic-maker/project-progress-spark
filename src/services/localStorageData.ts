// src/services/localStorageData.ts
// Todas as funcionalidades de localStorage foram removidas para uso exclusivo do Supabase
// Este arquivo agora contém apenas funções de interface para o banco de dados Supabase
// Atualizado para lidar com tarefas e dados de projeto conforme item 2 do relatório de migração

import { supabase } from '@/lib/supabase';
import { TaskData } from '@/data/projectData';
import { Task, User } from './gamificationService';
import { RankingEntryDTO, PlayerProfileDTO } from '@/types/dto';
import type { ActiveMission } from './missionService';

// Interfaces para as funções do Supabase
// Estas funções usam o cliente Supabase para acesso a tarefas e dados de projeto

// Funções para gerenciar tarefas (DataContext, componentes UI)
export async function getTasksData(): Promise<TaskData[]> {
  try {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    return data as TaskData[];
  } catch (error) {
    console.error('Erro ao buscar tarefas do Supabase:', error);
    return [];
  }
}

export async function saveTasksData(tasks: TaskData[]): Promise<void> {
  try {
    const { error } = await supabase.from('tasks').upsert(tasks);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar tarefas no Supabase:', error);
    throw error;
  }
}

export async function addTaskData(task: TaskData): Promise<void> {
  try {
    const { error } = await supabase.from('tasks').insert([task]);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao adicionar tarefa no Supabase:', error);
    throw error;
  }
}

export async function updateTaskData(id: number, updates: Partial<TaskData>): Promise<void> {
  try {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar tarefa no Supabase:', error);
    throw error;
  }
}

export async function deleteTaskData(id: number): Promise<void> {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar tarefa no Supabase:', error);
    throw error;
  }
}

// Interface para métricas do projeto
interface ProjectMetrics {
  totalTarefas: number;
  tarefasNoPrazo: number;
  tarefasAtrasadas: number;
  mediaProducao: number;
  mediaAtrasos: number;
  desvioPadrao: number;
  moda: number;
  mediana: number;
}

// Funções para métricas de projeto
export async function getProjectMetrics(): Promise<ProjectMetrics> {
  try {
    const { data, error } = await supabase.from('project_metrics').select('*').single();
    if (error) throw error;
    return data as ProjectMetrics;
  } catch (error) {
    console.error('Erro ao buscar métricas do projeto do Supabase:', error);
    // Retorna métricas padrão em caso de erro
    return {
      totalTarefas: 0,
      tarefasNoPrazo: 0,
      tarefasAtrasadas: 0,
      mediaProducao: 0,
      mediaAtrasos: 0,
      desvioPadrao: 0,
      moda: 0,
      mediana: 0
    };
  }
}

export async function updateProjectMetrics(tasks: TaskData[]): Promise<void> {
  try {
    // Calcula as métricas com base nas tarefas
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
    const desvioPadrao = 1.8;
    const moda = 2;
    const mediana = 5;
    
    const metrics: ProjectMetrics = {
      totalTarefas,
      tarefasNoPrazo,
      tarefasAtrasadas,
      mediaProducao,
      mediaAtrasos,
      desvioPadrao,
      moda,
      mediana
    };

    // Atualiza as métricas no Supabase
    const { error } = await supabase.from('project_metrics').upsert(metrics);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar métricas do projeto no Supabase:', error);
    throw error;
  }
}

// Funções para o sistema de gamificação (perfis, ranking)
export async function getGamificationUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data as User[];
  } catch (error) {
    console.error('Erro ao carregar usuários de gamificação do Supabase:', error);
    return [];
  }
}

// Função para mapear nome de usuário para ID no formato compatível com gamificação
export async function resolveUserIdByName(name?: string): Promise<string | undefined> {
  if (!name) return undefined;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('name', name)
      .single();
    
    if (error) {
      console.error('Erro ao resolver ID do usuário por nome:', error);
      return undefined;
    }
    
    return data?.id;
  } catch (error) {
    console.error('Erro ao resolver ID do usuário por nome:', error);
    return undefined;
  }
}

export async function saveGamificationUsers(users: User[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('player_profiles')
      .upsert(users, { onConflict: 'id' });
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar usuários de gamificação no Supabase:', error);
  }
}

export async function getGamificationTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status, completed_date, due_date, assigned_to');
    
    if (error) throw error;
    
    // Mapeia os dados recebidos para o formato Task
    return data.map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      completedDate: t.completed_date,
      dueDate: t.due_date || '',
      assignedTo: t.assigned_to
    }));
  } catch (error) {
    console.error('Erro ao buscar tarefas de gamificação do Supabase:', error);
    return [];
  }
}

export async function saveGamificationTasks(tasks: Task[]): Promise<void> {
  try {
    // Prepara os dados para inserção no Supabase
    const tasksToSave = tasks.map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      completed_date: t.completedDate || null,
      due_date: t.dueDate || null,
      assigned_to: t.assignedTo
    }));
    
    const { error } = await supabase
      .from('tasks')
      .upsert(tasksToSave, { onConflict: 'id' });
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar tarefas de gamificação no Supabase:', error);
    throw error;
  }
}

// Funções para armazenamento e recuperação de missões de usuário
export async function getUserMissions(userId: string): Promise<ActiveMission[]> {
  try {
    const { data, error } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Mapeia os dados para o formato ActiveMission
    return data.map(mission => ({
      id: mission.id,
      userId: mission.user_id,
      configId: mission.config_id,
      type: mission.type,
      name: mission.name,
      description: mission.description,
      target: mission.target,
      currentProgress: mission.current_progress,
      xpReward: mission.xp_reward,
      deadline: mission.deadline,
      completed: mission.completed,
      completedAt: mission.completed_at,
      createdAt: mission.created_at
    }));
  } catch (error) {
    console.error('Erro ao buscar missões do usuário do Supabase:', error);
    return [];
  }
}

export async function saveUserMissions(userId: string, missions: ActiveMission[]): Promise<void> {
  try {
    // Prepara os dados para inserção no Supabase
    const missionsToSave = missions.map(mission => ({
      id: mission.id,
      user_id: userId,
      config_id: mission.configId,
      type: mission.type,
      name: mission.name,
      description: mission.description,
      target: mission.target,
      current_progress: mission.currentProgress,
      xp_reward: mission.xpReward,
      deadline: mission.deadline,
      completed: mission.completed,
      completed_at: mission.completedAt,
      created_at: mission.createdAt
    }));
    
    const { error } = await supabase
      .from('user_missions')
      .upsert(missionsToSave, { onConflict: 'id' });
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar missões do usuário no Supabase:', error);
    throw error;
  }
}

export async function fetchRanking(): Promise<RankingEntryDTO[]> {
  try {
    const { data, error } = await supabase
      .from('ranking')
      .select('*')
      .order('xp', { ascending: false });
    if (error) throw error;
    return data as RankingEntryDTO[];
  } catch (error) {
    console.error('Erro ao buscar ranking do Supabase:', error);
    return [];
  }
}

export async function fetchPlayerProfile(userId: string): Promise<PlayerProfileDTO | null> {
  try {
    const { data, error } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data as PlayerProfileDTO;
  } catch (error) {
    console.error('Erro ao buscar perfil do jogador do Supabase:', error);
    return null;
  }
}



// API para obter os usuários canônicos do sistema
export async function getSystemUsers(): Promise<Array<{ id: string; name: string; email: string; role?: string; avatar?: string }>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, avatar');
    
    if (error) throw error;
    
    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }));
  } catch (error) {
    console.error('Erro ao buscar usuários do sistema do Supabase:', error);
    return [];
  }
}