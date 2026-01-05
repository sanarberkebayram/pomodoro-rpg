import { Component, Show, createMemo } from 'solid-js';
import type { PomodoroPhase } from '../../systems/pomodoro/types';

type TimerDisplayProps = {
  remainingSeconds: number;
  phase: PomodoroPhase;
  isRunning: boolean;
  isPaused: boolean;
  completedSessions?: number;
  totalCompletedSessions?: number;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onSkip?: () => void;
};

/**
 * TimerDisplay - Large countdown display
 *
 * Displays remaining time in MM:SS format with large, readable text.
 * Modern glassmorphism design.
 */
export const TimerDisplay: Component<TimerDisplayProps> = (props) => {
  /**
   * Format seconds into MM:SS display
   */
  const formattedTime = createMemo(() => {
    const totalSeconds = props.remainingSeconds;
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
    return props.remainingSeconds < 60 && props.isRunning;
  });

  /**
   * Determine text color based on phase and state
   */
  const textColorClass = createMemo(() => {
    if (isCritical()) {
      return 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]';
    }

    switch (props.phase) {
      case 'WORK':
        return 'text-primary-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]';
      case 'SHORT_BREAK':
      case 'LONG_BREAK':
        return 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]';
      case 'IDLE':
      default:
        return 'text-gray-300';
    }
  });

  return (
    <div class="flex flex-col items-center w-full max-w-[95vw] md:max-w-md mx-auto">
      <div
        class="relative w-full glass-panel px-4 py-4 md:px-10 md:py-6 flex flex-col items-center justify-center bg-black/40 border-primary-500/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] rounded-3xl overflow-hidden group transition-all duration-500 hover:border-primary-500/30"
      >
        {/* Subtle Background Effect */}
        <div class="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none"></div>

        {/* Phase Indicator Label */}
        <div class="relative z-20 mb-1 flex items-center gap-2">
          <span class={`text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-black ${props.phase === 'WORK' ? 'text-primary-500' :
            props.phase === 'IDLE' ? 'text-gray-500' : 'text-amber-500'
            }`}>
            {props.phase === 'WORK' ? 'Quest Pursuit' :
              props.phase === 'SHORT_BREAK' ? 'Meditative Rest' :
                props.phase === 'LONG_BREAK' ? 'Deep Recuperation' : 'Engine Standby'}
          </span>
          <div class={`w-1 h-1 rounded-full animate-pulse ${props.phase === 'WORK' ? 'bg-primary-500' : 'bg-amber-500'
            }`}></div>
        </div>

        {/* Main time display */}
        <div
          class={`
            text-6xl md:text-7xl
            font-bold
            font-mono
            tabular-nums
            tracking-[0.1em]
            transition-all
            duration-500
            relative z-10
            leading-none
            ${textColorClass()}
            ${props.isPaused ? 'opacity-40 scale-95 blur-[2px]' : 'opacity-100 scale-100'}
          `}
          aria-live="polite"
          aria-atomic="true"
          role="timer"
        >
          {formattedTime()}
        </div>

        {/* Integrated Controls (Overlay/Inside) */}
        <div class="mt-4 flex items-center gap-4 relative z-20">
          <Show when={props.phase === 'IDLE'}>
            <button
              onClick={props.onStart}
              class="btn-primary px-8 py-2 rounded-full text-sm font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              Start Expedition
            </button>
          </Show>

          <Show when={props.phase !== 'IDLE'}>
            <div class="flex items-center gap-3">
              <Show when={!props.isPaused}>
                <button
                  onClick={props.onPause}
                  class="w-10 h-10 rounded-full border border-primary-500/20 bg-primary-500/5 flex items-center justify-center text-primary-400 hover:bg-primary-500/20 transition-all"
                  title="Pause Focus"
                >
                  <span class="text-lg">⏸</span>
                </button>
              </Show>

              <Show when={props.isPaused}>
                <button
                  onClick={props.onResume}
                  class="btn-primary w-12 h-12 !p-0 rounded-full flex items-center justify-center text-xl shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-pulse"
                  title="Resume Expedition"
                >
                  ▶
                </button>
              </Show>

              <button
                onClick={props.onSkip}
                class="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                title="Skip Phase"
              >
                <span class="text-sm">⏭</span>
              </button>
            </div>
          </Show>
        </div>

        {/* Status Indicator Bar (Bottom of Timer) */}
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <div
            class="h-full bg-primary-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            style={{ width: `${(props.remainingSeconds / (props.phase === 'WORK' ? 1500 : 300)) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
