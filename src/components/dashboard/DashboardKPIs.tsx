import React from 'react';
import { useDashboardKPIs } from '@/hooks/useKPIs';
import { TaskData } from '@/data/projectData';
import ProjectDeadlineCard from './ProjectDeadlineCard';
import AverageDelayCard from './AverageDelayCard';
import StandardDeviationCard from './StandardDeviationCard';

interface DashboardKPIsProps {
  tasks: TaskData[];
}

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ tasks }) => {
  const kpis = useDashboardKPIs(tasks);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectDeadlineCard
        deadlineStatus={kpis.projectDeadlineStatus}
        completionPercentage={kpis.projectCompletionPercentage}
        lastUpdated={kpis.lastUpdated}
      />
      
      <AverageDelayCard
        averageDelay={kpis.averageDelay}
        lastUpdated={kpis.lastUpdated}
        // Em uma implementação real, previousAverageDelay viria de dados históricos
        previousAverageDelay={kpis.averageDelay * 1.1} // Simulando valor anterior
      />
      
      <StandardDeviationCard
        standardDeviation={kpis.standardDeviation}
        averageProduction={kpis.averageDelay} // Usando como proxy para média de produção
        lastUpdated={kpis.lastUpdated}
      />
    </div>
  );
};

export default DashboardKPIs;