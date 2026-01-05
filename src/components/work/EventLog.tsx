/**
 * EventLog Component
 * Displays a scrolling log of events that occur during WORK phase
 */

import { Component, For, createEffect, createSignal } from 'solid-js';
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
        return 'text-gray-400 border-gray-600';
      case 'info':
        return 'text-blue-300 border-blue-600';
      case 'warning':
        return 'text-yellow-300 border-yellow-600';
      case 'critical':
        return 'text-red-300 border-red-600';
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
      class={`event-log flex flex-col bg-gray-900/90 rounded-lg border border-gray-700 ${
        props.class || ''
      }`}
    >
      {/* Header */}
      <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <h3 class="text-sm font-semibold text-gray-300">Event Log</h3>
        <span class="text-xs text-gray-500">
          {displayedEvents().length} / {maxEvents()} events
        </span>
      </div>

      {/* Event List */}
      <div
        ref={logContainer}
        class="flex-1 overflow-y-auto p-2 space-y-1 min-h-0"
        style={{ 'max-height': '400px' }}
      >
        <For
          each={displayedEvents()}
          fallback={
            <div class="flex items-center justify-center h-full text-gray-500 text-sm">
              No events yet...
            </div>
          }
        >
          {(event) => (
            <div
              class={`event-entry flex items-start gap-2 p-2 rounded border-l-2 transition-colors hover:bg-gray-800/50 cursor-default ${getSeverityClasses(
                event.severity
              )}`}
              onMouseEnter={() => setHoveredEventId(event.id)}
              onMouseLeave={() => setHoveredEventId(null)}
            >
              {/* Severity Icon */}
              <div class="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <span class="text-base">{getSeverityIcon(event.severity)}</span>
              </div>

              {/* Event Content */}
              <div class="flex-1 min-w-0">
                {/* Message */}
                <p class="text-sm leading-tight break-words">{event.message}</p>

                {/* Timestamp and Effects (on hover) */}
                <div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatTime(event.timestamp)}</span>
                  {hoveredEventId() === event.id && (
                    <>
                      <span>•</span>
                      <span class="text-gray-400">{getEffectsSummary(event)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Footer (optional - shows if log is full) */}
      {displayedEvents().length >= maxEvents() && (
        <div class="px-4 py-2 border-t border-gray-700 text-xs text-gray-500 text-center">
          Showing latest {maxEvents()} events
        </div>
      )}
    </div>
  );
};

export default EventLog;
