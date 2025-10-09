// src/components/player/PlayerProfileView.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import User from 'lucide-react/dist/esm/icons/user';
import Award from 'lucide-react/dist/esm/icons/award';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import Bell from 'lucide-react/dist/esm/icons/bell';
import { PlayerProfile, PlayerStats } from '@/types/player';
import PlayerStatsCard from './PlayerStatsCard';

interface PlayerProfileViewProps {
  profile: PlayerProfile;
  stats: PlayerStats;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onSendMessage?: () => void;
  onNotifications?: () => void;
  className?: string;
}

const PlayerProfileView: React.FC<PlayerProfileViewProps> = ({ 
  profile, 
  stats, 
  isOwnProfile = false, 
  onEdit,
  onSendMessage,
  onNotifications,
  className 
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cabeçalho do perfil */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 relative">
        {/* Ícone de notificações - apenas para o próprio perfil */}
        {isOwnProfile && onNotifications && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotifications}
            className="absolute top-4 right-4 h-10 w-10 p-0 hover:bg-primary/20"
          >
            <Bell className="h-5 w-5 text-primary" />
          </Button>
        )}
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="bg-accent text-primary">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {profile.role && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-sm">{profile.role}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Membro desde {new Date(profile.joinedDate).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2 md:mt-0">
                {!isOwnProfile && onSendMessage && (
                  <Button variant="outline" onClick={onSendMessage} className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Mensagem
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                Nível {profile.level}
              </Badge>
              <Badge variant="outline" className="border-accent text-accent">
                {stats.streak} dias de sequência
              </Badge>
              <Badge variant="outline" className="border-secondary text-secondary">
                {profile.missionsCompleted} missões
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Card: Tarefas do Dia / Atrasadas - logo abaixo do cabeçalho */}
      <div>
        <div className="bg-[#1A1A2E] p-6 border-2 border-[#6A0DAD] rounded-xl shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-[#FF0066]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 8H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 16H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Tarefas: Atrasadas e do Dia
              </h3>
              <p className="text-sm text-[#C0C0C0] mt-2">Resumo rápido das suas tarefas com prioridade de atenção.</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="/tasks?filter=overdue" className="text-sm font-semibold text-[#FF0066] hover:underline">Ver atrasadas</a>
              <a href="/tasks?filter=today" className="text-sm font-semibold text-[#FF0066] hover:underline">Ver do dia</a>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-md bg-[#0f172a]/20 border border-[#6A0DAD]/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#C0C0C0]">Atrasadas</div>
                  <div className="text-2xl font-bold text-white">2</div>
                </div>
                <div>
                  <button className="bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold px-3 py-1 rounded-none shadow-lg hover:shadow-xl">Ver</button>
                </div>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[#C0C0C0]">
                <li>• Desenvolvimento Frontend — 2 dias atrasado</li>
                <li>• Revisão de Requisitos — 1 dia atrasado</li>
              </ul>
            </div>

            <div className="p-4 rounded-md bg-[#0f172a]/20 border border-[#6A0DAD]/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#C0C0C0]">Vencendo Hoje</div>
                  <div className="text-2xl font-bold text-white">3</div>
                </div>
                <div>
                  <button className="bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold px-3 py-1 rounded-none shadow-lg hover:shadow-xl">Ver</button>
                </div>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[#C0C0C0]">
                <li>• Atualizar Documentação — vence hoje</li>
                <li>• Testes Unitários — vence hoje</li>
                <li>• Deploy de Hotfix — vence hoje</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estatísticas do jogador */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PlayerStatsCard stats={stats} />
        </div>
        
        {/* Informações secundárias */}
        <Card className="bg-accent/5 border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Award className="text-secondary" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Melhor Sequência</h4>
                <p className="text-sm text-muted-foreground">Recorde pessoal</p>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.bestStreak}</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Tarefas Completas</h4>
                <p className="text-sm text-muted-foreground">Taxa de conclusão</p>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.tasksCompletionRate}%</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Média de XP</h4>
                <p className="text-sm text-muted-foreground">Por tarefa</p>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.averageTaskXp}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Histórico recente (poderia ser expandido) */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="text-accent" />
            Atividade Recentee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta seção exibiria o histórico recente de atividades do player. 
            Em uma implementação completa, isso se conectaria ao histórico de XP e outras métricas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerProfileView;