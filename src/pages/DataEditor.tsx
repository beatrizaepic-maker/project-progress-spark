import DataEditor from "@/components/dashboard/DataEditor";
import { DataProvider } from "@/contexts/DataContext";
import { getTasksData } from "@/services/localStorageData";
import KPIDebugSection from "@/components/dashboard/KPIDebugSection";

const DataEditorPage = () => {
  const taskData = getTasksData();
  return (
    <DataProvider initialTasks={taskData}>
      <main className="container mx-auto px-6 py-8 space-y-8">
          {/* Editor de Dados */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Editor de Dados</h2>
              <p className="text-muted-foreground">Gerencie e edite os dados do projeto de forma interativa</p>
            </div>
            <DataEditor />
          </section>

          {/* Instruções e Dicas */}
          {/* Cards removidos conforme solicitado */}

          {/* Debug e Monitoramento */}
          <section>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Debug e Monitoramento</h3>
              <p className="text-muted-foreground">Informações técnicas e métricas de performance dos KPIs</p>
            </div>
            <KPIDebugSection tasks={taskData} />
          </section>
      </main>
    </DataProvider>
  );
};

export default DataEditorPage;