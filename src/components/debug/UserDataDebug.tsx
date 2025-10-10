import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw, Database, User } from 'lucide-react';

const UserDataDebug: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const loadLocalStorageData = () => {
    try {
      // Dados do usuário atual
      const userData = localStorage.getItem('epic_user_data');
      setLocalStorageData(userData ? JSON.parse(userData) : null);

      // Todos os usuários no "banco"
      const usersDB = localStorage.getItem('epic_users_db');
      setAllUsers(usersDB ? JSON.parse(usersDB) : []);
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
    }
  };

  useEffect(() => {
    loadLocalStorageData();
  }, [user]);

  const handleRefresh = () => {
    refreshUser();
    loadLocalStorageData();
  };

  const clearStorage = () => {
    localStorage.removeItem('epic_user_data');
    localStorage.removeItem('epic_users_db');
    localStorage.removeItem('epic_auth_token');
    loadLocalStorageData();
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Debug: Dados de Persistência
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="destructive" size="sm" onClick={clearStorage}>
              Limpar Storage
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dados do usuário atual (contexto) */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Usuário Atual (Contexto)
            </h4>
            <div className="bg-muted p-3 rounded text-sm">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>

          {/* Dados do localStorage */}
          <div>
            <h4 className="font-semibold mb-2">
              LocalStorage - epic_user_data
              <Badge variant={localStorageData ? "default" : "destructive"} className="ml-2">
                {localStorageData ? "Dados Salvos" : "Sem Dados"}
              </Badge>
            </h4>
            <div className="bg-muted p-3 rounded text-sm">
              <pre className="whitespace-pre-wrap">
                {localStorageData ? JSON.stringify(localStorageData, null, 2) : "Nenhum dado salvo"}
              </pre>
            </div>
          </div>

          {/* Todos os usuários */}
          <div>
            <h4 className="font-semibold mb-2">
              LocalStorage - epic_users_db
              <Badge variant="outline" className="ml-2">
                {allUsers.length} usuários
              </Badge>
            </h4>
            <div className="bg-muted p-3 rounded text-sm max-h-40 overflow-y-auto">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(allUsers, null, 2)}
              </pre>
            </div>
          </div>

          {/* Verificação de consistência */}
          <div>
            <h4 className="font-semibold mb-2">Verificação de Consistência</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={user && localStorageData && user.id === localStorageData.id ? "default" : "destructive"}>
                  {user && localStorageData && user.id === localStorageData.id ? "✓" : "✗"}
                </Badge>
                <span className="text-sm">IDs correspondentes</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={user && localStorageData && user.name === localStorageData.name ? "default" : "destructive"}>
                  {user && localStorageData && user.name === localStorageData.name ? "✓" : "✗"}
                </Badge>
                <span className="text-sm">Nomes correspondentes</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={user && localStorageData && user.avatar === localStorageData.avatar ? "default" : "destructive"}>
                  {user && localStorageData && user.avatar === localStorageData.avatar ? "✓" : "✗"}
                </Badge>
                <span className="text-sm">Avatares correspondentes</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={user && localStorageData && user.firstName === localStorageData.firstName ? "default" : "destructive"}>
                  {user && localStorageData && user.firstName === localStorageData.firstName ? "✓" : "✗"}
                </Badge>
                <span className="text-sm">Primeiros nomes correspondentes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDataDebug;