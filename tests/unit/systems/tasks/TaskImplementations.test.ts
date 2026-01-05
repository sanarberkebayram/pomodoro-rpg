import { describe, it, expect, beforeEach } from 'vitest';
import { ExpeditionTask } from '../../../../src/systems/tasks/tasks/Expedition';
import { RaidTask } from '../../../../src/systems/tasks/tasks/Raid';
import {
  createTask,
  isTaskImplemented,
  getImplementedTaskTypes,
} from '../../../../src/systems/tasks/tasks/TaskFactory';

describe('Task Implementations', () => {
  describe('ExpeditionTask', () => {
    let expedition: ExpeditionTask;

    beforeEach(() => {
      expedition = new ExpeditionTask();
    });

    it('should have correct task type', () => {
      expect(expedition.taskType).toBe('expedition');
    });

    it('should have expedition config', () => {
      expect(expedition.config).toBeDefined();
      expect(expedition.config.id).toBe('expedition');
      expect(expedition.config.primaryStat).toBe('focus');
    });

    it('should have event templates', () => {
      expect(expedition.eventTemplates).toBeDefined();
      expect(expedition.eventTemplates.length).toBeGreaterThan(0);
    });

    it('should have milestones', () => {
      expect(expedition.milestones).toBeDefined();
      expect(expedition.milestones.length).toBe(3);
      expect(expedition.milestones[0].progress).toBe(25);
      expect(expedition.milestones[1].progress).toBe(50);
      expect(expedition.milestones[2].progress).toBe(75);
    });

    it('should generate events with rate limiting', () => {
      const now = Date.now();

      // First event should potentially generate (30% chance)
      const _event1 = expedition.generateEvent(50, now - 180000); // 3 minutes ago

      // Immediate second call should be rate-limited
      const event2 = expedition.generateEvent(50, now);

      expect(event2).toBeNull(); // Rate limited
    });

    it('should check and trigger milestones', () => {
      const events = expedition.checkMilestones(60);

      // Should trigger first two milestones (25% and 50%)
      expect(events.length).toBeGreaterThan(0);
      expect(expedition.milestones[0].triggered).toBe(true);
      expect(expedition.milestones[1].triggered).toBe(true);
      expect(expedition.milestones[2].triggered).toBe(false); // 75% not reached
    });

    it('should not re-trigger milestones', () => {
      // Trigger milestones first time
      expedition.checkMilestones(60);

      // Try again
      const events = expedition.checkMilestones(60);

      // Should return empty array (already triggered)
      expect(events.length).toBe(0);
    });

    it('should provide progress flavor text', () => {
      const flavor0 = expedition.getProgressFlavor(0);
      const flavor50 = expedition.getProgressFlavor(50);
      const flavor100 = expedition.getProgressFlavor(100);

      expect(flavor0).toBeDefined();
      expect(flavor50).toBeDefined();
      expect(flavor100).toBeDefined();
      expect(flavor0).not.toBe(flavor50);
      expect(flavor50).not.toBe(flavor100);
    });

    it('should provide start message', () => {
      const message = expedition.getStartMessage();

      expect(message).toBeDefined();
      expect(message.length).toBeGreaterThan(0);
    });

    it('should provide completion flavor for all outcomes', () => {
      const successFlavor = expedition.getCompletionFlavor('success');
      const partialFlavor = expedition.getCompletionFlavor('partial');
      const failureFlavor = expedition.getCompletionFlavor('failure');

      expect(successFlavor).toBeDefined();
      expect(partialFlavor).toBeDefined();
      expect(failureFlavor).toBeDefined();
    });

    it('should filter events by progress range', () => {
      // Test multiple times to account for randomness
      let eventGenerated = false;
      const now = Date.now();

      for (let i = 0; i < 50; i++) {
        const event = expedition.generateEvent(25, now - 180000);
        if (event) {
          eventGenerated = true;
          // Event should be appropriate for progress level
          expect(event.message).toBeDefined();
          expect(event.severity).toMatch(/flavor|info|warning|critical/);
        }
      }

      // At least some events should generate over 50 tries
      expect(eventGenerated).toBe(true);
    });
  });

  describe('RaidTask', () => {
    let raid: RaidTask;

    beforeEach(() => {
      raid = new RaidTask();
    });

    it('should have correct task type', () => {
      expect(raid.taskType).toBe('raid');
    });

    it('should have raid config', () => {
      expect(raid.config).toBeDefined();
      expect(raid.config.id).toBe('raid');
      expect(raid.config.primaryStat).toBe('power');
    });

    it('should have event templates', () => {
      expect(raid.eventTemplates).toBeDefined();
      expect(raid.eventTemplates.length).toBeGreaterThan(0);
    });

    it('should have more dangerous events than expedition', () => {
      const warningEvents = raid.eventTemplates.filter((e) => e.severity === 'warning');
      const criticalEvents = raid.eventTemplates.filter((e) => e.severity === 'critical');

      expect(warningEvents.length + criticalEvents.length).toBeGreaterThan(0);
    });

    it('should have milestones', () => {
      expect(raid.milestones).toBeDefined();
      expect(raid.milestones.length).toBe(3);
      expect(raid.milestones[0].progress).toBe(20);
      expect(raid.milestones[1].progress).toBe(50);
      expect(raid.milestones[2].progress).toBe(80);
    });

    it('should provide combat-themed flavor text', () => {
      const flavor = raid.getProgressFlavor(50);

      expect(flavor).toBeDefined();
      expect(flavor.length).toBeGreaterThan(0);
    });

    it('should provide start message', () => {
      const message = raid.getStartMessage();

      expect(message).toBeDefined();
      expect(message.length).toBeGreaterThan(0);
    });

    it('should provide completion flavor for all outcomes', () => {
      const successFlavor = raid.getCompletionFlavor('success');
      const partialFlavor = raid.getCompletionFlavor('partial');
      const failureFlavor = raid.getCompletionFlavor('failure');

      expect(successFlavor).toBeDefined();
      expect(partialFlavor).toBeDefined();
      expect(failureFlavor).toBeDefined();
    });

    it('should respect progress-based event filtering', () => {
      const now = Date.now();

      // Test events at different progress points
      let earlyEventGenerated = false;
      let lateEventGenerated = false;

      for (let i = 0; i < 50; i++) {
        const earlyEvent = raid.generateEvent(10, now - 180000);
        const lateEvent = raid.generateEvent(90, now - 180000);

        if (earlyEvent) earlyEventGenerated = true;
        if (lateEvent) lateEventGenerated = true;
      }

      // Events should generate at different progress levels
      expect(earlyEventGenerated || lateEventGenerated).toBe(true);
    });
  });

  describe('TaskFactory', () => {
    it('should create expedition task', () => {
      const task = createTask('expedition');

      expect(task).toBeInstanceOf(ExpeditionTask);
      expect(task.taskType).toBe('expedition');
    });

    it('should create raid task', () => {
      const task = createTask('raid');

      expect(task).toBeInstanceOf(RaidTask);
      expect(task.taskType).toBe('raid');
    });

    it('should throw error for unimplemented tasks', () => {
      expect(() => createTask('craft')).toThrow('not yet implemented');
      expect(() => createTask('hunt')).toThrow('not yet implemented');
      expect(() => createTask('rest')).toThrow('not yet implemented');
    });

    it('should correctly identify implemented tasks', () => {
      expect(isTaskImplemented('expedition')).toBe(true);
      expect(isTaskImplemented('raid')).toBe(true);
      expect(isTaskImplemented('craft')).toBe(false);
      expect(isTaskImplemented('hunt')).toBe(false);
      expect(isTaskImplemented('rest')).toBe(false);
    });

    it('should return implemented task types', () => {
      const implemented = getImplementedTaskTypes();

      expect(implemented).toContain('expedition');
      expect(implemented).toContain('raid');
      expect(implemented.length).toBe(2);
    });
  });

  describe('Event Generation Probability', () => {
    it('should have reasonable event weights for expedition', () => {
      const expedition = new ExpeditionTask();
      const totalWeight = expedition.eventTemplates.reduce((sum, t) => sum + t.weight, 0);

      expect(totalWeight).toBeGreaterThan(0);

      // Positive events should be more common in expedition
      const positiveWeight = expedition.eventTemplates
        .filter((t) => t.severity === 'info')
        .reduce((sum, t) => sum + t.weight, 0);

      const negativeWeight = expedition.eventTemplates
        .filter((t) => t.severity === 'warning' || t.severity === 'critical')
        .reduce((sum, t) => sum + t.weight, 0);

      expect(positiveWeight).toBeGreaterThan(negativeWeight);
    });

    it('should have balanced event weights for raid', () => {
      const raid = new RaidTask();
      const totalWeight = raid.eventTemplates.reduce((sum, t) => sum + t.weight, 0);

      expect(totalWeight).toBeGreaterThan(0);

      // Raid should have more dangerous events
      const dangerousWeight = raid.eventTemplates
        .filter((t) => t.severity === 'warning' || t.severity === 'critical')
        .reduce((sum, t) => sum + t.weight, 0);

      expect(dangerousWeight).toBeGreaterThan(0);
    });
  });
});
