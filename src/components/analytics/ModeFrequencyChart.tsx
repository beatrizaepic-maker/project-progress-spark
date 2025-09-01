import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TaskData } from '@/data/projectData';
import { formatDays, formatPercentage } from '@/utils/kpiFormatters';

interface ModeFrequencyChartProps {
  tasks: TaskData[];
  mode: number;
}

const ModeFrequencyChart: React.FC<ModeFrequencyChartProps> = ({
  tasks,
  mode
}) => {
  // Calcula informações da moda
  const calculateModeInfo = () => {
    const durations = tasks.map(t => t.duracaoDiasUteis);
    const frequencyMap: { [key: number]: number } = {};
    
    durations.forEach(duration => {
      frequencyMap[duration] = (frequencyMap[duration] || 0) + 1;
    });

    const modeFrequency = frequencyMap[mode] || 0;
    const modePercentage = durations.length > 0 ? (modeFrequency / durations.length) * 100 : 0;

    return {
      value: mode,
      frequency: modeFrequency,
      percentage: modePercentage
    };
  };

  const modeInfo = calculateModeInfo();

  // Prepara dados para o histograma de frequência
  const prepareFrequencyData = () => {
    const durations = tasks.map(t => t.duracaoDiasUteis);
    const frequencyMap: { [key: number]: number } = {};
    
    // Conta frequência de cada duração
    durations.forEach(duration => {
      frequencyMap[duration] = (frequencyMap[duration] || 0) + 1;
    });

    // Converte para array e ordena
    return Object.entries(frequencyMap)
      .map(([duration, count]) => ({
        duration: parseInt(duration),
        count,
        percentage: (count / durations.length) * 100,
        isMode: parseInt(duration) === mode
      }))
      .sort((a, b) => a.duration - b.duration);
  };

  const frequencyData = prepareFrequencyData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {formatDays(data.duration)}
          </p>
          <p className="text-blue-600 dark:text-blue-400">
            Frequência: {data.count} tarefas
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {formatPercentage(data.percentage)} do total
          </p>
          {data.isMode && (
            <p className="text-green-600 dark:text-green-400 font-semibold">
              🎯 Moda (mais comum)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Cores para as barras
  const getBarColor = (isMode: boolean, index: number) => {
    if (isMode) return '#10b981'; // Verde para a moda
    return '#3b82f6'; // Azul para outras barras
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Distribuição de Frequência (Moda)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tempo mais comum: {formatDays(modeInfo.value)} • 
          Frequência: {modeInfo.frequency} tarefas ({formatPercentage(modeInfo.percentage)})
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={frequencyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="duration" 
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'Duração (dias)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'Frequência', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {frequencyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.isMode, index)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Frequência Normal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Moda (Mais Comum)</span>
        </div>
      </div>

      {/* Estatísticas da moda */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatDays(modeInfo.value)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Moda</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {modeInfo.frequency}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Ocorrências</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatPercentage(modeInfo.percentage)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Do Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {frequencyData.length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Durações Únicas</div>
        </div>
      </div>

      {/* Explicação da moda */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
          💡 O que é a Moda?
        </h4>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          A moda representa o tempo de duração mais frequente entre as tarefas. 
          Isso indica o padrão típico de tempo necessário para completar uma tarefa no projeto.
        </p>
      </div>
    </div>
  );
};

export default ModeFrequencyChart;