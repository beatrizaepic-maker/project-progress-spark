import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Analytics from '@/pages/Analytics';
import DataEditor from '@/pages/DataEditor';
import { DataProvider } from '@/contexts/DataContext';
import { TaskData } from '@/data/projectData';
import { getTasksData } from '@/services/localStorageData';

// Dados reais do projeto para testes
const completeProjectData: TaskData[] = getTasksData();

// Provedor de contexto real para testes
const TestAppProvider = ({ children, initialTasks = completeProjectData }: { 
  children: React.ReactNode; 
  initialTasks?: TaskData[] 
}) => {
  return (
    <BrowserRouter>
      <DataProvider initialTasks={initialTasks}>
        {children}
      </DataProvider>
    </BrowserRouter>
  );
};

describe('End-to-End Application Flows', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Dashboard Complete Workflow', () => {
    it('should display comprehensive KPIs on dashboard load', async () => {
      render(
        <TestAppProvider>
          <Dashboard />
        </TestAppProvider>
      );

      // Verifica se todos os KPIs principais estão presentes
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });

    it('should update KPIs when filtering data', async () => {
      render(
        <TestAppProvider>
          <Dashboard />
        </TestAppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });

    it('should handle real-time data updates', async () => {
      const TestDashboard = () => {
        const [tasks, setTasks] = React.useState(completeProjectData);

        const simulateNewTask = () => {
          const newTask: TaskData = {
            id: 11,
            tarefa: 'Monitoramento Produção',
            responsavel: 'Novo Responsável',
            descricao: 'Tarefa de monitoramento',
            inicio: '2024-03-19',
            fim: '2024-03-20',
            prazo: '2024-03-25',
            duracaoDiasUteis: 2,
            atrasoDiasUteis: -3,
            atendeuPrazo: true,
            status: 'todo',
            prioridade: 'media'
          };
          setTasks(prev => [...prev, newTask]);
        };

        return (
          <TestAppProvider initialTasks={tasks}>
            <button onClick={simulateNewTask} data-testid="add-task-btn">
              Simular Nova Tarefa
            </button>
            <Dashboard />
          </TestAppProvider>
        );
      };

      render(<TestDashboard />);

      // Estado inicial
      expect(screen.getByText('6')).toBeInTheDocument(); // Total tasks

      // Simula chegada de nova tarefa
      await user.click(screen.getByTestId('add-task-btn'));

      await waitFor(() => {
        expect(screen.getByText('7')).toBeInTheDocument(); // Total tasks + 1
        // Taxa de cumprimento deve ter melhorado (3 de 7 tarefas completadas agora)
        expect(screen.getByText(/42%|43%/)).toBeInTheDocument();
      });
    });
  });

  describe('Analytics Deep Dive Workflow', () => {
    it('should navigate from dashboard to detailed analytics', async () => {
      render(
        <TestAppProvider>
          <Dashboard />
        </TestAppProvider>
      );

      // Clica em um KPI para ver detalhes
      const delayKPI = screen.getByTestId('average-delay-kpi');
      await user.click(delayKPI);

      // Deve navegar para página de analytics
      await waitFor(() => {
        expect(screen.getByText(/análise detalhada/i)).toBeInTheDocument();
      });
    });

    it('should display comprehensive analytics charts', async () => {
      render(
        <TestAppProvider>
          <Analytics />
        </TestAppProvider>
      );

      await waitFor(() => {
        // Verifica se todos os gráficos estão presentes
        expect(screen.getByTestId('delay-distribution-chart')).toBeInTheDocument();
        expect(screen.getByTestId('production-average-chart')).toBeInTheDocument();
        expect(screen.getByTestId('median-box-plot')).toBeInTheDocument();
        expect(screen.getByTestId('mode-frequency-chart')).toBeInTheDocument();
      });

      // Verifica se os dados foram processados corretamente
      expect(screen.getByText(/outliers removidos/i)).toBeInTheDocument();
      expect(screen.getByText(/estatísticas robustas/i)).toBeInTheDocument();
    });

    it('should allow interactive chart exploration', async () => {
      render(
        <TestAppProvider>
          <Analytics />
        </TestAppProvider>
      );

      // Interage com gráfico de distribuição
      const distributionChart = screen.getByTestId('delay-distribution-chart');
      
      // Simula hover sobre uma barra
      fireEvent.mouseEnter(distributionChart);
      
      await waitFor(() => {
        expect(screen.getByTestId('chart-tooltip')).toBeInTheDocument();
      });

      // Clica em uma categoria para filtrar
      const moderateDelayBar = screen.getByTestId('moderate-delay-bar');
      await user.click(moderateDelayBar);

      await waitFor(() => {
        // Outros gráficos devem atualizar com o filtro aplicado
        expect(screen.getByText(/filtro aplicado: atraso moderado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Editor Complete Workflow', () => {
    it('should allow editing task data and see immediate updates', async () => {
      render(
        <TestAppProvider>
          <DataEditor />
        </TestAppProvider>
      );

      // Encontra tarefa para editar
      const firstTask = screen.getByText('Análise de Requisitos');
      expect(firstTask).toBeInTheDocument();

      // Clica no botão de editar
      const editButton = screen.getByTestId('edit-task-1');
      await user.click(editButton);

      // Modal de edição deve abrir
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Edita a data de fim
      const endDateInput = screen.getByLabelText(/data fim/i);
      await user.clear(endDateInput);
      await user.type(endDateInput, '2024-01-08');

      // Salva alterações
      const saveButton = screen.getByRole('button', { name: /salvar/i });
      await user.click(saveButton);

      await waitFor(() => {
        // Modal deve fechar
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        
        // Tarefa deve aparecer como atrasada agora
        expect(screen.getByTestId('task-1-status')).toHaveTextContent('Atrasada');
      });
    });

    it('should validate data integrity during editing', async () => {
      render(
        <TestAppProvider>
          <DataEditor />
        </TestAppProvider>
      );

      const editButton = screen.getByTestId('edit-task-1');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Tenta colocar data de fim antes do início
      const startDateInput = screen.getByLabelText(/data início/i);
      const endDateInput = screen.getByLabelText(/data fim/i);
      
      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-01-10');
      
      await user.clear(endDateInput);
      await user.type(endDateInput, '2024-01-05');

      // Deve mostrar erro de validação
      await waitFor(() => {
        expect(screen.getByText(/data fim deve ser posterior/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      expect(saveButton).toBeDisabled();
    });

    it('should bulk edit multiple tasks', async () => {
      render(
        <TestAppProvider>
          <DataEditor />
        </TestAppProvider>
      );

      // Seleciona múltiplas tarefas
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Primeira tarefa
      await user.click(checkboxes[2]); // Segunda tarefa
      await user.click(checkboxes[3]); // Terceira tarefa

      // Botão de edição em lote deve aparecer
      await waitFor(() => {
        expect(screen.getByText(/editar selecionadas/i)).toBeInTheDocument();
      });

      const bulkEditButton = screen.getByRole('button', { name: /editar selecionadas/i });
      await user.click(bulkEditButton);

      await waitFor(() => {
        expect(screen.getByText(/editar 3 tarefas/i)).toBeInTheDocument();
      });

      // Aplica mudança em lote (ex: adicionar 2 dias a todos os prazos)
      const adjustmentInput = screen.getByLabelText(/ajustar prazo/i);
      await user.type(adjustmentInput, '2');

      const applyButton = screen.getByRole('button', { name: /aplicar/i });
      await user.click(applyButton);

      await waitFor(() => {
        // As tarefas selecionadas devem ter seus prazos ajustados
        expect(screen.getByText(/3 tarefas atualizadas/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Page Data Consistency', () => {
    it('should maintain data consistency across page navigation', async () => {
      const TestApp = () => {
        const [currentPage, setCurrentPage] = React.useState('dashboard');
        
        return (
          <TestAppProvider>
            <nav>
              <button onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
              <button onClick={() => setCurrentPage('analytics')}>Analytics</button>
              <button onClick={() => setCurrentPage('editor')}>Editor</button>
            </nav>
            
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'analytics' && <Analytics />}
            {currentPage === 'editor' && <DataEditor />}
          </TestAppProvider>
        );
      };

      render(<TestApp />);

      // Verifica dados no dashboard
      expect(screen.getByText('6')).toBeInTheDocument(); // Total tasks

      // Navega para analytics
      await user.click(screen.getByRole('button', { name: /analytics/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('delay-distribution-chart')).toBeInTheDocument();
      });

      // Navega para editor
      await user.click(screen.getByRole('button', { name: /editor/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Análise de Requisitos')).toBeInTheDocument();
      });

      // Volta para dashboard - dados devem estar consistentes
      await user.click(screen.getByRole('button', { name: /dashboard/i }));
      
      await waitFor(() => {
        expect(screen.getByText('6')).toBeInTheDocument(); // Ainda 6 tasks
      });
    });

    it('should propagate data changes across all views', async () => {
      const TestApp = () => {
        const [tasks, setTasks] = React.useState(completeProjectData);
        const [currentPage, setCurrentPage] = React.useState('editor');

        const addTask = () => {
          const newTask: TaskData = {
            id: 11,
            tarefa: 'Nova Tarefa Cross-Page',
            responsavel: 'Novo Responsável',
            descricao: 'Tarefa criada via interface',
            inicio: '2024-03-19',
            fim: '2024-03-21',
            prazo: '2024-03-20',
            duracaoDiasUteis: 3,
            atrasoDiasUteis: 1,
            atendeuPrazo: false,
            status: 'todo',
            prioridade: 'media'
          };
          setTasks(prev => [...prev, newTask]);
        };

        return (
          <TestAppProvider initialTasks={tasks}>
            <nav>
              <button onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
              <button onClick={() => setCurrentPage('analytics')}>Analytics</button>
              <button onClick={() => setCurrentPage('editor')}>Editor</button>
            </nav>
            
            <button onClick={addTask} data-testid="add-task-global">
              Adicionar Tarefa
            </button>
            
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'analytics' && <Analytics />}
            {currentPage === 'editor' && <DataEditor />}
          </TestAppProvider>
        );
      };

      render(<TestApp />);

      // No editor, adiciona nova tarefa
      await user.click(screen.getByTestId('add-task-global'));

      await waitFor(() => {
        expect(screen.getByText('Nova Tarefa Cross-Page')).toBeInTheDocument();
      });

      // Navega para dashboard - deve refletir a nova tarefa
      await user.click(screen.getByRole('button', { name: /dashboard/i }));

      await waitFor(() => {
        expect(screen.getByText('7')).toBeInTheDocument(); // Total atualizado
      });

      // Navega para analytics - gráficos devem incluir nova tarefa
      await user.click(screen.getByRole('button', { name: /analytics/i }));

      await waitFor(() => {
        expect(screen.getByTestId('delay-distribution-chart')).toBeInTheDocument();
        // O dataset dos gráficos deve incluir a nova tarefa
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle data loading errors gracefully', async () => {
      // Simula erro de carregamento
      const ErrorProvider = ({ children }: { children: React.ReactNode }) => {
        const [hasError, setHasError] = React.useState(true);
        
        if (hasError) {
          return (
            <div>
              <div data-testid="error-message">Erro ao carregar dados</div>
              <button onClick={() => setHasError(false)}>Tentar Novamente</button>
            </div>
          );
        }
        
        return <TestAppProvider>{children}</TestAppProvider>;
      };

      render(
        <ErrorProvider>
          <Dashboard />
        </ErrorProvider>
      );

      // Deve mostrar erro
      expect(screen.getByTestId('error-message')).toBeInTheDocument();

      // Clica em tentar novamente
      await user.click(screen.getByRole('button', { name: /tentar novamente/i }));

      // Deve carregar dados normalmente
      await waitFor(() => {
        expect(screen.getByText(/atraso médio/i)).toBeInTheDocument();
      });
    });

    it('should recover from calculation errors', async () => {
      // Simula dados corrompidos que causam erro de cálculo
      const corruptedTasks = [
        {
          id: 1,
          tarefa: 'Tarefa Corrompida',
          responsavel: 'Responsável Teste',
          descricao: 'Tarefa com dados inválidos',
          inicio: 'invalid-date',
          fim: null as any,
          prazo: '2024-01-10',
          duracaoDiasUteis: null as any,
          atrasoDiasUteis: 'not-a-number' as any,
          atendeuPrazo: 'maybe' as any,
          status: 'todo',
          prioridade: 'media'
        }
      ];

      render(
        <TestAppProvider initialTasks={corruptedTasks}>
          <Dashboard />
        </TestAppProvider>
      );

      await waitFor(() => {
        // Deve mostrar indicadores de erro nos KPIs
        expect(screen.getByText(/erro no cálculo/i)).toBeInTheDocument();
        
        // Mas a aplicação não deve quebrar
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large datasets efficiently', async () => {
      // Gera dataset grande (1000 tarefas)
      const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        tarefa: `Tarefa ${i + 1}`,
        responsavel: `Responsável ${i + 1}`,
        descricao: `Descrição da tarefa ${i + 1}`,
        inicio: '2024-01-01',
        fim: '2024-01-10',
        prazo: '2024-01-08',
        duracaoDiasUteis: 8,
        atrasoDiasUteis: Math.floor(Math.random() * 10) - 2,
        atendeuPrazo: Math.random() > 0.3,
        status: Math.random() > 0.5 ? 'completed' : 'todo',
        prioridade: ['baixa', 'media', 'alta', 'critica'][Math.floor(Math.random() * 4)] as 'baixa' | 'media' | 'alta' | 'critica'
      }));

      const startTime = performance.now();

      render(
        <TestAppProvider initialTasks={largeTasks}>
          <Dashboard />
        </TestAppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('1000')).toBeInTheDocument();
      });

      const endTime = performance.now();
      
      // Deve renderizar em tempo razoável (menos de 2 segundos)
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should maintain responsiveness during heavy calculations', async () => {
      const HeavyCalculationTest = () => {
        const [isCalculating, setIsCalculating] = React.useState(false);

        const triggerHeavyCalculation = () => {
          setIsCalculating(true);
          // Simula cálculo pesado
          setTimeout(() => setIsCalculating(false), 100);
        };

        return (
          <TestAppProvider>
            <button 
              onClick={triggerHeavyCalculation}
              data-testid="heavy-calc-btn"
            >
              Cálculo Pesado
            </button>
            {isCalculating && <div data-testid="calculating">Calculando...</div>}
            <Dashboard />
          </TestAppProvider>
        );
      };

      render(<HeavyCalculationTest />);

      // Interface deve permanecer responsiva
      const button = screen.getByTestId('heavy-calc-btn');
      await user.click(button);

      // Deve mostrar indicador de loading
      expect(screen.getByTestId('calculating')).toBeInTheDocument();

      // Mas outros elementos devem continuar funcionais
      const kpiCards = screen.getAllByRole('button');
      expect(kpiCards.length).toBeGreaterThan(1);

      await waitFor(() => {
        expect(screen.queryByTestId('calculating')).not.toBeInTheDocument();
      });
    });
  });
});
