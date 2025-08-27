import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { useData } from "@/contexts/DataContext";

const TaskTable = () => {
  const { tasks } = useData();
  return (
    <Card className="border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-foreground">Detalhamento das Tarefas</CardTitle>
      </CardHeader>
      
      <CardContent>
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
              {tasks.map((task, index) => (
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
                    <span className="text-sm font-medium">{task.duracaoDiasUteis}d</span>
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
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskTable;