import DataEditor from "@/components/dashboard/DataEditor";
import { DataProvider } from "@/contexts/DataContext";
import { mockTaskData } from "@/data/projectData";
import KPIDebugSection from "@/components/dashboard/KPIDebugSection";

const DataEditorPage = () => {
  return (
    <DataProvider initialTasks={mockTaskData}>
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
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card p-6 border">
              <h3 className="text-lg font-semibold mb-4">Como Usar</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use o editor JSON para modificar dados diretamente</li>
                <li>• Clique em "Aplicar Mudanças" para salvar as alterações</li>
                <li>• As mudanças são refletidas em tempo real nos gráficos</li>
                <li>• Use "Resetar" para voltar aos dados originais</li>
              </ul>
            </div>
            <div className="bg-card p-6 border">
              <h3 className="text-lg font-semibold mb-4">Formatos Suportados</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• JSON estruturado</li>
                <li>• Validação automática de sintaxe</li>
                <li>• Campos obrigatórios: id, name, status</li>
                <li>• Datas no formato ISO (YYYY-MM-DD)</li>
              </ul>
            </div>
          </section>

          {/* Debug e Monitoramento */}
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

export default DataEditorPage;