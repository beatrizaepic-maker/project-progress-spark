import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw, Database, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const UserDataDebug: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [supabaseUsers, setSupabaseUsers] = useState<any[]>([]);

  const loadSupabaseData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')  // Assumindo que temos uma tabela 'users' no Supabase
        .select('*');

      if (error) {
        console.error('Erro ao carregar dados do Supabase:', error);
        setSupabaseUsers([]);
      } else {
        setSupabaseUsers(data || []);
      }
    } catch (error) {
      console.error('Erro na requisição do Supabase:', error);
      setSupabaseUsers([]);
    }
  };

  useEffect(() => {
    loadSupabaseData();
  }, [user]);

  const handleRefresh = async () => {
    await refreshUser();
    loadSupabaseData();
  };

  const clearStorage = () => {
    // Limpar apenas dados de debug do localStorage, não os relacionados à autenticação
    console.log('Limpeza de localStorage removida - usando apenas Supabase');
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
              Limpar Dados
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

          {/* Mensagem indicando que localStorage não é mais usado */}
          <div>
            <h4 className="font-semibold mb-2">
              LocalStorage
              <Badge variant="destructive" className="ml-2">
                Não utilizado
              </Badge>
            </h4>
            <div className="bg-muted p-3 rounded text-sm">
              <p>localStorage não é mais utilizado. Todos os dados são gerenciados pelo Supabase.</p>
            </div>
          </div>

          {/* Usuários do Supabase */}
          <div>
            <h4 className="font-semibold mb-2">
              Supabase - users table
              <Badge variant="outline" className="ml-2">
                {supabaseUsers.length} usuários
              </Badge>
            </h4>
            <div className="bg-muted p-3 rounded text-sm max-h-40 overflow-y-auto">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(supabaseUsers, null, 2)}
              </pre>
            </div>
          </div>

          {/* Verificação de consistência apenas com dados do contexto */}
          <div>
            <h4 className="font-semibold mb-2">Verificação de Consistência</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={user ? "default" : "destructive"}>
                  {user ? "✓" : "✗"}
                </Badge>
                <span className="text-sm">Usuário autenticado</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDataDebug;