import { describe, it, expect, beforeEach } from 'vitest';
import { createTaskManager } from '../../../../src/systems/tasks/TaskManager';
import { createTaskStore } from '../../../../src/core/state/TaskState';
import { EXPEDITION_CONFIG, RAID_CONFIG } from '../../../../src/data/tasks/taskConfigs';
import type { TaskSelectionContext } from '../../../../src/core/types/tasks';

describe('TaskManager', () => {
  let manager: ReturnType<typeof createTaskManager>;
  let store: ReturnType<typeof createTaskStore>;

  const mockContext: TaskSelectionContext = {
    characterLevel: 1,
    characterStats: {
      power: 10,
      defense: 15,
      focus: 10,
      luck: 5,
      health: 100,
    },
    isInjured: false,
    injuryPenalty: 0,
    billPenalty: 0,
    equipmentBonuses: {
      power: 5,
      defense: 5,
      focus: 3,
      luck: 2,
    },
  };

  beforeEach(() => {
    store = createTaskStore();
    manager = createTaskManager(store);
  });

  describe('startTask', () => {
    it('should start a new task', () => {
      const activeTask = manager.startTask(
        'expedition',
        'standard',
        EXPEDITION_CONFIG,
        mockContext
      );

      expect(activeTask).toBeDefined();
      expect(activeTask.taskType).toBe('expedition');
      expect(activeTask.riskLevel).toBe('standard');
      expect(activeTask.config).toEqual(EXPEDITION_CONFIG);
      expect(activeTask.progress).toBe(0);
      expect(activeTask.events).toEqual([]);
      expect(activeTask.outcome).toBeNull();
      expect(activeTask.calculatedSuccessChance).toBeGreaterThan(0);
      expect(activeTask.startedAt).toBeGreaterThan(0);
    });

    it('should set active task in store', () => {
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);

      expect(store.state.activeTask).not.toBeNull();
      expect(store.state.activeTask?.taskType).toBe('expedition');
    });

    it('should calculate success chance correctly', () => {
      const activeTask = manager.startTask('expedition', 'safe', EXPEDITION_CONFIG, mockContext);

      // Safe route should have higher success chance
      expect(activeTask.calculatedSuccessChance).toBeGreaterThan(60);
    });
  });

  describe('updateProgress', () => {
    it('should update task progress', () => {
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);
      manager.updateProgress(50);

      expect(store.state.activeTask?.progress).toBe(50);
    });
  });

  describe('addEvent', () => {
    it('should add event to active task', () => {
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);

      const event = {
        id: 'event-1',
        timestamp: Date.now(),
        message: 'Found a treasure!',
        severity: 'info' as const,
        effects: {
          goldModifier: 10,
        },
      };

      manager.addEvent(event);

      expect(store.state.activeTask?.events).toHaveLength(1);
      expect(store.state.activeTask?.events[0]).toEqual(event);
    });
  });

  describe('completeTask', () => {
    it('should complete task and return result', () => {
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);

      const result = manager.completeTask(mockContext);

      expect(result).not.toBeNull();
      expect(result?.outcome).toBeDefined();
      expect(result?.rewards).toBeDefined();
      expect(result?.summary).toBeDefined();
      expect(result?.wasInjured).toBeDefined();
    });

    it('should clear active task after completion', () => {
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);
      manager.completeTask(mockContext);

      expect(store.state.activeTask).toBeNull();
    });

    it('should store last completed task', () => {
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);
      manager.completeTask(mockContext);

      expect(store.state.lastCompletedTask).not.toBeNull();
    });

    it('should add to task history', () => {
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);
      manager.completeTask(mockContext);

      expect(store.state.taskHistory).toHaveLength(1);
    });

    it('should return null if no active task', () => {
      const result = manager.completeTask(mockContext);

      expect(result).toBeNull();
    });

    it('should apply event modifiers to success chance', () => {
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);

      // Add a positive event
      manager.addEvent({
        id: 'event-1',
        timestamp: Date.now(),
        message: 'Lucky break!',
        severity: 'info',
        effects: {
          successChanceModifier: 20,
        },
      });

      // Events should affect the outcome calculation
      const result = manager.completeTask(mockContext);

      expect(result).not.toBeNull();
      expect(result?.task.events).toHaveLength(1);
    });
  });

  describe('cancelTask', () => {
    it('should cancel active task', () => {
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);
      manager.cancelTask();

      expect(store.state.activeTask).toBeNull();
    });
  });

  describe('getAvailableTasks', () => {
    it('should return available tasks', () => {
      const available = manager.getAvailableTasks(1);

      expect(available).toContain('expedition');
      expect(available).toContain('raid');
    });
  });

  describe('getActiveTask', () => {
    it('should return active task', () => {
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);

      const activeTask = manager.getActiveTask();

      expect(activeTask).not.toBeNull();
      expect(activeTask?.taskType).toBe('expedition');
    });

    it('should return null if no active task', () => {
      const activeTask = manager.getActiveTask();

      expect(activeTask).toBeNull();
    });
  });

  describe('getLastCompletedTask', () => {
    it('should return last completed task', () => {
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);
      manager.completeTask(mockContext);

      const lastTask = manager.getLastCompletedTask();

      expect(lastTask).not.toBeNull();
      expect(lastTask?.task.taskType).toBe('expedition');
    });
  });

  describe('clearLastCompletedTask', () => {
    it('should clear last completed task', () => {
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);
      manager.completeTask(mockContext);

      manager.clearLastCompletedTask();

      expect(manager.getLastCompletedTask()).toBeNull();
    });
  });

  describe('getTaskHistory', () => {
    it('should return task history', () => {
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);
      manager.completeTask(mockContext);

      manager.startTask('raid', 'risky', RAID_CONFIG, mockContext);
      manager.completeTask(mockContext);

      const history = manager.getTaskHistory();

      expect(history).toHaveLength(2);
    });
  });

  describe('Success Rate Methods', () => {
    beforeEach(() => {
      // Complete some tasks for statistics
      manager.startTask('expedition', 'standard', EXPEDITION_CONFIG, mockContext);
      manager.completeTask(mockContext);

      manager.startTask('raid', 'standard', RAID_CONFIG, mockContext);
      manager.completeTask(mockContext);
    });

    it('should return overall success rate', () => {
      const rate = manager.getSuccessRate();

      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });

    it('should return task type success rate', () => {
      const rate = manager.getTaskTypeSuccessRate('expedition');

      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });

    it('should return risk level success rate', () => {
      const rate = manager.getRiskLevelSuccessRate('standard');

      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });
  });

  describe('previewSuccessChance', () => {
    it('should preview success chance without starting task', () => {
      const preview = manager.previewSuccessChance(EXPEDITION_CONFIG, 'standard', mockContext);

      expect(preview).toBeDefined();
      expect(preview.baseChance).toBe(60);
      expect(preview.finalChance).toBeGreaterThanOrEqual(5);
      expect(preview.finalChance).toBeLessThanOrEqual(95);
      expect(preview.breakdown).toBeDefined();
      expect(preview.breakdown.length).toBeGreaterThan(0);
    });

    it('should show different success chances for different risk levels', () => {
      const safePreview = manager.previewSuccessChance(EXPEDITION_CONFIG, 'safe', mockContext);
      const standardPreview = manager.previewSuccessChance(
        EXPEDITION_CONFIG,
        'standard',
        mockContext
      );
      const riskyPreview = manager.previewSuccessChance(EXPEDITION_CONFIG, 'risky', mockContext);

      expect(safePreview.finalChance).toBeGreaterThan(standardPreview.finalChance);
      expect(standardPreview.finalChance).toBeGreaterThan(riskyPreview.finalChance);
    });

    it('should not affect store state', () => {
      manager.previewSuccessChance(EXPEDITION_CONFIG, 'standard', mockContext);

      expect(store.state.activeTask).toBeNull();
    });
  });
});
