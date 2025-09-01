import React from 'react';
import { Clock } from 'lucide-react';
import KPICard from './KPICard';
import { formatDays, calculateTrend } from '@/utils/kpiFormatters';

interface AverageDelayCardProps {
  averageDelay: number;
  lastUpdated: Date;
  previousAverageDelay?: number; // Para calcular tendência
}

const AverageDelayCard: React.FC<AverageDelayCardProps> = ({
  averageDelay,
  lastUpdated,
  previousAverageDelay = 0
}) => {
  const getCardStatus = (delay: number) => {
    if (delay === 0) return 'success' as const;
    if (delay <= 1) return 'warning' as const;
    return 'error' as const;
  };

  const getDescription = (delay: number) => {
    if (delay === 0) {
      return 'Excelente! Nenhuma tarefa apresenta atraso médio.';
    }
    if (delay <= 1) {
      return 'Atraso controlado. Monitoramento recomendado para manter performance.';
    }
    if (delay <= 3) {
      return 'Atraso moderado. Ações corretivas podem ser necessárias.';
    }
    return 'Atraso significativo. Revisão urgente do cronograma recomendada.';
  };

  const trend = calculateTrend(averageDelay, previousAverageDelay);

  return (
    <KPICard
      title="Média de Atraso"
      value={formatDays(averageDelay)}
      status={getCardStatus(averageDelay)}
      trend={trend}
      subtitle="Por tarefa (dias úteis)"
      icon={Clock}
      description={getDescription(averageDelay)}
      tooltipTitle="Média de Atraso em Dias Úteis"
      tooltipDescription="Calcula o atraso médio de todas as tarefas concluídas, considerando apenas dias úteis (segunda a sexta-feira)."
      tooltipDetails={[
        "Considera apenas tarefas já concluídas",
        "Exclui fins de semana do cálculo",
        "Valores negativos indicam antecipação média",
        "Outliers são removidos automaticamente (método IQR)",
        "Atualizado em tempo real conforme tarefas são concluídas"
      ]}
      tooltipCalculation="Média = Σ(atrasos em dias úteis) / número de tarefas"
    />
  );
};

export default AverageDelayCard;