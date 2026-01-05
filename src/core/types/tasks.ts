/**
 * Task System Type Definitions
 * Defines work tasks that execute during WORK phase of Pomodoro cycle
 */

/**
 * Task types available in the game
 * MVP: Expedition and Raid
 * Post-MVP: Craft, Hunt, Rest
 */
export type TaskType = 'expedition' | 'raid' | 'craft' | 'hunt' | 'rest';

/**
 * Risk levels that affect success chance and rewards
 * Higher risk = lower success chance + higher rewards
 */
export type RiskLevel = 'safe' | 'standard' | 'risky';

/**
 * Task outcome after completion
 */
export type TaskOutcome = 'success' | 'partial' | 'failure';

/**
 * Task configuration defining characteristics
 */
export interface TaskConfig {
  /** Task identifier */
  id: TaskType;

  /** Display name */
  name: string;

  /** Task description */
  description: string;

  /** Base success chance percentage (0-100) before stat modifiers */
  baseSuccessChance: number;

  /** Primary stat that affects this task */
  primaryStat: 'power' | 'focus' | 'luck';

  /** Risk level modifiers */
  riskModifiers: {
    safe: RiskLevelModifier;
    standard: RiskLevelModifier;
    risky: RiskLevelModifier;
  };

  /** Base rewards for successful completion */
  rewards: TaskRewards;

  /** Injury chance on failure (0-100) */
  injuryChanceOnFailure: number;

  /** Whether this task is available in MVP */
  available: boolean;

  /** Minimum level required to unlock */
  minLevel: number;
}

/**
 * Risk level modifiers
 */
export interface RiskLevelModifier {
  /** Success chance modifier (additive, can be negative) */
  successChanceModifier: number;

  /** Reward multiplier (1.0 = base rewards) */
  rewardMultiplier: number;

  /** Display name for this risk level */
  displayName: string;

  /** Description of risk/reward tradeoff */
  description: string;
}

/**
 * Task rewards structure
 */
export interface TaskRewards {
  /** Gold reward range */
  gold: {
    min: number;
    max: number;
  };

  /** XP reward range */
  xp: {
    min: number;
    max: number;
  };

  /** Materials (crafting items) reward range */
  materials: {
    min: number;
    max: number;
  };

  /** Number of loot chests to award */
  chests: number;

  /** Loot quality modifier (affects rarity) */
  lootQuality: number;
}

/**
 * Active task state
 */
export interface ActiveTask {
  /** Task type being executed */
  taskType: TaskType;

  /** Selected risk level */
  riskLevel: RiskLevel;

  /** Task configuration reference */
  config: TaskConfig;

  /** When the task started (timestamp) */
  startedAt: number;

  /** Calculated success chance at task start (0-100) */
  calculatedSuccessChance: number;

  /** Task progress (0-100) - updated during WORK phase */
  progress: number;

  /** Random events that occurred during task */
  events: TaskEvent[];

  /** Final outcome (set when task completes) */
  outcome: TaskOutcome | null;

  /** Rewards earned (set when task completes) */
  earnedRewards: TaskRewards | null;
}

/**
 * Task event that occurs during execution
 */
export interface TaskEvent {
  /** Unique event ID */
  id: string;

  /** Event timestamp */
  timestamp: number;

  /** Event message */
  message: string;

  /** Event severity */
  severity: 'flavor' | 'info' | 'warning' | 'critical';

  /** Effects on task outcome */
  effects: {
    /** Success chance modifier */
    successChanceModifier?: number;

    /** Gold modifier */
    goldModifier?: number;

    /** HP damage/heal */
    healthModifier?: number;

    /** Materials modifier */
    materialsModifier?: number;
  };
}

/**
 * Task completion result
 */
export interface TaskCompletionResult {
  /** Task that was completed */
  task: ActiveTask;

  /** Final outcome */
  outcome: TaskOutcome;

  /** Rewards earned */
  rewards: TaskRewards;

  /** Whether character was injured */
  wasInjured: boolean;

  /** Injury severity if injured */
  injurySeverity: 'minor' | 'moderate' | 'severe' | null;

  /** Total events that occurred */
  eventCount: number;

  /** Summary message */
  summary: string;
}

/**
 * Task state in game state
 */
export interface TaskState {
  /** Currently active task (null if none) */
  activeTask: ActiveTask | null;

  /** Last completed task (for display in break phase) */
  lastCompletedTask: TaskCompletionResult | null;

  /** Task history (limited to last 10) */
  taskHistory: TaskCompletionResult[];

  /** Available tasks (filtered by level, etc.) */
  availableTasks: TaskType[];

  /** Task statistics */
  statistics: TaskStatistics;
}

/**
 * Task statistics tracking
 */
export interface TaskStatistics {
  /** Total tasks started */
  totalStarted: number;

  /** Total tasks completed successfully */
  totalSucceeded: number;

  /** Total partial successes */
  totalPartial: number;

  /** Total failures */
  totalFailed: number;

  /** Statistics per task type */
  byType: {
    [K in TaskType]?: {
      started: number;
      succeeded: number;
      partial: number;
      failed: number;
    };
  };

  /** Statistics per risk level */
  byRisk: {
    [K in RiskLevel]?: {
      started: number;
      succeeded: number;
      partial: number;
      failed: number;
    };
  };
}

/**
 * Task selection context
 * Used to determine which tasks are available and what success chances are
 */
export interface TaskSelectionContext {
  /** Character level */
  characterLevel: number;

  /** Character computed stats */
  characterStats: {
    power: number;
    defense: number;
    focus: number;
    luck: number;
    health: number;
  };

  /** Whether character is injured */
  isInjured: boolean;

  /** Injury success penalty if injured */
  injuryPenalty: number;

  /** Hospital bill penalty if unpaid */
  billPenalty: number;

  /** Equipped items providing bonuses */
  equipmentBonuses: {
    power: number;
    defense: number;
    focus: number;
    luck: number;
  };
}

/**
 * Success calculation result
 */
export interface SuccessCalculation {
  /** Base success chance from task config */
  baseChance: number;

  /** Modifier from character stats */
  statModifier: number;

  /** Modifier from equipment */
  equipmentModifier: number;

  /** Modifier from risk level */
  riskModifier: number;

  /** Penalty from injury */
  injuryPenalty: number;

  /** Penalty from unpaid hospital bills */
  billPenalty: number;

  /** Modifier from task events */
  eventModifier: number;

  /** Final calculated success chance (0-100) */
  finalChance: number;

  /** Breakdown for display */
  breakdown: string[];
}
