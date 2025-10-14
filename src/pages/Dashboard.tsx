import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MetricsCards from "@/components/dashboard/MetricsCards";
import DashboardKPIs from "@/components/dashboard/DashboardKPIs";
import { DataProvider } from "@/contexts/DataContext";
import { getTasksData } from "@/services/localStorageData";
import { useKPIs } from "@/hooks/useKPIs";
import jsPDF from 'jspdf';

const Dashboard = () => {
  const taskData = getTasksData();
  const kpis = useKPIs(taskData);

  // Função para exportar relatório em PDF
  const exportReport = () => {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR');
    
    // Dados dos KPIs (o hook já retorna os dados diretamente)
    const kpiData = kpis;
    
    // Criar documento PDF
    const doc = new jsPDF();
    
    // Configurar fonte e cores
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246); // Roxo
    doc.text('RELATÓRIO DE DASHBOARD', 20, 20);
    doc.text('PROJECT PROGRESS SPARK', 20, 30);
    
    // Linha divisória
    doc.setDrawColor(139, 92, 246);
    doc.line(20, 35, 190, 35);
    
    // Data de geração
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Data de Geração: ${currentDate} às ${currentTime}`, 20, 45);
    
    let y = 60;
    
    // RESUMO EXECUTIVO
    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.text('RESUMO EXECUTIVO', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de Tarefas: ${taskData.length}`, 20, y);
    y += 6;
    doc.text(`Tarefas Concluídas: ${taskData.filter(task => task.status === 'completed').length}`, 20, y);
              <SummaryCard>
                <h3 className="text-lg font-semibold mb-2">Status Geral</h3>
                <p className="text-muted-foreground">
                  {taskData.length === 0 ? 'Sem tarefas cadastradas' : 
                   `${taskData.filter(task => task.status === 'completed').length} de ${taskData.length} tarefas concluídas`}
                </p>
              </SummaryCard>
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Média de Produção: ${kpiData.averageProduction.toFixed(1)} dias`, 20, y);
    y += 6;
    doc.text(`Desvio Padrão: ${kpiData.standardDeviation.toFixed(1)} dias`, 20, y);
    y += 6;
    doc.text(`Mediana: ${kpiData.median.toFixed(1)} dias`, 20, y);
    y += 6;
    doc.text(`Moda: ${kpiData.mode.value} dias (${kpiData.mode.frequency} ocorrência${kpiData.mode.frequency !== 1 ? 's' : ''})`, 20, y);
    y += 6;
    doc.text(`Total de Tarefas: ${kpiData.totalTasks}`, 20, y);
    y += 6;
    doc.text(`Tarefas Completadas: ${kpiData.completedTasks}`, 20, y);
    y += 6;
    doc.text(`Percentual de Conclusão: ${kpiData.projectCompletionPercentage.toFixed(1)}%`, 20, y);
    y += 15;
    
    // ANÁLISE DE ATRASOS
    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.text('ANÁLISE DE ATRASOS', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Média de Atraso: ${kpiData.averageDelay.toFixed(1)} dias`, 20, y);
    y += 6;
    doc.text(`Total de Tarefas Atrasadas: ${taskData.filter(task => task.atrasoDiasUteis > 0).length}`, 20, y);
    y += 6;
    doc.text(`Percentual de Tarefas no Prazo: ${((taskData.filter(task => task.atrasoDiasUteis === 0).length / taskData.length) * 100).toFixed(1)}%`, 20, y);
    y += 15;
    
    // DISTRIBUIÇÃO DE PRIORIDADES
    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.text('DISTRIBUIÇÃO DE PRIORIDADES', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Crítica: ${taskData.filter(task => task.prioridade === 'critica').length} tarefas`, 20, y);
    y += 6;
    doc.text(`Alta: ${taskData.filter(task => task.prioridade === 'alta').length} tarefas`, 20, y);
    y += 6;
    doc.text(`Média: ${taskData.filter(task => task.prioridade === 'media').length} tarefas`, 20, y);
    y += 6;
    doc.text(`Baixa: ${taskData.filter(task => task.prioridade === 'baixa').length} tarefas`, 20, y);
    y += 15;
    
    // Verificar se precisa de nova página
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    // PRÓXIMAS ENTREGAS
    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.text('PRÓXIMAS ENTREGAS', 20, y);
    y += 10;
    
    const upcomingTasks = taskData
      .filter(task => task.status !== 'completed')
      .sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime())
      .slice(0, 5);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    upcomingTasks.forEach(task => {
      const taskText = `• ${task.tarefa} - Prazo: ${new Date(task.prazo).toLocaleDateString('pt-BR')} - Prioridade: ${task.prioridade}`;
      const lines = doc.splitTextToSize(taskText, 170);
      doc.text(lines, 20, y);
      y += lines.length * 6;
    });
    
    y += 10;
    
    // OBSERVAÇÕES
    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.text('OBSERVAÇÕES', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const observations = [
      '• Este relatório foi gerado automaticamente pelo sistema Project Progress Spark',
      '• Os dados apresentados refletem o estado atual do projeto',
      '• Recomenda-se acompanhar regularmente os indicadores para otimizar a performance'
    ];
    
    observations.forEach(obs => {
      const lines = doc.splitTextToSize(obs, 170);
      doc.text(lines, 20, y);
      y += lines.length * 6;
    });
    
    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Relatório gerado em: ${currentDate} ${currentTime}`, 20, 280);
    
    // Salvar PDF
    doc.save(`relatorio-dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Componente para cards com efeito de elevação
  const SummaryCard = ({ children }: { children: React.ReactNode }) => {
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
        <div className="bg-card p-6 border-2 border-purple-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300">
          {children}
        </div>
      </motion.div>
    );
  };

  return (
    <DataProvider initialTasks={taskData}>
      <main className="container mx-auto px-6 py-8 space-y-8">
          {/* KPIs Estatísticos Avançados */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard</h2>
              <p className="text-muted-foreground">Visão geral das principais estatísticas de performance do projeto</p>
            </div>
            
            {/* Botão Exportar Relatório */}
            <div className="flex justify-end mb-6">
              <button
                onClick={exportReport}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-200 transform hover:scale-105 rounded-none"
              >
                Exportar Relatório
              </button>
            </div>
            
            <DashboardKPIs tasks={taskData} />
          </section>

          {/* Métricas Originais */}
          <section>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Métricas Complementares</h3>
              <p className="text-muted-foreground">Informações adicionais de acompanhamento</p>
            </div>
            <MetricsCards />
          </section>

          {/* Critical Players - Análise de Performance Individual */}
          <section>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Critical Players</h3>
              <p className="text-muted-foreground">Análise de performance individual dos membros da equipe</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SummaryCard>
                <h3 className="text-lg font-semibold mb-2 text-red-400">🔴 Mais Tarefas Atrasadas</h3>
                <div className="mb-2">
                  {(() => {
                    const playerDelays = taskData.reduce((acc, task) => {
                      if (task.responsavel && task.atrasoDiasUteis > 0) {
                        acc[task.responsavel] = (acc[task.responsavel] || 0) + 1;
                      }
                      return acc;
                    }, {});
                    const worstPlayer = Object.entries(playerDelays).sort((a, b) => b[1] - a[1])[0];
                    return worstPlayer ? 
                      <><span className="text-2xl font-bold text-red-400">{worstPlayer[1]}</span><span className="text-sm text-muted-foreground ml-2">atrasos</span></> :
                      <span className="text-green-400">Nenhum atraso registrado</span>;
                  })()}
                </div>
                <p className="text-muted-foreground text-sm">
                  {(() => {
                    const playerDelays = taskData.reduce((acc, task) => {
                      if (task.responsavel && task.atrasoDiasUteis > 0) {
                        acc[task.responsavel] = (acc[task.responsavel] || 0) + 1;
                      }
                      return acc;
                    }, {});
                    const worstPlayer = Object.entries(playerDelays).sort((a, b) => b[1] - a[1])[0];
                    return worstPlayer ? `${worstPlayer[0]}` : 'Todos os membros estão em dia';
                  })()}
                </p>
              </SummaryCard>
              <SummaryCard>
                <h3 className="text-lg font-semibold mb-2 text-orange-400">📉 Pior Aproveitamento</h3>
                <div className="mb-2">
                  {(() => {
                    const playerStats = taskData.reduce((acc, task) => {
                      if (task.responsavel) {
                        acc[task.responsavel] = acc[task.responsavel] || { total: 0, completed: 0 };
                        acc[task.responsavel].total++;
                        if (task.status === 'completed') acc[task.responsavel].completed++;
                      }
                      return acc;
                    }, {});
                    const playerRates = Object.entries(playerStats).map(([name, stats]) => [
                      name, 
                      stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
                    ]).sort((a, b) => a[1] - b[1]);
                    const worstPlayer = playerRates[0];
                    return worstPlayer && playerRates.length > 0 ? 
                      <><span className="text-2xl font-bold text-orange-400">{worstPlayer[1].toFixed(0)}%</span></> :
                      <span className="text-muted-foreground">Sem dados</span>;
                  })()}
                </div>
                <p className="text-muted-foreground text-sm">
                  {(() => {
                    const playerStats = taskData.reduce((acc, task) => {
                      if (task.responsavel) {
                        acc[task.responsavel] = acc[task.responsavel] || { total: 0, completed: 0 };
                        acc[task.responsavel].total++;
                        if (task.status === 'completed') acc[task.responsavel].completed++;
                      }
                      return acc;
                    }, {});
                    const playerRates = Object.entries(playerStats).map(([name, stats]) => [
                      name, 
                      stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
                    ]).sort((a, b) => a[1] - b[1]);
                    const worstPlayer = playerRates[0];
                    return worstPlayer && playerRates.length > 0 ? `${worstPlayer[0]}` : 'Nenhum player avaliado';
                  })()}
                </p>
              </SummaryCard>
              <SummaryCard>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">🔄 Mais Refações</h3>
                <div className="mb-2">
                  {(() => {
                    const playerRefacoes = taskData.reduce((acc, task) => {
                      if (task.responsavel && task.status === 'refacao') {
                        acc[task.responsavel] = (acc[task.responsavel] || 0) + 1;
                      }
                      return acc;
                    }, {});
                    const mostRefacoes = Object.entries(playerRefacoes).sort((a, b) => b[1] - a[1])[0];
                    return mostRefacoes ? 
                      <><span className="text-2xl font-bold text-yellow-400">{mostRefacoes[1]}</span><span className="text-sm text-muted-foreground ml-2">refações</span></> :
                      <span className="text-green-400">Nenhuma refação</span>;
                  })()}
                </div>
                <p className="text-muted-foreground text-sm">
                  {(() => {
                    const playerRefacoes = taskData.reduce((acc, task) => {
                      if (task.responsavel && task.status === 'refacao') {
                        acc[task.responsavel] = (acc[task.responsavel] || 0) + 1;
                      }
                      return acc;
                    }, {});
                    const mostRefacoes = Object.entries(playerRefacoes).sort((a, b) => b[1] - a[1])[0];
                    return mostRefacoes ? `${mostRefacoes[0]}` : 'Qualidade mantida pela equipe';
                  })()}
                </p>
              </SummaryCard>
            </div>
          </section>

          {/* Novo Box Adicionado - Resumo Estatístico */}
          <section>
            <div className="relative overflow-hidden border-2 border-purple-500 bg-card p-6 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200 hover:shadow-lg">
              {/* Header com ícone e título */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center h-12 w-12 text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:text-purple-400 hover:bg-purple-500/20 transition-all duration-200">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="kpi-title text-white text-sm">Resumo Estatístico</h3>
                  <p className="kpi-subtitle text-light-gray text-xs mt-1">Principais métricas calculadas automaticamente</p>
                </div>
              </div>

              {/* Métricas */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="card-content text-light-gray text-sm">Média de Produção:</span>
                  <span className="kpi-value text-white text-lg">{kpis.averageProduction.toFixed(1)} dias</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="card-content text-light-gray text-sm">Moda:</span>
                  <span className="kpi-value text-white text-lg">{kpis.mode.value} dias ({kpis.mode.frequency}x)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="card-content text-light-gray text-sm">Mediana:</span>
                  <span className="kpi-value text-white text-lg">{kpis.median.toFixed(1)} dias</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="card-content text-light-gray text-sm">Desvio Padrão:</span>
                  <span className="kpi-value text-white text-lg">{kpis.standardDeviation.toFixed(1)} dias</span>
                </div>
              </div>

              {/* Efeito de brilho sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </section>
      </main>
    </DataProvider>
  );
};

export default Dashboard;