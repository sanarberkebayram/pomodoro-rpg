/**
 * Task Configuration Data
 * Defines characteristics and rewards for all task types
 */

import type { TaskConfig, TaskType } from '../../core/types/tasks';

/**
 * Expedition Task Configuration
 * Stable, exploration-focused task
 * - Lower risk, consistent rewards
 * - Primary stat: Focus
 * - Good for materials and steady progression
 */
const EXPEDITION_CONFIG: TaskConfig = {
  id: 'expedition',
  name: 'Expedition',
  description:
    'Venture into uncharted territories to gather materials and discover hidden treasures. A balanced approach with moderate risk and steady rewards.',
  baseSuccessChance: 60,
  primaryStat: 'focus',
  riskModifiers: {
    safe: {
      successChanceModifier: 15,
      rewardMultiplier: 0.7,
      displayName: 'Safe Route',
      description: 'Take the well-traveled path. Higher success chance but lower rewards.',
    },
    standard: {
      successChanceModifier: 0,
      rewardMultiplier: 1.0,
      displayName: 'Standard Route',
      description: 'Balance risk and reward. Standard success chance and rewards.',
    },
    risky: {
      successChanceModifier: -20,
      rewardMultiplier: 1.5,
      displayName: 'Dangerous Route',
      description: 'Venture into perilous areas. Lower success chance but much higher rewards.',
    },
  },
  rewards: {
    gold: {
      min: 15,
      max: 30,
    },
    xp: {
      min: 20,
      max: 40,
    },
    materials: {
      min: 3,
      max: 8,
    },
    chests: 1,
    lootQuality: 1.0,
  },
  injuryChanceOnFailure: 20,
  available: true,
  minLevel: 1,
};

/**
 * Raid Task Configuration
 * High-risk, high-reward combat task
 * - Higher risk, better loot
 * - Primary stat: Power
 * - Best for equipment and gold
 */
const RAID_CONFIG: TaskConfig = {
  id: 'raid',
  name: 'Raid',
  description:
    'Attack enemy strongholds for valuable loot and gold. High risk, high reward. Prepare for combat!',
  baseSuccessChance: 50,
  primaryStat: 'power',
  riskModifiers: {
    safe: {
      successChanceModifier: 20,
      rewardMultiplier: 0.6,
      displayName: 'Outpost Raid',
      description: 'Target a lightly defended outpost. Higher success, modest rewards.',
    },
    standard: {
      successChanceModifier: 0,
      rewardMultiplier: 1.0,
      displayName: 'Fortress Raid',
      description: 'Attack a standard fortress. Balanced risk and reward.',
    },
    risky: {
      successChanceModifier: -25,
      rewardMultiplier: 1.8,
      displayName: 'Citadel Raid',
      description: 'Assault a heavily fortified citadel. Very dangerous but incredible rewards.',
    },
  },
  rewards: {
    gold: {
      min: 25,
      max: 50,
    },
    xp: {
      min: 30,
      max: 60,
    },
    materials: {
      min: 1,
      max: 4,
    },
    chests: 2,
    lootQuality: 1.3,
  },
  injuryChanceOnFailure: 35,
  available: true,
  minLevel: 1,
};

/**
 * Craft Task Configuration (Post-MVP)
 * Low-risk, item-focused task
 * - Lowest risk, crafting-oriented
 * - Primary stat: Focus
 * - Best for consumables and crafting materials
 */
const CRAFT_CONFIG: TaskConfig = {
  id: 'craft',
  name: 'Crafting',
  description: 'Spend time crafting equipment, potions, and consumables. Safe and productive.',
  baseSuccessChance: 75,
  primaryStat: 'focus',
  riskModifiers: {
    safe: {
      successChanceModifier: 10,
      rewardMultiplier: 0.8,
      displayName: 'Simple Crafts',
      description: 'Craft basic items. Very safe, modest output.',
    },
    standard: {
      successChanceModifier: 0,
      rewardMultiplier: 1.0,
      displayName: 'Standard Crafts',
      description: 'Craft intermediate items. Balanced effort and output.',
    },
    risky: {
      successChanceModifier: -15,
      rewardMultiplier: 1.4,
      displayName: 'Master Crafts',
      description: 'Attempt complex recipes. Risk of failure but exceptional results.',
    },
  },
  rewards: {
    gold: {
      min: 10,
      max: 20,
    },
    xp: {
      min: 15,
      max: 30,
    },
    materials: {
      min: 5,
      max: 12,
    },
    chests: 1,
    lootQuality: 0.8,
  },
  injuryChanceOnFailure: 5,
  available: false, // Post-MVP
  minLevel: 3,
};

