/**
 * Task Executor
 * Coordinates task execution, event generation, and progress tracking
 */

import type { ITask } from './tasks/BaseTask';
import type { TaskEvent, ActiveTask } from '../../core/types/tasks';

/**
 * Task execution state
 */
export interface TaskExecutionState {
  /** Current task implementation */
  task: ITask;

  /** Active task data */
  activeTask: ActiveTask;

  /** Last event generation time */
  lastEventTime: number;

  /** Accumulated events */
  events: TaskEvent[];

  /** Current progress (0-100) */
  progress: number;

  /** Start time */
  startTime: number;

  /** Estimated duration in milliseconds */
  estimatedDuration: number;
}

/**
 * Task Executor
 * Manages task execution flow during WORK phase
 */
export class TaskExecutor {
  private executionState: TaskExecutionState | null = null;

  /**
   * Start executing a task
   */
  startExecution(task: ITask, activeTask: ActiveTask, durationMs: number): void {
    this.executionState = {
      task,
      activeTask,
      lastEventTime: Date.now(),
      events: [],
      progress: 0,
      startTime: Date.now(),
      estimatedDuration: durationMs,
    };
  }

  /**
   * Update task execution (called periodically during WORK phase)
   * @param currentTime Current timestamp
   * @returns Generated events since last update
   */
  update(currentTime: number): TaskEvent[] {
    if (!this.executionState) {
      return [];
    }

    const newEvents: TaskEvent[] = [];

    // Calculate progress based on elapsed time
    const elapsed = currentTime - this.executionState.startTime;
    const progress = Math.min(100, (elapsed / this.executionState.estimatedDuration) * 100);
    this.executionState.progress = progress;

    // Check for milestone events
    const milestoneEvents = this.executionState.task.checkMilestones(progress);
    newEvents.push(...milestoneEvents);

    // Try to generate random event
    const randomEvent = this.executionState.task.generateEvent(
      progress,
      this.executionState.lastEventTime
    );

    if (randomEvent) {
      newEvents.push(randomEvent);
      this.executionState.lastEventTime = currentTime;
    }

    // Store events
    this.executionState.events.push(...newEvents);

    return newEvents;
  }

  /**
   * Get current progress (0-100)
   */
  getProgress(): number {
    return this.executionState?.progress ?? 0;
  }

  /**
   * Get current progress flavor text
   */
  getProgressFlavor(): string {
    if (!this.executionState) {
      return '';
    }
    return this.executionState.task.getProgressFlavor(this.executionState.progress);
  }

  /**
   * Get task start message
   */
  getStartMessage(): string {
    if (!this.executionState) {
      return '';
    }
    return this.executionState.task.getStartMessage();
  }

  /**
   * Get completion flavor based on outcome
   */
  getCompletionFlavor(outcome: 'success' | 'partial' | 'failure'): string {
    if (!this.executionState) {
      return '';
    }
    return this.executionState.task.getCompletionFlavor(outcome);
  }

  /**
   * Get all accumulated events
   */
  getEvents(): TaskEvent[] {
    return this.executionState?.events ?? [];
  }

  /**
   * Check if execution is active
   */
  isExecuting(): boolean {
    return this.executionState !== null;
  }

  /**
   * Stop execution and clear state
   */
  stopExecution(): void {
    this.executionState = null;
  }

  /**
   * Get estimated time remaining in milliseconds
   */
  getTimeRemaining(currentTime: number): number {
    if (!this.executionState) {
      return 0;
    }

    const elapsed = currentTime - this.executionState.startTime;
    const remaining = this.executionState.estimatedDuration - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Check if task execution should be complete
   */
  isComplete(currentTime: number): boolean {
    if (!this.executionState) {
      return false;
    }

    return this.getTimeRemaining(currentTime) <= 0;
  }
}

/**
 * Create a new task executor
 */
export function createTaskExecutor(): TaskExecutor {
  return new TaskExecutor();
}
