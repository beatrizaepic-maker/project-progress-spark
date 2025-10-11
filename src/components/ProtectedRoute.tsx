/**
 * Componente de Rota Protegida
 * Redireciona para login se o usuário não estiver autenticado
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'manager';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Normaliza papel do usuário
  const normalizedRole = String((user as any)?.role || '').toLowerCase() as 'admin' | 'dev' | 'user' | 'manager' | '';
  const effectiveRole: 'admin' | 'dev' | 'user' | 'manager' =
    (['admin', 'dev', 'user', 'manager'] as const).includes(normalizedRole as any)
      ? (normalizedRole as any)
      : 'user';
  const pathname = location.pathname;

  // Regras de acesso por papel
  const isUserAllowedPath = (path: string) => {
    // Usuário (player) pode acessar apenas: /tasks, /ranking, /profile/*
    return (
      path === '/tasks' ||
      path.startsWith('/tasks/') ||
      path === '/ranking' ||
      path.startsWith('/ranking/') ||
      path === '/profile' ||
      path.startsWith('/profile/')
    );
  };

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redireciona para login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica requisito explícito de papel
  if (requireRole) {
    // 'admin' exige admin ou dev; 'manager' permite admin/dev/manager
    const allowed = requireRole === 'admin' ? ['admin', 'dev'] : ['admin', 'dev', 'manager'];
    if (!allowed.includes(normalizedRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">Acesso restrito</h2>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      );
    }
  }

  // Regras padrão: usuários comuns não podem acessar páginas fora da lista
  if (!requireRole && effectiveRole === 'user' && !isUserAllowedPath(pathname)) {
    return <Navigate to="/tasks" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;