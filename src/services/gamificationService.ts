// src/services/gamificationService.ts
import { getPercentageForClass } from '@/config/gamification';
import { getUserStreakXpLifetime, getUserStreakXpThisMonth, getUserStreakXpThisWeek, getStreakIncludeIn } from '@/config/streak';
import { supabase } from '@/lib/supabase';

// Interface para representar uma tarefa
export interface Task {
  id: string;
  title: string;
  status: 'completed' | 'overdue' | 'pending' | 'refacao'; // Adicionado status de Refação
  completedDate?: string; // Data de conclusão
  dueDate: string; // Data de vencimento
  assignedTo: string; // ID do usuário responsável
  completedEarly?: boolean; // Se a tarefa foi completada antes do prazo
}

// Interface para representar um usuário
export interface User {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  weeklyXp: number;
  monthlyXp: number;
  missionsCompleted: number;
  consistencyBonus: number;
  streak: number;
}

// Interface para representar uma missão
export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  deadline: string;
  userId?: string; // Se for uma missão específica de usuário
}

// Interface para representar o histórico de XP
export interface XpHistory {
  id: string;
  userId: string;
  xp: number;
  source: 'task' | 'mission' | 'bonus' | 'penalty' | 'streak';
  description: string;
  timestamp: string;
}

// Interface para regras de níveis
export interface LevelRule {
  level: number;
  xpRequired: number;
  name: string;
}

// Regras de pontuação por status de tarefa
const XP_RULES = {
  completed_on_time: 10,      // Tarefa completada no prazo
  completed_early: 15,        // Tarefa completada antes do prazo
  completed_late: 5,          // Tarefa completada após o prazo
  not_completed: 0,           // Tarefa não completada
  penalty_late: -5            // Penalização por atraso significativo
};

// Função para obter as regras de níveis do Supabase
export async function getLevelRules(): Promise<LevelRule[]> {
  try {
    const { data, error } = await supabase.from('level_rules').select('*');
    if (error) throw error;
    return data as LevelRule[];
  } catch (error) {
    console.warn('Tabela level_rules não encontrada ou erro, usando regras padrão:', error);
    // Retorna regras de nível padrão se a tabela não existir
    return [
      { level: 1, xpRequired: 0, name: "Iniciante" },
      { level: 2, xpRequired: 100, name: "Aprendiz" },
      { level: 3, xpRequired: 300, name: "Estagiário" },
      { level: 4, xpRequired: 600, name: "Júnior" },
      { level: 5, xpRequired: 1000, name: "Pleno" },
      { level: 6, xpRequired: 1500, name: "Sênior" },
      { level: 7, xpRequired: 2100, name: "Especialista" },
      { level: 8, xpRequired: 2800, name: "Líder" },
      { level: 9, xpRequired: 3600, name: "Especialista Sênior" },
      { level: 10, xpRequired: 4500, name: "Diretor" }
    ];
  }
}

// Função para definir as regras de níveis no Supabase
export async function setLevelRules(newRules: LevelRule[]): Promise<void> {
  try {
    const { error } = await supabase.from('level_rules').upsert(newRules, { onConflict: 'level' });
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar regras de níveis:', error);
  }
}

/**
 * Calcula o XP ganho com base no status da tarefa
 * @param task Tarefa a ser analisada
 * @returns Pontos de XP ganhos/negativos
 */
export function calculateXpForTask(task: Task): number {
  // Verifica se a tarefa foi concluída antes do prazo
  if (task.status === 'completed' && task.completedDate && task.dueDate) {
    const completionDate = new Date(task.completedDate);
    const dueDate = new Date(task.dueDate);
    
    if (completionDate < dueDate) {
      // Completada antes do prazo - bônus
      return XP_RULES.completed_early;
    } else {
      // Completada no prazo ou após
      return XP_RULES.completed_on_time;
    }
  } else if (task.status === 'completed') {
    // Completada mas sem data de vencimento definida
    return XP_RULES.completed_on_time;
  } else if (task.status === 'overdue') {
    // Atrasada - penalidade
    return XP_RULES.penalty_late;
  }
  
  // Não completada
  return XP_RULES.not_completed;
}

// ------------------- NOVA LÓGICA DE PRODUTIVIDADE (PERCENTUAL → XP) -------------------

