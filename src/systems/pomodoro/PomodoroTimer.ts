import type { TimerConfig, TimerState, PomodoroPhase, TimerAction } from './types';
import { DEFAULT_TIMER_CONFIG } from './types';
import { validateTimerConfig } from '../../data/config/timerConfig';

/**
 * PomodoroTimer - Core timer state machine
 *
 * Implements the Pomodoro technique state flow:
 * IDLE → WORK → SHORT_BREAK → WORK → SHORT_BREAK → WORK → SHORT_BREAK → WORK → LONG_BREAK → (repeat)
 *
 * Features:
 * - Auto-transitions between phases
 * - Pause/resume functionality (emergency pause during WORK)
 * - Action-based state updates
 * - Configurable durations
 * - Persistence support
 */
export class PomodoroTimer {
  private state: TimerState;
  private config: TimerConfig;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(state: TimerState) => void> = new Set();

  constructor(config?: Partial<TimerConfig>, initialState?: TimerState) {
    this.config = config ? validateTimerConfig(config) : { ...DEFAULT_TIMER_CONFIG };
    this.state = initialState ?? this.createInitialState();
  }

  /**
   * Create initial timer state
   */
  private createInitialState(): TimerState {
    return {
      phase: 'IDLE',
      remainingSeconds: 0,
      isRunning: false,
      completedSessions: 0,
      totalCompletedSessions: 0,
      lastUpdateTimestamp: Date.now(),
      isPaused: false,
    };
  }

  /**
   * Get current timer state (immutable copy)
   */
  public getState(): Readonly<TimerState> {
    return { ...this.state };
  }

