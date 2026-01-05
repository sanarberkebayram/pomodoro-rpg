/**
 * InjuryManager Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { InjuryManager, createInjuryManager } from '@/systems/injury/InjuryManager';
import type { InjuryState } from '@/core/types/character';

describe('InjuryManager', () => {
  describe('Injury Application', () => {
    it('should not apply injury on success', () => {
      const manager = createInjuryManager();
      const result = manager.shouldApplyInjury('success', 50, 10);
      expect(result).toBe(false);
    });

    it('should not apply injury on partial success', () => {
      const manager = createInjuryManager();
      const result = manager.shouldApplyInjury('partial', 50, 10);
      expect(result).toBe(false);
    });

    it('should potentially apply injury on failure', () => {
      const manager = createInjuryManager();
      // With 100% injury chance, should always apply
      const result = manager.shouldApplyInjury('failure', 100, 0);
      expect(result).toBe(true);
    });

    it('should reduce injury chance based on defense', () => {
      const manager = createInjuryManager();
      const baseChance = 50;
      const defense = 20; // Should reduce by 10% (defense / 2)

      // Run multiple times to test probability
      const results: boolean[] = [];
      for (let i = 0; i < 100; i++) {
        results.push(manager.shouldApplyInjury('failure', baseChance, defense));
      }

      const injuryCount = results.filter((r) => r).length;
      // Should be around 40% (50% - 10% from defense)
      expect(injuryCount).toBeGreaterThan(20);
      expect(injuryCount).toBeLessThan(60);
    });

    it('should have minimum 5% injury chance', () => {
      const manager = createInjuryManager();
      const baseChance = 10;
      const defense = 100; // High defense

      // Should still have at least 5% chance
      const results: boolean[] = [];
      for (let i = 0; i < 200; i++) {
        results.push(manager.shouldApplyInjury('failure', baseChance, defense));
      }

      const injuryCount = results.filter((r) => r).length;
      expect(injuryCount).toBeGreaterThan(0); // Should have some injuries
    });
  });

  describe('Injury Severity Determination', () => {
    it('should always return minor for safe risk level', () => {
      const manager = createInjuryManager();
      for (let i = 0; i < 20; i++) {
        const severity = manager.determineInjurySeverity('safe');
        expect(severity).toBe('minor');
      }
    });

    it('should return minor or moderate for standard risk level', () => {
      const manager = createInjuryManager();
      const results: Array<'minor' | 'moderate' | 'severe'> = [];
      for (let i = 0; i < 100; i++) {
        results.push(manager.determineInjurySeverity('standard'));
      }

      const hasMinor = results.includes('minor');
      const hasModerate = results.includes('moderate');
      const hasSevere = results.includes('severe');

      expect(hasMinor).toBe(true);
      expect(hasModerate).toBe(true);
      expect(hasSevere).toBe(false); // Should never be severe
    });

    it('should return all severities for risky risk level', () => {
      const manager = createInjuryManager();
      const results: Array<'minor' | 'moderate' | 'severe'> = [];
      for (let i = 0; i < 100; i++) {
        results.push(manager.determineInjurySeverity('risky'));
      }

      const hasMinor = results.includes('minor');
      const hasModerate = results.includes('moderate');
      const hasSevere = results.includes('severe');

      expect(hasMinor).toBe(true);
      expect(hasModerate).toBe(true);
      expect(hasSevere).toBe(true);
    });
  });

  describe('applyInjuryIfNeeded', () => {
    it('should return not applied for successful task', () => {
      const manager = createInjuryManager();
      const result = manager.applyInjuryIfNeeded('success', 'standard', 50, 10);

      expect(result.wasApplied).toBe(false);
      expect(result.severity).toBeNull();
      expect(result.message).toContain('escaped without injury');
    });

    it('should apply injury on failure with correct severity', () => {
      const manager = createInjuryManager();
      // Force injury with 100% chance
      const result = manager.applyInjuryIfNeeded('failure', 'safe', 100, 0);

      expect(result.wasApplied).toBe(true);
      expect(result.severity).toBe('minor'); // Safe always gives minor
      expect(result.message.toLowerCase()).toContain('minor injury');
    });

    it('should include severity description in message', () => {
      const manager = createInjuryManager();
      const result = manager.applyInjuryIfNeeded('failure', 'risky', 100, 0);

      if (result.wasApplied && result.severity) {
        // Message should contain either the display name or "injury"
        expect(result.message.toLowerCase()).toContain('injury');
      }
    });
  });

  describe('Severity Configuration', () => {
    it('should have correct config for minor injury', () => {
      const manager = createInjuryManager();
      const config = manager.getSeverityConfig('minor');

      expect(config.successPenalty).toBe(5);
      expect(config.powerPenalty).toBe(5);
      expect(config.focusPenalty).toBe(5);
      expect(config.healingCost).toBe(20);
      expect(config.displayName).toBe('Minor Injury');
    });

    it('should have correct config for moderate injury', () => {
      const manager = createInjuryManager();
      const config = manager.getSeverityConfig('moderate');

      expect(config.successPenalty).toBe(10);
      expect(config.powerPenalty).toBe(10);
      expect(config.focusPenalty).toBe(10);
      expect(config.healingCost).toBe(50);
      expect(config.displayName).toBe('Moderate Injury');
    });

    it('should have correct config for severe injury', () => {
      const manager = createInjuryManager();
      const config = manager.getSeverityConfig('severe');

      expect(config.successPenalty).toBe(20);
      expect(config.powerPenalty).toBe(20);
      expect(config.focusPenalty).toBe(20);
      expect(config.healingCost).toBe(100);
      expect(config.displayName).toBe('Severe Injury');
    });
  });

  describe('Penalty Calculations', () => {
    it('should return zero penalty when not injured', () => {
      const manager = createInjuryManager();
      const injury: InjuryState = {
        isInjured: false,
        severity: 'minor',
        successPenalty: 0,
        injuredAt: null,
      };

      const penalty = manager.getSuccessChancePenalty(injury);
      expect(penalty).toBe(0);
    });

    it('should return correct success chance penalty', () => {
      const manager = createInjuryManager();
      const injury: InjuryState = {
        isInjured: true,
        severity: 'moderate',
        successPenalty: 10,
        injuredAt: Date.now(),
      };

      const penalty = manager.getSuccessChancePenalty(injury);
      expect(penalty).toBe(10);
    });

    it('should calculate stat penalties correctly', () => {
      const manager = createInjuryManager();
      const injury: InjuryState = {
        isInjured: true,
        severity: 'minor', // 5% penalty
        successPenalty: 5,
        injuredAt: Date.now(),
      };

      const penalties = manager.calculateStatPenalties(injury, 100, 50);
      expect(penalties.power).toBe(5); // 5% of 100
      expect(penalties.focus).toBe(2); // 5% of 50, floored
    });

    it('should return zero penalties when not injured', () => {
      const manager = createInjuryManager();
      const injury: InjuryState = {
        isInjured: false,
        severity: 'minor',
        successPenalty: 0,
        injuredAt: null,
      };

      const penalties = manager.calculateStatPenalties(injury, 100, 50);
      expect(penalties.power).toBe(0);
      expect(penalties.focus).toBe(0);
    });
  });

  describe('Injury Status', () => {
    it('should identify critically injured character', () => {
      const manager = createInjuryManager();
      const injury: InjuryState = {
        isInjured: true,
        severity: 'severe',
        successPenalty: 20,
        injuredAt: Date.now(),
      };

      expect(manager.isCriticallyInjured(injury)).toBe(true);
    });

    it('should not identify moderate injury as critical', () => {
      const manager = createInjuryManager();
      const injury: InjuryState = {
        isInjured: true,
        severity: 'moderate',
        successPenalty: 10,
        injuredAt: Date.now(),
      };

      expect(manager.isCriticallyInjured(injury)).toBe(false);
    });

    it('should return correct status message', () => {
      const manager = createInjuryManager();
      const injury: InjuryState = {
        isInjured: true,
        severity: 'moderate',
        successPenalty: 10,
        injuredAt: Date.now(),
      };

      const message = manager.getInjuryStatusMessage(injury);
      expect(message).toContain('Moderate Injury');
      expect(message).toContain('-10%');
    });

    it('should return healthy status when not injured', () => {
      const manager = createInjuryManager();
      const injury: InjuryState = {
        isInjured: false,
        severity: 'minor',
        successPenalty: 0,
        injuredAt: null,
      };

      const message = manager.getInjuryStatusMessage(injury);
      expect(message).toBe('Healthy');
    });

    it('should track time since injury', () => {
      const manager = createInjuryManager();
      const injuredTime = Date.now() - 5000; // 5 seconds ago
      const injury: InjuryState = {
        isInjured: true,
        severity: 'minor',
        successPenalty: 5,
        injuredAt: injuredTime,
      };

      const timeSince = manager.getTimeSinceInjury(injury);
      expect(timeSince).toBeGreaterThanOrEqual(5000);
      expect(timeSince).toBeLessThan(6000);
    });

    it('should return zero time when not injured', () => {
      const manager = createInjuryManager();
      const injury: InjuryState = {
        isInjured: false,
        severity: 'minor',
        successPenalty: 0,
        injuredAt: null,
      };

      const timeSince = manager.getTimeSinceInjury(injury);
      expect(timeSince).toBe(0);
    });
  });

  describe('Healing Costs', () => {
    it('should return correct healing cost for each severity', () => {
      const manager = createInjuryManager();

      const minorInjury: InjuryState = {
        isInjured: true,
        severity: 'minor',
        successPenalty: 5,
        injuredAt: Date.now(),
      };
      expect(manager.getHealingCost(minorInjury)).toBe(20);

      const moderateInjury: InjuryState = {
        isInjured: true,
        severity: 'moderate',
        successPenalty: 10,
        injuredAt: Date.now(),
      };
      expect(manager.getHealingCost(moderateInjury)).toBe(50);

      const severeInjury: InjuryState = {
        isInjured: true,
        severity: 'severe',
        successPenalty: 20,
        injuredAt: Date.now(),
      };
      expect(manager.getHealingCost(severeInjury)).toBe(100);
    });

    it('should return zero cost when not injured', () => {
      const manager = createInjuryManager();
      const injury: InjuryState = {
        isInjured: false,
        severity: 'minor',
        successPenalty: 0,
        injuredAt: null,
      };

      expect(manager.getHealingCost(injury)).toBe(0);
    });
  });

  describe('Factory Function', () => {
    it('should create InjuryManager instance', () => {
      const manager = createInjuryManager();
      expect(manager).toBeInstanceOf(InjuryManager);
    });
  });
});
