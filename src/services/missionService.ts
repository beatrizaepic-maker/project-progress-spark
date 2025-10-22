// src/services/missionService.ts

import { Task, Mission, User } from './gamificationService';
// Importações serão atualizadas para usar funções do Supabase
import { addSimpleXpHistory, getUserXpHistory } from './xpHistoryService';

// Tipos de missões disponíveis
export type MissionType = 
  | 'complete_tasks'           // Completar N tarefas
  | 'complete_early'           // Completar N tarefas adiantadas
  | 'attend_meetings'          // Participar de N reuniões
  | 'review_peer_tasks'        // Revisar N tarefas de colegas
  | 'streak_days'              // Manter sequência por N dias
  | 'no_delays'                // Não atrasar nenhuma tarefa
  | 'high_effort_tasks';       // Completar tarefas de alta dificuldade

// Configuração de uma missão
export interface MissionConfig {
  type: MissionType;
  name: string;
  description: string;
  target: number; // Quantidade necessária para completar
  xpReward: number; // XP recompensado ao completar
  frequency: 'daily' | 'weekly' | 'monthly'; // Frequência da missão
  isActive: boolean; // Se está ativa para atribuição
  // Janela de vigência (opcional quando contínua)
  start?: string;
  end?: string;
  continuous?: boolean;
}

// Missão ativa para um usuário
export interface ActiveMission {
  id: string;
  userId: string;
  configId: string; // ID da configuração da missão
  type: MissionType;
  name: string;
  description: string;
  target: number;
  currentProgress: number; // Progresso atual
  xpReward: number;
  deadline: string; // Data limite para conclusão
  completed: boolean;
  completedAt?: string; // Data de conclusão
  createdAt: string; // Data de criação
}

// Função para obter missões configuradas do Supabase
async function getMissionConfigsFromStorage(): Promise<MissionConfig[]> {
  try {
    // Exemplo de chamada para Supabase
    // const { data, error } = await supabase.from('mission_configs').select('*').eq('is_active', true);
    // if (error) throw error;
    // return data as MissionConfig[];
  } catch (error) {
    console.error('Erro ao ler missões do Supabase:', error);
  }
  
  // Retorna missões padrão se não houver configurações
  return getDefaultMissions();
}

// Configurações padrão de missões semanais
function getDefaultMissions(): MissionConfig[] {
  return [
    {
      type: 'complete_tasks',
      name: 'Trabalho Incansável',
      description: 'Complete 5 tarefas na semana',
      target: 5,
      xpReward: 25,
      frequency: 'weekly',
      isActive: true
    },
    {
      type: 'complete_early',
      name: 'Andando na Frente',
      description: 'Complete 3 tarefas antes do prazo',
      target: 3,
      xpReward: 30,
      frequency: 'weekly',
      isActive: true
    },
    {
      type: 'no_delays',
      name: 'Pontualidade',
      description: 'Não atrasar nenhuma tarefa na semana',
      target: 0,
      xpReward: 35,
      frequency: 'weekly',
      isActive: true
    },
    {
      type: 'review_peer_tasks',
      name: 'Colaboração',
      description: 'Revisar 5 tarefas de colegas',
      target: 5,
      xpReward: 20,
      frequency: 'weekly',
      isActive: true
    },
    {
      type: 'streak_days',
      name: 'Sequência',
      description: 'Mantenha uma sequência de 5 dias consecutivos',
      target: 5,
      xpReward: 40,
      frequency: 'weekly',
      isActive: true
    }
  ];
}

// Exportar missões padrão para referência
export const DEFAULT_MISSIONS: MissionConfig[] = getDefaultMissions();

// Função para obter missões configuradas (do Supabase ou padrão)
export function getAvailableMissions(): MissionConfig[] {
  return getMissionConfigsFromStorage();
}

// -------------------- AVALIAÇÃO GLOBAL E PREMIAÇÃO --------------------

function isWithinWindow(dateIso: string | undefined, start?: string, end?: string, continuous?: boolean): boolean {
  if (!dateIso) return false;
  if (continuous) return true;
  if (!start || !end) return true; // se não definido, considerar sempre
  const d = new Date(dateIso).getTime();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (!Number.isFinite(d) || !Number.isFinite(s) || !Number.isFinite(e)) return false;
  return d >= s && d <= e;
}

function generateMissionKey(m: MissionConfig): string {
  const base = JSON.stringify({
    type: m.type,
    name: m.name,
    target: m.target,
    reward: m.xpReward,
    freq: m.frequency,
    start: m.start || '',
    end: m.end || '',
    continuous: !!m.continuous,
  });
  // hash simples e estável suficiente para de-dup local
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash * 31 + base.charCodeAt(i)) | 0;
  }
  return `mission_${Math.abs(hash)}`;
}

