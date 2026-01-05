/**
 * WorkScreen Component
 * Main UI for WORK phase - shows game canvas and event log
 */

import { Component, createSignal, onCleanup, createEffect } from 'solid-js';
import { GameCanvas } from './GameCanvas';
import { EventLog } from './EventLog';
import { GameEvent } from '@/core/types/events';
import { VisualCueRenderer } from '@/rendering/VisualCueRenderer';

interface WorkScreenProps {
  /** Events from current session */
  events?: GameEvent[];

  /** Visual cue renderer instance (optional) */
  visualCueRenderer?: VisualCueRenderer;

  /** Callback when a new event is added */
  onEventAdded?: (event: GameEvent) => void;

  /** Custom class name */
  class?: string;
}

/**
 * WorkScreen component
 * Combines game canvas, event log, and toast notifications
 */
export const WorkScreen: Component<WorkScreenProps> = (props) => {
  const [events, setEvents] = createSignal<GameEvent[]>(props.events || []);
  const [visualCueRenderer] = createSignal<VisualCueRenderer>(
    props.visualCueRenderer || new VisualCueRenderer()
  );

  // React to prop changes and update local events
  createEffect(() => {
    const propEvents = props.events || [];
    setEvents(propEvents);
  });

  // Watch for new events and show notifications/visual cues
  createEffect(() => {
    const currentEvents = events();
    if (currentEvents.length > 0) {
      const latestEvent = currentEvents[currentEvents.length - 1];

      // Add visual cue if present
      if (latestEvent.visualCue) {
        visualCueRenderer().addCue(latestEvent.visualCue);
      }

      // Notify parent
      props.onEventAdded?.(latestEvent);
    }
  });

  // Cleanup
  onCleanup(() => {
    visualCueRenderer().clear();
  });

  return (
    <div class={`work-screen flex flex-col h-full animate-fade-in ${props.class || ''}`}>
      {/* Main content area */}
      <div class="flex-1 flex flex-col lg:flex-row gap-6 p-4 min-h-0">
        {/* Game Canvas Container */}
        <div class="flex-1 flex flex-col min-h-0">
          <div class="flex-1 relative glass-panel rounded-3xl overflow-hidden border-white/10 shadow-2xl shadow-black/40">
            <div class="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none"></div>
            <GameCanvas class="w-full h-full" />
          </div>
        </div>

        {/* Event Log (right side on desktop, bottom on mobile) */}
        <div class="w-full lg:w-96 flex flex-col min-h-0">
          <EventLog
            events={events()}
            maxEvents={25}
            autoScroll={true}
            class="flex-1 min-h-[250px] lg:min-h-0 border-white/10"
          />
        </div>
      </div>

      {/* Bottom status bar */}
      <div class="px-8 py-5 bg-black/40 backdrop-blur-xl border border-primary-500/10 mt-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="relative flex items-center justify-center">
            <div class="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse"></div>
            <div class="absolute w-5 h-5 rounded-full border border-primary-500/30 animate-ping"></div>
          </div>
          <span class="text-[10px] font-display font-black tracking-[0.2em] text-primary-400 uppercase">Expedition in Progress</span>
        </div>

        <div class="flex items-center gap-8">
          <div class="flex items-center gap-3">
            <span class="text-[8px] text-gray-600 font-mono uppercase tracking-widest font-black">Spirit Echoes</span>
            <div class="px-3 py-1 bg-primary-500/5 border border-primary-500/10 rounded-lg">
              <span class="text-xs font-mono font-bold text-primary-400 leading-none">{events().length}</span>
            </div>
          </div>
          <div class="h-4 w-px bg-white/5 hidden md:block"></div>
          <span class="text-[9px] text-gray-500 font-display italic tracking-wide hidden sm:block">"Keep the hearth fire burning, Voyager."</span>
        </div>
      </div>
    </div>
  );
};

export default WorkScreen;
