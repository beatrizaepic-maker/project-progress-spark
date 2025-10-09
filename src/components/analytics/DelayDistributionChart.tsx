import React, { useState, useMemo } from 'react';
import { TaskData } from '@/data/projectData';
import { formatDays } from '@/utils/kpiFormatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface DelayDistributionChartProps {
  tasks: TaskData[];
}

type FilterType = 'all' | 'period' | 'weekday';
type PeriodFilter = 'all' | 'last30' | 'last90' | 'thisYear';

const DelayDistributionChart: React.FC<DelayDistributionChartProps> = ({ tasks }) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  // Filtrar tarefas baseado nos filtros selecionados
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (periodFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (periodFilter) {
        case 'last30':
          filterDate.setDate(now.getDate() - 30);
          break;
        case 'last90':
          filterDate.setDate(now.getDate() - 90);
          break;
        case 'thisYear':
          filterDate.setMonth(0, 1);
          break;
      }
      
      filtered = filtered.filter(task => new Date(task.fim) >= filterDate);
    }

    return filtered;
  }, [tasks, periodFilter]);

  // Calcular distribuição de atrasos por faixas
  const delayDistribution = useMemo(() => {
    const ranges = [
      { label: 'Sem atraso', min: 0, max: 0, color: '#10b981' },
      { label: '1-2 dias', min: 1, max: 2, color: '#f59e0b' },
      { label: '3-5 dias', min: 3, max: 5, color: '#f97316' },
      { label: '6-10 dias', min: 6, max: 10, color: '#ef4444' },
      { label: '11+ dias', min: 11, max: Infinity, color: '#dc2626' }
    ];

    return ranges.map(range => {
      const count = filteredTasks.filter(task => 
        task.atrasoDiasUteis >= range.min && task.atrasoDiasUteis <= range.max
      ).length;
      
      const percentage = filteredTasks.length > 0 ? (count / filteredTasks.length) * 100 : 0;
      
      return {
        ...range,
        count,
        percentage: Math.round(percentage * 10) / 10
      };
    });
  }, [filteredTasks]);

  // Análise por dia da semana
  const weekdayAnalysis = useMemo(() => {
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    return weekdays.map((day, index) => {
      const dayTasks = filteredTasks.filter(task => new Date(task.fim).getDay() === index);
      const avgDelay = dayTasks.length > 0 
        ? dayTasks.reduce((sum, task) => sum + task.atrasoDiasUteis, 0) / dayTasks.length
        : 0;
      
      return {
        day,
        avgDelay: Math.round(avgDelay * 10) / 10,
        taskCount: dayTasks.length
      };
    });
  }, [filteredTasks]);

  // Análise por mês
  const monthlyAnalysis = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return months.map((month, index) => {
      const monthTasks = filteredTasks.filter(task => new Date(task.fim).getMonth() === index);
      const avgDelay = monthTasks.length > 0 
        ? monthTasks.reduce((sum, task) => sum + task.atrasoDiasUteis, 0) / monthTasks.length
        : 0;
      
      return {
        month,
        avgDelay: Math.round(avgDelay * 10) / 10,
        taskCount: monthTasks.length
      };
    }).filter(item => item.taskCount > 0); // Mostrar apenas meses com dados
  }, [filteredTasks]);

  const renderDistributionChart = () => (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={delayDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-300" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 12, fill: "currentColor" }}
            className="text-gray-600"
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "currentColor" }}
            className="text-gray-600"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              color: "#222"
            }}
            formatter={(value: number, name: string) => [
              name === 'count' ? `${value} tarefas` : `${value}%`,
              name === 'count' ? 'Quantidade' : 'Percentual'
            ]}
          />
          <Bar 
            dataKey="count" 
            fill="currentColor"
            className="text-blue-500"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderPieChart = () => (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={delayDistribution.filter(item => item.count > 0)}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="count"
            label={({ label, percentage }) => `${label}: ${percentage}%`}
          >
            {delayDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              color: "#222"
            }}
            formatter={(value: number) => [`${value} tarefas`, 'Quantidade']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTemporalAnalysis = () => {
    const data = filterType === 'weekday' ? weekdayAnalysis : monthlyAnalysis;
    const dataKey = filterType === 'weekday' ? 'day' : 'month';
    
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-300" />
            <XAxis 
              dataKey={dataKey} 
              tick={{ fontSize: 12, fill: "currentColor" }}
              className="text-gray-600"
            />
            <YAxis 
              tick={{ fontSize: 12, fill: "currentColor" }}
              className="text-gray-600"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                color: "#222"
              }}
              formatter={(value: number, name: string) => [
                name === 'avgDelay' ? formatDays(value) : `${value} tarefas`,
                name === 'avgDelay' ? 'Atraso Médio' : 'Quantidade'
              ]}
            />
            <Bar 
              dataKey="avgDelay" 
              fill="currentColor"
              className="text-orange-500"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">
            Análise de Distribuição de Atrasos
          </h3>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Análise de Padrões de Atraso</h4>
                  <p className="text-sm text-light-gray leading-relaxed">
                    Visualização interativa que permite explorar os padrões de atraso por diferentes perspectivas temporais.
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-light-gray rounded-full mt-2 flex-shrink-0" />
                      <span className="text-light-gray">Distribuição Geral: faixas de atraso em barras/pizza</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-light-gray rounded-full mt-2 flex-shrink-0" />
                      <span className="text-light-gray">Por Dia da Semana: identifica padrões semanais</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-light-gray rounded-full mt-2 flex-shrink-0" />
                      <span className="text-light-gray">Por Mês: revela tendências sazonais</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-light-gray rounded-full mt-2 flex-shrink-0" />
                      <span className="text-light-gray">Filtros de período para análise focada</span>
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-2" />
                </div>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Visualização detalhada dos padrões de atraso por faixas e períodos temporais
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-white">Visualização:</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="px-3 py-1 border border-white/20 rounded-md text-sm bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
          >
            <option value="all" className="bg-gray-800 text-white">Distribuição Geral</option>
            <option value="weekday" className="bg-gray-800 text-white">Por Dia da Semana</option>
            <option value="period" className="bg-gray-800 text-white">Por Mês</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-white">Período:</label>
          <select 
            value={periodFilter} 
            onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
            className="px-3 py-1 border border-white/20 rounded-md text-sm bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
          >
            <option value="all" className="bg-gray-800 text-white">Todos os Dados</option>
            <option value="last30" className="bg-gray-800 text-white">Últimos 30 dias</option>
            <option value="last90" className="bg-gray-800 text-white">Últimos 90 dias</option>
            <option value="thisYear" className="bg-gray-800 text-white">Este Ano</option>
          </select>
        </div>
      </div>

      {/* Gráfico Principal */}
      <div className="mb-6">
        {filterType === 'all' ? renderDistributionChart() : renderTemporalAnalysis()}
      </div>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-4 bg-card border border-border rounded-lg cursor-help hover:bg-purple-500/20 transition-colors">
                <div className="text-2xl font-bold text-white hover:text-purple-400 transition-colors">
                  {delayDistribution[0]?.percentage || 0}%
                </div>
                <div className="text-sm text-white hover:text-purple-400 flex items-center justify-center gap-1 mt-2 transition-colors">
                  No Prazo
                  <HelpCircle className="h-4 w-4" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Tarefas no Prazo</p>
                <p>Percentual de tarefas concluídas exatamente no prazo estabelecido ou antes.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>

        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-4 bg-card border border-border rounded-lg cursor-help hover:bg-purple-500/20 transition-colors">
                <div className="text-2xl font-bold text-white hover:text-purple-400 transition-colors">
                  {(delayDistribution[1]?.percentage || 0) + (delayDistribution[2]?.percentage || 0)}%
                </div>
                <div className="text-sm text-white hover:text-purple-400 flex items-center justify-center gap-1 mt-2 transition-colors">
                  Atraso Leve
                  <HelpCircle className="h-4 w-4" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Atraso Leve (1-5 dias)</p>
                <p>Tarefas com atraso moderado que ainda podem ser recuperadas com ações corretivas.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>

        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-4 bg-card border border-border rounded-lg cursor-help hover:bg-purple-500/20 transition-colors">
                <div className="text-2xl font-bold text-white hover:text-purple-400 transition-colors">
                  {(delayDistribution[3]?.percentage || 0) + (delayDistribution[4]?.percentage || 0)}%
                </div>
                <div className="text-sm text-white hover:text-purple-400 flex items-center justify-center gap-1 mt-2 transition-colors">
                  Atraso Grave
                  <HelpCircle className="h-4 w-4" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Atraso Grave (6+ dias)</p>
                <p>Tarefas com atraso significativo que impactam o cronograma geral e requerem intervenção.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>

        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-4 bg-card border border-border rounded-lg cursor-help hover:bg-purple-500/20 transition-colors">
                <div className="text-2xl font-bold text-white hover:text-purple-400 transition-colors">
                  {filteredTasks.length}
                </div>
                <div className="text-sm text-white hover:text-purple-400 flex items-center justify-center gap-1 mt-2 transition-colors">
                  Total Tarefas
                  <HelpCircle className="h-4 w-4" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Total de Tarefas</p>
                <p>Número total de tarefas consideradas na análise atual, baseado nos filtros aplicados.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>

      {/* Gráfico de Pizza (apenas para distribuição geral) */}
      {filterType === 'all' && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-white hover:text-purple-400 mb-4 transition-colors">
            Distribuição Proporcional
          </h4>
          {renderPieChart()}
        </div>
      )}

      {/* Insights */}
      <div className="p-4 bg-card border border-border rounded-lg hover:bg-purple-500/20 transition-colors">
        <h4 className="text-base font-semibold text-white hover:text-purple-400 mb-2 transition-colors">
          📊 Insights da Análise
        </h4>
        <div className="text-sm text-white hover:text-purple-400 space-y-1 transition-colors">
          {filterType === 'all' && (
            <>
              <p>• {delayDistribution[0]?.count || 0} tarefas foram entregues no prazo</p>
              <p>• {(delayDistribution[3]?.count || 0) + (delayDistribution[4]?.count || 0)} tarefas tiveram atrasos significativos (6+ dias)</p>
            </>
          )}
          {filterType === 'weekday' && (
            <p>• Análise por dia da semana mostra padrões de entrega e possíveis gargalos</p>
          )}
          {filterType === 'period' && (
            <p>• Análise mensal revela tendências sazonais e variações de performance</p>
          )}
          <p>• Use os filtros para explorar diferentes perspectivas dos dados</p>
        </div>
      </div>
    </div>
  );
};

export default DelayDistributionChart;