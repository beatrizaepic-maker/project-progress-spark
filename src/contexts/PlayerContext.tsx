// src/contexts/PlayerContext.tsx

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { PlayerProfile, PlayerStats, XpHistory } from '@/types/player';
import { 
  createPlayerProfile, 
  updatePlayerProfile, 
  calculatePlayerStats, 
  updatePlayerStatsFromGamification,
  createXpHistory
} from '@/services/playerService';
import { User as GamificationUser } from '@/services/gamificationService';

// Definindo os tipos para as ações do reducer
type PlayerAction =
  | { type: 'SET_PROFILE'; payload: PlayerProfile }
  | { type: 'UPDATE_PROFILE'; payload: Partial<PlayerProfile> }
  | { type: 'UPDATE_STATS'; payload: Partial<PlayerStats> }
  | { type: 'ADD_XP_HISTORY'; payload: XpHistory }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Estado do contexto do player
interface PlayerState {
  profile: PlayerProfile | null;
  stats: PlayerStats | null;
  xpHistory: XpHistory[];
  isLoading: boolean;
  error: string | null;
}

// Estado inicial
const initialState: PlayerState = {
  profile: null,
  stats: null,
  xpHistory: [],
  isLoading: false,
  error: null
};

// Reducer para gerenciar o estado do player
const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
        stats: calculatePlayerStats(action.payload),
        isLoading: false,
        error: null
      };
    
    case 'UPDATE_PROFILE':
      if (!state.profile) return state;
      const updatedProfile = updatePlayerProfile(state.profile, action.payload);
      return {
        ...state,
        profile: updatedProfile,
        stats: calculatePlayerStats(updatedProfile),
        isLoading: false,
        error: null
      };
    
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: state.stats ? { ...state.stats, ...action.payload } : null,
        isLoading: false,
        error: null
      };
    
    case 'ADD_XP_HISTORY':
      return {
        ...state,
        xpHistory: [action.payload, ...state.xpHistory], // Adiciona ao início
        isLoading: false,
        error: null
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    default:
      return state;
  }
};

// Tipo para o contexto
interface PlayerContextType {
  state: PlayerState;
  initPlayer: (name: string, avatar: string, role?: string) => void;
  updatePlayer: (updates: Partial<PlayerProfile>) => void;
  updateFromGamification: (gamificationUser: GamificationUser) => void;
  addXpHistory: (xp: number, source: XpHistory['source'], description: string, taskId?: string, missionId?: string) => void;
  getPlayerStats: () => PlayerStats | null;
}

// Criando o contexto
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Componente provedor do contexto
interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  // Inicializa o player com perfil básico
  const initPlayer = (name: string, avatar: string, role?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const profile = createPlayerProfile(name, avatar, role);
      dispatch({ type: 'SET_PROFILE', payload: profile });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Falha ao inicializar o player' });
    }
  };

  // Atualiza o perfil do player
  const updatePlayer = (updates: Partial<PlayerProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  };

  // Atualiza o perfil com base nos dados do sistema de gamificação
  const updateFromGamification = (gamificationUser: GamificationUser) => {
    if (!state.profile) return;
    const updatedProfile = updatePlayerStatsFromGamification(state.profile, gamificationUser);
    dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
  };

  // Adiciona histórico de XP
  const addXpHistory = (
    xp: number, 
    source: XpHistory['source'], 
    description: string, 
    taskId?: string, 
    missionId?: string
  ) => {
    if (!state.profile) return;
    const xpRecord = createXpHistory(
      state.profile.id, 
      xp, 
      source, 
      description, 
      taskId, 
      missionId
    );
    dispatch({ type: 'ADD_XP_HISTORY', payload: xpRecord });
  };

  // Obtém as estatísticas atuais
  const getPlayerStats = (): PlayerStats | null => {
    if (state.profile) {
      return calculatePlayerStats(state.profile);
    }
    return null;
  };

  const value = {
    state,
    initPlayer,
    updatePlayer,
    updateFromGamification,
    addXpHistory,
    getPlayerStats
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

// Hook para usar o contexto
export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};