import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TaskData } from '@/data/projectData';
import { formatDays } from '@/utils/kpiFormatters';

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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Evolução da Média de Produção
        </h3>
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
          <span className="text-gray-600 dark:text-gray-400">Média Mensal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-red-500 border-dashed border-t-2 border-red-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Média Geral</span>
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatDays(averageProduction)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Média Geral</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {chartData.length > 0 ? formatDays(Math.min(...chartData.map(d => d.average))) : '0'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Melhor Mês</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {chartData.length > 0 ? formatDays(Math.max(...chartData.map(d => d.average))) : '0'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Pior Mês</div>
        </div>
      </div>
    </div>
  );
};

export default ProductionAverageChart;