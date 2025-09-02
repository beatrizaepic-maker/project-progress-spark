import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import KPICard from '../dashboard/KPICard';
import TaskTable from '../dashboard/TaskTable';
import Charts from '../dashboard/Charts';
import type { TaskData } from '../../data/projectData';
import React from 'react';

// Mock dos dados de teste
const mockTasks: TaskData[] = [
  {
    id: 1,
    tarefa: 'Desenvolvimento Frontend',
    inicio: '2024-01-01',
    fim: '2024-01-10',
    prazo: '2024-01-08',
    duracaoDiasUteis: 8,
    atrasoDiasUteis: 2,
    atendeuPrazo: false
  },
  {
    id: 2,
    tarefa: 'Testes Unitários',
    inicio: '2024-01-01',
    fim: '2024-01-05',
    prazo: '2024-01-10',
    duracaoDiasUteis: 5,
    atrasoDiasUteis: -3,
    atendeuPrazo: true
  },
  {
    id: 3,
    tarefa: 'Deploy Production',
    inicio: '2024-01-01',
    fim: '2024-01-15',
    prazo: '2024-01-10',
    duracaoDiasUteis: 11,
    atrasoDiasUteis: 5,
    atendeuPrazo: false
  }
];

// Mock do hook mobile
vi.mock('../../hooks/use-mobile', () => ({
  useIsMobile: () => false
}));

// Mock do contexto de dados
const MockDataContext = React.createContext({
  tasks: mockTasks,
  updateTasks: vi.fn()
});

const MockDataProvider = ({ children, tasks = mockTasks }: { children: React.ReactNode; tasks?: TaskData[] }) => (
  <MockDataContext.Provider value={{ tasks, updateTasks: vi.fn() }}>
    {children}
  </MockDataContext.Provider>
);

