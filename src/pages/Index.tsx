import Header from "@/components/dashboard/Header";
import MetricsCards from "@/components/dashboard/MetricsCards";
import Charts from "@/components/dashboard/Charts";
import TaskTable from "@/components/dashboard/TaskTable";
import DataEditor from "@/components/dashboard/DataEditor";
import { DataProvider, useData } from "@/contexts/DataContext";
import { mockTaskData } from "@/data/projectData";
import { InsufficientDataDisplay, DataQualityIndicator } from "@/components/ui/empty-state";

const DashboardContent = () => {
  const { tasks, dataQuality, kpiResults } = useData();

  const handleAddTask = () => {
    // Implementar navegação para adicionar tarefa
    console.log('Adicionar nova tarefa');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleImport = () => {
    // Implementar importação de dados
    console.log('Importar dados');
  };

  // Se não há tarefas, mostra estado vazio
  if (tasks.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <InsufficientDataDisplay
            type="no-tasks"
            onAddData={handleAddTask}
            onRefresh={handleRefresh}
            onImport={handleImport}
          />
        </main>
      </div>
    );
  }

  // Se há dados insuficientes para análise
  if (!dataQuality.hasMinimumData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8 space-y-8">
          {/* Editor de Dados */}
          <section>
            <DataEditor />
          </section>

          {/* Indicador de qualidade dos dados */}
          <section>
            <DataQualityIndicator
              totalTasks={dataQuality.totalTasks}
              completeTasks={dataQuality.completeTasks}
              validTasks={dataQuality.validTasks}
              minRequiredTasks={3}
            />
          </section>

          {/* Estado de dados insuficientes */}
          <section>
            <InsufficientDataDisplay
              type="incomplete-tasks"
              requiredCount={3}
              actualCount={dataQuality.completeTasks}
              onRefresh={handleRefresh}
            />
          </section>

          {/* Tabela Detalhada (sempre mostrar para permitir edição) */}
          <section>
            <TaskTable />
          </section>
        </main>
      </div>
    );
  }

  // Se há erros críticos nos cálculos
  if (kpiResults?.criticalErrors) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8 space-y-8">
          {/* Editor de Dados */}
          <section>
            <DataEditor />
          </section>

          {/* Estado de erro de cálculo */}
          <section>
            <InsufficientDataDisplay
              type="calculation-failed"
              onRefresh={handleRefresh}
            />
          </section>

          {/* Tabela Detalhada */}
          <section>
            <TaskTable />
          </section>
        </main>
      </div>
    );
  }

  // Dashboard completo com dados suficientes
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Editor de Dados */}
        <section>
          <DataEditor />
        </section>

        {/* Indicador de qualidade dos dados */}
        {dataQuality.validityRate < 90 && (
          <section>
            <DataQualityIndicator
              totalTasks={dataQuality.totalTasks}
              completeTasks={dataQuality.completeTasks}
              validTasks={dataQuality.validTasks}
              minRequiredTasks={3}
            />
          </section>
        )}

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

const Index = () => {
  return (
    <DataProvider initialTasks={mockTaskData}>
      <DashboardContent />
    </DataProvider>
  );
};

export default Index;