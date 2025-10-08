// src/services/gamificationService.ts

// Interface para representar uma tarefa
export interface Task {
  id: string;
  title: string;
  status: 'completed' | 'overdue' | 'pending'; // Status que afetam o XP
  completedDate?: string; // Data de conclusão
  dueDate: string; // Data de vencimento
  assignedTo: string; // ID do usuário responsável
  completedEarly?: boolean; // Se a tarefa foi completada antes do prazo
}

// Interface para representar um usuário
export interface User {
  id: string;
  name: string;
  avatar: string;
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

// Regras de níveis (XP necessário para cada nível)
const LEVEL_RULES: LevelRule[] = [
  { level: 1, xpRequired: 0, name: "Iniciante" },
  { level: 2, xpRequired: 100, name: "Aprendiz" },
  { level: 3, xpRequired: 250, name: "Intermediário" },
  { level: 4, xpRequired: 500, name: "Avançado" },
  { level: 5, xpRequired: 1000, name: "Expert" },
  { level: 6, xpRequired: 2000, name: "Mestre" },
  { level: 7, xpRequired: 4000, name: "Grão-Mestre" },
  { level: 8, xpRequired: 8000, name: "Lendário" }
];

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

/**
 * Calcula o nível baseado no XP acumulado
 * @param xp XP acumulado
 * @returns O nível do usuário
 */
export function calculateLevelFromXp(xp: number): number {
  // Encontrar o maior nível com XP necessário menor ou igual ao XP do usuário
  let level = 1;
  for (const rule of LEVEL_RULES) {
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
export function getLevelProgress(xp: number): { 
  currentLevel: number, 
  currentLevelXp: number, 
  nextLevelXp: number, 
  progressPercentage: number 
} {
  const currentLevel = calculateLevelFromXp(xp);
  const currentLevelRule = LEVEL_RULES.find(rule => rule.level === currentLevel);
  const nextLevelRule = LEVEL_RULES.find(rule => rule.level === currentLevel + 1);
  
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
export function updateRanking(users: User[], tasks: Task[]): User[] {
  return users.map(user => {
    // Encontra tarefas do usuário
    const userTasks = tasks.filter(task => task.assignedTo === user.id);
    
    // Calcula XP total baseado nas tarefas
    let totalXp = user.xp;
    let weeklyXp = user.weeklyXp || 0;
    
    // Verifica tarefas que ainda não foram pontuadas
    for (const task of userTasks) {
      // Aqui seria necessário ter um controle de quais tarefas já foram pontuadas
      // Para esta implementação simplificada, assumimos que todas as tarefas
      // concluídas devem gerar XP
      if (task.status === 'completed' || task.status === 'overdue') {
        const taskXp = calculateXpForTask(task);
        totalXp += taskXp;
        
        // Atualiza XP semanal (lógica simplificada)
        if (isThisWeek(task.dueDate || task.completedDate)) {
          weeklyXp += taskXp;
        }
      }
    }
    
    // Calcula o novo nível
    const newLevel = calculateLevelFromXp(totalXp);
    
    // Calcula o bônus de consistência
    const consistencyBonus = calculateConsistencyBonus(user.streak);
    
    return {
      ...user,
      xp: totalXp,
      level: newLevel,
      weeklyXp,
      consistencyBonus
    };
  });
}

/**
 * Verifica se uma data está na semana atual
 * @param date Data a ser verificada
 * @returns Verdadeiro se a data estiver na semana atual
 */
function isThisWeek(dateString: string | undefined): boolean {
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