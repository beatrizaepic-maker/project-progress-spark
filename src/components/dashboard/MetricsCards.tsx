import { Card } from "@/components/ui/card";
import { CheckCircle, Clock, Target, TrendingUp, AlertTriangle, BarChart } from "lucide-react";
import { projectMetrics } from "@/data/projectData";

const metrics = [
  {
    title: "Total de Tarefas",
    value: projectMetrics.totalTarefas,
    icon: Target,
    gradient: "from-primary/20 to-primary/10",
    textColor: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    title: "Tarefas no Prazo",
    value: projectMetrics.tarefasNoPrazo,
    subtitle: `${Math.round((projectMetrics.tarefasNoPrazo / projectMetrics.totalTarefas) * 100)}% do total`,
    icon: CheckCircle,
    gradient: "from-success/20 to-success/10",
    textColor: "text-success",
    bgColor: "bg-success/10"
  },
  {
    title: "Tarefas Atrasadas", 
    value: projectMetrics.tarefasAtrasadas,
    subtitle: `${Math.round((projectMetrics.tarefasAtrasadas / projectMetrics.totalTarefas) * 100)}% do total`,
    icon: AlertTriangle,
    gradient: "from-warning/20 to-warning/10", 
    textColor: "text-warning",
    bgColor: "bg-warning/10"
  },
  {
    title: "Média Produção",
    value: `${projectMetrics.mediaProducao.toFixed(1)} dias`,
    icon: TrendingUp,
    gradient: "from-accent/20 to-accent/10",
    textColor: "text-accent",
    bgColor: "bg-accent/10"
  },
  {
    title: "Média Atrasos",
    value: `${projectMetrics.mediaAtrasos.toFixed(1)} dias`,
    icon: Clock,
    gradient: "from-destructive/20 to-destructive/10",
    textColor: "text-destructive", 
    bgColor: "bg-destructive/10"
  },
  {
    title: "Desvio Padrão",
    value: projectMetrics.desvioPadrao.toFixed(1),
    subtitle: "Variação da duração",
    icon: BarChart,
    gradient: "from-muted-foreground/20 to-muted-foreground/10",
    textColor: "text-muted-foreground",
    bgColor: "bg-muted-foreground/10"
  }
];

export default function MetricsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card
            key={index}
            className="p-6 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                {metric.subtitle && (
                  <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                )}
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.gradient} border border-opacity-20`}>
                <Icon className={`h-5 w-5 ${metric.textColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}