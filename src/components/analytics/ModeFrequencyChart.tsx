import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TaskData } from '@/data/projectData';
import { formatDays, formatPercentage } from '@/utils/kpiFormatters';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, BarChart3 } from 'lucide-react';

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
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Distribuição de Frequência (Moda)
          </h3>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Análise da Moda Estatística</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A moda é o valor que aparece com maior frequência no conjunto de dados. Representa o tempo de duração mais típico das tarefas.
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">Barra verde: duração mais comum (moda)</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">Barras azuis: outras durações observadas</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">Útil para identificar padrões de produtividade</span>
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-2">
                    <div className="text-xs">
                      <span className="font-medium text-foreground">Interpretação:</span>
                      <p className="text-muted-foreground mt-1">
                        Alta frequência da moda indica consistência na execução das tarefas.
                      </p>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
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
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition-colors">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatDays(modeInfo.value)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                  Moda
                  <HelpCircle className="h-3 w-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Valor da Moda</p>
                <p>Duração que aparece com maior frequência no conjunto de tarefas. Representa o tempo mais típico.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>

        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition-colors">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {modeInfo.frequency}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                  Ocorrências
                  <HelpCircle className="h-3 w-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Frequência da Moda</p>
                <p>Número absoluto de tarefas que tiveram exatamente esta duração.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>

        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition-colors">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatPercentage(modeInfo.percentage)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                  Do Total
                  <HelpCircle className="h-3 w-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Percentual da Moda</p>
                <p>Porcentagem das tarefas que seguem o padrão mais comum de duração.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>

        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition-colors">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {frequencyData.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                  Durações Únicas
                  <HelpCircle className="h-3 w-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Variabilidade</p>
                <p>Número de durações diferentes observadas. Mais valores únicos indicam maior variabilidade.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
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