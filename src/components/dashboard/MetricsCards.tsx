import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { CheckCircle, Clock, Target, AlertTriangle, BarChart3 } from "lucide-react";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import { useData } from "@/contexts/DataContext";
import { ErrorDisplay, ErrorSummary } from "@/components/ui/error-display";
import { kpiCalculator } from "@/services/kpiCalculator";

export default function MetricsCards() {
  const { metrics: projectMetrics, kpiResults } = useData();
  
  // Component wrapper para cada card com efeito de elevação
  const MetricCard = ({ metric, index }: { metric: any, index: number }) => {
    const [isHovered, setIsHovered] = useState(false);
    const Icon = metric.icon;
    
    return (
      <motion.div
        initial={{ y: 0 }}
        animate={{
          y: isHovered ? -8 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          boxShadow: isHovered 
            ? "0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(139, 92, 246, 0.2)" 
            : "0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(139, 92, 246, 0.1)"
        }}
      >
        <Card
          className="p-6 hover:shadow-lg transition-all duration-300 border-2 border-purple-500 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              {metric.subtitle && (
                <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
              )}
            </div>
            <div className={`p-2 bg-gradient-to-br ${metric.gradient} border border-opacity-20`}>
              <Icon className={`h-5 w-5 ${metric.textColor}`} />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };
  
  // Obtém erros do último cálculo
  const errorHistory = kpiCalculator.getErrorHistory();
  const hasErrors = kpiResults?.hasErrors || false;
  const errorCount = kpiResults?.errorCount || 0;
  const criticalErrors = kpiResults?.criticalErrors || false;
  
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
      icon: BarChart3,
      gradient: "from-muted-foreground/20 to-muted-foreground/10",
      textColor: "text-muted-foreground",
      bgColor: "bg-muted-foreground/10"
    }
  ];
  const handleRetry = () => {
    // Força recálculo dos KPIs
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Exibe resumo de erros se houver */}
      {hasErrors && (
        <ErrorSummary
          errorCount={errorCount}
          criticalErrors={criticalErrors}
          onViewDetails={() => console.log('Ver detalhes dos erros')}
        />
      )}

      {/* Exibe erros detalhados se houver erros críticos */}
      {criticalErrors && (
        <ErrorDisplay
          errors={errorHistory}
          onRetry={handleRetry}
          showDetails={false}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} index={index} />
        ))}
      </div>
    </div>
  );
}