/**
 * Chest Manager Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createChest,
  openChest,
  createChests,
  openChests,
  getChestQualityConfig,
  determineChestQuality,
  estimateChestValue,
  getChestQualityName,
  getChestQualityColor,
  type Chest,
} from '../../../../src/systems/loot/ChestManager';
import type { ItemGenerationContext } from '../../../../src/systems/loot/LootGenerator';

describe('ChestManager', () => {
  const mockContext: ItemGenerationContext = {
    characterLevel: 5,
    luck: 10,
    lootQuality: 1.0,
  };

  describe('createChest', () => {
    it('should create a basic chest', () => {
      const chest = createChest('expedition');

      expect(chest.id).toBeDefined();
      expect(chest.quality).toBe('basic');
      expect(chest.sourceTask).toBe('expedition');
      expect(chest.lootQuality).toBe(1.0);
      expect(chest.opened).toBe(false);
      expect(chest.earnedAt).toBeGreaterThan(0);
    });

    it('should create chest with specified quality', () => {
      const chest = createChest('raid', 1.5, 'superior');

      expect(chest.quality).toBe('superior');
      expect(chest.lootQuality).toBe(1.5);
    });

    it('should create unique chest IDs', () => {
      const chest1 = createChest('expedition');
      const chest2 = createChest('expedition');

      expect(chest1.id).not.toBe(chest2.id);
    });
  });

  describe('openChest', () => {
    let chest: Chest;

    beforeEach(() => {
      chest = createChest('expedition', 1.0, 'basic');
    });

    it('should open chest and generate loot', () => {
      const result = openChest(chest, mockContext);

      expect(result.chest).toBe(chest);
      expect(result.items).toBeDefined();
      expect(result.gold).toBeGreaterThan(0);
      expect(result.totalValue).toBeGreaterThan(0);
      expect(result.wasLucky).toBeDefined();
      expect(chest.opened).toBe(true);
    });

    it('should throw error when opening already opened chest', () => {
      openChest(chest, mockContext);

      expect(() => openChest(chest, mockContext)).toThrow('already been opened');
    });

    it('should generate items based on chest quality', () => {
      const basicChest = createChest('expedition', 1.0, 'basic');
      const masterworkChest = createChest('expedition', 1.0, 'masterwork');

      const basicResult = openChest(basicChest, mockContext);
      const masterworkResult = openChest(masterworkChest, mockContext);

      // Masterwork chest should have more items
      expect(masterworkResult.items.length).toBeGreaterThanOrEqual(basicResult.items.length);
    });

    it('should generate appropriate loot for task type', () => {
      const expeditionChest = createChest('expedition');
      const result = openChest(expeditionChest, mockContext);

      // Should generate items (might be 0 if only consumables, but totalValue should exist)
      expect(result.items).toBeDefined();
      expect(result.gold).toBeGreaterThan(0);
    });

    it('should apply loot quality multiplier', () => {
      const normalChest = createChest('raid', 1.0, 'basic');
      const qualityChest = createChest('raid', 2.0, 'basic');

      const normalResult = openChest(normalChest, mockContext);
      const qualityResult = openChest(qualityChest, mockContext);

      // Higher loot quality should generally result in more gold
      // Test is probabilistic, so we'll just check that it can be higher
      expect(qualityResult.gold).toBeGreaterThanOrEqual(normalResult.gold * 0.8);
    });

    it('should calculate total value correctly', () => {
      const result = openChest(chest, mockContext);

      const itemsValue = result.items.reduce((sum, item) => sum + item.value, 0);
      const expectedTotal = itemsValue + result.gold;

      expect(result.totalValue).toBe(expectedTotal);
    });

    it('should have chance for lucky opening', () => {
      // Test multiple openings to check lucky chance
      let luckyCount = 0;
      const totalTests = 50;

      for (let i = 0; i < totalTests; i++) {
        const testChest = createChest('expedition', 1.0, 'basic');
        const result = openChest(testChest, mockContext);
        if (result.wasLucky) luckyCount++;
      }

      // With basic chest (5% base + 10 luck * 0.5 = 10%), expect some lucky openings
      expect(luckyCount).toBeGreaterThan(0);
      expect(luckyCount).toBeLessThan(totalTests); // Not all should be lucky
    });
  });

  describe('getChestQualityConfig', () => {
    it('should return correct config for each quality', () => {
      const basicConfig = getChestQualityConfig('basic');
      expect(basicConfig.quality).toBe('basic');
      expect(basicConfig.minItems).toBe(1);

      const masterworkConfig = getChestQualityConfig('masterwork');
      expect(masterworkConfig.quality).toBe('masterwork');
      expect(masterworkConfig.minItems).toBeGreaterThan(basicConfig.minItems);
    });

    it('should have increasing item counts for better qualities', () => {
      const basic = getChestQualityConfig('basic');
      const quality = getChestQualityConfig('quality');
      const superior = getChestQualityConfig('superior');
      const masterwork = getChestQualityConfig('masterwork');

      expect(quality.minItems).toBeGreaterThan(basic.minItems);
      expect(superior.minItems).toBeGreaterThan(quality.minItems);
      expect(masterwork.minItems).toBeGreaterThan(superior.minItems);
    });
  });

  describe('determineChestQuality', () => {
    it('should return basic for failed task', () => {
      const quality = determineChestQuality(false, 10);
      expect(quality).toBe('basic');
    });

    it('should return random quality for successful task', () => {
      const quality = determineChestQuality(true, 0);
      expect(['basic', 'quality', 'superior', 'masterwork']).toContain(quality);
    });

    it('should have better chance for higher quality with more luck', () => {
      // Test with high luck multiple times
      const qualities: string[] = [];
      for (let i = 0; i < 50; i++) {
        qualities.push(determineChestQuality(true, 100)); // Very high luck
      }

      // Should have at least some non-basic chests
      const nonBasicCount = qualities.filter((q) => q !== 'basic').length;
      expect(nonBasicCount).toBeGreaterThan(0);
    });
  });

  describe('createChests', () => {
    it('should create multiple chests', () => {
      const chests = createChests('raid', 3);

      expect(chests).toHaveLength(3);
      chests.forEach((chest) => {
        expect(chest.sourceTask).toBe('raid');
        expect(chest.quality).toBe('basic');
        expect(chest.opened).toBe(false);
      });
    });

    it('should create chests with specified quality', () => {
      const chests = createChests('expedition', 2, 1.5, 'superior');

      expect(chests).toHaveLength(2);
      chests.forEach((chest) => {
        expect(chest.quality).toBe('superior');
        expect(chest.lootQuality).toBe(1.5);
      });
    });

    it('should create unique chest IDs', () => {
      const chests = createChests('raid', 5);
      const ids = chests.map((c) => c.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(5);
    });
  });

  describe('openChests', () => {
    it('should open multiple chests', () => {
      const chests = createChests('expedition', 3);
      const results = openChests(chests, mockContext);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.chest).toBe(chests[index]);
        expect(result.items).toBeDefined();
        expect(result.gold).toBeGreaterThan(0);
      });
    });

    it('should mark all chests as opened', () => {
      const chests = createChests('raid', 3);
      openChests(chests, mockContext);

      chests.forEach((chest) => {
        expect(chest.opened).toBe(true);
      });
    });
  });

  describe('estimateChestValue', () => {
    it('should provide min/max estimate', () => {
      const chest = createChest('expedition', 1.0, 'basic');
      const estimate = estimateChestValue(chest);

      expect(estimate.min).toBeGreaterThan(0);
      expect(estimate.max).toBeGreaterThan(estimate.min);
    });

    it('should scale estimate with chest quality', () => {
      const basicChest = createChest('expedition', 1.0, 'basic');
      const masterworkChest = createChest('expedition', 1.0, 'masterwork');

      const basicEstimate = estimateChestValue(basicChest);
      const masterworkEstimate = estimateChestValue(masterworkChest);

      expect(masterworkEstimate.min).toBeGreaterThan(basicEstimate.min);
      expect(masterworkEstimate.max).toBeGreaterThan(basicEstimate.max);
    });

    it('should scale estimate with loot quality', () => {
      const normalChest = createChest('raid', 1.0, 'basic');
      const qualityChest = createChest('raid', 2.0, 'basic');

      const normalEstimate = estimateChestValue(normalChest);
      const qualityEstimate = estimateChestValue(qualityChest);

      expect(qualityEstimate.min).toBeGreaterThan(normalEstimate.min);
    });
  });

  describe('getChestQualityName', () => {
    it('should return correct display names', () => {
      expect(getChestQualityName('basic')).toBe('Basic Chest');
      expect(getChestQualityName('quality')).toBe('Quality Chest');
      expect(getChestQualityName('superior')).toBe('Superior Chest');
      expect(getChestQualityName('masterwork')).toBe('Masterwork Chest');
    });
  });

  describe('getChestQualityColor', () => {
    it('should return correct colors', () => {
      expect(getChestQualityColor('basic')).toBe('#9CA3AF');
      expect(getChestQualityColor('quality')).toBe('#10B981');
      expect(getChestQualityColor('superior')).toBe('#3B82F6');
      expect(getChestQualityColor('masterwork')).toBe('#A855F7');
    });
  });
});
