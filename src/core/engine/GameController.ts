/**
 * GameController - Orchestrates game loop, task execution, and event generation
 * Connects timer, task system, event system, and state management
 */

import { PomodoroTimer } from '../../systems/pomodoro/PomodoroTimer';
import { PomodoroPhase } from '../../systems/pomodoro/types';
import { TaskManager } from '../../systems/tasks/TaskManager';
import { TaskExecutor } from '../../systems/tasks/TaskExecutor';
import { EventGenerator } from '../../systems/events/EventGenerator';
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
  private taskManager: TaskManager;
  private taskExecutor: TaskExecutor | null = null;
  private eventGenerator: EventGenerator;
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
    this.taskManager = new TaskManager();
    this.eventGenerator = new EventGenerator();
    this.callbacks = callbacks;
    this.lastPhase = this.timer.getState().phase;

    // Restore task state if exists
    if (initialState.tasks.activeTask) {
      this.taskManager.selectTask(
        initialState.tasks.activeTask.taskId,
        initialState.tasks.activeTask.riskLevel
      );
    }
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
      this.callbacks.onTimerTick?.(state.remainingSeconds);

      // Handle phase changes
      this.handlePhaseChange(state.phase);
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
    this.stopTaskExecution();
  }

  /**
   * Get current timer state
   */
  public getTimerState() {
    return this.timer.getState();
  }

  /**
   * Get task manager
   */
  public getTaskManager(): TaskManager {
    return this.taskManager;
  }

  /**
   * Get current events from task execution
   */
  public getCurrentEvents(): GameEvent[] {
    return this.taskExecutor?.getGeneratedEvents() ?? [];
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stopTickLoop();
    this.stopTaskExecution();
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
    const previousPhase = this.lastPhase;
    this.lastPhase = phase;

    // Notify phase change
    this.callbacks.onPhaseChange?.(phase);

    // Start task execution on WORK phase
    if (phase === 'WORK' && previousPhase !== 'WORK') {
      this.startTaskExecution();
    }

    // Complete task when leaving WORK phase
    if (previousPhase === 'WORK' && phase !== 'WORK') {
      this.completeTaskExecution();
    }
  }

  /**
   * Start task execution during WORK phase
   */
  private startTaskExecution(): void {
    const selectedTask = this.taskManager.getSelectedTask();
    if (!selectedTask) {
      console.warn('[GameController] No task selected for WORK phase');
      return;
    }

    // Create task executor
    const workDuration = this.timer.getConfig().workDuration * 60; // Convert to seconds

    this.taskExecutor = new TaskExecutor(
      selectedTask.task,
      selectedTask.riskLevel,
      {
        // Mock character state for now - will be replaced with real state
        power: 10,
        defense: 5,
        focus: 8,
        luck: 5,
        health: 100,
        maxHealth: 100,
      },
      {},
      this.eventGenerator,
      workDuration
    );

    // Set up event callback
    this.taskExecutor.onEventGenerated = (event) => {
      this.callbacks.onEventGenerated?.(event);
    };

    // Start execution
    this.taskExecutor.start();
  }

  /**
   * Update task execution progress
   */
  private updateTaskExecution(elapsedSeconds: number): void {
    if (!this.taskExecutor) {
      return;
    }

    this.taskExecutor.update(elapsedSeconds);

    const progress = this.taskExecutor.getProgress();
    this.callbacks.onTaskProgress?.(progress);
  }

  /**
   * Complete task execution
   */
  private completeTaskExecution(): void {
    if (!this.taskExecutor) {
      return;
    }

    const outcome = this.taskExecutor.complete();
    this.callbacks.onTaskComplete?.(outcome);

    this.taskExecutor = null;
  }

  /**
   * Stop task execution
   */
  private stopTaskExecution(): void {
    if (this.taskExecutor) {
      this.taskExecutor.stop();
      this.taskExecutor = null;
    }
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

        // Update task execution if in WORK phase
        if (state.phase === 'WORK') {
          const config = this.timer.getConfig();
          const totalSeconds = config.workDuration * 60;
          const elapsedSeconds = totalSeconds - state.remainingSeconds;
          this.updateTaskExecution(elapsedSeconds);
        }
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
