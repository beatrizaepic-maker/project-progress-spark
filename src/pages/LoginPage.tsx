import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LivingNebulaShader from '@/components/effects/LivingNebulaShader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login - apenas para fins de demonstração
    if (email && password) {
      toast({
        title: "Login realizado!",
        description: "Você está sendo redirecionado para o dashboard.",
      });
    } else {
      toast({
        title: "Erro no login",
        description: "Por favor, verifique seu e-mail e senha.",
        variant: "destructive",
      });
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
        <Card className="w-full border-0 bg-card/90 backdrop-blur-lg shadow-2xl border border-border/50">
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
              Bem-vindo ao Epic Board
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Faça login para acessar sua conta
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
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
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold px-4 py-6 rounded-none transition-colors shadow-lg hover:from-[#FF0066]/80 hover:to-[#C8008F]/80 hover:shadow-xl transform hover:scale-105 border-0"
              >
                Entrar
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <Link 
                  to="/"
                  className="text-primary font-medium hover:underline underline-offset-4"
                >
                  Cadastre-se
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;