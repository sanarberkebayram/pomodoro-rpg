/**
 * Task Manager
 * Orchestrates task selection, execution, and completion
 */

import type { TaskStore } from '../../core/state/TaskState';
import type {
  TaskType,
  RiskLevel,
  TaskConfig,
  ActiveTask,
  TaskSelectionContext,
  TaskCompletionResult,
  TaskEvent,
} from '../../core/types/tasks';
import {
  calculateSuccessChance,
  resolveTaskOutcome,
  calculateRewards,
  shouldApplyInjury,
  determineInjurySeverity,
  generateTaskSummary,
} from './TaskResolver';

/**
 * Task Manager
 * Manages the lifecycle of tasks from selection to completion
 */
export class TaskManager {
  constructor(private taskStore: TaskStore) {}

  /**
   * Start a new task
   * Creates an ActiveTask and sets it in the store
   */
  startTask(
    taskType: TaskType,
    riskLevel: RiskLevel,
    taskConfig: TaskConfig,
    context: TaskSelectionContext
  ): ActiveTask {
    // Calculate initial success chance
    const successCalculation = calculateSuccessChance(taskConfig, riskLevel, context);

    // Create active task
    const activeTask: ActiveTask = {
      taskType,
      riskLevel,
      config: taskConfig,
      startedAt: Date.now(),
      calculatedSuccessChance: successCalculation.finalChance,
      progress: 0,
      events: [],
      outcome: null,
      earnedRewards: null,
    };

    // Set in store
    this.taskStore.setActiveTask(activeTask);

    return activeTask;
  }

  /**
   * Update task progress
   * Called periodically during WORK phase
   */
  updateProgress(progress: number): void {
    this.taskStore.updateTaskProgress(progress);
  }

  /**
   * Add a random event to the active task
   * Events can modify success chance, rewards, HP, etc.
   */
  addEvent(event: TaskEvent): void {
    this.taskStore.addTaskEvent(event);
  }

  /**
   * Complete the active task
   * Resolves outcome, calculates rewards, and handles injuries
   */
  completeTask(context: TaskSelectionContext): TaskCompletionResult | null {
    const activeTask = this.taskStore.state.activeTask;
    if (!activeTask) {
      console.warn('No active task to complete');
      return null;
    }

    // Calculate event modifiers
    const eventModifier = activeTask.events.reduce(
      (sum, event) => sum + (event.effects.successChanceModifier ?? 0),
      0
    );

    // Recalculate success chance with event modifiers
    const successCalculation = calculateSuccessChance(
      activeTask.config,
      activeTask.riskLevel,
      context,
      eventModifier
    );

    // Resolve outcome
    const outcome = resolveTaskOutcome(successCalculation.finalChance);

    // Calculate rewards
    const rewards = calculateRewards(
      activeTask.config,
      activeTask.riskLevel,
      outcome,
      context.characterStats.luck
    );

    // Determine injury
    const wasInjured = shouldApplyInjury(
      activeTask.config,
      outcome,
      context.characterStats.defense
    );
    const injurySeverity = wasInjured ? determineInjurySeverity(activeTask.riskLevel) : null;

    // Generate summary
    const summary = generateTaskSummary(activeTask, outcome, rewards, wasInjured);

    // Update active task with outcome
    activeTask.outcome = outcome;
    activeTask.earnedRewards = rewards;
    activeTask.progress = 100;

    // Create completion result
    const result: TaskCompletionResult = {
      task: activeTask,
      outcome,
      rewards,
      wasInjured,
      injurySeverity,
      eventCount: activeTask.events.length,
      summary,
    };

    // Complete task in store
    this.taskStore.completeActiveTask(result);

    return result;
  }

  /**
   * Cancel the active task
   * Used for emergency situations (e.g., user stops timer)
   */
  cancelTask(): void {
    this.taskStore.clearActiveTask();
  }

  /**
   * Get available tasks for selection
   * Filters tasks based on character level and unlock conditions
   */
  getAvailableTasks(_characterLevel: number): TaskType[] {
    // For MVP: Expedition and Raid are always available
    return this.taskStore.state.availableTasks;
  }

  /**
   * Get the current active task
   */
  getActiveTask(): ActiveTask | null {
    return this.taskStore.state.activeTask;
  }

  /**
   * Get the last completed task
   */
  getLastCompletedTask(): TaskCompletionResult | null {
    return this.taskStore.state.lastCompletedTask;
  }

  /**
   * Clear last completed task
   * Called after user acknowledges the task results
   */
  clearLastCompletedTask(): void {
    this.taskStore.clearLastCompletedTask();
  }

  /**
   * Get task history
   */
  getTaskHistory(): TaskCompletionResult[] {
    return this.taskStore.state.taskHistory;
  }

  /**
   * Get overall success rate
   */
  getSuccessRate(): number {
    return this.taskStore.getOverallSuccessRate();
  }

  /**
   * Get success rate for a specific task type
   */
  getTaskTypeSuccessRate(taskType: TaskType): number {
    return this.taskStore.getTaskTypeSuccessRate(taskType);
  }

  /**
   * Get success rate for a specific risk level
   */
  getRiskLevelSuccessRate(riskLevel: RiskLevel): number {
    return this.taskStore.getRiskLevelSuccessRate(riskLevel);
  }

  /**
   * Preview success chance for a task before starting
   * Useful for task selection UI
   */
  previewSuccessChance(
    taskConfig: TaskConfig,
    riskLevel: RiskLevel,
    context: TaskSelectionContext
  ) {
    return calculateSuccessChance(taskConfig, riskLevel, context);
  }
}

/**
 * Create a TaskManager instance
 */
export function createTaskManager(taskStore: TaskStore): TaskManager {
  return new TaskManager(taskStore);
}
