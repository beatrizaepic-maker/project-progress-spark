/**
 * Utilitários para formatação de KPIs
 */

/**
 * Formata números com decimais apropriados
 */
export const formatNumber = (value: number | undefined | null, decimals: number = 1): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toFixed(decimals);
};

/**
 * Formata porcentagens
 */
export const formatPercentage = (value: number | undefined | null, decimals: number = 1): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%';
  }
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formata dias com unidade apropriada
 */
export const formatDays = (value: number | undefined | null, showUnit: boolean = true): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return showUnit ? '0 dias' : '0';
  }
  
  const formatted = formatNumber(value);
  if (!showUnit) return formatted;
  
  if (value === 1) return `${formatted} dia`;
  return `${formatted} dias`;
};

/**
 * Formata status de prazo para exibição
 */
export const formatDeadlineStatus = (status: 'on-time' | 'at-risk' | 'delayed'): string => {
  const statusMap = {
    'on-time': 'No Prazo',
    'at-risk': 'Em Risco',
    'delayed': 'Atrasado'
  };
  
  return statusMap[status];
};

/**
 * Retorna cor baseada no status
 */
export const getStatusColor = (status: 'on-time' | 'at-risk' | 'delayed'): string => {
  const colorMap = {
    'on-time': 'text-green-600 bg-green-50 border-green-200',
    'at-risk': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'delayed': 'text-red-600 bg-red-50 border-red-200'
  };
  
  return colorMap[status];
};

/**
 * Retorna ícone baseado no status
 */
export const getStatusIcon = (status: 'on-time' | 'at-risk' | 'delayed'): string => {
  const iconMap = {
    'on-time': '✅',
    'at-risk': '⚠️',
    'delayed': '🔴'
  };
  
  return iconMap[status];
};

/**
 * Formata timestamp para exibição
 */
export const formatLastUpdated = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'Agora mesmo';
  if (diffMinutes < 60) return `${diffMinutes} min atrás`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} dias atrás`;
};

/**
 * Classifica desvio padrão em categorias
 */
export const classifyStandardDeviation = (stdDev: number, average: number): string => {
  if (average === 0) return 'N/A';
  
  const coefficient = stdDev / average;
  
  if (coefficient < 0.15) return 'Baixa variação';
  if (coefficient < 0.35) return 'Variação moderada';
  return 'Alta variação';
};

/**
 * Formata distribuição de atrasos para gráficos
 */
export const formatDistributionData = (
  distribution: Array<{ range: string; count: number; percentage: number }>
) => {
  return distribution.map(item => ({
    name: item.range,
    value: item.count,
    percentage: item.percentage,
    label: `${item.count} (${formatPercentage(item.percentage)})`
  }));
};

/**
 * Calcula tendência baseada em valores históricos
 */
export const calculateTrend = (current: number, previous: number): {
  direction: 'up' | 'down' | 'stable';
  value: string;
  isPositive: boolean;
} => {
  if (previous === 0) {
    return { direction: 'stable', value: '0%', isPositive: true };
  }
  
  const change = ((current - previous) / previous) * 100;
  const absChange = Math.abs(change);
  
  if (absChange < 1) {
    return { direction: 'stable', value: '0%', isPositive: true };
  }
  
  return {
    direction: change > 0 ? 'up' : 'down',
    value: `${formatNumber(absChange)}%`,
    isPositive: change < 0 // Para atrasos, diminuir é positivo
  };
};