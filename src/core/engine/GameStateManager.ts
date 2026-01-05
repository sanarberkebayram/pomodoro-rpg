/**
 * GameStateManager - Central orchestrator for game state initialization and persistence
 * Handles creating new games, loading saves, and coordinating state updates
 */

import { GameState, CURRENT_SAVE_VERSION } from '../types/gameState';
import { PomodoroTimer } from '../../systems/pomodoro/PomodoroTimer';
import { DEFAULT_TIMER_CONFIG, TimerConfig } from '../../systems/pomodoro/types';
import { createInitialCharacterState } from '../state/CharacterState';
import { createInitialEventState } from '../state/EventState';
import { createInitialInventoryState } from '../state/InventoryState';
import { createInitialTaskState } from '../state/TaskState';
import { ProgressionState } from '../../systems/progression/types';
import { CharacterClass } from '../types/character';
import { saveSystem, SaveResult } from './SaveSystem';

/**
 * Options for creating a new game
 */
export interface NewGameOptions {
  characterClass: CharacterClass;
  timerConfig?: Partial<TimerConfig>;
}

/**
 * Initial progression state
 */
function createInitialProgressionState(): ProgressionState {
  return {
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
}

/**
 * Create a fresh game state
 */
export function createNewGameState(options: NewGameOptions): GameState {
  const timerConfig: TimerConfig = {
    ...DEFAULT_TIMER_CONFIG,
    ...options.timerConfig,
  };

  const timer = new PomodoroTimer(timerConfig);

  return {
    timer: timer.getState(),
    timerConfig,
    character: createInitialCharacterState({ class: options.characterClass }),
    inventory: createInitialInventoryState(),
    tasks: createInitialTaskState(),
    progression: createInitialProgressionState(),
    eventState: createInitialEventState(),
    metadata: {
      version: CURRENT_SAVE_VERSION,
      lastSaveTimestamp: Date.now(),
      createdTimestamp: Date.now(),
    },
  };
}

/**
 * GameStateManager class
 * Coordinates state initialization, loading, and saving
 */
export class GameStateManager {
  private currentState: GameState | null = null;
  private timer: PomodoroTimer | null = null;

  /**
   * Initialize game state - either load existing or create new
   */
  public initialize(newGameOptions?: NewGameOptions): SaveResult<GameState> {
    // Try to load existing save first
    if (!newGameOptions) {
      const loadResult = saveSystem.load();
      if (loadResult.success) {
        this.currentState = loadResult.data;
        this.timer = new PomodoroTimer(loadResult.data.timerConfig, loadResult.data.timer);
        return loadResult;
      }
    }

    // Create new game if no save or new game requested
    const options = newGameOptions ?? {
      characterClass: 'Vanguard',
    };

    this.currentState = createNewGameState(options);
    this.timer = new PomodoroTimer(this.currentState.timerConfig);

    // Save the new game state
    const saveResult = saveSystem.saveImmediate(this.currentState);
    if (!saveResult.success) {
      return {
        success: false,
        error: `Failed to save new game: ${saveResult.error}`,
      };
    }

    return {
      success: true,
      data: this.currentState,
    };
  }

  /**
   * Get current game state
   */
  public getState(): GameState {
    if (!this.currentState) {
      throw new Error('GameStateManager not initialized');
    }
    return this.currentState;
  }

  /**
   * Get timer instance
   */
  public getTimer(): PomodoroTimer {
    if (!this.timer) {
      throw new Error('GameStateManager not initialized');
    }
    return this.timer;
  }

  /**
   * Update game state and persist
   */
  public updateState(updater: (state: GameState) => GameState): void {
    if (!this.currentState) {
      throw new Error('GameStateManager not initialized');
    }

    this.currentState = updater(this.currentState);
    saveSystem.save(this.currentState);
  }

  /**
   * Update timer state in game state
   */
  public syncTimerState(): void {
    if (!this.timer || !this.currentState) {
      throw new Error('GameStateManager not initialized');
    }

    this.currentState = {
      ...this.currentState,
      timer: this.timer.getState(),
    };

    saveSystem.save(this.currentState);
  }

  /**
   * Check if there's an existing save
   */
  public hasSavedGame(): boolean {
    return saveSystem.hasSavedGame();
  }

  /**
   * Clear current game and start fresh
   */
  public clearGame(): SaveResult<void> {
    this.currentState = null;
    this.timer = null;
    return saveSystem.clear();
  }

  /**
   * Force immediate save (useful before page unload)
   */
  public flush(): void {
    saveSystem.flush();
  }
}

/**
 * Singleton instance for global access
 */
export const gameStateManager = new GameStateManager();
