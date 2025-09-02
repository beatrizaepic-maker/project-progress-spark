import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TaskTable from "@/components/dashboard/TaskTable";
import { DataProvider } from "@/contexts/DataContext";
import { mockTaskData } from "@/data/projectData";

const Tasks = () => {
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
    <DataProvider initialTasks={mockTaskData}>
      <main className="container mx-auto px-6 py-8 space-y-8">
          {/* Tabela de Tarefas */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Gerenciamento de Tarefas</h2>
              <p className="text-muted-foreground">Visualização detalhada e gerenciamento de todas as tarefas do projeto</p>
            </div>
            <TaskTable />
          </section>

          {/* Ações Rápidas */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard>
              <h3 className="text-sm font-semibold mb-2">Filtros Rápidos</h3>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground">
                  Tarefas em Atraso
                </button>
                <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground">
                  Concluídas Hoje
                </button>
                <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground">
                  Alta Prioridade
                </button>
              </div>
            </ActionCard>
            <ActionCard>
              <h3 className="text-sm font-semibold mb-2">Ações</h3>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground">
                  Exportar Dados
                </button>
                <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground">
                  Importar Tarefas
                </button>
                <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground">
                  Relatório PDF
                </button>
              </div>
            </ActionCard>
            <ActionCard>
              <h3 className="text-sm font-semibold mb-2">Estatísticas</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Total: </span>
                  <span className="font-medium">--</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Concluídas: </span>
                  <span className="font-medium">--</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Pendentes: </span>
                  <span className="font-medium">--</span>
                </div>
              </div>
            </ActionCard>
          </section>
      </main>
    </DataProvider>
  );
};

export default Tasks;