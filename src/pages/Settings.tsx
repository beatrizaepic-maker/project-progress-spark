import { DataProvider } from "@/contexts/DataContext";
import { mockTaskData } from "@/data/projectData";

const Settings = () => {
  return (
    <DataProvider initialTasks={mockTaskData}>
      <main className="container mx-auto px-6 py-8 space-y-8">
          {/* Configurações */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Configurações</h2>
              <p className="text-muted-foreground">Personalize a aplicação de acordo com suas preferências</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Aparência */}
              <div className="bg-card p-6 border">
                <h3 className="text-lg font-semibold mb-4">Aparência</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tema</label>
                    <select className="w-full mt-1 p-2 border bg-background">
                      <option>Claro</option>
                      <option>Escuro</option>
                      <option>Sistema</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Idioma</label>
                    <select className="w-full mt-1 p-2 border bg-background">
                      <option>Português (BR)</option>
                      <option>English</option>
                      <option>Español</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notificações */}
              <div className="bg-card p-6 border">
                <h3 className="text-lg font-semibold mb-4">Notificações</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tarefas em atraso</span>
                    <input type="checkbox" className="" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Metas atingidas</span>
                    <input type="checkbox" className="" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Relatórios semanais</span>
                    <input type="checkbox" className="" />
                  </div>
                </div>
              </div>

              {/* Dados */}
              <div className="bg-card p-6 border">
                <h3 className="text-lg font-semibold mb-4">Gerenciamento de Dados</h3>
                <div className="space-y-3">
                  <button className="w-full p-2 text-left text-sm border hover:bg-muted">
                    Exportar todos os dados
                  </button>
                  <button className="w-full p-2 text-left text-sm border hover:bg-muted">
                    Importar dados
                  </button>
                  <button className="w-full p-2 text-left text-sm border hover:bg-muted text-destructive">
                    Limpar todos os dados
                  </button>
                </div>
              </div>

              {/* Sobre */}
              <div className="bg-card p-6 border">
                <h3 className="text-lg font-semibold mb-4">Sobre</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Versão: 1.0.0</p>
                  <p>Última atualização: Janeiro 2024</p>
                  <p>Desenvolvido com React + TypeScript</p>
                </div>
              </div>
            </div>
          </section>
      </main>
    </DataProvider>
  );
};

export default Settings;