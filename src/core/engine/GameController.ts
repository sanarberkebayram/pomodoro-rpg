/**
 * GameController - Orchestrates game loop, task execution, and event generation
 * Connects timer, task system, event system, and state management
 */

import { PomodoroTimer } from '../../systems/pomodoro/PomodoroTimer';
import { PomodoroPhase } from '../../systems/pomodoro/types';
import { GameEvent } from '../types/events';
import { GameState } from '../types/gameState';
import { TaskOutcome } from '../types/tasks';

/**
 * Callback types for game events
 */
export interface GameControllerCallbacks {
  onPhaseChange?: (phase: PomodoroPhase) => void;
  onTimerTick?: (remainingSeconds: number) => void;
  onTaskProgress?: (progress: number) => void;
  onEventGenerated?: (event: GameEvent) => void;
  onTaskComplete?: (outcome: TaskOutcome) => void;
  onStateUpdate?: (state: GameState) => void;
}

/**
 * GameController class
 * Main game loop orchestrator
 */
export class GameController {
  private timer: PomodoroTimer;
  private callbacks: GameControllerCallbacks;
  private tickInterval: number | null = null;
  private unsubscribeTimer: (() => void) | null = null;
  private lastPhase: PomodoroPhase;
  private isInitialized = false;

  constructor(
    timer: PomodoroTimer,
    initialState: GameState,
    callbacks: GameControllerCallbacks = {}
  ) {
    this.timer = timer;
    this.callbacks = callbacks;
    this.lastPhase = this.timer.getState().phase;

    void initialState;
  }

  /**
   * Initialize the controller and start game loop
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Set up timer listeners
    this.unsubscribeTimer = this.timer.subscribe((state) => {
      this.handlePhaseChange(state.phase);
      this.callbacks.onTimerTick?.(state.remainingSeconds);
    });

    // Start the tick interval
    this.startTickLoop();

    this.isInitialized = true;
  }

  /**
   * Start the game timer
   */
  public start(): void {
    this.timer.dispatch({ type: 'START' });
  }

  /**
   * Pause the timer (emergency pause during WORK)
   */
  public pause(): void {
    this.timer.dispatch({ type: 'PAUSE' });
  }

  /**
   * Resume the timer
   */
  public resume(): void {
    this.timer.dispatch({ type: 'RESUME' });
  }

  /**
   * Skip to next phase
   */
  public skip(): void {
    this.timer.dispatch({ type: 'SKIP' });
  }

  /**
   * Reset timer
   */
  public reset(): void {
    this.timer.dispatch({ type: 'RESET' });
  }

  /**
   * Get current timer state
   */
  public getTimerState() {
    return this.timer.getState();
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stopTickLoop();
    if (this.unsubscribeTimer) {
      this.unsubscribeTimer();
      this.unsubscribeTimer = null;
    }
    this.isInitialized = false;
  }

  /**
   * Handle phase changes
   */
  private handlePhaseChange(phase: PomodoroPhase): void {
    if (phase === this.lastPhase) {
      return;
    }

    this.lastPhase = phase;

    // Notify phase change
    this.callbacks.onPhaseChange?.(phase);
  }

  /**
   * Start the tick loop
   */
  private startTickLoop(): void {
    if (this.tickInterval !== null) {
      return;
    }

    this.tickInterval = window.setInterval(() => {
      const state = this.timer.getState();

      if (state.isRunning && !state.isPaused) {
        // Tick the timer
        this.timer.dispatch({ type: 'TICK', deltaSeconds: 1 });
      }
    }, 1000);
  }

  /**
   * Stop the tick loop
   */
  private stopTickLoop(): void {
    if (this.tickInterval !== null) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
}
