/**
 * Task State Management
 * Manages active tasks, task history, and task statistics
 */

import { createStore, produce } from 'solid-js/store';
import type {
  TaskState,
  TaskType,
  RiskLevel,
  ActiveTask,
  TaskCompletionResult,
  TaskStatistics,
} from '../types/tasks';

/**
 * Create initial task state
 */
export function createInitialTaskState(): TaskState {
  return {
    activeTask: null,
    lastCompletedTask: null,
    taskHistory: [],
    availableTasks: ['expedition', 'raid'], // MVP: Only Expedition and Raid
    statistics: {
      totalStarted: 0,
      totalSucceeded: 0,
      totalPartial: 0,
      totalFailed: 0,
      byType: {},
      byRisk: {},
    },
  };
}

/**
 * Task State Store
 * Provides reactive task state and management functions
 */
export function createTaskStore(initialState?: TaskState) {
  const [state, setState] = createStore<TaskState>(initialState ?? createInitialTaskState());

  /**
   * Set the active task
   */
  function setActiveTask(task: ActiveTask): void {
    setState('activeTask', task);
  }

  /**
   * Clear the active task
   */
  function clearActiveTask(): void {
    setState('activeTask', null);
  }

  /**
   * Update active task progress
   */
  function updateTaskProgress(progress: number): void {
    if (!state.activeTask) return;

    setState(
      produce((draft) => {
        if (draft.activeTask) {
          draft.activeTask.progress = Math.max(0, Math.min(100, progress));
        }
      })
    );
  }

  /**
   * Add an event to the active task
   */
  function addTaskEvent(event: ActiveTask['events'][0]): void {
    if (!state.activeTask) return;

    setState(
      produce((draft) => {
        if (draft.activeTask) {
          draft.activeTask.events.push(event);
        }
      })
    );
  }

  /**
   * Complete the active task
   */
  function completeActiveTask(result: TaskCompletionResult): void {
    if (!state.activeTask) return;

    setState(
      produce((draft) => {
        // Store as last completed task
        draft.lastCompletedTask = result;

        // Add to history (limit to 10 most recent)
        draft.taskHistory.unshift(result);
        if (draft.taskHistory.length > 10) {
          draft.taskHistory = draft.taskHistory.slice(0, 10);
        }

        // Update statistics
        updateStatisticsForCompletion(draft.statistics, result);

        // Clear active task
        draft.activeTask = null;
      })
    );
  }

  /**
   * Update task statistics for a completed task
   */
  function updateStatisticsForCompletion(
    stats: TaskStatistics,
    result: TaskCompletionResult
  ): void {
    const { taskType } = result.task;
    const { riskLevel } = result.task;
    const { outcome } = result;

    // Update total statistics
    stats.totalStarted += 1;
    if (outcome === 'success') stats.totalSucceeded += 1;
    else if (outcome === 'partial') stats.totalPartial += 1;
    else if (outcome === 'failure') stats.totalFailed += 1;

    // Update by-type statistics
    if (!stats.byType[taskType]) {
      stats.byType[taskType] = {
        started: 0,
        succeeded: 0,
        partial: 0,
        failed: 0,
      };
    }
    const typeStats = stats.byType[taskType];
    if (typeStats) {
      typeStats.started += 1;
      if (outcome === 'success') typeStats.succeeded += 1;
      else if (outcome === 'partial') typeStats.partial += 1;
      else if (outcome === 'failure') typeStats.failed += 1;
    }

    // Update by-risk statistics
    if (!stats.byRisk[riskLevel]) {
      stats.byRisk[riskLevel] = {
        started: 0,
        succeeded: 0,
        partial: 0,
        failed: 0,
      };
    }
    const riskStats = stats.byRisk[riskLevel];
    if (riskStats) {
      riskStats.started += 1;
      if (outcome === 'success') riskStats.succeeded += 1;
      else if (outcome === 'partial') riskStats.partial += 1;
      else if (outcome === 'failure') riskStats.failed += 1;
    }
  }

  /**
   * Update available tasks based on character level
   */
  function updateAvailableTasks(_characterLevel: number): void {
    // For MVP, expedition and raid are always available
    // Post-MVP: Filter based on character level and unlock conditions
    const available: TaskType[] = ['expedition', 'raid'];

    // Future: Add craft, hunt, rest based on level

    setState('availableTasks', available);
  }

  /**
   * Get task statistics for a specific task type
   */
  function getTaskTypeStatistics(taskType: TaskType) {
    return (
      state.statistics.byType[taskType] ?? {
        started: 0,
        succeeded: 0,
        partial: 0,
        failed: 0,
      }
    );
  }

  /**
   * Get task statistics for a specific risk level
   */
  function getRiskLevelStatistics(riskLevel: RiskLevel) {
    return (
      state.statistics.byRisk[riskLevel] ?? {
        started: 0,
        succeeded: 0,
        partial: 0,
        failed: 0,
      }
    );
  }

  /**
   * Get success rate for a task type (0-100)
   */
  function getTaskTypeSuccessRate(taskType: TaskType): number {
    const stats = getTaskTypeStatistics(taskType);
    if (stats.started === 0) return 0;

    return Math.round(((stats.succeeded + stats.partial * 0.5) / stats.started) * 100);
  }

  /**
   * Get success rate for a risk level (0-100)
   */
  function getRiskLevelSuccessRate(riskLevel: RiskLevel): number {
    const stats = getRiskLevelStatistics(riskLevel);
    if (stats.started === 0) return 0;

    return Math.round(((stats.succeeded + stats.partial * 0.5) / stats.started) * 100);
  }

  /**
   * Get overall success rate (0-100)
   */
  function getOverallSuccessRate(): number {
    const { totalStarted, totalSucceeded, totalPartial } = state.statistics;
    if (totalStarted === 0) return 0;

    return Math.round(((totalSucceeded + totalPartial * 0.5) / totalStarted) * 100);
  }

  /**
   * Clear last completed task (after user acknowledges it)
   */
  function clearLastCompletedTask(): void {
    setState('lastCompletedTask', null);
  }

  return {
    state,
    setState,
    setActiveTask,
    clearActiveTask,
    updateTaskProgress,
    addTaskEvent,
    completeActiveTask,
    updateAvailableTasks,
    getTaskTypeStatistics,
    getRiskLevelStatistics,
    getTaskTypeSuccessRate,
    getRiskLevelSuccessRate,
    getOverallSuccessRate,
    clearLastCompletedTask,
  };
}

/**
 * Task Store Type
 */
export type TaskStore = ReturnType<typeof createTaskStore>;
