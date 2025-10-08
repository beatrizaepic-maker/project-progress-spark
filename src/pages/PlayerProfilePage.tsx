// src/pages/PlayerProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { usePlayer } from '@/contexts/PlayerContext';
import PlayerProfileView from '@/components/player/PlayerProfileView';
import PlayerSettings from '@/components/player/PlayerSettings';
import NotificationsModal from '@/components/player/NotificationsModal';
import { PlayerStats } from '@/types/player';
import { calculatePlayerStats } from '@/services/playerService';

const PlayerProfilePage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { state, initPlayer, updatePlayer, getPlayerStats } = usePlayer();
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
    // Em uma aplicação real, buscaria os dados do usuário com base no ID
    if (!state.profile && playerId === 'current') { // Assumindo 'current' como o ID do usuário atual
      initPlayer('João Silva', '/avatars/user1.png', 'Desenvolvedor Sênior');
    }
  }, [playerId, state.profile, initPlayer]);

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
            <Button variant="outline" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Editar Perfil
            </Button>
          </div>
        )}
      </div>

      <PlayerProfileView 
        profile={state.profile} 
        stats={stats as PlayerStats} 
        isOwnProfile={isOwnProfile}
        onEdit={isOwnProfile ? () => setIsEditing(true) : undefined}
        onSendMessage={!isOwnProfile ? () => console.log('Enviar mensagem') : undefined}
        onNotifications={isOwnProfile ? () => setIsNotificationsOpen(true) : undefined}
      />

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
              updatePlayer(updatedProfile);
              setIsEditing(false);
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Modal de notificações */}
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