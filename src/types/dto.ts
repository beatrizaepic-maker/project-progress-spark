// src/types/dto.ts
// Data Transfer Objects for leaderboard and profile views
// Ensures visibility constraints: ranking hides productivity percentages; profile can show them.

export interface RankingEntryDTO {
  id: string;
  name: string;
  avatar: string;
  xp: number; // computed from productivity percent average * 10 (rounded)
  level: number;
  weeklyXp: number;
  monthlyXp: number;
  missionsCompleted: number;
  consistencyBonus: number;
  streak: number;
  // Note: no percentage fields here by design
}

export interface ProfileProductivityDTO {
  totalConsidered: number; // denominator in avg
  averagePercent: number; // rounded average percent (0-100)
}

export interface PlayerProfileDTO {
  id: string;
  name: string;
  avatar: string;
  level: number;
  missionsCompleted: number;
  streak: number;
  productivity: ProfileProductivityDTO; // visible only in profile, not in ranking
  deliveryDistribution?: { early: number; on_time: number; late: number; refacao: number };
}
