// src/pages/PlayerProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Settings from 'lucide-react/dist/esm/icons/settings';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAsProfile, validateUserSync, syncUserData } from '@/utils/userSync';
import PlayerProfileView from '@/components/player/PlayerProfileView';
import PlayerSettings from '@/components/player/PlayerSettings';
import NotificationsModal from '@/components/player/NotificationsModal';
import { PlayerStats } from '@/types/player';
import { calculatePlayerStats } from '@/services/playerService';
// (import duplicado removido)

const PlayerProfilePage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { state, initPlayer, updatePlayer, getPlayerStats } = usePlayer();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Mock notifications - em uma aplicação real, viria de uma API
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Tarefa concluída com sucesso!',
      message: 'Você completou a tarefa "Análise de Requisitos" e ganhou 10 XP.',
      type: 'task' as const,
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
      xpReward: 10
    },
    {
      id: '2',
      title: 'Nova missão semanal disponível!',
      message: 'Complete 3 tarefas esta semana para ganhar bônus de consistência.',
      type: 'mission' as const,
      isRead: false,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
    },
    {
      id: '3',
      title: 'Conquista desbloqueada!',
      message: 'Parabéns! Você alcançou o Nível 5 e desbloqueou a conquista "Desenvolvedor Dedicado".',
      type: 'achievement' as const,
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
      xpReward: 50
    },
    {
      id: '4',
      title: 'Tarefa com atraso',
      message: 'A tarefa "Desenvolvimento Frontend" está com 2 dias de atraso. Considere atualizá-la.',
      type: 'warning' as const,
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
    }
  ]);
  
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

  // Funções para gerenciar notificações
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

    // Dados fictícios para Atividade Recente
    const recentActivities = [
      {
        id: 'a1',
        title: 'XP ganho',
        description: 'Você ganhou 20 XP ao completar a tarefa "Revisão de Código".',
        date: '2025-10-08 14:30',
      },
      {
        id: 'a2',
        title: 'Missão concluída',
        description: 'Missão semanal "Colaborar em 3 projetos" concluída. +50 XP.',
        date: '2025-10-07 18:10',
      },
      {
        id: 'a3',
        title: 'Novo nível',
        description: 'Você atingiu o nível 6! Continue evoluindo.',
        date: '2025-10-06 09:45',
      },
      {
        id: 'a4',
        title: 'Conquista desbloqueada',
        description: 'Conquista "Primeiro Deploy" desbloqueada. +30 XP.',
        date: '2025-10-05 16:20',
      },
      {
        id: 'a5',
        title: 'Feedback recebido',
        description: 'Você recebeu feedback positivo do líder de projeto.',
        date: '2025-10-04 11:00',
      },
    ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {isOwnProfile ? 'Meu Perfil' : `Perfil de ${state.profile.name}`}
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas informações e visualize seu progresso
        </p>
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
        isOwnProfile={isOwnProfile}
        onEdit={isOwnProfile ? () => setIsEditing(true) : undefined}
        onSendMessage={!isOwnProfile ? () => console.log('Enviar mensagem') : undefined}
        onNotifications={isOwnProfile ? () => setIsNotificationsOpen(true) : undefined}
      />

        {/* Card de Atividade Recente */}
        <div className="bg-[#181834] border border-[#7c3aed] rounded-none shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300 p-6 mt-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#7c3aed]">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#7c3aed" strokeWidth="2" d="M4 12h16M12 4v16"/></svg>
            </span>
            <h2 className="text-2xl font-bold text-white">Atividade Recente</h2>
          </div>
          <p className="text-muted-foreground mb-4">Esta seção exibe o histórico recente de atividades do player.</p>
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
        </div>

      {/* Modal de edição de perfil */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Editar Perfil
            </DialogTitle>
          </DialogHeader>
          <PlayerSettings 
            profile={state.profile} 
            onSave={(updatedProfile) => {
              // 1) Atualiza AuthContext (persistência global em localStorage)
              const fullName = (updatedProfile.name || '').trim() || 'Usuário';
              const firstName = fullName.split(' ')[0] || fullName;
              const lastName = fullName.split(' ').slice(1).join(' ');

              // Chama updateProfile do Auth para propagar para todo o app
              updateProfile({
                name: fullName,
                firstName,
                lastName,
                position: updatedProfile.role || 'Membro da Equipe',
                avatar: updatedProfile.avatar
              }).then(() => {
                // 2) Sincroniza PlayerContext para refletir no card de perfil já aberto
                updatePlayer({
                  ...updatedProfile,
                  name: fullName,
                  avatar: updatedProfile.avatar,
                  role: updatedProfile.role || 'Membro da Equipe'
                });
                setIsEditing(false);
              });
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Notificações modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
};

export default PlayerProfilePage;