import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SaveSystem } from '../../../../src/core/engine/SaveSystem';
import {
  GameState,
  STORAGE_KEYS,
  CURRENT_SAVE_VERSION,
} from '../../../../src/core/types/gameState';
import type { PomodoroPhase } from '../../../../src/systems/pomodoro/types';

describe('SaveSystem', () => {
  let saveSystem: SaveSystem;
  let mockGameState: GameState;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.useFakeTimers();

    // Create a fresh SaveSystem instance
    saveSystem = new SaveSystem({ enableLogging: false });

    // Create a mock game state
    mockGameState = createMockGameState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should create SaveSystem with default options', () => {
      expect(saveSystem).toBeDefined();
    });

    it('should create SaveSystem with custom options', () => {
      const customSaveSystem = new SaveSystem({
        debounceMs: 1000,
        enableLogging: true,
      });
      expect(customSaveSystem).toBeDefined();
    });

    it('should report no saved game initially', () => {
      expect(saveSystem.hasSavedGame()).toBe(false);
    });
  });

  describe('Save Operations', () => {
    it('should save game state immediately', () => {
      const result = saveSystem.saveImmediate(mockGameState);

      expect(result.success).toBe(true);
      expect(localStorage.getItem(STORAGE_KEYS.GAME_STATE)).not.toBeNull();
    });

    it('should update metadata on save', () => {
      const beforeSave = Date.now();
      saveSystem.saveImmediate(mockGameState);
      const afterSave = Date.now();

      const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
      expect(saved).not.toBeNull();
      const parsed = JSON.parse(saved as string) as GameState;

      expect(parsed.metadata.version).toBe(CURRENT_SAVE_VERSION);
      expect(parsed.metadata.lastSaveTimestamp).toBeGreaterThanOrEqual(beforeSave);
      expect(parsed.metadata.lastSaveTimestamp).toBeLessThanOrEqual(afterSave);
    });

    it('should debounce save operations', () => {
      saveSystem.save(mockGameState);

      // Immediately check - should not have saved yet
      expect(localStorage.getItem(STORAGE_KEYS.GAME_STATE)).toBeNull();

      // Advance timers past debounce delay
      vi.advanceTimersByTime(500);

      // Now it should be saved
      expect(localStorage.getItem(STORAGE_KEYS.GAME_STATE)).not.toBeNull();
    });

    it('should cancel previous debounced save when new save is called', () => {
      const state1 = {
        ...mockGameState,
        timer: { ...mockGameState.timer, phase: 'WORK' as PomodoroPhase },
      };
      const state2 = {
        ...mockGameState,
        timer: { ...mockGameState.timer, phase: 'SHORT_BREAK' as PomodoroPhase },
      };

      saveSystem.save(state1);
      vi.advanceTimersByTime(200);
      saveSystem.save(state2);
      vi.advanceTimersByTime(500);

      const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
      expect(saved).not.toBeNull();
      const parsed = JSON.parse(saved as string) as GameState;

      // Should have saved state2, not state1
      expect(parsed.timer.phase).toBe('SHORT_BREAK');
    });

    it('should flush pending saves immediately', () => {
      saveSystem.save(mockGameState);
      expect(localStorage.getItem(STORAGE_KEYS.GAME_STATE)).toBeNull();

      saveSystem.flush();

      // Should save immediately without waiting for debounce
      expect(localStorage.getItem(STORAGE_KEYS.GAME_STATE)).not.toBeNull();
    });

    it('should handle save errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const result = saveSystem.saveImmediate(mockGameState);

      expect(result.success).toBe(false);
      expect(result.error).toBe('QuotaExceededError');

      setItemSpy.mockRestore();
    });
  });

  describe('Load Operations', () => {
    beforeEach(() => {
      // Save a game state for loading tests
      saveSystem.saveImmediate(mockGameState);
    });

    it('should load saved game state', () => {
      const result = saveSystem.load();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timer.phase).toBe(mockGameState.timer.phase);
        expect(result.data.progression.level).toBe(mockGameState.progression.level);
      }
    });

    it('should return error when no save exists', () => {
      localStorage.clear();
      const result = saveSystem.load();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('No saved game state found');
      }
    });

    it('should validate game state structure on load', () => {
      // Save invalid data
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify({ invalid: 'data' }));

      const result = saveSystem.load();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid game state structure');
      }
    });

    it('should check version compatibility', () => {
      // Create state with incompatible version
      const incompatibleState = {
        ...mockGameState,
        metadata: {
          ...mockGameState.metadata,
          version: '99.99.99',
        },
      };

      localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(incompatibleState));

      const result = saveSystem.load();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Incompatible save version');
      }
    });

    it('should handle load errors gracefully', () => {
      // Save malformed JSON
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, 'not valid json{]');

      const result = saveSystem.load();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Clear Operations', () => {
    beforeEach(() => {
      saveSystem.saveImmediate(mockGameState);
    });

    it('should clear saved game state', () => {
      expect(saveSystem.hasSavedGame()).toBe(true);

      const result = saveSystem.clear();

      expect(result.success).toBe(true);
      expect(saveSystem.hasSavedGame()).toBe(false);
    });

    it('should handle clear errors gracefully', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      removeItemSpy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = saveSystem.clear();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Storage error');
      }

      removeItemSpy.mockRestore();
    });
  });

  describe('Utility Functions', () => {
    it('should check if saved game exists', () => {
      expect(saveSystem.hasSavedGame()).toBe(false);

      saveSystem.saveImmediate(mockGameState);

      expect(saveSystem.hasSavedGame()).toBe(true);
    });

    it('should get last save age', () => {
      saveSystem.saveImmediate(mockGameState);

      vi.advanceTimersByTime(5000);

      const age = saveSystem.getLastSaveAge();

      expect(age).not.toBeNull();
      expect(age).toBeGreaterThanOrEqual(4900);
      expect(age).toBeLessThanOrEqual(5100);
    });

    it('should return null for last save age when no save exists', () => {
      const age = saveSystem.getLastSaveAge();
      expect(age).toBeNull();
    });
  });

  describe('Custom Serialization', () => {
    it('should support custom serializer', () => {
      const customSerializer = vi.fn((data: unknown) => JSON.stringify(data));
      const customSaveSystem = new SaveSystem({
        serialize: customSerializer,
      });

      customSaveSystem.saveImmediate(mockGameState);

      expect(customSerializer).toHaveBeenCalled();
    });

    it('should support custom deserializer', () => {
      saveSystem.saveImmediate(mockGameState);

      const customDeserializer = vi.fn((data: string) => JSON.parse(data));
      const customSaveSystem = new SaveSystem({
        deserialize: customDeserializer,
      });

      customSaveSystem.load();

      expect(customDeserializer).toHaveBeenCalled();
    });
  });

  describe('Round-trip Persistence', () => {
    it('should preserve all data through save and load cycle', () => {
      saveSystem.saveImmediate(mockGameState);
      const result = saveSystem.load();

      expect(result.success).toBe(true);
      if (result.success) {
        // Verify timer state
        expect(result.data.timer.phase).toBe(mockGameState.timer.phase);
        expect(result.data.timer.remainingSeconds).toBe(mockGameState.timer.remainingSeconds);
        expect(result.data.timer.isRunning).toBe(mockGameState.timer.isRunning);

        // Verify progression
        expect(result.data.progression.level).toBe(mockGameState.progression.level);
        expect(result.data.progression.currentXP).toBe(mockGameState.progression.currentXP);

        // Verify streak data
        expect(result.data.progression.streak.currentStreak).toBe(
          mockGameState.progression.streak.currentStreak
        );

        // Verify config
        expect(result.data.timerConfig.workDuration).toBe(mockGameState.timerConfig.workDuration);
      }
    });
  });

  describe('Multiple SaveSystem Instances', () => {
    it('should work correctly with multiple instances', () => {
      const saveSystem1 = new SaveSystem();
      const saveSystem2 = new SaveSystem();

      saveSystem1.saveImmediate(mockGameState);

      const result = saveSystem2.load();
      expect(result.success).toBe(true);
    });
  });
});

