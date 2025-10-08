// src/contexts/__tests__/PlayerContext.test.tsx

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { PlayerProvider, usePlayer } from '../PlayerContext';
import { PlayerProfile } from '@/types/player';
import { User as GamificationUser } from '@/services/gamificationService';

// Mock do localStorage para testes
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    getAll: () => ({ ...store })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('PlayerContext', () => {
  it('should initialize player profile correctly', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <PlayerProvider>{children}</PlayerProvider>
    );
    
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    act(() => {
      result.current.initPlayer('Test User', '/avatars/test.png', 'Developer');
    });
    
    expect(result.current.state.profile).toBeDefined();
    expect(result.current.state.profile?.name).toBe('Test User');
    expect(result.current.state.profile?.role).toBe('Developer');
    expect(result.current.state.stats).toBeDefined();
    expect(result.current.state.isLoading).toBe(false);
  });

  it('should update player profile correctly', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <PlayerProvider>{children}</PlayerProvider>
    );
    
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    act(() => {
      result.current.initPlayer('Test User', '/avatars/test.png', 'Developer');
    });
    
    act(() => {
      result.current.updatePlayer({ 
        name: 'Updated Name', 
        role: 'Senior Developer' 
      });
    });
    
    expect(result.current.state.profile?.name).toBe('Updated Name');
    expect(result.current.state.profile?.role).toBe('Senior Developer');
  });

  it('should update from gamification data correctly', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <PlayerProvider>{children}</PlayerProvider>
    );
    
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    act(() => {
      result.current.initPlayer('Test User', '/avatars/test.png', 'Developer');
    });
    
    const gamificationUser: GamificationUser = {
      id: result.current.state.profile!.id,
      name: 'Test User',
      avatar: '/avatars/test.png',
      xp: 750,
      level: 4,
      weeklyXp: 100,
      monthlyXp: 300,
      missionsCompleted: 8,
      consistencyBonus: 50,
      streak: 12
    };
    
    act(() => {
      result.current.updateFromGamification(gamificationUser);
    });
    
    expect(result.current.state.profile?.xp).toBe(750);
    expect(result.current.state.profile?.level).toBe(4);
    expect(result.current.state.profile?.weeklyXp).toBe(100);
    expect(result.current.state.profile?.streak).toBe(12);
  });

  it('should add XP history correctly', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <PlayerProvider>{children}</PlayerProvider>
    );
    
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    act(() => {
      result.current.initPlayer('Test User', '/avatars/test.png', 'Developer');
    });
    
    act(() => {
      result.current.addXpHistory(10, 'task', 'Tarefa completada');
    });
    
    expect(result.current.state.xpHistory).toHaveLength(1);
    expect(result.current.state.xpHistory[0].xp).toBe(10);
    expect(result.current.state.xpHistory[0].source).toBe('task');
    expect(result.current.state.xpHistory[0].description).toBe('Tarefa completada');
  });

  it('should handle errors gracefully', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <PlayerProvider>{children}</PlayerProvider>
    );
    
    const { result } = renderHook(() => usePlayer(), { wrapper });
    
    expect(result.current.state.error).toBeNull();
  });
});