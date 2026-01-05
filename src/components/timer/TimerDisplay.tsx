import { Component, createMemo } from 'solid-js';
import type { TimerState } from '../../systems/pomodoro/types';

interface TimerDisplayProps {
  timerState: TimerState;
}

/**
 * TimerDisplay - Large countdown display
 *
 * Displays remaining time in MM:SS format with large, readable text.
 * Mobile-first design with high contrast and clear typography.
 */
export const TimerDisplay: Component<TimerDisplayProps> = (props) => {
  /**
   * Format seconds into MM:SS display
   */
  const formattedTime = createMemo(() => {
    const totalSeconds = props.timerState.remainingSeconds;
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
    return props.timerState.remainingSeconds < 60 && props.timerState.isRunning;
  });

  /**
   * Determine text color based on phase and state
   */
  const textColorClass = createMemo(() => {
    if (isCritical()) {
      return 'text-red-600';
    }

    switch (props.timerState.phase) {
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
      {props.timerState.isPaused && (
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
      {props.timerState.phase !== 'IDLE' && (
        <div
          class="
            mt-6
            text-sm
            text-gray-500
            font-medium
          "
          aria-label={`${props.timerState.completedSessions} of ${props.timerState.totalCompletedSessions} work sessions completed`}
        >
          Session {props.timerState.completedSessions + 1}
        </div>
      )}
    </div>
  );
};
