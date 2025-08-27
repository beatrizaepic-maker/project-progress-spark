import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockTaskData } from "@/data/projectData";
import { CheckCircle, XCircle, Calendar, Clock } from "lucide-react";

export default function TaskTable() {
  return (
    <Card className="border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Detalhamento das Tarefas</h3>
            <p className="text-sm text-muted-foreground">Cronograma completo do projeto com métricas</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tarefa</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Início</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fim</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Prazo</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Duração</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Atraso</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockTaskData.map((task, index) => (
              <tr 
                key={task.id} 
                className={`border-b border-border hover:bg-muted/10 transition-colors ${
                  index % 2 === 0 ? 'bg-card/50' : 'bg-transparent'
                }`}
              >
                <td className="p-4">
                  <div className="font-medium text-foreground">{task.tarefa}</div>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(task.inicio).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(task.fim).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(task.prazo).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{task.duracaoDiasUteis}d</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <Badge 
                    variant={task.atrasoDiasUteis === 0 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {task.atrasoDiasUteis === 0 ? "0d" : `+${task.atrasoDiasUteis}d`}
                  </Badge>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center">
                    {task.atendeuPrazo ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-warning" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}