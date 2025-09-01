import React from 'react';
import { BarChart3 } from 'lucide-react';
import KPICard from './KPICard';
import { formatDays, classifyStandardDeviation } from '@/utils/kpiFormatters';

interface StandardDeviationCardProps {
  standardDeviation: number;
  averageProduction: number;
  lastUpdated: Date;
  isCalculating?: boolean;
  calculationId?: string;
  processingTime?: number;
  cacheHit?: boolean;
  calculationVersion?: string;
}

const StandardDeviationCard: React.FC<StandardDeviationCardProps> = ({
  standardDeviation,
  averageProduction,
  lastUpdated,
  isCalculating = false,
  calculationId,
  processingTime,
  cacheHit = false,
  calculationVersion
}) => {
  const classification = classifyStandardDeviation(standardDeviation, averageProduction);
  
  const getCardStatus = (classification: string) => {
    switch (classification) {
      case 'Baixa variação':
        return 'success' as const;
      case 'Variação moderada':
        return 'warning' as const;
      case 'Alta variação':
        return 'error' as const;
      default:
        return 'neutral' as const;
    }
  };

  const getDescription = (classification: string, stdDev: number) => {
    const baseText = `Desvio padrão de ${formatDays(stdDev)} indica ${classification.toLowerCase()}.`;
    
    switch (classification) {
      case 'Baixa variação':
        return `${baseText} Excelente consistência na duração das tarefas.`;
      case 'Variação moderada':
        return `${baseText} Algumas tarefas variam significativamente em duração.`;
      case 'Alta variação':
        return `${baseText} Grande inconsistência - revisar estimativas e processos.`;
      default:
        return baseText;
    }
  };

  const getVariationEmoji = (classification: string) => {
    switch (classification) {
      case 'Baixa variação':
        return '📊';
      case 'Variação moderada':
        return '📈';
      case 'Alta variação':
        return '📉';
      default:
        return '📊';
    }
  };

  return (
    <KPICard
      title="Desvio Padrão"
      value={`${getVariationEmoji(classification)} ${formatDays(standardDeviation)}`}
      status={getCardStatus(classification)}
      subtitle={classification}
      icon={BarChart3}
      description={getDescription(classification, standardDeviation)}
      tooltipTitle="Desvio Padrão das Durações"
      tooltipDescription="Mede a variabilidade na duração das tarefas. Valores baixos indicam maior previsibilidade no cronograma."
      tooltipDetails={[
        "📊 Baixa variação (< 20% da média): Cronograma previsível",
        "📈 Variação moderada (20-50% da média): Algumas inconsistências",
        "📉 Alta variação (> 50% da média): Cronograma imprevisível",
        "Calculado apenas com tarefas concluídas",
        "Outliers são removidos para maior precisão",
        "Útil para identificar problemas de estimativa"
      ]}
      tooltipCalculation="σ = √(Σ(xi - μ)² / n) onde xi = duração, μ = média"
      lastUpdated={lastUpdated}
      isCalculating={isCalculating}
      calculationId={calculationId}
      processingTime={processingTime}
      cacheHit={cacheHit}
      calculationVersion={calculationVersion}
    />
  );
};

export default StandardDeviationCard;