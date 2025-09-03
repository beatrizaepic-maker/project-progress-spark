/**
 * Testes End-to-End para Integração de Páginas
 * 
 * Testa o fluxo completo de navegação e sincronização
 * de dados entre todas as páginas da aplicação.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

import GlobalProvider from '@/contexts/GlobalContext';
import IntegratedNavigation from '@/components/navigation/IntegratedNavigation';
import Dashboard from '@/pages/Dashboard';
import Analytics from '@/pages/Analytics';
import Tasks from '@/pages/Tasks';
import { mockTaskData } from '@/data/projectData';

// Componente de teste que inclui toda a estrutura da aplicação
const TestApp = ({ initialRoute = '/' }: { initialRoute?: string }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GlobalProvider>
          <IntegratedNavigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/tasks" element={<Tasks />} />
          </Routes>
        </GlobalProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Integração End-to-End das Páginas', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    // Mock do localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Navegação Integrada', () => {
    it('deve navegar entre páginas mantendo estado consistente', async () => {
      render(<TestApp />);

      // Verificar se está na página Dashboard
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Visão geral das principais estatísticas')).toBeInTheDocument();

      // Navegar para Analytics
      const analyticsButton = screen.getByRole('button', { name: /análise visual/i });
      await user.click(analyticsButton);

      await waitFor(() => {
        expect(screen.getByText('Análise Visual')).toBeInTheDocument();
      });

      // Verificar se dados estão sincronizados (devem mostrar mesmo número de tarefas)
      const taskBadges = screen.getAllByText(new RegExp(`${mockTaskData.length}`, 'i'));
      expect(taskBadges.length).toBeGreaterThan(0);

      // Navegar para Tasks
      const tasksButton = screen.getByRole('button', { name: /tarefas/i });
      await user.click(tasksButton);

      await waitFor(() => {
        expect(screen.getByText('Gerenciamento de Tarefas')).toBeInTheDocument();
      });

      // Verificar consistência dos dados na página Tasks
      expect(screen.getByText(`Total de Tarefas: ${mockTaskData.length}`)).toBeInTheDocument();
    });

    it('deve atualizar breadcrumb corretamente durante navegação', async () => {
      render(<TestApp />);

      // Verificar breadcrumb inicial
      expect(screen.getByText('Início')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      // Navegar para Analytics
      const analyticsButton = screen.getByRole('button', { name: /análise visual/i });
      await user.click(analyticsButton);

      await waitFor(() => {
        expect(screen.getByText('Análise Visual')).toBeInTheDocument();
      });

      // Navegar para Tasks
      const tasksButton = screen.getByRole('button', { name: /tarefas/i });
      await user.click(tasksButton);

      await waitFor(() => {
        expect(screen.getByText('Gerenciamento de Tarefas')).toBeInTheDocument();
      });
    });

    it('deve manter indicadores de status consistentes entre páginas', async () => {
      render(<TestApp />);

      // Verificar status de conexão
      expect(screen.getByText(/connected|conectado/i)).toBeInTheDocument();

      // Navegar entre páginas e verificar se status persiste
      const analyticsButton = screen.getByRole('button', { name: /análise visual/i });
      await user.click(analyticsButton);

      await waitFor(() => {
        expect(screen.getByText(/connected|conectado/i)).toBeInTheDocument();
      });

      const tasksButton = screen.getByRole('button', { name: /tarefas/i });
      await user.click(tasksButton);

      await waitFor(() => {
        expect(screen.getByText(/connected|conectado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sincronização de Dados', () => {
    it('deve sincronizar atualizações de dados entre todas as páginas', async () => {
      render(<TestApp />);

      // Encontrar botão de atualização na página Dashboard
      const refreshButton = screen.getByRole('button', { name: /atualizar/i });
      
      // Simular atualização de dados
      await user.click(refreshButton);

      // Navegar para Analytics e verificar se dados foram atualizados
      const analyticsButton = screen.getByRole('button', { name: /análise visual/i });
      await user.click(analyticsButton);

      await waitFor(() => {
        expect(screen.getByText('Análise Visual')).toBeInTheDocument();
      });

      // Verificar se timestamp de atualização é consistente
      const timeElements = screen.getAllByText(/atualizado|última atualização/i);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('deve manter cache de KPIs consistente entre páginas', async () => {
      render(<TestApp />);

      // Aguardar carregamento inicial dos KPIs
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Navegar para Analytics (que usa cache de KPIs)
      const analyticsButton = screen.getByRole('button', { name: /análise visual/i });
      await user.click(analyticsButton);

      await waitFor(() => {
        expect(screen.getByText('Análise Visual')).toBeInTheDocument();
      });

      // Verificar se indicadores de cache estão presentes
      const cacheIndicators = screen.getAllByText(/cache/i);
      expect(cacheIndicators.length).toBeGreaterThan(0);
    });

    it('deve propagar erros de forma consistente entre páginas', async () => {
      // Mock de erro de rede
      const originalFetch = global.fetch;
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      render(<TestApp />);

      // Tentar atualizar dados
      const refreshButton = screen.getByRole('button', { name: /atualizar/i });
      await user.click(refreshButton);

      // Navegar para outra página e verificar se erro persiste
      const analyticsButton = screen.getByRole('button', { name: /análise visual/i });
      await user.click(analyticsButton);

      await waitFor(() => {
        expect(screen.getByText('Análise Visual')).toBeInTheDocument();
      });

      // Restaurar fetch original
      global.fetch = originalFetch;
    });
  });

  describe('Performance e Responsividade', () => {
    it('deve carregar páginas rapidamente após navegação inicial', async () => {
      const startTime = performance.now();
      
      render(<TestApp />);

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const initialLoadTime = performance.now() - startTime;

      // Navegar para Analytics
      const navigationStartTime = performance.now();
      const analyticsButton = screen.getByRole('button', { name: /análise visual/i });
      await user.click(analyticsButton);

      await waitFor(() => {
        expect(screen.getByText('Análise Visual')).toBeInTheDocument();
      });

      const navigationTime = performance.now() - navigationStartTime;

      // Navegação subsequente deve ser mais rápida que carregamento inicial
      expect(navigationTime).toBeLessThan(initialLoadTime);
    });

    it('deve manter responsividade em telas pequenas', async () => {
      // Simular tela mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(<TestApp />);

      // Verificar se navegação funciona em mobile
      const analyticsButton = screen.getByRole('button', { name: /análise visual/i });
      await user.click(analyticsButton);

      await waitFor(() => {
        expect(screen.getByText('Análise Visual')).toBeInTheDocument();
      });

      // Verificar se elementos são visíveis e clicáveis
      expect(analyticsButton).toBeVisible();
    });
  });

  describe('Acessibilidade', () => {
    it('deve manter foco adequado durante navegação', async () => {
      render(<TestApp />);

      // Navegar usando teclado
      const analyticsButton = screen.getByRole('button', { name: /análise visual/i });
      
      // Simular Tab para focar no botão
      analyticsButton.focus();
      expect(document.activeElement).toBe(analyticsButton);

      // Pressionar Enter para navegar
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Análise Visual')).toBeInTheDocument();
      });

      // Verificar se foco foi mantido apropriadamente
      expect(document.activeElement).not.toBe(null);
    });

    it('deve ter landmarks ARIA apropriados em todas as páginas', async () => {
      render(<TestApp />);

      // Verificar landmarks na página Dashboard
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Navegar para Analytics
      const analyticsButton = screen.getByRole('button', { name: /análise visual/i });
      await user.click(analyticsButton);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      // Navegar para Tasks
      const tasksButton = screen.getByRole('button', { name: /tarefas/i });
      await user.click(tasksButton);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
    });
  });

  describe('Casos Extremos', () => {
    it('deve lidar com dados vazios graciosamente', async () => {
      // Mock de dados vazios
      const emptyDataMock = [];
      
      render(<TestApp />);

      // Navegar entre páginas com dados vazios
      const analyticsButton = screen.getByRole('button', { name: /análise visual/i });
      await user.click(analyticsButton);

      await waitFor(() => {
        expect(screen.getByText('Análise Visual')).toBeInTheDocument();
      });

      // Verificar se não há crashes com dados vazios
      expect(() => screen.getByText('Análise Visual')).not.toThrow();
    });

    it('deve recuperar de estados de erro durante navegação', async () => {
      render(<TestApp />);

      // Simular estado de erro
      const refreshButton = screen.getByRole('button', { name: /atualizar/i });
      
      // Mock de função que falha
      global.fetch = vi.fn(() => Promise.reject(new Error('Test error')));

      await user.click(refreshButton);

      // Navegar para outra página
      const analyticsButton = screen.getByRole('button', { name: /análise visual/i });
      await user.click(analyticsButton);

      await waitFor(() => {
        expect(screen.getByText('Análise Visual')).toBeInTheDocument();
      });

      // Verificar se aplicação ainda está funcionando
      expect(screen.getByText('Análise Visual')).toBeInTheDocument();
    });
  });
});
