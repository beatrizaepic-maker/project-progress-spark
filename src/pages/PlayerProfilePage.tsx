// src/pages/PlayerProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Settings from 'lucide-react/dist/esm/icons/settings';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAsProfile, validateUserSync, syncUserData } from '@/utils/userSync';
import PlayerProfileView from '@/components/player/PlayerProfileView';
import ProfileEditModal from '@/components/player/ProfileEditModal';
import NotificationsModal from '@/components/player/NotificationsModal';
import { PlayerStats } from '@/types/player';
import { TaskData } from '@/data/projectData';
import { calculatePlayerStats } from '@/services/playerService';
// Importações para Supabase
import { supabase } from '@/lib/supabase';
import { getUserXpHistory } from '@/services/xpHistoryService';
import { getSeasonConfig, type SeasonConfig } from '@/config/season';
// import { reportUrls, download } from '@/services/reports';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import HelpCircle from 'lucide-react/dist/esm/icons/help-circle';
// (import duplicado removido)

// Notificações reais (tarefas + histórico de XP)
type UINotification = {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'mission' | 'achievement' | 'warning' | 'system';
  isRead: boolean;
  createdAt: string;
  xpReward?: number;
};

// Funções de persistência para status de leitura das notificações (usando Supabase)
const loadReadSet = async (uid?: string): Promise<Set<string>> => {
  if (!uid) return new Set();
  
  try {
    try {
      const { data, error } = await supabase
        .from('user_notification_read_status') // Tabela pode não existir
        .select('notificationid')
        .eq('userid', uid);
      
      if (error) {
        // Se a tabela não existir ou houver outro erro, retorna um Set vazio
        if (error.code !== 'PGRST116' && error.code !== '42P01') { // PGRST116: view not found, 42P01: undefined_table
          console.warn('Erro ao carregar status de leitura de notificações:', error);
        }
        return new Set();
      }
      
      return new Set(data?.map(item => item.notificationid) || []);
    } catch (error) {
      console.warn('Erro ao carregar status de leitura de notificações:', error);
      return new Set();
    }
  } catch (error) {
    console.error('Erro inesperado ao carregar status de leitura de notificações:', error);
    return new Set();
  }
};

const saveReadSet = async (uid: string, setIds: Set<string>) => {
  if (!uid) return;
  
  try {
    // Verifica se a tabela existe primeiro
    const { error: checkError } = await supabase
      .from('user_notification_read_status')
      .select('id')
      .limit(1);
    
    if (checkError && (checkError.code === 'PGRST116' || checkError.code === '42P01')) {
      // Tabela não existe, apenas ignora a operação
      return;
    }
    
    // Tabela existe, prossegue com a operação
    await supabase
      .from('user_notification_read_status')
      .delete()
      .eq('userId', uid);
    
    // Depois, insere os novos registros de status de leitura
    if (setIds.size > 0) {
      const readStatuses = Array.from(setIds).map(notificationId => ({
        userId: uid,
        notificationId,
        readAt: new Date().toISOString()
      }));
      
      const { error } = await supabase
        .from('user_notification_read_status')
        .insert(readStatuses);
      
      if (error) throw error;
    }
  } catch (error) {
    console.warn('Erro ao salvar status de leitura de notificações:', error);
    // Não lança erro, apenas avisa, para não interromper a funcionalidade
  }
};

type TaskBreakdownItem = { id: string; title: string; classificacao: string; percent: number; completedDate: string | null };

