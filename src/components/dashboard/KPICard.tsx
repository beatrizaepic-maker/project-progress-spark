import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { KPITimestamp } from '@/components/ui/kpi-timestamp';
import { KPIVersionBadge } from '@/components/ui/kpi-version-indicator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { focusStyles } from '@/utils/accessibility';

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
  // Propriedades de acessibilidade e interatividade
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  ariaLabel?: string;
  ariaDescription?: string;
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
  showVersioning = false,
  // Propriedades de acessibilidade e interatividade
  onClick,
  onFocus,
  onBlur,
  ariaLabel,
  ariaDescription
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useIsMobile();

  // Configuração de navegação por teclado
  const { keyboardProps } = useKeyboardNavigation({
    onEnter: onClick,
    onSpace: onClick,
    disabled: !onClick
  });

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  
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
    // Estilo glassmorphism unificado para todos os ícones
    return 'text-white bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-purple-500/20 hover:border-purple-500/40 hover:text-purple-400';
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
            <button
              className={cn(
                "h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors rounded",
                focusStyles.ring
              )}
              aria-label={`Informações sobre ${title}`}
              type="button"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm p-4" role="tooltip">
            <div className="space-y-2">
              {tooltipTitle && (
                <h4 className="font-semibold text-foreground" id="tooltip-title">
                  {tooltipTitle}
                </h4>
              )}
              {tooltipDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tooltipDescription}
                </p>
              )}
              {tooltipDetails.length > 0 && (
                <div className="space-y-1" role="list" aria-label="Detalhes do cálculo">
                  {tooltipDetails.map((detail, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs" role="listitem">
                      <div className="w-1 h-1 bg-muted-foreground mt-2 flex-shrink-0" aria-hidden="true" />
                      <span className="text-muted-foreground leading-relaxed">{detail}</span>
                    </div>
                  ))}
                </div>
              )}
              {tooltipCalculation && (
                <div className="border-t border-border/50 pt-2">
                  <div className="text-xs">
                    <span className="font-medium text-foreground">Cálculo:</span>
                    <p className="text-muted-foreground mt-1 font-mono bg-muted/30 px-2 py-1" role="code">
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
    <motion.div 
      className={cn(
        'relative overflow-hidden border-2 transition-all duration-200 hover:shadow-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50',
        'bg-card focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-600',
        // Cores da borda baseadas no status e estado de foco
        isFocused ? 'border-purple-600' : 'border-purple-500',
        // Responsividade: padding menor em mobile
        isMobile ? 'p-4' : 'p-6',
        // Cursor pointer se clicável
        onClick ? 'cursor-pointer' : 'cursor-default',
        className
      )}
      initial={{ y: 0 }}
      animate={{
        y: (isHovered || isFocused) && !isMobile ? -8 : 0, // Hover effect apenas em desktop
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={onClick}
      style={{
        boxShadow: (isHovered || isFocused) && !isMobile
          ? "0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(139, 92, 246, 0.2)" 
          : "0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(139, 92, 246, 0.1)"
      }}
      // Propriedades de acessibilidade
      role="article"
      aria-label={ariaLabel || `KPI: ${title}`}
      aria-description={ariaDescription || description}
      {...(onClick ? keyboardProps : { tabIndex: 0 })}
    >
      {/* Header com ícone e título */}
      <div className={cn(
        'flex items-start justify-between',
        isMobile ? 'mb-3' : 'mb-4'
      )}>
        <div className={cn(
          'flex items-center',
          isMobile ? 'space-x-2' : 'space-x-3'
        )}>
          <div className={cn(
            'flex items-center justify-center',
            isMobile ? 'h-10 w-10' : 'h-12 w-12',
            getIconStyles(status)
          )}>
            <Icon className={isMobile ? 'h-6 w-6' : 'h-7 w-7'} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'kpi-title text-white',
                isMobile ? 'text-xs' : 'text-sm'
              )}>
                {title}
              </h3>
              {renderTooltip()}
            </div>
            {subtitle && (
              <p className={cn(
                'kpi-subtitle text-light-gray mt-1',
                isMobile ? 'text-xs' : 'text-xs'
              )}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Indicador de tendência */}
        {trend && (
          <div className={cn(
            'flex items-center space-x-1 font-medium',
            isMobile ? 'text-xs flex-col space-x-0' : 'text-sm',
            getTrendColor(trend.direction, trend.isPositive)
          )}>
            <span className={isMobile ? 'text-base' : 'text-lg'} aria-hidden="true">
              {getTrendIcon(trend.direction)}
            </span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {/* Valor principal */}
      <div className={isMobile ? 'mb-2' : 'mb-2'}>
        <div className={cn(
          'kpi-value text-white',
          isMobile ? 'text-2xl' : 'text-3xl'
        )}>
          {value}
        </div>
      </div>

      {/* Descrição adicional */}
      {description && (
        <p className={cn(
          'card-content text-light-gray leading-relaxed',
          isMobile ? 'text-xs mb-3' : 'text-sm mb-4'
        )}>
          {description}
        </p>
      )}

      {/* Timestamp de atualização */}
      {/* Timestamp e versioning removidos - informações muito técnicas para o usuário */}

      {/* Efeito de brilho sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default KPICard;