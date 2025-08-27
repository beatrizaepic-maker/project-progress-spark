import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useData } from "@/contexts/DataContext";

export default function Charts() {
  const { tasks, metrics } = useData();
  
  const chartData = tasks.map(task => ({
    tarefa: task.tarefa.length > 15 ? task.tarefa.substring(0, 15) + "..." : task.tarefa,
    duracao: task.duracaoDiasUteis,
    atraso: task.atrasoDiasUteis
  }));

  const pieData = [
    { name: "No Prazo", value: metrics.tarefasNoPrazo, color: "hsl(142 76% 36%)" },
    { name: "Atrasadas", value: metrics.tarefasAtrasadas, color: "hsl(38 92% 50%)" }
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <Card className="p-6 border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Duração vs Atraso por Tarefa</h3>
            <p className="text-sm text-muted-foreground">Comparação entre tempo planejado e atrasos</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="tarefa" 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="duracao" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atraso" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Pie Chart */}
      <Card className="p-6 border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Taxa de Cumprimento de Prazos</h3>
            <p className="text-sm text-muted-foreground">Distribuição de tarefas por pontualidade</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}