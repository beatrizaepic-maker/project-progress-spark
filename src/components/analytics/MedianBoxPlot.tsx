import React from 'react';
import { TaskData } from '@/data/projectData';
import { formatDays } from '@/utils/kpiFormatters';
import { KPICalculator } from '@/services/kpiCalculator';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Target } from 'lucide-react';

interface MedianBoxPlotProps {
  tasks: TaskData[];
  median: number;
}

const MedianBoxPlot: React.FC<MedianBoxPlotProps> = ({
  tasks,
  median
}) => {
  const calculator = new KPICalculator();
  
  // Calcula estatísticas para o box plot
  const calculateBoxPlotStats = () => {
    const durations = tasks.map(t => t.duracaoDiasUteis);
    const withoutOutliers = calculator.removeOutliers(durations);
    const sorted = [...withoutOutliers].sort((a, b) => a - b);
    
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    return {
      min: Math.min(...sorted),
      q1: sorted[q1Index],
      median: median,
      q3: sorted[q3Index],
      max: Math.max(...sorted),
      outliers: durations.filter(d => !withoutOutliers.includes(d)),
      totalValues: durations.length,
      cleanValues: withoutOutliers.length
    };
  };

  const stats = calculateBoxPlotStats();
  const range = stats.max - stats.min;
  const chartWidth = 400;
  const chartHeight = 100;

  // Função para converter valor para posição no gráfico
  const valueToPosition = (value: number) => {
    return ((value - stats.min) / range) * chartWidth;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Análise de Mediana (Box Plot)
          </h3>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Box Plot da Mediana</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Visualização que mostra a distribuição dos dados através de quartis, destacando a mediana como valor central.
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">Caixa azul: 50% dos dados centrais (Q1 a Q3)</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">Linha vermelha: mediana (valor central)</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">Bigodes: extensão dos dados sem outliers</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">Pontos vermelhos: outliers removidos</span>
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-2">
                    <div className="text-xs">
                      <span className="font-medium text-foreground">Interpretação:</span>
                      <p className="text-muted-foreground mt-1">
                        50% das tarefas levam menos que a mediana, 50% levam mais.
                      </p>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mediana: {formatDays(median)} • 
          {stats.outliers.length} outliers removidos • 
          {stats.cleanValues} de {stats.totalValues} valores considerados
        </p>
      </div>

      {/* Box Plot SVG */}
      <div className="flex justify-center mb-6">
        <svg width={chartWidth + 100} height={chartHeight + 60} className="overflow-visible">
          {/* Eixo X */}
          <line 
            x1={50} 
            y1={chartHeight + 20} 
            x2={chartWidth + 50} 
            y2={chartHeight + 20} 
            stroke="currentColor" 
            strokeWidth="1"
            className="text-gray-400"
          />
          
          {/* Whiskers (bigodes) */}
          <line 
            x1={50 + valueToPosition(stats.min)} 
            y1={30} 
            x2={50 + valueToPosition(stats.q1)} 
            y2={30} 
            stroke="currentColor" 
            strokeWidth="2"
            className="text-gray-600"
          />
          <line 
            x1={50 + valueToPosition(stats.q3)} 
            y1={30} 
            x2={50 + valueToPosition(stats.max)} 
            y2={30} 
            stroke="currentColor" 
            strokeWidth="2"
            className="text-gray-600"
          />
          
          {/* Linhas verticais dos whiskers */}
          <line 
            x1={50 + valueToPosition(stats.min)} 
            y1={20} 
            x2={50 + valueToPosition(stats.min)} 
            y2={40} 
            stroke="currentColor" 
            strokeWidth="2"
            className="text-gray-600"
          />
          <line 
            x1={50 + valueToPosition(stats.max)} 
            y1={20} 
            x2={50 + valueToPosition(stats.max)} 
            y2={40} 
            stroke="currentColor" 
            strokeWidth="2"
            className="text-gray-600"
          />
          
          {/* Box (caixa) */}
          <rect 
            x={50 + valueToPosition(stats.q1)} 
            y={10} 
            width={valueToPosition(stats.q3) - valueToPosition(stats.q1)} 
            height={40} 
            fill="rgba(59, 130, 246, 0.2)" 
            stroke="rgb(59, 130, 246)" 
            strokeWidth="2"
          />
          
          {/* Linha da mediana */}
          <line 
            x1={50 + valueToPosition(stats.median)} 
            y1={10} 
            x2={50 + valueToPosition(stats.median)} 
            y2={50} 
            stroke="rgb(239, 68, 68)" 
            strokeWidth="3"
          />
          
          {/* Outliers */}
          {stats.outliers.map((outlier, index) => (
            <circle 
              key={index}
              cx={50 + valueToPosition(outlier)} 
              cy={30} 
              r="3" 
              fill="rgb(239, 68, 68)" 
              opacity="0.7"
            />
          ))}
          
          {/* Labels */}
          <text x={50 + valueToPosition(stats.min)} y={chartHeight + 40} textAnchor="middle" className="text-xs fill-current text-gray-600">
            Min: {formatDays(stats.min)}
          </text>
          <text x={50 + valueToPosition(stats.q1)} y={chartHeight + 40} textAnchor="middle" className="text-xs fill-current text-gray-600">
            Q1: {formatDays(stats.q1)}
          </text>
          <text x={50 + valueToPosition(stats.median)} y={chartHeight + 40} textAnchor="middle" className="text-xs fill-current text-red-600 font-semibold">
            Mediana: {formatDays(stats.median)}
          </text>
          <text x={50 + valueToPosition(stats.q3)} y={chartHeight + 40} textAnchor="middle" className="text-xs fill-current text-gray-600">
            Q3: {formatDays(stats.q3)}
          </text>
          <text x={50 + valueToPosition(stats.max)} y={chartHeight + 40} textAnchor="middle" className="text-xs fill-current text-gray-600">
            Max: {formatDays(stats.max)}
          </text>
        </svg>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-center space-x-6 mb-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-200 border-2 border-blue-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Quartis (Q1-Q3)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-red-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Mediana</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full opacity-70"></div>
          <span className="text-gray-600 dark:text-gray-400">Outliers</span>
        </div>
      </div>

      {/* Estatísticas detalhadas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition-colors">
                <div className="text-xl font-bold text-gray-600 dark:text-gray-400">
                  {formatDays(stats.min)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                  Mínimo
                  <HelpCircle className="h-3 w-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Valor Mínimo</p>
                <p>Menor duração observada após remoção de outliers. Representa a tarefa mais rápida.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>

        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition-colors">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatDays(stats.q1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                  Q1 (25%)
                  <HelpCircle className="h-3 w-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Primeiro Quartil (Q1)</p>
                <p>25% das tarefas levam menos que este tempo. Marca o início da caixa no box plot.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>

        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition-colors">
                <div className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatDays(stats.median)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                  Mediana
                  <HelpCircle className="h-3 w-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Mediana (Q2)</p>
                <p>Valor central: 50% das tarefas levam menos, 50% levam mais. Menos sensível a outliers que a média.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>

        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition-colors">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatDays(stats.q3)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                  Q3 (75%)
                  <HelpCircle className="h-3 w-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Terceiro Quartil (Q3)</p>
                <p>75% das tarefas levam menos que este tempo. Marca o fim da caixa no box plot.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>

        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition-colors">
                <div className="text-xl font-bold text-gray-600 dark:text-gray-400">
                  {formatDays(stats.max)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                  Máximo
                  <HelpCircle className="h-3 w-3" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">Valor Máximo</p>
                <p>Maior duração observada após remoção de outliers. Representa a tarefa mais demorada.</p>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>

      {/* Explicação da mediana */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
          📊 Interpretação da Mediana
        </h4>
        <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
          A mediana representa o valor central quando as durações são ordenadas. 
          50% das tarefas levam menos que {formatDays(median)} e 50% levam mais.
        </p>
        {stats.outliers.length > 0 && (
          <p className="text-xs text-blue-700 dark:text-blue-300">
            {stats.outliers.length} outliers foram removidos do cálculo para maior precisão: 
            {stats.outliers.map(o => formatDays(o)).join(', ')}.
          </p>
        )}
      </div>
    </div>
  );
};

export default MedianBoxPlot;