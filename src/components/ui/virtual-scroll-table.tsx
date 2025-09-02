import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { TaskData } from '@/data/projectData';

interface VirtualScrollTableProps {
  data: TaskData[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: TaskData, index: number, style: React.CSSProperties) => React.ReactNode;
  overscan?: number; // Número de itens extras para renderizar fora da viewport
  className?: string;
}

/**
 * Componente de tabela com virtual scrolling para performance otimizada
 */
export const VirtualScrollTable: React.FC<VirtualScrollTableProps> = ({
  data,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calcula quais itens devem ser renderizados
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      data.length - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(data.length - 1, endIndex + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, data.length, overscan]);

  // Itens visíveis para renderização
  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      items.push({
        index: i,
        data: data[i],
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight
        }
      });
    }
    return items;
  }, [data, visibleRange, itemHeight]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Altura total da lista virtual
  const totalHeight = data.length * itemHeight;

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, data: item, style }) => (
          <div key={`${item.id}-${index}`} style={style}>
            {renderItem(item, index, style)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Hook para otimizar dados de tabela
export const useVirtualTableData = <T,>(
  data: T[],
  pageSize: number = 100
) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Dados paginados para virtual scrolling
  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    data: paginatedData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages - 1,
    hasPrevPage: currentPage > 0
  };
};

// Componente de tabela de tarefas otimizada
interface OptimizedTaskTableProps {
  tasks: TaskData[];
  onTaskClick?: (task: TaskData) => void;
  filters?: {
    status?: string[];
    search?: string;
  };
  className?: string;
}

export const OptimizedTaskTable: React.FC<OptimizedTaskTableProps> = ({
  tasks,
  onTaskClick,
  filters,
  className = ''
}) => {
  // Filtra dados apenas quando necessário
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.tarefa.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [tasks, filters]);

  // Renderiza item da tabela
  const renderTaskItem = useCallback((
    task: TaskData, 
    index: number, 
    style: React.CSSProperties
  ) => (
    <div
      className={`
        flex items-center p-4 border-b border-gray-200 dark:border-gray-700
        hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer
        transition-colors duration-150
      `}
      onClick={() => onTaskClick?.(task)}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {task.tarefa}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {task.inicio} - {task.fim}
        </div>
      </div>
      <div className="flex-shrink-0">
        <span className={`
          inline-flex px-2 py-1 text-xs font-semibold rounded-full
          ${task.atendeuPrazo
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }
        `}>
          {task.atendeuPrazo ? 'No Prazo' : 'Atrasado'}
        </span>
      </div>
    </div>
  ), [onTaskClick]);

  const containerHeight = Math.min(600, window.innerHeight * 0.6);
  const itemHeight = 80;

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          Nenhuma tarefa encontrada
        </div>
      ) : (
        <VirtualScrollTable
          data={filteredTasks}
          itemHeight={itemHeight}
          containerHeight={containerHeight}
          renderItem={renderTaskItem}
          overscan={3}
        />
      )}
    </div>
  );
};
