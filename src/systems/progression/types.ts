/**
 * Progression System Types
 * Handles XP, leveling, and streaks
 */

/**
 * Streak tracking for Focus Blessing
 */
export interface StreakData {
  /** Current consecutive days with completed sessions */
  currentStreak: number;

  /** Longest streak ever achieved */
  longestStreak: number;

  /** Last date a session was completed (ISO string) */
  lastCompletionDate: string | null;

  /** Total days with at least one completed session */
  totalActiveDays: number;
}

/**
 * Progression state for character advancement
 */
export interface ProgressionState {
  /** Current character level */
  level: number;

  /** Current experience points */
  currentXP: number;

  /** XP required for next level */
  xpToNextLevel: number;

  /** Total XP earned (all-time) */
  totalXP: number;

  /** Streak data */
  streak: StreakData;
}

/**
 * Focus Blessing bonuses based on streak length
 */
export interface FocusBlessingBonus {
  /** Bonus to success chance (percentage) */
  successBonus: number;

  /** Bonus to loot quality (percentage) */
  lootQualityBonus: number;

  /** Bonus to XP gain (percentage) */
  xpBonus: number;
}
