/**
 * EventTaskIntegration - Integrates events with task execution
 * Manages event generation and application during work tasks
 */

import { EventGenerator } from './EventGenerator';
import { EventBank } from './EventBank';
import { EventEffectApplier, EventEffectResult } from './EventEffectApplier';
import { GameEvent, EventConditionContext, EventGenerationConfig } from '@/core/types/events';
import { ActiveTask, TaskType } from '@/core/types/tasks';
import { CharacterState } from '@/core/types/character';
import { InventoryState } from '@/core/types/items';
import { SetStoreFunction } from 'solid-js/store';
import { EVENT_TEMPLATES } from '@/data/events/eventBank';
import { getTaskEventConfig } from '@/data/config/eventConfig';

/**
 * Event task integration manager
 * Coordinates event generation and application during task execution
 */
export class EventTaskIntegration {
  private eventBank: EventBank;
  private eventGenerator: EventGenerator;
  private generatedEvents: GameEvent[] = [];
  private baseConfig?: EventGenerationConfig;

  constructor(eventBank?: EventBank, config?: EventGenerationConfig) {
    this.eventBank = eventBank || new EventBank(EVENT_TEMPLATES);
    this.eventGenerator = new EventGenerator(this.eventBank, config);
    this.baseConfig = config;
  }

  /**
   * Start event generation for a task
   */
  public startTaskEvents(taskType: TaskType, baseConfig?: EventGenerationConfig): void {
    // Use provided baseConfig, or fall back to constructor config
    const configToUse = baseConfig || this.baseConfig;

    // Get task-specific configuration
    const taskConfig = getTaskEventConfig(taskType, configToUse);

    // Update generator config
    this.eventGenerator.updateConfig(taskConfig);

    // Start session
    this.eventGenerator.startSession();

    // Clear previous events
    this.generatedEvents = [];
  }

  /**
   * Update event generation (call every frame/tick during work)
   */
  public update(
    taskType: TaskType,
    characterState: CharacterState,
    inventoryState: InventoryState,
    activeTask: ActiveTask | null
  ): GameEvent | null {
    // Build condition context
    const conditionContext = this.buildConditionContext(characterState, inventoryState, activeTask);

    // Try to generate event
    const result = this.eventGenerator.tryGenerateEvent(taskType, conditionContext);

    if (result.success && result.event) {
      this.generatedEvents.push(result.event);
      return result.event;
    }

    return null;
  }

  /**
   * Apply event effects to game state
   */
  public applyEvent(
    event: GameEvent,
    characterState: CharacterState,
    setCharacterState: SetStoreFunction<CharacterState>,
    inventoryState: InventoryState,
    setInventoryState: SetStoreFunction<InventoryState>,
    activeTask: ActiveTask | null,
    setActiveTask: SetStoreFunction<ActiveTask | null>
  ): EventEffectResult {
    return EventEffectApplier.applyEventEffects(
      event,
      characterState,
      setCharacterState,
      inventoryState,
      setInventoryState,
      activeTask,
      setActiveTask
    );
  }

  /**
   * End task events and return all generated events
   */
  public endTaskEvents(): GameEvent[] {
    const events = this.eventGenerator.endSession();
    this.generatedEvents = [];
    return events;
  }

  /**
   * Get current session events
   */
  public getCurrentEvents(): GameEvent[] {
    return [...this.generatedEvents];
  }

  /**
   * Pause event generation
   */
  public pause(): void {
    this.eventGenerator.pause();
  }

  /**
   * Resume event generation
   */
  public resume(): void {
    this.eventGenerator.resume();
  }

  /**
   * Reset the integration
   */
  public reset(): void {
    this.eventGenerator.reset();
    this.generatedEvents = [];
  }

  /**
   * Build event condition context from game state
   */
  private buildConditionContext(
    characterState: CharacterState,
    inventoryState: InventoryState,
    activeTask: ActiveTask | null
  ): EventConditionContext {
    return {
      characterLevel: characterState.level,
      currentHealth: characterState.currentHp,
      maxHealth: characterState.maxHp,
      isInjured: characterState.isInjured || false,
      gold: inventoryState.gold,
      hasWeapon: characterState.equippedWeapon !== null,
      hasArmor: characterState.equippedArmor !== null,
      taskType: activeTask?.taskType || 'expedition',
      taskProgress: activeTask?.progress || 0,
      eventCount: this.generatedEvents.length,
    };
  }

  /**
   * Get event statistics for current session
   */
  public getSessionStatistics() {
    const events = this.generatedEvents;

    return {
      total: events.length,
      bySeverity: {
        flavor: events.filter((e) => e.severity === 'flavor').length,
        info: events.filter((e) => e.severity === 'info').length,
        warning: events.filter((e) => e.severity === 'warning').length,
        critical: events.filter((e) => e.severity === 'critical').length,
      },
      byCategory: {
        combat: events.filter((e) => e.category === 'combat').length,
        loot: events.filter((e) => e.category === 'loot').length,
        hazard: events.filter((e) => e.category === 'hazard').length,
        npc: events.filter((e) => e.category === 'npc').length,
        fortune: events.filter((e) => e.category === 'fortune').length,
        equipment: events.filter((e) => e.category === 'equipment').length,
        health: events.filter((e) => e.category === 'health').length,
        economy: events.filter((e) => e.category === 'economy').length,
        mystery: events.filter((e) => e.category === 'mystery').length,
      },
      totalImpact: events.reduce(
        (sum, event) => sum + EventEffectApplier.getImpactScore(event.effects),
        0
      ),
      beneficialEvents: events.filter((e) => EventEffectApplier.isBeneficialEvent(e.effects))
        .length,
      harmfulEvents: events.filter((e) => EventEffectApplier.isHarmfulEvent(e.effects)).length,
    };
  }

  /**
   * Get generator instance (for advanced usage)
   */
  public getGenerator(): EventGenerator {
    return this.eventGenerator;
  }

  /**
   * Get event bank instance (for advanced usage)
   */
  public getEventBank(): EventBank {
    return this.eventBank;
  }
}

/**
 * Create a default event task integration instance
 */
export function createEventTaskIntegration(config?: EventGenerationConfig): EventTaskIntegration {
  return new EventTaskIntegration(undefined, config);
}
