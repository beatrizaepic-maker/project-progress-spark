// src/services/localStorageData.ts
// Serviço centralizado para leitura e escrita de dados no localStorage
// Substitui todos os dados mock do projeto por dados persistidos no navegador

import { TaskData } from '@/data/projectData';
import { Task, User } from './gamificationService';
import { toOrderedRankingDTO, toPlayerProfileDTO } from './dtoTransformers';
import { RankingEntryDTO, PlayerProfileDTO } from '@/types/dto';

// Chaves de localStorage e versionamento
const STORAGE_KEYS = {
  TASKS_DATA: 'epic_tasks_data_v1',
  PROJECT_METRICS: 'epic_project_metrics_v1',
  USERS: 'epic_users_v1',
  GAMIFICATION_TASKS: 'epic_gamification_tasks_v1',
  STORAGE_VERSION: 'epic_storage_version_v1',
};

// Versão atual do schema
const CURRENT_SCHEMA_VERSION = 1;

// Dados iniciais para usar como fallback se não houver nada no localStorage (sem mocks)
const DEFAULT_TASKS_DATA: TaskData[] = [];

// Dados iniciais para métricas do projeto
const DEFAULT_PROJECT_METRICS = {
  totalTarefas: 0,
  tarefasNoPrazo: 0,
  tarefasAtrasadas: 0,
  mediaProducao: 0,
  mediaAtrasos: 0,
  desvioPadrao: 0,
  moda: 0,
  mediana: 0
};

// Não utilizar usuários fictícios: users derivam do DB de auth (epic_users_db)
const DEFAULT_USERS: User[] = [];

// Dados iniciais para tarefas do sistema de gamificação
const DEFAULT_GAMIFICATION_TASKS: Task[] = [];

/**
 * Migração segura para remover tarefas mock legadas do armazenamento local
 * Remove apenas o conjunto EXATO das 3 tarefas de demonstração conhecidas
 */
function purgeLegacyMockTasksIfPresent(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS_DATA);
    if (!raw) return;
    const tasks: TaskData[] = JSON.parse(raw);
    if (!Array.isArray(tasks) || tasks.length === 0) return;

    // Verifica se as 3 tarefas mock conhecidas estão presentes com as mesmas características
    const isLegacySet = tasks.length === 3 && [
      { tarefa: 'Análise de Requisitos', responsavel: 'Maria Silva' },
      { tarefa: 'Design UI/UX', responsavel: 'João Santos' },
      { tarefa: 'Desenvolvimento Frontend', responsavel: 'Ana Costa' }
    ].every(sample => tasks.some(t => t.tarefa === sample.tarefa && t.responsavel === sample.responsavel));

    if (isLegacySet) {
      // Limpa completamente as tarefas e métricas associadas
      localStorage.setItem(STORAGE_KEYS.TASKS_DATA, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PROJECT_METRICS, JSON.stringify(DEFAULT_PROJECT_METRICS));
    }
  } catch (err) {
    console.warn('Falha ao purgar tarefas mock legadas:', err);
  }
}

// ----- Leitura canônica dos usuários do sistema (Auth DB) -----
type AuthDBUser = {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'user' | 'dev' | string;
  avatar?: string;
};

const AUTH_USERS_DB_KEY = 'epic_users_db';

function readAuthUsersDB(): AuthDBUser[] {
  try {
    const raw = localStorage.getItem(AUTH_USERS_DB_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapAuthToGamificationUsers(authUsers: AuthDBUser[]): User[] {
  return authUsers.map(u => ({
    id: u.id,
    name: u.name || u.email,
    avatar: u.avatar || '/avatars/default.png',
    xp: 0,
    level: 1,
    weeklyXp: 0,
    monthlyXp: 0,
    missionsCompleted: 0,
    consistencyBonus: 0,
    streak: 0,
  }));
}

// Inicializa o localStorage com versão e dados mínimos se necessário
export function initializeLocalStorage(): void {
  // Verifica se já existe uma versão armazenada
  const storedVersion = localStorage.getItem(STORAGE_KEYS.STORAGE_VERSION);
  
  // Se não existe ou a versão é menor que a atual, inicializa com valores padrão
  if (!storedVersion || parseInt(storedVersion) < CURRENT_SCHEMA_VERSION) {
    // Salva a versão atual
    localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, CURRENT_SCHEMA_VERSION.toString());
    
    // Inicializa com valores padrão apenas se não existirem dados
    if (!localStorage.getItem(STORAGE_KEYS.TASKS_DATA)) {
      // Não semear dados fictícios; inicia vazio
      localStorage.setItem(STORAGE_KEYS.TASKS_DATA, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.PROJECT_METRICS)) {
      localStorage.setItem(STORAGE_KEYS.PROJECT_METRICS, JSON.stringify(DEFAULT_PROJECT_METRICS));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      // Semear usuários de gamificação a partir do DB de autenticação (quando existir)
      const authUsers = readAuthUsersDB();
      const seed = mapAuthToGamificationUsers(authUsers);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seed));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.GAMIFICATION_TASKS)) {
      localStorage.setItem(STORAGE_KEYS.GAMIFICATION_TASKS, JSON.stringify(DEFAULT_GAMIFICATION_TASKS));
    }
  }

  // Purgar tarefas mock legadas se existirem
  purgeLegacyMockTasksIfPresent();

  // Migração: se ainda houver apenas "Usuário Demo", substituir por usuários do Auth DB
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    const current: User[] = raw ? JSON.parse(raw) : [];
    const onlyDemo = current.length === 1 && current[0]?.name === 'Usuário Demo';
    const authUsers = readAuthUsersDB();
    if ((onlyDemo || current.length === 0) && authUsers.length > 0) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mapAuthToGamificationUsers(authUsers)));
    }
  } catch {
    // ignore erros de migração
  }
}

