import { Component, createMemo } from 'solid-js';
import type { PomodoroPhase } from '../../systems/pomodoro/types';

interface PhaseIndicatorProps {
  phase: PomodoroPhase;
  isRunning: boolean;
}

/**
 * PhaseIndicator - Shows current phase (Work/Break)
 *
 * Displays the current Pomodoro phase with appropriate visual styling.
 * Mobile-first design with clear, high-contrast indicators.
 */
export const PhaseIndicator: Component<PhaseIndicatorProps> = (props) => {
  /**
   * Get display text for current phase
   */
  const phaseText = createMemo(() => {
    switch (props.phase) {
      case 'WORK':
        return 'Work Time';
      case 'SHORT_BREAK':
        return 'Short Break';
      case 'LONG_BREAK':
        return 'Long Break';
      case 'IDLE':
        return 'Ready to Start';
    }
  });

  /**
   * Get description text for current phase
   */
  const phaseDescription = createMemo(() => {
    switch (props.phase) {
      case 'WORK':
        return 'Focus on your task';
      case 'SHORT_BREAK':
        return 'Quick rest and recovery';
      case 'LONG_BREAK':
        return 'Extended break time';
      case 'IDLE':
        return 'Start your Pomodoro session';
    }
  });

  /**
   * Get styling classes based on phase
   */
  const phaseStyles = createMemo(() => {
    const baseClasses = 'px-6 py-3 rounded-2xl font-semibold text-lg transition-all duration-300';

    switch (props.phase) {
      case 'WORK':
        return {
          container: `${baseClasses} bg-blue-600 text-white shadow-lg shadow-blue-500/50`,
          icon: '💼',
          iconBg: 'bg-blue-500',
        };
      case 'SHORT_BREAK':
        return {
          container: `${baseClasses} bg-green-600 text-white shadow-lg shadow-green-500/50`,
          icon: '☕',
          iconBg: 'bg-green-500',
        };
      case 'LONG_BREAK':
        return {
          container: `${baseClasses} bg-emerald-600 text-white shadow-lg shadow-emerald-500/50`,
          icon: '🎮',
          iconBg: 'bg-emerald-500',
        };
      case 'IDLE':
      default:
        return {
          container: `${baseClasses} bg-gray-200 text-gray-700 shadow-md`,
          icon: '⏸️',
          iconBg: 'bg-gray-300',
        };
    }
  });

  return (
    <div class="flex flex-col items-center gap-3 w-full max-w-md mx-auto px-4">
      {/* Phase badge with icon */}
      <div class="flex items-center gap-3">
        {/* Icon circle */}
        <div
          class={`
            flex
            items-center
            justify-center
            w-12
            h-12
            rounded-full
            text-2xl
            ${phaseStyles().iconBg}
            shadow-md
          `}
          aria-hidden="true"
        >
          {phaseStyles().icon}
        </div>

        {/* Phase name badge */}
        <div class={phaseStyles().container} role="status" aria-live="polite">
          {phaseText()}
        </div>
      </div>

      {/* Phase description */}
      <p
        class="
          text-center
          text-sm
          text-gray-600
          font-medium
          max-w-xs
        "
      >
        {phaseDescription()}
      </p>

      {/* Running indicator */}
      {props.isRunning && props.phase !== 'IDLE' && (
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <span
            class="
              w-2
              h-2
              bg-green-500
              rounded-full
              animate-pulse
            "
            aria-hidden="true"
          />
          <span>Timer Running</span>
        </div>
      )}

      {/* Work phase lock indicator */}
      {props.phase === 'WORK' && props.isRunning && (
        <div
          class="
            flex
            items-center
            gap-2
            px-3
            py-1.5
            bg-orange-50
            border
            border-orange-200
            rounded-lg
            text-xs
            text-orange-700
            font-medium
          "
          role="note"
        >
          <span aria-hidden="true">🔒</span>
          <span>Controls locked - stay focused!</span>
        </div>
      )}
    </div>
  );
};
