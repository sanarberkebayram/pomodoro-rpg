/**
 * Pomodoro Timer Types
 * Defines the state machine phases and timer configuration
 */

/**
 * Phases in the Pomodoro cycle
 * IDLE → WORK → SHORT_BREAK → WORK → ... → LONG_BREAK → (repeat)
 */
export type PomodoroPhase = 'IDLE' | 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

/**
 * Timer state for persistence and UI
 */
export interface TimerState {
  /** Current phase in the Pomodoro cycle */
  phase: PomodoroPhase;

  /** Remaining time in seconds */
  remainingSeconds: number;

  /** Whether the timer is actively running */
  isRunning: boolean;

  /** Number of completed work sessions since last long break */
  completedSessions: number;

  /** Total completed work sessions (all-time) */
  totalCompletedSessions: number;

  /** Timestamp when timer was last updated (for resume) */
  lastUpdateTimestamp: number;

  /** Whether the timer is paused (emergency pause only during WORK) */
  isPaused: boolean;
}

/**
 * User-configurable timer durations (in minutes)
 */
export interface TimerConfig {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

/**
 * Default timer configuration following standard Pomodoro technique
 */
export const DEFAULT_TIMER_CONFIG: TimerConfig = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

/**
 * Timer actions for state transitions
 */
export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SKIP' }
  | { type: 'RESET' }
  | { type: 'TICK'; deltaSeconds: number }
  | { type: 'PHASE_COMPLETE' }
  | { type: 'UPDATE_CONFIG'; config: Partial<TimerConfig> };
