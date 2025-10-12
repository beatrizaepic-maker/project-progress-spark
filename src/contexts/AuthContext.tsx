/**
 * Context de Autenticação
 * Gerencia o estado de autenticação da aplicação
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User, AuthResponse } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { addStreakAwardIfNeeded } from '@/config/streak';
import { addSimpleXpHistory } from '@/services/xpHistoryService';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<AuthResponse>;
  updateProfile: (updates: Partial<User>) => Promise<AuthResponse>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Verifica autenticação ao carregar
  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listener para mudanças no localStorage (para sincronizar dados entre abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'epic_user_data' && e.newValue) {
        try {
          const updatedUser = JSON.parse(e.newValue);
          setUser(updatedUser);
        } catch (error) {
          console.error('Erro ao sincronizar dados do usuário:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.user) {
        setUser(response.user);
        toast({
          title: "✅ Login realizado com sucesso!",
          description: `Bem-vindo, ${response.user.name}!`,
          className:
            "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
          duration: 3000,
        });

        // Bônus diário de streak (uma vez por dia)
        try {
          const res = addStreakAwardIfNeeded(response.user.id);
          if (res.awarded && res.xp > 0) {
            // Registrar no histórico de XP
            try {
              addSimpleXpHistory(response.user.id, res.xp, 'streak', 'Bônus diário de login (streak)');
            } catch {}
            toast({
              title: "🔥 Streak diário!",
              description: `Você ganhou +${res.xp} XP por seu login de hoje.`,
              className:
                "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
              duration: 3000,
            });
          }
        } catch {}
      } else {
        toast({
          title: "Erro no login",
          description: response.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = "Erro interno do servidor";
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const register = async (email: string, password: string, name: string): Promise<AuthResponse> => {
    setIsLoading(true);
    
    try {
      const response = await authService.register(email, password, name);
      
      if (response.success && response.user) {
        setUser(response.user);
        toast({
          title: "Cadastro realizado com sucesso!",
          description: `Bem-vindo, ${response.user.name}!`,
        });
      } else {
        toast({
          title: "Erro no cadastro",
          description: response.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = "Erro interno do servidor";
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<AuthResponse> => {
    if (!user) {
      return {
        success: false,
        error: 'Usuário não autenticado'
      };
    }

    setIsLoading(true);
    
    try {
      const response = await authService.updateProfile(user.id, updates);
      
      if (response.success && response.user) {
        setUser(response.user);
        toast({
          title: "✅ Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
          className:
            "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
          duration: 3000,
        });
      } else {
        toast({
          title: "Erro ao atualizar perfil",
          description: response.error || "Ocorreu um erro inesperado.",
          variant: "destructive",
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao atualizar perfil",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Método para recarregar dados do usuário do localStorage
  const refreshUser = () => {
    if (authService.isAuthenticated()) {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};