/**
 * Helper function to create a valid mock game state
 */
function createMockGameState(): GameState {
  return {
    timer: {
      phase: 'IDLE',
      remainingSeconds: 1500,
      isRunning: false,
      completedSessions: 0,
      totalCompletedSessions: 0,
      lastUpdateTimestamp: Date.now(),
      isPaused: false,
    },
    timerConfig: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
    },
    character: {
      class: 'Vanguard',
      level: 1,
      baseStats: {
        power: 10,
        defense: 8,
        focus: 6,
        luck: 5,
        health: 100,
        maxHealth: 100,
      },
      computedStats: {
        power: 10,
        defense: 8,
        focus: 6,
        luck: 5,
        health: 100,
        maxHealth: 100,
      },
      equipment: {
        weapon: null,
        armor: null,
        accessory: null,
      },
      injury: {
        isInjured: false,
        severity: 'minor',
        successPenalty: 0,
        injuredAt: null,
      },
      hospitalBill: null,
      statusEffects: [],
      metadata: {
        createdAt: Date.now(),
        tasksCompleted: 0,
        tasksFailed: 0,
      },
    },
    inventory: {
      slots: Array.from({ length: 20 }, (_, i) => ({
        slotId: `slot-${i}`,
        item: null,
        quantity: 0,
        locked: false,
      })),
      maxSlots: 20,
      gold: 0,
      quickSlots: [null, null, null, null],
      metadata: {
        totalItemsCollected: 0,
        totalGoldEarned: 0,
        mostValuableItemId: null,
      },
    },
    progression: {
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
    },
    metadata: {
      version: CURRENT_SAVE_VERSION,
      lastSaveTimestamp: Date.now(),
      createdTimestamp: Date.now(),
    },
  };
}
