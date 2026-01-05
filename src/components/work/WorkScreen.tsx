/**
 * WorkScreen Component
 * Main UI for WORK phase - shows game canvas and event log
 */

import { Component, createSignal, onMount, onCleanup } from 'solid-js';
import { GameCanvas } from './GameCanvas';
import { EventLog } from './EventLog';
import { ToastContainer } from '../common/Toast';
import { GameEvent } from '@/core/types/events';
import { VisualCueRenderer } from '@/rendering/VisualCueRenderer';

interface WorkScreenProps {
  /** Events from current session */
  events?: GameEvent[];

  /** Visual cue renderer instance (optional) */
  visualCueRenderer?: VisualCueRenderer;

  /** Callback when an event is generated */
  onEventGenerated?: (event: GameEvent) => void;

  /** Custom class name */
  class?: string;
}

/**
 * WorkScreen component
 * Combines game canvas, event log, and toast notifications
 */
export const WorkScreen: Component<WorkScreenProps> = (props) => {
  const [events] = createSignal<GameEvent[]>(props.events || []);
  const [visualCueRenderer] = createSignal<VisualCueRenderer>(
    props.visualCueRenderer || new VisualCueRenderer()
  );

  // Subscribe to event changes
  onMount(() => {
    // Listen for new events
    // Note: Event handling is done via props, this is a placeholder for future implementation
    // const handleNewEvent = (event: GameEvent) => {
    //   setEvents((prev) => [...prev, event]);
    //   showEventToast(event);
    //   if (event.visualCue) {
    //     visualCueRenderer().addCue(event.visualCue);
    //   }
    //   props.onEventGenerated?.(event);
    // };

    // Cleanup
    onCleanup(() => {
      // Clear visual cues
      visualCueRenderer().clear();
    });
  });

  return (
    <div class={`work-screen flex flex-col h-full ${props.class || ''}`}>
      {/* Toast notifications for important events */}
      <ToastContainer position="top-right" maxToasts={3} />

      {/* Main content area */}
      <div class="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
        {/* Game Canvas */}
        <div class="flex-1 flex items-center justify-center bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <GameCanvas class="w-full h-full" />
        </div>

        {/* Event Log (right side on desktop, bottom on mobile) */}
        <div class="w-full lg:w-80 flex flex-col min-h-0">
          <EventLog
            events={events()}
            maxEvents={20}
            autoScroll={true}
            class="flex-1 min-h-[200px] lg:min-h-0"
          />
        </div>
      </div>

      {/* Bottom status bar (optional) */}
      <div class="px-4 py-2 border-t border-gray-700 bg-gray-900/50">
        <div class="flex items-center justify-between text-sm text-gray-400">
          <span>WORK Phase - Stay Focused</span>
          <span>{events().length} events</span>
        </div>
      </div>
    </div>
  );
};

export default WorkScreen;
