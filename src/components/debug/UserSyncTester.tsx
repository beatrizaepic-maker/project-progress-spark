import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useSyncedUser } from '@/hooks/useSyncedUser';
import { getUserDisplayName, getUserFullName, getUserAvatar } from '@/utils/userSync';
import { RefreshCw, CheckCircle, User, TestTube } from 'lucide-react';

const UserSyncTester: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { profileData, forceSync } = useSyncedUser({
    onUserChange: (data) => {
      console.log('Usuário atualizado:', data);
    }
  });

  const [testName, setTestName] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const addTestResult = (result: string, success: boolean = true) => {
    const timestamp = new Date().toLocaleTimeString();
    const status = success ? '✅' : '❌';
    setTestResults(prev => [...prev, `[${timestamp}] ${status} ${result}`]);
  };

  const runSyncTest = async () => {
    setIsRunningTest(true);
    setTestResults([]);
    
    try {
      addTestResult('Iniciando teste de sincronização...');
      
      // Teste 1: Verificar dados atuais
      addTestResult(`Usuário atual: ${getUserFullName(user)}`);
      addTestResult(`Nome de exibição: ${getUserDisplayName(user)}`);
      addTestResult(`Avatar: ${getUserAvatar(user)}`);
      
      // Teste 2: Alterar nome temporariamente
      const originalName = user?.name;
      const testName = `Teste Sync ${Date.now()}`;
      
      addTestResult(`Alterando nome para: ${testName}`);
      
      const response = await updateProfile({ name: testName });
      
      if (response.success) {
        addTestResult('Perfil atualizado no contexto');
        
        // Aguarda um pouco para propagação
        setTimeout(() => {
          // Verifica se mudanças foram aplicadas
          const currentDisplayName = getUserDisplayName(response.user);
          addTestResult(`Novo nome de exibição: ${currentDisplayName}`);
          
          // Força sincronização
          forceSync();
          addTestResult('Sincronização forçada executada');
          
          // Restaura nome original
          setTimeout(async () => {
            if (originalName) {
              await updateProfile({ name: originalName });
              addTestResult(`Nome restaurado para: ${originalName}`);
            }
            setIsRunningTest(false);
          }, 2000);
          
        }, 1000);
        
      } else {
        addTestResult('Erro ao atualizar perfil', false);
        setIsRunningTest(false);
      }
      
    } catch (error) {
      addTestResult(`Erro no teste: ${error}`, false);
      setIsRunningTest(false);
    }
  };

  const testQuickChange = async () => {
    if (!testName.trim()) return;
    
    setIsRunningTest(true);
    addTestResult(`Teste rápido: alterando nome para "${testName}"`);
    
    try {
      const response = await updateProfile({ name: testName });
      if (response.success) {
        addTestResult('Alteração aplicada com sucesso');
        forceSync();
        addTestResult('Dados sincronizados em todos os componentes');
      } else {
        addTestResult('Erro na alteração', false);
      }
    } catch (error) {
      addTestResult(`Erro: ${error}`, false);
    }
    
    setIsRunningTest(false);
    setTestName('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Testador de Sincronização de Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações atuais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-semibold">Nome Completo</Label>
              <p className="text-sm bg-muted p-2 rounded">{getUserFullName(user)}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold">Nome de Exibição</Label>
              <p className="text-sm bg-muted p-2 rounded">{getUserDisplayName(user)}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold">Status de Sincronização</Label>
              <Badge variant={profileData ? "default" : "destructive"}>
                {profileData ? "Sincronizado" : "Não sincronizado"}
              </Badge>
            </div>
          </div>

          {/* Controles de teste */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="testName">Teste de Nome</Label>
              <Input
                id="testName"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Digite um nome para testar..."
                disabled={isRunningTest}
              />
            </div>
            <Button 
              onClick={testQuickChange}
              disabled={isRunningTest || !testName.trim()}
              variant="outline"
            >
              <User className="h-4 w-4 mr-2" />
              Aplicar
            </Button>
          </div>

          {/* Botões de teste */}
          <div className="flex gap-2">
            <Button 
              onClick={runSyncTest}
              disabled={isRunningTest}
              className="flex-1"
            >
              {isRunningTest ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Executar Teste Completo
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setTestResults([])}
              disabled={isRunningTest}
            >
              Limpar Log
            </Button>
          </div>

          {/* Resultados dos testes */}
          {testResults.length > 0 && (
            <div>
              <Label className="text-sm font-semibold">Log de Testes</Label>
              <div className="bg-black text-green-400 p-3 rounded font-mono text-xs max-h-40 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSyncTester;