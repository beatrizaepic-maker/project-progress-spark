/**
 * Serviço de Autenticação
 * Simula autenticação usando localStorage
 */

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
  private readonly STORAGE_KEYS = {
    TOKEN: 'epic_auth_token',
    USER: 'epic_user_data',
    USERS_DB: 'epic_users_db'
  };

  // Simula um banco de usuários
  private initializeUsersDB(): User[] {
    const existingDB = localStorage.getItem(this.STORAGE_KEYS.USERS_DB);
    if (existingDB) {
      return JSON.parse(existingDB);
    }

    // Usuários padrão para demonstração
    const defaultUsers: User[] = [
      {
        id: '1',
        email: 'admin@epic.com',
        name: 'Administrador',
        firstName: 'Admin',
        lastName: 'Sistema',
        role: 'admin',
        position: 'Administrador do Sistema',
        avatar: '/avatars/admin.png'
      },
      {
        id: '2',
        email: 'user@epic.com',
        name: 'João Silva',
        firstName: 'João',
        lastName: 'Silva',
        role: 'user',
        position: 'Desenvolvedor Sênior',
        avatar: '/avatars/user1.png'
      },
      {
        id: '3',
        email: 'gabriel@epic.com',
        name: 'Gabriel Santos',
        firstName: 'Gabriel',
        lastName: 'Santos',
        role: 'dev',
        position: 'Tech Lead',
        avatar: '/avatars/gabriel.png'
      }
    ];

    localStorage.setItem(this.STORAGE_KEYS.USERS_DB, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  // Simula validação de credenciais
  private validateCredentials(email: string, password: string): User | null {
    const users = this.initializeUsersDB();
    
    // Simula validação de senha (em produção seria hash)
    const validPasswords: Record<string, string> = {
      'admin@epic.com': '123456',
      'user@epic.com': '123456',
      'gabriel@epic.com': '123456'
    };

    if (validPasswords[email] === password) {
      return users.find(user => user.email === email) || null;
    }

    return null;
  }

  // Gera token JWT simulado
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    };

    // Em produção seria um JWT real
    return btoa(JSON.stringify(payload));
  }

  // Valida token
  private validateToken(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token));
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  }

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

    // Valida credenciais
    const user = this.validateCredentials(email, password);
    if (!user) {
      return {
        success: false,
        error: 'Credenciais inválidas. Verifique seu e-mail e senha.'
      };
    }

    // Gera token
    const token = this.generateToken(user);

    // Atualiza último acesso do usuário
    this.updateLastAccess(user.id);

    // Salva no localStorage
    localStorage.setItem(this.STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));

    return {
      success: true,
      user,
      token
    };
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.USER);
  }

  // Verifica se está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.STORAGE_KEYS.TOKEN);
    return token ? this.validateToken(token) : false;
  }

  // Obtém usuário atual
  getCurrentUser(): User | null {
    if (!this.isAuthenticated()) return null;
    
    const userData = localStorage.getItem(this.STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  }

  // Obtém token atual
  getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.TOKEN);
  }

  // Registra novo usuário (simulado)
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = this.initializeUsersDB();
    
    // Verifica se usuário já existe
    if (users.find(user => user.email === email)) {
      return {
        success: false,
        error: 'E-mail já está em uso'
      };
    }

    // Cria novo usuário
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'user'
    };

    users.push(newUser);
    localStorage.setItem(this.STORAGE_KEYS.USERS_DB, JSON.stringify(users));

    // Faz login automaticamente
    return this.login(email, password);
  }

  // Atualiza perfil do usuário
  async updateProfile(userId: string, updates: Partial<User>): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.initializeUsersDB();
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return {
        success: false,
        error: 'Usuário não encontrado'
      };
    }

    // Atualiza dados do usuário
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem(this.STORAGE_KEYS.USERS_DB, JSON.stringify(users));

    // Atualiza dados locais se for o usuário atual
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = users[userIndex];
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      return {
        success: true,
        user: updatedUser
      };
    }

    return {
      success: true,
      user: users[userIndex]
    };
  }

  // Atualiza o último acesso do usuário
  private updateLastAccess(userId: string): void {
    const accessLogKey = 'epic_access_log';
    const currentAccessLog = this.getAccessLog();
    
    // Atualiza o último acesso para o usuário
    currentAccessLog[userId] = new Date().toISOString();
    
    // Salva o log atualizado
    localStorage.setItem(accessLogKey, JSON.stringify(currentAccessLog));
  }

  // Obtém o log de acessos
  private getAccessLog = (): Record<string, string> => {
    const accessLogKey = 'epic_access_log';
    const stored = localStorage.getItem(accessLogKey);
    return stored ? JSON.parse(stored) : {};
  }

  // Obtém o último acesso de um usuário
  getLastAccess = (userId: string): string | null => {
    const accessLog = this.getAccessLog();
    return accessLog[userId] || null;
  }

  // Obtém todos os logs de acesso
  getAllLastAccess = (): Record<string, string> => {
    return this.getAccessLog();
  }
}

export const authService = new AuthService();

// Exportar também métodos específicos que podem ser usados externamente
export const getLastAccess = (userId: string) => authService.getLastAccess(userId);
export const getAllLastAccess = () => authService.getAllLastAccess();