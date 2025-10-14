import React, { useState, useRef, Fragment } from 'react';
import Charts from "@/components/dashboard/Charts";
import { DataProvider, useData } from "@/contexts/DataContext";
import { getTasksData } from "@/services/localStorageData";
import { useAnalyticsKPIs } from "@/hooks/useKPIs";
import KPILoadingIndicator from "@/components/ui/kpi-loading-indicator";
import { motion, AnimatePresence } from "framer-motion";
import { KPIVersionIndicator } from "@/components/ui/kpi-version-indicator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Componente de partículas de explosão
function SuccessParticles({ buttonRef }: { buttonRef: React.RefObject<HTMLButtonElement> }) {
  const rect = buttonRef.current?.getBoundingClientRect();
  if (!rect) return null;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const particleCount = 46;

  return (
    <AnimatePresence>
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="particle"
          style={{
            left: centerX,
            top: centerY,
            position: "fixed",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            backgroundColor: "#FF0066",
            zIndex: 9999,
          }}
          initial={{
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            scale: [0, 1, 0],
            x: [0, (Math.random() - 0.5) * 150],
            y: [0, (Math.random() - 0.5) * 150],
          }}
          transition={{
            duration: 1.8,
            delay: i * 0.04,
            ease: "easeOut",
          }}
        />
      ))}
    </AnimatePresence>
  );
}

