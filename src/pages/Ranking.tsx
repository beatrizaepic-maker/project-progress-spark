import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import User from 'lucide-react/dist/esm/icons/user';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Award from 'lucide-react/dist/esm/icons/award';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Target from 'lucide-react/dist/esm/icons/target';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Download from 'lucide-react/dist/esm/icons/download';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
// Usando localStorage para persistência dos dados
import { fetchRanking } from '@/services/localStorageData';
import { getUserXpHistory } from '@/services/xpHistoryService';

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
  totalXp?: number; // Campo opcional para XP total calculado
}

// Componente principal da página de ranking
const RankingPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<UserRanking[]>([]);
  const [selectedUser, setSelectedUser] = useState<PerformanceDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const [recentTasks, setRecentTasks] = useState<Task[]>([]);

  // Função para atualizar os dados do ranking
  const updateRankingData = useCallback(() => {
    setIsLoading(true);
    // Primeiro tenta backend real
    fetch('http://localhost:3001/api/ranking')
      .then(r => r.json())
      .then((dto: any[]) => {
        if (Array.isArray(dto) && dto.length) {
          setAllUsers(dto.map(u => ({ ...u, position: 0 })) as unknown as UserRanking[]);
          setLastUpdated(new Date().toLocaleTimeString('pt-BR'));
          setIsLoading(false);
          return;
        }
        throw new Error('empty');
      })
      .catch(() => {
        // Busca dados do ranking via localStorage
        fetchRanking()
          .then(dto => {
            setAllUsers(dto.map(u => ({ ...u, position: 0 })) as unknown as UserRanking[]);
          })
          .catch(() => {
            // Fallback caso haja algum problema com o localStorage
            // Usando array vazio como fallback seguro, já que updateRanking pode lidar com array vazio
            const updatedUsers = updateRanking([], recentTasks);
            setAllUsers(updatedUsers as unknown as UserRanking[]);
          })
          .finally(() => {
            setLastUpdated(new Date().toLocaleTimeString('pt-BR'));
            setIsLoading(false);
          });
      });
  }, [recentTasks, user]);

  // Carrega os dados iniciais
  useEffect(() => {
    updateRankingData();
  }, [updateRankingData]);
  
  // Configura atualização automática e ouve eventos SSE do backend
  useEffect(() => {
    // SSE
    let evtSource: EventSource | null = null;
    try {
      evtSource = new EventSource('http://localhost:3001/api/events');
      evtSource.addEventListener('ranking:update', () => updateRankingData());
    } catch {}

    const interval = setInterval(() => {
      // Simula atualização automática apenas se a página estiver visível
      if (!document.hidden) {
        updateRankingData();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      clearInterval(interval);
      try { evtSource?.close(); } catch {}
    };
  }, [updateRankingData]);

  // Reagir imediatamente a alterações de tarefas (salvas no localStorage)
  useEffect(() => {
    const onTasksChanged = () => updateRankingData();
    window.addEventListener('tasks:changed', onTasksChanged);
    return () => window.removeEventListener('tasks:changed', onTasksChanged);
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

  // Utilitário de data
  const nowLabel = () => new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  // Exportar CSV (cliente) usando os dados atuais
  const handleExportCSV = () => {
    try {
      const sep = ',';
      const header = [
        'Posição','Nome','XP Total','Nível','XP Semanal','XP Mensal','Missões Concluídas','Bônus Consistência','Streak'
      ];
      const rows = (rankingData.length ? rankingData : allUsers).map(u => [
        String(u.position ?? ''),
        `"${u.name ?? ''}"`,
        String(u.xp ?? 0),
        String(u.level ?? ''),
        String(u.weeklyXp ?? 0),
        String(u.monthlyXp ?? 0),
        String(u.missionsCompleted ?? 0),
        String(u.consistencyBonus ?? 0),
        String(u.streak ?? 0)
      ]);
      const csv = [header.join(sep), ...rows.map(r => r.join(sep))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ranking-${activeTab}-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erro ao exportar CSV do ranking:', e);
    }
  };

  // Exportar PDF (cliente) com jsPDF + autoTable
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const period = activeTab === 'weekly' ? 'Semanal' : 'Mensal';
      // Título
      doc.setFontSize(16);
      doc.text('Ranking de Gamificação', 14, 18);
      doc.setFontSize(11);
      doc.text(`Período: ${period}`, 14, 26);
      doc.text(`Gerado em: ${nowLabel()}`, 14, 32);

      // Tabela
      const data = (rankingData.length ? rankingData : allUsers).map(u => ([
        u.position ?? '',
        u.name ?? '',
        u.xp ?? 0,
        u.level ?? '',
        u.weeklyXp ?? 0,
        u.monthlyXp ?? 0,
        u.missionsCompleted ?? 0,
        u.consistencyBonus ?? 0,
        u.streak ?? 0
      ]));

      autoTable(doc, {
        head: [[
          'Posição','Nome','XP Total','Nível','XP Semanal','XP Mensal','Missões','Bônus Consistência','Streak'
        ]],
        body: data,
        startY: 40,
        headStyles: { fillColor: [139, 92, 246] },
        styles: { fontSize: 9 },
      });

      doc.save(`ranking-${activeTab}-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      console.error('Erro ao exportar PDF do ranking:', e);
    }
  };

  const handleUserClick = (clicked: UserRanking) => {
    // Regra: para perfil "user/player", só pode abrir o card do próprio usuário
    const role = String((user as any)?.role || '').toLowerCase();
    const isPlayer = role === 'user' || role === 'player';
    const isSelf = (user?.id ?? '') === clicked.id;
    if (isPlayer && !isSelf) {
      toast({
        title: 'Acesso restrito',
        description: 'Você só pode visualizar os seus próprios detalhes.',
        variant: 'destructive',
      });
      return;
    }
    // Buscar detalhes reais do usuário via API
    fetch(`http://localhost:3001/api/users/${clicked.id}/details`)
      .then(response => response.json())
      .then((userData: PerformanceDetails) => {
        // Mesclar histórico local e garantir totalXp do ranking
        const localHist = getUserXpHistory(clicked.id);
        const mergedHistory = Array.isArray(userData.xpHistory) && userData.xpHistory.length
          ? [...userData.xpHistory, ...localHist]
          : localHist;
        setSelectedUser({
          ...userData,
          userId: clicked.id,
          userName: clicked.name,
          xpHistory: mergedHistory,
          consistencyBonus: clicked.consistencyBonus,
          currentStreak: clicked.streak,
          bestStreak: userData.bestStreak ?? clicked.streak,
          totalXp: clicked.xp,
        });
      })
      .catch(() => {
        // Fallback com dados mínimos baseados no usuário clicado
        const hist = getUserXpHistory(clicked.id);
        setSelectedUser({
          userId: clicked.id,
          userName: clicked.name,
          xpHistory: hist,
          missions: [],
          consistencyBonus: clicked.consistencyBonus,
          penalties: 0,
          currentStreak: clicked.streak,
          bestStreak: clicked.streak,
          totalXp: clicked.xp,
        });
      });
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
              onClick={handleExportCSV}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportPDF}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Exportar PDF
            </Button>
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
          onClick={() => setActiveTab('weekly')}
          className={`flex items-center gap-2 bg-[#FF0066] text-white font-semibold px-4 py-2 rounded-none transition-colors hover:bg-[#FF0066]/80 ${activeTab === 'weekly' ? '' : 'opacity-60'}`}
        >
          <Calendar className="h-4 w-4" />
          Semanal
        </Button>
        <Button
          onClick={() => setActiveTab('monthly')}
          className={`flex items-center gap-2 bg-[#FF0066] text-white font-semibold px-4 py-2 rounded-none transition-colors hover:bg-[#FF0066]/80 ${activeTab === 'monthly' ? '' : 'opacity-60'}`}
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
              <p className="text-xl font-bold">{allUsers.reduce((sum, user) => sum + user.xp, 0)}</p>
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
              <p className="text-xl font-bold">{allUsers.reduce((sum, user) => sum + user.missionsCompleted, 0)}</p>
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
              <p className="text-xl font-bold">{Math.max(...allUsers.map(u => u.streak), 0)} dias</p>
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
              <p className="text-xl font-bold">{allUsers.length}</p>
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
          ) : rankingData.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum dado de ranking disponível ainda.
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
                      <Badge variant="secondary" className="bg-secondary/20 text-white">
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
                      <Badge variant="outline" className="border-accent text-white">
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
                      {(() => {
                        const totalFromState = typeof selectedUser.totalXp === 'number' ? selectedUser.totalXp : undefined;
                        const totalFromHist = selectedUser.xpHistory.reduce((sum, entry) => sum + entry.xp, 0);
                        const totalXpView = totalFromState ?? totalFromHist;
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Nível Atual:</span>
                              <span className="font-medium">{calculateLevelFromXp(totalXpView)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">XP Total:</span>
                              <span className="font-medium text-primary">{totalXpView} XP</span>
                            </div>
                          </>
                        );
                      })()}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sequência Atual:</span>
                        <span className="font-medium text-orange-500">{selectedUser.currentStreak} dias</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Melhor Sequência:</span>
                        <span className="font-medium text-orange-500">{selectedUser.bestStreak} dias</span>
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