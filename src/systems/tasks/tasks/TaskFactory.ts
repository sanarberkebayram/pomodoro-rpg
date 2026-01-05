/**
 * Task Factory
 * Creates appropriate task implementation instances based on task type
 */

import type { TaskType } from '../../../core/types/tasks';
import type { ITask } from './BaseTask';
import { ExpeditionTask } from './Expedition';
import { RaidTask } from './Raid';

/**
 * Create a task implementation instance
 * @param taskType Type of task to create
 * @returns Task implementation instance
 * @throws Error if task type is not available
 */
export function createTask(taskType: TaskType): ITask {
  switch (taskType) {
    case 'expedition':
      return new ExpeditionTask();

    case 'raid':
      return new RaidTask();

    case 'craft':
    case 'hunt':
    case 'rest':
      throw new Error(`Task type "${taskType}" is not yet implemented (Post-MVP)`);

    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
}

/**
 * Check if a task type is implemented
 */
export function isTaskImplemented(taskType: TaskType): boolean {
  return taskType === 'expedition' || taskType === 'raid';
}

/**
 * Get all implemented task types
 */
export function getImplementedTaskTypes(): TaskType[] {
  return ['expedition', 'raid'];
}
