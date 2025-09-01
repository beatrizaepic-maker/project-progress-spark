import MetricsCards from "@/components/dashboard/MetricsCards";
import { DataProvider } from "@/contexts/DataContext";
import { mockTaskData } from "@/data/projectData";

const Dashboard = () => {
  return (
    <DataProvider initialTasks={mockTaskData}>
      <main className="container mx-auto px-6 py-8 space-y-8">
          {/* Métricas Principais */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard</h2>
              <p className="text-muted-foreground">Visão geral das principais estatísticas de performance do projeto</p>
            </div>
            <MetricsCards />
          </section>

          {/* Resumo Rápido */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Status Geral</h3>
              <p className="text-muted-foreground">Acompanhe o progresso geral do projeto</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Próximas Ações</h3>
              <p className="text-muted-foreground">Tarefas prioritárias para hoje</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Alertas</h3>
              <p className="text-muted-foreground">Itens que precisam de atenção</p>
            </div>
          </section>
      </main>
    </DataProvider>
  );
};

export default Dashboard;