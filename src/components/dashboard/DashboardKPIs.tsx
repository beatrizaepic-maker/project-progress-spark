import React from 'react';
import { useDashboardKPIs, useKPIMonitoring } from '@/hooks/useKPIs';
import { TaskData } from '@/data/projectData';
import ProjectDeadlineCard from './ProjectDeadlineCard';
import AverageDelayCard from './AverageDelayCard';
import StandardDeviationCard from './StandardDeviationCard';
import { KPIRecalculationIndicator } from '@/components/ui/kpi-recalculation-indicator';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardKPIsProps {
  tasks: TaskData[];
}

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ tasks }) => {
  const monitoring = useKPIMonitoring();
  const isMobile = useIsMobile();

  const kpis = useDashboardKPIs(tasks, {
    debounceMs: 300,
    cacheTTL: 5 * 60 * 1000, // 5 minutos
    enableCache: true,
    onCalculationStart: () => {
      monitoring.onCalculationStart();
      toast({
        title: "Recalculando KPIs",
        description: "Atualizando métricas do dashboard...",
        duration: 2000
      });
    },
    onCalculationComplete: (results) => {
      monitoring.onCalculationComplete(results);
        toast({
          title: "✅ KPIs Atualizados",
          description: `Dashboard atualizado com ${results.totalTasks} tarefas`,
          className:
            "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
          duration: 3000,
        });
    },
    onError: (error) => {
      toast({
        title: "Erro no Cálculo",
        description: "Falha ao calcular KPIs. Usando valores anteriores.",
        variant: "destructive",
        duration: 5000
      });
      console.error('Erro no cálculo de KPIs do Dashboard:', error);
    }
  });

  return (
    <div className="space-y-6">
      {/* Indicador de Recálculo em Tempo Real */}
      <KPIRecalculationIndicator
        isCalculating={kpis.isCalculating}
        lastUpdated={kpis.lastUpdated}
        calculationId={kpis.calculationId}
        processingTime={kpis.processingTime}
        cacheHit={kpis.cacheHit}
        onForceRecalculation={kpis.invalidateCache}
        variant="floating"
        showDetails={true}
      />

      {/* Grid de KPI Cards */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        <ProjectDeadlineCard
          deadlineStatus={kpis.projectDeadlineStatus}
          completionPercentage={kpis.projectCompletionPercentage}
          lastUpdated={kpis.lastUpdated}
          isCalculating={kpis.isCalculating}
          calculationId={kpis.calculationId}
          processingTime={kpis.processingTime}
          cacheHit={kpis.cacheHit}
          calculationVersion={kpis.calculationVersion}
        />
        
        <AverageDelayCard
          averageDelay={kpis.averageDelay}
          lastUpdated={kpis.lastUpdated}
          // Em uma implementação real, previousAverageDelay viria de dados históricos
          isCalculating={kpis.isCalculating}
          calculationId={kpis.calculationId}
          processingTime={kpis.processingTime}
          cacheHit={kpis.cacheHit}
          calculationVersion={kpis.calculationVersion}
        />
        
        <StandardDeviationCard
          standardDeviation={kpis.standardDeviation}
          averageProduction={kpis.averageDelay} // Usando como proxy para média de produção
          lastUpdated={kpis.lastUpdated}
          isCalculating={kpis.isCalculating}
          calculationId={kpis.calculationId}
          processingTime={kpis.processingTime}
          cacheHit={kpis.cacheHit}
          calculationVersion={kpis.calculationVersion}
        />
      </div>


    </div>
  );
};

export default DashboardKPIs;