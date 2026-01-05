import type { TimerConfig } from '../../systems/pomodoro/types';
import { DEFAULT_TIMER_CONFIG } from '../../systems/pomodoro/types';

/**
 * Validate timer configuration values
 */
export function validateTimerConfig(config: Partial<TimerConfig>): TimerConfig {
  const workDuration = config.workDuration ?? DEFAULT_TIMER_CONFIG.workDuration;
  const shortBreakDuration = config.shortBreakDuration ?? DEFAULT_TIMER_CONFIG.shortBreakDuration;
  const longBreakDuration = config.longBreakDuration ?? DEFAULT_TIMER_CONFIG.longBreakDuration;
  const sessionsBeforeLongBreak =
    config.sessionsBeforeLongBreak ?? DEFAULT_TIMER_CONFIG.sessionsBeforeLongBreak;

  if (workDuration < 1 || workDuration > 60) {
    throw new Error('Work duration must be between 1 and 60 minutes');
  }

  if (shortBreakDuration < 1 || shortBreakDuration > 30) {
    throw new Error('Short break duration must be between 1 and 30 minutes');
  }

  if (longBreakDuration < 1 || longBreakDuration > 60) {
    throw new Error('Long break duration must be between 1 and 60 minutes');
  }

  if (sessionsBeforeLongBreak < 1 || sessionsBeforeLongBreak > 10) {
    throw new Error('Sessions before long break must be between 1 and 10');
  }

  return {
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsBeforeLongBreak,
  };
}
