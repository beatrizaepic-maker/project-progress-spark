import React from 'react';
import { Target } from 'lucide-react';
import KPICard from './KPICard';
import { formatDeadlineStatus, formatPercentage } from '@/utils/kpiFormatters';

interface ProjectDeadlineCardProps {
  deadlineStatus: 'on-time' | 'at-risk' | 'delayed';
  completionPercentage: number;
  lastUpdated: Date;
}

const ProjectDeadlineCard: React.FC<ProjectDeadlineCardProps> = ({
  deadlineStatus,
  completionPercentage,
  lastUpdated
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

  // Calcula tendência baseada no status (simulado - em implementação real viria de dados históricos)
  const getTrend = (status: 'on-time' | 'at-risk' | 'delayed') => {
    // Em uma implementação real, isso viria de dados históricos
    // Por agora, vamos simular baseado no status atual
    switch (status) {
      case 'on-time':
        return {
          direction: 'stable' as const,
          value: '0%',
          isPositive: true
        };
      case 'at-risk':
        return {
          direction: 'up' as const,
          value: '5%',
          isPositive: false
        };
      case 'delayed':
        return {
          direction: 'up' as const,
          value: '15%',
          isPositive: false
        };
      default:
        return undefined;
    }
  };

  return (
    <KPICard
      title="Status do Projeto"
      value={`${getStatusEmoji(deadlineStatus)} ${formatDeadlineStatus(deadlineStatus)}`}
      status={getCardStatus(deadlineStatus)}
      trend={getTrend(deadlineStatus)}
      subtitle={formatPercentage(completionPercentage, 0) + ' concluído'}
      icon={Target}
      description={getDescription(deadlineStatus, completionPercentage)}
      tooltipTitle="Indicador de Prazo do Projeto"
      tooltipDescription="Este KPI avalia o status geral do projeto baseado no cumprimento de prazos das tarefas individuais."
      tooltipDetails={[
        "🟢 No Prazo: Todas as tarefas estão dentro do cronograma",
        "🟡 Em Risco: Algumas tarefas apresentam atrasos leves (1-2 dias)",
        "🔴 Atrasado: Tarefas com atrasos significativos (3+ dias)",
        "Porcentagem de conclusão baseada em tarefas finalizadas",
        "Atualizado automaticamente quando dados de tarefas mudam"
      ]}
      tooltipCalculation="Status = Análise dos atrasos de todas as tarefas concluídas"
    />
  );
};

export default ProjectDeadlineCard;