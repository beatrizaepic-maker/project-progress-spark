import React from 'react';
import { LucideIcon, Database, FileX, AlertCircle, Plus, Upload, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
    icon?: LucideIcon;
  }>;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Database,
  title,
  description,
  suggestions = [],
  actions = [],
  className
}) => {
  return (
    <Card className={cn('p-8 text-center', className)}>
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 rounded-full bg-muted/50">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-2 text-left">
            <p className="text-sm font-medium text-foreground">Sugestões:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {actions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  onClick={action.onClick}
                  className="flex items-center gap-2"
                >
                  {ActionIcon && <ActionIcon className="h-4 w-4" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

interface InsufficientDataProps {
  type: 'no-tasks' | 'incomplete-tasks' | 'invalid-data' | 'calculation-failed';
  requiredCount?: number;
  actualCount?: number;
  onAddData?: () => void;
  onRefresh?: () => void;
  onImport?: () => void;
  className?: string;
}

export const InsufficientDataDisplay: React.FC<InsufficientDataProps> = ({
  type,
  requiredCount,
  actualCount = 0,
  onAddData,
  onRefresh,
  onImport,
  className
}) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'no-tasks':
        return {
          icon: FileX,
          title: 'Nenhuma tarefa encontrada',
          description: 'Não há tarefas cadastradas no sistema. Adicione algumas tarefas para começar a visualizar os indicadores.',
          suggestions: [
            'Cadastre pelo menos uma tarefa no sistema',
            'Importe dados de um arquivo CSV ou Excel',
            'Verifique se há filtros ativos que possam estar ocultando as tarefas'
          ],
          actions: [
            ...(onAddData ? [{
              label: 'Adicionar Tarefa',
              onClick: onAddData,
              icon: Plus,
              variant: 'default' as const
            }] : []),
            ...(onImport ? [{
              label: 'Importar Dados',
              onClick: onImport,
              icon: Upload,
              variant: 'outline' as const
            }] : []),
            ...(onRefresh ? [{
              label: 'Atualizar',
              onClick: onRefresh,
              icon: RefreshCw,
              variant: 'secondary' as const
            }] : [])
          ]
        };

      case 'incomplete-tasks':
        return {
          icon: AlertCircle,
          title: 'Dados insuficientes para análise',
          description: `São necessárias pelo menos ${requiredCount} tarefas completas para gerar indicadores confiáveis. Atualmente há ${actualCount} tarefa(s) disponível(is).`,
          suggestions: [
            `Complete mais ${(requiredCount || 0) - actualCount} tarefa(s) para análise completa`,
            'Verifique se todas as datas estão preenchidas corretamente',
            'Confirme se as tarefas foram finalizadas adequadamente'
          ],
          actions: [
            ...(onRefresh ? [{
              label: 'Verificar Novamente',
              onClick: onRefresh,
              icon: RefreshCw,
              variant: 'default' as const
            }] : [])
          ]
        };

      case 'invalid-data':
        return {
          icon: AlertCircle,
          title: 'Dados inválidos detectados',
          description: 'Alguns dados estão em formato incorreto ou inconsistente, impedindo o cálculo dos indicadores.',
          suggestions: [
            'Verifique se todas as datas estão no formato correto (DD/MM/AAAA)',
            'Confirme se não há campos obrigatórios em branco',
            'Remova ou corrija dados inconsistentes'
          ],
          actions: [
            ...(onRefresh ? [{
              label: 'Tentar Novamente',
              onClick: onRefresh,
              icon: RefreshCw,
              variant: 'default' as const
            }] : [])
          ]
        };

      case 'calculation-failed':
        return {
          icon: AlertCircle,
          title: 'Falha no cálculo dos indicadores',
          description: 'Ocorreu um erro durante o processamento dos dados. Os indicadores podem estar temporariamente indisponíveis.',
          suggestions: [
            'Tente recarregar a página',
            'Verifique se todos os dados estão corretos',
            'Entre em contato com o suporte se o problema persistir'
          ],
          actions: [
            ...(onRefresh ? [{
              label: 'Tentar Novamente',
              onClick: onRefresh,
              icon: RefreshCw,
              variant: 'default' as const
            }] : [])
          ]
        };

      default:
        return {
          icon: Database,
          title: 'Dados não disponíveis',
          description: 'Não foi possível carregar os dados necessários.',
          suggestions: ['Tente recarregar a página'],
          actions: []
        };
    }
  };

  const config = getEmptyStateConfig();

  return (
    <EmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
      suggestions={config.suggestions}
      actions={config.actions}
      className={className}
    />
  );
};

interface DataQualityIndicatorProps {
  totalTasks: number;
  completeTasks: number;
  validTasks: number;
  minRequiredTasks?: number;
  className?: string;
}

export const DataQualityIndicator: React.FC<DataQualityIndicatorProps> = ({
  totalTasks,
  completeTasks,
  validTasks,
  minRequiredTasks = 5,
  className
}) => {
  const completionRate = totalTasks > 0 ? (completeTasks / totalTasks) * 100 : 0;
  const validityRate = totalTasks > 0 ? (validTasks / totalTasks) * 100 : 0;
  const hasMinimumData = completeTasks >= minRequiredTasks;

  const getQualityStatus = () => {
    if (!hasMinimumData) return { status: 'insufficient', color: 'text-red-600', bg: 'bg-red-50' };
    if (validityRate >= 90 && completionRate >= 90) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (validityRate >= 70 && completionRate >= 70) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { status: 'needs-improvement', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  };

  const quality = getQualityStatus();

  const getStatusText = () => {
    switch (quality.status) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Boa';
      case 'needs-improvement': return 'Precisa melhorar';
      case 'insufficient': return 'Insuficiente';
      default: return 'Desconhecida';
    }
  };

  return (
    <Card className={cn('p-4', quality.bg, className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Qualidade dos Dados</h4>
          <span className={cn('text-sm font-semibold', quality.color)}>
            {getStatusText()}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-foreground">{totalTasks}</div>
            <div className="text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">{completeTasks}</div>
            <div className="text-muted-foreground">Completas</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">{validTasks}</div>
            <div className="text-muted-foreground">Válidas</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Completude</span>
            <span>{completionRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Validade</span>
            <span>{validityRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${validityRate}%` }}
            />
          </div>
        </div>

        {!hasMinimumData && (
          <div className="text-xs text-red-600 mt-2">
            ⚠️ Mínimo de {minRequiredTasks} tarefas completas necessário para análise confiável
          </div>
        )}
      </div>
    </Card>
  );
};

export default EmptyState;