/**
 * Task-Specific Event Collections
 * Pre-filtered event collections optimized for each task type
 */

import { EventTemplate } from '@/core/types/events';
import { TaskType } from '@/core/types/tasks';
import { EVENT_TEMPLATES } from './eventBank';

/**
 * Event collection for a specific task type
 */
export interface TaskEventCollection {
  taskType: TaskType;
  templates: EventTemplate[];
  statistics: {
    total: number;
    bySeverity: {
      flavor: number;
      info: number;
      warning: number;
      critical: number;
    };
  };
}

/**
 * Get all events applicable to a specific task type
 */
export function getEventsForTask(taskType: TaskType): TaskEventCollection {
  // Filter templates that apply to this task
  const templates = EVENT_TEMPLATES.filter((template) => {
    // Empty applicableTasks array means applies to all tasks
    if (template.applicableTasks.length === 0) {
      return true;
    }
    // Check if task is in the applicable list
    return template.applicableTasks.includes(taskType);
  });

  // Calculate statistics
  const statistics = {
    total: templates.length,
    bySeverity: {
      flavor: templates.filter((t) => t.severity === 'flavor').length,
      info: templates.filter((t) => t.severity === 'info').length,
      warning: templates.filter((t) => t.severity === 'warning').length,
      critical: templates.filter((t) => t.severity === 'critical').length,
    },
  };

  return {
    taskType,
    templates,
    statistics,
  };
}

/**
 * Pre-computed collections for each task type
 * Computed at module load time for performance
 */
export const RAID_EVENTS = getEventsForTask('raid');
export const EXPEDITION_EVENTS = getEventsForTask('expedition');
export const CRAFT_EVENTS = getEventsForTask('craft');
export const HUNT_EVENTS = getEventsForTask('hunt');
export const REST_EVENTS = getEventsForTask('rest');

/**
 * Map of task types to their event collections
 */
export const TASK_EVENT_COLLECTIONS: Record<TaskType, TaskEventCollection> = {
  raid: RAID_EVENTS,
  expedition: EXPEDITION_EVENTS,
  craft: CRAFT_EVENTS,
  hunt: HUNT_EVENTS,
  rest: REST_EVENTS,
};

/**
 * Get collection for a task type
 */
export function getTaskEventCollection(taskType: TaskType): TaskEventCollection {
  return TASK_EVENT_COLLECTIONS[taskType];
}

/**
 * Get high-impact events for a task (warning + critical only)
 */
export function getHighImpactEvents(taskType: TaskType): EventTemplate[] {
  const collection = getTaskEventCollection(taskType);
  return collection.templates.filter((t) => t.severity === 'warning' || t.severity === 'critical');
}

/**
 * Get flavor events for a task (atmospheric only)
 */
export function getFlavorEvents(taskType: TaskType): EventTemplate[] {
  const collection = getTaskEventCollection(taskType);
  return collection.templates.filter((t) => t.severity === 'flavor');
}

/**
 * Get events by category for a task
 */
export function getEventsByCategory(
  taskType: TaskType,
  category: EventTemplate['category']
): EventTemplate[] {
  const collection = getTaskEventCollection(taskType);
  return collection.templates.filter((t) => t.category === category);
}

/**
 * Get repeatable vs non-repeatable events
 */
export function getRepeatableEvents(taskType: TaskType): {
  repeatable: EventTemplate[];
  nonRepeatable: EventTemplate[];
} {
  const collection = getTaskEventCollection(taskType);

  return {
    repeatable: collection.templates.filter((t) => t.repeatable),
    nonRepeatable: collection.templates.filter((t) => !t.repeatable),
  };
}

/**
 * Event collection statistics summary
 */
export function getEventCollectionsSummary() {
  const summary: Record<
    TaskType,
    {
      total: number;
      flavor: number;
      info: number;
      warning: number;
      critical: number;
      repeatable: number;
      nonRepeatable: number;
    }
  > = {} as Record<
    TaskType,
    {
      total: number;
      flavor: number;
      info: number;
      warning: number;
      critical: number;
      repeatable: number;
      nonRepeatable: number;
    }
  >;

  for (const taskType of Object.keys(TASK_EVENT_COLLECTIONS) as TaskType[]) {
    const collection = TASK_EVENT_COLLECTIONS[taskType];
    const { repeatable, nonRepeatable } = getRepeatableEvents(taskType);

    summary[taskType] = {
      total: collection.statistics.total,
      ...collection.statistics.bySeverity,
      repeatable: repeatable.length,
      nonRepeatable: nonRepeatable.length,
    };
  }

  return summary;
}

/**
 * Validate event collections (for development/testing)
 */
export function validateEventCollections(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const taskType of Object.keys(TASK_EVENT_COLLECTIONS) as TaskType[]) {
    const collection = TASK_EVENT_COLLECTIONS[taskType];

    // Check if task has minimum number of events
    if (collection.statistics.total < 10) {
      warnings.push(
        `Task "${taskType}" has only ${collection.statistics.total} events (recommended: 10+)`
      );
    }

    // Check if task has at least one event of each severity
    if (collection.statistics.bySeverity.flavor === 0) {
      warnings.push(`Task "${taskType}" has no flavor events`);
    }
    if (collection.statistics.bySeverity.info === 0) {
      warnings.push(`Task "${taskType}" has no info events`);
    }
    if (collection.statistics.bySeverity.warning === 0) {
      warnings.push(`Task "${taskType}" has no warning events`);
    }
    if (collection.statistics.bySeverity.critical === 0) {
      warnings.push(`Task "${taskType}" has no critical events`);
    }

    // Check for duplicate template IDs within task
    const ids = new Set<string>();
    for (const template of collection.templates) {
      if (ids.has(template.templateId)) {
        errors.push(`Duplicate template ID "${template.templateId}" in task "${taskType}"`);
      }
      ids.add(template.templateId);
    }

    // Validate template data
    for (const template of collection.templates) {
      // Check if template has messages
      if (template.messages.length === 0) {
        errors.push(`Template "${template.templateId}" has no messages`);
      }

      // Check if template has at least one effect (except flavor)
      if (template.severity !== 'flavor') {
        const hasEffects = Object.keys(template.effects).length > 0;
        if (!hasEffects) {
          warnings.push(`Non-flavor template "${template.templateId}" has no effects`);
        }
      }

      // Check weight
      if (template.weight <= 0) {
        errors.push(`Template "${template.templateId}" has invalid weight: ${template.weight}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Print event collections summary (for debugging)
 */
export function printEventCollectionsSummary(): void {
  /* eslint-disable no-console */
  console.log('=== Event Collections Summary ===');
  const summary = getEventCollectionsSummary();

  for (const [taskType, stats] of Object.entries(summary)) {
    console.log(`\n${taskType.toUpperCase()}:`);
    console.log(`  Total: ${stats.total}`);
    console.log(
      `  Flavor: ${stats.flavor} | Info: ${stats.info} | Warning: ${stats.warning} | Critical: ${stats.critical}`
    );
    console.log(`  Repeatable: ${stats.repeatable} | Non-repeatable: ${stats.nonRepeatable}`);
  }

  console.log('\n=== Validation ===');
  const validation = validateEventCollections();
  console.log(`Valid: ${validation.valid}`);

  if (validation.errors.length > 0) {
    console.log('\nErrors:');
    validation.errors.forEach((err) => console.log(`  - ${err}`));
  }

  if (validation.warnings.length > 0) {
    console.log('\nWarnings:');
    validation.warnings.forEach((warn) => console.log(`  - ${warn}`));
  }
  /* eslint-enable no-console */
}
