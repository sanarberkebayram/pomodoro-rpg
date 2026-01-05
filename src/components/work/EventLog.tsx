/**
 * EventLog Component
 * Displays a scrolling log of events that occur during WORK phase
 */

import { Component, For, createEffect, createSignal, Show } from 'solid-js';
import { GameEvent } from '@/core/types/events';

interface EventLogProps {
  /** Array of events to display */
  events: GameEvent[];

  /** Maximum number of events to show */
  maxEvents?: number;

  /** Whether to auto-scroll to latest event */
  autoScroll?: boolean;

  /** Custom class name */
  class?: string;
}

/**
 * EventLog component
 * Shows a scrolling list of game events with color-coded severity
 */
export const EventLog: Component<EventLogProps> = (props) => {
  const maxEvents = () => props.maxEvents ?? 20;
  const autoScroll = () => props.autoScroll ?? true;

  let logContainer: HTMLDivElement | undefined;
  const [hoveredEventId, setHoveredEventId] = createSignal<string | null>(null);

  // Auto-scroll to bottom when new events are added
  createEffect(() => {
    if (autoScroll() && logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  });

  // Get only the latest N events
  const displayedEvents = () => {
    const events = props.events;
    const max = maxEvents();
    return events.length > max ? events.slice(-max) : events;
  };

  /**
   * Get severity color classes
   */
  const getSeverityClasses = (severity: GameEvent['severity']): string => {
    switch (severity) {
      case 'flavor':
        return 'text-gray-400 border-white/5';
      case 'info':
        return 'text-primary-300 border-primary-500/30 bg-primary-500/5';
      case 'warning':
        return 'text-warning border-warning/30 bg-warning/5';
      case 'critical':
        return 'text-danger border-danger/30 bg-danger/5';
    }
  };

  /**
   * Get severity icon
   */
  const getSeverityIcon = (severity: GameEvent['severity']): string => {
    switch (severity) {
      case 'flavor':
        return '·';
      case 'info':
        return 'ℹ';
      case 'warning':
        return '⚠';
      case 'critical':
        return '⚡';
    }
  };

  /**
   * Format timestamp to readable time
   */
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  /**
   * Get effects summary for tooltip
   */
  const getEffectsSummary = (event: GameEvent): string => {
    const effects = event.effects;
    const parts: string[] = [];

    if (effects.goldModifier) {
      const sign = effects.goldModifier > 0 ? '+' : '';
      parts.push(`${sign}${effects.goldModifier} Gold`);
    }

    if (effects.healthModifier) {
      const sign = effects.healthModifier > 0 ? '+' : '';
      parts.push(`${sign}${effects.healthModifier} HP`);
    }

    if (effects.materialsModifier) {
      const sign = effects.materialsModifier > 0 ? '+' : '';
      parts.push(`${sign}${effects.materialsModifier} Materials`);
    }

    if (effects.successChanceModifier) {
      const sign = effects.successChanceModifier > 0 ? '+' : '';
      parts.push(`${sign}${effects.successChanceModifier.toFixed(1)}% Success`);
    }

    if (effects.durabilityDamage) {
      parts.push(`-${effects.durabilityDamage} Durability`);
    }

    if (effects.extraChests) {
      parts.push(`+${effects.extraChests} Chest${effects.extraChests > 1 ? 's' : ''}`);
    }

    if (effects.xpModifier) {
      const sign = effects.xpModifier > 0 ? '+' : '';
      parts.push(`${sign}${effects.xpModifier} XP`);
    }

    return parts.length > 0 ? parts.join(', ') : 'No effects';
  };

  return (
    <div
      class={`event-log flex flex-col glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-2xl ${props.class || ''
        }`}
    >
      {/* Header */}
      <div class="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-primary-500/5 backdrop-blur-md">
        <h3 class="text-xs font-display font-black text-primary-400 tracking-[0.2em] uppercase">Expedition Chronicle</h3>
        <span class="text-[9px] font-mono font-black text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full border border-primary-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)] uppercase">
          {displayedEvents().length} Echoes Recorded
        </span>
      </div>

      {/* Event List */}
      <div
        ref={logContainer}
        class="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 custom-scrollbar"
        style={{ 'max-height': '600px' }}
      >
        <For
          each={displayedEvents()}
          fallback={
            <div class="flex flex-col items-center justify-center h-full opacity-30 py-16">
              <div class="text-5xl mb-4 animate-pulse drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">🔮</div>
              <div class="text-[10px] font-display font-black uppercase tracking-[0.2em] text-gray-500 italic">Listening to spirit echoes...</div>
            </div>
          }
        >
          {(event) => (
            <div
              class={`event-entry flex items-start gap-4 p-4 rounded-2xl border-l-[3px] transition-all duration-300 hover:bg-white/5 cursor-default ${getSeverityClasses(
                event.severity
              )}`}
              onMouseEnter={() => setHoveredEventId(event.id)}
              onMouseLeave={() => setHoveredEventId(null)}
            >
              {/* Severity Icon */}
              <div class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-xl bg-black/40 border border-white/5 text-sm shadow-inner">
                <span>{getSeverityIcon(event.severity)}</span>
              </div>

              {/* Event Content */}
              <div class="flex-1 min-w-0">
                {/* Message */}
                <p class="text-[13px] font-medium leading-relaxed tracking-wide text-gray-200 font-sans">{event.message}</p>

                {/* Timestamp and Effects (on hover) */}
                <div class="mt-2.5 flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest">
                  <span class="text-gray-600 font-bold">{formatTime(event.timestamp)}</span>
                  <Show when={hoveredEventId() === event.id}>
                    <div class="flex items-center gap-2 animate-fade-in">
                      <span class="w-1 h-1 rounded-full bg-primary-500/30"></span>
                      <span class="text-primary-400 font-black">{getEffectsSummary(event)}</span>
                    </div>
                  </Show>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Footer (optional - shows if log is full) */}
      {displayedEvents().length >= maxEvents() && (
        <div class="px-5 py-3 border-t border-white/5 text-[9px] font-display font-black text-gray-600 text-center uppercase tracking-[0.3em] bg-black/40">
          Eternal Chronicle Full • Spirit Limit Reached
        </div>
      )}
    </div>
  );
};

export default EventLog;
