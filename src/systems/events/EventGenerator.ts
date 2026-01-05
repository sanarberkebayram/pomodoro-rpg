/**
 * EventGenerator - Generates rate-limited events during WORK phase
 * Ensures ~1 event per 2 minutes to avoid breaking focus
 */

import { TaskType } from '@/core/types/tasks';
import {
  GameEvent,
  EventGenerationConfig,
  EventTemplate,
  EventEffects,
  EventConditionContext,
  EventSeverity,
} from '@/core/types/events';
import { EventGeneratorState, EventSelectionCriteria, EventGenerationResult } from './types';
import { EventBank } from './EventBank';

/**
 * Default event generation configuration
 * ~1 event per 2 minutes (120,000ms)
 */
export const DEFAULT_EVENT_CONFIG: EventGenerationConfig = {
  minTimeBetweenEvents: 90_000, // 1.5 minutes
  maxTimeBetweenEvents: 150_000, // 2.5 minutes
  maxEventsPerSession: 10,
  severityWeights: {
    flavor: 50, // 50% - Atmospheric, no real effect
    info: 30, // 30% - Small effects
    warning: 15, // 15% - Notable effects
    critical: 5, // 5% - Significant effects
  },
  enabled: true,
};

/**
 * EventGenerator class - manages event generation during work sessions
 */
export class EventGenerator {
  private eventBank: EventBank;
  private config: EventGenerationConfig;
  private state: EventGeneratorState;

  constructor(eventBank: EventBank, config: EventGenerationConfig = DEFAULT_EVENT_CONFIG) {
    this.eventBank = eventBank;
    this.config = config;
    this.state = this.createInitialState();
  }

  /**
   * Create initial generator state
   */
  private createInitialState(): EventGeneratorState {
    return {
      lastEventTimestamp: 0,
      currentSessionEvents: [],
      firedTemplateIds: new Set(),
      isPaused: false,
      nextEventTime: null,
    };
  }

  /**
   * Start a new work session
   */
  public startSession(): void {
    this.state.currentSessionEvents = [];
    this.state.firedTemplateIds = new Set();
    this.state.isPaused = false;
    this.state.lastEventTimestamp = Date.now();
    this.state.nextEventTime = this.calculateNextEventTime();
  }

  /**
   * End the current work session
   */
  public endSession(): GameEvent[] {
    const events = this.state.currentSessionEvents;
    this.state.currentSessionEvents = [];
    this.state.nextEventTime = null;
    return events;
  }

  /**
   * Pause event generation
   */
  public pause(): void {
    this.state.isPaused = true;
  }

  /**
   * Resume event generation
   */
  public resume(): void {
    this.state.isPaused = false;
  }

  /**
   * Check if it's time to generate an event and generate if appropriate
   */
  public tryGenerateEvent(
    taskType: TaskType,
    conditionContext: EventConditionContext
  ): EventGenerationResult {
    const now = Date.now();

    // Check if generation is enabled
    if (!this.config.enabled) {
      return {
        success: false,
        reason: 'Event generation is disabled',
        nextAttemptTime: now + 60_000, // Check again in 1 minute
      };
    }

    // Check if paused
    if (this.state.isPaused) {
      return {
        success: false,
        reason: 'Event generation is paused',
        nextAttemptTime: now + 10_000, // Check again in 10 seconds
      };
    }

    // Check if we've hit max events for session
    if (this.state.currentSessionEvents.length >= this.config.maxEventsPerSession) {
      return {
        success: false,
        reason: 'Maximum events per session reached',
        nextAttemptTime: now + 60_000,
      };
    }

    // Check if it's time for next event
    if (this.state.nextEventTime && now < this.state.nextEventTime) {
      return {
        success: false,
        reason: 'Not yet time for next event',
        nextAttemptTime: this.state.nextEventTime,
      };
    }

    // Select event severity based on weights
    const severity = this.selectSeverity();

    // Build selection criteria
    const criteria: EventSelectionCriteria = {
      taskType,
      preferredSeverity: severity,
      conditionContext,
      excludeTemplateIds: this.state.firedTemplateIds,
    };

    // Select template
    const template = this.eventBank.selectRandomTemplate(criteria);

    if (!template) {
      // No eligible templates found
      this.state.nextEventTime = this.calculateNextEventTime();
      return {
        success: false,
        reason: 'No eligible event templates found',
        nextAttemptTime: this.state.nextEventTime,
      };
    }

    // Generate event from template
    const event = this.createEventFromTemplate(template);

    // Update state
    this.state.currentSessionEvents.push(event);
    this.state.lastEventTimestamp = now;
    if (!template.repeatable) {
      this.state.firedTemplateIds.add(template.templateId);
    }
    this.state.nextEventTime = this.calculateNextEventTime();

    return {
      success: true,
      event,
      nextAttemptTime: this.state.nextEventTime,
    };
  }

