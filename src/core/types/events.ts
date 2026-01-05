/**
 * Event System Type Definitions
 * Defines events that occur during WORK phase to create dynamic gameplay
 */

import { TaskType } from './tasks';

/**
 * Event severity levels
 * Determines visual presentation and impact significance
 */
export type EventSeverity = 'flavor' | 'info' | 'warning' | 'critical';

/**
 * Event categories for organization
 */
export type EventCategory =
  | 'combat' // Combat-related events
  | 'loot' // Item/treasure discoveries
  | 'hazard' // Environmental dangers
  | 'npc' // NPC encounters
  | 'fortune' // Lucky/unlucky occurrences
  | 'equipment' // Equipment durability/breakage
  | 'health' // Health-related events
  | 'economy' // Gold/resource changes
  | 'mystery'; // Strange or unexplained events

/**
 * Visual cue types for canvas rendering
 */
export type VisualCueType =
  | 'sparkle' // Positive effect sparkles
  | 'damage' // Damage indicators
  | 'warning' // Warning flashes
  | 'treasure' // Treasure chest glow
  | 'shield' // Protection effects
  | 'skull' // Danger/death indicators
  | 'star' // Critical success
  | 'question'; // Mystery events

/**
 * Visual cue for canvas rendering
 */
export interface VisualCue {
  /** Type of visual effect */
  type: VisualCueType;

  /** Duration in milliseconds */
  duration: number;

  /** Color (hex or CSS color) */
  color?: string;

  /** Position on canvas (0-1 normalized) */
  position?: {
    x: number;
    y: number;
  };
}

/**
 * Event effects that modify game state
 */
export interface EventEffects {
  /** Success chance modifier (additive, can be negative) */
  successChanceModifier?: number;

  /** Gold gained/lost */
  goldModifier?: number;

  /** HP damage/healing */
  healthModifier?: number;

  /** Materials gained/lost */
  materialsModifier?: number;

  /** Equipment durability damage (0-100) */
  durabilityDamage?: number;

  /** Extra chests gained */
  extraChests?: number;

  /** Loot quality modifier (affects rarity) */
  lootQualityModifier?: number;

  /** XP bonus/penalty */
  xpModifier?: number;
}

/**
 * Game event that occurs during WORK phase
 */
export interface GameEvent {
  /** Unique event ID */
  id: string;

  /** Event severity level */
  severity: EventSeverity;

  /** Event category */
  category: EventCategory;

  /** When the event occurred (timestamp) */
  timestamp: number;

  /** Event message displayed to player */
  message: string;

  /** Effects on game state */
  effects: EventEffects;

  /** Visual cue for canvas rendering (optional) */
  visualCue?: VisualCue;

  /** Whether event has been acknowledged by player */
  acknowledged: boolean;
}

/**
 * Event template for creating events from the event bank
 */
export interface EventTemplate {
  /** Template ID (used for tracking which events have fired) */
  templateId: string;

  /** Event severity level */
  severity: EventSeverity;

  /** Event category */
  category: EventCategory;

  /** Message templates (can include placeholders like {damage}, {gold}) */
  messages: string[];

  /** Effects range (will be randomized within range) */
  effects: EventEffectsRange;

  /** Visual cue configuration */
  visualCue?: Omit<VisualCue, 'duration'> & { duration?: number };

  /** Conditions for this event to be eligible */
  conditions?: EventConditions;

  /** Weight for probability (higher = more likely) */
  weight: number;

  /** Applicable task types (empty = all tasks) */
  applicableTasks: TaskType[];

  /** Can this event fire multiple times in one session? */
  repeatable: boolean;
}

/**
 * Event effects with randomizable ranges
 */
export interface EventEffectsRange {
  successChanceModifier?: {
    min: number;
    max: number;
  };

  goldModifier?: {
    min: number;
    max: number;
  };

  healthModifier?: {
    min: number;
    max: number;
  };

  materialsModifier?: {
    min: number;
    max: number;
  };

  durabilityDamage?: {
    min: number;
    max: number;
  };

  extraChests?: {
    min: number;
    max: number;
  };

  lootQualityModifier?: {
    min: number;
    max: number;
  };

  xpModifier?: {
    min: number;
    max: number;
  };
}

/**
 * Conditions that must be met for an event to be eligible
 */
export interface EventConditions {
  /** Minimum character level */
  minLevel?: number;

  /** Maximum character level */
  maxLevel?: number;

  /** Minimum current HP percentage (0-100) */
  minHealthPercent?: number;

  /** Maximum current HP percentage (0-100) */
  maxHealthPercent?: number;

  /** Requires character to be injured */
  requiresInjury?: boolean;

  /** Requires character to NOT be injured */
  requiresNotInjured?: boolean;

  /** Minimum gold */
  minGold?: number;

  /** Requires equipped weapon */
  requiresWeapon?: boolean;

  /** Requires equipped armor */
  requiresArmor?: boolean;

  /** Custom condition function (advanced) */
  customCondition?: (context: EventConditionContext) => boolean;
}

/**
 * Context provided to event conditions for evaluation
 */
export interface EventConditionContext {
  characterLevel: number;
  currentHealth: number;
  maxHealth: number;
  isInjured: boolean;
  gold: number;
  hasWeapon: boolean;
  hasArmor: boolean;
  taskType: TaskType;
  taskProgress: number;
  eventCount: number;
}

/**
 * Event generation configuration
 */
export interface EventGenerationConfig {
  /** Minimum time between events in milliseconds */
  minTimeBetweenEvents: number;

  /** Maximum time between events in milliseconds */
  maxTimeBetweenEvents: number;

  /** Maximum number of events per work session */
  maxEventsPerSession: number;

  /** Probability distribution by severity */
  severityWeights: {
    flavor: number;
    info: number;
    warning: number;
    critical: number;
  };

  /** Whether events are enabled */
  enabled: boolean;
}

/**
 * Event log entry (simplified for display)
 */
export interface EventLogEntry {
  id: string;
  timestamp: number;
  message: string;
  severity: EventSeverity;
  category: EventCategory;
  effectsSummary?: string;
}