// Funções para gerenciar tarefas (DataContext, componentes UI)

export function getTasksData(): TaskData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS_DATA);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar tarefas do localStorage:', error);
    return [];
  }
}

export function saveTasksData(tasks: TaskData[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS_DATA, JSON.stringify(tasks));
    // Atualiza também as métricas calculadas
    updateProjectMetrics(tasks);
    // Notifica outras páginas/abas e provedores para recarregar as tarefas
    try {
      window.dispatchEvent(new CustomEvent('tasks:changed'));
    } catch {}
  } catch (error) {
    console.error('Erro ao salvar tarefas no localStorage:', error);
  }
}

export function addTaskData(task: TaskData): void {
  const tasks = getTasksData();
  tasks.push(task);
  saveTasksData(tasks);
}

export function updateTaskData(id: number, updates: Partial<TaskData>): void {
  const tasks = getTasksData();
  const index = tasks.findIndex(t => t.id === id);
  
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    saveTasksData(tasks);
  }
}

export function deleteTaskData(id: number): void {
  const tasks = getTasksData();
  const filteredTasks = tasks.filter(t => t.id !== id);
  saveTasksData(filteredTasks);
}

// Funções para métricas de projeto

export function getProjectMetrics() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECT_METRICS);
    return data ? JSON.parse(data) : DEFAULT_PROJECT_METRICS;
  } catch (error) {
    console.error('Erro ao carregar métricas do localStorage:', error);
    return DEFAULT_PROJECT_METRICS;
  }
}

export function updateProjectMetrics(tasks: TaskData[]): void {
  // Cálculo básico de métricas a partir das tarefas
  const totalTarefas = tasks.length;
  const tarefasNoPrazo = tasks.filter(t => t.atendeuPrazo).length;
  const tarefasAtrasadas = tasks.filter(t => !t.atendeuPrazo).length;
  
  const duracoes = tasks.map(t => t.duracaoDiasUteis).filter(d => !isNaN(d));
  const atrasos = tasks.map(t => t.atrasoDiasUteis).filter(d => !isNaN(d));
  
  const mediaProducao = duracoes.length > 0 
    ? duracoes.reduce((sum, d) => sum + d, 0) / duracoes.length 
    : 0;
    
  const mediaAtrasos = atrasos.length > 0 
    ? atrasos.reduce((sum, d) => sum + d, 0) / atrasos.length 
    : 0;
  
  // Valores predefinidos para estatísticas mais complexas
  // Em uma implementação completa, estas seriam calculadas dinamicamente
  const desvioPadrao = 1.8;
  const moda = 2;
  const mediana = 5;
  
  const metrics = {
    totalTarefas,
    tarefasNoPrazo,
    tarefasAtrasadas,
    mediaProducao,
    mediaAtrasos,
    desvioPadrao,
    moda,
    mediana
  };
  
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECT_METRICS, JSON.stringify(metrics));
  } catch (error) {
    console.error('Erro ao salvar métricas no localStorage:', error);
  }
}

// Funções para o sistema de gamificação (perfis, ranking)

export function getGamificationUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    const parsed: User[] = data ? JSON.parse(data) : [];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    // Fallback canônico: derivar do Auth DB sem criar mocks
    const auth = readAuthUsersDB();
    return mapAuthToGamificationUsers(auth);
  } catch (error) {
    console.error('Erro ao carregar usuários do localStorage:', error);
    return [];
  }
}

export function saveGamificationUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Erro ao salvar usuários no localStorage:', error);
  }
}

export function getGamificationTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GAMIFICATION_TASKS);
    return data ? JSON.parse(data) : DEFAULT_GAMIFICATION_TASKS;
  } catch (error) {
    console.error('Erro ao carregar tarefas de gamificação do localStorage:', error);
    return DEFAULT_GAMIFICATION_TASKS;
  }
}

export function saveGamificationTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GAMIFICATION_TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Erro ao salvar tarefas de gamificação no localStorage:', error);
  }
}

// Mock API service simulados com dados do localStorage

export async function fetchRanking(): Promise<RankingEntryDTO[]> {
  // Simula latência de rede
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const users = getGamificationUsers();
  const tasks = getGamificationTasks();
  
  // Usa a mesma lógica de transformação do mockApi original
  return toOrderedRankingDTO(users, tasks);
}

export async function fetchPlayerProfile(userId: string): Promise<PlayerProfileDTO | null> {
  // Simula latência de rede
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const users = getGamificationUsers();
  const tasks = getGamificationTasks();
  
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  
  // Usa a mesma lógica de transformação do mockApi original
  return toPlayerProfileDTO(user, tasks);
}

export function seedMockData(users: User[], tasks: Task[]): void {
  saveGamificationUsers(users);
  saveGamificationTasks(tasks);
}

// API para obter os usuários canônicos do sistema (Auth DB)
export function getSystemUsers(): Array<{ id: string; name: string; email: string; role?: string; avatar?: string }> {
  const authUsers = readAuthUsersDB();
  return authUsers.map(u => ({ id: u.id, name: u.name || u.email, email: u.email, role: u.role, avatar: u.avatar }));
}

// Inicializa o localStorage na importação do módulo
initializeLocalStorage();