import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Clock, CheckCircle, AlertCircle, Database, Zap, History, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPILoadingIndicatorProps {
  isCalculating: boolean;
  lastUpdated: Date;
  cacheHit?: boolean;
  className?: string;
  variant?: 'minimal' | 'detailed' | 'badge' | 'timestamp';
  showLastUpdated?: boolean;
  calculationVersion?: string;
  onRefresh?: () => void;
  showVersion?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  processingTime?: number;
  showProcessingTime?: boolean;
}

const KPILoadingIndicator: React.FC<KPILoadingIndicatorProps> = ({
  isCalculating,
  lastUpdated,
  cacheHit = false,
  className,
  variant = 'minimal',
  showLastUpdated = true,
  calculationVersion,
  onRefresh,
  showVersion = false,
  autoRefresh = false,
  refreshInterval = 30000, // 30 segundos
  processingTime,
  showProcessingTime = false
}) => {
  const [timeAgo, setTimeAgo] = useState('');

  // Atualiza o tempo relativo periodicamente
  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(formatLastUpdated(lastUpdated));
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000); // Atualiza a cada segundo

    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Auto refresh se habilitado
  useEffect(() => {
    if (autoRefresh && onRefresh && !isCalculating) {
      const interval = setInterval(() => {
        onRefresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, onRefresh, isCalculating, refreshInterval]);
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
      return 'agora mesmo';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        {isCalculating ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
            <span>Recalculando...</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-3 w-3 text-green-500" />
            {showLastUpdated && (
              <span>Atualizado {timeAgo}</span>
            )}
            {cacheHit && (
              <span className="text-blue-500">(cache)</span>
            )}
          </>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors",
        isCalculating 
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
          : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
        className
      )}>
        {isCalculating ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            Calculando
          </>
        ) : (
          <>
            <CheckCircle className="h-3 w-3" />
            Atualizado
            {cacheHit && <span className="opacity-70">(cache)</span>}
          </>
        )}
      </div>
    );
  }

  if (variant === 'timestamp') {
    return (
      <div className={cn(
        "flex items-center justify-between p-2 rounded-md border bg-card text-card-foreground",
        className
      )}>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium">
              {isCalculating ? 'Recalculando...' : 'Última atualização'}
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{timeAgo}</span>
              {cacheHit && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    <span>Cache</span>
                  </div>
                </>
              )}
              {showVersion && calculationVersion && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <History className="h-3 w-3" />
                    <span>v{calculationVersion}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isCalculating ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <>
              <div className={cn(
                "w-2 h-2 rounded-full",
                cacheHit ? "bg-blue-500" : "bg-green-500"
              )} />
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                  title="Forçar recálculo"
                >
                  <RefreshCw className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // variant === 'detailed'
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border transition-colors",
      isCalculating 
        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800"
        : "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800",
      className
    )}>
      <div className="flex items-center gap-3">
        {isCalculating ? (
          <>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Recalculando KPIs
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Processando dados das tarefas...
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                KPIs Atualizados
              </p>
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <Clock className="h-3 w-3" />
                <span>Última atualização: {timeAgo}</span>
                {cacheHit && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded">
                    Cache
                  </span>
                )}
                {showVersion && calculationVersion && (
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded">
                    v{calculationVersion}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {!isCalculating && onRefresh && (
        <button
          onClick={onRefresh}
          className="p-1 rounded-md hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
          title="Forçar recálculo"
        >
          <RefreshCw className="h-4 w-4 text-green-600 dark:text-green-400" />
        </button>
      )}
    </div>
  );
};

export default KPILoadingIndicator;