  /**
   * Get current timer configuration
   */
  public getConfig(): Readonly<TimerConfig> {
    return { ...this.config };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: TimerState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('Error in timer listener:', error);
      }
    });
  }

  /**
   * Dispatch an action to update timer state
   */
  public dispatch(action: TimerAction): void {
    const prevState = { ...this.state };

    switch (action.type) {
      case 'START':
        this.handleStart();
        break;
      case 'PAUSE':
        this.handlePause();
        break;
      case 'RESUME':
        this.handleResume();
        break;
      case 'SKIP':
        this.handleSkip();
        break;
      case 'RESET':
        this.handleReset();
        break;
      case 'TICK':
        this.handleTick(action.deltaSeconds);
        break;
      case 'PHASE_COMPLETE':
        this.handlePhaseComplete();
        break;
      case 'UPDATE_CONFIG':
        this.handleUpdateConfig(action.config);
        break;
    }

    // Notify listeners if state changed
    if (JSON.stringify(prevState) !== JSON.stringify(this.state)) {
      this.notifyListeners();
    }
  }

  /**
   * Handle START action
   */
  private handleStart(): void {
    if (this.state.phase !== 'IDLE') {
      throw new Error('Timer can only be started from IDLE phase');
    }

    this.transitionToPhase('WORK');
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.lastUpdateTimestamp = Date.now();
    this.startTicking();
  }

  /**
   * Handle PAUSE action
   */
  private handlePause(): void {
    if (!this.state.isRunning) {
      throw new Error('Timer must be running to pause');
    }

    if (this.state.phase !== 'WORK') {
      throw new Error('Can only pause during WORK phase (emergency pause only)');
    }

    this.state.isPaused = true;
    this.state.lastUpdateTimestamp = Date.now();
    this.stopTicking();
  }

  /**
   * Handle RESUME action
   */
  private handleResume(): void {
    if (!this.state.isPaused) {
      throw new Error('Timer must be paused to resume');
    }

    this.state.isPaused = false;
    this.state.lastUpdateTimestamp = Date.now();
    this.startTicking();
  }

  /**
   * Handle SKIP action (skip to next phase)
   */
  private handleSkip(): void {
    if (!this.state.isRunning && !this.state.isPaused) {
      throw new Error('Cannot skip when timer is not started');
    }

    this.handlePhaseComplete();
  }

  /**
   * Handle RESET action
   */
  private handleReset(): void {
    this.stopTicking();
    this.state = this.createInitialState();
  }

  /**
   * Handle TICK action
   */
  private handleTick(deltaSeconds: number): void {
    if (!this.state.isRunning || this.state.isPaused) {
      return;
    }

    this.state.remainingSeconds = Math.max(0, this.state.remainingSeconds - deltaSeconds);
    this.state.lastUpdateTimestamp = Date.now();

    // Check if phase is complete
    if (this.state.remainingSeconds <= 0) {
      this.handlePhaseComplete();
    }
  }

  /**
   * Handle PHASE_COMPLETE action
   */
  private handlePhaseComplete(): void {
    const currentPhase = this.state.phase;

    // Track work session completion
    if (currentPhase === 'WORK') {
      this.state.completedSessions += 1;
      this.state.totalCompletedSessions += 1;
    }

    // Reset session counter after long break
    if (currentPhase === 'LONG_BREAK') {
      this.state.completedSessions = 0;
    }

    // Transition to next phase
    const nextPhase = this.getNextPhase(currentPhase);
    this.transitionToPhase(nextPhase);
  }

  /**
   * Handle UPDATE_CONFIG action
   */
  private handleUpdateConfig(config: Partial<TimerConfig>): void {
    this.config = validateTimerConfig({ ...this.config, ...config });

    // If currently in a phase, update remaining time to match new duration
    if (this.state.phase !== 'IDLE') {
      const newDuration = this.getPhaseDuration(this.state.phase) * 60;
      // Only update if timer hasn't started counting yet
      if (this.state.remainingSeconds === 0 || !this.state.isRunning) {
        this.state.remainingSeconds = newDuration;
      }
    }
  }

  /**
   * Transition to a new phase
   */
  private transitionToPhase(phase: PomodoroPhase): void {
    this.state.phase = phase;
    this.state.remainingSeconds = this.getPhaseDuration(phase) * 60; // Convert minutes to seconds
    this.state.lastUpdateTimestamp = Date.now();
  }

  /**
   * Get duration for a given phase (in minutes)
   */
  private getPhaseDuration(phase: PomodoroPhase): number {
    switch (phase) {
      case 'WORK':
        return this.config.workDuration;
      case 'SHORT_BREAK':
        return this.config.shortBreakDuration;
      case 'LONG_BREAK':
        return this.config.longBreakDuration;
      case 'IDLE':
        return 0;
    }
  }

  /**
   * Determine next phase based on current phase and session count
   */
  private getNextPhase(currentPhase: PomodoroPhase): PomodoroPhase {
    switch (currentPhase) {
      case 'IDLE':
        return 'WORK';

      case 'WORK':
        // After completing a work session, check if it's time for long break
        if (this.state.completedSessions >= this.config.sessionsBeforeLongBreak) {
          return 'LONG_BREAK';
        }
        return 'SHORT_BREAK';

      case 'SHORT_BREAK':
        return 'WORK';

      case 'LONG_BREAK':
        return 'WORK';

      default:
        return 'IDLE';
    }
  }

  /**
   * Start the tick interval
   */
  private startTicking(): void {
    if (this.intervalId !== null) {
      return; // Already ticking
    }

    this.intervalId = setInterval(() => {
      this.dispatch({ type: 'TICK', deltaSeconds: 1 });
    }, 1000); // Tick every second
  }

  /**
   * Stop the tick interval
   */
  private stopTicking(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Serialize timer state for persistence
   */
  public serialize(): string {
    return JSON.stringify({
      state: this.state,
      config: this.config,
    });
  }

  /**
   * Restore timer from serialized state
   */
  public static deserialize(serialized: string): PomodoroTimer {
    const data = JSON.parse(serialized);
    return new PomodoroTimer(data.config, data.state);
  }

  /**
   * Calculate time elapsed since last update (for resume after page reload)
   */
  public syncWithRealTime(): void {
    if (!this.state.isRunning || this.state.isPaused) {
      return;
    }

    const now = Date.now();
    const elapsedMs = now - this.state.lastUpdateTimestamp;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    if (elapsedSeconds > 0) {
      this.dispatch({ type: 'TICK', deltaSeconds: elapsedSeconds });
    }
  }

  /**
   * Cleanup - stop timer and clear all listeners
   */
  public destroy(): void {
    this.stopTicking();
    this.listeners.clear();
  }
}