function getActiveMissions(): MissionConfig[] {
  const now = Date.now();
  return getAvailableMissions().filter(m => {
    if (!m.isActive) return false;
    if (m.continuous) return true;
    if (!m.start || !m.end) return true;
    const s = new Date(m.start).getTime();
    const e = new Date(m.end).getTime();
    if (!Number.isFinite(s) || !Number.isFinite(e)) return true;
    return now >= s && now <= e;
  });
}

function getUserTasksForMission(userId: string, mission: MissionConfig, allTasks: Task[]): Task[] {
  // Filtra por responsável e janela da missão
  const userTasks = allTasks.filter(t => t.assignedTo === userId);
  return userTasks.filter(t => isWithinWindow(t.completedDate || t.dueDate, mission.start, mission.end, mission.continuous));
}

function countEarly(tasks: Task[]): number {
  let n = 0;
  for (const t of tasks) {
    if (t.status !== 'completed') continue;
    if (!t.completedDate || !t.dueDate) continue;
    const comp = new Date(t.completedDate).getTime();
    const due = new Date(t.dueDate).getTime();
    if (Number.isFinite(comp) && Number.isFinite(due) && comp < due) n++;
  }
  return n;
}

function hasNoDelays(tasks: Task[]): boolean {
  for (const t of tasks) {
    // Tarefa marcada como overdue
    if (t.status === 'overdue') return false;
    if (t.status === 'completed' && t.completedDate && t.dueDate) {
      const comp = new Date(t.completedDate).getTime();
      const due = new Date(t.dueDate).getTime();
      if (Number.isFinite(comp) && Number.isFinite(due) && comp > due) return false;
    }
  }
  return true;
}

function meetsMission(mission: MissionConfig, tasks: Task[]): boolean {
  switch (mission.type) {
    case 'complete_tasks': {
      const done = tasks.filter(t => t.status === 'completed').length;
      return done >= mission.target;
    }
    case 'complete_early': {
      return countEarly(tasks) >= mission.target;
    }
    case 'no_delays': {
      return hasNoDelays(tasks);
    }
    case 'review_peer_tasks': {
      const reviews = tasks.filter(t => (t.title || '').toLowerCase().includes('revisão') || (t.title || '').toLowerCase().includes('review')).length;
      return reviews >= mission.target;
    }
    // Tipos que dependem de dados não modelados atualmente serão ignorados
    case 'streak_days':
    case 'attend_meetings':
    case 'high_effort_tasks':
    default:
      return false;
  }
}

export function evaluateAndApplyAllMissions(): { awarded: number; details: Array<{ userId: string; missionKey: string; xp: number }> } {
  const active = getActiveMissions();
  if (active.length === 0) return { awarded: 0, details: [] };

  const users = getSystemUsers();
  const allTasks = getGamificationTasks();
  let awarded = 0;
  const details: Array<{ userId: string; missionKey: string; xp: number }> = [];

  for (const m of active) {
    const missionKey = generateMissionKey(m);
    for (const u of users) {
      const history = getUserXpHistory(u.id) || [];
      const already = history.some(h => h.source === 'mission' && h.missionId === missionKey);
      if (already) continue; // de-dup
      const tasks = getUserTasksForMission(u.id, m, allTasks);
      if (meetsMission(m, tasks)) {
        addSimpleXpHistory(u.id, m.xpReward, 'mission', m.name || 'Missão', { missionId: missionKey });
        awarded++;
        details.push({ userId: u.id, missionKey, xp: m.xpReward });
      }
    }
  }

  // Notifica ouvintes interessados
  try { window.dispatchEvent(new CustomEvent('missions:applied', { detail: { awarded, details } })); } catch {}
  return { awarded, details };
}

/**
 * Cria missões semanais para um usuário
 * @param userId ID do usuário
 * @returns Array de missões ativas
 */
