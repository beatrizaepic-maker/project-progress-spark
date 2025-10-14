import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { TaskData } from '@/data/projectData';
import { getTasksData, saveTasksData, getUserMissions, saveUserMissions } from '@/services/localStorageData';
import { toast } from '@/hooks/use-toast';
import { kpiCalculator, KPIResults } from '@/services/kpiCalculator';
import { kpiErrorHandler } from '@/services/errorHandler';
import { 
  updateMissionProgress, 
  processWeeklyMissions, 
  createWeeklyMissionsForUser,
  getAvailableMissions
} from '@/services/missionService';
import { Task, calculateRankingXpFromTasks } from '@/services/gamificationService';
import { addSimpleXpHistory } from '@/services/xpHistoryService';
import { resolveUserIdByName, getGamificationUsers, saveGamificationUsers } from '@/services/localStorageData';

interface DataContextType {
  tasks: TaskData[];
  metrics: {
    totalTarefas: number;
    tarefasNoPrazo: number;
    tarefasAtrasadas: number;
    mediaProducao: number;
    mediaAtrasos: number;
    desvioPadrao: number;
    moda: number;
    mediana: number;
  };
  kpiResults: KPIResults | null;
  dataQuality: {
    totalTasks: number;
    completeTasks: number;
    validTasks: number;
    hasMinimumData: boolean;
    completionRate: number;
    validityRate: number;
  };
  updateTasks: (newTasks: TaskData[]) => void;
  addTask: (task: Omit<TaskData, 'id'> & { fim?: string }) => void;
  editTask: (id: number, task: Partial<TaskData>) => void;
  deleteTask: (id: number) => void;
  importData: (data: TaskData[]) => void;
  exportData: () => string;
  recalculateMetrics: () => void;
  validateData: () => boolean;
  getErrorHistory: () => any[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
  initialTasks: TaskData[];
}

const calculateWorkDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workDays = 0;
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      workDays++;
    }
  }
  
  return workDays;
};

const calculateDelay = (endDate: string, deadline: string): number => {
  const end = new Date(endDate);
  const due = new Date(deadline);
  
  if (end <= due) return 0;
  
  let delayDays = 0;
  for (let d = new Date(due); d < end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      delayDays++;
    }
  }
  
  return delayDays;
};

// Função para calcular métricas em tempo real a partir dos dados atuais
const calculateMetrics = (tasks: TaskData[]) => {
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
  
  return {
    totalTarefas,
    tarefasNoPrazo,
    tarefasAtrasadas,
    mediaProducao,
    mediaAtrasos,
    desvioPadrao,
    moda,
    mediana
  };
};

// Função para garantir IDs únicos
const ensureUniqueIds = (tasks: TaskData[]): TaskData[] => {
  const idMap = new Map<number, boolean>();
  let maxId = 0;
  
  // Primeiro, encontrar o ID máximo
  for (const task of tasks) {
    maxId = Math.max(maxId, task.id);
    if (idMap.has(task.id)) {
      // Se encontrar um ID duplicado, vamos corrigir
      let newId = maxId + 1;
      while (idMap.has(newId)) {
        newId++;
      }
      idMap.set(newId, true);
      maxId = newId;
    } else {
      idMap.set(task.id, true);
    }
  }
  
  // Se houver IDs duplicados, reconstruir com IDs únicos
  if (tasks.length !== idMap.size) {
    const uniqueTasks: TaskData[] = [];
    const usedIds = new Set<number>();
    
    for (const task of tasks) {
      if (usedIds.has(task.id)) {
        // Gerar novo ID único
        let newId = maxId + 1;
        while (usedIds.has(newId)) {
          newId++;
        }
        uniqueTasks.push({ ...task, id: newId });
        usedIds.add(newId);
        maxId = newId;
      } else {
        uniqueTasks.push(task);
        usedIds.add(task.id);
      }
    }
    
    return uniqueTasks;
  }
  
  return tasks;
};

