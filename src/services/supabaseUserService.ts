import { supabase } from '@/lib/supabase';
import { User } from '@/services/authService';

// Interface para o histórico de acesso do usuário
interface UserAccessLog {
  user_id: string;
  last_access: string;
}

// Interface para o perfil do usuário no sistema de gamificação
interface UserGamificationProfile {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  weeklyXp: number;
  monthlyXp: number;
  missionsCompleted: number;
  consistencyBonus: number;
  streak: number;
}

// Função para obter todos os usuários do sistema do Supabase
export async function getSystemUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, avatar')
      .order('email', { ascending: true });

    if (error) {
      console.error('Erro ao buscar usuários do Supabase:', error);
      // Retorna um array vazio em caso de erro, mas poderia lançar o erro dependendo da estratégia
      return [];
    }

    if (!data) {
      return [];
    }

    // Mapeia os dados do banco para o formato User
    return data.map((user: any) => ({
      id: user.id,
      email: user.email || '',
      name: user.email || '',
      role: user.role || 'user',
      avatar: user.avatar
    }));
  } catch (error) {
    console.error('Erro ao processar dados de usuários do Supabase:', error);
    return [];
  }
}

// Função para obter os usuários de gamificação do Supabase
export async function getGamificationUsers(): Promise<UserGamificationProfile[]> {
  try {
    const { data, error } = await supabase
      .from('user_gamification_profiles')
      .select('*')
      .order('level', { ascending: false })
      .order('xp', { ascending: false });

    if (error) {
      console.error('Erro ao buscar perfis de gamificação do Supabase:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Mapeia os dados do banco para o formato UserGamificationProfile
    return data.map((profile: any) => ({
      id: profile.id,
      name: profile.name || '',
      avatar: profile.avatar || '/avatars/default.png',
      xp: profile.xp || 0,
      level: profile.level || 1,
      weeklyXp: profile.weekly_xp || 0,
      monthlyXp: profile.monthly_xp || 0,
      missionsCompleted: profile.missions_completed || 0,
      consistencyBonus: profile.consistency_bonus || 0,
      streak: profile.streak || 0
    }));
  } catch (error) {
    console.error('Erro ao processar dados de gamificação do Supabase:', error);
    return [];
  }
}

// Função para salvar/atualizar os perfis de gamificação no Supabase
export async function saveGamificationUsers(users: UserGamificationProfile[]): Promise<void> {
  try {
    // Prepara os dados para o formato do banco de dados
    const profiles = users.map((user) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      xp: user.xp,
      level: user.level,
      weekly_xp: user.weeklyXp,
      monthly_xp: user.monthlyXp,
      missions_completed: user.missionsCompleted,
      consistency_bonus: user.consistencyBonus,
      streak: user.streak,
      updated_at: new Date().toISOString()
    }));

    // Faz upsert dos perfis no Supabase
    const { error } = await supabase
      .from('user_gamification_profiles')
      .upsert(profiles, { onConflict: 'id' });

    if (error) {
      console.error('Erro ao salvar perfis de gamificação no Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar perfis de gamificação no Supabase:', error);
    throw error;
  }
}

// Função para obter os dados do usuário atual logado do Supabase Auth
export async function getCurrentUserData(): Promise<User | null> {
  try {
    // Obtemos o usuário autenticado via Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    // Buscamos os dados completos do usuário na tabela users
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, avatar')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar dados completos do usuário do Supabase:', error);
      // Retorna um objeto de usuário básico baseado no auth se não encontrar no banco
      return {
        id: user.id,
        email: user.email || '',
        name: user.email || user.id,
        role: 'user'
      };
    }
    
    if (!data) {
      // Usuário não encontrado na tabela users, retorna info básica
      return {
        id: user.id,
        email: user.email || '',
        name: user.email || user.id,
        role: 'user'
      };
    }
    
    return {
      id: data.id,
      email: data.email || '',
      name: data.email || '',
      role: data.role || 'user',
      avatar: data.avatar
    };
  } catch (error) {
    console.error('Erro ao obter dados do usuário do Supabase:', error);
    return null;
  }
}

// Função para salvar/atualizar os dados do usuário atual logado no Supabase
export async function saveCurrentUserData(user: User): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (error) {
      console.error('Erro ao salvar dados do usuário no Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar dados do usuário no Supabase:', error);
    throw error;
  }
}

// Função para mapear nome de usuário para ID usando Supabase
export async function resolveUserIdByName(name?: string): Promise<string | undefined> {
  if (!name) return undefined;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .ilike('email', `%${name}%`)  // Busca parcial pelo e-mail (coluna garantida)
      .single();

    if (error) {
      console.error('Erro ao resolver ID do usuário por nome:', error);
      return undefined;
    }

    return data?.id;
  } catch (error) {
    console.error('Erro na requisição para resolver ID do usuário por nome:', error);
    return undefined;
  }
}

// Função para atualizar o último acesso de um usuário no Supabase
export async function updateLastAccess(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_access_log')
      .upsert({
        user_id: userId,
        last_access: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Erro ao atualizar último acesso no Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar último acesso no Supabase:', error);
    throw error;
  }
}

// Função para obter o último acesso de um usuário do Supabase
export async function getLastAccess(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('user_access_log')
      .select('last_access')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Erro ao obter último acesso do Supabase:', error);
      return null;
    }

    return data?.last_access || null;
  } catch (error) {
    console.error('Erro na requisição para obter último acesso do Supabase:', error);
    return null;
  }
}

// Função para obter todos os logs de acesso do Supabase
export async function getAllLastAccess(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from('user_access_log')
      .select('user_id, last_access');

    if (error) {
      console.error('Erro ao obter todos os logs de acesso do Supabase:', error);
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
    console.error('Erro na requisição para obter todos os logs de acesso do Supabase:', error);
    return {};
  }
}