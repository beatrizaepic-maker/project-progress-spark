// src/services/__tests__/gamificationService.test.ts

import { 
  calculateXpForTask, 
  calculateLevelFromXp, 
  getLevelProgress, 
  calculateConsistencyBonus, 
  calculatePenalty,
  updateRanking,
  Task,
  User
} from '../gamificationService';

describe('Gamification Service', () => {
  describe('calculateXpForTask', () => {
    it('should return 15 XP for tasks completed early', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        status: 'completed',
        completedDate: '2023-01-01',
        dueDate: '2023-01-02',
        assignedTo: 'user1',
        completedEarly: true
      };

      const xp = calculateXpForTask(task);
      expect(xp).toBe(15);
    });

    it('should return 10 XP for tasks completed on time', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        status: 'completed',
        completedDate: '2023-01-02',
        dueDate: '2023-01-02',
        assignedTo: 'user1'
      };

      const xp = calculateXpForTask(task);
      expect(xp).toBe(10);
    });

    it('should return 5 XP for tasks completed late', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        status: 'completed',
        completedDate: '2023-01-03',
        dueDate: '2023-01-02',
        assignedTo: 'user1'
      };

      const xp = calculateXpForTask(task);
      expect(xp).toBe(5);
    });

    it('should return -5 XP for overdue tasks', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        status: 'overdue',
        dueDate: '2023-01-02',
        assignedTo: 'user1'
      };

      const xp = calculateXpForTask(task);
      expect(xp).toBe(-5);
    });

    it('should return 0 XP for uncompleted tasks', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        status: 'pending',
        dueDate: '2023-01-02',
        assignedTo: 'user1'
      };

      const xp = calculateXpForTask(task);
      expect(xp).toBe(0);
    });
  });

  describe('calculateLevelFromXp', () => {
    it('should return level 1 for 0-99 XP', () => {
      expect(calculateLevelFromXp(0)).toBe(1);
      expect(calculateLevelFromXp(50)).toBe(1);
      expect(calculateLevelFromXp(99)).toBe(1);
    });

    it('should return level 2 for 100-249 XP', () => {
      expect(calculateLevelFromXp(100)).toBe(2);
      expect(calculateLevelFromXp(150)).toBe(2);
      expect(calculateLevelFromXp(249)).toBe(2);
    });

    it('should return level 5 for 1000-1999 XP', () => {
      expect(calculateLevelFromXp(1000)).toBe(5);
      expect(calculateLevelFromXp(1500)).toBe(5);
      expect(calculateLevelFromXp(1999)).toBe(5);
    });
  });

  describe('getLevelProgress', () => {
    it('should return correct progress information', () => {
      const progress = getLevelProgress(150);
      
      expect(progress.currentLevel).toBe(2);
      expect(progress.currentLevelXp).toBe(50); // 150 - 100 (level 2 requirement)
      expect(progress.nextLevelXp).toBe(150); // 250 (level 3 requirement) - 100 (level 2 requirement)
      expect(progress.progressPercentage).toBeCloseTo(33.33, 2);
    });

    it('should return 100% progress for max level', () => {
      const progress = getLevelProgress(10000); // Above max level in test data
      
      expect(progress.currentLevel).toBe(8); // Max level in test data
      expect(progress.progressPercentage).toBe(100);
    });
  });

  describe('calculateConsistencyBonus', () => {
    it('should return 0 for streak less than 3 days', () => {
      expect(calculateConsistencyBonus(1)).toBe(0);
      expect(calculateConsistencyBonus(2)).toBe(0);
    });

    it('should return increasing bonus for 3-6 days streak', () => {
      expect(calculateConsistencyBonus(3)).toBe(6); // 3*2
      expect(calculateConsistencyBonus(4)).toBe(8); // 4*2
      expect(calculateConsistencyBonus(6)).toBe(12); // 6*2
    });

    it('should return up to 50 for 7+ days streak', () => {
      expect(calculateConsistencyBonus(7)).toBe(7); // Limited by actual streak
      expect(calculateConsistencyBonus(10)).toBe(10); // Limited by actual streak
      expect(calculateConsistencyBonus(50)).toBe(50); // Capped at 50
    });
  });

  describe('calculatePenalty', () => {
    it('should return 0 for on-time or early completion', () => {
      expect(calculatePenalty(0)).toBe(0);
      expect(calculatePenalty(-1)).toBe(0);
    });

    it('should return -2 for 1-2 days overdue', () => {
      expect(calculatePenalty(1)).toBe(-2);
      expect(calculatePenalty(2)).toBe(-2);
    });

    it('should return -5 for 3-6 days overdue', () => {
      expect(calculatePenalty(3)).toBe(-5);
      expect(calculatePenalty(5)).toBe(-5);
      expect(calculatePenalty(6)).toBe(-5);
    });

    it('should return -10 for 7+ days overdue', () => {
      expect(calculatePenalty(7)).toBe(-10);
      expect(calculatePenalty(10)).toBe(-10);
    });
  });

  describe('updateRanking', () => {
    it('should update user XP and level based on tasks', () => {
      const users: User[] = [
        {
          id: 'user1',
          name: 'User 1',
          avatar: 'avatar1',
          xp: 100,
          level: 2,
          weeklyXp: 0,
          monthlyXp: 0,
          missionsCompleted: 0,
          consistencyBonus: 0,
          streak: 0
        }
      ];

      const tasks: Task[] = [
        {
          id: 'task1',
          title: 'Task 1',
          status: 'completed',
          completedDate: new Date().toISOString(),
          dueDate: new Date().toISOString(),
          assignedTo: 'user1'
        },
        {
          id: 'task2',
          title: 'Task 2',
          status: 'completed',
          completedDate: new Date().toISOString(),
          dueDate: new Date().toISOString(),
          assignedTo: 'user1',
          completedEarly: true
        }
      ];

      const updatedUsers = updateRanking(users, tasks);
      
      // Should have gained 10 (on-time) + 15 (early) = 25 XP
      expect(updatedUsers[0].xp).toBe(125); // 100 + 25
      expect(updatedUsers[0].level).toBe(2); // Still level 2
    });
  });
});