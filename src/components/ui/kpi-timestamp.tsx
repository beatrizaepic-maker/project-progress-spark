import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, RefreshCw, Database, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Tipos para as props
interface BaseTimestampProps {
  lastUpdated?: Date;
  isCalculating?: boolean;
  calculationId?: string;
  processingTime?: number;
  cacheHit?: boolean;
  className?: string;
}

interface KPITimestampProps extends BaseTimestampProps {
  showDetails?: boolean;
}

interface KPITimestampDetailedProps extends BaseTimestampProps {
  showDetails?: boolean;
}

// Componente de timestamp compacto
export const KPITimestamp: React.FC<KPITimestampProps> = ({
  lastUpdated,
  isCalculating = false,
  calculationId,
  processingTime,
  cacheHit = false,
  className,
  showDetails = false
}) => {
  if (!lastUpdated && !isCalculating) return null;

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR');
  };

  if (isCalculating) {
    return (
      <div className={cn('flex items-center gap-1 text-xs text-blue-600', className)}>
        <RefreshCw className="h-3 w-3 animate-spin" />
        <span>Calculando...</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1 text-xs text-gray-500', className)}>
      <Clock className="h-3 w-3" />
      {showDetails ? (
        <div className="flex flex-col">
          <span>Atualizado às {formatTime(lastUpdated)}</span>
          <span className="text-[0.6rem] text-gray-400">{formatDate(lastUpdated)}</span>
        </div>
      ) : (
        <span>Atualizado às {formatTime(lastUpdated)}</span>
      )}
      {cacheHit && (
        <Badge variant="secondary" className="ml-1 h-4 px-1 py-0 text-[0.6rem]">
          <Database className="h-2 w-2 mr-1" />
          Cache
        </Badge>
      )}
      {processingTime && processingTime > 0 && showDetails && (
        <div className="flex items-center gap-1 text-[0.6rem] text-gray-400">
          <Timer className="h-2 w-2" />
          {processingTime}ms
        </div>
      )}
    </div>
  );
};

// Componente de timestamp detalhado
export const KPITimestampDetailed: React.FC<KPITimestampDetailedProps> = ({
  lastUpdated,
  isCalculating = false,
  calculationId,
  processingTime,
  cacheHit = false,
  className,
  showDetails = true
}) => {
  if (!lastUpdated && !isCalculating) return null;

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR');
  };

  if (isCalculating) {
    return (
      <div className={cn('flex items-center justify-between p-3 bg-blue-50 border border-blue-200', className)}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">Atualizando dados</p>
            <p className="text-xs text-blue-600">Recalculando KPIs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between p-3 bg-gray-50 border', className)}>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-500" />
        <div>
          <p className="text-sm font-medium text-gray-700">Última atualização</p>
          <p className="text-xs text-gray-500">
            {formatDate(lastUpdated)} às {formatTime(lastUpdated)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {cacheHit ? (
          <Badge variant="secondary" className="gap-1">
            <Database className="h-3 w-3" />
            Cache
          </Badge>
        ) : (
          <Badge variant="default" className="gap-1">
            <RefreshCw className="h-3 w-3" />
            Recalculado
          </Badge>
        )}
        
        {processingTime && processingTime > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Timer className="h-3 w-3" />
            {processingTime}ms
          </div>
        )}
      </div>
    </div>
  );
};

export default KPITimestamp;