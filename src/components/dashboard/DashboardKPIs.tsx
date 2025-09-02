import React, { useState } from 'react';
import { useDashboardKPIs, useKPIMonitoring } from '@/hooks/useKPIs';
import { TaskData } from '@/data/projectData';
import ProjectDeadlineCard from './ProjectDeadlineCard';
import AverageDelayCard from './AverageDelayCard';
import StandardDeviationCard from './StandardDeviationCard';
import KPILoadingIndicator from '@/components/ui/kpi-loading-indicator';
import { KPIRecalculationIndicator } from '@/components/ui/kpi-recalculation-indicator';
import { toast } from '@/hooks/use-toast';

interface DashboardKPIsProps {
  tasks: TaskData[];
}

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ tasks }) => {
  const [showMonitoring, setShowMonitoring] = useState(false);
  const monitoring = useKPIMonitoring();

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
        title: "KPIs Atualizados",
        description: `Dashboard atualizado com ${results.totalTasks} tarefas`,
        duration: 3000
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
      {/* Indicador de Status dos KPIs */}
      <div className="flex items-center justify-between">
        <KPILoadingIndicator
          isCalculating={kpis.isCalculating}
          lastUpdated={kpis.lastUpdated}
          cacheHit={kpis.cacheHit}
          variant="detailed"
          className="flex-1"
          calculationVersion={kpis.calculationVersion}
          showVersion={true}
          processingTime={kpis.processingTime}
          showProcessingTime={true}
          onRefresh={kpis.invalidateCache}
        />
        
        {/* Botão de Monitoramento (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => setShowMonitoring(!showMonitoring)}
            className="ml-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-200 transform hover:scale-105"
          >
            {showMonitoring ? 'Ocultar' : 'Mostrar'} Debug
          </button>
        )}
      </div>

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

      {/* Painel de Monitoramento (apenas em desenvolvimento) */}
      {showMonitoring && process.env.NODE_ENV === 'development' && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <h4 className="text-sm font-semibold mb-2">Debug - Monitoramento de KPIs</h4>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Cálculos:</span>
              <span className="ml-2 font-mono">{monitoring.calculationCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Cache Hit:</span>
              <span className="ml-2 font-mono">{monitoring.cacheMetrics.hitRate}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tempo Médio:</span>
              <span className="ml-2 font-mono">{monitoring.averageCalculationTime}ms</span>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={kpis.invalidateCache}
              className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
            >
              Limpar Cache
            </button>
          </div>
        </div>
      )}

      {/* Grid de KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          previousAverageDelay={kpis.averageDelay * 1.1} // Simulando valor anterior
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

      {/* Indicador Minimal na parte inferior */}
      <div className="flex justify-end">
        <KPILoadingIndicator
          isCalculating={kpis.isCalculating}
          lastUpdated={kpis.lastUpdated}
          cacheHit={kpis.cacheHit}
          variant="badge"
        />
      </div>
    </div>
  );
};

export default DashboardKPIs;