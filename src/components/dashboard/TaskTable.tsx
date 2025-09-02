import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WorkingDaysTooltip, DelayTooltip, StatusTooltip, DateTooltip } from "@/components/ui/informative-tooltip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  Clock, 
  HelpCircle, 
  Zap
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { formatDays } from "@/utils/kpiFormatters";
import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const TaskTable = () => {
  const { tasks } = useData();
  const isMobile = useIsMobile();
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [delayRangeFilter, setDelayRangeFilter] = useState<string>('all');

  // Função para formatar datas de forma consistente
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      short: date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      full: date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      weekday: date.toLocaleDateString('pt-BR', { 
        weekday: 'short' 
      })
    };
  };

  // Função para calcular data planejada (início + duração)
  const calculatePlannedEndDate = (startDate: string, duration: number) => {
    const start = new Date(startDate);
    let plannedEnd = new Date(start);
    let addedDays = 0;
    
    while (addedDays < duration) {
      plannedEnd.setDate(plannedEnd.getDate() + 1);
      // Pula fins de semana
      if (plannedEnd.getDay() !== 0 && plannedEnd.getDay() !== 6) {
        addedDays++;
      }
    }
    
    return plannedEnd;
  };

  // Função para calcular atraso preciso em dias úteis
  const calculatePreciseDelay = (endDate: string, deadlineDate: string) => {
    const end = new Date(endDate);
    const deadline = new Date(deadlineDate);
    
    if (end <= deadline) {
      // Calcula quantos dias foi entregue antes (negativo)
      let earlyDays = 0;
      for (let d = new Date(end); d < deadline; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0 && d.getDay() !== 6) {
          earlyDays++;
        }
      }
      return -earlyDays;
    } else {
      // Calcula atraso (positivo)
      let delayDays = 0;
      for (let d = new Date(deadline); d < end; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0 && d.getDay() !== 6) {
          delayDays++;
        }
      }
      return delayDays;
    }
  };

  // Função para obter descrição do atraso
  const getDelayDescription = (delay: number) => {
    if (delay < 0) return `Entregue ${Math.abs(delay)} dias antes do prazo`;
    if (delay === 0) return 'Entregue exatamente no prazo';
    if (delay <= 2) return `Atraso leve de ${delay} dias úteis`;
    if (delay <= 5) return `Atraso moderado de ${delay} dias úteis`;
    return `Atraso crítico de ${delay} dias úteis`;
  };

  // Função para determinar o status da tarefa
  type TaskStatusType = 'early' | 'on-time' | 'at-risk' | 'delayed' | 'critical';

  const getTaskStatus = (task: any): {
    type: TaskStatusType;
    label: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  } => {
    const preciseDelay = calculatePreciseDelay(task.fim, task.prazo);
    
    if (preciseDelay < 0) {
      return {
        type: 'early',
        label: 'Antecipada',
        icon: Zap,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        variant: 'secondary'
      };
    } else if (preciseDelay === 0) {
      return {
        type: 'on-time',
        label: 'No Prazo',
        icon: Target,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        variant: 'default'
      };
    } else if (preciseDelay <= 2) {
      return {
        type: 'at-risk',
        label: 'Risco Baixo',
        icon: AlertTriangle,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        variant: 'outline'
      };
    } else if (preciseDelay <= 5) {
      return {
        type: 'delayed',
        label: 'Atrasada',
        icon: AlertTriangle,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        variant: 'destructive'
      };
    } else {
      return {
        type: 'critical',
        label: 'Crítica',
        icon: AlertTriangle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        variant: 'destructive'
      };
    }
  };

  // Função para obter classes CSS da linha baseada no status
  const getRowClasses = (task: any, index: number) => {
    const status = getTaskStatus(task);
    const baseClasses = `border-b border-border hover:bg-muted/10 transition-all duration-200 ${
      index % 2 === 0 ? 'bg-card/50' : 'bg-transparent'
    }`;
    
    if (status.type === 'critical') {
      return `${baseClasses} ${status.bgColor} ${status.borderColor} border-l-4 shadow-sm`;
    } else if (status.type === 'early') {
      return `${baseClasses} ${status.bgColor} ${status.borderColor} border-l-2`;
    }
    
    return baseClasses;
  };

  // Lógica de filtragem das tarefas
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Filtro por busca de nome
    if (searchTerm.trim()) {
      filtered = filtered.filter(task =>
        task.tarefa.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status de prazo
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => {
        const status = getTaskStatus(task);
        return status.type === statusFilter;
      });
    }

    // Filtro por faixa de atraso
    if (delayRangeFilter !== 'all') {
      filtered = filtered.filter(task => {
        const delay = calculatePreciseDelay(task.fim, task.prazo);
        
        switch (delayRangeFilter) {
          case 'no-delay':
            return delay <= 0;
          case '1-2-days':
            return delay >= 1 && delay <= 2;
          case '3-5-days':
            return delay >= 3 && delay <= 5;
          case '6-plus-days':
            return delay >= 6;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [tasks, searchTerm, statusFilter, delayRangeFilter]);

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDelayRangeFilter('all');
  };

  // Contadores para os filtros
  const filterCounts = useMemo(() => {
    const counts = {
      all: tasks.length,
      early: 0,
      'on-time': 0,
      'at-risk': 0,
      delayed: 0,
      critical: 0
    };

    tasks.forEach(task => {
      const status = getTaskStatus(task);
      counts[status.type as keyof typeof counts]++;
    });

    return counts;
  }, [tasks]);

  return (
    <TooltipProvider>
      <Card className="border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-foreground">
          Detalhamento das Tarefas
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({filteredTasks.length} de {tasks.length} tarefas)
          </span>
        </CardTitle>

        {/* Interface de Filtros */}
        <div className="mt-4 space-y-4">
          <div className={`flex gap-4 items-center ${isMobile ? 'flex-col' : 'flex-wrap'}`}>
            {/* Busca por nome */}
            <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : 'min-w-[200px]'}`}>
              <span className="text-muted-foreground">🔍</span>
              <Input
                placeholder="Buscar tarefa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
            </div>

            {/* Filtro por status */}
            <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}>
              <span className="text-muted-foreground">🔽</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={`h-8 ${isMobile ? 'w-full' : 'w-[180px]'}`}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos ({filterCounts.all})</SelectItem>
                  <SelectItem value="early">🚀 Antecipadas ({filterCounts.early})</SelectItem>
                  <SelectItem value="on-time">🎯 No Prazo ({filterCounts['on-time']})</SelectItem>
                  <SelectItem value="at-risk">⚠️ Risco Baixo ({filterCounts['at-risk']})</SelectItem>
                  <SelectItem value="delayed">🔶 Atrasadas ({filterCounts.delayed})</SelectItem>
                  <SelectItem value="critical">🔴 Críticas ({filterCounts.critical})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por faixa de atraso */}
            <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Select value={delayRangeFilter} onValueChange={setDelayRangeFilter}>
                <SelectTrigger className={`h-8 ${isMobile ? 'w-full' : 'w-[160px]'}`}>
                  <SelectValue placeholder="Atraso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as faixas</SelectItem>
                  <SelectItem value="no-delay">Sem atraso</SelectItem>
                  <SelectItem value="1-2-days">1-2 dias</SelectItem>
                  <SelectItem value="3-5-days">3-5 dias</SelectItem>
                  <SelectItem value="6-plus-days">6+ dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botão para limpar filtros */}
            {(searchTerm || statusFilter !== 'all' || delayRangeFilter !== 'all') && (
              <button
                onClick={clearAllFilters}
                className={`flex items-center gap-1 px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors ${isMobile ? 'w-full justify-center' : ''}`}
              >
                <span>✕</span>
                Limpar filtros
              </button>
            )}
          </div>

          {/* Indicadores de filtros ativos */}
          {(searchTerm || statusFilter !== 'all' || delayRangeFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 text-xs">
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Busca: "{searchTerm}"
                  <span 
                    className="cursor-pointer hover:text-destructive" 
                    onClick={() => setSearchTerm('')}
                  >
                    ✕
                  </span>
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <span 
                    className="cursor-pointer hover:text-destructive" 
                    onClick={() => setStatusFilter('all')}
                  >
                    ✕
                  </span>
                </Badge>
              )}
              {delayRangeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Atraso: {delayRangeFilter}
                  <span 
                    className="cursor-pointer hover:text-destructive" 
                    onClick={() => setDelayRangeFilter('all')}
                  >
                    ✕
                  </span>
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <span className="text-blue-500">📅</span>
            <span>Data Planejada: Baseada na duração estimada</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-green-500" />
            <span>Apenas dias úteis são considerados</span>
          </div>
        </div>
        
        {/* Legenda de Status */}
        <div className="mt-4 p-3 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-semibold text-foreground">Legenda de Status:</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm max-w-sm">
                  <p className="font-semibold mb-2">Critérios de Classificação</p>
                  <div className="space-y-1 text-xs">
                    <p><strong>Antecipada:</strong> Tarefa concluída antes do prazo estabelecido</p>
                    <p><strong>No Prazo:</strong> Tarefa concluída exatamente no prazo</p>
                    <p><strong>Risco Baixo:</strong> Atraso de 1-2 dias úteis (ainda aceitável)</p>
                    <p><strong>Atrasada:</strong> Atraso de 3-5 dias úteis (requer atenção)</p>
                    <p><strong>Crítica:</strong> Atraso de 6+ dias úteis (intervenção necessária)</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    * Todos os cálculos consideram apenas dias úteis (segunda a sexta-feira)
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-500" />
              <span className="text-blue-600 dark:text-blue-400">Antecipada</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-green-500" />
              <span className="text-green-600 dark:text-green-400">No Prazo</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⚠️</span>
              <span className="text-yellow-600 dark:text-yellow-400">Risco Baixo (1-2d)</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              <span className="text-orange-600 dark:text-orange-400">Atrasada (3-5d)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-500">🔴</span>
              <span className="text-red-600 dark:text-red-400">Crítica (6+d)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isMobile ? (
          /* Layout mobile: cards empilhados */
          <div className="space-y-4">
            {filteredTasks.map((task, index) => {
              const status = getTaskStatus(task);
              const startDate = formatDate(task.inicio);
              const endDate = formatDate(task.fim);
              const plannedEndDate = formatDate(calculatePlannedEndDate(task.inicio, task.duracaoDiasUteis).toISOString().split('T')[0]);

              return (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3 bg-card"
                >
                  {/* Nome da tarefa */}
                  <div>
                    <h3 className="font-medium text-sm">{task.tarefa}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={status.variant} className="text-xs">
                        {status.icon} {status.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Datas */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Início:</span>
                      <div className="font-mono">{startDate.short}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fim:</span>
                      <div className="font-mono">{endDate.short}</div>
                    </div>
                  </div>

                  {/* Duração e atraso */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Duração:</span>
                      <div className="font-mono">{formatDays(task.duracaoDiasUteis)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Atraso:</span>
                      <div className={`font-mono ${task.atrasoDiasUteis > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatDays(task.atrasoDiasUteis)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Layout desktop: tabela tradicional */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tarefa</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help">
                        <span>📅</span>
                        Data Início
                        <HelpCircle className="h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm max-w-xs">
                        <p className="font-semibold">Data de Início</p>
                        <p>Data em que a tarefa foi efetivamente iniciada pela equipe.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help">
                        <span>📅</span>
                        Data Fim
                        <HelpCircle className="h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm max-w-xs">
                        <p className="font-semibold">Data de Conclusão</p>
                        <p>Data em que a tarefa foi efetivamente concluída e entregue.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help">
                        <Clock className="h-4 w-4" />
                        Data Planejada
                        <HelpCircle className="h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm max-w-xs">
                        <p className="font-semibold">Data Planejada</p>
                        <p>Data calculada baseada na duração estimada, considerando apenas dias úteis a partir da data de início.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help">
                        <span>📅</span>
                        Prazo Final
                        <HelpCircle className="h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm max-w-xs">
                        <p className="font-semibold">Prazo Final</p>
                        <p>Data limite estabelecida para conclusão da tarefa. Usado como referência para cálculo de atrasos.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help justify-center">
                        Duração
                        <HelpCircle className="h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm max-w-xs">
                        <p className="font-semibold">Duração em Dias Úteis</p>
                        <p>Tempo efetivo de trabalho, considerando apenas dias de segunda a sexta-feira.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help justify-center">
                        Atraso
                        <HelpCircle className="h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm max-w-xs">
                        <p className="font-semibold">Atraso em Dias Úteis</p>
                        <p>Diferença entre a data de conclusão e o prazo final, considerando apenas dias úteis.</p>
                        <p className="text-xs text-muted-foreground mt-1">Valores negativos indicam antecipação.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help justify-center">
                        Status
                        <HelpCircle className="h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm max-w-xs">
                        <p className="font-semibold">Status de Prazo</p>
                        <p>Classificação baseada no atraso:</p>
                        <ul className="text-xs mt-1 space-y-1">
                          <li>🚀 Antecipada: Concluída antes do prazo</li>
                          <li>🎯 No Prazo: Concluída exatamente no prazo</li>
                          <li>⚠️ Risco: 1-2 dias de atraso</li>
                          <li>🔶 Atrasada: 3-5 dias de atraso</li>
                          <li>🔴 Crítica: 6+ dias de atraso</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, index) => {
                const startDate = formatDate(task.inicio);
                const endDate = formatDate(task.fim);
                const deadlineDate = formatDate(task.prazo);
                const plannedEndDate = formatDate(calculatePlannedEndDate(task.inicio, task.duracaoDiasUteis).toISOString().split('T')[0]);
                
                return (
                  <tr 
                    key={task.id} 
                    className={getRowClasses(task, index)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const status = getTaskStatus(task);
                          if (status.type === 'critical') {
                            return (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              </div>
                            );
                          } else if (status.type === 'early') {
                            return <Zap className="h-4 w-4 text-blue-500" />;
                          }
                          return null;
                        })()}
                        <div className="font-medium text-foreground">{task.tarefa}</div>
                      </div>
                    </td>
                    
                    {/* Data de Início */}
                    <td className="p-4">
                      <DateTooltip
                        date={task.inicio}
                        label="Data de Início"
                        description="Data em que a tarefa foi iniciada."
                        side="top"
                      >
                        <div className="text-sm cursor-help hover:bg-muted/20 rounded p-1 transition-colors">
                          <div className="font-medium text-foreground flex items-center gap-1">
                            {startDate.short}
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="text-xs text-muted-foreground">{startDate.weekday}</div>
                        </div>
                      </DateTooltip>
                    </td>
                    
                    {/* Data de Fim */}
                    <td className="p-4">
                      <DateTooltip
                        date={task.fim}
                        label="Data de Conclusão"
                        description="Data em que a tarefa foi efetivamente concluída."
                        side="top"
                      >
                        <div className="text-sm cursor-help hover:bg-muted/20 rounded p-1 transition-colors">
                          <div className="font-medium text-foreground flex items-center gap-1">
                            {endDate.short}
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="text-xs text-muted-foreground">{endDate.weekday}</div>
                        </div>
                      </DateTooltip>
                    </td>
                    
                    {/* Data Planejada */}
                    <td className="p-4">
                      <DateTooltip
                        date={calculatePlannedEndDate(task.inicio, task.duracaoDiasUteis).toISOString().split('T')[0]}
                        label="Data Planejada"
                        description="Data calculada baseada na duração estimada da tarefa."
                        isPlanned={true}
                        side="top"
                      >
                        <div className="text-sm cursor-help hover:bg-muted/20 rounded p-1 transition-colors">
                          <div className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            {plannedEndDate.short}
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="text-xs text-muted-foreground">{plannedEndDate.weekday}</div>
                        </div>
                      </DateTooltip>
                    </td>
                    
                    {/* Prazo Final */}
                    <td className="p-4">
                      <DateTooltip
                        date={task.prazo}
                        label="Prazo Final"
                        description="Data limite estabelecida para conclusão da tarefa."
                        side="top"
                      >
                        <div className="text-sm cursor-help hover:bg-muted/20 rounded p-1 transition-colors">
                          <div className={`font-medium flex items-center gap-1 ${
                            task.atendeuPrazo 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {deadlineDate.short}
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="text-xs text-muted-foreground">{deadlineDate.weekday}</div>
                        </div>
                      </DateTooltip>
                    </td>
                    
                    {/* Duração */}
                    <td className="p-4 text-center">
                      <WorkingDaysTooltip
                        startDate={task.inicio}
                        endDate={task.fim}
                        workingDays={task.duracaoDiasUteis}
                        side="top"
                      >
                        <div className="text-sm cursor-help hover:bg-muted/20 rounded p-1 transition-colors">
                          <div className="font-medium text-foreground flex items-center gap-1">
                            {formatDays(task.duracaoDiasUteis, false)}
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="text-xs text-muted-foreground">dias úteis</div>
                        </div>
                      </WorkingDaysTooltip>
                    </td>
                    
                    {/* Atraso */}
                    <td className="p-4 text-center">
                      <DelayTooltip
                        delay={calculatePreciseDelay(task.fim, task.prazo)}
                        endDate={task.fim}
                        deadlineDate={task.prazo}
                        side="top"
                      >
                        <div className="cursor-help hover:bg-muted/20 rounded p-1 transition-colors">
                          {(() => {
                            const preciseDelay = calculatePreciseDelay(task.fim, task.prazo);
                            
                            if (preciseDelay === 0) {
                              return (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  ✅ No prazo
                                </Badge>
                              );
                            } else if (preciseDelay < 0) {
                              return (
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  🚀 -{formatDays(Math.abs(preciseDelay), false)}d
                                </Badge>
                              );
                            } else {
                              const bgColor = preciseDelay <= 2 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : preciseDelay <= 5 
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
                              
                              return (
                                <Badge variant="destructive" className={`text-xs ${bgColor}`}>
                                  ⚠️ +{formatDays(preciseDelay, false)}d
                                </Badge>
                              );
                            }
                          })()}
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {(() => {
                              const preciseDelay = calculatePreciseDelay(task.fim, task.prazo);
                              if (preciseDelay < 0) return 'Antecipada';
                              if (preciseDelay === 0) return 'Pontual';
                              if (preciseDelay <= 2) return 'Leve';
                              if (preciseDelay <= 5) return 'Moderado';
                              return 'Crítico';
                            })()}
                            <HelpCircle className="h-3 w-3" />
                          </div>
                        </div>
                      </DelayTooltip>
                    </td>
                    
                    {/* Status */}
                    <td className="p-4 text-center">
                      <StatusTooltip
                        status={getTaskStatus(task).type}
                        delay={calculatePreciseDelay(task.fim, task.prazo)}
                        side="top"
                      >
                        <div className="cursor-help hover:scale-105 transition-transform">
                          {(() => {
                            const status = getTaskStatus(task);
                            const IconComponent = status.icon;
                            
                            return (
                              <div className={`flex flex-col items-center gap-1 p-2 rounded-lg ${status.bgColor} ${status.borderColor} border hover:shadow-md transition-shadow`}>
                                <IconComponent className={`h-5 w-5 ${status.color}`} />
                                <span className={`text-xs font-medium ${status.color}`}>
                                  {status.label}
                                </span>
                                {status.type === 'critical' && (
                                  <div className="flex items-center gap-1 text-xs text-red-500">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span>Atenção</span>
                                  </div>
                                )}
                                <HelpCircle className="h-3 w-3 text-muted-foreground mt-1" />
                              </div>
                            );
                          })()}
                        </div>
                      </StatusTooltip>
                    </td>
                  </tr>
                );
              })}
              
              {/* Mensagem quando não há resultados */}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <span className="text-4xl">🔍</span>
                      <p className="text-sm">Nenhuma tarefa encontrada com os filtros aplicados</p>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-primary hover:underline"
                      >
                        Limpar filtros
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
};

export default TaskTable;