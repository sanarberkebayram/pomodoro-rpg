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
        return 'Quest Pursuit';
      case 'SHORT_BREAK':
        return 'Meditative Rest';
      case 'LONG_BREAK':
        return 'Deep Recuperation';
      case 'IDLE':
        return 'Standing Watch';
    }
  });


  /**
   * Get styling classes based on phase
   */
  const phaseStyles = createMemo(() => {
    switch (props.phase) {
      case 'WORK':
        return {
          container: 'bg-primary-500/10 border border-primary-500/20 text-primary-400',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
          icon: '⚔️',
          iconBg: 'bg-primary-500/20',
          label: 'text-primary-300 font-display',
        };
      case 'SHORT_BREAK':
        return {
          container: 'bg-accent/10 border border-accent/20 text-accent-light',
          glow: 'shadow-[0_0_20px_rgba(124,58,237,0.15)]',
          icon: '🍵',
          iconBg: 'bg-accent/20',
          label: 'text-accent-light font-display',
        };
      case 'LONG_BREAK':
        return {
          container: 'bg-blue-500/10 border border-blue-500/20 text-blue-400',
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
          icon: '🛌',
          iconBg: 'bg-blue-500/20',
          label: 'text-blue-300 font-display',
        };
      case 'IDLE':
      default:
        return {
          container: 'bg-white/5 border border-white/10 text-gray-400',
          glow: 'shadow-none',
          icon: '🛡️',
          iconBg: 'bg-white/5',
          label: 'text-gray-400 font-display',
        };
    }
  });

  return (
    <div class="flex flex-col items-center md:items-start">
      <div
        class={`flex items-center gap-3 px-3 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-md transition-all duration-500`}
        role="status"
        aria-live="polite"
      >
        <span class={`text-[8px] uppercase tracking-[0.3em] font-black ${phaseStyles().label}`}>{phaseText()}</span>
        <div class="h-1 w-1 rounded-full bg-primary-500 animate-pulse"></div>
      </div>
    </div>
  );
};
