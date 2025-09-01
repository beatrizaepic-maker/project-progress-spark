import Charts from "@/components/dashboard/Charts";
import { DataProvider, useData } from "@/contexts/DataContext";
import { mockTaskData } from "@/data/projectData";
import { useAnalyticsKPIs } from "@/hooks/useKPIs";
import KPILoadingIndicator from "@/components/ui/kpi-loading-indicator";
import { KPITimestampDetailed } from "@/components/ui/kpi-timestamp";
import { KPIVersionIndicator } from "@/components/ui/kpi-version-indicator";
import { toast } from "@/hooks/use-toast";

const AnalyticsContent = () => {
  const { tasks } = useData();
  
  const analyticsKPIs = useAnalyticsKPIs(tasks, {
    debounceMs: 500, // Maior debounce para analytics (gráficos mais pesados)
    cacheTTL: 10 * 60 * 1000, // 10 minutos de cache
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
      {/* Header com Status */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Análise Visual</h2>
            <p className="text-muted-foreground">Visualização detalhada dos dados de duração, atrasos e performance</p>
          </div>
          <KPILoadingIndicator
            isCalculating={analyticsKPIs.isCalculating}
            lastUpdated={analyticsKPIs.lastUpdated}
            cacheHit={analyticsKPIs.cacheHit}
            variant="badge"
          />
        </div>
        
        {/* Timestamp e Versionamento Detalhado para Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <KPITimestampDetailed
            lastUpdated={analyticsKPIs.lastUpdated}
            isCalculating={analyticsKPIs.isCalculating}
            calculationId={analyticsKPIs.calculationId}
            processingTime={analyticsKPIs.processingTime}
            cacheHit={analyticsKPIs.cacheHit}
            showDetails={true}
          />
          
          {analyticsKPIs.calculationId && analyticsKPIs.calculationVersion && (
            <div className="bg-gray-50 rounded-lg p-3 border">
              <h4 className="text-sm font-semibold mb-2">Informações de Versionamento</h4>
              <KPIVersionIndicator
                calculationId={analyticsKPIs.calculationId}
                calculationVersion={analyticsKPIs.calculationVersion}
                lastUpdated={analyticsKPIs.lastUpdated}
                processingTime={analyticsKPIs.processingTime}
                cacheHit={analyticsKPIs.cacheHit}
                dataHash={analyticsKPIs.dataHash}
                totalTasks={analyticsKPIs.totalTasks}
              />
            </div>
          )}
        </div>
        
        <Charts />
      </section>

      {/* Insights Adicionais */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Resumo Estatístico</h3>
          <p className="text-muted-foreground mb-4">Principais métricas calculadas automaticamente</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Média de Produção:</span>
              <span className="font-mono text-sm">{analyticsKPIs.averageProduction.toFixed(1)} dias</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Moda:</span>
              <span className="font-mono text-sm">{analyticsKPIs.mode.value} dias ({analyticsKPIs.mode.frequency}x)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Mediana:</span>
              <span className="font-mono text-sm">{analyticsKPIs.median.toFixed(1)} dias</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Desvio Padrão:</span>
              <span className="font-mono text-sm">{analyticsKPIs.standardDeviation.toFixed(1)} dias</span>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Status do Sistema</h3>
          <p className="text-muted-foreground mb-4">Informações sobre o processamento dos dados</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`text-sm font-medium ${
                analyticsKPIs.isCalculating ? 'text-blue-600' : 'text-green-600'
              }`}>
                {analyticsKPIs.isCalculating ? 'Processando' : 'Atualizado'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Fonte dos Dados:</span>
              <span className="text-sm font-mono">
                {analyticsKPIs.cacheHit ? 'Cache' : 'Recalculado'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Última Atualização:</span>
              <span className="text-sm font-mono">
                {analyticsKPIs.lastUpdated.toLocaleTimeString('pt-BR')}
              </span>
            </div>
            <button
              onClick={analyticsKPIs.invalidateCache}
              className="w-full mt-4 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              Forçar Recálculo
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

const Analytics = () => {
  return (
    <DataProvider initialTasks={mockTaskData}>
      <AnalyticsContent />
    </DataProvider>
  );
};

export default Analytics;