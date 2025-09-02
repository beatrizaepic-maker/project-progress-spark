import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { TaskData, projectMetrics as initialMetrics } from '@/data/projectData';
import { toast } from '@/hooks/use-toast';
import { kpiCalculator, KPIResults } from '@/services/kpiCalculator';
import { kpiErrorHandler } from '@/services/errorHandler';

interface DataContextType {
  tasks: TaskData[];
  metrics: typeof initialMetrics;
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
  addTask: (task: Omit<TaskData, 'id'>) => void;
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

export const DataProvider: React.FC<DataProviderProps> = ({ children, initialTasks }) => {
  const [tasks, setTasks] = useState<TaskData[]>(initialTasks);
  const [metrics, setMetrics] = useState(initialMetrics);
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
    const validation = kpiErrorHandler.validateTaskData(tasks);
    return validation.isValid;
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
      kpiErrorHandler.handleInsufficientData(3, quality.completeTasks, {
        operation: 'recalculateMetrics',
        totalTasks: quality.totalTasks
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
    
    setTasks(updatedTasks);
  }, []);

  const addTask = useCallback((task: Omit<TaskData, 'id'>) => {
    // Valida dados da nova tarefa
    if (!task.tarefa || !task.inicio || !task.prazo) {
      toast({
        title: "Erro ao adicionar tarefa",
        description: "Todos os campos obrigatórios devem ser preenchidos.",
        variant: "destructive"
      });
      return;
    }

    const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
    const newTask: TaskData = {
      ...task,
      id: newId,
      duracaoDiasUteis: task.fim ? calculateWorkDays(task.inicio, task.fim) : 0,
      atrasoDiasUteis: task.fim ? calculateDelay(task.fim, task.prazo) : 0,
      atendeuPrazo: task.fim ? new Date(task.fim) <= new Date(task.prazo) : true
    };
    
    setTasks(prev => [...prev, newTask]);
    toast({
      title: "Tarefa adicionada",
      description: `${task.tarefa} foi adicionada com sucesso.`
    });
  }, [tasks]);

  const editTask = useCallback((id: number, updates: Partial<TaskData>) => {
    setTasks(prev => prev.map(task => {
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
    }));
    
    toast({
      title: "Tarefa atualizada",
      description: "As informações foram salvas com sucesso."
    });
  }, []);

  const deleteTask = useCallback((id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast({
      title: "Tarefa removida",
      description: "A tarefa foi removida com sucesso."
    });
  }, []);

  const importData = useCallback((data: TaskData[]) => {
    // Valida dados antes de importar
    const validation = kpiErrorHandler.validateTaskData(data);
    
    if (!validation.isValid) {
      toast({
        title: "Erro na importação",
        description: `${validation.errors.length} erro(s) encontrado(s) nos dados.`,
        variant: "destructive"
      });
      return;
    }

    updateTasks(data);
    toast({
      title: "Dados importados",
      description: `${data.length} tarefas foram importadas com sucesso.`
    });
  }, [updateTasks]);

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