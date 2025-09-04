import { DataProvider } from "@/contexts/DataContext";
import { mockTaskData } from "@/data/projectData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
            {/* Configurações de Usuário */}
            <div className="bg-card p-6 border-2 border-purple-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-4">Perfil</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input type="text" placeholder="Seu nome" className="w-full mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">E-mail</label>
                  <Input type="email" placeholder="seuemail@exemplo.com" className="w-full mt-1" />
                </div>
              </div>
            </div>

            {/* Configurações de Sistema */}
            <div className="bg-card p-6 border-2 border-purple-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-4">Sistema</h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">Limpar Cache</Button>
                <Button variant="outline" className="w-full">Exportar Dados</Button>
                <Button variant="outline" className="w-full" disabled>
                  Sincronizar com Google Drive (Futuramente)
                </Button>
              </div>
            </div>

            {/* Sobre */}
            <div className="bg-card p-6 border-2 border-purple-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-4">Sobre</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Versão: 1.3.0</p>
                <p>Última atualização: Janeiro 2024</p>
                <p>Desenvolvido por DashiTecnology®</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </DataProvider>
  );
};

export default Settings;