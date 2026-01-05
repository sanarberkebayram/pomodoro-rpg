import { Component, createMemo } from 'solid-js';
import type { PomodoroPhase, TimerState } from '../../systems/pomodoro/types';

type TimerDisplayProps =
  | {
      timerState: TimerState;
    }
  | {
      remainingSeconds: number;
      phase: PomodoroPhase;
      isRunning: boolean;
      isPaused: boolean;
      completedSessions?: number;
      totalCompletedSessions?: number;
    };

/**
 * TimerDisplay - Large countdown display
 *
 * Displays remaining time in MM:SS format with large, readable text.
 * Mobile-first design with high contrast and clear typography.
 */
export const TimerDisplay: Component<TimerDisplayProps> = (props) => {
  const resolvedState = createMemo<TimerState>(() => {
    if ('timerState' in props) {
      return props.timerState;
    }

    return {
      phase: props.phase,
      remainingSeconds: props.remainingSeconds,
      isRunning: props.isRunning,
      isPaused: props.isPaused,
      completedSessions: props.completedSessions ?? 0,
      totalCompletedSessions: props.totalCompletedSessions ?? 0,
      lastUpdateTimestamp: Date.now(),
    };
  });

  /**
   * Format seconds into MM:SS display
   */
  const formattedTime = createMemo(() => {
    const totalSeconds = resolvedState().remainingSeconds;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    return `${mm}:${ss}`;
  });

  /**
   * Determine if timer is in critical state (< 1 minute remaining)
   */
  const isCritical = createMemo(() => {
    return resolvedState().remainingSeconds < 60 && resolvedState().isRunning;
  });

  /**
   * Determine text color based on phase and state
   */
  const textColorClass = createMemo(() => {
    if (isCritical()) {
      return 'text-red-600';
    }

    switch (resolvedState().phase) {
      case 'WORK':
        return 'text-blue-600';
      case 'SHORT_BREAK':
      case 'LONG_BREAK':
        return 'text-green-600';
      case 'IDLE':
      default:
        return 'text-gray-600';
    }
  });

  return (
    <div class="flex flex-col items-center justify-center p-4">
      {/* Main time display */}
      <div
        class={`
          text-8xl
          font-bold
          font-mono
          tabular-nums
          tracking-tight
          transition-colors
          duration-300
          ${textColorClass()}
        `}
        aria-live="polite"
        aria-atomic="true"
        role="timer"
      >
        {formattedTime()}
      </div>

      {/* Pause indicator */}
      {resolvedState().isPaused && (
        <div
          class="
            mt-4
            px-4
            py-2
            bg-yellow-100
            text-yellow-800
            rounded-full
            text-sm
            font-semibold
            animate-pulse
          "
          role="status"
        >
          PAUSED
        </div>
      )}

      {/* Session counter - shows completed work sessions */}
      {resolvedState().phase !== 'IDLE' && (
        <div
          class="
            mt-6
            text-sm
            text-gray-500
            font-medium
          "
          aria-label={`${resolvedState().completedSessions} of ${resolvedState().totalCompletedSessions} work sessions completed`}
        >
          Session {resolvedState().completedSessions + 1}
        </div>
      )}
    </div>
  );
};
