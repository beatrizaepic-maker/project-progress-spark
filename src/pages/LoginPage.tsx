import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LivingNebulaShader from '@/components/effects/LivingNebulaShader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await login(email, password);
    
    if (response.success) {
      // Redirecionamento será feito pelo useEffect acima
      navigate('/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await register(email, password, name);

    if (response.success) {
      navigate('/dashboard');
    }
  };

  const toggleMode = (target: 'login' | 'register') => {
    setMode(target);
    setEmail('');
    setPassword('');
    setName('');
    if (target === 'register') {
      setRememberMe(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Efeito de fundo com o shader do header */}
      <div className="absolute inset-0 z-0">
        <LivingNebulaShader />
      </div>
      
      {/* Overlay para melhor contraste com o conteúdo do login */}
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none"></div>
      
      {/* Card de login */}
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="w-full bg-card/90 backdrop-blur-lg shadow-2xl border border-border/50">
          <CardHeader className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20 rounded-lg">
                <img
                  src="/LOGOEPIC.png"
                  alt="EPIC Logo"
                  className="h-12 w-12 object-contain"
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {mode === 'login' ? 'Bem-vindo ao EPIC Space' : 'Crie sua conta EPIC Space'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {mode === 'login'
                ? 'Faça login para acessar sua conta'
                : 'Preencha os dados para criar uma nova conta'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            <CardContent className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-muted-foreground">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-border focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              
              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 border-border rounded focus:ring-primary"
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                      Lembrar-me
                    </Label>
                  </div>
                  
                  <Link 
                    to="/"
                    className="text-sm font-medium text-primary hover:underline underline-offset-4"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold px-4 py-6 rounded-none transition-colors shadow-lg hover:from-[#FF0066]/80 hover:to-[#C8008F]/80 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'login' ? 'Entrando...' : 'Criando conta...'}
                  </>
                ) : (
                  mode === 'login' ? 'Entrar' : 'Criar conta'
                )}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                {mode === 'login' ? (
                  <>
                    Não tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => toggleMode('register')}
                      className="text-primary font-medium hover:underline underline-offset-4"
                    >
                      Cadastre-se
                    </button>
                  </>
                ) : (
                  <>
                    Já possui uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => toggleMode('login')}
                      className="text-primary font-medium hover:underline underline-offset-4"
                    >
                      Fazer login
                    </button>
                  </>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;