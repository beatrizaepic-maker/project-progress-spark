import * as React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Calendar, Clock, Calculator, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InformativeTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  details?: string[];
  calculation?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'warning' | 'success' | 'info';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const InformativeTooltip: React.FC<InformativeTooltipProps> = ({
  children,
  title,
  description,
  details = [],
  calculation,
  icon: IconComponent = Info,
  variant = 'default',
  side = 'top'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      default:
        return 'border-border bg-popover';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className={cn(
            "max-w-sm p-4 text-sm shadow-lg",
            getVariantStyles()
          )}
        >
          <div className="space-y-3">
            {/* Cabeçalho com ícone e título */}
            <div className="flex items-start gap-2">
              <IconComponent className={cn("h-4 w-4 mt-0.5 flex-shrink-0", getIconColor())} />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground leading-tight">{title}</h4>
                <p className="text-muted-foreground mt-1 leading-relaxed">{description}</p>
              </div>
            </div>

            {/* Detalhes adicionais */}
            {details.length > 0 && (
              <div className="space-y-1">
                {details.map((detail, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground leading-relaxed">{detail}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Fórmula de cálculo */}
            {calculation && (
              <div className="border-t border-border/50 pt-2">
                <div className="flex items-start gap-2">
                  <Calculator className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-medium text-foreground">Cálculo:</span>
                    <p className="text-muted-foreground mt-1 font-mono bg-muted/30 px-2 py-1 rounded">
                      {calculation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Tooltips específicos para diferentes tipos de métricas

interface WorkingDaysTooltipProps {
  children: React.ReactNode;
  startDate: string;
  endDate: string;
  workingDays: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const WorkingDaysTooltip: React.FC<WorkingDaysTooltipProps> = ({
  children,
  startDate,
  endDate,
  workingDays,
  side = 'top'
}) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const weekendDays = totalDays - workingDays;

  return (
    <InformativeTooltip
      title="Cálculo de Dias Úteis"
      description="Este cálculo considera apenas dias de segunda a sexta-feira, excluindo fins de semana."
      details={[
        `Período total: ${totalDays} dias corridos`,
        `Dias úteis: ${workingDays} dias`,
        `Fins de semana excluídos: ${weekendDays} dias`,
        "Feriados não são considerados nesta versão"
      ]}
      calculation="Dias úteis = Total de dias - Sábados - Domingos"
      icon={Calendar}
      variant="info"
      side={side}
    >
      {children}
    </InformativeTooltip>
  );
};

interface DelayTooltipProps {
  children: React.ReactNode;
  delay: number;
  endDate: string;
  deadlineDate: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const DelayTooltip: React.FC<DelayTooltipProps> = ({
  children,
  delay,
  endDate,
  deadlineDate,
  side = 'top'
}) => {
  const getDelayCategory = () => {
    if (delay < 0) return { category: 'Antecipada', variant: 'success' as const };
    if (delay === 0) return { category: 'No Prazo', variant: 'success' as const };
    if (delay <= 2) return { category: 'Atraso Leve', variant: 'info' as const };
    if (delay <= 5) return { category: 'Atraso Moderado', variant: 'warning' as const };
    return { category: 'Atraso Crítico', variant: 'warning' as const };
  };

  const { category, variant } = getDelayCategory();
  const end = new Date(endDate);
  const deadline = new Date(deadlineDate);

  return (
    <InformativeTooltip
      title={`${category}: ${Math.abs(delay)} dias úteis`}
      description={
        delay < 0 
          ? `Tarefa foi concluída ${Math.abs(delay)} dias úteis antes do prazo.`
          : delay === 0
          ? "Tarefa foi concluída exatamente no prazo estabelecido."
          : `Tarefa foi concluída ${delay} dias úteis após o prazo.`
      }
      details={[
        `Data de conclusão: ${end.toLocaleDateString('pt-BR')}`,
        `Prazo estabelecido: ${deadline.toLocaleDateString('pt-BR')}`,
        "Cálculo considera apenas dias úteis (seg-sex)",
        delay > 5 ? "⚠️ Requer atenção imediata" : delay > 2 ? "⚠️ Monitorar de perto" : "✅ Dentro do aceitável"
      ]}
      calculation="Atraso = Dias úteis entre prazo e conclusão"
      icon={Clock}
      variant={variant}
      side={side}
    >
      {children}
    </InformativeTooltip>
  );
};

interface StatusTooltipProps {
  children: React.ReactNode;
  status: 'early' | 'on-time' | 'at-risk' | 'delayed' | 'critical';
  delay: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const StatusTooltip: React.FC<StatusTooltipProps> = ({
  children,
  status,
  delay,
  side = 'top'
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'early':
        return {
          title: 'Status: Antecipada',
          description: 'Tarefa concluída antes do prazo estabelecido.',
          details: [
            `Antecipação: ${Math.abs(delay)} dias úteis`,
            '🚀 Performance excelente',
            'Pode indicar subestimação do prazo',
            'Recursos podem ser realocados'
          ],
          variant: 'success' as const,
          icon: TrendingUp
        };
      case 'on-time':
        return {
          title: 'Status: No Prazo',
          description: 'Tarefa concluída exatamente no prazo estabelecido.',
          details: [
            '🎯 Planejamento preciso',
            'Execução conforme esperado',
            'Boa gestão de tempo',
            'Padrão ideal de entrega'
          ],
          variant: 'success' as const,
          icon: TrendingUp
        };
      case 'at-risk':
        return {
          title: 'Status: Risco Baixo',
          description: 'Atraso leve que ainda está dentro do aceitável.',
          details: [
            `Atraso: ${delay} dias úteis`,
            '⚠️ Monitoramento recomendado',
            'Ainda recuperável',
            'Revisar processos se recorrente'
          ],
          variant: 'info' as const,
          icon: Info
        };
      case 'delayed':
        return {
          title: 'Status: Atrasada',
          description: 'Atraso moderado que requer atenção.',
          details: [
            `Atraso: ${delay} dias úteis`,
            '🔶 Requer ação corretiva',
            'Impacto no cronograma geral',
            'Analisar causas do atraso'
          ],
          variant: 'warning' as const,
          icon: AlertCircle
        };
      case 'critical':
        return {
          title: 'Status: Crítica',
          description: 'Atraso crítico que necessita intervenção imediata.',
          details: [
            `Atraso: ${delay} dias úteis`,
            '🔴 Intervenção imediata necessária',
            'Alto impacto no projeto',
            'Revisar recursos e prioridades',
            'Comunicar stakeholders'
          ],
          variant: 'warning' as const,
          icon: AlertCircle
        };
      default:
        return {
          title: 'Status: Indefinido',
          description: 'Status não pôde ser determinado.',
          details: [],
          variant: 'default' as const,
          icon: Info
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <InformativeTooltip
      title={statusInfo.title}
      description={statusInfo.description}
      details={statusInfo.details}
      calculation="Status baseado no atraso em dias úteis"
      icon={statusInfo.icon}
      variant={statusInfo.variant}
      side={side}
    >
      {children}
    </InformativeTooltip>
  );
};

interface DateTooltipProps {
  children: React.ReactNode;
  date: string;
  label: string;
  description: string;
  isPlanned?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const DateTooltip: React.FC<DateTooltipProps> = ({
  children,
  date,
  label,
  description,
  isPlanned = false,
  side = 'top'
}) => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
  const fullDate = dateObj.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <InformativeTooltip
      title={label}
      description={description}
      details={[
        `Data completa: ${fullDate}`,
        `Dia da semana: ${dayOfWeek}`,
        isPlanned ? "📅 Data calculada baseada na duração estimada" : "📋 Data real de execução",
        isPlanned ? "Considera apenas dias úteis para o cálculo" : "Data efetiva registrada no sistema"
      ]}
      icon={Calendar}
      variant={isPlanned ? 'info' : 'default'}
      side={side}
    >
      {children}
    </InformativeTooltip>
  );
};

export default InformativeTooltip;