import { describe, it, expect } from 'vitest';
import {
  VANGUARD_CONFIG,
  ARCANIST_CONFIG,
  ROGUE_CONFIG,
  CLASS_CONFIGS,
  getClassConfig,
  getAvailableClasses,
  isClassAvailable,
  DEFAULT_STARTING_HEALTH,
  HEALTH_PER_LEVEL,
} from '../../../../src/data/config/classConfig';

describe('Class Configuration', () => {
  describe('Vanguard Config', () => {
    it('should have correct base stats', () => {
      expect(VANGUARD_CONFIG.id).toBe('Vanguard');
      expect(VANGUARD_CONFIG.name).toBe('Vanguard');
      expect(VANGUARD_CONFIG.baseStats.power).toBe(10);
      expect(VANGUARD_CONFIG.baseStats.defense).toBe(15);
      expect(VANGUARD_CONFIG.baseStats.focus).toBe(10);
      expect(VANGUARD_CONFIG.baseStats.luck).toBe(5);
      expect(VANGUARD_CONFIG.baseStats.health).toBe(DEFAULT_STARTING_HEALTH);
      expect(VANGUARD_CONFIG.baseStats.maxHealth).toBe(DEFAULT_STARTING_HEALTH);
    });

    it('should have correct stat growth', () => {
      expect(VANGUARD_CONFIG.statGrowth.power).toBe(2);
      expect(VANGUARD_CONFIG.statGrowth.defense).toBe(3);
      expect(VANGUARD_CONFIG.statGrowth.focus).toBe(2);
      expect(VANGUARD_CONFIG.statGrowth.luck).toBe(1);
      expect(VANGUARD_CONFIG.statGrowth.maxHealth).toBe(HEALTH_PER_LEVEL);
    });

    it('should be available in MVP', () => {
      expect(VANGUARD_CONFIG.available).toBe(true);
    });

    it('should have description', () => {
      expect(VANGUARD_CONFIG.description).toBeTruthy();
      expect(VANGUARD_CONFIG.description.length).toBeGreaterThan(0);
    });
  });

  describe('Arcanist Config', () => {
    it('should have correct base stats', () => {
      expect(ARCANIST_CONFIG.id).toBe('Arcanist');
      expect(ARCANIST_CONFIG.name).toBe('Arcanist');
      expect(ARCANIST_CONFIG.baseStats.power).toBe(15);
      expect(ARCANIST_CONFIG.baseStats.defense).toBe(5);
      expect(ARCANIST_CONFIG.baseStats.focus).toBe(8);
      expect(ARCANIST_CONFIG.baseStats.luck).toBe(12);
    });

    it('should have correct stat growth', () => {
      expect(ARCANIST_CONFIG.statGrowth.power).toBe(3);
      expect(ARCANIST_CONFIG.statGrowth.defense).toBe(1);
      expect(ARCANIST_CONFIG.statGrowth.focus).toBe(2);
      expect(ARCANIST_CONFIG.statGrowth.luck).toBe(3);
    });

    it('should not be available in MVP', () => {
      expect(ARCANIST_CONFIG.available).toBe(false);
    });
  });

  describe('Rogue Config', () => {
    it('should have correct base stats', () => {
      expect(ROGUE_CONFIG.id).toBe('Rogue');
      expect(ROGUE_CONFIG.name).toBe('Rogue');
      expect(ROGUE_CONFIG.baseStats.power).toBe(12);
      expect(ROGUE_CONFIG.baseStats.defense).toBe(8);
      expect(ROGUE_CONFIG.baseStats.focus).toBe(15);
      expect(ROGUE_CONFIG.baseStats.luck).toBe(10);
    });

    it('should have correct stat growth', () => {
      expect(ROGUE_CONFIG.statGrowth.power).toBe(2);
      expect(ROGUE_CONFIG.statGrowth.defense).toBe(2);
      expect(ROGUE_CONFIG.statGrowth.focus).toBe(3);
      expect(ROGUE_CONFIG.statGrowth.luck).toBe(2);
    });

    it('should not be available in MVP', () => {
      expect(ROGUE_CONFIG.available).toBe(false);
    });
  });

  describe('CLASS_CONFIGS', () => {
    it('should contain all character classes', () => {
      expect(Object.keys(CLASS_CONFIGS)).toHaveLength(3);
      expect(CLASS_CONFIGS.Vanguard).toBeDefined();
      expect(CLASS_CONFIGS.Arcanist).toBeDefined();
      expect(CLASS_CONFIGS.Rogue).toBeDefined();
    });

    it('should have consistent structure for all classes', () => {
      Object.values(CLASS_CONFIGS).forEach((config) => {
        expect(config.id).toBeTruthy();
        expect(config.name).toBeTruthy();
        expect(config.description).toBeTruthy();
        expect(config.baseStats).toBeDefined();
        expect(config.statGrowth).toBeDefined();
        expect(typeof config.available).toBe('boolean');
      });
    });
  });

  describe('getClassConfig', () => {
    it('should return correct config for Vanguard', () => {
      const config = getClassConfig('Vanguard');
      expect(config).toEqual(VANGUARD_CONFIG);
    });

    it('should return correct config for Arcanist', () => {
      const config = getClassConfig('Arcanist');
      expect(config).toEqual(ARCANIST_CONFIG);
    });

    it('should return correct config for Rogue', () => {
      const config = getClassConfig('Rogue');
      expect(config).toEqual(ROGUE_CONFIG);
    });
  });

  describe('getAvailableClasses', () => {
    it('should return only available classes', () => {
      const available = getAvailableClasses();
      expect(available).toHaveLength(1);
      expect(available[0].id).toBe('Vanguard');
    });

    it('should return classes with available flag set to true', () => {
      const available = getAvailableClasses();
      available.forEach((config) => {
        expect(config.available).toBe(true);
      });
    });
  });

  describe('isClassAvailable', () => {
    it('should return true for Vanguard', () => {
      expect(isClassAvailable('Vanguard')).toBe(true);
    });

    it('should return false for Arcanist', () => {
      expect(isClassAvailable('Arcanist')).toBe(false);
    });

    it('should return false for Rogue', () => {
      expect(isClassAvailable('Rogue')).toBe(false);
    });
  });

  describe('Stat Balance', () => {
    it('should have balanced total base stats across classes', () => {
      const vanguardTotal =
        VANGUARD_CONFIG.baseStats.power +
        VANGUARD_CONFIG.baseStats.defense +
        VANGUARD_CONFIG.baseStats.focus +
        VANGUARD_CONFIG.baseStats.luck;

      const arcanistTotal =
        ARCANIST_CONFIG.baseStats.power +
        ARCANIST_CONFIG.baseStats.defense +
        ARCANIST_CONFIG.baseStats.focus +
        ARCANIST_CONFIG.baseStats.luck;

      const rogueTotal =
        ROGUE_CONFIG.baseStats.power +
        ROGUE_CONFIG.baseStats.defense +
        ROGUE_CONFIG.baseStats.focus +
        ROGUE_CONFIG.baseStats.luck;

      // All classes should have the same total stat points
      expect(vanguardTotal).toBe(40);
      expect(arcanistTotal).toBe(40);
      expect(rogueTotal).toBe(45); // Rogue has 5 more total points
    });

    it('should have balanced total stat growth across classes', () => {
      const vanguardGrowth =
        VANGUARD_CONFIG.statGrowth.power +
        VANGUARD_CONFIG.statGrowth.defense +
        VANGUARD_CONFIG.statGrowth.focus +
        VANGUARD_CONFIG.statGrowth.luck;

      const arcanistGrowth =
        ARCANIST_CONFIG.statGrowth.power +
        ARCANIST_CONFIG.statGrowth.defense +
        ARCANIST_CONFIG.statGrowth.focus +
        ARCANIST_CONFIG.statGrowth.luck;

      const rogueGrowth =
        ROGUE_CONFIG.statGrowth.power +
        ROGUE_CONFIG.statGrowth.defense +
        ROGUE_CONFIG.statGrowth.focus +
        ROGUE_CONFIG.statGrowth.luck;

      // All classes should have the same total growth per level
      expect(vanguardGrowth).toBe(8);
      expect(arcanistGrowth).toBe(9);
      expect(rogueGrowth).toBe(9);
    });

    it('should have same health for all classes', () => {
      expect(VANGUARD_CONFIG.baseStats.maxHealth).toBe(DEFAULT_STARTING_HEALTH);
      expect(ARCANIST_CONFIG.baseStats.maxHealth).toBe(DEFAULT_STARTING_HEALTH);
      expect(ROGUE_CONFIG.baseStats.maxHealth).toBe(DEFAULT_STARTING_HEALTH);

      expect(VANGUARD_CONFIG.statGrowth.maxHealth).toBe(HEALTH_PER_LEVEL);
      expect(ARCANIST_CONFIG.statGrowth.maxHealth).toBe(HEALTH_PER_LEVEL);
      expect(ROGUE_CONFIG.statGrowth.maxHealth).toBe(HEALTH_PER_LEVEL);
    });
  });

  describe('Class Identity', () => {
    it('Vanguard should be the most defensive', () => {
      expect(VANGUARD_CONFIG.baseStats.defense).toBeGreaterThan(ARCANIST_CONFIG.baseStats.defense);
      expect(VANGUARD_CONFIG.baseStats.defense).toBeGreaterThan(ROGUE_CONFIG.baseStats.defense);
      expect(VANGUARD_CONFIG.statGrowth.defense).toBeGreaterThan(
        ARCANIST_CONFIG.statGrowth.defense
      );
      expect(VANGUARD_CONFIG.statGrowth.defense).toBeGreaterThan(ROGUE_CONFIG.statGrowth.defense);
    });

    it('Arcanist should have highest power and luck', () => {
      expect(ARCANIST_CONFIG.baseStats.power).toBeGreaterThan(VANGUARD_CONFIG.baseStats.power);
      expect(ARCANIST_CONFIG.baseStats.power).toBeGreaterThan(ROGUE_CONFIG.baseStats.power);
      expect(ARCANIST_CONFIG.baseStats.luck).toBeGreaterThan(VANGUARD_CONFIG.baseStats.luck);
      expect(ARCANIST_CONFIG.baseStats.luck).toBeGreaterThan(ROGUE_CONFIG.baseStats.luck);
    });

    it('Rogue should have highest focus', () => {
      expect(ROGUE_CONFIG.baseStats.focus).toBeGreaterThan(VANGUARD_CONFIG.baseStats.focus);
      expect(ROGUE_CONFIG.baseStats.focus).toBeGreaterThan(ARCANIST_CONFIG.baseStats.focus);
      expect(ROGUE_CONFIG.statGrowth.focus).toBeGreaterThan(VANGUARD_CONFIG.statGrowth.focus);
      expect(ROGUE_CONFIG.statGrowth.focus).toBeGreaterThan(ARCANIST_CONFIG.statGrowth.focus);
    });

    it('Arcanist should be glass cannon (low defense, high power)', () => {
      expect(ARCANIST_CONFIG.baseStats.defense).toBeLessThan(10);
      expect(ARCANIST_CONFIG.baseStats.power).toBeGreaterThan(14);
    });
  });
});
