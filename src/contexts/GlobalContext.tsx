/**
 * Provedor de Contexto Global Integrado
 * 
 * Centraliza o gerenciamento de estado entre todas as páginas,
 * fornecendo dados consistentes e sincronizados.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppState } from '@/services/appStateManager';
import { DataProvider } from '@/contexts/DataContext';
import { TaskData } from '@/data/projectData';
import { getTasksData } from '@/services/supabaseDataService';
import { useToast } from '@/hooks/use-toast';

interface GlobalContextValue {
  tasks: TaskData[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateTasks: (tasks: TaskData[]) => void;
  lastUpdate: Date;
  connectionStatus: 'connected' | 'disconnected' | 'error';
}

const GlobalContext = createContext<GlobalContextValue | undefined>(undefined);

interface GlobalProviderProps {
  children: React.ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const { state, updateTasks } = useAppState();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('connected');

  // Inicializar dados se não existirem
  useEffect(() => {
    if (state.tasks.length === 0) {
      const taskData = getTasksData();
      updateTasks(taskData);
    }
  }, [state.tasks.length, updateTasks]);

  // Monitorar conectividade
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('connected');
      toast({
        title: "Conexão Restaurada",
        description: "Aplicação online novamente.",
        duration: 3000
      });
    };

    const handleOffline = () => {
      setConnectionStatus('disconnected');
      toast({
        title: "Sem Conexão",
        description: "Aplicação funcionando offline.",
        variant: "destructive",
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar status inicial
    setConnectionStatus(navigator.onLine ? 'connected' : 'disconnected');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Refresh automático de dados
  useEffect(() => {
    if (!state.userPreferences.enableRealTimeUpdates) return;

    const interval = setInterval(async () => {
      await refreshData();
    }, state.userPreferences.kpiRefreshInterval);

    return () => clearInterval(interval);
  }, [state.userPreferences.enableRealTimeUpdates, state.userPreferences.kpiRefreshInterval]);

  const refreshData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Simular carregamento de dados (em produção seria uma API call)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Carregar dados do Supabase
      const freshData = [...getTasksData()];
      updateTasks(freshData);

      toast({
        title: "Dados Atualizados",
        description: `${freshData.length} tarefas carregadas com sucesso.`,
        duration: 2000
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setConnectionStatus('error');
      
      toast({
        title: "Erro ao Atualizar",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTasks = (newTasks: TaskData[]) => {
    try {
      updateTasks(newTasks);
      setError(null);
      
      toast({
        title: "Tarefas Atualizadas",
        description: `${newTasks.length} tarefas processadas.`,
        duration: 2000
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar tarefas';
      setError(errorMessage);
      
      toast({
        title: "Erro na Atualização",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const contextValue: GlobalContextValue = {
    tasks: state.tasks,
    isLoading,
    error,
    refreshData,
    updateTasks: handleUpdateTasks,
    lastUpdate: state.lastUpdate,
    connectionStatus
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      <DataProvider initialTasks={state.tasks}>
        {children}
      </DataProvider>
    </GlobalContext.Provider>
  );
};

// Hook para usar o contexto global
export const useGlobalContext = (): GlobalContextValue => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext deve ser usado dentro de GlobalProvider');
  }
  return context;
};

// HOC para páginas que precisam do contexto global
export function withGlobalContext<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    return (
      <GlobalProvider>
        <Component {...props} />
      </GlobalProvider>
    );
  };
}

export default GlobalProvider;