/**
 * Classifica a entrega da tarefa com base nas datas e status.
 * early = 100%, on_time = 90%, late = 50%, refacao = 40% (quando marcada como refação e reconcluída)
 */
export function classifyTaskDelivery(task: Task): 'early' | 'on_time' | 'late' | 'refacao' | 'ignore' {
  // Tarefas em refação não contam até serem reconcluídas; se não há completedDate, ignorar
  if (task.status === 'refacao') return 'ignore';

  if (task.status === 'completed') {
    if (!task.dueDate || !task.completedDate) return 'on_time';
    const completionDate = new Date(task.completedDate);
    const dueDate = new Date(task.dueDate);
    if (completionDate.getTime() < dueDate.getTime()) return 'early';
    if (completionDate.getTime() === dueDate.getTime()) return 'on_time';
    return 'late';
  }

  // Overdue não concluída não entra no denominador
  return 'ignore';
}

/**
 * Retorna o percentual de produtividade por tarefa conforme a classificação.
 */
export async function calculateProductivityPercentForTask(task: Task): Promise<number> {
  const cls = classifyTaskDelivery(task);
  switch (cls) {
    case 'early':
      return await getPercentageForClass('early');
    case 'on_time':
      return await getPercentageForClass('on_time');
    case 'late':
      return await getPercentageForClass('late');
    case 'refacao':
      return await getPercentageForClass('refacao');
    default:
      return NaN; // Ignorar na média
  }
}

/**
 * Arredonda half-up para inteiro.
 */
export function roundHalfUp(value: number): number {
  return Math.floor(value + 0.5);
}

/**
 * Calcula o XP de ranking do usuário a partir da média percentual das tarefas
 * XP = roundHalfUp((somaPercentuais / totalTarefas) * 10)
 */
export async function calculateRankingXpFromTasks(tasks: Task[]): Promise<number> {
  let sum = 0;
  let count = 0;
  for (const t of tasks) {
    const pct = await calculateProductivityPercentForTask(t);
    if (!Number.isNaN(pct)) {
      // clamp 0–100
      const clamped = Math.max(0, Math.min(100, pct));
      sum += clamped;
      count += 1;
    }
  }
  if (count === 0) return 0;
  const average = sum / count;
  const xp = roundHalfUp(average * 10);
  return Math.max(0, xp);
}

/**
 * Calcula métricas de produtividade do usuário a partir das tarefas.
 * Retorna total de tarefas consideradas, soma dos percentuais, média (raw) e média arredondada.
 * Importante: ignora tarefas não concluídas, overdue não concluídas e em refação (até reconclusão).
 */
export async function calculateUserProductivity(tasks: Task[]): Promise<{
  totalConsidered: number;
  sumPercent: number;
  averagePercentRaw: number;
  averagePercentRounded: number;
}> {
  let sum = 0;
  let count = 0;
  for (const t of tasks) {
    const pct = await calculateProductivityPercentForTask(t);
    if (!Number.isNaN(pct)) {
      const clamped = Math.max(0, Math.min(100, pct));
      sum += clamped;
      count += 1;
    }
  }
  const average = count > 0 ? sum / count : 0;
  return {
    totalConsidered: count,
    sumPercent: sum,
    averagePercentRaw: average,
    averagePercentRounded: roundHalfUp(average)
  };
}

/**
 * Calcula o nível do usuário com base no XP acumulado (ASYNC versão)
 * @param xp XP acumulado
 * @returns O nível do usuário
 */
