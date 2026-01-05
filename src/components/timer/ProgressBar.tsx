import { Component, createMemo } from 'solid-js';
import type { PomodoroPhase, TimerConfig } from '../../systems/pomodoro/types';

interface ProgressBarProps {
  phase: PomodoroPhase;
  remainingSeconds: number;
  config: TimerConfig;
}

/**
 * ProgressBar - Visual progress through session
 *
 * Displays progress as a horizontal bar showing elapsed time.
 * Mobile-first design with smooth animations and phase-specific colors.
 */
export const ProgressBar: Component<ProgressBarProps> = (props) => {
  /**
   * Get total duration for current phase (in seconds)
   */
  const totalDuration = createMemo(() => {
    switch (props.phase) {
      case 'WORK':
        return props.config.workDuration * 60;
      case 'SHORT_BREAK':
        return props.config.shortBreakDuration * 60;
      case 'LONG_BREAK':
        return props.config.longBreakDuration * 60;
      case 'IDLE':
      default:
        return 0;
    }
  });

  /**
   * Calculate progress percentage (0-100)
   */
  const progressPercent = createMemo(() => {
    const total = totalDuration();
    if (total === 0) return 0;

    const elapsed = total - props.remainingSeconds;
    const percent = (elapsed / total) * 100;

    return Math.max(0, Math.min(100, percent));
  });

  /**
   * Get color classes based on phase
   */
  const colorClasses = createMemo(() => {
    switch (props.phase) {
      case 'WORK':
        return {
          bar: 'bg-blue-600',
          glow: 'shadow-blue-500/50',
          track: 'bg-blue-100',
        };
      case 'SHORT_BREAK':
        return {
          bar: 'bg-green-600',
          glow: 'shadow-green-500/50',
          track: 'bg-green-100',
        };
      case 'LONG_BREAK':
        return {
          bar: 'bg-emerald-600',
          glow: 'shadow-emerald-500/50',
          track: 'bg-emerald-100',
        };
      case 'IDLE':
      default:
        return {
          bar: 'bg-gray-400',
          glow: 'shadow-gray-500/50',
          track: 'bg-gray-100',
        };
    }
  });

  /**
   * Format remaining time for accessibility
   */
  const ariaLabel = createMemo(() => {
    const minutes = Math.floor(props.remainingSeconds / 60);
    const seconds = props.remainingSeconds % 60;
    const percent = Math.round(progressPercent());

    return `${percent}% complete. ${minutes} minutes and ${seconds} seconds remaining`;
  });

  return (
    <div class="w-full max-w-2xl mx-auto px-4">
      {/* Progress bar container */}
      <div class="flex flex-col gap-2">
        {/* Progress bar track */}
        <div
          class={`
            relative
            w-full
            h-4
            rounded-full
            overflow-hidden
            ${colorClasses().track}
            shadow-inner
          `}
          role="progressbar"
          aria-valuenow={progressPercent()}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={ariaLabel()}
        >
          {/* Progress bar fill */}
          <div
            class={`
              h-full
              rounded-full
              transition-all
              duration-1000
              ease-linear
              ${colorClasses().bar}
              shadow-lg
              ${colorClasses().glow}
            `}
            style={{
              width: `${progressPercent()}%`,
            }}
          >
            {/* Shimmer effect */}
            <div
              class="
                absolute
                inset-0
                bg-gradient-to-r
                from-transparent
                via-white/20
                to-transparent
                animate-shimmer
              "
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Progress text and milestones */}
        <div class="flex items-center justify-between text-xs text-gray-600 font-medium px-1">
          {/* Progress percentage */}
          <span>{Math.round(progressPercent())}%</span>

          {/* Milestone markers */}
          <div class="flex items-center gap-1">
            {props.phase !== 'IDLE' && (
              <>
                <span
                  class={progressPercent() >= 25 ? 'text-current' : 'text-gray-300'}
                  aria-hidden="true"
                >
                  ●
                </span>
                <span
                  class={progressPercent() >= 50 ? 'text-current' : 'text-gray-300'}
                  aria-hidden="true"
                >
                  ●
                </span>
                <span
                  class={progressPercent() >= 75 ? 'text-current' : 'text-gray-300'}
                  aria-hidden="true"
                >
                  ●
                </span>
                <span
                  class={progressPercent() >= 100 ? 'text-current' : 'text-gray-300'}
                  aria-hidden="true"
                >
                  ✓
                </span>
              </>
            )}
          </div>

          {/* Time remaining */}
          <span>
            {Math.floor(props.remainingSeconds / 60)}:
            {String(props.remainingSeconds % 60).padStart(2, '0')} left
          </span>
        </div>
      </div>

      {/* Visual divider for session cycles */}
      {props.phase !== 'IDLE' && (
        <div class="flex items-center justify-center gap-2 mt-4">
          <div class="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300" />
          <span class="text-xs text-gray-500 font-medium">Phase Progress</span>
          <div class="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300" />
        </div>
      )}
    </div>
  );
};
