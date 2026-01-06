/**
 * Progression Manager
 * Handles XP, leveling, and character progression
 */

import type { ProgressionState } from './types';
import type { CharacterStore } from '../../core/state/CharacterState';
import type { TaskOutcome } from '../../core/types/tasks';

/**
 * XP configuration
 */
export interface XPConfig {
  /** Base XP required for level 2 */
  baseXP: number;

  /** Exponent for XP scaling curve */
  exponent: number;

  /** Multiplier for partial success XP */
  partialSuccessMultiplier: number;
}

/**
 * Default XP configuration
 * Uses formula: XP_needed = baseXP * (level ^ exponent)
 * Level 2: 100 XP
 * Level 3: 200 XP
 * Level 4: 346 XP
 * Level 5: 530 XP
 * Level 10: 1,778 XP
 */
export const DEFAULT_XP_CONFIG: XPConfig = {
  baseXP: 100,
  exponent: 1.5,
  partialSuccessMultiplier: 0.5,
};

/**
 * Level up event
 */
export interface LevelUpEvent {
  /** Previous level */
  previousLevel: number;

  /** New level */
  newLevel: number;

  /** XP overflow (XP beyond what was needed) */
  overflow: number;

  /** Timestamp */
  timestamp: number;
}

/**
 * XP gain event
 */
export interface XPGainEvent {
  /** Amount of XP gained */
  amount: number;

  /** Source of XP (task type) */
  source: string;

  /** Task outcome */
  outcome: TaskOutcome;

  /** Whether this triggered a level up */
  leveledUp: boolean;

  /** Level up details if applicable */
  levelUpEvent?: LevelUpEvent;

  /** Timestamp */
  timestamp: number;
}

/**
 * Progression Manager
 * Manages XP, leveling, and progression state
 */
export class ProgressionManager {
  private config: XPConfig;

  constructor(
    private state: ProgressionState,
    private characterStore: CharacterStore,
    config?: Partial<XPConfig>
  ) {
    this.config = { ...DEFAULT_XP_CONFIG, ...config };
  }

  /**
   * Calculate XP required for a specific level
   * @param level - Target level
   * @returns XP required to reach that level from level 1
   */
  calculateXPForLevel(level: number): number {
    if (level <= 1) return 0;

    // Sum XP needed for all levels up to target
    // Level 2 needs baseXP * 1^exponent
    // Level 3 needs baseXP * 2^exponent
    // Level n needs baseXP * (n-1)^exponent
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
      totalXP += Math.floor(this.config.baseXP * Math.pow(i, this.config.exponent));
    }
    return totalXP;
  }

  /**
   * Calculate XP required to reach next level
   * @returns XP needed for next level
   */
  getXPToNextLevel(): number {
    return this.calculateXPForLevel(this.state.level + 1) - this.state.totalXP;
  }

  /**
   * Award XP to the character
   * @param baseAmount - Base XP amount from task
   * @param outcome - Task outcome
   * @param source - Source of XP (task type)
   * @returns XP gain event
   */
  awardXP(baseAmount: number, outcome: TaskOutcome, source: string): XPGainEvent {
    // Calculate final XP based on outcome
    let finalAmount = baseAmount;

    if (outcome === 'partial') {
      finalAmount = Math.floor(baseAmount * this.config.partialSuccessMultiplier);
    } else if (outcome === 'failure') {
      finalAmount = 0; // No XP on failure
    }

    // Add XP to state
    this.state.currentXP += finalAmount;
    this.state.totalXP += finalAmount;

    // Check for level up
    const levelUpEvent = this.checkLevelUp();

    return {
      amount: finalAmount,
      source,
      outcome,
      leveledUp: levelUpEvent !== null,
      levelUpEvent: levelUpEvent ?? undefined,
      timestamp: Date.now(),
    };
  }

  /**
   * Check if character should level up and process it
   * @returns Level up event if leveled up, null otherwise
   */
  private checkLevelUp(): LevelUpEvent | null {
    const xpForNextLevel = this.calculateXPForLevel(this.state.level + 1);

    if (this.state.totalXP >= xpForNextLevel) {
      const previousLevel = this.state.level;

      // Level up character
      this.state.level += 1;
      this.characterStore.levelUp();

      // Calculate new requirements
      const xpForNewLevel = this.calculateXPForLevel(this.state.level + 1);
      this.state.xpToNextLevel = xpForNewLevel - this.state.totalXP;
      this.state.currentXP = this.state.totalXP - xpForNextLevel;

      // Check for multiple level ups (overflow case)
      const nextLevelXP = this.calculateXPForLevel(this.state.level + 1);
      if (this.state.totalXP >= nextLevelXP) {
        // Recursively level up if enough XP
        return this.checkLevelUp();
      }

      return {
        previousLevel,
        newLevel: this.state.level,
        overflow: this.state.currentXP,
        timestamp: Date.now(),
      };
    }

    // Update XP to next level
    this.state.xpToNextLevel = xpForNextLevel - this.state.totalXP;
    this.state.currentXP = this.state.totalXP - this.calculateXPForLevel(this.state.level);

    return null;
  }

  /**
   * Get current progression state
   * @returns Current progression state
   */
  getState(): ProgressionState {
    return { ...this.state };
  }

  /**
   * Get progression progress as percentage (0-100)
   * @returns Progress percentage toward next level
   */
  getProgressPercentage(): number {
    if (this.state.xpToNextLevel === 0) return 100;

    const xpForCurrentLevel = this.calculateXPForLevel(this.state.level);
    const xpForNextLevel = this.calculateXPForLevel(this.state.level + 1);
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const xpProgress = this.state.currentXP;

    return Math.min(100, Math.floor((xpProgress / xpNeeded) * 100));
  }

  /**
   * Get level for a given total XP amount
   * @param totalXP - Total XP amount
   * @returns Calculated level
   */
  getLevelForXP(totalXP: number): number {
    let level = 1;
    while (this.calculateXPForLevel(level + 1) <= totalXP) {
      level++;
    }
    return level;
  }

  /**
   * Calculate XP required for next N levels
   * @param levels - Number of levels to calculate
   * @returns Array of XP requirements
   */
  getXPCurve(levels: number): number[] {
    const curve: number[] = [];
    for (let i = 1; i <= levels; i++) {
      curve.push(this.calculateXPForLevel(i + 1));
    }
    return curve;
  }

  /**
   * Sync progression state with character state
   * Ensures level consistency
   */
  syncWithCharacter(): void {
    // Sync level
    if (this.state.level !== this.characterStore.state.level) {
      this.characterStore.setLevel(this.state.level);
    }
  }
}

/**
 * Create a progression manager
 * @param initialState - Initial progression state
 * @param characterStore - Character store reference
 * @param config - Optional XP configuration
 * @returns Progression manager instance
 */
export function createProgressionManager(
  initialState: ProgressionState,
  characterStore: CharacterStore,
  config?: Partial<XPConfig>
): ProgressionManager {
  return new ProgressionManager(initialState, characterStore, config);
}
