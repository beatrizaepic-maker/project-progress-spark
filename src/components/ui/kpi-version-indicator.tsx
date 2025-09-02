import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Database, Zap, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KPIVersionIndicatorProps {
  calculationId: string;
  calculationVersion: string;
  lastUpdated: Date;
  processingTime?: number;
  cacheHit?: boolean;
  dataHash?: string;
  totalTasks?: number;
  className?: string;
}

/**
 * Componente para exibir informações de versionamento e auditoria dos KPIs
 */
export const KPIVersionIndicator: React.FC<KPIVersionIndicatorProps> = ({
  calculationId,
  calculationVersion,
  lastUpdated,
  processingTime,
  cacheHit = false,
  dataHash,
  totalTasks,
  className = ''
}) => {
  const getPerformanceColor = (time?: number): string => {
    if (!time) return 'text-gray-500';
    if (time < 50) return 'text-green-600';
    if (time < 200) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (time?: number) => {
    if (!time) return Clock;
    if (time < 50) return Zap;
    if (time < 200) return Clock;
    return AlertCircle;
  };

  const formatCalculationId = (id: string): string => {
    return id.slice(-8).toUpperCase();
  };

  const formatDataHash = (hash?: string): string => {
    if (!hash) return 'N/A';
    return hash.slice(0, 6).toUpperCase();
  };

  const getTooltipContent = (): string => {
    const parts = [
      `ID do Cálculo: ${calculationId}`,
      `Versão: ${calculationVersion}`,
      `Timestamp: ${lastUpdated.toISOString()}`,
      `Hash dos Dados: ${dataHash || 'N/A'}`
    ];

    if (processingTime) {
      parts.push(`Tempo de Processamento: ${processingTime}ms`);
    }

    if (totalTasks) {
      parts.push(`Total de Tarefas: ${totalTasks}`);
    }

    parts.push(`Fonte: ${cacheHit ? 'Cache' : 'Recalculado'}`);

    return parts.join('\n');
  };

  const PerformanceIcon = getPerformanceIcon(processingTime);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Badge de Versão */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="text-xs font-mono">
              v{calculationVersion}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <div>Versão do Calculador: {calculationVersion}</div>
              <div>ID: {formatCalculationId(calculationId)}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Indicador de Cache */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <Database className={`w-3 h-3 ${cacheHit ? 'text-green-500' : 'text-blue-500'}`} />
              <span className="text-xs text-gray-600">
                {cacheHit ? 'Cache' : 'Novo'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              {cacheHit ? 'Dados obtidos do cache' : 'Dados recalculados'}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Indicador de Performance */}
      {processingTime && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <PerformanceIcon className={`w-3 h-3 ${getPerformanceColor(processingTime)}`} />
                <span className={`text-xs ${getPerformanceColor(processingTime)}`}>
                  {processingTime}ms
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <div>Tempo de processamento: {processingTime}ms</div>
                <div>
                  Performance: {
                    processingTime < 50 ? 'Excelente' :
                    processingTime < 200 ? 'Boa' : 'Lenta'
                  }
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Hash dos Dados */}
      {dataHash && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <code className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                #{formatDataHash(dataHash)}
              </code>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <div>Hash dos dados de entrada</div>
                <div className="font-mono">{dataHash}</div>
                <div>Usado para cache e versionamento</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Contador de Tarefas */}
      {totalTasks && (
        <span className="text-xs text-gray-500">
          {totalTasks} tarefas
        </span>
      )}

      {/* Informativo de Atualização (Cache) */}
      {cacheHit && (
        <div className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-200 transform hover:scale-105">
          Atualizado (cache)
        </div>
      )}

      {/* Informativo de Atualização */}
      {!cacheHit && (
        <div className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-200 transform hover:scale-105">
          Atualizado
        </div>
      )}
    </div>
  );
};

/**
 * Componente compacto para indicador de versão
 */
export const KPIVersionBadge: React.FC<{
  calculationId: string;
  calculationVersion: string;
  cacheHit?: boolean;
}> = ({ calculationId, calculationVersion, cacheHit = false }) => {
  return (
    <div className="flex items-center gap-1">
      <Badge variant={cacheHit ? "secondary" : "default"} className="text-xs">
        v{calculationVersion}
      </Badge>
      <code className="text-xs text-gray-400">
        {calculationId.slice(-6)}
      </code>
    </div>
  );
};

/**
 * Hook para formatar informações de versionamento
 */
export const useKPIVersioning = (
  calculationId?: string,
  calculationVersion?: string,
  lastUpdated?: Date
) => {
  const formatVersion = React.useCallback(() => {
    if (!calculationVersion) return 'N/A';
    return `v${calculationVersion}`;
  }, [calculationVersion]);

  const formatCalculationId = React.useCallback(() => {
    if (!calculationId) return 'N/A';
    return calculationId.slice(-8).toUpperCase();
  }, [calculationId]);

  const getAgeInMinutes = React.useCallback(() => {
    if (!lastUpdated) return 0;
    return Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60));
  }, [lastUpdated]);

  const isStale = React.useCallback(() => {
    return getAgeInMinutes() > 15; // Considera desatualizado após 15 minutos
  }, [getAgeInMinutes]);

  return {
    formatVersion,
    formatCalculationId,
    getAgeInMinutes,
    isStale: isStale(),
    shortId: calculationId?.slice(-6) || 'N/A',
    fullVersion: calculationVersion || 'N/A'
  };
};