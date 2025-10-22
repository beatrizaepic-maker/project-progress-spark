import React from 'react';
import { Target } from 'lucide-react';
import KPICard from './KPICard';
import { formatDeadlineStatus, formatPercentage } from '@/utils/kpiFormatters';

interface ProjectDeadlineCardProps {
  deadlineStatus: 'on-time' | 'at-risk' | 'delayed';
  completionPercentage: number;
  lastUpdated: Date;
  isCalculating?: boolean;
  calculationId?: string;
  processingTime?: number;
  cacheHit?: boolean;
  calculationVersion?: string;
}

const ProjectDeadlineCard: React.FC<ProjectDeadlineCardProps> = ({
  deadlineStatus,
  completionPercentage,
  lastUpdated,
  isCalculating = false,
  calculationId,
  processingTime,
  cacheHit = false,
  calculationVersion
}) => {
  const getCardStatus = (status: 'on-time' | 'at-risk' | 'delayed') => {
    const statusMap = {
      'on-time': 'success' as const,
      'at-risk': 'warning' as const,
      'delayed': 'error' as const
    };
    return statusMap[status];
  };

  const getStatusEmoji = (status: 'on-time' | 'at-risk' | 'delayed') => {
    const emojiMap = {
      'on-time': '✅',
      'at-risk': '⚠️',
      'delayed': '🔴'
    };
    return emojiMap[status];
  };

  const getDescription = (status: 'on-time' | 'at-risk' | 'delayed', percentage: number) => {
    const baseDescription = `Projeto ${formatPercentage(percentage, 0)} concluído`;
    
    switch (status) {
      case 'on-time':
        return `${baseDescription}. Todas as tarefas estão dentro do prazo estabelecido.`;
      case 'at-risk':
        return `${baseDescription}. Algumas tarefas apresentam risco de atraso.`;
      case 'delayed':
        return `${baseDescription}. Projeto com atrasos significativos identificados.`;
      default:
        return baseDescription;
    }
  };

  // Calcula tendência baseada no status (em implementação real viria de dados históricos)  
  const getTrend = (status: 'on-time' | 'at-risk' | 'delayed') => {
    // Em uma implementação real, isso viria de dados históricos
    return undefined; // Removendo a simulação para usar apenas dados reais
  };

  return (
    <KPICard
      title="Produtividade da Squad"
      value={`${formatPercentage(completionPercentage, 0)}`}
      status={getCardStatus(deadlineStatus)}
      trend={getTrend(deadlineStatus)}
      subtitle="aproveitamento médio da equipe"
      icon={Target}
      description={`Produtividade média da equipe baseada em ${formatPercentage(completionPercentage, 0)} de aproveitamento geral das tarefas concluídas pelos membros cadastrados.`}
      tooltipTitle="Produtividade da Squad"
      tooltipDescription="Este KPI calcula a produtividade média da equipe em percentual, considerando o aproveitamento de todos os players cadastrados."
      tooltipDetails={[
        "� Cálculo baseado em tarefas concluídas vs total de tarefas",
        "� Considera todos os membros da equipe cadastrados",
        "� Percentual de aproveitamento médio da squad",
        "🎯 Indica a eficiência geral da equipe",
        "⚡ Atualizado automaticamente quando dados mudam"
      ]}
      tooltipCalculation="Produtividade = (Tarefas Concluídas / Total de Tarefas) × 100"
      lastUpdated={lastUpdated}
      isCalculating={isCalculating}
      calculationId={calculationId}
      processingTime={processingTime}
      cacheHit={cacheHit}
      calculationVersion={calculationVersion}
    />
  );
};

export default ProjectDeadlineCard;