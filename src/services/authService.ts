/**
 * Serviço de Autenticação
 * Utiliza Supabase para autenticação e gerenciamento de usuários
 */

import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'dev';
  avatar?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

class AuthService {
  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));

    // Validação básica
    if (!email || !password) {
      return {
        success: false,
        error: 'E-mail e senha são obrigatórios'
      };
    }

    // Valida formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Formato de e-mail inválido'
      };
    }

    // Faz login com Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    if (data.user) {
      // Atualiza último acesso do usuário
      this.updateLastAccess(data.user.id);

      // Mapeia o usuário do Supabase para o nosso tipo
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || data.user.email || '',
        role: data.user.user_metadata?.role || 'user',
        firstName: data.user.user_metadata?.firstName,
        lastName: data.user.user_metadata?.lastName,
        position: data.user.user_metadata?.position,
        avatar: data.user.user_metadata?.avatar
      };

      return {
        success: true,
        user,
        token: data.session?.access_token || null
      };
    } else {
      return {
        success: false,
        error: 'Falha ao obter dados do usuário'
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error.message);
    }
  }

  // Verifica se está autenticado (versão assíncrona correta)
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session !== null && session.user !== null;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  // Método síncrono para compatibilidade (usa cache local)
  isAuthenticatedSync(): boolean {
    // Apenas retorna falso, pois o Supabase lida com a persistência de sessão
    // As operações de autenticação devem ser feitas assíncronamente via Supabase
    return false;
  }

  // Obtém usuário atual (versão assíncrona correta)
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        return null;
      }

      const user = session.user;
      return {
        id: user.id,
        email: user.email || '',
        name: (user.user_metadata as any)?.name || user.email || '',
        role: (user.user_metadata as any)?.role || 'user',
        firstName: (user.user_metadata as any)?.firstName,
        lastName: (user.user_metadata as any)?.lastName,
        position: (user.user_metadata as any)?.position,
        avatar: (user.user_metadata as any)?.avatar
      };
    } catch (error) {
      console.error('❌ Erro ao obter usuário atual:', error);
      return null;
    }
  }

  // Método síncrono para compatibilidade (usa cache local)
  getCurrentUserSync(): User | null {
    // Retorna null, pois o Supabase lida com a persistência de sessão
    // As operações de autenticação devem ser feitas assíncronamente via Supabase
    return null;
  }

  // Obtém token atual
  getToken(): string | null {
    try {
      // Obtém token do armazenamento local (mais rápido que getSession)
      const session = supabase.auth.getSession();
      
      // Nota: getSession() retorna uma Promise, mas para acesso síncrono
      // usamos o valor cacheado do listener
      return null; // Implementação segura: retorna null em acesso síncrono
    } catch (error) {
      return null;
    }
  }

  // Registra novo usuário
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Valida formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Formato de e-mail inválido'
      };
    }

    // Faz registro com Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          role: 'user'
        }
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    if (data.user) {
      // Mapeia o usuário do Supabase para o nosso tipo
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: name,
        role: 'user'
      };

      return {
        success: true,
        user
      };
    } else {
      return {
        success: false,
        error: 'Falha ao criar usuário'
      };
    }
  }

  // Atualiza perfil do usuário
  async updateProfile(userId: string, updates: Partial<User>): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Atualiza dados do usuário no Supabase
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    if (data.user) {
      const updatedUser: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: (data.user.user_metadata as any)?.name || data.user.email || '',
        role: (data.user.user_metadata as any)?.role || 'user',
        firstName: (data.user.user_metadata as any)?.firstName,
        lastName: (data.user.user_metadata as any)?.lastName,
        position: (data.user.user_metadata as any)?.position,
        avatar: (data.user.user_metadata as any)?.avatar
      };

      return {
        success: true,
        user: updatedUser
      };
    }

    return {
      success: false,
      error: 'Falha ao atualizar perfil'
    };
  }

  // Atualiza o último acesso do usuário
  private async updateLastAccess(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_access_log')
        .insert({
          user_id: userId,
          access_type: 'login',
          accessed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao atualizar último acesso:', error);
      }
    } catch (error) {
      console.error('Erro inesperado ao atualizar último acesso:', error);
    }
  }

  // Obtém o último acesso de um usuário
  async getLastAccess(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_access_log')
        .select('last_access')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao obter último acesso:', error);
        return null;
      }

      return data?.last_access || null;
    } catch (error) {
      console.error('Erro inesperado ao obter último acesso:', error);
      return null;
    }
  }

  // Obtém todos os logs de acesso
  async getAllLastAccess(): Promise<Record<string, string>> {
    try {
      const { data, error } = await supabase
        .from('user_access_log')
        .select('user_id, last_access');

      if (error) {
        console.error('Erro ao obter logs de acesso:', error);
        return {};
      }

      const accessLog: Record<string, string> = {};
      if (data) {
        data.forEach(item => {
          accessLog[item.user_id] = item.last_access;
        });
      }

      return accessLog;
    } catch (error) {
      console.error('Erro inesperado ao obter todos os logs de acesso:', error);
      return {};
    }
  }

  // Método assíncrono para obter o usuário atual do Supabase
  async getCurrentUserAsync(): Promise<User | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }

    if (session && session.user) {
      return {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.email || '',
        role: session.user.user_metadata?.role || 'user',
        firstName: session.user.user_metadata?.firstName,
        lastName: session.user.user_metadata?.lastName,
        position: session.user.user_metadata?.position,
        avatar: session.user.user_metadata?.avatar
      };
    }
    return null;
  }

  // Método para ouvir mudanças de estado de autenticação
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();

// Exportar também métodos específicos que podem ser usados externamente
export const getLastAccess = async (userId: string) => await authService.getLastAccess(userId);
export const getAllLastAccess = async () => await authService.getAllLastAccess();