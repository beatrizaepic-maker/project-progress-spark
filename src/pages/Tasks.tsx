import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import TaskTable, { TaskTableRef } from "@/components/dashboard/TaskTable";
import { DataProvider, useData } from "@/contexts/DataContext";
import { getTasksData } from "@/services/localStorageData";
import { getSeasonConfig } from "@/config/season";
import { toast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Hook para gerenciar filtros rápidos
const useQuickFilters = () => {
  const taskTableRef = useRef<TaskTableRef>(null);

  const applyQuickFilter = (filterType: string) => {
    if (taskTableRef.current) {
      switch (filterType) {
        case 'critica':
          taskTableRef.current.setPriorityFilter('critica');
          taskTableRef.current.setStatusFilter('all');
          break;
        case 'concluidas-hoje':
          taskTableRef.current.setStatusFilter('on-time');
          taskTableRef.current.setPriorityFilter('all');
          taskTableRef.current.setSearchTerm('');
          break;
        case 'alta':
          taskTableRef.current.setPriorityFilter('alta');
          taskTableRef.current.setStatusFilter('all');
          break;
        default:
          break;
      }
    }
  };

  return { taskTableRef, applyQuickFilter };
};

const TasksContent = () => {
  const { tasks, exportData, importData } = useData();
  const { taskTableRef, applyQuickFilter } = useQuickFilters();

  // Temporadas
  const [seasonList, setSeasonList] = useState(() => {
    try {
      const stored = localStorage.getItem('epic_season_list_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState(0);
  const selectedSeason = seasonList[selectedSeasonIdx] || getSeasonConfig();

  // Filtrar tarefas por temporada
  const filteredTasks = useMemo(() => {
    if (!selectedSeason?.startIso || !selectedSeason?.endIso) return tasks;
    const start = new Date(selectedSeason.startIso).getTime();
    const end = new Date(selectedSeason.endIso).getTime();
    return tasks.filter(task => {
      // Considera tarefa dentro da temporada se qualquer data relevante estiver no intervalo
      const inicio = task.inicio ? new Date(task.inicio).getTime() : undefined;
      const prazo = task.prazo ? new Date(task.prazo).getTime() : undefined;
      const fim = task.fim ? new Date(task.fim).getTime() : undefined;
      return (
        (inicio && inicio >= start && inicio <= end) ||
        (prazo && prazo >= start && prazo <= end) ||
        (fim && fim >= start && fim <= end)
      );
    });
  }, [tasks, selectedSeason]);

  // Calcular estatísticas
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => {
    const prazo = new Date(task.prazo);
    if (!task.fim) return false;
    const conclusion = new Date(task.fim);
    return conclusion <= prazo;
  }).length;
  const pendingTasks = filteredTasks.filter(task => !task.fim).length;

  // Função para exportar dados como JSON
  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(filteredTasks, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `tarefas_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Dados exportados",
        description: "O arquivo JSON foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive"
      });
    }
  };

  // Função para importar dados
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          importData(jsonData);
          toast({
            title: "Dados importados",
            description: "As tarefas foram importadas com sucesso.",
          });
        } catch (error) {
          toast({
            title: "Erro na importação",
            description: "Arquivo JSON inválido ou corrompido.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  // Função para gerar relatório PDF
  const handleGeneratePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Título do relatório
      doc.setFontSize(20);
      doc.text('Relatório de Tarefas', 20, 20);
      
      // Data do relatório
      doc.setFontSize(12);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
      
      // Estatísticas resumidas
      doc.text(`Total de Tarefas: ${totalTasks}`, 20, 45);
      doc.text(`Tarefas Concluídas: ${completedTasks}`, 20, 55);
      doc.text(`Tarefas Pendentes: ${pendingTasks}`, 20, 65);
      
      // Preparar dados para a tabela
      const tableData = tasks.map(task => [
        task.tarefa,
        task.prioridade?.toUpperCase() || 'N/A',
        new Date(task.inicio + 'T00:00:00').toLocaleDateString('pt-BR'),
        new Date(task.prazo + 'T00:00:00').toLocaleDateString('pt-BR'),
        task.fim ? new Date(task.fim + 'T00:00:00').toLocaleDateString('pt-BR') : 'Pendente',
        task.status
      ]);

      // Adicionar tabela
      autoTable(doc, {
        head: [['Tarefa', 'Prioridade', 'Início', 'Prazo', 'Conclusão', 'Status']],
        body: tableData,
        startY: 80,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [139, 92, 246] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 }
        }
      });
      
      // Salvar o PDF
      doc.save(`relatorio_tarefas_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Relatório gerado",
        description: "O relatório PDF foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive"
      });
    }
  };

  // Função para gerar dados do gráfico de tarefas ao longo do tempo
  const generateChartData = useMemo(() => {
    if (!selectedSeason?.startIso || !selectedSeason?.endIso) return [];

    const startDate = new Date(selectedSeason.startIso);
    const endDate = new Date(selectedSeason.endIso);
    
    // Gera array de dias entre as datas
    const dateRange = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Gera dados do gráfico
    const chartData = dateRange.map(date => {
      const dateString = date.toISOString().split('T')[0];
      const day = date.getDate();
      
      // Conta tarefas concluídas até esta data
      const completedTasks = filteredTasks.filter(task => {
        if (!task.fim) return false;
        const taskEndDate = new Date(task.fim);
        return taskEndDate <= date;
      }).length;
      
      // Tarefas pendentes até esta data
      const pendingTasks = filteredTasks.filter(task => {
        if (task.fim) return false; // Já foi concluída
        // Verifica se a tarefa estava ativa durante este período
        if (task.inicio) {
          const taskStartDate = new Date(task.inicio);
          return taskStartDate <= date; // Tarefa já tinha começado
        }
        return false;
      }).length;
      
      return {
        day,
        date: dateString,
        concluidas: completedTasks,
        pendentes: pendingTasks
      };
    });

    return chartData;
  }, [filteredTasks, selectedSeason]);

  // Componente para cards com efeito de elevação
  const ActionCard = ({ children }: { children: React.ReactNode }) => {
    const [isHovered, setIsHovered] = useState(false);
    
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
        <div className="bg-card p-4 border-2 border-purple-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300">
          {children}
        </div>
      </motion.div>
    );
  };

  return (
    <main className="container mx-auto px-6 py-8 space-y-8">
      {/* Tabela de Tarefas */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Gerenciamento de Tarefas</h2>
          <p className="text-muted-foreground">Visualização detalhada e gerenciamento de todas as tarefas do projeto</p>
          {/* Seletor de temporada */}
          <div className="mt-4 flex items-center gap-4">
            <label htmlFor="seasonSelector" className="text-sm font-medium text-[#6A0DAD]">Temporada:</label>
            <select
              id="seasonSelector"
              value={selectedSeasonIdx}
              onChange={e => setSelectedSeasonIdx(Number(e.target.value))}
              className="rounded-md border border-[#6A0DAD] bg-[#1A1A2E]/60 px-3 py-2 text-base text-white focus:border-[#FF0066] focus:outline-none"
              style={{ minWidth: 220 }}
            >
              {seasonList.length === 0 ? (
                <option value={0} disabled>Nenhuma temporada cadastrada</option>
              ) : (
                seasonList.map((s, idx) => (
                  <option key={idx} value={idx}>
                    {s.name} ({new Date(s.startIso).toLocaleDateString('pt-BR')} - {new Date(s.endIso).toLocaleDateString('pt-BR')})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        <TaskTable ref={taskTableRef} tasks={filteredTasks} />
      </section>
    </main>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = React.useState(() => getTasksData());
  React.useEffect(() => {
    const onChanged = () => setTasks(getTasksData());
    window.addEventListener('tasks:changed', onChanged);
    return () => window.removeEventListener('tasks:changed', onChanged);
  }, []);
  return (
    <DataProvider initialTasks={tasks}>
      <TasksContent />
    </DataProvider>
  );
};

export default Tasks;