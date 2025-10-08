import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  User, 
  Sparkles, 
  TrendingUp, 
  Calendar,
  Award,
  Activity,
  Target,
  RefreshCw
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  calculateLevelFromXp,
  getLevelProgress,
  calculateConsistencyBonus,
  updateRanking,
  Task,
  User as UserType
} from '@/services/gamificationService';
import { 
  createWeeklyMissionsForUser, 
  processWeeklyMissions,
  ActiveMission 
} from '@/services/missionService';

// Tipos para o sistema de gameficação
interface UserRanking {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  position: number;
  weeklyXp: number;
  monthlyXp: number;
  missionsCompleted: number;
  consistencyBonus: number;
  streak: number;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  deadline: string;
}

interface XpHistory {
  date: string;
  xp: number;
  source: string; // 'task', 'mission', 'bonus', 'penalty'
  description: string;
}

interface PerformanceDetails {
  userId: string;
  userName: string;
  xpHistory: XpHistory[];
  missions: Mission[];
  consistencyBonus: number;
  penalties: number;
  currentStreak: number;
  bestStreak: number;
}

// Componente principal da página de ranking
const RankingPage: React.FC = () => {
  const [allUsers, setAllUsers] = useState<UserRanking[]>([]);
  const [selectedUser, setSelectedUser] = useState<PerformanceDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Simula dados de tarefas recentes (em uma aplicação real, isso viria de uma API)
  const [recentTasks, setRecentTasks] = useState<Task[]>([
    {
      id: 't1',
      title: 'Relatório Mensal',
      status: 'completed',
      completedDate: new Date(Date.now() - 86400000).toISOString(), // Ontem
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      assignedTo: '1',
      completedEarly: true
    },
    {
      id: 't2',
      title: 'Reunião de Planejamento',
      status: 'completed',
      completedDate: new Date().toISOString(), // Hoje
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      assignedTo: '2'
    },
    {
      id: 't3',
      title: 'Revisão de Tarefa de Ana',
      status: 'completed',
      completedDate: new Date(Date.now() - 172800000).toISOString(), // Anteontem
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      assignedTo: '3',
      completedEarly: true
    }
  ]);

  // Função para atualizar os dados do ranking
  const updateRankingData = useCallback(() => {
    setIsLoading(true);
    
    // Simula carregamento de dados atualizados
    setTimeout(() => {
      const mockUsers: UserRanking[] = [
        {
          id: '1',
          name: 'João Silva',
          avatar: '/avatars/user1.png',
          xp: 2450,
          level: 5,
          position: 1,
          weeklyXp: 340,
          monthlyXp: 1200,
          missionsCompleted: 8,
          consistencyBonus: 50,
          streak: 12
        },
        {
          id: '2',
          name: 'Maria Oliveira',
          avatar: '/avatars/user2.png',
          xp: 2100,
          level: 4,
          position: 2,
          weeklyXp: 290,
          monthlyXp: 980,
          missionsCompleted: 6,
          consistencyBonus: 30,
          streak: 8
        },
        {
          id: '3',
          name: 'Carlos Souza',
          avatar: '/avatars/user3.png',
          xp: 1950,
          level: 4,
          position: 3,
          weeklyXp: 270,
          monthlyXp: 870,
          missionsCompleted: 7,
          consistencyBonus: 40,
          streak: 10
        },
        {
          id: '4',
          name: 'Ana Costa',
          avatar: '/avatars/user4.png',
          xp: 1750,
          level: 3,
          position: 4,
          weeklyXp: 210,
          monthlyXp: 750,
          missionsCompleted: 5,
          consistencyBonus: 20,
          streak: 5
        },
        {
          id: '5',
          name: 'Pedro Santos',
          avatar: '/avatars/user5.png',
          xp: 1600,
          level: 3,
          position: 5,
          weeklyXp: 190,
          monthlyXp: 680,
          missionsCompleted: 4,
          consistencyBonus: 15,
          streak: 3
        }
      ];
      
      // Atualiza o ranking com base nas tarefas recentes
      const updatedUsers = updateRanking(mockUsers as UserType[], recentTasks);
      
      setAllUsers(updatedUsers.map(user => ({
        ...user,
        weeklyXp: user.weeklyXp || 0,
        monthlyXp: user.monthlyXp || 0,
        missionsCompleted: user.missionsCompleted || 0,
        consistencyBonus: user.consistencyBonus || 0,
        streak: user.streak || 0
      } as UserRanking)));
      
      setLastUpdated(new Date().toLocaleTimeString('pt-BR'));
      setIsLoading(false);
    }, 800);
  }, [recentTasks]);

  // Carrega os dados iniciais
  useEffect(() => {
    updateRankingData();
  }, [updateRankingData]);
  
  // Configura atualização automática a cada 5 minutos se a página estiver ativa
  useEffect(() => {
    const interval = setInterval(() => {
      // Simula atualização automática apenas se a página estiver visível
      if (!document.hidden) {
        updateRankingData();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [updateRankingData]);

  // Calcula o ranking baseado na aba ativa (semanal ou mensal)
  const rankingData = useMemo(() => {
    return [...allUsers]
      .map(user => ({
        ...user,
        level: calculateLevelFromXp(user.xp) // Atualiza o nível com base no XP total
      }))
      .sort((a, b) => {
        // Ordena primeiro pelo XP relevante para o período
        const xpA = activeTab === 'weekly' ? a.weeklyXp : a.monthlyXp;
        const xpB = activeTab === 'weekly' ? b.weeklyXp : b.monthlyXp;
        
        // Se XP for igual, ordena pelo XP total
        if (xpB === xpA) {
          return b.xp - a.xp;
        }
        return xpB - xpA;
      })
      .map((user, index) => ({
        ...user,
        position: index + 1
      }));
  }, [allUsers, activeTab]);

  const handleUserClick = (user: UserRanking) => {
    // Simular carregamento de detalhes do usuário
    const mockDetails: PerformanceDetails = {
      userId: user.id,
      userName: user.name,
      xpHistory: [
        { date: '2023-05-01', xp: 10, source: 'task', description: 'Tarefa finalizada: Relatório Mensal' },
        { date: '2023-05-02', xp: 5, source: 'task', description: 'Tarefa finalizada: Análise de Dados' },
        { date: '2023-05-03', xp: 10, source: 'mission', description: 'Missão semanal completada: Entregar 3 tarefas' },
        { date: '2023-05-04', xp: 20, source: 'bonus', description: 'Bônus de consistência (5 dias seguidos)' },
        { date: '2023-05-05', xp: -5, source: 'penalty', description: 'Penalização por atraso em tarefa' },
        { date: '2023-05-06', xp: 10, source: 'task', description: 'Tarefa finalizada: Atualização de Relatório' },
      ],
      missions: [
        {
          id: 'm1',
          title: 'Entregar 3 tarefas adiantadas',
          description: 'Complete 3 tarefas antes do prazo para ganhar XP extra',
          xpReward: 20,
          completed: true,
          deadline: '2023-05-10'
        },
        {
          id: 'm2',
          title: 'Participar de 5 reuniões',
          description: 'Participe de 5 reuniões semanais para ganhar XP extra',
          xpReward: 15,
          completed: false,
          deadline: '2023-05-12'
        },
        {
          id: 'm3',
          title: 'Revisar 10 tarefas de colegas',
          description: 'Revise e forneça feedback para 10 tarefas de colegas',
          xpReward: 25,
          completed: false,
          deadline: '2023-05-15'
        }
      ],
      consistencyBonus: user.consistencyBonus,
      penalties: 5,
      currentStreak: user.streak,
      bestStreak: 15
    };
    
    setSelectedUser(mockDetails);
  };

  // Função para mostrar ícone de posição
  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (position === 2) return <Trophy className="h-5 w-5 text-gray-300" />;
    if (position === 3) return <Trophy className="h-5 w-5 text-amber-700" />;
    return <Trophy className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Trophy className="text-primary" />
              Ranking de Gamificação
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualize o desempenho dos usuários baseado em pontos de experiência (XP)
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Atualizado: {lastUpdated || 'Agora mesmo'}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={updateRankingData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Seletor de período */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'weekly' ? 'default' : 'outline'}
          onClick={() => setActiveTab('weekly')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Semanal
        </Button>
        <Button
          variant={activeTab === 'monthly' ? 'default' : 'outline'}
          onClick={() => setActiveTab('monthly')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Mensal
        </Button>
      </div>

      {/* Estatísticas resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de XP</p>
              <p className="text-xl font-bold">12,450</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-secondary/10 to-accent/10 border-secondary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <Target className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Missões Completas</p>
              <p className="text-xl font-bold">24</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Activity className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maior Sequência</p>
              <p className="text-xl font-bold">15 dias</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              <p className="text-xl font-bold">28</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de ranking */}
      <Card className="bg-card border-border">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="text-primary" />
            Classificação Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando ranking...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-16 text-center">Posição</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-center">Nível</TableHead>
                  <TableHead className="text-center">XP Total</TableHead>
                  <TableHead className="text-center">{activeTab === 'weekly' ? 'XP Semanal' : 'XP Mensal'}</TableHead>
                  <TableHead className="text-center">Missões</TableHead>
                  <TableHead className="text-center">Sequência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="border-border hover:bg-accent/10 cursor-pointer transition-colors"
                    onClick={() => handleUserClick(user)}
                  >
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {getPositionIcon(user.position)}
                        <span className="ml-1 font-bold">{user.position}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-accent">
                            <User className="h-5 w-5 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                        {user.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold text-primary">
                      {user.xp} XP
                    </TableCell>
                    <TableCell className="text-center text-foreground">
                      <div className="flex justify-center items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        {activeTab === 'weekly' ? user.weeklyXp : user.monthlyXp}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="border-accent text-accent">
                        {user.missionsCompleted}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-1 text-orange-500">
                        <Activity className="h-4 w-4" />
                        {user.streak}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes do usuário */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        {selectedUser && (
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-foreground">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser.userId.includes('1') ? '/avatars/user1.png' : selectedUser.userId.includes('2') ? '/avatars/user2.png' : '/avatars/user3.png'} />
                  <AvatarFallback className="bg-accent">
                    <User className="h-6 w-6 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-2xl font-bold">{selectedUser.userName}</div>
                  <div className="text-sm text-muted-foreground">Detalhes de desempenho</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estatísticas do usuário */}
              <div className="space-y-4">
                <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Sparkles className="text-primary" /> Estatísticas
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nível Atual:</span>
                        <span className="font-medium">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">XP Total:</span>
                        <span className="font-medium text-primary">2450 XP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sequência Atual:</span>
                        <span className="font-medium text-orange-500">12 dias</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Melhor Sequência:</span>
                        <span className="font-medium text-orange-500">15 dias</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bônus de Consistência:</span>
                        <span className="font-medium text-green-500">+{selectedUser.consistencyBonus} XP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Penalizações:</span>
                        <span className="font-medium text-red-500">-{selectedUser.penalties} XP</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Target className="text-secondary" /> Missões Semanais
                    </h3>
                    <div className="space-y-3">
                      {selectedUser.missions.map((mission) => (
                        <div 
                          key={mission.id} 
                          className={`p-3 rounded-lg border ${mission.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-accent/10 border-border'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className={`font-medium ${mission.completed ? 'text-green-500' : 'text-foreground'}`}>
                                {mission.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">{mission.description}</p>
                            </div>
                            <Badge variant={mission.completed ? 'default' : 'outline'}>
                              {mission.completed ? 'Concluída' : 'Ativa'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-primary font-medium">+{mission.xpReward} XP</span>
                            <span className="text-xs text-muted-foreground">Prazo: {mission.deadline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Histórico de XP */}
              <div className="space-y-4">
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Activity className="text-accent" /> Histórico de XP
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {selectedUser.xpHistory.map((entry, index) => (
                        <div 
                          key={index} 
                          className="p-3 rounded-lg border border-border bg-accent/5"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-foreground">{entry.description}</h4>
                              <p className="text-xs text-muted-foreground">{entry.date}</p>
                            </div>
                            <div className={`text-right ${entry.xp > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              <div className={`font-bold ${entry.xp > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {entry.xp > 0 ? '+' : ''}{entry.xp} XP
                              </div>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {entry.source === 'task' && 'Tarefa'}
                                {entry.source === 'mission' && 'Missão'}
                                {entry.source === 'bonus' && 'Bônus'}
                                {entry.source === 'penalty' && 'Penalização'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default RankingPage;