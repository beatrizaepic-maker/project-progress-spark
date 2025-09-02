import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useData } from "@/contexts/DataContext";
import ProductionAverageChart from "@/components/analytics/ProductionAverageChart";
import ModeFrequencyChart from "@/components/analytics/ModeFrequencyChart";
import MedianBoxPlot from "@/components/analytics/MedianBoxPlot";
import DelayDistributionChart from "@/components/analytics/DelayDistributionChart";
import { useIsMobile } from "@/hooks/use-mobile";
import { Suspense, lazy } from "react";

// Lazy loading dos gráficos pesados
const LazyProductionChart = lazy(() => import("@/components/analytics/ProductionAverageChart"));
const LazyModeChart = lazy(() => import("@/components/analytics/ModeFrequencyChart"));
const LazyMedianChart = lazy(() => import("@/components/analytics/MedianBoxPlot"));
const LazyDelayChart = lazy(() => import("@/components/analytics/DelayDistributionChart"));

export default function Charts() {
  const { tasks, metrics } = useData();
  const isMobile = useIsMobile();

  // Componente de loading para lazy loading
  const ChartSkeleton = () => (
    <div className="h-80 bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Carregando gráfico...</div>
    </div>
  );

  const chartData = tasks.map(task => ({
    tarefa: task.tarefa.length > (isMobile ? 10 : 15) ? 
      task.tarefa.substring(0, isMobile ? 10 : 15) + "..." : 
      task.tarefa,
    duracao: task.duracaoDiasUteis,
    atraso: task.atrasoDiasUteis
  }));

  const pieData = [
    { name: "No Prazo", value: metrics.tarefasNoPrazo, color: "hsl(142 76% 36%)" },
    { name: "Atrasadas", value: metrics.tarefasAtrasadas, color: "hsl(38 92% 50%)" }
  ];
  return (
    <div className="space-y-8">
      {/* Gráficos Básicos */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {/* Bar Chart */}
        <Card className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200">
          <div className="space-y-4">
            <div>
              <h3 className={`font-semibold text-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>
                Duração vs Atraso por Tarefa
              </h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Comparação entre tempo planejado e atrasos
              </p>
            </div>
            <div className={isMobile ? 'h-64' : 'h-80'}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={isMobile ? 
                    { top: 10, right: 10, left: 10, bottom: 50 } : 
                    { top: 20, right: 30, left: 20, bottom: 5 }
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="tarefa"
                    tick={{ fontSize: isMobile ? 10 : 12, fill: "hsl(var(--muted-foreground))" }}
                    angle={-45}
                    textAnchor="end"
                    height={isMobile ? 60 : 80}
                    interval={isMobile ? 'preserveStartEnd' : 0}
                  />
                  <YAxis tick={{ fontSize: isMobile ? 10 : 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: isMobile ? '12px' : '14px'
                    }}
                  />
                  <Bar dataKey="duracao" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="atraso" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Efeito de brilho sutil */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200">
          <div className="space-y-4">
            <div>
              <h3 className={`font-semibold text-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>
                Taxa de Cumprimento de Prazos
              </h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Distribuição de tarefas por pontualidade
              </p>
            </div>
            <div className={isMobile ? 'h-64' : 'h-80'}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 60 : 80}
                    dataKey="value"
                    label={({ name, percent }) => 
                      isMobile ? 
                        `${(percent * 100).toFixed(0)}%` : 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderRadius: '0.5rem',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Efeito de brilho sutil */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </Card>
      </div>

      {/* Análises Estatísticas Avançadas */}
      <div className="space-y-6">
        <div>
          <h3 className={`font-semibold text-foreground mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Análises Estatísticas
          </h3>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            Visualizações avançadas com cálculos estatísticos detalhados
          </p>
        </div>

        {/* Gráfico de Média de Produção com Lazy Loading */}
        <Suspense fallback={<ChartSkeleton />}>
          <LazyProductionChart tasks={tasks} averageProduction={metrics.mediaProducao} />
        </Suspense>

        {/* Análise da Moda com Lazy Loading */}
        <Suspense fallback={<ChartSkeleton />}>
          <LazyModeChart tasks={tasks} mode={metrics.moda} />
        </Suspense>

        {/* Box Plot da Mediana com Lazy Loading */}
        <Suspense fallback={<ChartSkeleton />}>
          <LazyMedianChart tasks={tasks} median={metrics.mediana} />
        </Suspense>

        {/* Análise de Distribuição de Atrasos com Lazy Loading */}
        <Suspense fallback={<ChartSkeleton />}>
          <LazyDelayChart tasks={tasks} />
        </Suspense>
      </div>
    </div>
  );
}