  /**
   * Select event severity based on configured weights
   */
  private selectSeverity(): EventSeverity {
    const weights = this.config.severityWeights;
    const totalWeight = weights.flavor + weights.info + weights.warning + weights.critical;

    let random = Math.random() * totalWeight;

    if (random < weights.flavor) return 'flavor';
    random -= weights.flavor;

    if (random < weights.info) return 'info';
    random -= weights.info;

    if (random < weights.warning) return 'warning';

    return 'critical';
  }

  /**
   * Calculate when the next event should occur
   */
  private calculateNextEventTime(): number {
    const { minTimeBetweenEvents, maxTimeBetweenEvents } = this.config;
    const delay =
      minTimeBetweenEvents + Math.random() * (maxTimeBetweenEvents - minTimeBetweenEvents);
    return Date.now() + delay;
  }

  /**
   * Create a concrete event from a template
   */
  private createEventFromTemplate(template: EventTemplate): GameEvent {
    // Select random message from template
    const message = template.messages[Math.floor(Math.random() * template.messages.length)];

    // Generate effects with randomization
    const effects = this.generateEffects(template);

    // Replace placeholders in message
    const finalMessage = this.replacePlaceholders(message, effects);

    // Create visual cue if specified
    const visualCue = template.visualCue
      ? {
          ...template.visualCue,
          duration: template.visualCue.duration || 2000,
        }
      : undefined;

    return {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity: template.severity,
      category: template.category,
      timestamp: Date.now(),
      message: finalMessage,
      effects,
      visualCue,
      acknowledged: false,
    };
  }

  /**
   * Generate randomized effects from template ranges
   */
  private generateEffects(template: EventTemplate): EventEffects {
    const effects: EventEffects = {};
    const ranges = template.effects;

    if (ranges.successChanceModifier) {
      effects.successChanceModifier = this.randomInRange(
        ranges.successChanceModifier.min,
        ranges.successChanceModifier.max
      );
    }

    if (ranges.goldModifier) {
      effects.goldModifier = Math.floor(
        this.randomInRange(ranges.goldModifier.min, ranges.goldModifier.max)
      );
    }

    if (ranges.healthModifier) {
      effects.healthModifier = Math.floor(
        this.randomInRange(ranges.healthModifier.min, ranges.healthModifier.max)
      );
    }

    if (ranges.materialsModifier) {
      effects.materialsModifier = Math.floor(
        this.randomInRange(ranges.materialsModifier.min, ranges.materialsModifier.max)
      );
    }

    if (ranges.durabilityDamage) {
      effects.durabilityDamage = Math.floor(
        this.randomInRange(ranges.durabilityDamage.min, ranges.durabilityDamage.max)
      );
    }

    if (ranges.extraChests) {
      effects.extraChests = Math.floor(
        this.randomInRange(ranges.extraChests.min, ranges.extraChests.max)
      );
    }

    if (ranges.lootQualityModifier) {
      effects.lootQualityModifier = this.randomInRange(
        ranges.lootQualityModifier.min,
        ranges.lootQualityModifier.max
      );
    }

    if (ranges.xpModifier) {
      effects.xpModifier = Math.floor(
        this.randomInRange(ranges.xpModifier.min, ranges.xpModifier.max)
      );
    }

    return effects;
  }

  /**
   * Random number in range (inclusive)
   */
  private randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  /**
   * Replace placeholders in message with actual values
   */
  private replacePlaceholders(message: string, effects: EventEffects): string {
    let result = message;

    if (effects.goldModifier !== undefined) {
      result = result.replace('{gold}', Math.abs(effects.goldModifier).toString());
    }

    if (effects.healthModifier !== undefined) {
      result = result.replace('{damage}', Math.abs(effects.healthModifier).toString());
      result = result.replace('{heal}', Math.abs(effects.healthModifier).toString());
    }

    if (effects.materialsModifier !== undefined) {
      result = result.replace('{materials}', Math.abs(effects.materialsModifier).toString());
    }

    if (effects.durabilityDamage !== undefined) {
      result = result.replace('{durability}', Math.abs(effects.durabilityDamage).toString());
    }

    if (effects.extraChests !== undefined) {
      result = result.replace('{chests}', Math.abs(effects.extraChests).toString());
    }

    if (effects.successChanceModifier !== undefined) {
      result = result.replace('{success}', Math.abs(effects.successChanceModifier).toFixed(1));
    }

    if (effects.xpModifier !== undefined) {
      result = result.replace('{xp}', Math.abs(effects.xpModifier).toString());
    }

    return result;
  }

  /**
   * Get current session events
   */
  public getCurrentSessionEvents(): GameEvent[] {
    return [...this.state.currentSessionEvents];
  }

  /**
   * Get generator state for debugging
   */
  public getState(): EventGeneratorState {
    return { ...this.state };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<EventGenerationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Reset generator state (for testing)
   */
  public reset(): void {
    this.state = this.createInitialState();
  }
}