export const DataProvider: React.FC<DataProviderProps> = ({ children, initialTasks }) => {
  const [tasks, setTasks] = useState<TaskData[]>(ensureUniqueIds(initialTasks));
  const [metrics, setMetrics] = useState(calculateMetrics(initialTasks));
  const [kpiResults, setKpiResults] = useState<KPIResults | null>(null);
  const [dataQuality, setDataQuality] = useState({
    totalTasks: 0,
    completeTasks: 0,
    validTasks: 0,
    hasMinimumData: false,
    completionRate: 0,
    validityRate: 0
  });

  const validateData = useCallback(() => {
    // Validação básica - verificar se todas as tarefas têm campos obrigatórios
    const hasValidTasks = tasks.every(task => 
      task.tarefa && 
      task.inicio && 
      task.prazo && 
      task.status
    );
    return hasValidTasks;
  }, [tasks]);

  const calculateDataQuality = useCallback(() => {
    const totalTasks = tasks.length;
    const completeTasks = tasks.filter(t => t.fim !== '' && t.inicio !== '' && t.prazo !== '').length;
    const validTasks = tasks.filter(t => {
      // Verifica se todos os campos obrigatórios estão preenchidos e válidos
      return t.fim !== '' && 
             t.inicio !== '' && 
             t.prazo !== '' &&
             !isNaN(t.duracaoDiasUteis) &&
             !isNaN(t.atrasoDiasUteis) &&
             new Date(t.inicio).getTime() <= new Date(t.fim).getTime();
    }).length;

    const completionRate = totalTasks > 0 ? (completeTasks / totalTasks) * 100 : 0;
    const validityRate = totalTasks > 0 ? (validTasks / totalTasks) * 100 : 0;
    const hasMinimumData = completeTasks >= 3; // Mínimo de 3 tarefas completas

    setDataQuality({
      totalTasks,
      completeTasks,
      validTasks,
      hasMinimumData,
      completionRate,
      validityRate
    });

    return { totalTasks, completeTasks, validTasks, hasMinimumData };
  }, [tasks]);

  const recalculateMetrics = useCallback(() => {
    // Calcula qualidade dos dados
    const quality = calculateDataQuality();
    
    if (tasks.length === 0) {
      setKpiResults(null);
      return;
    }

    // Se não há dados suficientes, não calcula KPIs avançados
    if (!quality.hasMinimumData) {
      console.warn('Dados insuficientes para cálculo de KPIs avançados', {
        minimum: 3,
        current: quality.completeTasks,
        operation: 'recalculateMetrics'
      });
    }

    // Calcula KPIs usando o novo sistema
    const results = kpiCalculator.calculateAll(tasks);
    setKpiResults(results);

    // Mantém compatibilidade com métricas antigas
    const totalTarefas = tasks.length;
    const tarefasNoPrazo = tasks.filter(t => t.atendeuPrazo).length;
    const tarefasAtrasadas = tasks.filter(t => !t.atendeuPrazo).length;
    const mediaProducao = results.averageProduction;
    const mediaAtrasos = results.averageDelay;
    const desvioPadrao = results.standardDeviation;
    const moda = results.mode.value;
    const mediana = results.median;

    setMetrics({
      totalTarefas,
      tarefasNoPrazo,
      tarefasAtrasadas,
      mediaProducao,
      mediaAtrasos,
      desvioPadrao,
      moda,
      mediana,
    });
  }, [tasks, calculateDataQuality]);

  const updateTasks = useCallback((newTasks: TaskData[]) => {
    // Recalculate derived fields
    const updatedTasks = newTasks.map(task => ({
      ...task,
      duracaoDiasUteis: calculateWorkDays(task.inicio, task.fim),
      atrasoDiasUteis: calculateDelay(task.fim, task.prazo),
      atendeuPrazo: new Date(task.fim) <= new Date(task.prazo)
    }));
    
    // Garantir IDs únicos
    const uniqueTasks = ensureUniqueIds(updatedTasks);
    
    setTasks(uniqueTasks);
    // Persistir e notificar
    try { saveTasksData(uniqueTasks); } catch {}
  }, [ensureUniqueIds]);

  const addTask = useCallback((task: Omit<TaskData, 'id'> & { fim?: string }) => {
    // Valida dados da nova tarefa
    if (!task.tarefa || !task.inicio || !task.prazo) {
      toast({
        title: "Erro ao adicionar tarefa",
        description: "Todos os campos obrigatórios devem ser preenchidos.",
        variant: "destructive"
      });
      return;
    }

    // Gera ID único mais robusto
    let newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    while (tasks.some(t => t.id === newId)) {
      newId++;
    }
    const newTask: TaskData = {
      ...task,
      id: newId,
      prioridade: task.prioridade || 'media', // Valor padrão para prioridade
      duracaoDiasUteis: task.fim ? calculateWorkDays(task.inicio, task.fim) : 0,
      atrasoDiasUteis: task.fim ? calculateDelay(task.fim, task.prazo) : 0,
      atendeuPrazo: task.fim ? new Date(task.fim) <= new Date(task.prazo) : true
    };
    
    setTasks(prev => {
      const next = [...prev, newTask];
      try { saveTasksData(next); } catch {}
      return next;
    });
    toast({
      title: "Tarefa adicionada",
      description: `${task.tarefa} foi adicionada com sucesso.`,
      className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
      duration: 3000
    });
  }, [tasks]);



  const editTask = useCallback((id: number, updates: Partial<TaskData>) => {
    setTasks(prev => {
      const next = prev.map(task => {
      if (task.id === id) {
        const updated = { ...task, ...updates };
        return {
          ...updated,
          duracaoDiasUteis: calculateWorkDays(updated.inicio, updated.fim),
          atrasoDiasUteis: calculateDelay(updated.fim, updated.prazo),
          atendeuPrazo: new Date(updated.fim) <= new Date(updated.prazo)
        };
      }
        return task;
      });
      
      // Garantir IDs únicos antes de salvar
      const uniqueTasks = ensureUniqueIds(next);
      
      try { 
        // Salvar antes de processar missões
        saveTasksData(uniqueTasks); 
        
        // Processar missões se o status da tarefa mudou para 'completed'
        const originalTask = prev.find(t => t.id === id);
        const updatedTask = uniqueTasks.find(t => t.id === id);
        
        if (originalTask && updatedTask && 
            originalTask.status !== 'completed' && 
            updatedTask.status === 'completed' &&
            updatedTask.responsavel) {
            
          // Resolver ID do usuário com base no nome do responsável
          const userId = resolveUserIdByName(updatedTask.responsavel);
          if (userId) {
            try {
              // Converter TaskData para o formato Task necessário para o sistema de missões
              const gamificationTask: Task = {
                id: String(updatedTask.id),
                title: updatedTask.tarefa,
                status: 'completed',
                completedDate: updatedTask.fim ? new Date(updatedTask.fim).toISOString() : undefined,
                dueDate: updatedTask.prazo ? new Date(updatedTask.prazo).toISOString() : '',
                assignedTo: userId,
                completedEarly: updatedTask.fim && updatedTask.prazo 
                  ? new Date(updatedTask.fim) < new Date(updatedTask.prazo) 
                  : undefined,
              };
              
              // Obter missões ativas do usuário
              let userMissions = getUserMissions(userId);
              
              // Garantir que o usuário tenha instâncias de missões configuradas que possam ser afetadas por tarefas completadas
              const allMissionConfigs = getAvailableMissions();
              const taskRelatedTypes = ['complete_tasks', 'complete_early', 'review_peer_tasks', 'no_delays']; // Tipos afetados por tarefas completadas
              
              for (const config of allMissionConfigs) {
                if (taskRelatedTypes.includes(config.type) && config.isActive) {
                  // Verificar se o usuário já tem uma instância dessa configuração
                  const existingMission = userMissions.find(m => m.configId === config.type && !m.completed);
                  
                  if (!existingMission) {
                    // Criar uma nova instância dessa missão para o usuário
                    const newMissionId = `mission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${config.type}`;
                    const today = new Date();
                    const endOfWeek = new Date(today);
                    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
                    endOfWeek.setHours(23, 59, 59, 999);
                    
                    userMissions.push({
                      id: newMissionId,
                      userId,
                      configId: config.type,
                      type: config.type as any,
                      name: config.name,
                      description: config.description,
                      target: config.target,
                      currentProgress: 0,
                      xpReward: config.xpReward,
                      deadline: endOfWeek.toISOString(),
                      completed: false,
                      createdAt: new Date().toISOString()
                    });
                  }
                }
              }
              
              // Processar as missões com a nova tarefa
              const user = getGamificationUsers().find(u => u.id === userId);
              if (user) {
                // Atualizar progresso de missões individualmente com base na nova tarefa
                const updatedMissions = userMissions.map(mission => {
                  if (!mission.completed) {
                    return updateMissionProgress(mission, gamificationTask);
                  }
                  return mission;
                });
                
                // Verificar se alguma missão foi completada e adicionar XP
                let missionsCompletedCount = 0;
                for (const mission of updatedMissions) {
                  if (!mission.completed && mission.currentProgress >= mission.target) {
                    // Marcar como completada
                    mission.completed = true;
                    mission.completedAt = new Date().toISOString();
                    
                    // Adicionar XP ao histórico
                    addSimpleXpHistory(userId, mission.xpReward, 'mission', mission.name, { missionId: mission.id });
                    
                    missionsCompletedCount++;
                  }
                }
                
                // Salvar missões atualizadas
                saveUserMissions(userId, updatedMissions);
                
                // Atualizar o XP total e missões completadas do usuário
                const allUsers = getGamificationUsers();
                const userIndex = allUsers.findIndex(u => u.id === userId);
                if (userIndex !== -1) {
                  // Recalcular XP baseado nas tarefas
                  const userTasks = uniqueTasks.filter(t => resolveUserIdByName(t.responsavel) === userId).map(t => {
                    const taskId = String(t.id);
                    return {
                      id: taskId,
                      title: t.tarefa,
                      status: t.status === 'completed' ? 'completed' : t.status === 'refacao' ? 'refacao' : t.prazo && new Date(t.prazo) < new Date() ? 'overdue' : 'pending',
                      completedDate: t.fim ? new Date(t.fim).toISOString() : undefined,
                      dueDate: t.prazo ? new Date(t.prazo).toISOString() : '',
                      assignedTo: userId,
                      completedEarly: t.fim && t.prazo ? new Date(t.fim) < new Date(t.prazo) : undefined,
                    };
                  });
                  
                  // Recalcular XP baseado nas tarefas
                  const newXp = calculateRankingXpFromTasks(userTasks);
                  allUsers[userIndex].xp = newXp;
                  
                  // Incrementar missões completadas
                  allUsers[userIndex].missionsCompleted = (allUsers[userIndex].missionsCompleted || 0) + missionsCompletedCount;
                  
                  saveGamificationUsers(allUsers);
                }
              }
            } catch (error) {
              console.error('Erro ao processar missões:', error);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao salvar tarefas ou processar missões:', error);
      }
      
      return uniqueTasks;
    });
    
    toast({
      title: "Tarefa atualizada",
      description: "As informações foram salvas com sucesso."
    });
  }, [ensureUniqueIds, resolveUserIdByName, getUserMissions, getGamificationUsers, createWeeklyMissionsForUser, updateMissionProgress, addSimpleXpHistory, saveUserMissions, saveGamificationUsers, calculateRankingXpFromTasks]);

  const deleteTask = useCallback((id: number) => {
    setTasks(prev => {
      const next = prev.filter(task => task.id !== id);
      try { saveTasksData(next); } catch {}
      return next;
    });
    toast({
      title: "Tarefa removida",
      description: "A tarefa foi removida com sucesso."
    });
  }, []);

  const importData = useCallback((data: TaskData[]) => {
    // Valida dados antes de importar
    const hasValidData = data.every(task => 
      task.tarefa && 
      task.inicio && 
      task.prazo && 
      task.status
    );
    
    if (!hasValidData) {
      toast({
        title: "Erro na importação",
        description: "Dados inválidos encontrados. Verifique se todos os campos obrigatórios estão preenchidos.",
        variant: "destructive"
      });
      return;
    }

    // Garantir IDs únicos ao importar
    const uniqueData = ensureUniqueIds(data);
    updateTasks(uniqueData);
    toast({
      title: "Dados importados",
      description: `${uniqueData.length} tarefas foram importadas com sucesso.`
    });
  }, [updateTasks, ensureUniqueIds]);

  const exportData = useCallback(() => {
    return JSON.stringify(tasks, null, 2);
  }, [tasks]);

  const getErrorHistory = useCallback(() => {
    return kpiCalculator.getErrorHistory();
  }, []);

  // Recalculate metrics whenever tasks change
  React.useEffect(() => {
    recalculateMetrics();
  }, [tasks, recalculateMetrics]);

  // Ouvir alterações globais em tarefas e recarregar do localStorage
  React.useEffect(() => {
    const handler = () => {
      try {
        const latest = getTasksData();
        setTasks(latest);
      } catch {}
    };
    window.addEventListener('tasks:changed', handler);
    return () => window.removeEventListener('tasks:changed', handler);
  }, []);

  return (
    <DataContext.Provider value={{
      tasks,
      metrics,
      kpiResults,
      dataQuality,
      updateTasks,
      addTask,
      editTask,
      deleteTask,
      importData,
      exportData,
      recalculateMetrics,
      validateData,
      getErrorHistory
    }}>
      {children}
    </DataContext.Provider>
  );
};