/**
 * Serviço Central de Gerenciamento de Estado da Aplicação
 * 
 * Responsável por:
 * - Coordenar estado entre páginas
 * - Gerenciar cache global de KPIs
 * - Sincronizar dados entre componentes
 * - Persistir configurações do usuário
 */

import React from 'react';
import { TaskData } from '@/data/projectData';

export interface AppState {
  tasks: TaskData[];
  lastUpdate: Date;
  kpiCache: Map<string, any>;
  userPreferences: UserPreferences;
  navigationContext: NavigationContext;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultPage: 'dashboard' | 'analytics' | 'tasks';
  kpiRefreshInterval: number;
  enableRealTimeUpdates: boolean;
  chartAnimations: boolean;
  compactView: boolean;
}

export interface NavigationContext {
  currentPage: string;
  previousPage: string;
  breadcrumb: string[];
  lastAction: string;
  timestamp: Date;
}

class AppStateManager {
  private state: AppState;
  private listeners: Set<(state: AppState) => void> = new Set();
  private storageKey = 'bea-system-app-state';

  constructor() {
    this.state = this.initializeState();
    this.loadFromStorage();
    
    // Configurar salvamento automático
    window.addEventListener('beforeunload', () => this.saveToStorage());
    
    // Salvar estado a cada 30 segundos
    setInterval(() => this.saveToStorage(), 30000);
  }

  private initializeState(): AppState {
    return {
      tasks: [],
      lastUpdate: new Date(),
      kpiCache: new Map(),
      userPreferences: {
        theme: 'system',
        defaultPage: 'dashboard',
        kpiRefreshInterval: 30000, // 30 segundos
        enableRealTimeUpdates: true,
        chartAnimations: true,
        compactView: false
      },
      navigationContext: {
        currentPage: 'dashboard',
        previousPage: '',
        breadcrumb: ['Dashboard'],
        lastAction: 'init',
        timestamp: new Date()
      }
    };
  }

  // Gerenciamento de Estado
  getState(): AppState {
    return { ...this.state };
  }

  updateTasks(tasks: TaskData[]): void {
    this.state.tasks = tasks;
    this.state.lastUpdate = new Date();
    
    // Invalidar cache de KPIs quando dados mudam
    this.invalidateKPICache();
    
    this.notifyListeners();
  }

  updateKPICache(key: string, results: any): void {
    this.state.kpiCache.set(key, results);
    this.notifyListeners();
  }

  getKPIFromCache(key: string): any | undefined {
    return this.state.kpiCache.get(key);
  }

  invalidateKPICache(): void {
    this.state.kpiCache.clear();
    this.notifyListeners();
  }

  // Gerenciamento de Preferências
  updateUserPreferences(preferences: Partial<UserPreferences>): void {
    this.state.userPreferences = {
      ...this.state.userPreferences,
      ...preferences
    };
    this.notifyListeners();
    this.saveToStorage();
  }

  getUserPreferences(): UserPreferences {
    return { ...this.state.userPreferences };
  }

  // Gerenciamento de Navegação
  updateNavigationContext(page: string, action: string = 'navigate'): void {
    const previous = this.state.navigationContext.currentPage;
    
    this.state.navigationContext = {
      currentPage: page,
      previousPage: previous,
      breadcrumb: this.updateBreadcrumb(page),
      lastAction: action,
      timestamp: new Date()
    };
    
    this.notifyListeners();
  }

  private updateBreadcrumb(page: string): string[] {
    const pageMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'analytics': 'Análise Visual',
      'tasks': 'Gerenciamento de Tarefas',
      'settings': 'Configurações',
      'data-editor': 'Editor de Dados'
    };
    
    return ['Início', pageMap[page] || page];
  }

  getNavigationContext(): NavigationContext {
    return { ...this.state.navigationContext };
  }

  // Sistema de Eventos
  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    
    // Retorna função de cleanup
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Erro ao notificar listener de estado:', error);
      }
    });
  }

  // Persistência
  private saveToStorage(): void {
    try {
      const stateToSave = {
        userPreferences: this.state.userPreferences,
        navigationContext: this.state.navigationContext,
        lastUpdate: this.state.lastUpdate.toISOString()
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Erro ao salvar estado no localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsedState = JSON.parse(saved);
        
        if (parsedState.userPreferences) {
          this.state.userPreferences = {
            ...this.state.userPreferences,
            ...parsedState.userPreferences
          };
        }
        
        if (parsedState.navigationContext) {
          this.state.navigationContext = {
            ...this.state.navigationContext,
            ...parsedState.navigationContext,
            timestamp: new Date(parsedState.navigationContext.timestamp)
          };
        }
        
        if (parsedState.lastUpdate) {
          this.state.lastUpdate = new Date(parsedState.lastUpdate);
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar estado do localStorage:', error);
    }
  }

  // Métricas e Monitoramento
  getAppMetrics() {
    return {
      totalTasks: this.state.tasks.length,
      cacheSize: this.state.kpiCache.size,
      lastUpdate: this.state.lastUpdate,
      activeListeners: this.listeners.size,
      memoryUsage: this.calculateMemoryUsage()
    };
  }

  private calculateMemoryUsage(): number {
    // Estimativa simples do uso de memória
    const tasksSize = JSON.stringify(this.state.tasks).length;
    const cacheSize = Array.from(this.state.kpiCache.values())
      .reduce((acc, cache) => acc + JSON.stringify(cache).length, 0);
    
    return tasksSize + cacheSize;
  }

  // Limpeza e Reset
  reset(): void {
    this.state = this.initializeState();
    localStorage.removeItem(this.storageKey);
    this.notifyListeners();
  }

  clearCache(): void {
    this.state.kpiCache.clear();
    this.notifyListeners();
  }
}

// Instância singleton
export const appStateManager = new AppStateManager();

// Hook React para usar o state manager
export function useAppState() {
  const [state, setState] = React.useState(appStateManager.getState());

  React.useEffect(() => {
    const unsubscribe = appStateManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    state,
    updateTasks: (tasks: TaskData[]) => appStateManager.updateTasks(tasks),
    updatePreferences: (prefs: Partial<UserPreferences>) => 
      appStateManager.updateUserPreferences(prefs),
    updateNavigation: (page: string, action?: string) => 
      appStateManager.updateNavigationContext(page, action),
    getMetrics: () => appStateManager.getAppMetrics(),
    clearCache: () => appStateManager.clearCache(),
    reset: () => appStateManager.reset()
  };
}

// Para uso fora de componentes React
export { appStateManager as default };
