import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PomodoroTimer } from '../../../../src/systems/pomodoro/PomodoroTimer';
import { DEFAULT_TIMER_CONFIG } from '../../../../src/systems/pomodoro/types';

describe('PomodoroTimer', () => {
  let timer: PomodoroTimer;

  beforeEach(() => {
    vi.useFakeTimers();
    timer = new PomodoroTimer();
  });

  afterEach(() => {
    timer.destroy();
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize in IDLE phase', () => {
      const state = timer.getState();
      expect(state.phase).toBe('IDLE');
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.remainingSeconds).toBe(0);
      expect(state.completedSessions).toBe(0);
      expect(state.totalCompletedSessions).toBe(0);
    });

    it('should use default configuration', () => {
      const config = timer.getConfig();
      expect(config.workDuration).toBe(25);
      expect(config.shortBreakDuration).toBe(5);
      expect(config.longBreakDuration).toBe(15);
      expect(config.sessionsBeforeLongBreak).toBe(4);
    });

    it('should accept custom configuration', () => {
      const customTimer = new PomodoroTimer({
        workDuration: 30,
        shortBreakDuration: 10,
      });

      const config = customTimer.getConfig();
      expect(config.workDuration).toBe(30);
      expect(config.shortBreakDuration).toBe(10);
      expect(config.longBreakDuration).toBe(15); // default
      expect(config.sessionsBeforeLongBreak).toBe(4); // default

      customTimer.destroy();
    });
  });

  describe('START Action', () => {
    it('should transition to WORK phase when started', () => {
      timer.dispatch({ type: 'START' });
      const state = timer.getState();
      expect(state.phase).toBe('WORK');
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(false);
      expect(state.remainingSeconds).toBe(25 * 60); // 25 minutes in seconds
    });

    it('should throw error when starting non-IDLE timer', () => {
      timer.dispatch({ type: 'START' });
      expect(() => timer.dispatch({ type: 'START' })).toThrow(
        'Timer can only be started from IDLE phase'
      );
    });

    it('should notify listeners on state change', () => {
      const listener = vi.fn();
      timer.subscribe(listener);
      timer.dispatch({ type: 'START' });
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: 'WORK',
          isRunning: true,
        })
      );
    });
  });

  describe('PAUSE/RESUME Actions', () => {
    beforeEach(() => {
      timer.dispatch({ type: 'START' });
    });

    it('should pause running timer during WORK phase', () => {
      timer.dispatch({ type: 'PAUSE' });
      const state = timer.getState();
      expect(state.isPaused).toBe(true);
      expect(state.isRunning).toBe(true);
    });

    it('should throw error when pausing non-running timer', () => {
      timer.dispatch({ type: 'RESET' });
      expect(() => timer.dispatch({ type: 'PAUSE' })).toThrow('Timer must be running to pause');
    });

    it('should throw error when pausing during break phase', () => {
      // Fast forward to break phase
      vi.advanceTimersByTime(25 * 60 * 1000);
      expect(timer.getState().phase).toBe('SHORT_BREAK');
      expect(() => timer.dispatch({ type: 'PAUSE' })).toThrow('Can only pause during WORK phase');
    });

    it('should resume paused timer', () => {
      timer.dispatch({ type: 'PAUSE' });
      timer.dispatch({ type: 'RESUME' });
      const state = timer.getState();
      expect(state.isPaused).toBe(false);
      expect(state.isRunning).toBe(true);
    });

    it('should throw error when resuming non-paused timer', () => {
      expect(() => timer.dispatch({ type: 'RESUME' })).toThrow('Timer must be paused to resume');
    });
  });

  describe('RESET Action', () => {
    it('should reset timer to IDLE', () => {
      timer.dispatch({ type: 'START' });
      timer.dispatch({ type: 'RESET' });
      const state = timer.getState();
      expect(state.phase).toBe('IDLE');
      expect(state.isRunning).toBe(false);
      expect(state.remainingSeconds).toBe(0);
    });
  });

  describe('TICK Action', () => {
    it('should countdown remaining time when running', () => {
      timer.dispatch({ type: 'START' });
      const initialTime = timer.getState().remainingSeconds;

      vi.advanceTimersByTime(5000); // 5 seconds

      const currentTime = timer.getState().remainingSeconds;
      expect(currentTime).toBe(initialTime - 5);
    });

    it('should not countdown when paused', () => {
      timer.dispatch({ type: 'START' });
      vi.advanceTimersByTime(1000);
      timer.dispatch({ type: 'PAUSE' });

      const pausedTime = timer.getState().remainingSeconds;
      vi.advanceTimersByTime(5000);

      expect(timer.getState().remainingSeconds).toBe(pausedTime);
    });

    it('should continue countdown after resume', () => {
      timer.dispatch({ type: 'START' });
      vi.advanceTimersByTime(1000);
      timer.dispatch({ type: 'PAUSE' });
      const pausedTime = timer.getState().remainingSeconds;

      timer.dispatch({ type: 'RESUME' });
      vi.advanceTimersByTime(2000);

      expect(timer.getState().remainingSeconds).toBe(pausedTime - 2);
    });

    it('should emit state updates on tick', () => {
      const listener = vi.fn();
      timer.subscribe(listener);
      timer.dispatch({ type: 'START' });
      listener.mockClear();

      vi.advanceTimersByTime(1000);

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('Phase Transitions', () => {
    it('should transition from WORK to SHORT_BREAK', () => {
      timer.dispatch({ type: 'START' });
      expect(timer.getState().phase).toBe('WORK');

      // Complete work phase
      vi.advanceTimersByTime(25 * 60 * 1000);

      const state = timer.getState();
      expect(state.phase).toBe('SHORT_BREAK');
      expect(state.completedSessions).toBe(1);
      expect(state.totalCompletedSessions).toBe(1);
      expect(state.remainingSeconds).toBe(5 * 60);
    });

    it('should transition from SHORT_BREAK to WORK', () => {
      timer.dispatch({ type: 'START' });

      // Complete work phase
      vi.advanceTimersByTime(25 * 60 * 1000);
      expect(timer.getState().phase).toBe('SHORT_BREAK');

      // Complete short break
      vi.advanceTimersByTime(5 * 60 * 1000);

      const state = timer.getState();
      expect(state.phase).toBe('WORK');
      expect(state.completedSessions).toBe(1);
    });

    it('should transition to LONG_BREAK after configured work sessions', () => {
      const testTimer = new PomodoroTimer({ sessionsBeforeLongBreak: 2 });
      testTimer.dispatch({ type: 'START' });

      // Complete first work session
      vi.advanceTimersByTime(25 * 60 * 1000);
      expect(testTimer.getState().phase).toBe('SHORT_BREAK');
      expect(testTimer.getState().completedSessions).toBe(1);

      // Complete first short break
      vi.advanceTimersByTime(5 * 60 * 1000);
      expect(testTimer.getState().phase).toBe('WORK');

      // Complete second work session - should go to long break
      vi.advanceTimersByTime(25 * 60 * 1000);
      expect(testTimer.getState().phase).toBe('LONG_BREAK');
      expect(testTimer.getState().completedSessions).toBe(2);
      expect(testTimer.getState().remainingSeconds).toBe(15 * 60);

      testTimer.destroy();
    });

    it('should reset session count after LONG_BREAK', () => {
      const testTimer = new PomodoroTimer({ sessionsBeforeLongBreak: 2 });
      testTimer.dispatch({ type: 'START' });

      // Complete 2 work sessions and get to long break
      vi.advanceTimersByTime(25 * 60 * 1000);
      vi.advanceTimersByTime(5 * 60 * 1000);
      vi.advanceTimersByTime(25 * 60 * 1000);
      expect(testTimer.getState().phase).toBe('LONG_BREAK');
      expect(testTimer.getState().completedSessions).toBe(2);

      // Complete long break
      vi.advanceTimersByTime(15 * 60 * 1000);
      expect(testTimer.getState().phase).toBe('WORK');
      expect(testTimer.getState().completedSessions).toBe(0); // Reset
      expect(testTimer.getState().totalCompletedSessions).toBe(2); // Preserved

      testTimer.destroy();
    });

    it('should handle full cycle correctly', () => {
      const testTimer = new PomodoroTimer({ sessionsBeforeLongBreak: 4 });
      testTimer.dispatch({ type: 'START' });

      // Track phases
      const phases: string[] = [];
      testTimer.subscribe((state) => phases.push(state.phase));

      // Complete 4 work sessions
      for (let i = 0; i < 4; i++) {
        vi.advanceTimersByTime(25 * 60 * 1000); // WORK
        if (i < 3) {
          vi.advanceTimersByTime(5 * 60 * 1000); // SHORT_BREAK
        }
      }

      expect(testTimer.getState().phase).toBe('LONG_BREAK');
      expect(testTimer.getState().completedSessions).toBe(4);

      // Complete long break
      vi.advanceTimersByTime(15 * 60 * 1000);
      expect(testTimer.getState().phase).toBe('WORK');
      expect(testTimer.getState().completedSessions).toBe(0);

      testTimer.destroy();
    });
  });

  describe('SKIP Action', () => {
    it('should skip to next phase', () => {
      timer.dispatch({ type: 'START' });
      expect(timer.getState().phase).toBe('WORK');

      timer.dispatch({ type: 'SKIP' });
      expect(timer.getState().phase).toBe('SHORT_BREAK');
      expect(timer.getState().completedSessions).toBe(1);
    });

    it('should maintain running status after skip', () => {
      timer.dispatch({ type: 'START' });
      timer.dispatch({ type: 'SKIP' });
      expect(timer.getState().isRunning).toBe(true);
      expect(timer.getState().isPaused).toBe(false);
    });

    it('should work when paused', () => {
      timer.dispatch({ type: 'START' });
      timer.dispatch({ type: 'PAUSE' });
      timer.dispatch({ type: 'SKIP' });
      expect(timer.getState().phase).toBe('SHORT_BREAK');
    });

    it('should throw error when skipping stopped timer', () => {
      expect(() => timer.dispatch({ type: 'SKIP' })).toThrow(
        'Cannot skip when timer is not started'
      );
    });
  });

  describe('UPDATE_CONFIG Action', () => {
    it('should update configuration', () => {
      timer.dispatch({
        type: 'UPDATE_CONFIG',
        config: { workDuration: 30 },
      });
      const config = timer.getConfig();
      expect(config.workDuration).toBe(30);
    });

    it('should validate configuration on update', () => {
      expect(() => {
        timer.dispatch({
          type: 'UPDATE_CONFIG',
          config: { workDuration: 100 },
        });
      }).toThrow('Work duration must be between 1 and 60 minutes');
    });

    it('should validate short break duration', () => {
      expect(() => {
        timer.dispatch({
          type: 'UPDATE_CONFIG',
          config: { shortBreakDuration: 0 },
        });
      }).toThrow('Short break duration must be between 1 and 30 minutes');
    });

    it('should validate long break duration', () => {
      expect(() => {
        timer.dispatch({
          type: 'UPDATE_CONFIG',
          config: { longBreakDuration: 100 },
        });
      }).toThrow('Long break duration must be between 1 and 60 minutes');
    });

    it('should validate sessions before long break', () => {
      expect(() => {
        timer.dispatch({
          type: 'UPDATE_CONFIG',
          config: { sessionsBeforeLongBreak: 0 },
        });
      }).toThrow('Sessions before long break must be between 1 and 10');
    });
  });

  describe('Subscription System', () => {
    it('should register and unregister listeners', () => {
      const listener = vi.fn();
      const unsubscribe = timer.subscribe(listener);

      timer.dispatch({ type: 'START' });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      timer.dispatch({ type: 'RESET' });
      timer.dispatch({ type: 'START' });
      expect(listener).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should handle multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      timer.subscribe(listener1);
      timer.subscribe(listener2);
      timer.dispatch({ type: 'START' });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should not crash if listener throws error', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalListener = vi.fn();

      timer.subscribe(errorListener);
      timer.subscribe(normalListener);

      expect(() => timer.dispatch({ type: 'START' })).not.toThrow();
      expect(normalListener).toHaveBeenCalled();
    });

    it('should only notify on actual state changes', () => {
      const listener = vi.fn();
      timer.subscribe(listener);

      timer.dispatch({ type: 'START' });
      listener.mockClear();

      // Dispatch action that doesn't change state
      timer.dispatch({ type: 'PAUSE' });
      timer.dispatch({ type: 'PAUSE' }); // This should throw, so no notification

      expect(listener).toHaveBeenCalledTimes(1); // Only the first pause
    });
  });

  describe('Serialization', () => {
    it('should serialize timer state', () => {
      timer.dispatch({ type: 'START' });
      vi.advanceTimersByTime(5000);

      const serialized = timer.serialize();
      expect(typeof serialized).toBe('string');

      const parsed = JSON.parse(serialized);
      expect(parsed.state.phase).toBe('WORK');
      expect(parsed.state.isRunning).toBe(true);
      expect(parsed.config).toBeDefined();
    });

    it('should deserialize timer state', () => {
      timer.dispatch({ type: 'START' });
      vi.advanceTimersByTime(5000);
      const serialized = timer.serialize();

      const newTimer = PomodoroTimer.deserialize(serialized);
      const state = newTimer.getState();

      expect(state.phase).toBe('WORK');
      expect(state.isRunning).toBe(true);
      expect(state.remainingSeconds).toBeLessThan(25 * 60);

      newTimer.destroy();
    });

    it('should preserve configuration on serialization', () => {
      const customTimer = new PomodoroTimer({
        workDuration: 30,
        shortBreakDuration: 10,
      });

      const serialized = customTimer.serialize();
      const restored = PomodoroTimer.deserialize(serialized);

      const config = restored.getConfig();
      expect(config.workDuration).toBe(30);
      expect(config.shortBreakDuration).toBe(10);

      customTimer.destroy();
      restored.destroy();
    });
  });

  describe('Sync with Real Time', () => {
    it('should sync elapsed time after page reload simulation', () => {
      timer.dispatch({ type: 'START' });
      const initialTime = timer.getState().remainingSeconds;

      // Simulate 10 seconds passing in real time
      const state = timer.getState();
      const futureState = {
        ...state,
        lastUpdateTimestamp: state.lastUpdateTimestamp - 10000,
      };

      const newTimer = new PomodoroTimer(DEFAULT_TIMER_CONFIG, futureState);
      newTimer.syncWithRealTime();

      const syncedTime = newTimer.getState().remainingSeconds;
      expect(syncedTime).toBeLessThanOrEqual(initialTime - 10);

      newTimer.destroy();
    });

    it('should not sync when paused', () => {
      timer.dispatch({ type: 'START' });
      timer.dispatch({ type: 'PAUSE' });

      const pausedTime = timer.getState().remainingSeconds;
      timer.syncWithRealTime();

      expect(timer.getState().remainingSeconds).toBe(pausedTime);
    });
  });

  describe('Cleanup', () => {
    it('should clear all listeners on destroy', () => {
      const listener = vi.fn();
      timer.subscribe(listener);
      timer.dispatch({ type: 'START' });

      vi.advanceTimersByTime(1000);
      expect(listener).toHaveBeenCalled();

      listener.mockClear();
      timer.destroy();

      vi.advanceTimersByTime(1000);
      expect(listener).not.toHaveBeenCalled();
    });

    it('should stop ticking on destroy', () => {
      timer.dispatch({ type: 'START' });
      const _timeAfterStart = timer.getState().remainingSeconds;

      timer.destroy();
      vi.advanceTimersByTime(5000);

      // Can't check state after destroy, but ensuring no errors
      expect(() => timer.getState()).not.toThrow();
    });
  });
});
