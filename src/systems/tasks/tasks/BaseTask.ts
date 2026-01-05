/**
 * Base Task Implementation
 * Abstract base class for all task implementations
 */

import type { TaskType, TaskEvent, TaskConfig } from '../../../core/types/tasks';

/**
 * Task event template for generating random events
 */
export interface TaskEventTemplate {
  /** Unique template identifier */
  id: string;

  /** Event severity */
  severity: 'flavor' | 'info' | 'warning' | 'critical';

  /** Possible messages (one will be chosen randomly) */
  messages: string[];

  /** Event effects */
  effects: {
    successChanceModifier?: number;
    goldModifier?: number;
    healthModifier?: number;
    materialsModifier?: number;
  };

  /** Probability weight (higher = more likely) */
  weight: number;

  /** Minimum progress to trigger (0-100) */
  minProgress?: number;

  /** Maximum progress to trigger (0-100) */
  maxProgress?: number;
}

/**
 * Task milestone - special events at specific progress points
 */
export interface TaskMilestone {
  /** Progress percentage to trigger (0-100) */
  progress: number;

  /** Milestone description */
  description: string;

  /** Whether milestone has been triggered */
  triggered: boolean;
}

/**
 * Base Task Interface
 * All specific task implementations should implement this interface
 */
export interface ITask {
  /** Task type identifier */
  readonly taskType: TaskType;

  /** Task configuration */
  readonly config: TaskConfig;

  /** Event templates pool for this task */
  readonly eventTemplates: TaskEventTemplate[];

  /** Task milestones */
  readonly milestones: TaskMilestone[];

  /**
   * Generate a random event for the current progress
   * @param progress Current task progress (0-100)
   * @param lastEventTime Timestamp of last event
   * @returns TaskEvent or null if no event should be generated
   */
  generateEvent(progress: number, lastEventTime: number): TaskEvent | null;

  /**
   * Check and trigger milestones
   * @param progress Current task progress (0-100)
   * @returns TaskEvent array for triggered milestones
   */
  checkMilestones(progress: number): TaskEvent[];

  /**
   * Get task flavor text for current progress
   * @param progress Current task progress (0-100)
   * @returns Flavor text describing what's happening
   */
  getProgressFlavor(progress: number): string;

  /**
   * Get task start message
   */
  getStartMessage(): string;

  /**
   * Get task completion flavor based on outcome
   */
  getCompletionFlavor(outcome: 'success' | 'partial' | 'failure'): string;
}

/**
 * Abstract Base Task Class
 * Provides common functionality for all tasks
 */
export abstract class BaseTask implements ITask {
  abstract readonly taskType: TaskType;
  abstract readonly config: TaskConfig;
  abstract readonly eventTemplates: TaskEventTemplate[];
  abstract readonly milestones: TaskMilestone[];

  /**
   * Generate a random event
   */
  generateEvent(progress: number, lastEventTime: number): TaskEvent | null {
    const now = Date.now();
    const timeSinceLastEvent = now - lastEventTime;

    // Rate limit: minimum 2 minutes (120000ms) between events
    if (timeSinceLastEvent < 120000) {
      return null;
    }

    // Filter templates by progress range
    const eligibleTemplates = this.eventTemplates.filter((template) => {
      const minProgress = template.minProgress ?? 0;
      const maxProgress = template.maxProgress ?? 100;
      return progress >= minProgress && progress <= maxProgress;
    });

    if (eligibleTemplates.length === 0) {
      return null;
    }

    // Random chance to generate event (30% chance per check)
    if (Math.random() > 0.3) {
      return null;
    }

    // Select random template based on weights
    const template = this.selectWeightedRandom(eligibleTemplates);
    if (!template) {
      return null;
    }

    // Select random message
    const message = template.messages[Math.floor(Math.random() * template.messages.length)];

    return {
      id: `${template.id}_${now}`,
      timestamp: now,
      message,
      severity: template.severity,
      effects: template.effects,
    };
  }

  /**
   * Check and trigger milestones
   */
  checkMilestones(progress: number): TaskEvent[] {
    const triggeredEvents: TaskEvent[] = [];

    for (const milestone of this.milestones) {
      if (!milestone.triggered && progress >= milestone.progress) {
        milestone.triggered = true;

        triggeredEvents.push({
          id: `milestone_${milestone.progress}_${Date.now()}`,
          timestamp: Date.now(),
          message: milestone.description,
          severity: 'info',
          effects: {},
        });
      }
    }

    return triggeredEvents;
  }

  /**
   * Get progress-based flavor text
   */
  abstract getProgressFlavor(progress: number): string;

  /**
   * Get start message
   */
  abstract getStartMessage(): string;

  /**
   * Get completion flavor
   */
  abstract getCompletionFlavor(outcome: 'success' | 'partial' | 'failure'): string;

  /**
   * Helper: Select random item from array based on weights
   */
  protected selectWeightedRandom<T extends { weight: number }>(items: T[]): T | null {
    if (items.length === 0) return null;

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return item;
      }
    }

    return items[items.length - 1];
  }

  /**
   * Helper: Reset milestone triggers (for new task instances)
   */
  protected resetMilestones(): void {
    for (const milestone of this.milestones) {
      milestone.triggered = false;
    }
  }
}
