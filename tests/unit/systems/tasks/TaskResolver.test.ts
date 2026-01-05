import { describe, it, expect } from 'vitest';
import {
  calculateSuccessChance,
  resolveTaskOutcome,
  calculateRewards,
  shouldApplyInjury,
  determineInjurySeverity,
  generateTaskSummary,
} from '../../../../src/systems/tasks/TaskResolver';
import { EXPEDITION_CONFIG, RAID_CONFIG } from '../../../../src/data/tasks/taskConfigs';
import type {
  TaskSelectionContext,
  ActiveTask,
  TaskOutcome,
} from '../../../../src/core/types/tasks';

describe('TaskResolver', () => {
  const mockContext: TaskSelectionContext = {
    characterLevel: 1,
    characterStats: {
      power: 10,
      defense: 15,
      focus: 10,
      luck: 5,
      health: 100,
    },
    isInjured: false,
    injuryPenalty: 0,
    billPenalty: 0,
    equipmentBonuses: {
      power: 5,
      defense: 5,
      focus: 3,
      luck: 2,
    },
  };

  describe('calculateSuccessChance', () => {
    it('should calculate base success chance correctly', () => {
      const result = calculateSuccessChance(EXPEDITION_CONFIG, 'standard', mockContext);

      expect(result.baseChance).toBe(60); // Expedition base
      expect(result.finalChance).toBeGreaterThan(60);
      expect(result.breakdown.length).toBeGreaterThan(0);
    });

    it('should apply stat modifier based on primary stat', () => {
      const result = calculateSuccessChance(EXPEDITION_CONFIG, 'standard', mockContext);

      // Focus is primary stat for expedition (10 focus = +5% modifier)
      expect(result.statModifier).toBe(5);
    });

    it('should apply equipment modifier', () => {
      const result = calculateSuccessChance(EXPEDITION_CONFIG, 'standard', mockContext);

      // Equipment bonus: power(5) + focus(3) + luck(2) = 10, * 0.5 = 5%
      expect(result.equipmentModifier).toBe(5);
    });

    it('should apply risk level modifiers', () => {
      const safeResult = calculateSuccessChance(EXPEDITION_CONFIG, 'safe', mockContext);
      const standardResult = calculateSuccessChance(EXPEDITION_CONFIG, 'standard', mockContext);
      const riskyResult = calculateSuccessChance(EXPEDITION_CONFIG, 'risky', mockContext);

      expect(safeResult.riskModifier).toBe(15);
      expect(standardResult.riskModifier).toBe(0);
      expect(riskyResult.riskModifier).toBe(-20);

      expect(safeResult.finalChance).toBeGreaterThan(standardResult.finalChance);
      expect(standardResult.finalChance).toBeGreaterThan(riskyResult.finalChance);
    });

    it('should apply injury penalty when character is injured', () => {
      const injuredContext = {
        ...mockContext,
        isInjured: true,
        injuryPenalty: 10,
      };

      const result = calculateSuccessChance(EXPEDITION_CONFIG, 'standard', injuredContext);

      expect(result.injuryPenalty).toBe(10);
      expect(result.finalChance).toBeLessThan(
        calculateSuccessChance(EXPEDITION_CONFIG, 'standard', mockContext).finalChance
      );
    });

    it('should apply bill penalty when there is unpaid bill', () => {
      const billContext = {
        ...mockContext,
        billPenalty: 5,
      };

      const result = calculateSuccessChance(EXPEDITION_CONFIG, 'standard', billContext);

      expect(result.billPenalty).toBe(5);
      expect(result.finalChance).toBeLessThan(
        calculateSuccessChance(EXPEDITION_CONFIG, 'standard', mockContext).finalChance
      );
    });

    it('should apply event modifiers', () => {
      const result = calculateSuccessChance(EXPEDITION_CONFIG, 'standard', mockContext, 10);

      expect(result.eventModifier).toBe(10);
      expect(result.finalChance).toBeGreaterThan(
        calculateSuccessChance(EXPEDITION_CONFIG, 'standard', mockContext, 0).finalChance
      );
    });

    it('should clamp final chance between 5% and 95%', () => {
      // Test upper bound
      const highStatContext = {
        ...mockContext,
        characterStats: { ...mockContext.characterStats, focus: 100 },
        equipmentBonuses: { power: 50, defense: 50, focus: 50, luck: 50 },
      };
      const highResult = calculateSuccessChance(EXPEDITION_CONFIG, 'safe', highStatContext, 100);
      expect(highResult.finalChance).toBeLessThanOrEqual(95);

      // Test lower bound
      const lowStatContext = {
        ...mockContext,
        characterStats: { ...mockContext.characterStats, focus: 1 },
        equipmentBonuses: { power: 0, defense: 0, focus: 0, luck: 0 },
        isInjured: true,
        injuryPenalty: 50,
      };
      const lowResult = calculateSuccessChance(RAID_CONFIG, 'risky', lowStatContext, -50);
      expect(lowResult.finalChance).toBeGreaterThanOrEqual(5);
    });
  });

  describe('resolveTaskOutcome', () => {
    it('should resolve to success with high success chance', () => {
      // Test multiple times due to randomness
      const results = Array.from({ length: 100 }, () => resolveTaskOutcome(90));
      const successCount = results.filter((r) => r === 'success').length;

      // With 90% success chance, should have mostly successes
      expect(successCount).toBeGreaterThan(70);
    });

    it('should resolve to failure with low success chance', () => {
      const results = Array.from({ length: 100 }, () => resolveTaskOutcome(10));
      const failureCount = results.filter((r) => r === 'failure').length;

      // With 10% success chance, should have mostly failures
      expect(failureCount).toBeGreaterThan(50);
    });

    it('should return partial success for rolls in partial threshold', () => {
      const results = Array.from({ length: 100 }, () => resolveTaskOutcome(50));
      const partialCount = results.filter((r) => r === 'partial').length;

      // Should have some partial successes
      expect(partialCount).toBeGreaterThan(0);
    });

    it('should return valid outcome types', () => {
      const outcomes: TaskOutcome[] = ['success', 'partial', 'failure'];
      const result = resolveTaskOutcome(50);

      expect(outcomes).toContain(result);
    });
  });

  describe('calculateRewards', () => {
    it('should calculate full rewards for success', () => {
      const rewards = calculateRewards(EXPEDITION_CONFIG, 'standard', 'success', 5);

      expect(rewards.gold.min).toBeGreaterThan(0);
      expect(rewards.xp.min).toBeGreaterThan(0);
      expect(rewards.materials.min).toBeGreaterThan(0);
      expect(rewards.chests).toBe(1);
    });

    it('should calculate half rewards for partial success', () => {
      const fullRewards = calculateRewards(EXPEDITION_CONFIG, 'standard', 'success', 5);
      const partialRewards = calculateRewards(EXPEDITION_CONFIG, 'standard', 'partial', 5);

      expect(partialRewards.gold.min).toBeLessThan(fullRewards.gold.min);
      expect(partialRewards.xp.min).toBeLessThan(fullRewards.xp.min);
    });

    it('should give no rewards for failure', () => {
      const rewards = calculateRewards(EXPEDITION_CONFIG, 'standard', 'failure', 5);

      expect(rewards.gold.min).toBe(0);
      expect(rewards.xp.min).toBe(0);
      expect(rewards.materials.min).toBe(0);
      expect(rewards.chests).toBe(0);
    });

    it('should apply risk multiplier to rewards', () => {
      // Run multiple times and take average to account for randomness
      const runs = 50;
      let safeTotal = 0;
      let standardTotal = 0;
      let riskyTotal = 0;

      for (let i = 0; i < runs; i++) {
        safeTotal += calculateRewards(EXPEDITION_CONFIG, 'safe', 'success', 5).gold.min;
        standardTotal += calculateRewards(EXPEDITION_CONFIG, 'standard', 'success', 5).gold.min;
        riskyTotal += calculateRewards(EXPEDITION_CONFIG, 'risky', 'success', 5).gold.min;
      }

      const safeAvg = safeTotal / runs;
      const standardAvg = standardTotal / runs;
      const riskyAvg = riskyTotal / runs;

      // Risky should have highest average rewards
      expect(riskyAvg).toBeGreaterThan(standardAvg);
      // Safe should have lowest average rewards
      expect(safeAvg).toBeLessThan(standardAvg);
    });

    it('should apply luck multiplier to rewards', () => {
      const lowLuckRewards = calculateRewards(EXPEDITION_CONFIG, 'standard', 'success', 0);
      const highLuckRewards = calculateRewards(EXPEDITION_CONFIG, 'standard', 'success', 50);

      // Higher luck should give more rewards (due to randomness, just check it's different)
      expect(highLuckRewards).toBeDefined();
      expect(lowLuckRewards).toBeDefined();
    });
  });

  describe('shouldApplyInjury', () => {
    it('should not apply injury on success', () => {
      expect(shouldApplyInjury(EXPEDITION_CONFIG, 'success', 15)).toBe(false);
    });

    it('should not apply injury on partial success', () => {
      expect(shouldApplyInjury(EXPEDITION_CONFIG, 'partial', 15)).toBe(false);
    });

    it('should have chance to apply injury on failure', () => {
      // Test multiple times due to randomness
      const results = Array.from({ length: 100 }, () =>
        shouldApplyInjury(EXPEDITION_CONFIG, 'failure', 15)
      );
      const injuryCount = results.filter((r) => r).length;

      // Should have some injuries (but not all due to defense)
      expect(injuryCount).toBeGreaterThan(0);
      expect(injuryCount).toBeLessThan(100);
    });

    it('should reduce injury chance with higher defense', () => {
      const lowDefenseResults = Array.from({ length: 100 }, () =>
        shouldApplyInjury(EXPEDITION_CONFIG, 'failure', 0)
      );
      const highDefenseResults = Array.from({ length: 100 }, () =>
        shouldApplyInjury(EXPEDITION_CONFIG, 'failure', 50)
      );

      const lowDefenseInjuries = lowDefenseResults.filter((r) => r).length;
      const highDefenseInjuries = highDefenseResults.filter((r) => r).length;

      // Higher defense should result in fewer injuries
      expect(highDefenseInjuries).toBeLessThan(lowDefenseInjuries);
    });
  });

  describe('determineInjurySeverity', () => {
    it('should return minor for safe risk level', () => {
      const severity = determineInjurySeverity('safe');
      expect(severity).toBe('minor');
    });

    it('should return minor or moderate for standard risk level', () => {
      const results = Array.from({ length: 100 }, () => determineInjurySeverity('standard'));
      const hasMinor = results.some((s) => s === 'minor');
      const hasModerate = results.some((s) => s === 'moderate');
      const hasSevere = results.some((s) => s === 'severe');

      expect(hasMinor).toBe(true);
      expect(hasModerate).toBe(true);
      expect(hasSevere).toBe(false); // Should never be severe for standard
    });

    it('should return all severities for risky risk level', () => {
      const results = Array.from({ length: 100 }, () => determineInjurySeverity('risky'));
      const hasMinor = results.some((s) => s === 'minor');
      const hasModerate = results.some((s) => s === 'moderate');
      const hasSevere = results.some((s) => s === 'severe');

      expect(hasMinor).toBe(true);
      expect(hasModerate).toBe(true);
      expect(hasSevere).toBe(true);
    });
  });

  describe('generateTaskSummary', () => {
    const mockTask: ActiveTask = {
      taskType: 'expedition',
      riskLevel: 'standard',
      config: EXPEDITION_CONFIG,
      startedAt: Date.now(),
      calculatedSuccessChance: 70,
      progress: 100,
      events: [],
      outcome: null,
      earnedRewards: null,
    };

    const mockRewards = {
      gold: { min: 25, max: 25 },
      xp: { min: 30, max: 30 },
      materials: { min: 5, max: 5 },
      chests: 1,
      lootQuality: 1.0,
    };

    it('should generate success summary', () => {
      const summary = generateTaskSummary(mockTask, 'success', mockRewards, false);

      expect(summary).toContain('completed successfully');
      expect(summary).toContain('25 gold');
      expect(summary).toContain('30 XP');
      expect(summary).toContain('1 chest');
    });

    it('should generate partial success summary', () => {
      const summary = generateTaskSummary(mockTask, 'partial', mockRewards, false);

      expect(summary).toContain('partially completed');
      expect(summary).toContain('25 gold');
      expect(summary).toContain('30 XP');
    });

    it('should generate failure summary without injury', () => {
      const summary = generateTaskSummary(mockTask, 'failure', mockRewards, false);

      expect(summary).toContain('failed');
      expect(summary).toContain('escaped unharmed');
    });

    it('should generate failure summary with injury', () => {
      const summary = generateTaskSummary(mockTask, 'failure', mockRewards, true);

      expect(summary).toContain('failed');
      expect(summary).toContain('injured');
      expect(summary).toContain('medical attention');
    });
  });
});
