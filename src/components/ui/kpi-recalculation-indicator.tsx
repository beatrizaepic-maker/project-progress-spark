import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIRecalculationIndicatorProps {
  isCalculating: boolean;
  lastUpdated: Date;
  calculationId?: string;
  processingTime?: number;
  cacheHit?: boolean;
  onForceRecalculation?: () => void;
  className?: string;
  variant?: 'floating' | 'inline' | 'toast';
  showDetails?: boolean;
}

/**
 * Componente para indicar quando os KPIs estão sendo recalculados
 * Mostra indicador visual em tempo real durante o processo
 */
export const KPIRecalculationIndicator: React.FC<KPIRecalculationIndicatorProps> = ({
  isCalculating,
  lastUpdated,
  calculationId,
  processingTime,
  cacheHit = false,
  onForceRecalculation,
  className = '',
  variant = 'inline',
  showDetails = false
}) => {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [calculationStartTime, setCalculationStartTime] = useState<Date | null>(null);

  // Simula progresso durante o cálculo
  useEffect(() => {
    if (isCalculating) {
      setCalculationStartTime(new Date());
      setProgress(0);
      setElapsedTime(0);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          // Simula progresso não-linear (rápido no início, mais lento no final)
          const increment = Math.max(1, (100 - prev) * 0.1);
          return Math.min(95, prev + increment); // Para em 95% até completar
        });
      }, 100);

      const timeInterval = setInterval(() => {
        setElapsedTime(prev => prev + 100);
      }, 100);

      return () => {
        clearInterval(progressInterval);
        clearInterval(timeInterval);
      };
    } else {
      // Completa o progresso quando termina
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
        setCalculationStartTime(null);
        setElapsedTime(0);
      }, 1000);
    }
  }, [isCalculating]);

  // Determina a cor baseada no tempo de processamento
  const getPerformanceColor = (time: number): string => {
    if (time < 1000) return 'text-green-600'; // < 1s
    if (time < 3000) return 'text-yellow-600'; // < 3s
    return 'text-red-600'; // > 3s
  };

  // Formata o tempo decorrido
  const formatElapsedTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (variant === 'floating') {
    return (
      <div className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-300",
        isCalculating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
        className
      )}>
        <div className="bg-white dark:bg-gray-800 shadow-lg border p-4 min-w-[280px]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
              {progress > 0 && (
                <div className="absolute inset-0 border-2 border-transparent border-t-blue-500"
                     style={{ transform: `rotate(${(progress / 100) * 360}deg)` }} />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Recalculando KPIs</span>
                <span className="text-xs text-gray-500">
                  {formatElapsedTime(elapsedTime)}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {showDetails && calculationId && (
                <div className="text-xs text-gray-500 mt-1">
                  ID: {calculationId.slice(-8)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'toast') {
    if (!isCalculating) return null;
    
    return (
      <div className={cn(
        "fixed top-4 right-4 z-50 bg-blue-50 border border-blue-200 p-3 shadow-lg",
        "animate-in slide-in-from-right-full duration-300",
        className
      )}>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-800">
            Atualizando KPIs... {formatElapsedTime(elapsedTime)}
          </span>
        </div>
      </div>
    );
  }

  // variant === 'inline'
  return (
    <div className={cn(
      "flex items-center gap-2 p-2 transition-all duration-200",
      isCalculating 
        ? "bg-blue-50 border border-blue-200 text-blue-800" 
        : "bg-green-50 border border-green-200 text-green-800",
      className
    )}>
      {isCalculating ? (
        <>
          <div className="relative">
            <RefreshCw className="w-4 h-4 animate-spin" />
            {progress > 0 && showDetails && (
              <div className="absolute -inset-1 border border-blue-300"
                   style={{ 
                     background: `conic-gradient(from 0deg, #3b82f6 ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`,
                     opacity: 0.3
                   }} />
            )}
          </div>
          
          <div className="flex-1">
            <span className="text-sm font-medium">
              Recalculando...
            </span>
            
            {showDetails && (
              <div className="flex items-center gap-2 text-xs mt-1">
                <span>{formatElapsedTime(elapsedTime)}</span>
                {progress > 0 && (
                  <>
                    <span>•</span>
                    <span>{Math.round(progress)}%</span>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4" />
          <div className="flex-1">
            <span className="text-sm font-medium">
              Atualizado
            </span>
            
            {showDetails && (
              <div className="flex items-center gap-2 text-xs mt-1">
                <Clock className="w-3 h-3" />
                <span>
                  {lastUpdated.toLocaleTimeString('pt-BR')}
                </span>
                
                {processingTime && (
                  <>
                    <span>•</span>
                    <span className={getPerformanceColor(processingTime)}>
                      {processingTime}ms
                    </span>
                  </>
                )}
                
                {cacheHit && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600">Cache</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {onForceRecalculation && (
            <button
              onClick={onForceRecalculation}
              className="p-1 hover:bg-green-100 transition-colors"
              title="Forçar recálculo"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Hook para controlar indicadores de recálculo
 */
export const useRecalculationIndicator = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const startCalculation = () => {
    setStartTime(new Date());
    setEndTime(null);
    setIsVisible(true);
  };

  const endCalculation = () => {
    setEndTime(new Date());
    // Mantém visível por mais 2 segundos após completar
    setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  };

  const getElapsedTime = (): number => {
    if (!startTime) return 0;
    const end = endTime || new Date();
    return end.getTime() - startTime.getTime();
  };

  return {
    isVisible,
    startCalculation,
    endCalculation,
    getElapsedTime,
    duration: endTime && startTime ? endTime.getTime() - startTime.getTime() : 0
  };
};

/**
 * Componente de status global de recálculo
 * Mostra quando qualquer KPI está sendo recalculado
 */
export const GlobalRecalculationStatus: React.FC<{
  activeCalculations: Array<{
    type: string;
    startTime: Date;
    progress?: number;
  }>;
  className?: string;
}> = ({ activeCalculations, className }) => {
  if (activeCalculations.length === 0) return null;

  const totalProgress = activeCalculations.reduce((sum, calc) => sum + (calc.progress || 0), 0) / activeCalculations.length;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-2",
      "transform transition-transform duration-300",
      className
    )}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">
            Atualizando {activeCalculations.length} KPI{activeCalculations.length > 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-24 bg-blue-500 h-1">
            <div 
              className="bg-white h-1 transition-all duration-200"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <span className="text-xs">
            {Math.round(totalProgress)}%
          </span>
        </div>
      </div>
    </div>
  );
};