/**
 * Event System Integration Tests
 * Tests the full flow of event generation, application, and display
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventTaskIntegration } from '@/systems/events/EventTaskIntegration';
import { EventEffectApplier } from '@/systems/events/EventEffectApplier';
import { createStore } from 'solid-js/store';
import { CharacterState } from '@/core/types/character';
import { InventoryState } from '@/core/types/items';
import { ActiveTask } from '@/core/types/tasks';
import { TEST_EVENT_CONFIG } from '@/data/config/eventConfig';
import { validateEventCollections } from '@/data/events/taskEventCollections';

describe('Event System Integration', () => {
  let integration: EventTaskIntegration;
  let characterState: CharacterState;
  let setCharacterState: any;
  let inventoryState: InventoryState;
  let setInventoryState: any;
  let activeTask: ActiveTask | null;
  let setActiveTask: any;

  beforeEach(() => {
    // Create integration with test config (immediate events)
    integration = new EventTaskIntegration(undefined, TEST_EVENT_CONFIG);

    // Create test character state
    [characterState, setCharacterState] = createStore<CharacterState>({
      name: 'Test Hero',
      class: 'warrior',
      level: 5,
      experience: 0,
      experienceToNextLevel: 100,
      currentHp: 100,
      maxHp: 100,
      basePower: 10,
      baseDefense: 10,
      baseFocus: 10,
      baseLuck: 10,
      computedPower: 10,
      computedDefense: 10,
      computedFocus: 10,
      computedLuck: 10,
      equippedWeapon: {
        id: 'test_weapon',
        name: 'Test Sword',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'common',
        stats: { power: 5 },
        durability: 100,
      },
      equippedArmor: {
        id: 'test_armor',
        name: 'Test Armor',
        type: 'armor',
        slot: 'armor',
        rarity: 'common',
        stats: { defense: 5 },
        durability: 100,
      },
      equippedAccessory: null,
      isInjured: false,
      injuries: [],
      hospitalBills: [],
    });

    // Create test inventory state
    [inventoryState, setInventoryState] = createStore<InventoryState>({
      items: [],
      gold: 100,
      materials: 50,
      maxSlots: 20,
      unopenedChests: 0,
    });

    // Create test active task
    [activeTask, setActiveTask] = createStore<ActiveTask | null>({
      taskType: 'raid',
      riskLevel: 'standard',
      config: {
        id: 'raid',
        name: 'Raid',
        description: 'Test raid',
        baseSuccessChance: 70,
        primaryStat: 'power',
        riskModifiers: {
          safe: {
            successChanceModifier: 10,
            rewardMultiplier: 0.8,
            displayName: 'Safe',
            description: 'Safe',
          },
          standard: {
            successChanceModifier: 0,
            rewardMultiplier: 1.0,
            displayName: 'Standard',
            description: 'Standard',
          },
          risky: {
            successChanceModifier: -10,
            rewardMultiplier: 1.3,
            displayName: 'Risky',
            description: 'Risky',
          },
        },
        rewards: {
          gold: { min: 20, max: 50 },
          xp: { min: 10, max: 30 },
          materials: { min: 5, max: 15 },
          chests: 1,
          lootQuality: 1.0,
        },
        injuryChanceOnFailure: 30,
        available: true,
        minLevel: 1,
      },
      startedAt: Date.now(),
      calculatedSuccessChance: 70,
      progress: 0,
      events: [],
      outcome: null,
      earnedRewards: null,
    });
  });

  describe('Event Generation', () => {
    it('should start task events', () => {
      integration.startTaskEvents('raid');
      expect(integration.getCurrentEvents()).toHaveLength(0);
    });

    it('should be able to generate events during task', () => {
      integration.startTaskEvents('raid');

      // Try to generate events multiple times
      const events: any[] = [];
      for (let i = 0; i < 50; i++) {
        const event = integration.update('raid', characterState, inventoryState, activeTask);
        if (event) {
          events.push(event);
        }
      }

      // Should generate at least one event
      expect(events.length).toBeGreaterThan(0);
      const firstEvent = events[0];
      expect(firstEvent.message).toBeDefined();
      expect(firstEvent.severity).toBeDefined();
      expect(firstEvent.timestamp).toBeGreaterThan(0);
    });

    it('should track generated events', () => {
      integration.startTaskEvents('raid');

      // Generate multiple events
      for (let i = 0; i < 20; i++) {
        integration.update('raid', characterState, inventoryState, activeTask);
      }

      const events = integration.getCurrentEvents();
      expect(events.length).toBeGreaterThan(0);
      expect(events.length).toBeLessThanOrEqual(20);
    });

    it('should end task events', () => {
      integration.startTaskEvents('raid');

      // Generate some events
      for (let i = 0; i < 20; i++) {
        integration.update('raid', characterState, inventoryState, activeTask);
      }

      const events = integration.endTaskEvents();
      expect(events.length).toBeGreaterThan(0);

      // After ending, current events should be empty
      expect(integration.getCurrentEvents()).toHaveLength(0);
    });
  });

  describe('Event Effects', () => {
    it('should apply positive gold effects', () => {
      const goldEvent = {
        id: 'test',
        timestamp: Date.now(),
        severity: 'info' as const,
        category: 'loot' as const,
        message: 'Found gold',
        effects: { goldModifier: 50 },
        acknowledged: false,
      };

      const initialGold = inventoryState.gold;

      integration.applyEvent(
        goldEvent,
        characterState,
        setCharacterState,
        inventoryState,
        setInventoryState,
        activeTask,
        setActiveTask
      );

      expect(inventoryState.gold).toBe(initialGold + 50);
    });

    it('should apply health damage', () => {
      const damageEvent = {
        id: 'test',
        timestamp: Date.now(),
        severity: 'warning' as const,
        category: 'combat' as const,
        message: 'Took damage',
        effects: { healthModifier: -20 },
        acknowledged: false,
      };

      const initialHp = characterState.currentHp;

      integration.applyEvent(
        damageEvent,
        characterState,
        setCharacterState,
        inventoryState,
        setInventoryState,
        activeTask,
        setActiveTask
      );

      expect(characterState.currentHp).toBe(initialHp - 20);
    });

    it('should apply success chance modifiers to active task', () => {
      const luckEvent = {
        id: 'test',
        timestamp: Date.now(),
        severity: 'info' as const,
        category: 'fortune' as const,
        message: 'Lucky moment',
        effects: { successChanceModifier: 10 },
        acknowledged: false,
      };

      const initialChance = activeTask?.calculatedSuccessChance || 0;

      integration.applyEvent(
        luckEvent,
        characterState,
        setCharacterState,
        inventoryState,
        setInventoryState,
        activeTask,
        setActiveTask
      );

      expect(activeTask?.calculatedSuccessChance).toBe(initialChance + 10);
    });

    it('should not reduce gold below 0', () => {
      setInventoryState('gold', 10);

      const theftEvent = {
        id: 'test',
        timestamp: Date.now(),
        severity: 'warning' as const,
        category: 'economy' as const,
        message: 'Robbed!',
        effects: { goldModifier: -50 },
        acknowledged: false,
      };

      integration.applyEvent(
        theftEvent,
        characterState,
        setCharacterState,
        inventoryState,
        setInventoryState,
        activeTask,
        setActiveTask
      );

      expect(inventoryState.gold).toBe(0);
      expect(inventoryState.gold).toBeGreaterThanOrEqual(0);
    });

    it('should not exceed max HP when healing', () => {
      setCharacterState('currentHp', 50);

      const healEvent = {
        id: 'test',
        timestamp: Date.now(),
        severity: 'info' as const,
        category: 'health' as const,
        message: 'Healed',
        effects: { healthModifier: 100 },
        acknowledged: false,
      };

      integration.applyEvent(
        healEvent,
        characterState,
        setCharacterState,
        inventoryState,
        setInventoryState,
        activeTask,
        setActiveTask
      );

      expect(characterState.currentHp).toBe(characterState.maxHp);
      expect(characterState.currentHp).toBeLessThanOrEqual(characterState.maxHp);
    });

    it('should apply multiple effects from one event', () => {
      const multiEffectEvent = {
        id: 'test',
        timestamp: Date.now(),
        severity: 'critical' as const,
        category: 'loot' as const,
        message: 'Legendary treasure!',
        effects: {
          goldModifier: 100,
          materialsModifier: 20,
          successChanceModifier: 15,
          extraChests: 1,
        },
        acknowledged: false,
      };

      const initialGold = inventoryState.gold;
      const initialMaterials = inventoryState.materials;
      const initialChance = activeTask?.calculatedSuccessChance || 0;
      const initialChests = inventoryState.unopenedChests;

      const result = integration.applyEvent(
        multiEffectEvent,
        characterState,
        setCharacterState,
        inventoryState,
        setInventoryState,
        activeTask,
        setActiveTask
      );

      expect(inventoryState.gold).toBe(initialGold + 100);
      expect(inventoryState.materials).toBe(initialMaterials + 20);
      expect(activeTask?.calculatedSuccessChance).toBe(initialChance + 15);
      expect(inventoryState.unopenedChests).toBe(initialChests + 1);
      expect(result.appliedEffects.length).toBeGreaterThan(0);
    });
  });

  describe('Event Statistics', () => {
    it('should track session statistics', () => {
      integration.startTaskEvents('raid');

      // Generate some events
      for (let i = 0; i < 30; i++) {
        integration.update('raid', characterState, inventoryState, activeTask);
      }

      const stats = integration.getSessionStatistics();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.bySeverity).toBeDefined();
      expect(stats.byCategory).toBeDefined();
    });

    it('should calculate impact score', () => {
      const beneficialEvent = {
        id: 'test',
        timestamp: Date.now(),
        severity: 'info' as const,
        category: 'loot' as const,
        message: 'Good',
        effects: { goldModifier: 50, healthModifier: 10 },
        acknowledged: false,
      };

      const harmfulEvent = {
        id: 'test2',
        timestamp: Date.now(),
        severity: 'warning' as const,
        category: 'combat' as const,
        message: 'Bad',
        effects: { goldModifier: -30, healthModifier: -20 },
        acknowledged: false,
      };

      const beneficialScore = EventEffectApplier.getImpactScore(beneficialEvent.effects);
      const harmfulScore = EventEffectApplier.getImpactScore(harmfulEvent.effects);

      expect(beneficialScore).toBeGreaterThan(0);
      expect(harmfulScore).toBeLessThan(0);
    });
  });

  describe('Event Collections Validation', () => {
    it('should have valid event collections', () => {
      const validation = validateEventCollections();

      expect(validation.errors.length).toBe(0);

      if (validation.warnings.length > 0) {
        console.log('Event collection warnings:', validation.warnings);
      }
    });
  });

  describe('Pause and Resume', () => {
    it('should pause and resume event generation', () => {
      integration.startTaskEvents('raid');

      // Pause
      integration.pause();

      // Try to generate (should fail while paused)
      for (let i = 0; i < 5; i++) {
        const eventWhilePaused = integration.update(
          'raid',
          characterState,
          inventoryState,
          activeTask
        );
        expect(eventWhilePaused).toBeNull();
      }

      // Resume
      integration.resume();

      // Should work again (try multiple times)
      let eventAfterResume = null;
      for (let i = 0; i < 20 && !eventAfterResume; i++) {
        eventAfterResume = integration.update(
          'raid',
          characterState,
          inventoryState,
          activeTask
        );
      }

      // Should eventually generate
      expect(eventAfterResume).not.toBeNull();
    });
  });
});
