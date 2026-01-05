/**
 * EventBank Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventBank } from '@/systems/events/EventBank';
import { EventTemplate } from '@/core/types/events';

describe('EventBank', () => {
  let testTemplates: EventTemplate[];
  let eventBank: EventBank;

  beforeEach(() => {
    testTemplates = [
      {
        templateId: 'test_flavor_1',
        severity: 'flavor',
        category: 'fortune',
        messages: ['A test flavor event'],
        effects: {},
        weight: 10,
        applicableTasks: [],
        repeatable: true,
      },
      {
        templateId: 'test_info_gold',
        severity: 'info',
        category: 'loot',
        messages: ['You find {gold} gold'],
        effects: {
          goldModifier: { min: 5, max: 15 },
        },
        weight: 15,
        applicableTasks: ['expedition'],
        repeatable: true,
      },
      {
        templateId: 'test_warning_trap',
        severity: 'warning',
        category: 'hazard',
        messages: ['You trigger a trap! -{damage} HP'],
        effects: {
          healthModifier: { min: -25, max: -15 },
        },
        weight: 8,
        applicableTasks: ['raid'],
        repeatable: true,
        conditions: {
          minHealthPercent: 30,
        },
      },
      {
        templateId: 'test_critical_boss',
        severity: 'critical',
        category: 'combat',
        messages: ['Boss appears!'],
        effects: {
          healthModifier: { min: -50, max: -30 },
        },
        weight: 5,
        applicableTasks: ['raid'],
        repeatable: false,
      },
      {
        templateId: 'test_all_tasks',
        severity: 'info',
        category: 'fortune',
        messages: ['Lucky moment'],
        effects: {
          successChanceModifier: { min: 2, max: 5 },
        },
        weight: 10,
        applicableTasks: [],
        repeatable: true,
      },
    ];

    eventBank = new EventBank(testTemplates);
  });

  describe('initialization', () => {
    it('should store all templates', () => {
      const templates = eventBank.getAllTemplates();
      expect(templates).toHaveLength(5);
    });

    it('should organize templates by severity', () => {
      expect(eventBank.getBySeverity('flavor')).toHaveLength(1);
      expect(eventBank.getBySeverity('info')).toHaveLength(2);
      expect(eventBank.getBySeverity('warning')).toHaveLength(1);
      expect(eventBank.getBySeverity('critical')).toHaveLength(1);
    });

    it('should organize templates by category', () => {
      expect(eventBank.getByCategory('fortune')).toHaveLength(2);
      expect(eventBank.getByCategory('loot')).toHaveLength(1);
      expect(eventBank.getByCategory('hazard')).toHaveLength(1);
      expect(eventBank.getByCategory('combat')).toHaveLength(1);
    });

    it('should organize templates by task type', () => {
      expect(eventBank.getByTaskType('expedition')).toHaveLength(3); // test_info_gold + test_all_tasks + test_flavor_1
      expect(eventBank.getByTaskType('raid')).toHaveLength(4); // test_warning_trap + test_critical_boss + test_all_tasks + test_flavor_1
    });

    it('should handle empty applicableTasks as "all tasks"', () => {
      const expeditionTemplates = eventBank.getByTaskType('expedition');
      const allTasksTemplate = expeditionTemplates.find(
        (t) => t.templateId === 'test_all_tasks'
      );
      expect(allTasksTemplate).toBeDefined();
    });
  });

  describe('getTemplateById', () => {
    it('should retrieve template by ID', () => {
      const template = eventBank.getTemplateById('test_info_gold');
      expect(template).toBeDefined();
      expect(template?.templateId).toBe('test_info_gold');
    });

    it('should return undefined for non-existent ID', () => {
      const template = eventBank.getTemplateById('non_existent');
      expect(template).toBeUndefined();
    });
  });

  describe('getEligibleTemplates', () => {
    it('should filter by task type', () => {
      const eligible = eventBank.getEligibleTemplates({
        taskType: 'raid',
        conditionContext: {
          characterLevel: 5,
          currentHealth: 100,
          maxHealth: 100,
          isInjured: false,
          gold: 50,
          hasWeapon: true,
          hasArmor: true,
          taskType: 'raid',
          taskProgress: 50,
          eventCount: 0,
        },
        excludeTemplateIds: new Set(),
      });

      expect(eligible.length).toBeGreaterThan(0);
      eligible.forEach((template) => {
        const isApplicable =
          template.applicableTasks.length === 0 ||
          template.applicableTasks.includes('raid');
        expect(isApplicable).toBe(true);
      });
    });

    it('should exclude non-repeatable templates that already fired', () => {
      const excludeSet = new Set(['test_critical_boss']);
      const eligible = eventBank.getEligibleTemplates({
        taskType: 'raid',
        conditionContext: {
          characterLevel: 5,
          currentHealth: 100,
          maxHealth: 100,
          isInjured: false,
          gold: 50,
          hasWeapon: true,
          hasArmor: true,
          taskType: 'raid',
          taskProgress: 50,
          eventCount: 0,
        },
        excludeTemplateIds: excludeSet,
      });

      const hasCriticalBoss = eligible.some((t) => t.templateId === 'test_critical_boss');
      expect(hasCriticalBoss).toBe(false);
    });

    it('should filter by health condition', () => {
      // Low health (20%)
      const eligibleLowHealth = eventBank.getEligibleTemplates({
        taskType: 'raid',
        conditionContext: {
          characterLevel: 5,
          currentHealth: 20,
          maxHealth: 100,
          isInjured: false,
          gold: 50,
          hasWeapon: true,
          hasArmor: true,
          taskType: 'raid',
          taskProgress: 50,
          eventCount: 0,
        },
        excludeTemplateIds: new Set(),
      });

      // Should not include test_warning_trap (requires minHealthPercent: 30)
      const hasTrap = eligibleLowHealth.some((t) => t.templateId === 'test_warning_trap');
      expect(hasTrap).toBe(false);

      // High health (80%)
      const eligibleHighHealth = eventBank.getEligibleTemplates({
        taskType: 'raid',
        conditionContext: {
          characterLevel: 5,
          currentHealth: 80,
          maxHealth: 100,
          isInjured: false,
          gold: 50,
          hasWeapon: true,
          hasArmor: true,
          taskType: 'raid',
          taskProgress: 50,
          eventCount: 0,
        },
        excludeTemplateIds: new Set(),
      });

      // Should include test_warning_trap
      const hasTrapHighHealth = eligibleHighHealth.some(
        (t) => t.templateId === 'test_warning_trap'
      );
      expect(hasTrapHighHealth).toBe(true);
    });

    it('should filter by preferred severity', () => {
      const eligible = eventBank.getEligibleTemplates({
        taskType: 'raid',
        preferredSeverity: 'critical',
        conditionContext: {
          characterLevel: 5,
          currentHealth: 100,
          maxHealth: 100,
          isInjured: false,
          gold: 50,
          hasWeapon: true,
          hasArmor: true,
          taskType: 'raid',
          taskProgress: 50,
          eventCount: 0,
        },
        excludeTemplateIds: new Set(),
      });

      eligible.forEach((template) => {
        expect(template.severity).toBe('critical');
      });
    });

    it('should fallback to all eligible if no preferred severity matches', () => {
      const eligible = eventBank.getEligibleTemplates({
        taskType: 'expedition',
        preferredSeverity: 'critical', // No critical events for expedition in test data
        conditionContext: {
          characterLevel: 5,
          currentHealth: 100,
          maxHealth: 100,
          isInjured: false,
          gold: 50,
          hasWeapon: true,
          hasArmor: true,
          taskType: 'expedition',
          taskProgress: 50,
          eventCount: 0,
        },
        excludeTemplateIds: new Set(),
      });

      expect(eligible.length).toBeGreaterThan(0);
    });
  });

  describe('selectRandomTemplate', () => {
    it('should select a template from eligible pool', () => {
      const template = eventBank.selectRandomTemplate({
        taskType: 'raid',
        conditionContext: {
          characterLevel: 5,
          currentHealth: 100,
          maxHealth: 100,
          isInjured: false,
          gold: 50,
          hasWeapon: true,
          hasArmor: true,
          taskType: 'raid',
          taskProgress: 50,
          eventCount: 0,
        },
        excludeTemplateIds: new Set(),
      });

      expect(template).toBeDefined();
      expect(template?.applicableTasks.length === 0 || template?.applicableTasks.includes('raid')).toBe(true);
    });

    it('should return null if no eligible templates', () => {
      // Create criteria that exclude all templates (both repeatable and non-repeatable)
      const excludeAll = new Set(testTemplates.map((t) => t.templateId));

      const template = eventBank.selectRandomTemplate({
        taskType: 'craft',
        conditionContext: {
          characterLevel: 1,
          currentHealth: 10,
          maxHealth: 100,
          isInjured: true,
          gold: 0,
          hasWeapon: false,
          hasArmor: false,
          taskType: 'craft',
          taskProgress: 0,
          eventCount: 10,
        },
        excludeTemplateIds: excludeAll,
      });

      expect(template).toBeNull();
    });

    it('should respect weight distribution (statistical test)', () => {
      // Run many selections and check distribution
      const selections: Record<string, number> = {};
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const template = eventBank.selectRandomTemplate({
          taskType: 'raid',
          conditionContext: {
            characterLevel: 5,
            currentHealth: 100,
            maxHealth: 100,
            isInjured: false,
            gold: 50,
            hasWeapon: true,
            hasArmor: true,
            taskType: 'raid',
            taskProgress: 50,
            eventCount: 0,
          },
          excludeTemplateIds: new Set(),
        });

        if (template) {
          selections[template.templateId] = (selections[template.templateId] || 0) + 1;
        }
      }

      // Higher weight templates should appear more often
      // test_all_tasks (weight 10) should appear more than test_critical_boss (weight 5)
      if (selections['test_all_tasks'] && selections['test_critical_boss']) {
        expect(selections['test_all_tasks']).toBeGreaterThan(selections['test_critical_boss']);
      }
    });
  });

  describe('getStatistics', () => {
    it('should return accurate statistics', () => {
      const stats = eventBank.getStatistics();

      expect(stats.totalTemplates).toBe(5);
      expect(stats.bySeverity.flavor).toBe(1);
      expect(stats.bySeverity.info).toBe(2);
      expect(stats.bySeverity.warning).toBe(1);
      expect(stats.bySeverity.critical).toBe(1);
      expect(stats.repeatable).toBe(4);
      expect(stats.nonRepeatable).toBe(1);
    });
  });
});
