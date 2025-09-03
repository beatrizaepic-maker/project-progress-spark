/**
 * Sistema de Navegação Integrada
 * 
 * Componente que gerencia a navegação entre páginas e mantém
 * consistência de estado e contexto entre elas.
 */

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '@/services/appStateManager';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Home from 'lucide-react/dist/esm/icons/home';
import FileEdit from 'lucide-react/dist/esm/icons/file-edit';
import Clock from 'lucide-react/dist/esm/icons/clock';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  description: string;
}

const IntegratedNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, updateNavigation, getMetrics } = useAppState();
  
  const metrics = getMetrics();
  
  // Atualizar contexto de navegação quando a rota muda
  useEffect(() => {
    const page = location.pathname.replace('/', '') || 'dashboard';
    updateNavigation(page, 'route-change');
  }, [location.pathname, updateNavigation]);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: Home,
      description: 'Visão geral dos KPIs e métricas principais'
    },
    {
      id: 'analytics',
      label: 'Análise Visual',
      path: '/analytics',
      icon: BarChart3,
      description: 'Gráficos e análises estatísticas detalhadas'
    },
    {
      id: 'tasks',
      label: 'Tarefas',
      path: '/tasks',
      icon: Calendar,
      badge: metrics.totalTasks > 0 ? metrics.totalTasks : undefined,
      description: 'Gerenciamento e visualização de tarefas'
    },
    {
      id: 'data-editor',
      label: 'Editor de Dados',
      path: '/data-editor',
      icon: FileEdit,
      description: 'Edição e importação de dados de tarefas'
    },
    {
      id: 'settings',
      label: 'Configurações',
      path: '/settings',
      icon: Settings,
      description: 'Preferências e configurações da aplicação'
    }
  ];

  const handleNavigation = (item: NavigationItem) => {
    updateNavigation(item.id, 'user-click');
    navigate(item.path);
  };

  const currentPath = location.pathname;
  
  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            {state.navigationContext.breadcrumb.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>/</span>}
                <span className={index === state.navigationContext.breadcrumb.length - 1 ? 'text-foreground font-medium' : ''}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                Atualizado: {state.lastUpdate.toLocaleTimeString()}
              </span>
            </div>
            
            {state.userPreferences.enableRealTimeUpdates && (
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Tempo Real
              </Badge>
            )}
            
            {metrics.cacheSize > 0 && (
              <Badge variant="secondary" className="text-xs">
                Cache: {metrics.cacheSize}
              </Badge>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation(item)}
                className={cn(
                  "relative min-w-fit whitespace-nowrap transition-all duration-200",
                  isActive && "bg-primary text-primary-foreground shadow-sm"
                )}
                title={item.description}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span>{item.label}</span>
                
                {item.badge && (
                  <Badge 
                    variant={isActive ? "secondary" : "outline"} 
                    className="ml-2 h-5 min-w-5 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
                
                {/* Indicador de página ativa */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-primary-foreground rounded-full" />
                )}
              </Button>
            );
          })}
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>Total de Tarefas: {metrics.totalTasks}</span>
            <span>Memória: {(metrics.memoryUsage / 1024).toFixed(1)}KB</span>
            <span>Listeners: {metrics.activeListeners}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Indicador de Performance */}
            {metrics.memoryUsage > 100000 && (
              <div className="flex items-center space-x-1 text-amber-600">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs">Alto uso de memória</span>
              </div>
            )}
            
            {/* Actions */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              Atualizar
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default IntegratedNavigation;
