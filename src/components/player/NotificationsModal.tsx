// src/components/player/NotificationsModal.tsx

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  Trophy,
  Target,
  AlertTriangle,
  X
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'mission' | 'achievement' | 'warning' | 'system';
  isRead: boolean;
  createdAt: string;
  xpReward?: number;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'mission': return <Target className="h-5 w-5 text-accent" />;
      case 'achievement': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'system': return <Bell className="h-5 w-5 text-muted-foreground" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'task': return <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">Tarefa</Badge>;
      case 'mission': return <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">Missão</Badge>;
      case 'achievement': return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 text-xs">Conquista</Badge>;
      case 'warning': return <Badge variant="destructive" className="text-xs">Aviso</Badge>;
      case 'system': return <Badge variant="outline" className="text-xs">Sistema</Badge>;
      default: return <Badge variant="outline" className="text-xs">Info</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-[#1A1A2E] border border-[#6A0DAD] rounded-xl overflow-hidden">
        <DialogHeader className="border-b border-[#6A0DAD]/30 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-white font-bold text-xl">
              <Bell className="h-6 w-6 text-[#FF0066]" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-[#FF0066] text-white text-sm">
                  {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex justify-between items-center py-3 border-b border-[#6A0DAD]/20">
          <span className="text-[#C0C0C0] text-sm">
            {notifications.length} notificação{notifications.length !== 1 ? 'ões' : ''}
          </span>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs border-[#6A0DAD] text-[#6A0DAD] hover:bg-[#6A0DAD]/20"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <div className="overflow-y-auto max-h-[50vh] pr-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-[#C0C0C0] mb-4" />
              <h3 className="text-white font-semibold mb-2">Nenhuma notificação</h3>
              <p className="text-[#C0C0C0] text-sm">Você está em dia com todas as suas atividades!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:bg-[#6A0DAD]/10 cursor-pointer ${
                    notification.isRead 
                      ? 'bg-[#1A1A2E]/50 border-[#6A0DAD]/20' 
                      : 'bg-[#6A0DAD]/10 border-[#6A0DAD]/50'
                  }`}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className={`font-semibold text-sm ${notification.isRead ? 'text-[#C0C0C0]' : 'text-white'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {getNotificationBadge(notification.type)}
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-[#FF0066] rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-3 ${notification.isRead ? 'text-[#C0C0C0]' : 'text-white'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[#C0C0C0]">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">
                            {new Date(notification.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        
                        {notification.xpReward && (
                          <Badge variant="secondary" className="bg-[#FF0066]/20 text-[#FF0066] text-xs">
                            +{notification.xpReward} XP
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;