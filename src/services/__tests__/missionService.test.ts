// src/services/__tests__/missionService.test.ts

import { 
  createWeeklyMissionsForUser,
  updateMissionProgress,
  processWeeklyMissions,
  checkNoDelaysMission,
  DEFAULT_MISSIONS,
  ActiveMission
} from '../missionService';
import { Task, User } from '../gamificationService';

describe('Mission Service', () => {
  describe('createWeeklyMissionsForUser', () => {
    it('should create weekly missions for a user', () => {
      const missions = createWeeklyMissionsForUser('user1');
      
      expect(missions).toHaveLength(3); // Default implementation creates 3 missions
      expect(missions[0].userId).toBe('user1');
      expect(missions[0].deadline).toBeDefined();
    });
  });

  describe('updateMissionProgress', () => {
    it('should update progress for complete_tasks mission', () => {
      const mission: ActiveMission = {
        id: 'm1',
        userId: 'user1',
        configId: 'complete_tasks',
        type: 'complete_tasks',
        name: 'Test Mission',
        description: 'Complete 5 tasks',
        target: 5,
        currentProgress: 2,
        xpReward: 25,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      };

      const task: Task = {
        id: 't1',
        title: 'Test Task',
        status: 'completed',
        completedDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        assignedTo: 'user1'
      };

      const updatedMission = updateMissionProgress(mission, task);
      
      expect(updatedMission.currentProgress).toBe(3);
      expect(updatedMission.completed).toBe(false);
    });

    it('should complete mission when target is reached', () => {
      const mission: ActiveMission = {
        id: 'm1',
        userId: 'user1',
        configId: 'complete_tasks',
        type: 'complete_tasks',
        name: 'Test Mission',
        description: 'Complete 5 tasks',
        target: 5,
        currentProgress: 4,
        xpReward: 25,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      };

      const task: Task = {
        id: 't1',
        title: 'Test Task',
        status: 'completed',
        completedDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        assignedTo: 'user1'
      };

      const updatedMission = updateMissionProgress(mission, task);
      
      expect(updatedMission.currentProgress).toBe(5);
      expect(updatedMission.completed).toBe(true);
    });

    it('should update progress for complete_early mission', () => {
      const mission: ActiveMission = {
        id: 'm1',
        userId: 'user1',
        configId: 'complete_early',
        type: 'complete_early',
        name: 'Early Bird',
        description: 'Complete 3 tasks early',
        target: 3,
        currentProgress: 1,
        xpReward: 30,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      };

      const task: Task = {
        id: 't1',
        title: 'Test Task',
        status: 'completed',
        completedDate: '2023-01-01',
        dueDate: '2023-01-02',
        assignedTo: 'user1'
      };

      const updatedMission = updateMissionProgress(mission, task);
      
      expect(updatedMission.currentProgress).toBe(2);
    });
  });

  describe('processWeeklyMissions', () => {
    it('should process missions and return updated missions and XP gained', () => {
      const user: User = {
        id: 'user1',
        name: 'User 1',
        avatar: 'avatar1',
        xp: 100,
        level: 1,
        weeklyXp: 0,
        monthlyXp: 0,
        missionsCompleted: 0,
        consistencyBonus: 0,
        streak: 0
      };

      const tasks: Task[] = [
        {
          id: 't1',
          title: 'Task 1',
          status: 'completed',
          completedDate: new Date().toISOString(),
          dueDate: new Date().toISOString(),
          assignedTo: 'user1'
        }
      ];

      const missions: ActiveMission[] = [
        {
          id: 'm1',
          userId: 'user1',
          configId: 'complete_tasks',
          type: 'complete_tasks',
          name: 'Complete 1 task',
          description: 'Complete 1 task',
          target: 1,
          currentProgress: 0,
          xpReward: 25,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
          createdAt: new Date().toISOString()
        }
      ];

      const result = processWeeklyMissions(user, tasks, missions);
      
      expect(result.updatedMissions[0].completed).toBe(true);
      expect(result.updatedMissions[0].currentProgress).toBe(1);
      expect(result.xpGained).toBe(25);
    });
  });

  describe('checkNoDelaysMission', () => {
    it('should mark no_delays mission as completed if no tasks were delayed', () => {
      const missions: ActiveMission[] = [
        {
          id: 'm1',
          userId: 'user1',
          configId: 'no_delays',
          type: 'no_delays',
          name: 'No Delays',
          description: 'No delayed tasks',
          target: 1, // Special case: target is 1 if no delays
          currentProgress: 0,
          xpReward: 35,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
          createdAt: new Date().toISOString()
        }
      ];

      const tasks: Task[] = [
        {
          id: 't1',
          title: 'Task 1',
          status: 'completed',
          completedDate: '2023-01-01',
          dueDate: '2023-01-02',
          assignedTo: 'user1'
        }
      ];

      const updatedMissions = checkNoDelaysMission(missions, tasks);
      
      expect(updatedMissions[0].completed).toBe(true);
      expect(updatedMissions[0].currentProgress).toBe(1);
    });

    it('should not mark no_delays mission as completed if tasks were delayed', () => {
      const missions: ActiveMission[] = [
        {
          id: 'm1',
          userId: 'user1',
          configId: 'no_delays',
          type: 'no_delays',
          name: 'No Delays',
          description: 'No delayed tasks',
          target: 1,
          currentProgress: 1,
          xpReward: 35,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
          createdAt: new Date().toISOString()
        }
      ];

      const tasks: Task[] = [
        {
          id: 't1',
          title: 'Task 1',
          status: 'completed',
          completedDate: '2023-01-03',
          dueDate: '2023-01-02',
          assignedTo: 'user1'
        }
      ];

      const updatedMissions = checkNoDelaysMission(missions, tasks);
      
      expect(updatedMissions[0].completed).toBe(false);
      expect(updatedMissions[0].currentProgress).toBe(0);
    });
  });
});