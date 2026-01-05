/**
 * Task System Exports
 * Central export point for the task system
 */

// Task Manager
export { TaskManager, createTaskManager } from './TaskManager';

// Task Resolver
export {
  calculateSuccessChance,
  resolveTaskOutcome,
  calculateRewards,
  shouldApplyInjury,
  determineInjurySeverity,
  generateTaskSummary,
} from './TaskResolver';

// Task Executor
export { TaskExecutor, createTaskExecutor } from './TaskExecutor';
export type { TaskExecutionState } from './TaskExecutor';

// Task Implementations
export { ExpeditionTask, createExpeditionTask } from './tasks/Expedition';
export { RaidTask, createRaidTask } from './tasks/Raid';
export { createTask, isTaskImplemented, getImplementedTaskTypes } from './tasks/TaskFactory';
export type { ITask, TaskEventTemplate, TaskMilestone } from './tasks/BaseTask';

// Re-export core types for convenience
export type {
  TaskType,
  RiskLevel,
  TaskOutcome,
  TaskConfig,
  TaskRewards,
  ActiveTask,
  TaskCompletionResult,
  TaskEvent,
  TaskState,
  TaskSelectionContext,
  SuccessCalculation,
  TaskStatistics,
} from '../../core/types/tasks';
