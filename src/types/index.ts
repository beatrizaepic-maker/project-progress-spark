export type UserRole = 'admin' | 'dev' | 'manager' | 'user';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  avatar?: string;
  name?: string;
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  season?: string;
  completed_at?: string;
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
  category?: string;
}

export interface DataQuality {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  overall: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

export interface Player {
  id: string;
  name: string;
  role: UserRole;
  score: number;
  tasksCompleted: number;
  avatar?: string;
}
