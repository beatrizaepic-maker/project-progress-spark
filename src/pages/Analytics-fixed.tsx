import React from 'react';
import Charts from "@/components/dashboard/Charts";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { useAnalyticsKPIs } from "@/hooks/useKPIs";
import KPILoadingIndicator from "@/components/ui/kpi-loading-indicator";
import { KPIVersionIndicator } from "@/components/ui/kpi-version-indicator";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";

const AnalyticsContent = () => {
  const { tasks, isLoading, refreshData, lastUpdate, connectionStatus } = useGlobalContext();
  const { toast } = useToast();
  
  const analyticsKPIs = useAnalyticsKPIs(tasks, {
    debounceMs: 500,
    cacheTTL: 10 * 60 * 1000,
    enableCache: true,
    onCalculationStart: () => {
      toast({
        title: "Atualizando Analytics",
        description: "Recalculando gráficos e estatísticas...",
        duration: 2000
      });
    },
    onCalculationComplete: (results) => {
      toast({
        title: "Analytics Atualizado",
        description: `Gráficos atualizados com dados de ${results.totalTasks} tarefas`,
        duration: 3000
      });
    },
    onError: (error) => {
      toast({
        title: "Erro na Análise",
        description: "Falha ao processar dados para analytics.",
        variant: "destructive",
        duration: 5000
      });
      console.error('Erro no cálculo de KPIs de Analytics:', error);
    }
  });

  return (
    <main className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Análise Visual</h2>
            <p className="text-muted-foreground">Visualização detalhada dos dados de duração, atrasos e performance</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="flex items-center space-x-1">
                <BarChart3 className="h-3 w-3" />
                <span>{tasks.length} Tarefas</span>
              </Badge>
              
              <Badge variant="outline" className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>Cache: {analyticsKPIs.isCalculating ? 'Calculando...' : 'Ativo'}</span>
              </Badge>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              disabled={isLoading || analyticsKPIs.isCalculating}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${(isLoading || analyticsKPIs.isCalculating) ? 'animate-spin' : ''}`} />
              <span>Atualizar Dados</span>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mb-6">
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
            Status: {connectionStatus}
          </Badge>
          
          <span className="text-sm text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </span>
          
          {analyticsKPIs.isCalculating && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Processando Gráficos...</span>
            </Badge>
          )}
        </div>
        
        <KPILoadingIndicator
          isCalculating={analyticsKPIs.isCalculating}
          lastUpdated={analyticsKPIs.lastUpdated}
          cacheHit={analyticsKPIs.cacheHit}
          variant="badge"
        />
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center h-10 w-10 text-orange-600 bg-orange-100 rounded-lg">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Média de Produção</h3>
              <p className="text-sm text-muted-foreground">Tempo médio por tarefa</p>
            </div>
          </div>
          <span className="text-2xl font-bold">{analyticsKPIs.averageProduction.toFixed(1)} dias</span>
        </div>

        <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center h-10 w-10 text-blue-600 bg-blue-100 rounded-lg">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Moda Estatística</h3>
              <p className="text-sm text-muted-foreground">Duração mais comum</p>
            </div>
          </div>
          <span className="text-2xl font-bold">{analyticsKPIs.mode.value} dias ({analyticsKPIs.mode.frequency}x)</span>
        </div>

        <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center h-10 w-10 text-green-600 bg-green-100 rounded-lg">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Mediana</h3>
              <p className="text-sm text-muted-foreground">Valor central</p>
            </div>
          </div>
          <span className="text-2xl font-bold">{analyticsKPIs.median.toFixed(1)} dias</span>
        </div>

        <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center h-10 w-10 text-purple-600 bg-purple-100 rounded-lg">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Desvio Padrão</h3>
              <p className="text-sm text-muted-foreground">Variação dos dados</p>
            </div>
          </div>
          <span className="text-2xl font-bold">{analyticsKPIs.standardDeviation.toFixed(1)} dias</span>
        </div>
      </section>

      {/* Status e Controles */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center h-10 w-10 text-orange-600 bg-orange-100 rounded-lg">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Status do Cálculo</h3>
              <p className="text-sm text-muted-foreground">Estado atual dos KPIs</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`text-sm font-medium ${
                analyticsKPIs.isCalculating ? 'text-blue-400' : 'text-green-400'
              }`}>
                {analyticsKPIs.isCalculating ? '⚡ Processando' : '✅ Atualizado'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cache:</span>
              <span className="text-sm font-medium text-purple-400">
                {analyticsKPIs.cacheHit ? '💾 Cache' : '🔄 Recalculado'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Última Atualização:</span>
              <span className="text-sm font-medium text-blue-400">
                {analyticsKPIs.lastUpdated.toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Controles Avançados</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={analyticsKPIs.invalidateCache}
              className="text-xs"
            >
              Limpar Cache
            </Button>
          </div>
          <KPIVersionIndicator 
            version={analyticsKPIs.version}
            className="w-full"
          />
        </div>
      </section>

      {/* Gráficos */}
      <section>
        <Charts />
      </section>
    </main>
  );
};

const Analytics = () => {
  return <AnalyticsContent />;
};

export default Analytics;
