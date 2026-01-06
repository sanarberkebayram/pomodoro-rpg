/**
 * Progression Manager Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ProgressionManager,
  createProgressionManager,
} from '../../../../src/systems/progression/ProgressionManager';
import type { ProgressionState } from '../../../../src/systems/progression/types';
import { createCharacterStore } from '../../../../src/core/state/CharacterState';
import type { CharacterStore } from '../../../../src/core/state/CharacterState';

describe('ProgressionManager', () => {
  let progressionState: ProgressionState;
  let characterStore: CharacterStore;
  let progressionManager: ProgressionManager;

  beforeEach(() => {
    // Create initial progression state
    progressionState = {
      level: 1,
      currentXP: 0,
      xpToNextLevel: 100,
      totalXP: 0,
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null,
        totalActiveDays: 0,
      },
    };

    // Create character store
    characterStore = createCharacterStore();

    // Create progression manager
    progressionManager = createProgressionManager(progressionState, characterStore);
  });

  describe('XP Calculation', () => {
    it('should calculate XP for level 1 as 0', () => {
      expect(progressionManager.calculateXPForLevel(1)).toBe(0);
    });

    it('should calculate XP for level 2', () => {
      const xp = progressionManager.calculateXPForLevel(2);
      // 100 * 1^1.5 = 100
      expect(xp).toBe(100);
    });

    it('should calculate XP for level 3', () => {
      const xp = progressionManager.calculateXPForLevel(3);
      // 100 * 1^1.5 + 100 * 2^1.5 = 100 + 282 = 382
      expect(xp).toBeGreaterThan(200);
      expect(xp).toBeLessThan(400);
    });

    it('should calculate XP for level 5', () => {
      const xp = progressionManager.calculateXPForLevel(5);
      expect(xp).toBeGreaterThan(500);
      expect(xp).toBeLessThan(2000);
    });

    it('should have increasing XP requirements', () => {
      const level2 = progressionManager.calculateXPForLevel(2);
      const level3 = progressionManager.calculateXPForLevel(3);
      const level4 = progressionManager.calculateXPForLevel(4);

      expect(level3).toBeGreaterThan(level2);
      expect(level4).toBeGreaterThan(level3);
    });
  });

  describe('XP Award', () => {
    it('should award full XP on success', () => {
      const xpEvent = progressionManager.awardXP(50, 'success', 'expedition');

      expect(xpEvent.amount).toBe(50);
      expect(xpEvent.outcome).toBe('success');
      expect(xpEvent.source).toBe('expedition');
      expect(xpEvent.leveledUp).toBe(false);
      expect(progressionState.totalXP).toBe(50);
      expect(progressionState.currentXP).toBe(50);
    });

    it('should award partial XP on partial success', () => {
      const xpEvent = progressionManager.awardXP(100, 'partial', 'raid');

      // 100 * 0.5 = 50
      expect(xpEvent.amount).toBe(50);
      expect(xpEvent.outcome).toBe('partial');
      expect(progressionState.totalXP).toBe(50);
    });

    it('should award no XP on failure', () => {
      const xpEvent = progressionManager.awardXP(100, 'failure', 'expedition');

      expect(xpEvent.amount).toBe(0);
      expect(xpEvent.outcome).toBe('failure');
      expect(progressionState.totalXP).toBe(0);
    });

    it('should accumulate XP over multiple awards', () => {
      progressionManager.awardXP(30, 'success', 'expedition');
      progressionManager.awardXP(40, 'success', 'raid');

      expect(progressionState.totalXP).toBe(70);
      expect(progressionState.currentXP).toBe(70);
    });
  });

  describe('Level Up', () => {
    it('should level up when reaching required XP', () => {
      const xpEvent = progressionManager.awardXP(100, 'success', 'expedition');

      expect(xpEvent.leveledUp).toBe(true);
      expect(xpEvent.levelUpEvent).toBeDefined();
      expect(xpEvent.levelUpEvent?.previousLevel).toBe(1);
      expect(xpEvent.levelUpEvent?.newLevel).toBe(2);
      expect(progressionState.level).toBe(2);
    });

    it('should call character store levelUp on level up', () => {
      const levelUpSpy = vi.spyOn(characterStore, 'levelUp');

      progressionManager.awardXP(100, 'success', 'expedition');

      expect(levelUpSpy).toHaveBeenCalled();
      expect(characterStore.state.level).toBe(2);
    });

    it('should handle overflow XP after level up', () => {
      // Award 150 XP (100 needed for level 2, 50 overflow)
      const xpEvent = progressionManager.awardXP(150, 'success', 'expedition');

      expect(xpEvent.leveledUp).toBe(true);
      expect(progressionState.level).toBe(2);
      expect(progressionState.totalXP).toBe(150);
      expect(progressionState.currentXP).toBe(50); // Overflow
    });

    it('should handle multiple level ups in one award', () => {
      // Award enough XP to skip multiple levels
      const xpEvent = progressionManager.awardXP(1000, 'success', 'raid');

      expect(xpEvent.leveledUp).toBe(true);
      expect(progressionState.level).toBeGreaterThan(2);
    });

    it('should not level up with insufficient XP', () => {
      const xpEvent = progressionManager.awardXP(50, 'success', 'expedition');

      expect(xpEvent.leveledUp).toBe(false);
      expect(xpEvent.levelUpEvent).toBeUndefined();
      expect(progressionState.level).toBe(1);
    });

    it('should update xpToNextLevel after level up', () => {
      progressionManager.awardXP(100, 'success', 'expedition');

      expect(progressionState.level).toBe(2);
      expect(progressionState.xpToNextLevel).toBeGreaterThan(0);
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate progress percentage', () => {
      progressionManager.awardXP(50, 'success', 'expedition');

      const progress = progressionManager.getProgressPercentage();
      expect(progress).toBe(50); // 50/100 = 50%
    });

    it('should return 100% when at level cap', () => {
      progressionState.xpToNextLevel = 0;

      const progress = progressionManager.getProgressPercentage();
      expect(progress).toBe(100);
    });

    it('should return 0% at level start', () => {
      const progress = progressionManager.getProgressPercentage();
      expect(progress).toBe(0);
    });
  });

  describe('Level Lookup', () => {
    it('should get level 1 for 0 XP', () => {
      const level = progressionManager.getLevelForXP(0);
      expect(level).toBe(1);
    });

    it('should get level 2 for 100 XP', () => {
      const level = progressionManager.getLevelForXP(100);
      expect(level).toBe(2);
    });

    it('should get level 2 for 150 XP', () => {
      const level = progressionManager.getLevelForXP(150);
      expect(level).toBe(2);
    });

    it('should get correct level for high XP', () => {
      const level = progressionManager.getLevelForXP(1000);
      expect(level).toBeGreaterThan(2);
    });
  });

  describe('XP Curve', () => {
    it('should generate XP curve for multiple levels', () => {
      const curve = progressionManager.getXPCurve(5);

      expect(curve).toHaveLength(5);
      expect(curve[0]).toBeGreaterThan(0); // Level 2
      expect(curve[1]).toBeGreaterThan(curve[0]); // Level 3
      expect(curve[2]).toBeGreaterThan(curve[1]); // Level 4
    });
  });

  describe('State Management', () => {
    it('should return current state', () => {
      const state = progressionManager.getState();

      expect(state.level).toBe(1);
      expect(state.totalXP).toBe(0);
      expect(state.currentXP).toBe(0);
    });

    it('should sync with character state', () => {
      progressionState.level = 5;
      progressionManager.syncWithCharacter();

      expect(characterStore.state.level).toBe(5);
    });
  });

  describe('Custom XP Config', () => {
    it('should use custom base XP', () => {
      const customManager = createProgressionManager(progressionState, characterStore, {
        baseXP: 200,
      });

      const xp = customManager.calculateXPForLevel(2);
      expect(xp).toBe(200);
    });

    it('should use custom partial success multiplier', () => {
      const customManager = createProgressionManager(progressionState, characterStore, {
        partialSuccessMultiplier: 0.75,
      });

      const xpEvent = customManager.awardXP(100, 'partial', 'expedition');
      expect(xpEvent.amount).toBe(75);
    });
  });

  describe('XP to Next Level', () => {
    it('should calculate XP needed for next level', () => {
      const xpNeeded = progressionManager.getXPToNextLevel();
      expect(xpNeeded).toBe(100);
    });

    it('should update XP needed after gaining XP', () => {
      progressionManager.awardXP(50, 'success', 'expedition');
      const xpNeeded = progressionManager.getXPToNextLevel();
      expect(xpNeeded).toBe(50);
    });

    it('should calculate XP needed after level up', () => {
      progressionManager.awardXP(100, 'success', 'expedition');
      const xpNeeded = progressionManager.getXPToNextLevel();
      expect(xpNeeded).toBeGreaterThan(100); // Level 3 requires more XP
    });
  });
});