const PlayerProfilePage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { state, initPlayer, updatePlayer, getPlayerStats } = usePlayer();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [prodMetrics, setProdMetrics] = useState<{ averagePercent: number; totalConsidered: number } | null>(null);
  const [tasksBreakdown, setTasksBreakdown] = useState<TaskBreakdownItem[] | null>(null);
  const [seasonMetrics, setSeasonMetrics] = useState<{ averagePercent: number; totalConsidered: number; label: string } | null>(null);
  const [deliveryDist, setDeliveryDist] = useState<{ early: number; on_time: number; late: number; refacao: number } | null>(null);
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [availableSeasons, setAvailableSeasons] = useState<SeasonConfig[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('current');
  // Atividade Recente dinâmica baseada em dados reais (tarefas + XP)
  type RecentActivity = { id: string; title: string; description: string; date: string };
  const formatDateTime = (iso?: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    } catch { return iso; }
  };

  const [xpActivities, setXpActivities] = useState<RecentActivity[]>([]);
  const [activityLog, setActivityLog] = useState<RecentActivity[]>([]);
  const [fetchedTasks, setFetchedTasks] = useState<TaskBreakdownItem[] | null>(null);
  const [tasksForView, setTasksForView] = useState<TaskData[]>([]);
  
  // Simular carregamento de dados do player
  useEffect(() => {
    // Sincroniza os dados do player com o usuário autenticado
    if (!state.profile && playerId === 'current' && user) {
      const profileData = getUserAsProfile(user);
      initPlayer(profileData.name, profileData.avatar, profileData.role);
    }
  }, [playerId, state.profile, initPlayer, user]);

  // Sincronização contínua: atualiza profile sempre que user mudar
  useEffect(() => {
    if (state.profile && user && playerId === 'current') {
      // Verifica se os dados estão sincronizados
      if (!validateUserSync(user, state.profile)) {
        // Força sincronização com dados mais recentes
        syncUserData(user, (syncedData) => {
          updatePlayer({
            ...state.profile,
            ...syncedData
          });
        });
      }
    }
  }, [user, state.profile, updatePlayer, playerId]);

  // Carregar métricas de produtividade (visíveis apenas no perfil)
  useEffect(() => {
    const loadProd = async () => {
      if (!user?.id) return;
      // Substitui backend inexistente por consultas diretas ao Supabase
      try {
        // Tenta buscar métricas agregadas por player
        const { data: metrics, error: metricsError } = await supabase
          .from('player_productivity_metrics')
          .select('*')
          .eq('user_id', user.id) // Corrigido: usar user_id em vez de player_id
          .order('calculated_at', { ascending: false })
          .limit(1)
          .single();

        if (metricsError && metricsError.code !== 'PGRST116') {
          console.warn('player_productivity_metrics não disponível ou erro:', metricsError);
        }

        if (metrics) {
          setProdMetrics({
            averagePercent: Number(metrics.average_percent) || 0,
            totalConsidered: Number(metrics.total_considered) || 0
          });

          if (metrics.delivery_distribution) {
            setDeliveryDist(metrics.delivery_distribution);
          }
        }

        // Tenta buscar breakdown de tarefas do player - Tabela pode não existir
        try {
          const { data: taskBreak, error: taskErr } = await supabase
            .from('player_productivity_tasks')
            .select('*')
            .eq('player_id', user.id)
            .order('completed_at', { ascending: false });

          if (taskErr) {
            // Se a tabela não existir, não é um erro crítico
            if (taskErr.code !== 'PGRST116' && taskErr.code !== '42P01') {
              console.warn('player_productivity_tasks não disponível ou erro:', taskErr);
            }
            return;
          }

          if (taskBreak) {
            const mapped = taskBreak.map((t: any) => ({
              id: t.id || `${t.task_id}`,
              title: t.task_title || t.task_id,
              classificacao: t.classificacao || 'outros',
              percent: t.percent || 0,
              completedDate: t.completed_at || t.date
            }));
            setTasksBreakdown(mapped as TaskBreakdownItem[]);
          }
        } catch (error) {
          console.warn('Erro ao carregar player_productivity_tasks:', error);
        }
      } catch (error) {
        console.error('Erro ao carregar métricas do Supabase:', error);
      }
    };
    loadProd();
  }, [user?.id]);

  // Carregar temporadas disponíveis do sistema (usando Supabase)
  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const { data, error } = await supabase
          .from('player_seasons')
          .select('*')
          .order('start_date', { ascending: false });

        if (error && error.code !== 'PGRST116') {
          console.warn('player_seasons não disponível ou erro:', error);
        }

        if (data && data.length > 0) {
          const seasons = data.map((s: any) => ({
            name: s.season_name || s.name,
            description: s.description || '',
            startIso: s.start_date,
            endIso: s.end_date
          }));
          setAvailableSeasons(seasons as SeasonConfig[]);
          return;
        }

        // Fallback para a configuração local se não houver tabela
  const currentSeason = await getSeasonConfig();
  setAvailableSeasons([currentSeason]);
      } catch (error) {
        console.error('Erro ao carregar seasons:', error);
  const currentSeason = await getSeasonConfig();
  setAvailableSeasons([currentSeason]);
      }
    };

    loadSeasons();
  }, []);

  // Calcular produtividade da temporada selecionada
  useEffect(() => {
    if (!tasksBreakdown) return;
    
    let inSeason: TaskBreakdownItem[];
    
    if (selectedSeason === 'current') {
      // Temporada atual (mês corrente)
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      inSeason = tasksBreakdown.filter(t => {
        if (!t.completedDate) return false;
        const d = new Date(t.completedDate);
        return d.getFullYear() === y && d.getMonth() === m;
      });
    } else {
      // Temporada específica selecionada
      const season = availableSeasons.find(s => s.name === selectedSeason);
      if (season) {
        const startDate = new Date(season.startIso);
        const endDate = new Date(season.endIso);
        inSeason = tasksBreakdown.filter(t => {
          if (!t.completedDate) return false;
          const d = new Date(t.completedDate);
          return d >= startDate && d <= endDate;
        });
      } else {
        inSeason = [];
      }
    }
    
    const count = inSeason.length;
    const sum = inSeason.reduce((acc, t) => acc + Math.max(0, Math.min(100, Number(t.percent) || 0)), 0);
    const avg = count ? Math.round(sum / count) : 0;
    
    const label = selectedSeason === 'current' 
      ? new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      : selectedSeason;
    
    setSeasonMetrics({ averagePercent: avg, totalConsidered: count, label });
  }, [tasksBreakdown, selectedSeason, availableSeasons]);

  // Carregar histórico de XP para atividades recentes
  useEffect(() => {
    const loadXpActivities = async () => {
      if (!user?.id) {
        setXpActivities([]);
        return;
      }
      
      try {
        const hist = await getUserXpHistory(String(user.id));
        const activities: RecentActivity[] = hist.map(e => ({
          id: `xp-${e.id}`,
          title: e.xp >= 0 ? 'XP ganho' : 'XP perdido',
          description: `${e.description} ${e.xp >= 0 ? `(+${e.xp} XP)` : `(${e.xp} XP)`}`,
          date: formatDateTime(e.date),
        }));
        
        setXpActivities(activities);
      } catch (error) {
        console.error('Erro ao carregar atividades de XP:', error);
        setXpActivities([]);
      }
    };
    
    loadXpActivities();
  }, [user?.id]);

  // Carregar atividades de user_activity_log e combinar com XP
  useEffect(() => {
    const loadActivityLog = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_activity_log')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error && error.code !== 'PGRST116') {
          console.warn('user_activity_log indisponível ou erro:', error);
          return;
        }

        const activities: RecentActivity[] = (data || []).map((a: any) => ({
          id: `act-${a.id}`,
          title: a.title || (a.type === 'task' ? 'Tarefa' : 'Atividade'),
          description: a.description || a.details || '',
          date: formatDateTime(a.created_at || a.date)
        }));

        setActivityLog(activities);
        // Para exibir as atividades combinadas, ajustamos recentActivities localmente abaixo
      } catch (error) {
        console.error('Erro ao carregar user_activity_log:', error);
      }
    };

    loadActivityLog();
  }, [user?.id]);

  // Carregar notificações reais do Supabase
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) {
        setNotifications([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar notificações:', error);
          setNotifications([]);
          return;
        }

        const readSet = await loadReadSet(user.id);

        const uiNotifs: UINotification[] = (data || []).map((n: any) => ({
          id: n.id,
          title: n.title || n.message?.slice(0, 40) || 'Notificação',
          message: n.message || '',
          type: n.type || 'system',
          isRead: readSet.has(n.id),
          createdAt: n.created_at || n.createdAt,
          xpReward: n.xp_reward
        }));

        setNotifications(uiNotifs);
      } catch (error) {
        console.error('Erro inesperado ao carregar notificações:', error);
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [user?.id]);

  // Carregar tarefas reais (se tabela existir)
  useEffect(() => {
    const loadTasks = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('end_date', { ascending: false }); // Corrigido: usar end_date em vez de due_date

        if (error && error.code !== 'PGRST116') {
          console.warn('Tabela tasks não disponível ou erro:', error);
          setTasksBreakdown([]);
          return;
        }

        if (data) {
          const mapped = data.map((t: any) => ({
            id: t.id,
            title: t.title || t.tarefa,
            classificacao: t.classificacao || 'outros',
            percent: t.progress ?? 0,
            completedDate: t.completed_at || t.fim || t.end_date || null
          }));
          setTasksBreakdown(mapped as TaskBreakdownItem[]);
        }
      } catch (error) {
        console.error('Erro ao carregar tasks do Supabase:', error);
        setTasksBreakdown([]);
      }
    };

    loadTasks();
  }, [user?.id]);

  // Se o player não estiver carregado, mostrar mensagem de carregamento
  if (!state.profile) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-lg text-muted-foreground">Carregando perfil do jogador...</p>
        </div>
      </div>
    );
  }

  // Obter as estatísticas atuais
  const stats = getPlayerStats() || calculatePlayerStats(state.profile);

  // Verificar se é o perfil do próprio usuário
  const isOwnProfile = playerId === 'current';

  // Funções para gerenciar notificações (com persistência de leitura)
  const handleMarkAsRead = async (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
      return updated;
    });
    
    if (user?.id) {
      const readSet = await loadReadSet(String(user.id));
      readSet.add(notificationId);
      await saveReadSet(String(user.id), readSet);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      return updated;
    });
    
    if (user?.id) {
      const allIds = new Set(notifications.map(n => n.id));
      await saveReadSet(String(user.id), allIds);
    }
  };

    

  const tasksForProfile = fetchedTasks || [];

    // Eventos das tarefas
  const taskActivities: RecentActivity[] = (tasksForProfile || [])
      .map((t) => {
        // Preferir evento de conclusão quando houver completedDate
        if (t.completedDate) {
          return {
            id: `task-fim-${t.id}`,
            title: 'Tarefa concluída',
            description: `${t.title} ${t.classificacao ? `(${t.classificacao})` : ''}`,
            date: formatDateTime(t.completedDate)
          };
        }
        // Caso não tenha completion date, marcar como criação/atualização
        return {
          id: `task-inicio-${t.id}`,
          title: 'Tarefa criada',
          description: `${t.title} ${t.classificacao ? `(${t.classificacao})` : ''}`,
          date: ''
        };
      })
    
    const recentActivities: RecentActivity[] = [...taskActivities, ...activityLog, ...xpActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {isOwnProfile ? 'Meu Perfil' : `Perfil de ${state.profile.name}`}
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas informações e visualize seu progresso
        </p>
        {/* Botões de exportação removidos conforme solicitado */}
        {isOwnProfile && (
          <div className="mt-4">
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-[#FF0066] text-white font-semibold px-4 py-2 rounded-none transition-colors hover:bg-[#FF0066]/80 flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Editar Perfil
            </Button>
          </div>
        )}
      </div>
      {/* Card de tarefas agora é renderizado dentro de PlayerProfileView logo após o cabeçalho */}

      <PlayerProfileView 
        profile={state.profile} 
        stats={stats as PlayerStats} 
        tasks={tasksForView} 
        isOwnProfile={isOwnProfile}
        onEdit={isOwnProfile ? () => setIsEditing(true) : undefined}
        onSendMessage={!isOwnProfile ? () => console.log('Enviar mensagem') : undefined}
        onNotifications={isOwnProfile ? () => setIsNotificationsOpen(true) : undefined}
      />

        {/* Produtividade Média (apenas no perfil) */}
        {prodMetrics && (
          <div className="bg-[#181834] border border-[#7c3aed] rounded-none shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300 p-6 mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[#7c3aed]">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#7c3aed" strokeWidth="2" d="M4 12h16M12 4v16"/></svg>
                </span>
                <h2 className="text-xl font-bold text-white">Produtividade Média</h2>
              </div>
              
              {/* Seletor de Temporada */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Temporada:</label>
                <select 
                  className="bg-[#23234a] border border-[#7c3aed]/30 text-white text-sm px-3 py-1 rounded-none focus:outline-none focus:border-[#7c3aed]"
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                >
                  <option value="current">Temporada Atual</option>
                  {availableSeasons.map((season, index) => (
                    <option key={index} value={season.name}>
                      {season.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-muted-foreground">
              {selectedSeason === 'current' 
                ? 'Sua média de produtividade atual com base nas tarefas consideradas.'
                : `Média de produtividade para a temporada: ${seasonMetrics?.label || selectedSeason}`
              }
            </p>
            <div className="mt-3 flex items-center gap-6">
              <div>
                <div className="text-4xl font-bold text-white">
                  {seasonMetrics ? `${seasonMetrics.averagePercent}%` : `${prodMetrics.averagePercent}%`}
                </div>
                <div className="text-sm text-muted-foreground">Média de produtividade</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">
                  {seasonMetrics ? seasonMetrics.totalConsidered : prodMetrics.totalConsidered}
                </div>
                <div className="text-sm text-muted-foreground">Tarefas consideradas</div>
              </div>
            </div>
            {(seasonMetrics ? seasonMetrics.totalConsidered : prodMetrics.totalConsidered) === 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                Sem tarefas consideradas no período selecionado. Ao concluir tarefas, sua média e XP serão atualizados.
              </div>
            )}
          </div>
        )}

        {/* Distribuição de entregas */}
        {deliveryDist && (
          <div className="bg-[#181834] border border-[#7c3aed] rounded-none shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300 p-6 mt-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#7c3aed]">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#7c3aed" strokeWidth="2" d="M4 12h16M12 4v16"/></svg>
              </span>
              <h2 className="text-xl font-bold text-white">Distribuição de Entregas</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div className="p-3 bg-[#23234a] border border-[#7c3aed]/30">
                <div className="text-sm text-muted-foreground">Adiantadas</div>
                <div className="text-2xl font-bold text-white">{deliveryDist.early}</div>
              </div>
              <div className="p-3 bg-[#23234a] border border-[#7c3aed]/30">
                <div className="text-sm text-muted-foreground">No prazo</div>
                <div className="text-2xl font-bold text-white">{deliveryDist.on_time}</div>
              </div>
              <div className="p-3 bg-[#23234a] border border-[#7c3aed]/30">
                <div className="text-sm text-muted-foreground">Atrasadas</div>
                <div className="text-2xl font-bold text-white">{deliveryDist.late}</div>
              </div>
              <div className="p-3 bg-[#23234a] border border-[#7c3aed]/30">
                <div className="text-sm text-muted-foreground">Refação</div>
                <div className="text-2xl font-bold text-white">{deliveryDist.refacao}</div>
              </div>
            </div>
          </div>
        )}

        {/* Card de Atividade Recente */}
        <div className="bg-[#181834] border border-[#7c3aed] rounded-none shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300 p-6 mt-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#7c3aed]">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#7c3aed" strokeWidth="2" d="M4 12h16M12 4v16"/></svg>
            </span>
            <h2 className="text-2xl font-bold text-white">Atividade Recente</h2>
          </div>
          <p className="text-muted-foreground mb-4">Esta seção exibe o histórico recente de atividades do player.</p>
          {recentActivities.length === 0 ? (
            <div className="bg-[#23234a] rounded-none p-4 border border-dashed border-[#7c3aed]/40 text-muted-foreground">
              Nenhuma atividade recente encontrada.
            </div>
          ) : (
            <ul className="space-y-3">
              {recentActivities.map(activity => (
                <li key={activity.id} className="bg-[#23234a] rounded-none p-4 border-l-4 border-[#7c3aed]">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">{activity.title}</span>
                    <span className="text-xs text-muted-foreground">{activity.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>



      {/* Modal de edição de perfil (reutilizável) */}
      <ProfileEditModal 
        open={isEditing}
        onOpenChange={setIsEditing}
        profile={state.profile}
      />

      {/* Notificações modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={async (id: string) => await handleMarkAsRead(id)}
        onMarkAllAsRead={async () => await handleMarkAllAsRead()}
      />
    </div>
  );
};

export default PlayerProfilePage;