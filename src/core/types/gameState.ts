/**
 * Core Game State Types
 * Central type definitions for the entire game state
 */

import { TimerState, TimerConfig } from '../../systems/pomodoro/types';
import { ProgressionState } from '../../systems/progression/types';
import { CharacterState } from './character';
import { InventoryState } from './items';
import { TaskState } from './tasks';

/**
 * Root game state structure
 * This represents the entire persisted game state
 */
export interface GameState {
  /** Timer state and configuration */
  timer: TimerState;

  /** Timer configuration (user settings) */
  timerConfig: TimerConfig;

  /** Character state (stats, equipment, injuries) */
  character: CharacterState;

  /** Inventory state (items, gold) */
  inventory: InventoryState;

  /** Task state (active task, history, statistics) */
  tasks: TaskState;

  /** Progression data (XP, level, streaks) */
  progression: ProgressionState;

  /** Game metadata */
  metadata: GameMetadata;
}

/**
 * Game metadata for versioning and timestamps
 */
export interface GameMetadata {
  /** Save format version for migration support */
  version: string;

  /** Timestamp of last save */
  lastSaveTimestamp: number;

  /** Timestamp when game was first created */
  createdTimestamp: number;
}

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  GAME_STATE: 'pomodoro-rpg:game-state',
  TIMER_CONFIG: 'pomodoro-rpg:timer-config',
} as const;

/**
 * Current save format version
 */
export const CURRENT_SAVE_VERSION = '1.0.0';
