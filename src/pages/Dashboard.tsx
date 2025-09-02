import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MetricsCards from "@/components/dashboard/MetricsCards";
import DashboardKPIs from "@/components/dashboard/DashboardKPIs";
import KPIDebugSection from "@/components/dashboard/KPIDebugSection";
import { DataProvider } from "@/contexts/DataContext";
import { mockTaskData } from "@/data/projectData";

const Dashboard = () => {
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
    <DataProvider initialTasks={mockTaskData}>
      <main className="container mx-auto px-6 py-8 space-y-8">
          {/* KPIs Estatísticos Avançados */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard</h2>
              <p className="text-muted-foreground">Visão geral das principais estatísticas de performance do projeto</p>
            </div>
            <DashboardKPIs tasks={mockTaskData} />
          </section>

          {/* Métricas Originais */}
          <section>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Métricas Complementares</h3>
              <p className="text-muted-foreground">Informações adicionais de acompanhamento</p>
            </div>
            <MetricsCards />
          </section>

          {/* Resumo Rápido - Movido para baixo das Métricas Complementares */}
          <section>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Resumo Rápido</h3>
              <p className="text-muted-foreground">Visão geral das principais informações do projeto</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SummaryCard>
                <h3 className="text-lg font-semibold mb-2">Status Geral</h3>
                <p className="text-muted-foreground">Acompanhe o progresso geral do projeto</p>
              </SummaryCard>
              <SummaryCard>
                <h3 className="text-lg font-semibold mb-2">Próximas Ações</h3>
                <p className="text-muted-foreground">Tarefas prioritárias para hoje</p>
              </SummaryCard>
              <SummaryCard>
                <h3 className="text-lg font-semibold mb-2">Alertas</h3>
                <p className="text-muted-foreground">Itens que precisam de atenção</p>
              </SummaryCard>
            </div>
          </section>

          {/* Seção de Debug e Monitoramento - Movida para baixo do Resumo Rápido */}
          <section>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Debug e Monitoramento</h3>
              <p className="text-muted-foreground">Informações técnicas e métricas de performance dos KPIs</p>
            </div>
            <KPIDebugSection tasks={mockTaskData} />
          </section>
      </main>
    </DataProvider>
  );
};

export default Dashboard;