export async function calculateLevelFromXp(xp: number): Promise<number> {
  // Encontrar o maior nível com XP necessário menor ou igual ao XP do usuário
  const levelRules = await getLevelRules();
  let level = 1;
  
  for (const rule of levelRules) {
    if (xp >= rule.xpRequired) {
      level = rule.level;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Calcula o nível do usuário com base no XP acumulado (SINCRONOUS versão)
 * Usa regras padrão de nível para funcionamento sincronous sem await
 * @param xp XP acumulado
 * @returns O nível do usuário
 */
export function calculateLevelFromXpSync(xp: number): number {
  // Regras de nível padrão (sem fazer query ao banco)
  const defaultLevelRules = [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 100 },
    { level: 3, xpRequired: 300 },
    { level: 4, xpRequired: 600 },
    { level: 5, xpRequired: 1000 },
    { level: 6, xpRequired: 1500 },
    { level: 7, xpRequired: 2100 },
    { level: 8, xpRequired: 2800 },
    { level: 9, xpRequired: 3600 },
    { level: 10, xpRequired: 4500 }
  ];

  let level = 1;
  for (const rule of defaultLevelRules) {
    if (xp >= rule.xpRequired) {
      level = rule.level;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Calcula o progresso para o próximo nível
 * @param xp XP acumulado
 * @returns Um objeto com o nível atual, XP atual, XP necessário e percentual de progresso
 */
export async function getLevelProgress(xp: number): Promise<{ 
  currentLevel: number, 
  currentLevelXp: number, 
  nextLevelXp: number, 
  progressPercentage: number 
}> {
  const levelRules = await getLevelRules();
  const currentLevel = await calculateLevelFromXp(xp);
  const currentLevelRule = levelRules.find(rule => rule.level === currentLevel);
  const nextLevelRule = levelRules.find(rule => rule.level === currentLevel + 1);
  
  if (!currentLevelRule) {
    return { 
      currentLevel: 1, 
      currentLevelXp: 0, 
      nextLevelXp: 100, 
      progressPercentage: xp / 100 * 100 
    };
  }
  
  if (!nextLevelRule) {
    // Usuário atingiu o nível máximo
    return { 
      currentLevel: currentLevel, 
      currentLevelXp: xp - currentLevelRule.xpRequired, 
      nextLevelXp: 0, 
      progressPercentage: 100 
    };
  }
  
  const xpInCurrentLevel = xp - currentLevelRule.xpRequired;
  const xpForNextLevel = nextLevelRule.xpRequired - currentLevelRule.xpRequired;
  const progressPercentage = (xpInCurrentLevel / xpForNextLevel) * 100;
  
  return {
    currentLevel,
    currentLevelXp: xpInCurrentLevel,
    nextLevelXp: xpForNextLevel,
    progressPercentage: Math.min(progressPercentage, 100)
  };
}

/**
 * Calcula o bônus de consistência baseado na sequência de dias ativos
 * @param streak Número de dias consecutivos de atividade
 * @returns Bônus de XP
 */
export function calculateConsistencyBonus(streak: number): number {
  // Bônus aumenta com a sequência, mas com um limite
  if (streak >= 7) {
    return Math.min(50, streak); // Máximo de 50 pontos de bônus
  } else if (streak >= 3) {
    return Math.min(20, streak * 2); // Até 20 pontos para 7-10 dias
  } else {
    return 0; // Sem bônus para menos de 3 dias
  }
}

/**
 * Aplica penalizações por atrasos
 * @param daysOverdue Número de dias de atraso
 * @returns Valor de XP a ser penalizado
 */
export function calculatePenalty(daysOverdue: number): number {
  // Penalidade maior quanto maior o atraso
  if (daysOverdue >= 7) {
    return -10; // Alta penalidade para atrasos muito grandes
  } else if (daysOverdue >= 3) {
    return -5; // Penalidade média para atrasos moderados
  } else if (daysOverdue > 0) {
    return -2; // Penalidade leve para pequenos atrasos
  }
  return 0; // Sem penalidade
}

/**
 * Verifica se uma missão semanal foi cumprida
 * @param tasks Tarefas do usuário
 * @param mission Missão a ser verificada
 * @returns Verdadeiro se a missão foi cumprida
 */
export function checkWeeklyMissionCompletion(tasks: Task[], mission: Mission): boolean {
  // Exemplo de missão: "Completar 3 tarefas adiantadas"
  if (mission.title.includes("adiantadas")) {
    const earlyCompletedTasks = tasks.filter(task => 
      task.status === 'completed' && 
      task.completedEarly
    );
    return earlyCompletedTasks.length >= 3;
  }
  
  // Exemplo de missão: "Completar 5 tarefas no prazo"
  if (mission.title.includes("no prazo")) {
    const onTimeCompletedTasks = tasks.filter(task => 
      task.status === 'completed' && 
      task.completedDate && 
      task.dueDate && 
      new Date(task.completedDate) <= new Date(task.dueDate)
    );
    return onTimeCompletedTasks.length >= 5;
  }
  
  // Implementar lógica para outros tipos de missões conforme necessário
  
  return false;
}

/**
 * Atualiza os dados do ranking com base nas tarefas
 * @param users Usuários existentes
 * @param tasks Tarefas recentes
 * @returns Usuários atualizados com novos XP e níveis
 */
export async function updateRanking(users: User[], tasks: Task[]): Promise<User[]> {
  const updatedUsers = [];
  
  for (const user of users) {
    const streakInclude = await getStreakIncludeIn();
    // Encontra tarefas do usuário
    const userTasks = tasks.filter(task => task.assignedTo === user.id);
    
    // Novo cálculo: XP de ranking baseado na média percentual das tarefas concluídas
    const rankingXpBase = await calculateRankingXpFromTasks(userTasks);
    const streakLifetime = await getUserStreakXpLifetime(user.id);
    const rankingXp = rankingXpBase + (streakInclude.total ? streakLifetime : 0);

    // XP semanal calculado com base apenas nas tarefas da semana
    const weeklyTasks = userTasks.filter(t => isThisWeek(t.completedDate || t.dueDate));
    const weeklyXpBase = await calculateRankingXpFromTasks(weeklyTasks);
    const weeklyStreak = await getUserStreakXpThisWeek(user.id);
    const weeklyXp = weeklyXpBase + (streakInclude.weekly ? weeklyStreak : 0);

    // XP mensal calculado com base nas tarefas do mês corrente
    const monthlyTasks = userTasks.filter(t => isThisMonth(t.completedDate || t.dueDate));
    const monthlyXpBase = await calculateRankingXpFromTasks(monthlyTasks);
    const monthlyStreak = await getUserStreakXpThisMonth(user.id);
    const monthlyXp = monthlyXpBase + (streakInclude.monthly ? monthlyStreak : 0);

    // Nível calculado a partir do XP de ranking
    const newLevel = await calculateLevelFromXp(rankingXp);
    
    // Calcula o bônus de consistência
    const consistencyBonus = calculateConsistencyBonus(user.streak);
    
    updatedUsers.push({
      ...user,
      xp: rankingXp,
      level: newLevel,
      weeklyXp,
      monthlyXp,
      consistencyBonus
    });
  }
  
  return updatedUsers;
}

/**
 * Verifica se uma data está na semana atual
 * @param date Data a ser verificada
 * @returns Verdadeiro se a data estiver na semana atual
 */
export function isThisWeek(dateString: string | undefined): boolean {
  if (!dateString) return false;
  
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

/**
 * Verifica se uma data está no mês atual
 */
export function isThisMonth(dateString: string | undefined): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
}

// ------------------- HELPERS DE FLUXO: REFAÇÃO -------------------

/**
 * Move a tarefa para estado de refação. Remove a data de conclusão anterior (se houver)
 * para que não seja mais considerada no cálculo até reconclusão.
 * Idempotente: se já está em refação, não altera.
 */
export function enterRefacao(tasks: Task[], taskId: string): Task[] {
  return tasks.map(t => {
    if (t.id !== taskId) return t;
    if (t.status === 'refacao') return t; // idempotente
    return {
      ...t,
      status: 'refacao',
      completedDate: undefined,
    };
  });
}

/**
 * Reconclui uma tarefa em refação. Define nova data de conclusão e, se permitido,
 * atualiza o prazo (política controlada pela página /controle).
 */
export function reconcludeTask(
  tasks: Task[],
  taskId: string,
  newCompletedDate: string,
  options?: { allowDueDateRecalc?: boolean; newDueDate?: string }
): Task[] {
  return tasks.map(t => {
    if (t.id !== taskId) return t;
    const allowDueDateRecalc = !!options?.allowDueDateRecalc;
    const next: Task = {
      ...t,
      status: 'completed',
      completedDate: newCompletedDate,
      dueDate: allowDueDateRecalc && options?.newDueDate ? options.newDueDate : t.dueDate,
    };
    return next;
  });
}

/**
 * Retorna a distribuição de entregas (para exibição no perfil):
 * early, on_time, late, refacao (itens em refação não contam no denominador da média, mas
 * entram aqui apenas para indicador de estado).
 */
export function getDeliveryDistribution(tasks: Task[]): {
  early: number;
  on_time: number;
  late: number;
  refacao: number;
} {
  let early = 0, on_time = 0, late = 0, refacao = 0;
  for (const t of tasks) {
    if (t.status === 'refacao') { refacao++; continue; }
    const cls = classifyTaskDelivery(t);
    if (cls === 'early') early++;
    else if (cls === 'on_time') on_time++;
    else if (cls === 'late') late++;
  }
  return { early, on_time, late, refacao };
}