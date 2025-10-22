// src/components/player/PlayerStatsCard.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Target from 'lucide-react/dist/esm/icons/target';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import Zap from 'lucide-react/dist/esm/icons/zap';
import { PlayerStats } from '@/types/player';
import { getLevelProgress } from '@/services/gamificationService';

interface PlayerStatsCardProps {
  stats: PlayerStats;
  className?: string;
}

const PlayerStatsCard: React.FC<PlayerStatsCardProps> = ({ stats, className }) => {
  // Calcula o progresso para o próximo nível com base nos dados de xp recebidos
  // Fórmula simplificada: 100 XP por nível (isso pode ser ajustado conforme necessário)
  const xpForCurrentLevel = 100 * stats.currentLevel; // XP necessário para o nível atual
  const xpForNextLevel = 100 * (stats.currentLevel + 1); // XP necessário para o próximo nível
  const xpInCurrentLevel = stats.totalXp - xpForCurrentLevel;
  const nextLevelXp = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = nextLevelXp > 0 ? (xpInCurrentLevel / nextLevelXp) * 100 : 0;

  const levelProgress = {
    currentLevel: stats.currentLevel,
    currentLevelXp: xpInCurrentLevel,
    nextLevelXp: nextLevelXp,
    progressPercentage: Math.max(0, Math.min(100, progressPercentage)) // Limitar entre 0 e 100
  };

  return (
    <Card className={`bg-gradient-to-br from-primary/5 to-accent/5 border border-[#6A0DAD] rounded-none shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BarChart3 className="text-primary" />
          Estatísticas do Player
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nível e XP */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Nível {stats.currentLevel}</span>
            <span className="text-sm text-muted-foreground">{stats.totalXp} XP</span>
          </div>
          <Progress 
            value={levelProgress.progressPercentage} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 XP</span>
            <span>Próximo: {levelProgress.nextLevelXp} XP</span>
          </div>
        </div>

        {/* Estatísticas principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-accent/20 p-3 rounded-none border border-border">
            <div className="flex items-center gap-2 text-primary">
              <Trophy className="h-4 w-4" />
              <span className="text-xs font-medium">Nível</span>
            </div>
            <div className="text-lg font-bold text-foreground mt-1">{stats.currentLevel}</div>
          </div>
          
          <div className="bg-accent/20 p-3 rounded-none border border-border">
            <div className="flex items-center gap-2 text-secondary">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-medium">Semanal</span>
            </div>
            <div className="text-lg font-bold text-foreground mt-1">{stats.weeklyProgress}</div>
          </div>
          
          <div className="bg-accent/20 p-3 rounded-none border border-border">
            <div className="flex items-center gap-2 text-accent">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-medium">Sequência</span>
            </div>
            <div className="text-lg font-bold text-foreground mt-1">{stats.streak}</div>
          </div>
          
          <div className="bg-accent/20 p-3 rounded-none border border-border">
            <div className="flex items-center gap-2 text-primary">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-medium">Missões</span>
            </div>
            <div className="text-lg font-bold text-foreground mt-1">{stats.missionsCompleted}</div>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tarefas:</span>
              <span className="text-foreground font-medium">{stats.tasksCompleted}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conclusão:</span>
              <span className="text-foreground font-medium">{stats.tasksCompletionRate}%</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Média XP:</span>
              <span className="text-foreground font-medium">{stats.averageTaskXp}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Melhor sequência:</span>
              <span className="text-foreground font-medium">{stats.bestStreak}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStatsCard;