import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const [isHovered, setIsHovered] = useState(false);

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
        "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors",
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
        "flex items-center justify-between p-2 border bg-card text-card-foreground",
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
                "w-2 h-2",
                cacheHit ? "bg-blue-500" : "bg-green-500"
              )} />
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="p-1 hover:bg-muted transition-colors"
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
    <motion.div 
      className={cn(
        "flex items-center justify-between p-3 border-2 border-purple-500 transition-colors shadow-lg shadow-purple-500/30",
        isCalculating 
          ? "bg-card hover:shadow-purple-500/50"
          : "bg-card hover:shadow-purple-500/50",
        className
      )}
      initial={{ y: 0 }}
      animate={{
        y: isHovered ? -8 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered 
          ? "0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(139, 92, 246, 0.2)" 
          : "0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(139, 92, 246, 0.1)"
      }}
    >
      <div className="flex items-center gap-3">
        {isCalculating ? (
          <>
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20">
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
            <div className="flex items-center justify-center w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-purple-500/20 hover:border-purple-500/40">
              <CheckCircle className="h-5 w-5 text-white hover:text-purple-400 transition-colors duration-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                KPIs Atualizados
              </p>
              <div className="flex items-center gap-2 text-xs text-white">
                <Clock className="h-4 w-4 text-white hover:text-purple-400 transition-colors duration-300" />
                <span>Última atualização: {timeAgo}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {!isCalculating && onRefresh && (
        <button
          onClick={onRefresh}
          className="p-1 bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-purple-500/20 hover:border-purple-500/40"
          title="Forçar recálculo"
        >
          <RefreshCw className="h-5 w-5 text-white hover:text-purple-400 transition-colors duration-300" />
        </button>
      )}
    </motion.div>
  );
};

export default KPILoadingIndicator;