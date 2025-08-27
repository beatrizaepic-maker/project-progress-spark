import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Upload, Download, CheckCircle, XCircle } from 'lucide-react';
import { TaskData } from '@/data/projectData';
import { toast } from '@/hooks/use-toast';

interface TaskFormData {
  tarefa: string;
  inicio: string;
  fim: string;
  prazo: string;
}

const TaskForm: React.FC<{
  task?: TaskData;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}> = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    tarefa: task?.tarefa || '',
    inicio: task?.inicio || '',
    fim: task?.fim || '',
    prazo: task?.prazo || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tarefa || !formData.inicio || !formData.fim || !formData.prazo) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    if (new Date(formData.inicio) > new Date(formData.fim)) {
      toast({
        title: "Erro",
        description: "A data de início deve ser anterior à data de fim.",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="tarefa">Nome da Tarefa</Label>
        <Input
          id="tarefa"
          value={formData.tarefa}
          onChange={(e) => setFormData(prev => ({ ...prev, tarefa: e.target.value }))}
          placeholder="Digite o nome da tarefa"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="inicio">Data de Início</Label>
          <Input
            id="inicio"
            type="date"
            value={formData.inicio}
            onChange={(e) => setFormData(prev => ({ ...prev, inicio: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="fim">Data de Fim</Label>
          <Input
            id="fim"
            type="date"
            value={formData.fim}
            onChange={(e) => setFormData(prev => ({ ...prev, fim: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="prazo">Prazo</Label>
          <Input
            id="prazo"
            type="date"
            value={formData.prazo}
            onChange={(e) => setFormData(prev => ({ ...prev, prazo: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {task ? 'Salvar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
};

const DataEditor: React.FC = () => {
  const { tasks, addTask, editTask, deleteTask, importData, exportData } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);

  const handleAddTask = (data: TaskFormData) => {
    addTask({
      ...data,
      duracaoDiasUteis: 0, // Will be calculated in context
      atrasoDiasUteis: 0,  // Will be calculated in context
      atendeuPrazo: true   // Will be calculated in context
    });
    setIsAddDialogOpen(false);
  };

  const handleEditTask = (data: TaskFormData) => {
    if (editingTask) {
      editTask(editingTask.id, data);
      setEditingTask(null);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (Array.isArray(data) && data.every(item => 
              typeof item === 'object' && 
              'tarefa' in item && 
              'inicio' in item && 
              'fim' in item && 
              'prazo' in item
            )) {
              importData(data);
            } else {
              throw new Error('Formato inválido');
            }
          } catch (error) {
            toast({
              title: "Erro na importação",
              description: "Arquivo com formato inválido.",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Dados exportados",
      description: "Os dados foram salvos em 'project-data.json'."
    });
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Editor de Dados</CardTitle>
            <CardDescription>
              Gerencie as tarefas do seu projeto
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da nova tarefa do projeto.
                  </DialogDescription>
                </DialogHeader>
                <TaskForm 
                  onSubmit={handleAddTask} 
                  onCancel={() => setIsAddDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarefa</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Atraso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.tarefa}</TableCell>
                  <TableCell>{new Date(task.inicio).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{new Date(task.fim).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{new Date(task.prazo).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{task.duracaoDiasUteis} dias</TableCell>
                  <TableCell>
                    {task.atrasoDiasUteis > 0 ? (
                      <Badge variant="destructive">{task.atrasoDiasUteis} dias</Badge>
                    ) : (
                      <Badge variant="secondary">No prazo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.atendeuPrazo ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTask(task)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Edit Dialog */}
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Tarefa</DialogTitle>
              <DialogDescription>
                Modifique os dados da tarefa.
              </DialogDescription>
            </DialogHeader>
            {editingTask && (
              <TaskForm 
                task={editingTask}
                onSubmit={handleEditTask} 
                onCancel={() => setEditingTask(null)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DataEditor;