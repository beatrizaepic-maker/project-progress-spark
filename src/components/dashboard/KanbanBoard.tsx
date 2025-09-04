import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskData } from '@/data/projectData';
import { useData } from '@/contexts/DataContext';
import { 
  Clock, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: TaskData[];
  onEdit: (task: TaskData) => void;
  onDelete: (taskId: number) => void;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: TaskData[];
  color: string;
  icon: React.ReactNode;
  onEdit: (task: TaskData) => void;
  onDelete: (taskId: number) => void;
}

interface KanbanTaskProps {
  task: TaskData;
  onEdit: (task: TaskData) => void;
  onDelete: (taskId: number) => void;
}

// Mapeamento de status para configurações visuais
const statusConfig = {
  backlog: {
    title: 'Backlog',
    color: 'bg-slate-100 border-slate-300',
    headerColor: 'bg-slate-200',
    icon: <span className="text-slate-600">🎯</span>,
    taskColor: 'border-l-slate-500'
  },
  todo: {
    title: 'A Fazer',
    color: 'bg-blue-50 border-blue-300',
    headerColor: 'bg-blue-100',
    icon: <Clock className="w-5 h-5 text-blue-600" />,
    taskColor: 'border-l-blue-500'
  },
  'in-progress': {
    title: 'Em Andamento',
    color: 'bg-yellow-50 border-yellow-300',
    headerColor: 'bg-yellow-100',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    taskColor: 'border-l-yellow-500'
  },
  completed: {
    title: 'Concluído',
    color: 'bg-green-50 border-green-300',
    headerColor: 'bg-green-100',
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    taskColor: 'border-l-green-500'
  }
};

// Mapeamento de prioridade para cores
const priorityConfig = {
  baixa: { color: 'bg-green-500', label: 'Baixa' },
  media: { color: 'bg-yellow-500', label: 'Média' },
  alta: { color: 'bg-orange-500', label: 'Alta' },
  critica: { color: 'bg-red-500', label: 'Crítica' }
};

// Componente de tarefa individual no Kanban
const KanbanTask: React.FC<KanbanTaskProps> = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityInfo = priorityConfig[task.prioridade];
  const statusInfo = statusConfig[task.status];

  const isOverdue = task.prazo && new Date(task.prazo) < new Date() && task.status !== 'completed';
  const daysUntilDeadline = task.prazo ? Math.ceil((new Date(task.prazo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`
        bg-card border-2 rounded-lg p-4 mb-3 cursor-grab active:cursor-grabbing
        shadow-sm hover:shadow-md transition-all duration-200
        border-l-4 ${statusInfo.taskColor}
        ${isDragging ? 'opacity-50 rotate-3 shadow-lg' : ''}
        ${isOverdue ? 'ring-2 ring-red-400 ring-opacity-50' : ''}
      `}
    >
      {/* Header da tarefa */}
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-sm text-foreground line-clamp-2 flex-1">
          {task.tarefa}
        </h4>
        <div className="flex gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-blue-100"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            ✏️
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
          >
            🗑️
          </Button>
        </div>
      </div>

      {/* Prioridade */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${priorityInfo.color}`}></div>
        <span className="text-xs text-muted-foreground">{priorityInfo.label}</span>
      </div>

      {/* Responsável */}
      {task.responsavel && (
        <div className="flex items-center gap-2 mb-2">
          👤
          <span className="text-xs text-muted-foreground">{task.responsavel}</span>
        </div>
      )}

      {/* Datas */}
      <div className="space-y-1">
        {task.inicio && (
          <div className="flex items-center gap-2">
            📅
            <span className="text-xs text-muted-foreground">
              Início: {new Date(task.inicio).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
        
        {task.prazo && (
          <div className="flex items-center gap-2">
            <span className={isOverdue ? 'text-red-500' : 'text-orange-500'}>🚩</span>
            <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
              Prazo: {new Date(task.prazo).toLocaleDateString('pt-BR')}
              {daysUntilDeadline !== null && (
                <span className={`ml-1 ${isOverdue ? 'text-red-600' : daysUntilDeadline <= 3 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  ({daysUntilDeadline > 0 ? `${daysUntilDeadline}d restantes` : `${Math.abs(daysUntilDeadline)}d atrasado`})
                </span>
              )}
            </span>
          </div>
        )}

        {task.fim && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-xs text-muted-foreground">
              Fim: {new Date(task.fim).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
      </div>

      {/* Badge de status se necessário */}
      {isOverdue && (
        <Badge variant="destructive" className="mt-2 text-xs">
          Atrasado
        </Badge>
      )}
    </motion.div>
  );
};

// Componente de coluna do Kanban
const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  id, 
  title, 
  tasks, 
  color, 
  icon, 
  onEdit, 
  onDelete 
}) => {
  const {
    setNodeRef,
    attributes,
    listeners,
  } = useSortable({ id });

  const config = statusConfig[id as keyof typeof statusConfig];

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={`
        flex-1 min-w-80 max-w-sm rounded-lg border-2 ${config.color}
        shadow-sm hover:shadow-md transition-all duration-200
      `}
    >
      {/* Header da coluna */}
      <div className={`${config.headerColor} p-4 rounded-t-lg border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <Badge variant="secondary" className="bg-white/80">
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Lista de tarefas */}
      <div className="p-4 min-h-[400px]">
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map((task) => (
              <KanbanTask
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
        
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/20 rounded-lg"
          >
            <p className="text-muted-foreground text-sm">Arraste tarefas aqui</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Componente principal do Kanban Board
const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onEdit, onDelete }) => {
  const { editTask } = useData();
  const [activeTask, setActiveTask] = useState<TaskData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Agrupar tarefas por status
  const tasksByStatus = {
    backlog: tasks.filter(task => task.status === 'backlog'),
    todo: tasks.filter(task => task.status === 'todo'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    completed: tasks.filter(task => task.status === 'completed'),
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as number;
    const newStatus = over.id as string;

    // Se a tarefa foi movida para uma nova coluna
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      editTask(taskId, { 
        status: newStatus as TaskData['status'],
        // Se movendo para completed e não tem data de fim, adicionar data atual
        fim: newStatus === 'completed' && !task.fim ? new Date().toISOString().split('T')[0] : task.fim
      });
    }
  };

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {Object.entries(statusConfig).map(([statusKey, config]) => (
            <KanbanColumn
              key={statusKey}
              id={statusKey}
              title={config.title}
              tasks={tasksByStatus[statusKey as keyof typeof tasksByStatus]}
              color={config.color}
              icon={config.icon}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 shadow-2xl">
              <KanbanTask
                task={activeTask}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
