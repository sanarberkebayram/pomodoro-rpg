/**
 * Rarity System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  RARITY_CONFIGS,
  getRarityConfig,
  getAllRarityConfigs,
  selectRarity,
  applyRarityMultiplier,
  applyValueMultiplier,
  getRarityColor,
  getRarityName,
  compareRarity,
  isBetterRarity,
  getRarityTier,
  createRarityStats,
  recordRarityDrop,
  calculateDropRates,
} from '../../../../src/systems/loot/RaritySystem';
import type { ItemRarity } from '../../../../src/core/types/items';

describe('RaritySystem', () => {
  describe('RARITY_CONFIGS', () => {
    it('should have configs for all rarities', () => {
      const rarities: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      rarities.forEach((rarity) => {
        expect(RARITY_CONFIGS[rarity]).toBeDefined();
        expect(RARITY_CONFIGS[rarity].rarity).toBe(rarity);
      });
    });

    it('should have increasing stat multipliers', () => {
      expect(RARITY_CONFIGS.common.statMultiplier).toBe(1.0);
      expect(RARITY_CONFIGS.uncommon.statMultiplier).toBeGreaterThan(
        RARITY_CONFIGS.common.statMultiplier
      );
      expect(RARITY_CONFIGS.rare.statMultiplier).toBeGreaterThan(
        RARITY_CONFIGS.uncommon.statMultiplier
      );
      expect(RARITY_CONFIGS.epic.statMultiplier).toBeGreaterThan(
        RARITY_CONFIGS.rare.statMultiplier
      );
      expect(RARITY_CONFIGS.legendary.statMultiplier).toBeGreaterThan(
        RARITY_CONFIGS.epic.statMultiplier
      );
    });

    it('should have decreasing drop weights', () => {
      expect(RARITY_CONFIGS.common.dropWeight).toBeGreaterThan(RARITY_CONFIGS.uncommon.dropWeight);
      expect(RARITY_CONFIGS.uncommon.dropWeight).toBeGreaterThan(RARITY_CONFIGS.rare.dropWeight);
      expect(RARITY_CONFIGS.rare.dropWeight).toBeGreaterThan(RARITY_CONFIGS.epic.dropWeight);
      expect(RARITY_CONFIGS.epic.dropWeight).toBeGreaterThan(RARITY_CONFIGS.legendary.dropWeight);
    });
  });

  describe('getRarityConfig', () => {
    it('should return correct config for each rarity', () => {
      const config = getRarityConfig('rare');
      expect(config.rarity).toBe('rare');
      expect(config.name).toBe('Rare');
    });
  });

  describe('getAllRarityConfigs', () => {
    it('should return all rarity configs', () => {
      const configs = getAllRarityConfigs();
      expect(configs).toHaveLength(5);
    });
  });

  describe('selectRarity', () => {
    it('should select a rarity without luck modifier', () => {
      const rarity = selectRarity(0);
      expect(['common', 'uncommon', 'rare', 'epic', 'legendary']).toContain(rarity);
    });

    it('should select rarity with luck modifier', () => {
      // With high luck, should have better chance for rare items
      // Run multiple times to test distribution
      const rarities: ItemRarity[] = [];
      for (let i = 0; i < 100; i++) {
        rarities.push(selectRarity(50)); // High luck
      }

      // Should have at least some non-common items
      const hasNonCommon = rarities.some((r) => r !== 'common');
      expect(hasNonCommon).toBe(true);
    });

    it('should mostly return common with zero luck', () => {
      const rarities: ItemRarity[] = [];
      for (let i = 0; i < 50; i++) {
        rarities.push(selectRarity(0));
      }

      const commonCount = rarities.filter((r) => r === 'common').length;
      // Should be mostly common (at least 60% with base weights)
      expect(commonCount).toBeGreaterThan(25);
    });
  });

  describe('applyRarityMultiplier', () => {
    it('should apply correct multiplier for common', () => {
      expect(applyRarityMultiplier(10, 'common')).toBe(10);
    });

    it('should apply correct multiplier for uncommon', () => {
      const result = applyRarityMultiplier(10, 'uncommon');
      expect(result).toBe(13); // 10 * 1.3 = 13
    });

    it('should apply correct multiplier for legendary', () => {
      const result = applyRarityMultiplier(10, 'legendary');
      expect(result).toBe(25); // 10 * 2.5 = 25
    });

    it('should round to nearest integer', () => {
      const result = applyRarityMultiplier(7, 'uncommon');
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('applyValueMultiplier', () => {
    it('should apply correct value multiplier', () => {
      expect(applyValueMultiplier(100, 'common')).toBe(100);
      expect(applyValueMultiplier(100, 'uncommon')).toBe(150);
    });

    it('should round to nearest integer', () => {
      const result = applyValueMultiplier(17, 'uncommon');
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('getRarityColor', () => {
    it('should return correct color for each rarity', () => {
      expect(getRarityColor('common')).toBe('#9CA3AF');
      expect(getRarityColor('uncommon')).toBe('#10B981');
      expect(getRarityColor('rare')).toBe('#3B82F6');
      expect(getRarityColor('epic')).toBe('#A855F7');
      expect(getRarityColor('legendary')).toBe('#F59E0B');
    });
  });

  describe('getRarityName', () => {
    it('should return correct display name', () => {
      expect(getRarityName('common')).toBe('Common');
      expect(getRarityName('legendary')).toBe('Legendary');
    });
  });

  describe('compareRarity', () => {
    it('should return positive when first is better', () => {
      expect(compareRarity('rare', 'common')).toBeGreaterThan(0);
    });

    it('should return negative when first is worse', () => {
      expect(compareRarity('common', 'rare')).toBeLessThan(0);
    });

    it('should return zero when equal', () => {
      expect(compareRarity('rare', 'rare')).toBe(0);
    });
  });

  describe('isBetterRarity', () => {
    it('should return true when first is better', () => {
      expect(isBetterRarity('epic', 'rare')).toBe(true);
    });

    it('should return false when first is worse', () => {
      expect(isBetterRarity('common', 'uncommon')).toBe(false);
    });

    it('should return false when equal', () => {
      expect(isBetterRarity('rare', 'rare')).toBe(false);
    });
  });

  describe('getRarityTier', () => {
    it('should return correct tier index', () => {
      expect(getRarityTier('common')).toBe(0);
      expect(getRarityTier('uncommon')).toBe(1);
      expect(getRarityTier('rare')).toBe(2);
      expect(getRarityTier('epic')).toBe(3);
      expect(getRarityTier('legendary')).toBe(4);
    });
  });

  describe('RarityStats', () => {
    let stats: ReturnType<typeof createRarityStats>;

    beforeEach(() => {
      stats = createRarityStats();
    });

    it('should create empty stats', () => {
      expect(stats.totalDrops).toBe(0);
      expect(stats.byRarity.common).toBe(0);
    });

    it('should record drops correctly', () => {
      stats = recordRarityDrop(stats, 'common');
      expect(stats.totalDrops).toBe(1);
      expect(stats.byRarity.common).toBe(1);

      stats = recordRarityDrop(stats, 'rare');
      expect(stats.totalDrops).toBe(2);
      expect(stats.byRarity.rare).toBe(1);
    });

    it('should calculate drop rates correctly', () => {
      stats = recordRarityDrop(stats, 'common');
      stats = recordRarityDrop(stats, 'common');
      stats = recordRarityDrop(stats, 'rare');

      const rates = calculateDropRates(stats);
      expect(rates.common).toBeCloseTo(66.67, 1);
      expect(rates.rare).toBeCloseTo(33.33, 1);
      expect(rates.uncommon).toBe(0);
    });

    it('should return zero rates for empty stats', () => {
      const rates = calculateDropRates(stats);
      expect(rates.common).toBe(0);
      expect(rates.rare).toBe(0);
    });
  });
});
