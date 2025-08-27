import Header from "@/components/dashboard/Header";
import MetricsCards from "@/components/dashboard/MetricsCards";
import Charts from "@/components/dashboard/Charts";
import TaskTable from "@/components/dashboard/TaskTable";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Métricas Principais */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Métricas do Projeto</h2>
            <p className="text-muted-foreground">Visão geral das principais estatísticas de performance</p>
          </div>
          <MetricsCards />
        </section>

        {/* Gráficos */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Análise Visual</h2>
            <p className="text-muted-foreground">Visualização dos dados de duração, atrasos e performance</p>
          </div>
          <Charts />
        </section>

        {/* Tabela Detalhada */}
        <section>
          <TaskTable />
        </section>
      </main>
    </div>
  );
};

export default Index;