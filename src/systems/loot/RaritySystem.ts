/**
 * Rarity System
 * Defines rarity configurations and provides rarity selection logic
 */

import type { ItemRarity, RarityConfig } from '../../core/types/items';
import { weightedRandom } from '../../utils/random';

/**
 * Rarity configuration map
 * Defines display properties, drop weights, and stat multipliers for each rarity
 */
export const RARITY_CONFIGS: Record<ItemRarity, RarityConfig> = {
  common: {
    rarity: 'common',
    name: 'Common',
    color: '#9CA3AF', // Gray
    statMultiplier: 1.0,
    valueMultiplier: 1.0,
    dropWeight: 100, // Most common
  },
  uncommon: {
    rarity: 'uncommon',
    name: 'Uncommon',
    color: '#10B981', // Green
    statMultiplier: 1.3,
    valueMultiplier: 1.5,
    dropWeight: 40,
  },
  rare: {
    rarity: 'rare',
    name: 'Rare',
    color: '#3B82F6', // Blue
    statMultiplier: 1.6,
    valueMultiplier: 2.5,
    dropWeight: 15,
  },
  epic: {
    rarity: 'epic',
    name: 'Epic',
    color: '#A855F7', // Purple
    statMultiplier: 2.0,
    valueMultiplier: 4.0,
    dropWeight: 5,
  },
  legendary: {
    rarity: 'legendary',
    name: 'Legendary',
    color: '#F59E0B', // Gold/Orange
    statMultiplier: 2.5,
    valueMultiplier: 7.0,
    dropWeight: 1, // Rarest
  },
};

/**
 * Get rarity configuration by rarity level
 */
export function getRarityConfig(rarity: ItemRarity): RarityConfig {
  return RARITY_CONFIGS[rarity];
}

/**
 * Get all rarity configurations
 */
export function getAllRarityConfigs(): RarityConfig[] {
  return Object.values(RARITY_CONFIGS);
}

/**
 * Select a random rarity based on base drop weights and luck modifier
 * @param luckModifier - Character luck stat that increases chance of better rarities (0+)
 * @returns Selected rarity
 */
export function selectRarity(luckModifier: number = 0): ItemRarity {
  // Apply luck modifier to shift probabilities toward higher rarities
  // Luck increases weight of higher rarities exponentially
  const rarities: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

  const weightedRarities = rarities.map((rarity, index) => {
    const config = RARITY_CONFIGS[rarity];
    // Luck bonus increases with rarity tier (more impact on rare items)
    const luckBonus = Math.pow(1 + luckModifier * 0.02, index);
    return {
      item: rarity,
      weight: config.dropWeight * luckBonus,
    };
  });

  return weightedRandom(weightedRarities);
}

/**
 * Calculate the effective stat value with rarity multiplier applied
 * @param baseStat - Base stat value
 * @param rarity - Item rarity
 * @returns Multiplied stat value (rounded)
 */
export function applyRarityMultiplier(baseStat: number, rarity: ItemRarity): number {
  const config = RARITY_CONFIGS[rarity];
  return Math.round(baseStat * config.statMultiplier);
}

/**
 * Calculate the effective item value with rarity multiplier applied
 * @param baseValue - Base gold value
 * @param rarity - Item rarity
 * @returns Multiplied value (rounded)
 */
export function applyValueMultiplier(baseValue: number, rarity: ItemRarity): number {
  const config = RARITY_CONFIGS[rarity];
  return Math.round(baseValue * config.valueMultiplier);
}

/**
 * Get rarity display color for UI
 */
export function getRarityColor(rarity: ItemRarity): string {
  return RARITY_CONFIGS[rarity].color;
}

/**
 * Get rarity display name
 */
export function getRarityName(rarity: ItemRarity): string {
  return RARITY_CONFIGS[rarity].name;
}

/**
 * Compare two rarities
 * @returns positive if rarity1 > rarity2, negative if rarity1 < rarity2, 0 if equal
 */
export function compareRarity(rarity1: ItemRarity, rarity2: ItemRarity): number {
  const rarityOrder: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  return rarityOrder.indexOf(rarity1) - rarityOrder.indexOf(rarity2);
}

/**
 * Check if rarity is better than another
 */
export function isBetterRarity(rarity1: ItemRarity, rarity2: ItemRarity): boolean {
  return compareRarity(rarity1, rarity2) > 0;
}

/**
 * Get rarity tier index (0-4)
 */
export function getRarityTier(rarity: ItemRarity): number {
  const rarityOrder: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  return rarityOrder.indexOf(rarity);
}

/**
 * Rarity system statistics
 */
export interface RarityStats {
  totalDrops: number;
  byRarity: Record<ItemRarity, number>;
}

/**
 * Create empty rarity stats
 */
export function createRarityStats(): RarityStats {
  return {
    totalDrops: 0,
    byRarity: {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    },
  };
}

/**
 * Record a rarity drop in statistics
 */
export function recordRarityDrop(stats: RarityStats, rarity: ItemRarity): RarityStats {
  return {
    totalDrops: stats.totalDrops + 1,
    byRarity: {
      ...stats.byRarity,
      [rarity]: stats.byRarity[rarity] + 1,
    },
  };
}

/**
 * Calculate drop rate percentage for each rarity
 */
export function calculateDropRates(stats: RarityStats): Record<ItemRarity, number> {
  if (stats.totalDrops === 0) {
    return {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };
  }

  return {
    common: (stats.byRarity.common / stats.totalDrops) * 100,
    uncommon: (stats.byRarity.uncommon / stats.totalDrops) * 100,
    rare: (stats.byRarity.rare / stats.totalDrops) * 100,
    epic: (stats.byRarity.epic / stats.totalDrops) * 100,
    legendary: (stats.byRarity.legendary / stats.totalDrops) * 100,
  };
}
