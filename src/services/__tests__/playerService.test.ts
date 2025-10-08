// src/services/__tests__/playerService.test.ts

import { 
  createPlayerProfile, 
  updatePlayerProfile, 
  calculatePlayerStats,
  updatePlayerStatsFromGamification,
  createXpHistory,
  formatPlayerName,
  getPlayerAvatar,
  checkViewPermissions
} from '../playerService';
import { PlayerProfile, PlayerStats } from '@/types/player';
import { User as GamificationUser } from '../gamificationService';

describe('Player Service', () => {
  describe('createPlayerProfile', () => {
    it('should create a player profile with correct initial values', () => {
      const profile = createPlayerProfile('John Doe', '/avatars/john.png', 'Developer');
      
      expect(profile.name).toBe('John Doe');
      expect(profile.avatar).toBe('/avatars/john.png');
      expect(profile.role).toBe('Developer');
      expect(profile.xp).toBe(0);
      expect(profile.level).toBe(1);
      expect(profile.isActive).toBe(true);
      expect(profile.notificationPreferences).toBeDefined();
      expect(profile.privacySettings).toBeDefined();
    });

    it('should generate a unique ID for each player', () => {
      const profile1 = createPlayerProfile('John Doe', '/avatars/john.png');
      const profile2 = createPlayerProfile('Jane Doe', '/avatars/jane.png');
      
      expect(profile1.id).not.toBe(profile2.id);
    });
  });

  describe('updatePlayerProfile', () => {
    it('should update player profile with new values', () => {
      const initialProfile = createPlayerProfile('John Doe', '/avatars/john.png', 'Developer');
      const updatedProfile = updatePlayerProfile(initialProfile, {
        name: 'John Smith',
        role: 'Senior Developer'
      });
      
      expect(updatedProfile.name).toBe('John Smith');
      expect(updatedProfile.role).toBe('Senior Developer');
      // O ID deve permanecer o mesmo
      expect(updatedProfile.id).toBe(initialProfile.id);
      // A data de join deve permanecer a mesma
      expect(updatedProfile.joinedDate).toBe(initialProfile.joinedDate);
    });

    it('should not update protected fields', () => {
      const initialProfile = createPlayerProfile('John Doe', '/avatars/john.png');
      const updatedProfile = updatePlayerProfile(initialProfile, {
        id: 'different-id',
        joinedDate: 'some-other-date'
      } as any); // Forçar o tipo para testar proteção
      
      expect(updatedProfile.id).toBe(initialProfile.id);
      expect(updatedProfile.joinedDate).toBe(initialProfile.joinedDate);
    });
  });

  describe('calculatePlayerStats', () => {
    it('should calculate player stats correctly', () => {
      const profile: PlayerProfile = {
        id: 'test-id',
        name: 'Test User',
        avatar: '/avatars/test.png',
        joinedDate: new Date().toISOString(),
        isActive: true,
        xp: 500,
        level: 3,
        weeklyXp: 50,
        monthlyXp: 200,
        streak: 7,
        bestStreak: 10,
        missionsCompleted: 5,
        tasksCompleted: 20
      };
      
      const stats: PlayerStats = calculatePlayerStats(profile);
      
      expect(stats.totalXp).toBe(500);
      expect(stats.currentLevel).toBe(3);
      expect(stats.weeklyProgress).toBe(50);
      expect(stats.monthlyProgress).toBe(200);
      expect(stats.streak).toBe(7);
      expect(stats.bestStreak).toBe(10);
      expect(stats.missionsCompleted).toBe(5);
      expect(stats.tasksCompleted).toBe(20);
      expect(stats.tasksCompletionRate).toBeGreaterThan(0);
      expect(stats.averageTaskXp).toBe(25); // 500 / 20
    });
  });

  describe('updatePlayerStatsFromGamification', () => {
    it('should update player profile from gamification data', () => {
      const profile = createPlayerProfile('John Doe', '/avatars/john.png');
      
      const gamificationUser: GamificationUser = {
        id: profile.id,
        name: 'John Doe',
        avatar: '/avatars/john.png',
        xp: 750,
        level: 4,
        weeklyXp: 100,
        monthlyXp: 300,
        missionsCompleted: 8,
        consistencyBonus: 50,
        streak: 12
      };
      
      const updatedProfile = updatePlayerStatsFromGamification(profile, gamificationUser);
      
      expect(updatedProfile.xp).toBe(750);
      expect(updatedProfile.level).toBe(4);
      expect(updatedProfile.weeklyXp).toBe(100);
      expect(updatedProfile.monthlyXp).toBe(300);
      expect(updatedProfile.missionsCompleted).toBe(8);
      expect(updatedProfile.streak).toBe(12);
    });
  });

  describe('createXpHistory', () => {
    it('should create a valid XP history record', () => {
      const xpRecord = createXpHistory(
        'player-123',
        10,
        'task',
        'Tarefa concluída: Relatório Mensal'
      );
      
      expect(xpRecord.playerId).toBe('player-123');
      expect(xpRecord.xp).toBe(10);
      expect(xpRecord.source).toBe('task');
      expect(xpRecord.description).toBe('Tarefa concluída: Relatório Mensal');
      expect(xpRecord.date).toBeDefined();
      expect(xpRecord.id).toBeDefined();
    });
  });

  describe('formatPlayerName', () => {
    it('should return the player name', () => {
      const profile = createPlayerProfile('John Doe', '/avatars/john.png');
      const formattedName = formatPlayerName(profile);
      
      expect(formattedName).toBe('John Doe');
    });
  });

  describe('getPlayerAvatar', () => {
    it('should return the player avatar if available', () => {
      const profile = createPlayerProfile('John Doe', '/avatars/john.png');
      const avatar = getPlayerAvatar(profile);
      
      expect(avatar).toBe('/avatars/john.png');
    });

    it('should return the default avatar if none is set', () => {
      const profile = createPlayerProfile('John Doe', '');
      const avatar = getPlayerAvatar(profile);
      
      expect(avatar).toBe('/avatars/default-avatar.png');
    });
  });

  describe('checkViewPermissions', () => {
    it('should allow a user to view their own profile', () => {
      const user = createPlayerProfile('John Doe', '/avatars/john.png');
      const permissions = checkViewPermissions(user, user);
      
      expect(permissions.canViewProfile).toBe(true);
      expect(permissions.canViewXp).toBe(true);
      expect(permissions.canViewActivity).toBe(true);
    });

    it('should respect privacy settings for other users', () => {
      const viewer = createPlayerProfile('Jane Doe', '/avatars/jane.png');
      const subject = createPlayerProfile('John Doe', '/avatars/john.png');
      
      // Atualizar as configurações de privacidade do profile visualizado
      const updatedSubject = updatePlayerProfile(subject, {
        privacySettings: {
          profileVisibility: 'private',
          xpVisibility: 'team',
          activityVisibility: 'public',
          shareWithTeam: true
        }
      });
      
      const permissions = checkViewPermissions(viewer, updatedSubject);
      
      // Nenhuma permissão porque o profile é privado
      expect(permissions.canViewProfile).toBe(false);
      expect(permissions.canViewXp).toBe(true); // team
      expect(permissions.canViewActivity).toBe(true); // public
    });
  });
});