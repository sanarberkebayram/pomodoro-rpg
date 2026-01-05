/**
 * Event System-Specific Types
 * Internal types used by the event generation and management system
 */

import { TaskType } from '@/core/types/tasks';
import { EventTemplate, GameEvent, EventConditionContext } from '@/core/types/events';

/**
 * Event bank - collection of event templates organized by category
 */
export interface EventBank {
  /** All event templates */
  templates: EventTemplate[];

  /** Templates organized by severity for quick filtering */
  bySeverity: {
    flavor: EventTemplate[];
    info: EventTemplate[];
    warning: EventTemplate[];
    critical: EventTemplate[];
  };

  /** Templates organized by category */
  byCategory: {
    combat: EventTemplate[];
    loot: EventTemplate[];
    hazard: EventTemplate[];
    npc: EventTemplate[];
    fortune: EventTemplate[];
    equipment: EventTemplate[];
    health: EventTemplate[];
    economy: EventTemplate[];
    mystery: EventTemplate[];
  };

  /** Templates organized by applicable task types */
  byTaskType: {
    [K in TaskType]?: EventTemplate[];
  };
}

/**
 * Event generation state
 */
export interface EventGeneratorState {
  /** Timestamp of last generated event */
  lastEventTimestamp: number;

  /** Events generated in current work session */
  currentSessionEvents: GameEvent[];

  /** Template IDs that have already fired (for non-repeatable events) */
  firedTemplateIds: Set<string>;

  /** Whether event generation is paused */
  isPaused: boolean;

  /** Next scheduled event time (timestamp) */
  nextEventTime: number | null;
}

/**
 * Event selection criteria for filtering eligible events
 */
export interface EventSelectionCriteria {
  /** Current task type */
  taskType: TaskType;

  /** Preferred severity (optional - will be weighted by config) */
  preferredSeverity?: 'flavor' | 'info' | 'warning' | 'critical';

  /** Condition context for evaluating event conditions */
  conditionContext: EventConditionContext;

  /** Templates to exclude (already fired non-repeatables) */
  excludeTemplateIds: Set<string>;
}

/**
 * Event generation result
 */
export interface EventGenerationResult {
  /** Whether an event was generated */
  success: boolean;

  /** Generated event (if success = true) */
  event?: GameEvent;

  /** Reason if generation failed */
  reason?: string;

  /** When the next event attempt should occur */
  nextAttemptTime: number;
}

/**
 * Weighted template for selection
 */
export interface WeightedEventTemplate {
  template: EventTemplate;
  weight: number;
}
