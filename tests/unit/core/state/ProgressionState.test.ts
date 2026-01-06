/**
 * Progression State Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createProgressionStore,
  createInitialProgressionState,
  type ProgressionStore,
} from '../../../../src/core/state/ProgressionState';

describe('ProgressionState', () => {
  let store: ProgressionStore;

  beforeEach(() => {
    store = createProgressionStore();
  });

  describe('Initial State', () => {
    it('should create initial state with level 1', () => {
      const state = createInitialProgressionState();

      expect(state.level).toBe(1);
      expect(state.currentXP).toBe(0);
      expect(state.totalXP).toBe(0);
      expect(state.xpToNextLevel).toBe(100);
    });

    it('should initialize streak data', () => {
      const state = createInitialProgressionState();

      expect(state.streak.currentStreak).toBe(0);
      expect(state.streak.longestStreak).toBe(0);
      expect(state.streak.lastCompletionDate).toBeNull();
      expect(state.streak.totalActiveDays).toBe(0);
    });
  });

  describe('XP Management', () => {
    it('should award XP', () => {
      store.awardXP(50);

      expect(store.state.currentXP).toBe(50);
      expect(store.state.totalXP).toBe(50);
    });

    it('should accumulate XP', () => {
      store.awardXP(30);
      store.awardXP(20);

      expect(store.state.currentXP).toBe(50);
      expect(store.state.totalXP).toBe(50);
    });
  });

  describe('Level Up', () => {
    it('should update level and XP requirements', () => {
      store.levelUp(2, 200, 50);

      expect(store.state.level).toBe(2);
      expect(store.state.xpToNextLevel).toBe(200);
      expect(store.state.currentXP).toBe(50);
    });
  });

  describe('Streak Management', () => {
    it('should increment streak', () => {
      store.incrementStreak();

      expect(store.state.streak.currentStreak).toBe(1);
      expect(store.state.streak.longestStreak).toBe(1);
      expect(store.state.streak.totalActiveDays).toBe(1);
    });

    it('should update last completion date', () => {
      store.incrementStreak();

      const today = new Date().toISOString().split('T')[0];
      expect(store.state.streak.lastCompletionDate).toBe(today);
    });

    it('should update longest streak', () => {
      store.incrementStreak();
      store.incrementStreak();
      store.incrementStreak();

      expect(store.state.streak.currentStreak).toBe(3);
      expect(store.state.streak.longestStreak).toBe(3);
    });

    it('should maintain longest streak after breaking', () => {
      store.incrementStreak();
      store.incrementStreak();
      store.incrementStreak();

      store.breakStreak();

      expect(store.state.streak.currentStreak).toBe(0);
      expect(store.state.streak.longestStreak).toBe(3);
    });

    it('should break streak', () => {
      store.incrementStreak();
      store.incrementStreak();

      store.breakStreak();

      expect(store.state.streak.currentStreak).toBe(0);
    });
  });

  describe('Streak Status Check', () => {
    it('should return continue for first completion', () => {
      const status = store.checkStreakStatus();
      expect(status).toBe('continue');
    });

    it('should return already-completed if completed today', () => {
      store.incrementStreak();

      const status = store.checkStreakStatus();
      expect(status).toBe('already-completed');
    });

    it('should return break for missed days', () => {
      // Manually set last completion date to 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      store.updateStreak({
        currentStreak: 5,
        longestStreak: 5,
        lastCompletionDate: threeDaysAgo.toISOString().split('T')[0],
        totalActiveDays: 5,
      });

      const status = store.checkStreakStatus();
      expect(status).toBe('break');
    });

    it('should return continue for consecutive day', () => {
      // Manually set last completion date to yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      store.updateStreak({
        currentStreak: 2,
        longestStreak: 2,
        lastCompletionDate: yesterday.toISOString().split('T')[0],
        totalActiveDays: 2,
      });

      const status = store.checkStreakStatus();
      expect(status).toBe('continue');
    });
  });

  describe('Session Completion', () => {
    it('should start new streak on first completion', () => {
      store.processSessionCompletion();

      expect(store.state.streak.currentStreak).toBe(1);
    });

    it('should continue streak on consecutive day', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      store.updateStreak({
        currentStreak: 3,
        longestStreak: 3,
        lastCompletionDate: yesterday.toISOString().split('T')[0],
        totalActiveDays: 3,
      });

      store.processSessionCompletion();

      expect(store.state.streak.currentStreak).toBe(4);
    });

    it('should break and restart streak on missed days', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      store.updateStreak({
        currentStreak: 5,
        longestStreak: 5,
        lastCompletionDate: threeDaysAgo.toISOString().split('T')[0],
        totalActiveDays: 5,
      });

      store.processSessionCompletion();

      expect(store.state.streak.currentStreak).toBe(1);
      expect(store.state.streak.longestStreak).toBe(5);
    });

    it('should not double-count completion on same day', () => {
      store.processSessionCompletion();
      store.processSessionCompletion();

      expect(store.state.streak.currentStreak).toBe(1);
    });
  });

  describe('State Reset', () => {
    it('should reset to initial state', () => {
      store.awardXP(100);
      store.incrementStreak();
      store.levelUp(3, 500, 200);

      store.reset();

      expect(store.state.level).toBe(1);
      expect(store.state.currentXP).toBe(0);
      expect(store.state.totalXP).toBe(0);
      expect(store.state.streak.currentStreak).toBe(0);
    });
  });

  describe('Complete State Management', () => {
    it('should set complete state', () => {
      const newState = {
        level: 5,
        currentXP: 250,
        xpToNextLevel: 500,
        totalXP: 1000,
        streak: {
          currentStreak: 10,
          longestStreak: 15,
          lastCompletionDate: '2026-01-05',
          totalActiveDays: 20,
        },
      };

      store.setCompleteState(newState);

      expect(store.state.level).toBe(5);
      expect(store.state.currentXP).toBe(250);
      expect(store.state.streak.currentStreak).toBe(10);
    });
  });

  describe('Completion Check', () => {
    it('should return false if never completed', () => {
      expect(store.wasCompletedToday()).toBe(false);
    });

    it('should return true if completed today', () => {
      store.incrementStreak();
      expect(store.wasCompletedToday()).toBe(true);
    });

    it('should return false if completed yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      store.updateStreak({
        currentStreak: 1,
        longestStreak: 1,
        lastCompletionDate: yesterday.toISOString().split('T')[0],
        totalActiveDays: 1,
      });

      expect(store.wasCompletedToday()).toBe(false);
    });
  });
});
