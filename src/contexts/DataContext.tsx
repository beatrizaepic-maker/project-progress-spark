import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { TaskData, projectMetrics as initialMetrics } from '@/data/projectData';
import { toast } from '@/hooks/use-toast';

interface DataContextType {
  tasks: TaskData[];
  metrics: typeof initialMetrics;
  updateTasks: (newTasks: TaskData[]) => void;
  addTask: (task: Omit<TaskData, 'id'>) => void;
  editTask: (id: number, task: Partial<TaskData>) => void;
  deleteTask: (id: number) => void;
  importData: (data: TaskData[]) => void;
  exportData: () => string;
  recalculateMetrics: () => void;
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

  const recalculateMetrics = useCallback(() => {
    if (tasks.length === 0) return;

    const totalTarefas = tasks.length;
    const tarefasNoPrazo = tasks.filter(t => t.atendeuPrazo).length;
    const tarefasAtrasadas = tasks.filter(t => !t.atendeuPrazo).length;
    const mediaProducao = tasks.reduce((acc, t) => acc + t.duracaoDiasUteis, 0) / totalTarefas;
    const mediaAtrasos = tasks.reduce((acc, t) => acc + t.atrasoDiasUteis, 0) / totalTarefas;
    
    // Calculate standard deviation
    const durations = tasks.map(t => t.duracaoDiasUteis);
    const mean = mediaProducao;
    const squaredDifferences = durations.map(d => Math.pow(d - mean, 2));
    const desvioPadrao = Math.sqrt(squaredDifferences.reduce((a, b) => a + b, 0) / totalTarefas);
    
    // Calculate mode (most frequent delay)
    const delays = tasks.map(t => t.atrasoDiasUteis);
    const delayCount = delays.reduce((acc, delay) => {
      acc[delay] = (acc[delay] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    const moda = parseInt(Object.keys(delayCount).reduce((a, b) => delayCount[parseInt(a)] > delayCount[parseInt(b)] ? a : b));
    
    // Calculate median
    const sortedDurations = [...durations].sort((a, b) => a - b);
    const mediana = totalTarefas % 2 === 0 
      ? (sortedDurations[totalTarefas / 2 - 1] + sortedDurations[totalTarefas / 2]) / 2
      : sortedDurations[Math.floor(totalTarefas / 2)];

    setMetrics({
      totalTarefas,
      tarefasNoPrazo,
      tarefasAtrasadas,
      mediaProducao: Math.round(mediaProducao * 10) / 10,
      mediaAtrasos: Math.round(mediaAtrasos * 10) / 10,
      desvioPadrao: Math.round(desvioPadrao * 10) / 10,
      moda,
      mediana: Math.round(mediana * 10) / 10,
    });
  }, [tasks]);

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
    const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
    const newTask: TaskData = {
      ...task,
      id: newId,
      duracaoDiasUteis: calculateWorkDays(task.inicio, task.fim),
      atrasoDiasUteis: calculateDelay(task.fim, task.prazo),
      atendeuPrazo: new Date(task.fim) <= new Date(task.prazo)
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
    updateTasks(data);
    toast({
      title: "Dados importados",
      description: `${data.length} tarefas foram importadas com sucesso.`
    });
  }, [updateTasks]);

  const exportData = useCallback(() => {
    return JSON.stringify(tasks, null, 2);
  }, [tasks]);

  // Recalculate metrics whenever tasks change
  React.useEffect(() => {
    recalculateMetrics();
  }, [tasks, recalculateMetrics]);

  return (
    <DataContext.Provider value={{
      tasks,
      metrics,
      updateTasks,
      addTask,
      editTask,
      deleteTask,
      importData,
      exportData,
      recalculateMetrics
    }}>
      {children}
    </DataContext.Provider>
  );
};