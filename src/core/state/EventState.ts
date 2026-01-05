/**
 * EventState - State management for game events
 * Manages events during work sessions and provides reactive state
 */

import { createStore, SetStoreFunction } from 'solid-js/store';
import { GameEvent, EventLogEntry } from '@/core/types/events';

/**
 * Event state structure
 */
export interface EventState {
  /** Events from current work session */
  currentSessionEvents: GameEvent[];

  /** Event log entries (lightweight for display) */
  eventLog: EventLogEntry[];

  /** Maximum log entries to keep */
  maxLogEntries: number;

  /** Total events generated (all time) */
  totalEventsGenerated: number;

  /** Statistics by severity */
  eventStatistics: {
    flavor: number;
    info: number;
    warning: number;
    critical: number;
  };

  /** Last event timestamp */
  lastEventTimestamp: number | null;
}

/**
 * Initial event state
 */
export const createInitialEventState = (): EventState => ({
  currentSessionEvents: [],
  eventLog: [],
  maxLogEntries: 100,
  totalEventsGenerated: 0,
  eventStatistics: {
    flavor: 0,
    info: 0,
    warning: 0,
    critical: 0,
  },
  lastEventTimestamp: null,
});

/**
 * Create event state store
 */
export function createEventState() {
  const [state, setState] = createStore<EventState>(createInitialEventState());

  return { state, setState };
}

/**
 * Event state actions
 */
export class EventStateActions {
  constructor(
    private state: EventState,
    private setState: SetStoreFunction<EventState>
  ) {}

  /**
   * Add an event to the current session
   */
  public addEvent(event: GameEvent): void {
    // Add to current session
    this.setState('currentSessionEvents', (events) => [...events, event]);

    // Add to log (convert to lightweight log entry)
    const logEntry: EventLogEntry = {
      id: event.id,
      timestamp: event.timestamp,
      message: event.message,
      severity: event.severity,
      category: event.category,
      effectsSummary: this.getEffectsSummary(event),
    };

    this.setState('eventLog', (log) => {
      const newLog = [...log, logEntry];
      // Keep only the last N entries
      if (newLog.length > this.state.maxLogEntries) {
        return newLog.slice(-this.state.maxLogEntries);
      }
      return newLog;
    });

    // Update statistics
    this.setState('eventStatistics', event.severity, (count) => count + 1);
    this.setState('totalEventsGenerated', (count) => count + 1);
    this.setState('lastEventTimestamp', event.timestamp);
  }

  /**
   * Clear current session events
   */
  public clearSessionEvents(): void {
    this.setState('currentSessionEvents', []);
  }

  /**
   * Mark event as acknowledged
   */
  public acknowledgeEvent(eventId: string): void {
    this.setState('currentSessionEvents', (event) => event.id === eventId, 'acknowledged', true);
  }

  /**
   * Get events from current session
   */
  public getCurrentSessionEvents(): GameEvent[] {
    return this.state.currentSessionEvents;
  }

  /**
   * Get event log entries
   */
  public getEventLog(limit?: number): EventLogEntry[] {
    if (limit) {
      return this.state.eventLog.slice(-limit);
    }
    return this.state.eventLog;
  }

  /**
   * Get event statistics
   */
  public getStatistics() {
    return {
      total: this.state.totalEventsGenerated,
      bySeverity: this.state.eventStatistics,
    };
  }

  /**
   * Clear all event data (for reset)
   */
  public reset(): void {
    this.setState(createInitialEventState());
  }

  /**
   * Generate effects summary string
   */
  private getEffectsSummary(event: GameEvent): string {
    const effects = event.effects;
    const parts: string[] = [];

    if (effects.goldModifier) {
      const sign = effects.goldModifier > 0 ? '+' : '';
      parts.push(`${sign}${effects.goldModifier}g`);
    }

    if (effects.healthModifier) {
      const sign = effects.healthModifier > 0 ? '+' : '';
      parts.push(`${sign}${effects.healthModifier} HP`);
    }

    if (effects.materialsModifier) {
      const sign = effects.materialsModifier > 0 ? '+' : '';
      parts.push(`${sign}${effects.materialsModifier}m`);
    }

    if (effects.successChanceModifier) {
      const sign = effects.successChanceModifier > 0 ? '+' : '';
      parts.push(`${sign}${effects.successChanceModifier.toFixed(1)}%`);
    }

    if (effects.durabilityDamage) {
      parts.push(`-${effects.durabilityDamage}dur`);
    }

    if (effects.extraChests) {
      parts.push(`+${effects.extraChests}chest`);
    }

    if (effects.xpModifier) {
      const sign = effects.xpModifier > 0 ? '+' : '';
      parts.push(`${sign}${effects.xpModifier}xp`);
    }

    return parts.join(', ');
  }
}

/**
 * Helper to create event state with actions
 */
export function createEventStateWithActions() {
  const { state, setState } = createEventState();
  const actions = new EventStateActions(state, setState);

  return {
    state,
    setState,
    actions,
  };
}
