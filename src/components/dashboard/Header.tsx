import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";

export default function Header() {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20">
              <img 
                src="/LOGOEPIC.png" 
                alt="EPIC Logo" 
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">EPIC Space - Dashboard de Projeto</h1>
              <p className="text-sm text-muted-foreground">Sistema de Acompanhamento de Progresso de Projetos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 border">
            <CalendarDays className="h-4 w-4" />
            <span>Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}