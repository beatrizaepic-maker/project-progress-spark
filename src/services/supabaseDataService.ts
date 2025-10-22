import { supabase } from '@/lib/supabase';
import { TaskData } from '@/data/projectData';

// Interface para representar os dados de tarefa
interface TaskDataDB {
  id: number;
  tarefa: string;
  responsavel: string;
  userId?: string;
  inicio: string;
  fim: string;
  prazo: string;
  status: string;
  duracaoDiasUteis: number;
  atrasoDiasUteis: number;
  atendeuPrazo: boolean;
  projeto: string;
  departamento: string;
  prioridade: string;
  tipo: string;
}

// Função para buscar as tarefas do Supabase
export async function getTasksData(): Promise<TaskData[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Erro ao buscar tarefas do Supabase:', error);
      // Retorna um array vazio em caso de erro
      return [];
    }

    if (!data) {
      return [];
    }

    // Mapeia os dados do banco para o formato TaskData
    return data.map((task: any) => ({
      id: task.id,
      tarefa: task.tarefa || '',
      responsavel: task.responsavel || '',
      userId: task.userId,
      inicio: task.inicio || '',
      fim: task.fim || '',
      prazo: task.prazo || '',
      status: task.status || 'pending',
      duracaoDiasUteis: task.duracaoDiasUteis || 0,
      atrasoDiasUteis: task.atrasoDiasUteis || 0,
      atendeuPrazo: task.atendeuPrazo || false,
      projeto: task.projeto || 'Projeto Padrão',
      departamento: task.departamento || 'Departamento Padrão',
      prioridade: task.prioridade || 'Média',
      tipo: task.tipo || 'Desenvolvimento'
    }));
  } catch (error) {
    console.error('Erro ao processar dados de tarefas do Supabase:', error);
    return [];
  }
}

// Função para salvar tarefas no Supabase
export async function saveTasksData(tasks: TaskData[]): Promise<void> {
  try {
    // Converte as tarefas para o formato compatível com o banco de dados
    const tasksDB = tasks.map((task) => ({
      id: task.id,
      tarefa: task.tarefa,
      responsavel: task.responsavel,
      userId: task.userId,
      inicio: task.inicio,
      fim: task.fim,
      prazo: task.prazo,
      status: task.status,
      duracaoDiasUteis: task.duracaoDiasUteis,
      atrasoDiasUteis: task.atrasoDiasUteis,
      atendeuPrazo: task.atendeuPrazo,
      projeto: task.projeto,
      departamento: task.departamento,
      prioridade: task.prioridade,
      tipo: task.tipo
    }));

    // Primeiro, limpa todas as tarefas existentes
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .gt('id', 0); // Exclui todas as tarefas

    if (deleteError) {
      console.error('Erro ao limpar tarefas existentes:', deleteError);
      throw deleteError;
    }

    // Em seguida, insere todas as novas tarefas
    const { error: insertError } = await supabase
      .from('tasks')
      .insert(tasksDB);

    if (insertError) {
      console.error('Erro ao inserir tarefas no Supabase:', insertError);
      throw insertError;
    }
  } catch (error) {
    console.error('Erro ao salvar tarefas no Supabase:', error);
    throw error;
  }
}

// Função para adicionar uma nova tarefa
export async function addTaskData(task: TaskData): Promise<void> {
  try {
    const taskDB = {
      id: task.id,
      tarefa: task.tarefa,
      responsavel: task.responsavel,
      userId: task.userId,
      inicio: task.inicio,
      fim: task.fim,
      prazo: task.prazo,
      status: task.status,
      duracaoDiasUteis: task.duracaoDiasUteis,
      atrasoDiasUteis: task.atrasoDiasUteis,
      atendeuPrazo: task.atendeuPrazo,
      projeto: task.projeto,
      departamento: task.departamento,
      prioridade: task.prioridade,
      tipo: task.tipo
    };

    const { error } = await supabase
      .from('tasks')
      .insert([taskDB]);

    if (error) {
      console.error('Erro ao adicionar tarefa no Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao adicionar tarefa no Supabase:', error);
    throw error;
  }
}

// Função para atualizar uma tarefa existente
export async function updateTaskData(id: number, updates: Partial<TaskData>): Promise<void> {
  try {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar tarefa no Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar tarefa no Supabase:', error);
    throw error;
  }
}

// Função para deletar uma tarefa
export async function deleteTaskData(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar tarefa no Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar tarefa no Supabase:', error);
    throw error;
  }
}