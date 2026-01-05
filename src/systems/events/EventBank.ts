/**
 * EventBank - Manages the pool of possible events
 * Organizes event templates and provides efficient querying
 */

import { TaskType } from '@/core/types/tasks';
import {
  EventTemplate,
  EventConditionContext,
  EventSeverity,
  EventCategory,
} from '@/core/types/events';
import { EventBank as EventBankType, EventSelectionCriteria, WeightedEventTemplate } from './types';

/**
 * EventBank class - manages event templates and selection
 */
export class EventBank {
  private bank: EventBankType;

  constructor(templates: EventTemplate[]) {
    this.bank = this.organizeTemplates(templates);
  }

  /**
   * Organize templates into indexed structure for efficient querying
   */
  private organizeTemplates(templates: EventTemplate[]): EventBankType {
    const bank: EventBankType = {
      templates,
      bySeverity: {
        flavor: [],
        info: [],
        warning: [],
        critical: [],
      },
      byCategory: {
        combat: [],
        loot: [],
        hazard: [],
        npc: [],
        fortune: [],
        equipment: [],
        health: [],
        economy: [],
        mystery: [],
      },
      byTaskType: {},
    };

    // Organize templates
    for (const template of templates) {
      // By severity
      bank.bySeverity[template.severity].push(template);

      // By category
      bank.byCategory[template.category].push(template);

      // By task type
      if (template.applicableTasks.length === 0) {
        // Empty array means applicable to all tasks
        const allTasks: TaskType[] = ['expedition', 'raid', 'craft', 'hunt', 'rest'];
        for (const taskType of allTasks) {
          if (!bank.byTaskType[taskType]) {
            bank.byTaskType[taskType] = [];
          }
          bank.byTaskType[taskType].push(template);
        }
      } else {
        // Only add to specified task types
        for (const taskType of template.applicableTasks) {
          if (!bank.byTaskType[taskType]) {
            bank.byTaskType[taskType] = [];
          }
          bank.byTaskType[taskType].push(template);
        }
      }
    }

    return bank;
  }

  /**
   * Get all templates
   */
  public getAllTemplates(): EventTemplate[] {
    return this.bank.templates;
  }

  /**
   * Get templates by severity
   */
  public getBySeverity(severity: EventSeverity): EventTemplate[] {
    return this.bank.bySeverity[severity];
  }

  /**
   * Get templates by category
   */
  public getByCategory(category: EventCategory): EventTemplate[] {
    return this.bank.byCategory[category];
  }

  /**
   * Get templates applicable to a task type
   */
  public getByTaskType(taskType: TaskType): EventTemplate[] {
    return this.bank.byTaskType[taskType] || [];
  }

  /**
   * Get template by ID
   */
  public getTemplateById(templateId: string): EventTemplate | undefined {
    return this.bank.templates.find((t) => t.templateId === templateId);
  }

  /**
   * Get eligible templates based on selection criteria
   */
  public getEligibleTemplates(criteria: EventSelectionCriteria): EventTemplate[] {
    // Start with task-appropriate templates
    let eligible = this.getByTaskType(criteria.taskType);

    // Filter by conditions
    eligible = eligible.filter((template) => {
      // Exclude templates in the exclude list
      if (criteria.excludeTemplateIds.has(template.templateId)) {
        return false;
      }

      // Check template conditions
      if (template.conditions) {
        return this.evaluateConditions(template.conditions, criteria.conditionContext);
      }

      return true;
    });

    // If preferred severity is specified, filter by it
    if (criteria.preferredSeverity) {
      const preferredSeverityTemplates = eligible.filter(
        (t) => t.severity === criteria.preferredSeverity
      );
      // If we have templates of preferred severity, use those; otherwise use all eligible
      if (preferredSeverityTemplates.length > 0) {
        eligible = preferredSeverityTemplates;
      }
    }

    return eligible;
  }

  /**
   * Evaluate event conditions
   */
  private evaluateConditions(
    conditions: EventTemplate['conditions'],
    context: EventConditionContext
  ): boolean {
    if (!conditions) return true;

    // Level checks
    if (conditions.minLevel !== undefined && context.characterLevel < conditions.minLevel) {
      return false;
    }
    if (conditions.maxLevel !== undefined && context.characterLevel > conditions.maxLevel) {
      return false;
    }

    // Health percentage checks
    const healthPercent = (context.currentHealth / context.maxHealth) * 100;
    if (conditions.minHealthPercent !== undefined && healthPercent < conditions.minHealthPercent) {
      return false;
    }
    if (conditions.maxHealthPercent !== undefined && healthPercent > conditions.maxHealthPercent) {
      return false;
    }

    // Injury checks
    if (conditions.requiresInjury && !context.isInjured) {
      return false;
    }
    if (conditions.requiresNotInjured && context.isInjured) {
      return false;
    }

    // Gold check
    if (conditions.minGold !== undefined && context.gold < conditions.minGold) {
      return false;
    }

    // Equipment checks
    if (conditions.requiresWeapon && !context.hasWeapon) {
      return false;
    }
    if (conditions.requiresArmor && !context.hasArmor) {
      return false;
    }

    // Custom condition
    if (conditions.customCondition && !conditions.customCondition(context)) {
      return false;
    }

    return true;
  }

  /**
   * Select a random template from eligible templates using weighted selection
   */
  public selectRandomTemplate(criteria: EventSelectionCriteria): EventTemplate | null {
    const eligible = this.getEligibleTemplates(criteria);

    if (eligible.length === 0) {
      return null;
    }

    // Create weighted array
    const weighted: WeightedEventTemplate[] = eligible.map((template) => ({
      template,
      weight: template.weight,
    }));

    // Calculate total weight
    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);

    if (totalWeight === 0) {
      // If all weights are 0, select uniformly
      const randomIndex = Math.floor(Math.random() * eligible.length);
      return eligible[randomIndex];
    }

    // Weighted random selection
    let random = Math.random() * totalWeight;
    for (const item of weighted) {
      random -= item.weight;
      if (random <= 0) {
        return item.template;
      }
    }

    // Fallback (should not reach here)
    return eligible[eligible.length - 1];
  }

  /**
   * Get statistics about the event bank
   */
  public getStatistics() {
    return {
      totalTemplates: this.bank.templates.length,
      bySeverity: {
        flavor: this.bank.bySeverity.flavor.length,
        info: this.bank.bySeverity.info.length,
        warning: this.bank.bySeverity.warning.length,
        critical: this.bank.bySeverity.critical.length,
      },
      byCategory: {
        combat: this.bank.byCategory.combat.length,
        loot: this.bank.byCategory.loot.length,
        hazard: this.bank.byCategory.hazard.length,
        npc: this.bank.byCategory.npc.length,
        fortune: this.bank.byCategory.fortune.length,
        equipment: this.bank.byCategory.equipment.length,
        health: this.bank.byCategory.health.length,
        economy: this.bank.byCategory.economy.length,
        mystery: this.bank.byCategory.mystery.length,
      },
      repeatable: this.bank.templates.filter((t) => t.repeatable).length,
      nonRepeatable: this.bank.templates.filter((t) => !t.repeatable).length,
    };
  }
}
