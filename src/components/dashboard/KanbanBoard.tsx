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
    color: 'bg-dark-navy border-slate-600',
    headerColor: 'bg-dark-navy',
    icon: <span className="text-slate-300">🎯</span>,
    taskColor: 'border-l-slate-500'
  },
  todo: {
    title: 'A Fazer',
    color: 'bg-dark-navy border-blue-600',
    headerColor: 'bg-dark-navy',
    icon: <Clock className="w-5 h-5 text-blue-400" />,
    taskColor: 'border-l-blue-500'
  },
  refacao: {
    title: 'Refação',
    color: 'bg-dark-navy border-purple-600',
    headerColor: 'bg-dark-navy',
    icon: <span className="text-purple-400">🛠️</span>,
    taskColor: 'border-l-purple-500'
  },
  'in-progress': {
    title: 'Em Andamento',
    color: 'bg-dark-navy border-yellow-600',
    headerColor: 'bg-dark-navy',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    taskColor: 'border-l-yellow-500'
  },
  completed: {
    title: 'Concluído',
    color: 'bg-dark-navy border-green-600',
    headerColor: 'bg-dark-navy',
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
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
        bg-slate-800 border-2 rounded-none p-4 mb-3 cursor-grab active:cursor-grabbing
        shadow-sm hover:shadow-md transition-all duration-200
        border-l-4 ${statusInfo.taskColor}
        ${isDragging ? 'opacity-50 rotate-3 shadow-lg' : ''}
        ${isOverdue ? 'ring-2 ring-red-400 ring-opacity-50' : ''}
      `}
    >
      {/* Header da tarefa */}
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-sm text-white line-clamp-2 flex-1">
          {task.tarefa}
        </h4>
        <div className="flex gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-slate-700"
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
            className="h-6 w-6 p-0 hover:bg-slate-700"
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
        <span className="text-xs text-gray-300">{priorityInfo.label}</span>
      </div>

      {/* Responsável */}
      {task.responsavel && (
        <div className="flex items-center gap-2 mb-2">
          👤
          <span className="text-xs text-gray-300">{task.responsavel}</span>
        </div>
      )}

      {/* Datas */}
      <div className="space-y-1">
        {task.inicio && (
          <div className="flex items-center gap-2">
            📅
            <span className="text-xs text-gray-300">
              Início: {new Date(task.inicio).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
        
        {task.prazo && (
          <div className="flex items-center gap-2">
            <span className={isOverdue ? 'text-red-500' : 'text-orange-500'}>🚩</span>
            <span className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-gray-300'}`}>
              Prazo: {new Date(task.prazo).toLocaleDateString('pt-BR')}
              {daysUntilDeadline !== null && (
                <span className={`ml-1 ${isOverdue ? 'text-red-400' : daysUntilDeadline <= 3 ? 'text-orange-400' : 'text-gray-300'}`}>
                  ({daysUntilDeadline > 0 ? `${daysUntilDeadline}d restantes` : `${Math.abs(daysUntilDeadline)}d atrasado`})
                </span>
              )}
            </span>
          </div>
        )}

        {task.fim && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-xs text-gray-300">
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
        flex-1 min-w-80 max-w-sm rounded-none border-2 ${config.color}
        shadow-sm hover:shadow-md transition-all duration-200
      `}
    >
      {/* Header da coluna */}
      <div className={`${config.headerColor} p-4 rounded-t-none border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <Badge variant="secondary" className="text-purple-800 bg-white border border-gray-300 rounded-none hover:text-white">
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Lista de tarefas */}
      <div 
        className="kanban-task-list p-4 min-h-[200px] max-h-[700px] overflow-y-auto scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#a855f7 rgba(255,255,255,0.1)'
        }}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
            .kanban-task-list::-webkit-scrollbar {
              width: 8px;
              background: rgba(255,255,255,0.05);
            }
            .kanban-task-list::-webkit-scrollbar-track {
              background: rgba(255,255,255,0.1);
              border-radius: 4px;
            }
            .kanban-task-list::-webkit-scrollbar-thumb {
              background-color: #a855f7;
              border-radius: 4px;
              border: 1px solid rgba(255,255,255,0.1);
            }
            .kanban-task-list::-webkit-scrollbar-thumb:hover {
              background-color: #9333ea;
            }
            .kanban-task-list::-webkit-scrollbar-corner {
              background: transparent;
            }
          `
        }} />
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <KanbanTask
                key={`task-${task.id}`}
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
            className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/20 rounded-none bg-slate-800/20"
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
    refacao: tasks.filter(task => task.status === 'refacao'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    completed: tasks.filter(task => task.status === 'completed'),
  };

  // Debug: Log para monitorar tarefas
  React.useEffect(() => {
    console.log('🔍 Kanban Debug:', {
      totalTasks: tasks.length,
      tasksByStatus: Object.fromEntries(
        Object.entries(tasksByStatus).map(([status, statusTasks]) => [
          status, 
          { count: statusTasks.length, ids: statusTasks.map(t => t.id) }
        ])
      )
    });
  }, [tasks, tasksByStatus]);

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
        <div 
          className="kanban-board-horizontal flex gap-6 overflow-x-auto pb-4"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#a855f7 transparent'
          }}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
              .kanban-board-horizontal::-webkit-scrollbar {
                height: 8px;
              }
              .kanban-board-horizontal::-webkit-scrollbar-track {
                background: transparent;
              }
              .kanban-board-horizontal::-webkit-scrollbar-thumb {
                background-color: #a855f7;
                border-radius: 0;
              }
              .kanban-board-horizontal::-webkit-scrollbar-thumb:hover {
                background-color: #9333ea;
              }
            `
          }} />
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
