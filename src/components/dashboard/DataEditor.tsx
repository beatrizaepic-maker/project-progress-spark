import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { TaskData } from '@/data/projectData';
import { toast } from '@/hooks/use-toast';
import KanbanBoard from './KanbanBoard';

interface TaskFormData {
  tarefa: string;
  responsavel: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'completed';
  inicio: string;
  fim?: string; // Campo opcional
  prazo: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
}

const TaskForm: React.FC<{
  task?: TaskData;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}> = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    tarefa: task?.tarefa || '',
    responsavel: task?.responsavel || '',
    status: task?.status || 'backlog',
    inicio: task?.inicio || '',
    fim: task?.fim || '',
    prazo: task?.prazo || '',
    prioridade: task?.prioridade || 'media'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validação apenas para campos obrigatórios (fim é opcional)
    if (!formData.tarefa || !formData.responsavel || !formData.status || !formData.inicio || !formData.prazo || !formData.prioridade) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios, exceto a data de fim.",
        variant: "destructive"
      });
      return;
    }
    
    // Validação de datas apenas se a data de fim estiver preenchida
    if (formData.fim && new Date(formData.inicio) > new Date(formData.fim)) {
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
      
      <div>
        <Label htmlFor="responsavel">Responsável</Label>
        <Input
          id="responsavel"
          value={formData.responsavel}
          onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
          placeholder="Digite o nome do responsável"
        />
      </div>
      
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="todo">A Fazer</SelectItem>
            <SelectItem value="in-progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="prioridade">Prioridade</Label>
        <Select value={formData.prioridade} onValueChange={(value) => setFormData(prev => ({ ...prev, prioridade: value as any }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="critica">Crítica</SelectItem>
          </SelectContent>
        </Select>
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
          <Label htmlFor="fim">Data de Fim (opcional)</Label>
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
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'player'>('table');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  
  // Função para obter players únicos a partir das tarefas
  const players = Array.from(new Set(tasks.map(task => task.responsavel))).filter(Boolean) as string[];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'backlog': return 'Backlog';
      case 'todo': return 'A Fazer';
      case 'in-progress': return 'Em Andamento';
      case 'completed': return 'Concluída';
      default: return status;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'backlog': return 'secondary';
      case 'todo': return 'outline';
      case 'in-progress': return 'default';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

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
      // Não fechamos o modal do player para que as alterações sejam vistas imediatamente
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
              📤
              Importar
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              📥
              Exportar
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-200 transform hover:scale-105 border-0"
                >
                  ➕
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" style={{ borderRadius: '0' }}>
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
        {/* Controles de Visualização */}
        <div className="mb-6">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'kanban' | 'player')}>
            <TabsList className="grid w-fit grid-cols-3 bg-muted">
              <TabsTrigger value="table" className="flex items-center gap-2">
                📊 Tabela
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                📋 Kanban
              </TabsTrigger>
              <TabsTrigger value="player" className="flex items-center gap-2">
                👤 Player
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Visualização da Tabela */}
        {viewMode === 'table' && (
          <div 
            className="rounded-lg border overflow-x-auto" 
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#a855f7 transparent'
            }}
          >
            <style dangerouslySetInnerHTML={{
              __html: `
                .rounded-lg::-webkit-scrollbar {
                  height: 8px;
                }
                .rounded-lg::-webkit-scrollbar-track {
                  background: transparent;
                }
                .rounded-lg::-webkit-scrollbar-thumb {
                  background-color: #a855f7;
                  border-radius: 0;
                }
                .rounded-lg::-webkit-scrollbar-thumb:hover {
                  background-color: #9333ea;
                }
              `
            }} />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarefa</TableHead>
                  <TableHead>Responsável</TableHead>
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
                    <TableCell>{task.responsavel || 'Não informado'}</TableCell>
                    <TableCell>{new Date(task.inicio).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{task.fim ? new Date(task.fim).toLocaleDateString('pt-BR') : 'Não informado'}</TableCell>
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
                      <Badge variant={getStatusBadgeVariant(task.status)}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTask(task)}
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Visualização do Kanban */}
        {viewMode === 'kanban' && (
          <div className="w-full">
            <KanbanBoard
              tasks={tasks}
              onEdit={(task) => setEditingTask(task)}
              onDelete={(taskId) => deleteTask(taskId)}
            />
          </div>
        )}
        
        {/* Visualização do Player */}
        {viewMode === 'player' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Players</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {players.map((player, index) => (
                <div 
                  key={index} 
                  className={`p-4 border rounded-lg transition-colors cursor-pointer border-border ${
                    selectedPlayer === player 
                      ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20' 
                      : 'bg-card hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      selectedPlayer === player 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {player?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{player}</div>
                      <div className="text-xs text-muted-foreground">
                        {tasks.filter(t => t.responsavel === player).length} tarefas
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {players.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum player encontrado. Atribua responsáveis às tarefas para aparecerem aqui.
              </div>
            )}
          </div>
        )}
        
        {/* Edit Dialog */}
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="max-w-2xl" style={{ borderRadius: '0' }}>
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
        
        {/* Player Tasks Dialog */}
        <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {selectedPlayer?.charAt(0).toUpperCase()}
                </div>
                Tarefas de {selectedPlayer}
              </DialogTitle>
              <DialogDescription>
                Gerencie as tarefas atribuídas a este player
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Botão para adicionar nova tarefa ao player */}
              <div className="flex justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      ➕ Adicionar Nova Tarefa
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl" style={{ borderRadius: '0' }}>
                    <DialogHeader>
                      <DialogTitle>Adicionar Tarefa para {selectedPlayer}</DialogTitle>
                      <DialogDescription>
                        Preencha os dados da nova tarefa para o player.
                      </DialogDescription>
                    </DialogHeader>
                    <TaskForm 
                      onSubmit={(data) => {
                        // Preenche automaticamente o campo responsável com o player selecionado
                        addTask({
                          ...data,
                          responsavel: selectedPlayer || '',
                          duracaoDiasUteis: 0,
                          atrasoDiasUteis: 0,
                          atendeuPrazo: true
                        });
                      }} 
                      onCancel={() => {}} // O cancelamento será tratado pelo fechamento do dialog
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Lista de tarefas do player */}
              <div className="rounded-lg border overflow-x-auto">
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
                    {tasks
                      .filter(task => task.responsavel === selectedPlayer)
                      .map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.tarefa}</TableCell>
                          <TableCell>{new Date(task.inicio).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{task.fim ? new Date(task.fim).toLocaleDateString('pt-BR') : 'Não informado'}</TableCell>
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
                            <Badge variant={getStatusBadgeVariant(task.status)}>
                              {getStatusLabel(task.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingTask(task);
                                  // Não fecha o modal do player, deixando ambos abertos
                                }}
                              >
                                ✏️
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                              >
                                🗑️
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              
              {tasks.filter(task => task.responsavel === selectedPlayer).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma tarefa atribuída a este player.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DataEditor;