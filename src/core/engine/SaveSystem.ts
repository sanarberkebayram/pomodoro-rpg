/**
 * SaveSystem - Generic persistence layer for localStorage
 * Provides debounced auto-save, error handling, and version management
 */

import { GameState, STORAGE_KEYS, CURRENT_SAVE_VERSION } from '../types/gameState';

/**
 * Result type for save/load operations
 */
export type SaveResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Options for SaveSystem configuration
 */
export interface SaveSystemOptions {
  /** Debounce delay in milliseconds (default: 500ms) */
  debounceMs?: number;

  /** Enable console logging for debugging */
  enableLogging?: boolean;

  /** Custom serializer (default: JSON.stringify) */
  serialize?: (data: unknown) => string;

  /** Custom deserializer (default: JSON.parse) */
  deserialize?: (data: string) => unknown;
}

/**
 * Generic SaveSystem for localStorage persistence
 * Handles debouncing, error handling, and data validation
 */
export class SaveSystem {
  private debounceTimer: number | null = null;
  private readonly debounceMs: number;
  private readonly enableLogging: boolean;
  private readonly serialize: (data: unknown) => string;
  private readonly deserialize: (data: string) => unknown;
  private pendingSave: GameState | null = null;

  constructor(options: SaveSystemOptions = {}) {
    this.debounceMs = options.debounceMs ?? 500;
    this.enableLogging = options.enableLogging ?? false;
    this.serialize = options.serialize ?? JSON.stringify;
    this.deserialize = options.deserialize ?? JSON.parse;
  }

  /**
   * Save game state to localStorage (debounced)
   * @param state - Complete game state to save
   */
  public save(state: GameState): void {
    // Store the pending save
    this.pendingSave = state;

    // Clear existing debounce timer
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }

    // Set new debounce timer
    this.debounceTimer = window.setTimeout(() => {
      if (this.pendingSave) {
        this.saveImmediate(this.pendingSave);
        this.pendingSave = null;
      }
      this.debounceTimer = null;
    }, this.debounceMs);
  }

  /**
   * Save immediately without debouncing
   * @param state - Complete game state to save
   */
  public saveImmediate(state: GameState): SaveResult<void> {
    try {
      // Update metadata
      const stateWithMetadata: GameState = {
        ...state,
        metadata: {
          ...state.metadata,
          version: CURRENT_SAVE_VERSION,
          lastSaveTimestamp: Date.now(),
        },
      };

      // Serialize and save
      const serialized = this.serialize(stateWithMetadata);
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, serialized);

      if (this.enableLogging) {
        console.log('[SaveSystem] Game state saved successfully', {
          timestamp: new Date(stateWithMetadata.metadata.lastSaveTimestamp).toISOString(),
          version: stateWithMetadata.metadata.version,
        });
      }

      return { success: true, data: undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[SaveSystem] Failed to save game state:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Load game state from localStorage
   * @returns SaveResult with loaded state or error
   */
  public load(): SaveResult<GameState> {
    try {
      const serialized = localStorage.getItem(STORAGE_KEYS.GAME_STATE);

      if (!serialized) {
        return {
          success: false,
          error: 'No saved game state found',
        };
      }

      const data = this.deserialize(serialized) as GameState;

      // Validate basic structure
      if (!this.validateGameState(data)) {
        return {
          success: false,
          error: 'Invalid game state structure',
        };
      }

      // Check version compatibility
      const versionCheck = this.checkVersion(data.metadata.version);
      if (!versionCheck.success) {
        return versionCheck;
      }

      if (this.enableLogging) {
        console.log('[SaveSystem] Game state loaded successfully', {
          version: data.metadata.version,
          lastSave: new Date(data.metadata.lastSaveTimestamp).toISOString(),
        });
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[SaveSystem] Failed to load game state:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check if a saved game exists
   */
  public hasSavedGame(): boolean {
    return localStorage.getItem(STORAGE_KEYS.GAME_STATE) !== null;
  }

  /**
   * Clear all saved data (use with caution!)
   */
  public clear(): SaveResult<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.GAME_STATE);

      if (this.enableLogging) {
        console.log('[SaveSystem] Game state cleared');
      }

      return { success: true, data: undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[SaveSystem] Failed to clear game state:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Flush any pending saves immediately
   * Useful for ensuring data is saved before page unload
   */
  public flush(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.pendingSave) {
      this.saveImmediate(this.pendingSave);
      this.pendingSave = null;
    }
  }

  /**
   * Get the age of the last save in milliseconds
   * @returns Age in ms, or null if no save exists
   */
  public getLastSaveAge(): number | null {
    const result = this.load();
    if (!result.success) {
      return null;
    }

    return Date.now() - result.data.metadata.lastSaveTimestamp;
  }

  /**
   * Validate basic game state structure
   */
  private validateGameState(data: unknown): data is GameState {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const state = data as Partial<GameState>;

    return !!(
      state.timer &&
      state.timerConfig &&
      state.character &&
      state.inventory &&
      state.progression &&
      state.metadata &&
      typeof state.metadata.version === 'string' &&
      typeof state.metadata.lastSaveTimestamp === 'number' &&
      typeof state.metadata.createdTimestamp === 'number'
    );
  }

  /**
   * Check version compatibility
   * Currently supports only exact version match, but can be extended for migrations
   */
  private checkVersion(version: string): SaveResult<void> {
    // For now, we only support exact version match
    // Future: Add migration logic here
    if (version !== CURRENT_SAVE_VERSION) {
      return {
        success: false,
        error: `Incompatible save version: ${version} (current: ${CURRENT_SAVE_VERSION})`,
      };
    }

    return { success: true, data: undefined };
  }
}

/**
 * Singleton instance for global access
 * Can be replaced with dependency injection in the future
 */
export const saveSystem = new SaveSystem({
  enableLogging: import.meta.env.DEV,
});
