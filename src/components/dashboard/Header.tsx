import { CalendarDays, BarChart3 } from "lucide-react";

export default function Header() {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard de Projeto</h1>
              <p className="text-sm text-muted-foreground">Análise completa do último projeto entregue</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg border">
            <CalendarDays className="h-4 w-4" />
            <span>Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}