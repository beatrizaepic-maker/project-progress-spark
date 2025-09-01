import { useMemo } from 'react';
import { TaskData } from '@/data/projectData';
import { KPICalculator, KPIResults, KPIConfig } from '@/services/kpiCalculator';

/**
 * Hook personalizado para calcular KPIs baseado nos dados das tarefas
 */
export const useKPIs = (
  tasks: TaskData[], 
  config?: Partial<KPIConfig>
): KPIResults => {
  const kpiResults = useMemo(() => {
    const calculator = new KPICalculator(config);
    return calculator.calculateAll(tasks);
  }, [tasks, config]);

  return kpiResults;
};

/**
 * Hook para obter apenas KPIs do dashboard
 */
export const useDashboardKPIs = (tasks: TaskData[]) => {
  const allKPIs = useKPIs(tasks);
  
  return useMemo(() => ({
    projectDeadlineStatus: allKPIs.projectDeadlineStatus,
    projectCompletionPercentage: allKPIs.projectCompletionPercentage,
    averageDelay: allKPIs.averageDelay,
    standardDeviation: allKPIs.standardDeviation,
    lastUpdated: allKPIs.lastUpdated,
    totalTasks: allKPIs.totalTasks,
    completedTasks: allKPIs.completedTasks
  }), [allKPIs]);
};

/**
 * Hook para obter apenas KPIs de analytics
 */
export const useAnalyticsKPIs = (tasks: TaskData[]) => {
  const allKPIs = useKPIs(tasks);
  
  return useMemo(() => ({
    averageProduction: allKPIs.averageProduction,
    mode: allKPIs.mode,
    median: allKPIs.median,
    delayDistribution: allKPIs.delayDistribution,
    standardDeviation: allKPIs.standardDeviation,
    lastUpdated: allKPIs.lastUpdated
  }), [allKPIs]);
};

/**
 * Hook para obter apenas KPIs de tarefas
 */
export const useTaskKPIs = (tasks: TaskData[]) => {
  const allKPIs = useKPIs(tasks);
  
  return useMemo(() => ({
    taskDetails: allKPIs.taskDetails,
    averageDelay: allKPIs.averageDelay,
    lastUpdated: allKPIs.lastUpdated
  }), [allKPIs]);
};