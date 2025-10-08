import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TaskData } from '@/data/projectData';
import { formatDays } from '@/utils/kpiFormatters';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, BarChart3 } from 'lucide-react';

interface ProductionAverageChartProps {
  tasks: TaskData[];
  averageProduction: number;
}

const ProductionAverageChart: React.FC<ProductionAverageChartProps> = ({
  tasks,
  averageProduction
}) => {
  // Prepara dados para o gráfico - agrupa por mês
  const prepareChartData = () => {
    const monthlyData: { [key: string]: { total: number; count: number; tasks: TaskData[] } } = {};
    
    tasks.forEach(task => {
      const startDate = new Date(task.inicio);
      const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0, tasks: [] };
      }
      
      monthlyData[monthKey].total += task.duracaoDiasUteis;
      monthlyData[monthKey].count += 1;
      monthlyData[monthKey].tasks.push(task);
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric' 
        }),
        average: Math.round((data.total / data.count) * 10) / 10,
        totalTasks: data.count,
        totalDays: data.total
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const chartData = prepareChartData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            Média: {formatDays(data.average)}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {data.totalTasks} tarefas ({data.totalDays} dias totais)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">
            Evolução da Média de Produção
          </h3>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Gráfico de Média de Produção</h4>
                  <p className="text-sm text-light-gray leading-relaxed">
                    Mostra a evolução do tempo médio por tarefa ao longo dos meses, permitindo identificar tendências de performance.
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-light-gray rounded-full mt-2 flex-shrink-0" />
                      <span className="text-light-gray">Linha azul: média mensal calculada</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-light-gray rounded-full mt-2 flex-shrink-0" />
                      <span className="text-light-gray">Linha vermelha tracejada: média geral de referência</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-light-gray rounded-full mt-2 flex-shrink-0" />
                      <span className="text-light-gray">Considera apenas dias úteis no cálculo</span>
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-2" />
                </div>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tempo médio por tarefa ao longo do tempo • Média geral: {formatDays(averageProduction)}
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
              label={{ value: 'Dias', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="average" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
            />
            {/* Linha de referência da média geral */}
            <Line 
              type="monotone" 
              dataKey={() => averageProduction} 
              stroke="#ef4444" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span className="text-white hover:text-purple-400 transition-colors">Média Mensal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-red-500 border-dashed border-t-2 border-red-500"></div>
          <span className="text-white hover:text-purple-400 transition-colors">Média Geral</span>
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help hover:bg-purple-500/20 hover:text-purple-400 rounded p-2 transition-colors">
                <div className="text-2xl font-bold text-white">
                  {formatDays(averageProduction)}
                </div>
                <div className="text-xs text-white flex items-center justify-center gap-1">
                  Média Geral
                  <HelpCircle className="h-3 w-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Média Geral de Produção</p>
                <p>Tempo médio para conclusão de todas as tarefas do projeto, considerando apenas dias úteis.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>

        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help hover:bg-purple-500/20 hover:text-purple-400 rounded p-2 transition-colors">
                <div className="text-2xl font-bold text-white">
                  {chartData.length > 0 ? formatDays(Math.min(...chartData.map(d => d.average))) : '0'}
                </div>
                <div className="text-xs text-white flex items-center justify-center gap-1">
                  Melhor Mês
                  <HelpCircle className="h-3 w-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Melhor Performance Mensal</p>
                <p>Mês com menor tempo médio por tarefa. Indica período de maior eficiência da equipe.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>

        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help hover:bg-purple-500/20 hover:text-purple-400 rounded p-2 transition-colors">
                <div className="text-2xl font-bold text-white">
                  {chartData.length > 0 ? formatDays(Math.max(...chartData.map(d => d.average))) : '0'}
                </div>
                <div className="text-xs text-white flex items-center justify-center gap-1">
                  Pior Mês
                  <HelpCircle className="h-3 w-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Menor Performance Mensal</p>
                <p>Mês com maior tempo médio por tarefa. Pode indicar período de maior complexidade ou dificuldades.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>

      {/* Efeito de brilho sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default ProductionAverageChart;