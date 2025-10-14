import DataEditor from "@/components/dashboard/DataEditor";
import { DataProvider } from "@/contexts/DataContext";
import { getTasksData } from "@/services/localStorageData";
import KPIDebugSection from "@/components/dashboard/KPIDebugSection";
import React from "react";

const DataEditorPage = () => {
  // Detecta se o usuário atual é DEV
  const currentUser = (() => {
    try {
      const raw = localStorage.getItem('epic_user_data');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const isDevUser = currentUser?.role === 'DEV' || currentUser?.access === 'DEV';
  const [tasks, setTasks] = React.useState(() => getTasksData());
  React.useEffect(() => {
    const onChanged = () => setTasks(getTasksData());
    window.addEventListener('tasks:changed', onChanged);
    return () => window.removeEventListener('tasks:changed', onChanged);
  }, []);
  return (
    <DataProvider initialTasks={tasks}>
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

          {/* Debug e Monitoramento - DEV only */}
          {isDevUser && (
            <section>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">Debug e Monitoramento</h3>
                <p className="text-muted-foreground">Informações técnicas e métricas de performance dos KPIs</p>
              </div>
              <KPIDebugSection tasks={tasks} />
            </section>
          )}
      </main>
    </DataProvider>
  );
};

export default DataEditorPage;