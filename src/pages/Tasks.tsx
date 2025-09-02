import TaskTable from "@/components/dashboard/TaskTable";
import { DataProvider } from "@/contexts/DataContext";
import { mockTaskData } from "@/data/projectData";

const Tasks = () => {
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
            <div className="bg-card p-4 border">
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
            </div>
            <div className="bg-card p-4 border">
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
            </div>
            <div className="bg-card p-4 border">
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
            </div>
          </section>
      </main>
    </DataProvider>
  );
};

export default Tasks;