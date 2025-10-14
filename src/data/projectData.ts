export interface TaskData {
  id: number;
  tarefa: string;
  responsavel?: string;
  userId?: string; // ID único do usuário responsável
  descricao?: string;
  inicio: string;
  fim?: string; // Campo opcional
  prazo: string;
  duracaoDiasUteis: number;
  atrasoDiasUteis: number;
  atendeuPrazo: boolean;
  status: 'backlog' | 'todo' | 'in-progress' | 'completed' | 'refacao';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
}