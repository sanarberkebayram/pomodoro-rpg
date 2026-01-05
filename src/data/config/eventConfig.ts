/**
 * Event System Configuration
 * Centralized configuration for event generation and probabilities
 */

import { EventGenerationConfig } from '@/core/types/events';
import { TaskType } from '@/core/types/tasks';

/**
 * Default event generation configuration for production
 * Optimized for Pomodoro focus (minimal disruption)
 */
export const PRODUCTION_EVENT_CONFIG: EventGenerationConfig = {
  // ~1 event per 2 minutes (120 seconds)
  minTimeBetweenEvents: 90_000, // 1.5 minutes
  maxTimeBetweenEvents: 150_000, // 2.5 minutes

  // Maximum 10 events in a 25-minute work session
  maxEventsPerSession: 10,

  // Probability distribution heavily favoring non-disruptive events
  severityWeights: {
    flavor: 50, // 50% - Atmospheric only, no gameplay effect
    info: 30, // 30% - Small effects
    warning: 15, // 15% - Noticeable effects
    critical: 5, // 5% - Significant effects
  },

  enabled: true,
};

/**
 * Development event configuration
 * Faster event generation for testing
 */
export const DEVELOPMENT_EVENT_CONFIG: EventGenerationConfig = {
  minTimeBetweenEvents: 10_000, // 10 seconds
  maxTimeBetweenEvents: 20_000, // 20 seconds
  maxEventsPerSession: 50,
  severityWeights: {
    flavor: 25,
    info: 35,
    warning: 25,
    critical: 15,
  },
  enabled: true,
};

/**
 * Testing event configuration
 * Immediate events for unit tests
 */
export const TEST_EVENT_CONFIG: EventGenerationConfig = {
  minTimeBetweenEvents: 0,
  maxTimeBetweenEvents: 0,
  maxEventsPerSession: 100,
  severityWeights: {
    flavor: 25,
    info: 25,
    warning: 25,
    critical: 25,
  },
  enabled: true,
};

/**
 * Disabled event configuration
 */
export const DISABLED_EVENT_CONFIG: EventGenerationConfig = {
  minTimeBetweenEvents: 0,
  maxTimeBetweenEvents: 0,
  maxEventsPerSession: 0,
  severityWeights: {
    flavor: 0,
    info: 0,
    warning: 0,
    critical: 0,
  },
  enabled: false,
};

/**
 * Task-specific event rate modifiers
 * Some tasks generate events more frequently than others
 */
export const TASK_EVENT_RATE_MODIFIERS: Record<TaskType, number> = {
  raid: 1.2, // 20% more events (dangerous)
  expedition: 1.0, // Normal rate
  craft: 0.7, // 30% fewer events (safer)
  hunt: 1.1, // 10% more events
  rest: 0.5, // 50% fewer events (very safe)
};

/**
 * Severity probability adjustments by task type
 * Different tasks have different risk profiles
 */
export const TASK_SEVERITY_ADJUSTMENTS: Record<TaskType, EventGenerationConfig['severityWeights']> =
  {
    raid: {
      flavor: 30, // Less flavor
      info: 25,
      warning: 25, // More warnings
      critical: 20, // More critical
    },
    expedition: {
      flavor: 50,
      info: 30,
      warning: 15,
      critical: 5,
    },
    craft: {
      flavor: 60, // Very safe
      info: 30,
      warning: 8,
      critical: 2,
    },
    hunt: {
      flavor: 40,
      info: 30,
      warning: 20,
      critical: 10,
    },
    rest: {
      flavor: 80, // Almost all flavor
      info: 15,
      warning: 4,
      critical: 1,
    },
  };

/**
 * Get event configuration for a specific task type
 */
export function getTaskEventConfig(
  taskType: TaskType,
  baseConfig: EventGenerationConfig = PRODUCTION_EVENT_CONFIG
): EventGenerationConfig {
  const rateModifier = TASK_EVENT_RATE_MODIFIERS[taskType];
  const severityAdjustments = TASK_SEVERITY_ADJUSTMENTS[taskType];

  return {
    ...baseConfig,
    minTimeBetweenEvents: Math.floor(baseConfig.minTimeBetweenEvents / rateModifier),
    maxTimeBetweenEvents: Math.floor(baseConfig.maxTimeBetweenEvents / rateModifier),
    severityWeights: severityAdjustments,
  };
}

/**
 * Get configuration based on environment
 */
export function getEnvironmentConfig(): EventGenerationConfig {
  // Check if in development mode
  if (import.meta.env.DEV) {
    return DEVELOPMENT_EVENT_CONFIG;
  }

  // Check if in test mode
  if (import.meta.env.MODE === 'test') {
    return TEST_EVENT_CONFIG;
  }

  // Production
  return PRODUCTION_EVENT_CONFIG;
}

/**
 * Event system feature flags
 */
export const EVENT_FEATURE_FLAGS = {
  /** Enable visual cues on canvas */
  enableVisualCues: true,

  /** Enable toast notifications */
  enableToasts: true,

  /** Enable event log */
  enableEventLog: true,

  /** Enable event sound effects (future feature) */
  enableSounds: false,

  /** Enable event analytics tracking */
  enableAnalytics: false,

  /** Debug mode - shows all event details */
  debugMode: import.meta.env.DEV,
};

/**
 * Event balancing parameters
 */
export const EVENT_BALANCING = {
  /** Maximum gold gain from a single event */
  maxGoldGain: 150,

  /** Maximum gold loss from a single event */
  maxGoldLoss: -80,

  /** Maximum HP damage from a single event */
  maxHealthDamage: -60,

  /** Maximum HP heal from a single event */
  maxHealthHeal: 100,

  /** Maximum success chance modifier (positive) */
  maxSuccessBonus: 25,

  /** Maximum success chance modifier (negative) */
  maxSuccessPenalty: -15,

  /** Maximum materials gain from a single event */
  maxMaterialsGain: 50,

  /** Maximum equipment durability damage */
  maxDurabilityDamage: 60,

  /** Maximum extra chests from events */
  maxExtraChests: 1,

  /** Maximum XP gain from a single event */
  maxXpGain: 150,
};
