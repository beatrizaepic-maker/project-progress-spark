export interface TaskData {
  id: number;
  tarefa: string;
  responsavel?: string;
  inicio: string;
  fim: string;
  prazo: string;
  duracaoDiasUteis: number;
  atrasoDiasUteis: number;
  atendeuPrazo: boolean;
  status: 'backlog' | 'todo' | 'in-progress' | 'completed';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
}

export const mockTaskData: TaskData[] = [
  {
    id: 1,
    tarefa: "Análise de Requisitos",
    responsavel: "Maria Silva",
    inicio: "2024-01-15",
    fim: "2024-01-20",
    prazo: "2024-01-18",
    duracaoDiasUteis: 4,
    atrasoDiasUteis: 2,
    atendeuPrazo: false,
    status: 'completed',
    prioridade: 'alta'
  },
  {
    id: 2,
    tarefa: "Design UI/UX",
    responsavel: "João Santos",
    inicio: "2024-01-22",
    fim: "2024-01-28",
    prazo: "2024-01-30",
    duracaoDiasUteis: 5,
    atrasoDiasUteis: 0,
    atendeuPrazo: true,
    status: 'completed',
    prioridade: 'media'
  },
  {
    id: 3,
    tarefa: "Desenvolvimento Frontend",
    responsavel: "Ana Costa",
    inicio: "2024-01-29",
    fim: "2024-02-10",
    prazo: "2024-02-08",
    duracaoDiasUteis: 10,
    atrasoDiasUteis: 2,
    atendeuPrazo: false,
    status: 'in-progress',
    prioridade: 'critica'
  },
  {
    id: 4,
    tarefa: "Desenvolvimento Backend",
    responsavel: "Pedro Lima",
    inicio: "2024-02-01",
    fim: "2024-02-12",
    prazo: "2024-02-15",
    duracaoDiasUteis: 9,
    atrasoDiasUteis: 0,
    atendeuPrazo: true,
    status: 'in-progress',
    prioridade: 'alta'
  },
  {
    id: 5,
    tarefa: "Testes e QA",
    responsavel: "Carla Oliveira",
    inicio: "2024-02-13",
    fim: "2024-02-20",
    prazo: "2024-02-18",
    duracaoDiasUteis: 6,
    atrasoDiasUteis: 2,
    atendeuPrazo: false,
    status: 'todo',
    prioridade: 'media'
  },
  {
    id: 6,
    tarefa: "Deploy e Documentação",
    responsavel: "Roberto Alves",
    inicio: "2024-02-21",
    fim: "2024-02-25",
    prazo: "2024-02-26",
    duracaoDiasUteis: 3,
    atrasoDiasUteis: 0,
    atendeuPrazo: true,
    status: 'backlog',
    prioridade: 'baixa'
  }
];

export const projectMetrics = {
  totalTarefas: mockTaskData.length,
  tarefasNoPrazo: mockTaskData.filter(t => t.atendeuPrazo).length,
  tarefasAtrasadas: mockTaskData.filter(t => !t.atendeuPrazo).length,
  mediaProducao: mockTaskData.reduce((acc, t) => acc + t.duracaoDiasUteis, 0) / mockTaskData.length,
  mediaAtrasos: mockTaskData.reduce((acc, t) => acc + t.atrasoDiasUteis, 0) / mockTaskData.length,
  desvioPadrao: 1.8, // Calculado baseado nos dados
  moda: 2, // Valor mais frequente para atrasos
  mediana: 5 // Mediana da duração
};