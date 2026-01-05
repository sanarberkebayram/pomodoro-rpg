/**
 * Pomodoro Timer System - Public API
 *
 * Exports the timer state machine and related types for use throughout the application.
 */

export { PomodoroTimer } from './PomodoroTimer';
export type { PomodoroPhase, TimerState, TimerConfig, TimerAction } from './types';
export { DEFAULT_TIMER_CONFIG } from './types';
export { validateTimerConfig } from '../../data/config/timerConfig';
