/**
 * Character Class Configuration
 * Defines base stats and growth for each character class
 */

import type { ClassConfig, CharacterClass } from '../../core/types/character';

/**
 * Default starting health for all classes
 */
export const DEFAULT_STARTING_HEALTH = 100;

/**
 * Health gained per level for all classes
 */
export const HEALTH_PER_LEVEL = 10;

/**
 * Vanguard class configuration
 * Stable and safe - balanced stats with emphasis on defense
 * MVP: This is the only available class
 */
export const VANGUARD_CONFIG: ClassConfig = {
  id: 'Vanguard',
  name: 'Vanguard',
  description:
    'A stalwart defender with balanced stats. Excellent for steady progress and safe task completion.',
  baseStats: {
    power: 10,
    defense: 15,
    focus: 10,
    luck: 5,
    health: DEFAULT_STARTING_HEALTH,
    maxHealth: DEFAULT_STARTING_HEALTH,
  },
  statGrowth: {
    power: 2,
    defense: 3,
    focus: 2,
    luck: 1,
    maxHealth: HEALTH_PER_LEVEL,
  },
  available: true,
};

/**
 * Arcanist class configuration
 * High variance, high reward - emphasis on power and luck
 * Post-MVP: Unlockable class
 */
export const ARCANIST_CONFIG: ClassConfig = {
  id: 'Arcanist',
  name: 'Arcanist',
  description:
    'A powerful magic user with high variance. Risk taker who seeks legendary loot and big rewards.',
  baseStats: {
    power: 15,
    defense: 5,
    focus: 8,
    luck: 12,
    health: DEFAULT_STARTING_HEALTH,
    maxHealth: DEFAULT_STARTING_HEALTH,
  },
  statGrowth: {
    power: 3,
    defense: 1,
    focus: 2,
    luck: 3,
    maxHealth: HEALTH_PER_LEVEL,
  },
  available: false,
};

/**
 * Rogue class configuration
 * Utility focused - advantage in short break content
 * Post-MVP: Unlockable class
 */
export const ROGUE_CONFIG: ClassConfig = {
  id: 'Rogue',
  name: 'Rogue',
  description:
    'A cunning adventurer with high focus and utility. Excels at quick content and precise strikes.',
  baseStats: {
    power: 12,
    defense: 8,
    focus: 15,
    luck: 10,
    health: DEFAULT_STARTING_HEALTH,
    maxHealth: DEFAULT_STARTING_HEALTH,
  },
  statGrowth: {
    power: 2,
    defense: 2,
    focus: 3,
    luck: 2,
    maxHealth: HEALTH_PER_LEVEL,
  },
  available: false,
};

/**
 * Map of all class configurations
 */
export const CLASS_CONFIGS: Record<CharacterClass, ClassConfig> = {
  Vanguard: VANGUARD_CONFIG,
  Arcanist: ARCANIST_CONFIG,
  Rogue: ROGUE_CONFIG,
};

/**
 * Get class configuration by class type
 */
export function getClassConfig(classType: CharacterClass): ClassConfig {
  return CLASS_CONFIGS[classType];
}

/**
 * Get all available classes
 */
export function getAvailableClasses(): ClassConfig[] {
  return Object.values(CLASS_CONFIGS).filter((config) => config.available);
}

/**
 * Validate if a class is available for selection
 */
export function isClassAvailable(classType: CharacterClass): boolean {
  return CLASS_CONFIGS[classType].available;
}