const AnalyticsContent = () => {
  const { tasks } = useData();
  // Importa o contexto de autenticação
  const { user } = useAuth();
  const [showParticles, setShowParticles] = useState(false);
  const [isButtonHidden, setIsButtonHidden] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Garantir que temos dados suficientes para os cálculos
  const validTasks = tasks.filter(task => 
    task.tarefa && 
    task.inicio && 
    task.prazo && 
    task.status
  );
  
  const analyticsKPIs = useAnalyticsKPIs(validTasks, {
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
          duration: 3000,
          className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] text-white rounded-none shadow-lg"
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

  const handleRecalculoClick = () => {
    setShowParticles(true);
    setIsButtonHidden(true);
    
    analyticsKPIs.invalidateCache();
    
    // Partículas desaparecem em 1.6 segundos
    setTimeout(() => {
      setShowParticles(false);
    }, 1600);
    
    // Botão reaparece após 1800ms
    setTimeout(() => {
      setIsButtonHidden(false);
    }, 1800);
  };

  return (
    <main className="container mx-auto px-6 py-8 space-y-8">
      {showParticles && <SuccessParticles buttonRef={buttonRef} />}
      {/* Header com Status */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Análise Visual</h2>
            <p className="text-muted-foreground">Visualização detalhada dos dados de duração, atrasos e performance</p>
          </div>
          {/* Exibe o badge apenas se o usuário for DEV */}
          {user?.role === 'dev' && (
            <KPILoadingIndicator
              isCalculating={analyticsKPIs.isCalculating}
              lastUpdated={analyticsKPIs.lastUpdated}
              cacheHit={analyticsKPIs.cacheHit}
              variant="badge"
            />
          )}
        </div>
        
        {/* Timestamp e Versionamento Detalhado para Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center h-10 w-10 text-orange-600 bg-orange-100 rounded-lg">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="kpi-title text-white text-sm">Última Atualização</h4>
                <p className="kpi-subtitle text-light-gray text-xs mt-1">
                  {analyticsKPIs.lastUpdated.toLocaleDateString('pt-BR')} às {analyticsKPIs.lastUpdated.toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="card-content text-light-gray text-sm">Status:</span>
                <span className={`kpi-value text-lg ${analyticsKPIs.isCalculating ? 'text-blue-400' : 'text-green-400'}`}>
                  {analyticsKPIs.isCalculating ? '⚡ Recalculando' : '✅ Atualizado'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="card-content text-light-gray text-sm">Fonte:</span>
                <span className="kpi-value text-white text-lg">
                  {analyticsKPIs.cacheHit ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Cache
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Tempo Real
                    </span>
                  )}
                </span>
              </div>
              
              {analyticsKPIs.processingTime && (
                <div className="flex justify-between items-center">
                  <span className="card-content text-light-gray text-sm">Tempo de Processamento:</span>
                  <span className="kpi-value text-white text-lg">{analyticsKPIs.processingTime}ms</span>
                </div>
              )}
            </div>
            
            {/* Efeito de brilho sutil */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
          
          {analyticsKPIs.calculationId && analyticsKPIs.calculationVersion && (
            <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center h-10 w-10 text-purple-600 bg-purple-100 rounded-lg">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="kpi-title text-white text-sm">Informações de Versionamento</h4>
                  <p className="kpi-subtitle text-light-gray text-xs mt-1">Detalhes técnicos do processamento</p>
                </div>
              </div>
              <KPIVersionIndicator
                calculationId={analyticsKPIs.calculationId}
                calculationVersion={analyticsKPIs.calculationVersion}
                lastUpdated={analyticsKPIs.lastUpdated}
                processingTime={analyticsKPIs.processingTime}
                cacheHit={analyticsKPIs.cacheHit}
                dataHash={analyticsKPIs.dataHash}
                totalTasks={analyticsKPIs.totalTasks}
              />
              {/* Efeito de brilho sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          )}
        </div>
        
        <Charts />
      </section>

      {/* Insights Adicionais */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200 hover:shadow-lg">
          {/* Header com ícone e título */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center h-12 w-12 text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:text-purple-400 hover:bg-purple-500/20 transition-all duration-200">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="kpi-title text-white text-sm">Resumo Estatístico</h3>
              <p className="kpi-subtitle text-light-gray text-xs mt-1">Principais métricas calculadas automaticamente</p>
            </div>
          </div>

          {/* Métricas */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="card-content text-light-gray text-sm">Média de Produção:</span>
              <span className="kpi-value text-white text-lg">{analyticsKPIs.averageProduction.toFixed(1)} dias</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="card-content text-light-gray text-sm">Moda:</span>
              <span className="kpi-value text-white text-lg">{analyticsKPIs.mode.value} dias ({analyticsKPIs.mode.frequency}x)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="card-content text-light-gray text-sm">Mediana:</span>
              <span className="kpi-value text-white text-lg">{analyticsKPIs.median.toFixed(1)} dias</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="card-content text-light-gray text-sm">Desvio Padrão:</span>
              <span className="kpi-value text-white text-lg">{analyticsKPIs.standardDeviation.toFixed(1)} dias</span>
            </div>
          </div>

          {/* Efeito de brilho sutil */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
        
        <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200 hover:shadow-lg">
          {/* Header com ícone e título */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center h-12 w-12 text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:text-purple-400 hover:bg-purple-500/20 transition-all duration-200">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="kpi-title text-white text-sm">Status do Sistema</h3>
              <p className="kpi-subtitle text-light-gray text-xs mt-1">Informações sobre o processamento dos dados</p>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="card-content text-light-gray text-sm">Status:</span>
              <span className={`kpi-value text-lg ${
                analyticsKPIs.isCalculating ? 'text-blue-400' : 'text-green-400'
              }`}>
                {analyticsKPIs.isCalculating ? '⚡ Processando' : '✅ Atualizado'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="card-content text-light-gray text-sm">Fonte dos Dados:</span>
              <span className="kpi-value text-white text-lg">
                {analyticsKPIs.cacheHit ? '💾 Cache' : '🔄 Recalculado'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="card-content text-light-gray text-sm">Última Atualização:</span>
              <span className="kpi-value text-white text-lg">
                {analyticsKPIs.lastUpdated.toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Ação */}
          <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            {!isButtonHidden && (
              <button
                ref={buttonRef}
                onClick={handleRecalculoClick}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                🔄 Forçar Recálculo
              </button>
            )}
          </div>

          {/* Efeito de brilho sutil */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </section>
    </main>
  );
};

const Analytics = () => {
  const taskData = getTasksData();
  return (
    <DataProvider initialTasks={taskData}>
      <AnalyticsContent />
    </DataProvider>
  );
};

export default Analytics;