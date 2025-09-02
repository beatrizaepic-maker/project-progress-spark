import React, { useState } from 'react';
import { useDashboardKPIs, useKPIMonitoring } from '@/hooks/useKPIs';
import { TaskData } from '@/data/projectData';
import KPILoadingIndicator from '@/components/ui/kpi-loading-indicator';
import { useIsMobile } from '@/hooks/use-mobile';

interface KPIDebugSectionProps {
  tasks: TaskData[];
}

const KPIDebugSection: React.FC<KPIDebugSectionProps> = ({ tasks }) => {
  const [showMonitoring, setShowMonitoring] = useState(false);
  const monitoring = useKPIMonitoring();
  const isMobile = useIsMobile();

  const kpis = useDashboardKPIs(tasks, {
    debounceMs: 300,
    cacheTTL: 5 * 60 * 1000, // 5 minutos
    enableCache: true,
  });

  return (
    <div className="space-y-6">
      {/* Indicador de Status dos KPIs */}
      <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-4' : ''}`}>
        <KPILoadingIndicator
          isCalculating={kpis.isCalculating}
          lastUpdated={kpis.lastUpdated}
          cacheHit={kpis.cacheHit}
          variant="detailed"
          className={isMobile ? 'w-full' : 'flex-1'}
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
            className={`${isMobile ? 'w-full' : 'ml-4'} px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-200 transform hover:scale-105`}
          >
            {showMonitoring ? 'Ocultar' : 'Mostrar'} Debug
          </button>
        )}
      </div>

      {/* Painel de Monitoramento (apenas em desenvolvimento) */}
      {showMonitoring && process.env.NODE_ENV === 'development' && (
        <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200 hover:shadow-lg">
          {/* Header com ícone e título */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center h-12 w-12 text-purple-600 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="kpi-title text-white text-sm">
                  Debug - Monitoramento
                </h3>
                <p className="kpi-subtitle text-light-gray text-xs mt-1">
                  Métricas de performance dos KPIs
                </p>
              </div>
            </div>
          </div>

          {/* Métricas principais */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="kpi-value text-white text-2xl">
                {monitoring.calculationCount}
              </div>
              <div className="kpi-subtitle text-light-gray text-xs mt-1">
                Cálculos Realizados
              </div>
            </div>
            <div className="text-center">
              <div className="kpi-value text-white text-2xl">
                {monitoring.cacheMetrics.hitRate}%
              </div>
              <div className="kpi-subtitle text-light-gray text-xs mt-1">
                Taxa de Cache Hit
              </div>
            </div>
            <div className="text-center">
              <div className="kpi-value text-white text-2xl">
                {monitoring.averageCalculationTime}ms
              </div>
              <div className="kpi-subtitle text-light-gray text-xs mt-1">
                Tempo Médio
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={kpis.invalidateCache}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              🗑️ Limpar Cache
            </button>
          </div>

          {/* Efeito de brilho sutil */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      )}

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

export default KPIDebugSection;