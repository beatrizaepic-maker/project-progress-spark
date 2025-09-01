import Charts from "@/components/dashboard/Charts";
import { DataProvider } from "@/contexts/DataContext";
import { mockTaskData } from "@/data/projectData";

const Analytics = () => {
  return (
    <DataProvider initialTasks={mockTaskData}>
      <main className="container mx-auto px-6 py-8 space-y-8">
          {/* Gráficos e Análises */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Análise Visual</h2>
              <p className="text-muted-foreground">Visualização detalhada dos dados de duração, atrasos e performance</p>
            </div>
            <Charts />
          </section>

          {/* Insights Adicionais */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Tendências</h3>
              <p className="text-muted-foreground mb-4">Análise das tendências de performance ao longo do tempo</p>
              <div className="h-32 bg-muted rounded flex items-center justify-center">
                <span className="text-muted-foreground">Gráfico de Tendências</span>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Comparativo</h3>
              <p className="text-muted-foreground mb-4">Comparação entre períodos e metas estabelecidas</p>
              <div className="h-32 bg-muted rounded flex items-center justify-center">
                <span className="text-muted-foreground">Gráfico Comparativo</span>
              </div>
            </div>
          </section>
      </main>
    </DataProvider>
  );
};

export default Analytics;