export function createWeeklyMissionsForUser(userId: string): ActiveMission[] {
  const today = new Date();
  // Define o final da semana (domingo)
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  
  // Seleciona aleatoriamente algumas missões da lista configurada
  const activeMissions: ActiveMission[] = [];
  const availableMissions = getAvailableMissions().filter(m => m.isActive && m.frequency === 'weekly');
  
  // Seleciona 3 missões aleatórias para a semana
  const shuffled = [...availableMissions].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);
  
  for (const missionConfig of selected) {
    activeMissions.push({
      id: `mission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      configId: missionConfig.type,
      type: missionConfig.type,
      name: missionConfig.name,
      description: missionConfig.description,
      target: missionConfig.target,
      currentProgress: 0,
      xpReward: missionConfig.xpReward,
      deadline: endOfWeek.toISOString(),
      completed: false,
      createdAt: new Date().toISOString()
    });
  }
  
  return activeMissions;
}

/**
 * Atualiza o progresso de uma missão com base em uma tarefa completada
 * @param mission Missão ativa
 * @param task Tarefa completada
 * @returns Missão atualizada
 */
export function updateMissionProgress(mission: ActiveMission, task: Task): ActiveMission {
  let newProgress = mission.currentProgress;
  
  switch (mission.type) {
    case 'complete_tasks':
      if (task.status === 'completed') {
        newProgress += 1;
      }
      break;
      
    case 'complete_early':
      if (task.status === 'completed' && task.completedDate && task.dueDate) {
        const completionDate = new Date(task.completedDate);
        const dueDate = new Date(task.dueDate);
        if (completionDate < dueDate) {
          newProgress += 1;
        }
      }
      break;
      
    case 'no_delays':
      // Esta missão é verificada no final da semana
      break;
      
    case 'review_peer_tasks':
      // Para esta missão, precisaria de um campo específico indicando que a tarefa era uma revisão
      // Por simplicidade, vamos considerar que tarefas com título contendo 'revisão' são revisões
      if (task.title.toLowerCase().includes('revisão') || task.title.toLowerCase().includes('review')) {
        newProgress += 1;
      }
      break;
      
    default:
      break;
  }
  
  // Verifica se a missão foi completada
  const completed = newProgress >= mission.target;
  
  return {
    ...mission,
    currentProgress: newProgress,
    completed
  };
}

/**
 * Verifica se uma missão do tipo "sem atrasos" foi cumprida
 * @param missions Array de missões do usuário
 * @param tasks Tarefas do usuário na semana
 * @returns Missões atualizadas
 */
export function checkNoDelaysMission(missions: ActiveMission[], tasks: Task[]): ActiveMission[] {
  const noDelaysMission = missions.find(m => m.type === 'no_delays' && !m.completed);
  
  if (noDelaysMission) {
    // Conta quantas tarefas foram entregues com atraso
    const delayedTasks = tasks.filter(task => 
      task.status === 'overdue' || 
      (task.status === 'completed' && task.completedDate && task.dueDate && 
      new Date(task.completedDate) > new Date(task.dueDate))
    ).length;
    
    const completed = delayedTasks === 0;
    
    return missions.map(m => 
      m.id === noDelaysMission.id 
        ? { ...m, currentProgress: completed ? m.target : 0, completed } 
        : m
    );
  }
  
  return missions;
}

/**
 * Processa todas as missões semanais de um usuário
 * @param user Usuário
 * @param tasks Tarefas do usuário
 * @param missions Missões ativas do usuário
 * @returns Missões atualizadas e XP ganho com missões completadas
 */
export function processWeeklyMissions(
  user: User, 
  tasks: Task[], 
  missions: ActiveMission[]
): { updatedMissions: ActiveMission[]; xpGained: number } {
  
  let updatedMissions = [...missions];
  let totalXpGained = 0;
  
  // Atualiza o progresso de missões baseadas em tarefas completadas
  for (const task of tasks) {
    for (const mission of updatedMissions) {
      if (!mission.completed) {
        const updatedMission = updateMissionProgress(mission, task);
        const index = updatedMissions.findIndex(m => m.id === mission.id);
        updatedMissions[index] = updatedMission;
        
        // Se a missão foi completada agora, adiciona XP
        if (!mission.completed && updatedMission.completed) {
          totalXpGained += updatedMission.xpReward;
          
          // Marca a data de conclusão
          updatedMissions[index] = {
            ...updatedMission,
            completedAt: new Date().toISOString()
          };
        }
      }
    }
  }
  
  // Processa missão de "sem atrasos"
  updatedMissions = checkNoDelaysMission(updatedMissions, tasks);
  
  // Verifica novamente se alguma missão "sem atrasos" foi completada
  for (const mission of updatedMissions) {
    if (!mission.completed && mission.type === 'no_delays' && mission.currentProgress === mission.target) {
      totalXpGained += mission.xpReward;
      
      const index = updatedMissions.findIndex(m => m.id === mission.id);
      updatedMissions[index] = {
        ...mission,
        completed: true,
        completedAt: new Date().toISOString()
      };
    }
  }
  
  return {
    updatedMissions,
    xpGained: totalXpGained
  };
}

/**
 * Gera um relatório de missões do usuário
 * @param missions Missões ativas do usuário
 * @returns Relatório com status das missões
 */
export function generateMissionReport(missions: ActiveMission[]) {
  const totalMissions = missions.length;
  const completedMissions = missions.filter(m => m.completed).length;
  const activeMissions = missions.filter(m => !m.completed);
  const completedThisWeek = missions.filter(m => m.completed && m.completedAt && isThisWeek(m.completedAt)).length;
  
  return {
    totalMissions,
    completedMissions,
    activeMissions,
    completedThisWeek,
    completionRate: totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0
  };
}

/**
 * Verifica se uma data está na semana atual
 * @param dateString Data a ser verificada
 * @returns Verdadeiro se a data estiver na semana atual
 */
function isThisWeek(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  
  // Define o primeiro dia da semana (domingo)
  firstDayOfWeek.setDate(today.getDate() - today.getDay());
  firstDayOfWeek.setHours(0, 0, 0, 0);
  
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  
  return date >= firstDayOfWeek && date <= lastDayOfWeek;
}