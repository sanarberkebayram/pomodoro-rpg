import { describe, it, expect, beforeEach } from 'vitest';
import { TaskExecutor } from '../../../../src/systems/tasks/TaskExecutor';
import { ExpeditionTask } from '../../../../src/systems/tasks/tasks/Expedition';
import { EXPEDITION_CONFIG } from '../../../../src/data/tasks/taskConfigs';
import type { ActiveTask } from '../../../../src/core/types/tasks';

describe('TaskExecutor', () => {
  let executor: TaskExecutor;
  let expedition: ExpeditionTask;
  let activeTask: ActiveTask;

  beforeEach(() => {
    executor = new TaskExecutor();
    expedition = new ExpeditionTask();

    activeTask = {
      taskType: 'expedition',
      riskLevel: 'standard',
      config: EXPEDITION_CONFIG,
      startedAt: Date.now(),
      calculatedSuccessChance: 70,
      progress: 0,
      events: [],
      outcome: null,
      earnedRewards: null,
    };
  });

  describe('Initialization', () => {
    it('should not be executing initially', () => {
      expect(executor.isExecuting()).toBe(false);
    });

    it('should return 0 progress initially', () => {
      expect(executor.getProgress()).toBe(0);
    });

    it('should return empty events initially', () => {
      expect(executor.getEvents()).toEqual([]);
    });
  });

  describe('Task Execution', () => {
    it('should start execution', () => {
      const duration = 1500000; // 25 minutes in ms

      executor.startExecution(expedition, activeTask, duration);

      expect(executor.isExecuting()).toBe(true);
      expect(executor.getProgress()).toBe(0);
    });

    it('should update progress over time', () => {
      const duration = 1000; // 1 second for testing
      const startTime = Date.now();

      executor.startExecution(expedition, activeTask, duration);

      // Simulate time passing
      executor.update(startTime + 500); // 50% through

      const progress = executor.getProgress();
      expect(progress).toBeGreaterThan(40);
      expect(progress).toBeLessThan(60);
    });

    it('should cap progress at 100%', () => {
      const duration = 1000;
      const startTime = Date.now();

      executor.startExecution(expedition, activeTask, duration);

      // Simulate more time than duration
      executor.update(startTime + 2000);

      expect(executor.getProgress()).toBe(100);
    });

    it('should generate events during execution', () => {
      const duration = 10000;
      const startTime = Date.now();

      executor.startExecution(expedition, activeTask, duration);

      // Update multiple times over a longer period
      let totalEvents = 0;
      for (let i = 1; i <= 10; i++) {
        const events = executor.update(startTime + i * 1000 + i * 120000); // Add rate limit time
        totalEvents += events.length;
      }

      // Should have generated some events (milestones at minimum)
      expect(totalEvents).toBeGreaterThan(0);
    });

    it('should accumulate events', () => {
      const duration = 10000;
      const startTime = Date.now();

      executor.startExecution(expedition, activeTask, duration);

      // First update
      executor.update(startTime + 3000);
      const events1 = executor.getEvents();

      // Second update (with rate limit bypassed)
      executor.update(startTime + 10000);
      const events2 = executor.getEvents();

      // Events should accumulate
      expect(events2.length).toBeGreaterThanOrEqual(events1.length);
    });

    it('should provide progress flavor text', () => {
      const duration = 1000;

      executor.startExecution(expedition, activeTask, duration);
      executor.update(Date.now() + 500);

      const flavor = executor.getProgressFlavor();

      expect(flavor).toBeDefined();
      expect(flavor.length).toBeGreaterThan(0);
    });

    it('should provide start message', () => {
      executor.startExecution(expedition, activeTask, 1000);

      const message = executor.getStartMessage();

      expect(message).toBeDefined();
      expect(message.length).toBeGreaterThan(0);
    });

    it('should provide completion flavor', () => {
      executor.startExecution(expedition, activeTask, 1000);

      const successFlavor = executor.getCompletionFlavor('success');
      const partialFlavor = executor.getCompletionFlavor('partial');
      const failureFlavor = executor.getCompletionFlavor('failure');

      expect(successFlavor).toBeDefined();
      expect(partialFlavor).toBeDefined();
      expect(failureFlavor).toBeDefined();
    });
  });

  describe('Time Management', () => {
    it('should calculate time remaining', () => {
      const duration = 10000;
      const startTime = Date.now();

      executor.startExecution(expedition, activeTask, duration);

      // Check at 50%
      const remaining = executor.getTimeRemaining(startTime + 5000);

      expect(remaining).toBeGreaterThan(4000);
      expect(remaining).toBeLessThan(6000);
    });

    it('should return 0 time remaining after duration', () => {
      const duration = 1000;
      const startTime = Date.now();

      executor.startExecution(expedition, activeTask, duration);

      const remaining = executor.getTimeRemaining(startTime + 2000);

      expect(remaining).toBe(0);
    });

    it('should detect task completion', () => {
      const duration = 1000;
      const startTime = Date.now();

      executor.startExecution(expedition, activeTask, duration);

      expect(executor.isComplete(startTime + 500)).toBe(false);
      expect(executor.isComplete(startTime + 1500)).toBe(true);
    });
  });

  describe('Stop Execution', () => {
    it('should stop execution and clear state', () => {
      executor.startExecution(expedition, activeTask, 1000);
      expect(executor.isExecuting()).toBe(true);

      executor.stopExecution();

      expect(executor.isExecuting()).toBe(false);
      expect(executor.getProgress()).toBe(0);
      expect(executor.getEvents()).toEqual([]);
    });

    it('should return empty string for flavor after stopping', () => {
      executor.startExecution(expedition, activeTask, 1000);
      executor.stopExecution();

      expect(executor.getProgressFlavor()).toBe('');
      expect(executor.getStartMessage()).toBe('');
      expect(executor.getCompletionFlavor('success')).toBe('');
    });
  });

  describe('Milestone Triggering', () => {
    it('should trigger milestones at correct progress', () => {
      const duration = 1000;
      const startTime = Date.now();

      executor.startExecution(expedition, activeTask, duration);

      // Update to 30% (should trigger 25% milestone)
      const events = executor.update(startTime + 300);

      // Should have at least the 25% milestone
      const milestoneEvents = events.filter((e) => e.id.includes('milestone'));
      expect(milestoneEvents.length).toBeGreaterThan(0);
    });

    it('should not re-trigger milestones', () => {
      const duration = 1000;
      const startTime = Date.now();

      executor.startExecution(expedition, activeTask, duration);

      // First update to 30%
      const events1 = executor.update(startTime + 300);
      const milestones1 = events1.filter((e) => e.id.includes('milestone'));

      // Second update to 35%
      const events2 = executor.update(startTime + 350);
      const milestones2 = events2.filter((e) => e.id.includes('milestone'));

      // Should only trigger milestones once
      expect(milestones1.length).toBeGreaterThan(0);
      expect(milestones2.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle update without execution started', () => {
      expect(() => executor.update(Date.now())).not.toThrow();
      expect(executor.update(Date.now())).toEqual([]);
    });

    it('should return 0 for time remaining without execution', () => {
      expect(executor.getTimeRemaining(Date.now())).toBe(0);
    });

    it('should return false for isComplete without execution', () => {
      expect(executor.isComplete(Date.now())).toBe(false);
    });
  });
});
