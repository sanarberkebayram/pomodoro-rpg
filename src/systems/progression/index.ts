/**
 * Progression System Exports
 * Handles XP, leveling, and streaks
 */

export {
  ProgressionManager,
  createProgressionManager,
  DEFAULT_XP_CONFIG,
  type XPConfig,
  type LevelUpEvent,
  type XPGainEvent,
} from './ProgressionManager';

export type { ProgressionState, StreakData, FocusBlessingBonus } from './types';
