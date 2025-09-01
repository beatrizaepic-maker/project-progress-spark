import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { KPITimestamp } from '@/components/ui/kpi-timestamp';
import { KPIVersionBadge } from '@/components/ui/kpi-version-indicator';

export interface KPICardProps {
  title: string;
  value: string | number;
  status: 'success' | 'warning' | 'error' | 'neutral';
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
    isPositive?: boolean;
  };
  subtitle?: string;
  icon: LucideIcon;
  description?: string;
  className?: string;
  tooltipTitle?: string;
  tooltipDescription?: string;
  tooltipDetails?: string[];
  tooltipCalculation?: string;
  // Propriedades de timestamp
  lastUpdated?: Date;
  isCalculating?: boolean;
  calculationId?: string;
  processingTime?: number;
  cacheHit?: boolean;
  showTimestamp?: boolean;
  calculationVersion?: string;
  showVersioning?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  status,
  trend,
  subtitle,
  icon: Icon,
  description,
  className,
  tooltipTitle,
  tooltipDescription,
  tooltipDetails = [],
  tooltipCalculation,
  // Propriedades de timestamp
  lastUpdated,
  isCalculating = false,
  calculationId,
  processingTime,
  cacheHit = false,
  showTimestamp = true,
  calculationVersion,
  showVersioning = false
}) => {
  const getStatusStyles = (status: KPICardProps['status']) => {
    const styles = {
      success: 'border-green-200 bg-green-50/50 text-green-800',
      warning: 'border-yellow-200 bg-yellow-50/50 text-yellow-800',
      error: 'border-red-200 bg-red-50/50 text-red-800',
      neutral: 'border-gray-200 bg-gray-50/50 text-gray-800'
    };
    return styles[status];
  };

  const getIconStyles = (status: KPICardProps['status']) => {
    const styles = {
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100',
      neutral: 'text-gray-600 bg-gray-100'
    };
    return styles[status];
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '';
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable', isPositive?: boolean) => {
    if (direction === 'stable') return 'text-gray-500';
    
    // Se isPositive não está definido, usa lógica padrão (up = verde, down = vermelho)
    if (isPositive === undefined) {
      return direction === 'up' ? 'text-green-600' : 'text-red-600';
    }
    
    // Se isPositive está definido, usa essa informação
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  const renderTooltip = () => {
    if (!tooltipTitle && !tooltipDescription) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm p-4">
            <div className="space-y-2">
              {tooltipTitle && (
                <h4 className="font-semibold text-foreground">{tooltipTitle}</h4>
              )}
              {tooltipDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tooltipDescription}
                </p>
              )}
              {tooltipDetails.length > 0 && (
                <div className="space-y-1">
                  {tooltipDetails.map((detail, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{detail}</span>
                    </div>
                  ))}
                </div>
              )}
              {tooltipCalculation && (
                <div className="border-t border-border/50 pt-2">
                  <div className="text-xs">
                    <span className="font-medium text-foreground">Cálculo:</span>
                    <p className="text-muted-foreground mt-1 font-mono bg-muted/30 px-2 py-1 rounded">
                      {tooltipCalculation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg',
      'backdrop-blur-sm bg-white/80 dark:bg-gray-900/80',
      getStatusStyles(status),
      className
    )}>
      {/* Header com ícone e título */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            getIconStyles(status)
          )}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </h3>
              {renderTooltip()}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Indicador de tendência */}
        {trend && (
          <div className={cn(
            'flex items-center space-x-1 text-sm font-medium',
            getTrendColor(trend.direction, trend.isPositive)
          )}>
            <span className="text-lg">{getTrendIcon(trend.direction)}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {/* Valor principal */}
      <div className="mb-2">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </div>
      </div>

      {/* Descrição adicional */}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
          {description}
        </p>
      )}

      {/* Timestamp de atualização */}
      {showTimestamp && lastUpdated && (
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <KPITimestamp
            lastUpdated={lastUpdated}
            isCalculating={isCalculating}
            calculationId={calculationId}
            processingTime={processingTime}
            cacheHit={cacheHit}
            showDetails={false}
            className="text-xs"
          />
          
          {/* Indicador de versão do cálculo */}
          {(showVersioning || process.env.NODE_ENV === 'development') && calculationId && calculationVersion && (
            <KPIVersionBadge
              calculationId={calculationId}
              calculationVersion={calculationVersion}
              cacheHit={cacheHit}
            />
          )}
        </div>
      )}

      {/* Efeito de brilho sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default KPICard;