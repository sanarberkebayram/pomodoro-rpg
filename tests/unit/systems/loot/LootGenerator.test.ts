/**
 * Loot Generator Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateItem,
  generateItems,
  generateGold,
  generateMaterials,
  generateXP,
  type ItemGenerationContext,
} from '../../../../src/systems/loot/LootGenerator';
import type { ItemTemplate } from '../../../../src/core/types/items';

describe('LootGenerator', () => {
  const mockContext: ItemGenerationContext = {
    characterLevel: 5,
    luck: 10,
    lootQuality: 1.0,
  };

  const mockWeaponTemplate: ItemTemplate = {
    id: 'test-sword',
    name: 'Test Sword',
    description: 'A test weapon',
    type: 'weapon',
    icon: 'weapon-sword',
    weaponType: 'sword',
    statRanges: {
      power: [5, 10],
      focus: [2, 4],
    },
  };

  const mockArmorTemplate: ItemTemplate = {
    id: 'test-armor',
    name: 'Test Armor',
    description: 'A test armor',
    type: 'armor',
    icon: 'armor-plate',
    armorType: 'medium',
    statRanges: {
      defense: [8, 12],
      power: [2, 4],
    },
  };

  describe('generateItem', () => {
    it('should generate a weapon item', () => {
      const item = generateItem(mockWeaponTemplate, mockContext);

      expect(item.type).toBe('weapon');
      expect(item.id).toBeDefined();
      expect(item.name).toContain('Sword');
      expect(item.rarity).toBeDefined();
      expect(item.value).toBeGreaterThan(0);

      if (item.type === 'weapon') {
        expect(item.weaponType).toBe('sword');
        expect(item.statBonuses).toBeDefined();
        expect(item.damageRange).toBeDefined();
        expect(item.damageRange.min).toBeGreaterThan(0);
        expect(item.damageRange.max).toBeGreaterThan(item.damageRange.min);
      }
    });

    it('should generate an armor item', () => {
      const item = generateItem(mockArmorTemplate, mockContext);

      expect(item.type).toBe('armor');
      expect(item.id).toBeDefined();
      expect(item.name).toContain('Armor');

      if (item.type === 'armor') {
        expect(item.armorType).toBe('medium');
        expect(item.statBonuses).toBeDefined();
        expect(item.armorRating).toBeGreaterThan(0);
      }
    });

    it('should apply forced rarity when specified', () => {
      const contextWithRarity = {
        ...mockContext,
        forceRarity: 'legendary' as const,
      };

      const item = generateItem(mockWeaponTemplate, contextWithRarity);
      expect(item.rarity).toBe('legendary');
    });

    it('should generate unique IDs for each item', () => {
      const item1 = generateItem(mockWeaponTemplate, mockContext);
      const item2 = generateItem(mockWeaponTemplate, mockContext);

      expect(item1.id).not.toBe(item2.id);
    });

    it('should scale with character level', () => {
      const lowLevelContext: ItemGenerationContext = {
        characterLevel: 1,
        luck: 0,
        lootQuality: 1.0,
      };

      const highLevelContext: ItemGenerationContext = {
        characterLevel: 20,
        luck: 0,
        lootQuality: 1.0,
      };

      // Higher level items should generally have higher values
      // Test multiple times to account for randomness
      let higherValueCount = 0;
      for (let i = 0; i < 10; i++) {
        const low = generateItem(mockWeaponTemplate, lowLevelContext);
        const high = generateItem(mockWeaponTemplate, highLevelContext);
        if (high.value > low.value) higherValueCount++;
      }

      expect(higherValueCount).toBeGreaterThan(5); // Most should be higher
    });

    it('should apply stat bonuses from template', () => {
      const item = generateItem(mockWeaponTemplate, mockContext);

      if (item.type === 'weapon') {
        expect(item.statBonuses.power).toBeDefined();
        expect(item.statBonuses.power).toBeGreaterThan(0);
      }
    });

    it('should throw error for weapon template without weaponType', () => {
      const invalidTemplate: ItemTemplate = {
        id: 'invalid',
        name: 'Invalid',
        description: 'Invalid',
        type: 'weapon',
        icon: 'invalid',
      };

      expect(() => generateItem(invalidTemplate, mockContext)).toThrow();
    });
  });

  describe('generateItems', () => {
    it('should generate multiple items', () => {
      const templates = [mockWeaponTemplate, mockArmorTemplate];
      const items = generateItems(templates, mockContext, 5);

      expect(items).toHaveLength(5);
      items.forEach((item) => {
        expect(item.id).toBeDefined();
        expect(['weapon', 'armor']).toContain(item.type);
      });
    });

    it('should generate single item by default', () => {
      const items = generateItems([mockWeaponTemplate], mockContext);
      expect(items).toHaveLength(1);
    });

    it('should randomly select from templates', () => {
      const templates = [mockWeaponTemplate, mockArmorTemplate];
      const items = generateItems(templates, mockContext, 20);

      const weaponCount = items.filter((i) => i.type === 'weapon').length;
      const armorCount = items.filter((i) => i.type === 'armor').length;

      // Both types should appear in 20 items (very unlikely to get all of one type)
      expect(weaponCount).toBeGreaterThan(0);
      expect(armorCount).toBeGreaterThan(0);
    });
  });

  describe('generateGold', () => {
    it('should generate gold within range', () => {
      const gold = generateGold(10, 50);

      expect(gold).toBeGreaterThanOrEqual(10);
      expect(gold).toBeLessThanOrEqual(50);
    });

    it('should apply luck modifier', () => {
      const goldWithoutLuck = generateGold(100, 100, 0);
      const goldWithLuck = generateGold(100, 100, 50);

      // With fixed min/max and high luck, should get bonus
      expect(goldWithLuck).toBeGreaterThan(goldWithoutLuck);
    });

    it('should return integer values', () => {
      const gold = generateGold(10, 50, 10);
      expect(Number.isInteger(gold)).toBe(true);
    });
  });

  describe('generateMaterials', () => {
    it('should generate materials within range', () => {
      const materials = generateMaterials(5, 15);

      expect(materials).toBeGreaterThanOrEqual(5);
      expect(materials).toBeLessThanOrEqual(15);
      expect(Number.isInteger(materials)).toBe(true);
    });

    it('should handle min equals max', () => {
      const materials = generateMaterials(10, 10);
      expect(materials).toBe(10);
    });
  });

  describe('generateXP', () => {
    it('should generate XP within range', () => {
      const xp = generateXP(20, 100);

      expect(xp).toBeGreaterThanOrEqual(20);
      expect(xp).toBeLessThanOrEqual(100);
      expect(Number.isInteger(xp)).toBe(true);
    });

    it('should handle min equals max', () => {
      const xp = generateXP(50, 50);
      expect(xp).toBe(50);
    });
  });
});
