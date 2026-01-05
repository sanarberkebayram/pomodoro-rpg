import { describe, it, expect, beforeEach } from 'vitest';
import { createTaskStore, createInitialTaskState } from '../../../../src/core/state/TaskState';
import { EXPEDITION_CONFIG } from '../../../../src/data/tasks/taskConfigs';
import type {
  ActiveTask,
  TaskCompletionResult,
  TaskType,
  RiskLevel,
  TaskOutcome,
} from '../../../../src/core/types/tasks';

describe('TaskState', () => {
  describe('Initial State', () => {
    it('should create initial task state', () => {
      const state = createInitialTaskState();

      expect(state.activeTask).toBeNull();
      expect(state.lastCompletedTask).toBeNull();
      expect(state.taskHistory).toEqual([]);
      expect(state.availableTasks).toEqual(['expedition', 'raid']);
      expect(state.statistics.totalStarted).toBe(0);
      expect(state.statistics.totalSucceeded).toBe(0);
      expect(state.statistics.totalPartial).toBe(0);
      expect(state.statistics.totalFailed).toBe(0);
    });

    it('should have empty statistics by type and risk', () => {
      const state = createInitialTaskState();

      expect(Object.keys(state.statistics.byType)).toHaveLength(0);
      expect(Object.keys(state.statistics.byRisk)).toHaveLength(0);
    });
  });

  describe('Task Store', () => {
    let store: ReturnType<typeof createTaskStore>;

    beforeEach(() => {
      store = createTaskStore();
    });

    describe('setActiveTask', () => {
      it('should set active task', () => {
        const activeTask: ActiveTask = {
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

        store.setActiveTask(activeTask);

        expect(store.state.activeTask).toEqual(activeTask);
      });
    });

    describe('clearActiveTask', () => {
      it('should clear active task', () => {
        const activeTask: ActiveTask = {
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

        store.setActiveTask(activeTask);
        store.clearActiveTask();

        expect(store.state.activeTask).toBeNull();
      });
    });

    describe('updateTaskProgress', () => {
      it('should update task progress', () => {
        const activeTask: ActiveTask = {
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

        store.setActiveTask(activeTask);
        store.updateTaskProgress(50);

        expect(store.state.activeTask?.progress).toBe(50);
      });

      it('should clamp progress between 0 and 100', () => {
        const activeTask: ActiveTask = {
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

        store.setActiveTask(activeTask);
        store.updateTaskProgress(150);
        expect(store.state.activeTask?.progress).toBe(100);

        store.updateTaskProgress(-10);
        expect(store.state.activeTask?.progress).toBe(0);
      });

      it('should do nothing if no active task', () => {
        expect(() => store.updateTaskProgress(50)).not.toThrow();
      });
    });

    describe('addTaskEvent', () => {
      it('should add event to active task', () => {
        const activeTask: ActiveTask = {
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

        const event = {
          id: 'event-1',
          timestamp: Date.now(),
          message: 'Found a treasure chest!',
          severity: 'info' as const,
          effects: {
            goldModifier: 10,
          },
        };

        store.setActiveTask(activeTask);
        store.addTaskEvent(event);

        expect(store.state.activeTask?.events).toHaveLength(1);
        expect(store.state.activeTask?.events[0]).toEqual(event);
      });

      it('should do nothing if no active task', () => {
        const event = {
          id: 'event-1',
          timestamp: Date.now(),
          message: 'Found a treasure chest!',
          severity: 'info' as const,
          effects: {
            goldModifier: 10,
          },
        };

        expect(() => store.addTaskEvent(event)).not.toThrow();
      });
    });

    describe('completeActiveTask', () => {
      it('should complete task and update statistics', () => {
        const activeTask: ActiveTask = {
          taskType: 'expedition',
          riskLevel: 'standard',
          config: EXPEDITION_CONFIG,
          startedAt: Date.now(),
          calculatedSuccessChance: 70,
          progress: 100,
          events: [],
          outcome: 'success',
          earnedRewards: {
            gold: { min: 25, max: 25 },
            xp: { min: 30, max: 30 },
            materials: { min: 5, max: 5 },
            chests: 1,
            lootQuality: 1.0,
          },
        };

        const result: TaskCompletionResult = {
          task: activeTask,
          outcome: 'success',
          rewards: activeTask.earnedRewards ?? {
            gold: { min: 0, max: 0 },
            xp: { min: 0, max: 0 },
            materials: { min: 0, max: 0 },
            chests: 0,
            lootQuality: 0,
          },
          wasInjured: false,
          injurySeverity: null,
          eventCount: 0,
          summary: 'Task completed successfully',
        };

        store.setActiveTask(activeTask);
        store.completeActiveTask(result);

        expect(store.state.activeTask).toBeNull();
        expect(store.state.lastCompletedTask).toEqual(result);
        expect(store.state.taskHistory).toHaveLength(1);
        expect(store.state.statistics.totalStarted).toBe(1);
        expect(store.state.statistics.totalSucceeded).toBe(1);
      });

      it('should update by-type statistics', () => {
        const activeTask: ActiveTask = {
          taskType: 'expedition',
          riskLevel: 'standard',
          config: EXPEDITION_CONFIG,
          startedAt: Date.now(),
          calculatedSuccessChance: 70,
          progress: 100,
          events: [],
          outcome: 'success',
          earnedRewards: {
            gold: { min: 25, max: 25 },
            xp: { min: 30, max: 30 },
            materials: { min: 5, max: 5 },
            chests: 1,
            lootQuality: 1.0,
          },
        };

        const result: TaskCompletionResult = {
          task: activeTask,
          outcome: 'success',
          rewards: activeTask.earnedRewards ?? {
            gold: { min: 0, max: 0 },
            xp: { min: 0, max: 0 },
            materials: { min: 0, max: 0 },
            chests: 0,
            lootQuality: 0,
          },
          wasInjured: false,
          injurySeverity: null,
          eventCount: 0,
          summary: 'Task completed successfully',
        };

        store.setActiveTask(activeTask);
        store.completeActiveTask(result);

        expect(store.state.statistics.byType.expedition).toBeDefined();
        expect(store.state.statistics.byType.expedition?.started).toBe(1);
        expect(store.state.statistics.byType.expedition?.succeeded).toBe(1);
      });

      it('should update by-risk statistics', () => {
        const activeTask: ActiveTask = {
          taskType: 'expedition',
          riskLevel: 'risky',
          config: EXPEDITION_CONFIG,
          startedAt: Date.now(),
          calculatedSuccessChance: 70,
          progress: 100,
          events: [],
          outcome: 'failure',
          earnedRewards: null,
        };

        const result: TaskCompletionResult = {
          task: activeTask,
          outcome: 'failure',
          rewards: {
            gold: { min: 0, max: 0 },
            xp: { min: 0, max: 0 },
            materials: { min: 0, max: 0 },
            chests: 0,
            lootQuality: 0,
          },
          wasInjured: true,
          injurySeverity: 'moderate',
          eventCount: 0,
          summary: 'Task failed',
        };

        store.setActiveTask(activeTask);
        store.completeActiveTask(result);

        expect(store.state.statistics.byRisk.risky).toBeDefined();
        expect(store.state.statistics.byRisk.risky?.started).toBe(1);
        expect(store.state.statistics.byRisk.risky?.failed).toBe(1);
      });

      it('should limit task history to 10 entries', () => {
        const createMockResult = (index: number): TaskCompletionResult => ({
          task: {
            taskType: 'expedition',
            riskLevel: 'standard',
            config: EXPEDITION_CONFIG,
            startedAt: Date.now() - index * 1000,
            calculatedSuccessChance: 70,
            progress: 100,
            events: [],
            outcome: 'success',
            earnedRewards: null,
          },
          outcome: 'success',
          rewards: {
            gold: { min: 25, max: 25 },
            xp: { min: 30, max: 30 },
            materials: { min: 5, max: 5 },
            chests: 1,
            lootQuality: 1.0,
          },
          wasInjured: false,
          injurySeverity: null,
          eventCount: 0,
          summary: `Task ${index} completed`,
        });

        // Complete 15 tasks
        for (let i = 0; i < 15; i++) {
          const activeTask: ActiveTask = {
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

          store.setActiveTask(activeTask);
          store.completeActiveTask(createMockResult(i));
        }

        // Should only keep 10 most recent
        expect(store.state.taskHistory).toHaveLength(10);
      });
    });

    describe('Statistics Methods', () => {
      beforeEach(() => {
        // Set up some completed tasks
        const tasks = [
          { type: 'expedition', risk: 'safe', outcome: 'success' },
          { type: 'expedition', risk: 'standard', outcome: 'success' },
          { type: 'expedition', risk: 'risky', outcome: 'partial' },
          { type: 'raid', risk: 'standard', outcome: 'failure' },
          { type: 'raid', risk: 'risky', outcome: 'success' },
        ];

        tasks.forEach((task) => {
          const activeTask: ActiveTask = {
            taskType: task.type as TaskType,
            riskLevel: task.risk as RiskLevel,
            config: EXPEDITION_CONFIG,
            startedAt: Date.now(),
            calculatedSuccessChance: 70,
            progress: 100,
            events: [],
            outcome: task.outcome as TaskOutcome,
            earnedRewards: null,
          };

          const result: TaskCompletionResult = {
            task: activeTask,
            outcome: task.outcome as TaskOutcome,
            rewards: {
              gold: { min: 25, max: 25 },
              xp: { min: 30, max: 30 },
              materials: { min: 5, max: 5 },
              chests: 1,
              lootQuality: 1.0,
            },
            wasInjured: false,
            injurySeverity: null,
            eventCount: 0,
            summary: 'Task completed',
          };

          store.setActiveTask(activeTask);
          store.completeActiveTask(result);
        });
      });

      it('should calculate overall success rate', () => {
        const rate = store.getOverallSuccessRate();

        // 3 success + 0.5 * 1 partial = 3.5 / 5 = 70%
        expect(rate).toBe(70);
      });

      it('should calculate task type success rate', () => {
        const expeditionRate = store.getTaskTypeSuccessRate('expedition');

        // 2 success + 0.5 * 1 partial = 2.5 / 3 = 83%
        expect(expeditionRate).toBe(83);
      });

      it('should calculate risk level success rate', () => {
        const riskyRate = store.getRiskLevelSuccessRate('risky');

        // 1 success + 0.5 * 1 partial = 1.5 / 2 = 75%
        expect(riskyRate).toBe(75);
      });

      it('should return 0 for tasks with no attempts', () => {
        const craftRate = store.getTaskTypeSuccessRate('craft');
        expect(craftRate).toBe(0);
      });
    });

    describe('clearLastCompletedTask', () => {
      it('should clear last completed task', () => {
        const activeTask: ActiveTask = {
          taskType: 'expedition',
          riskLevel: 'standard',
          config: EXPEDITION_CONFIG,
          startedAt: Date.now(),
          calculatedSuccessChance: 70,
          progress: 100,
          events: [],
          outcome: 'success',
          earnedRewards: null,
        };

        const result: TaskCompletionResult = {
          task: activeTask,
          outcome: 'success',
          rewards: {
            gold: { min: 25, max: 25 },
            xp: { min: 30, max: 30 },
            materials: { min: 5, max: 5 },
            chests: 1,
            lootQuality: 1.0,
          },
          wasInjured: false,
          injurySeverity: null,
          eventCount: 0,
          summary: 'Task completed',
        };

        store.setActiveTask(activeTask);
        store.completeActiveTask(result);
        expect(store.state.lastCompletedTask).not.toBeNull();

        store.clearLastCompletedTask();
        expect(store.state.lastCompletedTask).toBeNull();
      });
    });
  });
});