/**
 * Hunt Task Configuration (Post-MVP)
 * Moderate risk, luck-based task
 * - Moderate risk, variable rewards
 * - Primary stat: Luck
 * - Best for rare materials and unique items
 */
const HUNT_CONFIG: TaskConfig = {
  id: 'hunt',
  name: 'Hunt',
  description:
    'Track and hunt wild creatures for rare materials and pelts. Luck plays a major role.',
  baseSuccessChance: 55,
  primaryStat: 'luck',
  riskModifiers: {
    safe: {
      successChanceModifier: 15,
      rewardMultiplier: 0.7,
      displayName: 'Small Game',
      description: 'Hunt common creatures. Safer but less valuable.',
    },
    standard: {
      successChanceModifier: 0,
      rewardMultiplier: 1.0,
      displayName: 'Medium Game',
      description: 'Hunt standard creatures. Balanced risk and reward.',
    },
    risky: {
      successChanceModifier: -20,
      rewardMultiplier: 1.6,
      displayName: 'Legendary Beast',
      description: 'Hunt rare and dangerous creatures. High risk, exceptional rewards.',
    },
  },
  rewards: {
    gold: {
      min: 20,
      max: 40,
    },
    xp: {
      min: 25,
      max: 50,
    },
    materials: {
      min: 4,
      max: 10,
    },
    chests: 2,
    lootQuality: 1.5,
  },
  injuryChanceOnFailure: 30,
  available: false, // Post-MVP
  minLevel: 2,
};

/**
 * Rest Task Configuration (Post-MVP)
 * No-risk, recovery-focused task
 * - Zero risk, healing and recovery
 * - No primary stat
 * - Best for healing injuries and recovering
 */
const REST_CONFIG: TaskConfig = {
  id: 'rest',
  name: 'Rest & Recovery',
  description:
    'Take a break to rest and recover. Heals injuries and restores health. No risk of failure.',
  baseSuccessChance: 100,
  primaryStat: 'focus',
  riskModifiers: {
    safe: {
      successChanceModifier: 0,
      rewardMultiplier: 1.0,
      displayName: 'Light Rest',
      description: 'Gentle recovery. Modest healing.',
    },
    standard: {
      successChanceModifier: 0,
      rewardMultiplier: 1.0,
      displayName: 'Full Rest',
      description: 'Complete rest. Good healing.',
    },
    risky: {
      successChanceModifier: 0,
      rewardMultiplier: 1.0,
      displayName: 'Deep Rest',
      description: 'Extended rest. Maximum healing.',
    },
  },
  rewards: {
    gold: {
      min: 5,
      max: 10,
    },
    xp: {
      min: 10,
      max: 20,
    },
    materials: {
      min: 0,
      max: 1,
    },
    chests: 0,
    lootQuality: 0.5,
  },
  injuryChanceOnFailure: 0,
  available: false, // Post-MVP
  minLevel: 1,
};

/**
 * All task configurations
 */
const TASK_CONFIGS: Record<TaskType, TaskConfig> = {
  expedition: EXPEDITION_CONFIG,
  raid: RAID_CONFIG,
  craft: CRAFT_CONFIG,
  hunt: HUNT_CONFIG,
  rest: REST_CONFIG,
};

/**
 * Get task configuration by type
 */
export function getTaskConfig(taskType: TaskType): TaskConfig {
  const config = TASK_CONFIGS[taskType];
  if (!config) {
    throw new Error(`Unknown task type: ${taskType}`);
  }
  return config;
}

/**
 * Get all available task configurations
 * Filters by availability flag
 */
export function getAvailableTaskConfigs(): TaskConfig[] {
  return Object.values(TASK_CONFIGS).filter((config) => config.available);
}

/**
 * Get task configurations available for a character level
 */
export function getTaskConfigsForLevel(level: number): TaskConfig[] {
  return Object.values(TASK_CONFIGS).filter(
    (config) => config.available && config.minLevel <= level
  );
}

/**
 * Check if a task is available for a character level
 */
export function isTaskAvailable(taskType: TaskType, level: number): boolean {
  const config = TASK_CONFIGS[taskType];
  return config ? config.available && config.minLevel <= level : false;
}

/**
 * Export individual configs for convenience
 */
export { EXPEDITION_CONFIG, RAID_CONFIG, CRAFT_CONFIG, HUNT_CONFIG, REST_CONFIG };