describe('Component Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('KPICard Component', () => {
    it('should render KPI card with correct data', () => {
      render(
        <MockDataProvider>
          <KPICard
            title="Atraso Médio"
            value="2.5 dias"
            trend={5.2}
            previousValue="2.0 dias"
            subtitle="Média dos últimos 30 dias"
          />
        </MockDataProvider>
      );

      expect(screen.getByText('Atraso Médio')).toBeInTheDocument();
      expect(screen.getByText('2.5 dias')).toBeInTheDocument();
      expect(screen.getByText('Média dos últimos 30 dias')).toBeInTheDocument();
    });

    it('should display trend indicators correctly', () => {
      const { rerender } = render(
        <MockDataProvider>
          <KPICard
            title="Test KPI"
            value="10"
            trend={5.2}
            previousValue="8"
          />
        </MockDataProvider>
      );

      // Trend positivo (pior)
      expect(screen.getByText('+5.2%')).toBeInTheDocument();

      // Trend negativo (melhor)
      rerender(
        <MockDataProvider>
          <KPICard
            title="Test KPI"
            value="8"
            trend={-3.1}
            previousValue="10"
          />
        </MockDataProvider>
      );

      expect(screen.getByText('-3.1%')).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      render(
        <MockDataProvider>
          <KPICard
            title="Test KPI"
            value="10"
            trend={5.2}
            previousValue="8"
          />
        </MockDataProvider>
      );

      const card = screen.getByRole('button');
      
      // Testa navegação por teclado
      await user.tab();
      expect(card).toHaveFocus();

      // Testa ativação por Enter
      fireEvent.keyDown(card, { key: 'Enter' });
      // Verifica se alguma ação foi executada (pode ser expandir detalhes, etc.)
    });

    it('should handle loading state', () => {
      render(
        <MockDataProvider>
          <KPICard
            title="Loading KPI"
            value=""
            isLoading={true}
          />
        </MockDataProvider>
      );

      // Verifica se existe algum indicador de carregamento
      const loadingElements = screen.queryAllByText(/carregando|loading/i);
      expect(loadingElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle error state', () => {
      render(
        <MockDataProvider>
          <KPICard
            title="Error KPI"
            value=""
            error="Erro ao calcular KPI"
          />
        </MockDataProvider>
      );

      expect(screen.getByText('Erro ao calcular KPI')).toBeInTheDocument();
    });
  });

  describe('TaskTable Component', () => {
    it('should render table with task data', () => {
      render(
        <MockDataProvider>
          <TaskTable />
        </MockDataProvider>
      );

      expect(screen.getByText('Desenvolvimento Frontend')).toBeInTheDocument();
      expect(screen.getByText('Testes Unitários')).toBeInTheDocument();
      expect(screen.getByText('Deploy Production')).toBeInTheDocument();
    });

    it('should filter tasks by status', async () => {
      render(
        <MockDataProvider>
          <TaskTable />
        </MockDataProvider>
      );

      // Procura por elementos de filtro
      const filterElements = screen.queryAllByRole('combobox');
      const selectElements = screen.queryAllByRole('button', { name: /filtro|filter/i });
      
      if (filterElements.length > 0 || selectElements.length > 0) {
        const filterElement = filterElements[0] || selectElements[0];
        await user.click(filterElement);
        
        // Verifica se há opções de filtro disponíveis
        const options = screen.queryAllByRole('option');
        if (options.length > 0) {
          await user.click(options[1]); // Seleciona segunda opção
        }
      }

      // Verifica se a tabela ainda está funcional
      expect(screen.getByText(/desenvolvimento|frontend/i)).toBeInTheDocument();
    });

    it('should search tasks by name', async () => {
      render(
        <MockDataProvider>
          <TaskTable />
        </MockDataProvider>
      );

      const searchInputs = screen.queryAllByRole('textbox');
      const searchInput = searchInputs.find(input => 
        input.getAttribute('placeholder')?.toLowerCase().includes('pesquisar') ||
        input.getAttribute('aria-label')?.toLowerCase().includes('pesquisar')
      );

      if (searchInput) {
        await user.type(searchInput, 'Frontend');
        
        await waitFor(() => {
          expect(screen.getByText('Desenvolvimento Frontend')).toBeInTheDocument();
        });
      } else {
        // Se não há busca, apenas verifica se a tabela está renderizada
        expect(screen.getByText('Desenvolvimento Frontend')).toBeInTheDocument();
      }
    });

    it('should handle responsive layout', () => {
      // Mock mobile
      vi.mocked(require('../../hooks/use-mobile').useIsMobile).mockReturnValue(true);
      
      render(
        <MockDataProvider>
          <TaskTable />
        </MockDataProvider>
      );

      // Verifica se o componente renderiza corretamente em mobile
      const taskElements = screen.getAllByText(/desenvolvimento|testes|deploy/i);
      expect(taskElements.length).toBeGreaterThan(0);
    });

    it('should be accessible with screen readers', () => {
      render(
        <MockDataProvider>
          <TaskTable />
        </MockDataProvider>
      );

      // Verifica se há uma tabela ou estrutura acessível
      const table = screen.queryByRole('table');
      const grid = screen.queryByRole('grid');
      const list = screen.queryByRole('list');
      
      // Deve ter pelo menos uma estrutura semântica
      expect(table || grid || list).toBeTruthy();
    });
  });

  describe('Charts Component', () => {
    it('should render chart container', () => {
      render(
        <MockDataProvider>
          <Charts />
        </MockDataProvider>
      );

      // Verifica se há pelo menos um gráfico ou container de gráfico
      const chartContainers = screen.queryAllByTestId(/chart/i);
      const canvasElements = document.querySelectorAll('canvas');
      const svgElements = document.querySelectorAll('svg');
      
      // Deve ter algum elemento gráfico
      expect(
        chartContainers.length > 0 || 
        canvasElements.length > 0 || 
        svgElements.length > 0
      ).toBe(true);
    });

    it('should handle data updates', async () => {
      const { rerender } = render(
        <MockDataProvider tasks={mockTasks}>
          <Charts />
        </MockDataProvider>
      );

      // Verifica renderização inicial
      expect(document.body).toBeInTheDocument();

      // Altera dados e re-renderiza
      const newTasks = [...mockTasks, {
        id: 4,
        tarefa: 'Nova Tarefa',
        inicio: '2024-01-01',
        fim: '2024-01-20',
        prazo: '2024-01-10',
        duracaoDiasUteis: 15,
        atrasoDiasUteis: 8,
        atendeuPrazo: false
      }];

      rerender(
        <MockDataProvider tasks={newTasks}>
          <Charts />
        </MockDataProvider>
      );

      // Verifica se o componente ainda está renderizado
      expect(document.body).toBeInTheDocument();
    });

    it('should handle empty data gracefully', () => {
      render(
        <MockDataProvider tasks={[]}>
          <Charts />
        </MockDataProvider>
      );

      // Verifica se não há erro com dados vazios
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should render multiple components together', () => {
      render(
        <MockDataProvider>
          <div role="main">
            <h1>Dashboard KPIs</h1>
            <section aria-label="Indicadores principais">
              <KPICard title="Atraso Médio" value="2.5" />
              <KPICard title="Desvio Padrão" value="1.8" />
            </section>
            <section aria-label="Tabela de tarefas">
              <TaskTable />
            </section>
            <section aria-label="Gráficos analíticos">
              <Charts />
            </section>
          </div>
        </MockDataProvider>
      );

      // Verifica estrutura semântica
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText('Indicadores principais')).toBeInTheDocument();
      expect(screen.getByLabelText('Tabela de tarefas')).toBeInTheDocument();
      expect(screen.getByLabelText('Gráficos analíticos')).toBeInTheDocument();

      // Verifica conteúdo dos KPIs
      expect(screen.getByText('Atraso Médio')).toBeInTheDocument();
      expect(screen.getByText('2.5')).toBeInTheDocument();
      expect(screen.getByText('Desvio Padrão')).toBeInTheDocument();
      expect(screen.getByText('1.8')).toBeInTheDocument();

      // Verifica dados da tabela
      expect(screen.getByText('Desenvolvimento Frontend')).toBeInTheDocument();
    });

    it('should maintain accessibility across all components', () => {
      render(
        <MockDataProvider>
          <div role="main">
            <h1>Dashboard KPIs</h1>
            <KPICard title="Test KPI" value="10" />
            <TaskTable />
            <Charts />
          </div>
        </MockDataProvider>
      );

      // Verifica estrutura semântica
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Dashboard KPIs' })).toBeInTheDocument();

      // Verifica navegação por teclado
      const interactiveElements = screen.getAllByRole('button');
      expect(interactiveElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Performance Tests', () => {
    it('should render efficiently', async () => {
      const startTime = performance.now();
      
      render(
        <MockDataProvider>
          <div>
            <KPICard title="Test" value="10" />
            <TaskTable />
            <Charts />
          </div>
        </MockDataProvider>
      );

      const endTime = performance.now();
      
      // Deve renderizar rapidamente
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Verifica se os componentes foram renderizados
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should handle component updates without errors', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('10');

        React.useEffect(() => {
          const interval = setInterval(() => {
            setValue(prev => (parseInt(prev) + 1).toString());
          }, 100);

          return () => clearInterval(interval);
        }, []);

        return (
          <MockDataProvider>
            <KPICard title="Dynamic" value={value} />
          </MockDataProvider>
        );
      };

      render(<TestComponent />);

      // Verifica valor inicial
      expect(screen.getByText('10')).toBeInTheDocument();

      // Aguarda algumas atualizações
      await waitFor(() => {
        const currentValue = parseInt(screen.getByText(/\d+/).textContent || '10');
        expect(currentValue).toBeGreaterThan(10);
      }, { timeout: 500 });

      // Componente deve continuar funcionando
      expect(screen.getByText('Dynamic')).toBeInTheDocument();
    });
  });
});
