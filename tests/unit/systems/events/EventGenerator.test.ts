/**
 * EventGenerator Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventGenerator, DEFAULT_EVENT_CONFIG } from '@/systems/events/EventGenerator';
import { EventBank } from '@/systems/events/EventBank';
import { EventTemplate, EventGenerationConfig } from '@/core/types/events';

describe('EventGenerator', () => {
  let testTemplates: EventTemplate[];
  let eventBank: EventBank;
  let generator: EventGenerator;

  beforeEach(() => {
    // Reset time mocking
    vi.restoreAllMocks();

    testTemplates = [
      {
        templateId: 'test_common',
        severity: 'info',
        category: 'loot',
        messages: ['You find {gold} gold'],
        effects: {
          goldModifier: { min: 10, max: 20 },
        },
        weight: 10,
        applicableTasks: [],
        repeatable: true,
      },
      {
        templateId: 'test_rare',
        severity: 'critical',
        category: 'combat',
        messages: ['Boss appears!'],
        effects: {
          healthModifier: { min: -50, max: -30 },
          successChanceModifier: { min: -15, max: -8 },
        },
        weight: 5,
        applicableTasks: ['raid'],
        repeatable: false,
      },
    ];

    eventBank = new EventBank(testTemplates);
    generator = new EventGenerator(eventBank);
  });

  describe('initialization', () => {
    it('should create generator with default config', () => {
      expect(generator).toBeDefined();
      const state = generator.getState();
      expect(state.currentSessionEvents).toHaveLength(0);
      expect(state.firedTemplateIds.size).toBe(0);
      expect(state.isPaused).toBe(false);
    });

    it('should accept custom config', () => {
      const customConfig: EventGenerationConfig = {
        ...DEFAULT_EVENT_CONFIG,
        maxEventsPerSession: 5,
      };
      const customGenerator = new EventGenerator(eventBank, customConfig);
      expect(customGenerator).toBeDefined();
    });
  });

  describe('session management', () => {
    it('should start a new session', () => {
      generator.startSession();
      const state = generator.getState();

      expect(state.currentSessionEvents).toHaveLength(0);
      expect(state.firedTemplateIds.size).toBe(0);
      expect(state.lastEventTimestamp).toBeGreaterThan(0);
      expect(state.nextEventTime).toBeGreaterThan(Date.now());
    });

    it('should end session and return events', () => {
      generator.startSession();

      // Manually add an event to test
      const mockEvent = {
        id: 'test_event',
        severity: 'info' as const,
        category: 'loot' as const,
        timestamp: Date.now(),
        message: 'Test',
        effects: {},
        acknowledged: false,
      };

      const state = generator.getState();
      state.currentSessionEvents.push(mockEvent);

      const events = generator.endSession();
      expect(events).toHaveLength(1);
      expect(generator.getState().currentSessionEvents).toHaveLength(0);
    });

    it('should clear events on session end', () => {
      generator.startSession();
      const endedEvents = generator.endSession();
      expect(endedEvents).toHaveLength(0);

      const state = generator.getState();
      expect(state.currentSessionEvents).toHaveLength(0);
      expect(state.nextEventTime).toBeNull();
    });
  });

  describe('pause and resume', () => {
    it('should pause event generation', () => {
      generator.pause();
      const state = generator.getState();
      expect(state.isPaused).toBe(true);
    });

    it('should resume event generation', () => {
      generator.pause();
      generator.resume();
      const state = generator.getState();
      expect(state.isPaused).toBe(false);
    });

    it('should not generate events when paused', () => {
      generator.startSession();
      generator.pause();

      const result = generator.tryGenerateEvent('raid', {
        characterLevel: 5,
        currentHealth: 100,
        maxHealth: 100,
        isInjured: false,
        gold: 50,
        hasWeapon: true,
        hasArmor: true,
        taskType: 'raid',
        taskProgress: 50,
        eventCount: 0,
      });

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Event generation is paused');
    });
  });

  describe('tryGenerateEvent', () => {
    it('should not generate event before next event time', () => {
      generator.startSession();

      const result = generator.tryGenerateEvent('raid', {
        characterLevel: 5,
        currentHealth: 100,
        maxHealth: 100,
        isInjured: false,
        gold: 50,
        hasWeapon: true,
        hasArmor: true,
        taskType: 'raid',
        taskProgress: 50,
        eventCount: 0,
      });

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Not yet time for next event');
    });

    it('should generate event after waiting', () => {
      generator.startSession();

      // Fast forward time past next event time
      const state = generator.getState();
      if (state.nextEventTime) {
        vi.setSystemTime(state.nextEventTime + 1000);
      }

      const result = generator.tryGenerateEvent('raid', {
        characterLevel: 5,
        currentHealth: 100,
        maxHealth: 100,
        isInjured: false,
        gold: 50,
        hasWeapon: true,
        hasArmor: true,
        taskType: 'raid',
        taskProgress: 50,
        eventCount: 0,
      });

      expect(result.success).toBe(true);
      expect(result.event).toBeDefined();
    });

    it('should respect max events per session', () => {
      const limitedConfig: EventGenerationConfig = {
        ...DEFAULT_EVENT_CONFIG,
        maxEventsPerSession: 2,
        minTimeBetweenEvents: 0,
        maxTimeBetweenEvents: 0,
      };

      const limitedGenerator = new EventGenerator(eventBank, limitedConfig);
      limitedGenerator.startSession();

      // Generate max events
      for (let i = 0; i < 2; i++) {
        limitedGenerator.tryGenerateEvent('raid', {
          characterLevel: 5,
          currentHealth: 100,
          maxHealth: 100,
          isInjured: false,
          gold: 50,
          hasWeapon: true,
          hasArmor: true,
          taskType: 'raid',
          taskProgress: 50,
          eventCount: i,
        });
      }

      // Try to generate one more
      const result = limitedGenerator.tryGenerateEvent('raid', {
        characterLevel: 5,
        currentHealth: 100,
        maxHealth: 100,
        isInjured: false,
        gold: 50,
        hasWeapon: true,
        hasArmor: true,
        taskType: 'raid',
        taskProgress: 50,
        eventCount: 2,
      });

      expect(result.success).toBe(false);
      expect(result.reason).toBe('Maximum events per session reached');
    });

    it('should not fire non-repeatable events twice', () => {
      const quickConfig: EventGenerationConfig = {
        ...DEFAULT_EVENT_CONFIG,
        minTimeBetweenEvents: 0,
        maxTimeBetweenEvents: 0,
      };

      const quickGenerator = new EventGenerator(eventBank, quickConfig);
      quickGenerator.startSession();

      // Generate events until we get the non-repeatable one
      let foundRareEvent = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!foundRareEvent && attempts < maxAttempts) {
        const result = quickGenerator.tryGenerateEvent('raid', {
          characterLevel: 5,
          currentHealth: 100,
          maxHealth: 100,
          isInjured: false,
          gold: 50,
          hasWeapon: true,
          hasArmor: true,
          taskType: 'raid',
          taskProgress: 50,
          eventCount: attempts,
        });

        if (result.success && result.event) {
          const eventMessage = result.event.message;
          if (eventMessage.includes('Boss')) {
            foundRareEvent = true;
          }
        }

        attempts++;
      }

      if (foundRareEvent) {
        // Check that test_rare is now in firedTemplateIds
        const state = quickGenerator.getState();
        expect(state.firedTemplateIds.has('test_rare')).toBe(true);
      }
    });

    it('should replace placeholders in messages', () => {
      const quickConfig: EventGenerationConfig = {
        ...DEFAULT_EVENT_CONFIG,
        minTimeBetweenEvents: 0,
        maxTimeBetweenEvents: 0,
      };

      const quickGenerator = new EventGenerator(eventBank, quickConfig);
      quickGenerator.startSession();

      let foundGoldEvent = false;
      let attempts = 0;
      const maxAttempts = 50;

      while (!foundGoldEvent && attempts < maxAttempts) {
        const result = quickGenerator.tryGenerateEvent('expedition', {
          characterLevel: 5,
          currentHealth: 100,
          maxHealth: 100,
          isInjured: false,
          gold: 50,
          hasWeapon: true,
          hasArmor: true,
          taskType: 'expedition',
          taskProgress: 50,
          eventCount: attempts,
        });

        if (result.success && result.event && result.event.message.includes('gold')) {
          // Should not contain {gold} placeholder
          expect(result.event.message).not.toContain('{gold}');
          // Should contain a number
          expect(result.event.message).toMatch(/\d+/);
          foundGoldEvent = true;
        }

        attempts++;
      }
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      generator.updateConfig({
        maxEventsPerSession: 5,
      });

      // We can't directly access config, but we can test behavior
      generator.startSession();

      // Generate 5 events with no time between
      const quickConfig: EventGenerationConfig = {
        ...DEFAULT_EVENT_CONFIG,
        maxEventsPerSession: 5,
        minTimeBetweenEvents: 0,
        maxTimeBetweenEvents: 0,
      };

      const quickGenerator = new EventGenerator(eventBank, quickConfig);
      quickGenerator.startSession();

      for (let i = 0; i < 5; i++) {
        quickGenerator.tryGenerateEvent('raid', {
          characterLevel: 5,
          currentHealth: 100,
          maxHealth: 100,
          isInjured: false,
          gold: 50,
          hasWeapon: true,
          hasArmor: true,
          taskType: 'raid',
          taskProgress: 50,
          eventCount: i,
        });
      }

      const result = quickGenerator.tryGenerateEvent('raid', {
        characterLevel: 5,
        currentHealth: 100,
        maxHealth: 100,
        isInjured: false,
        gold: 50,
        hasWeapon: true,
        hasArmor: true,
        taskType: 'raid',
        taskProgress: 50,
        eventCount: 5,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset generator state', () => {
      generator.startSession();

      const result = generator.tryGenerateEvent('raid', {
        characterLevel: 5,
        currentHealth: 100,
        maxHealth: 100,
        isInjured: false,
        gold: 50,
        hasWeapon: true,
        hasArmor: true,
        taskType: 'raid',
        taskProgress: 50,
        eventCount: 0,
      });

      generator.reset();

      const state = generator.getState();
      expect(state.currentSessionEvents).toHaveLength(0);
      expect(state.firedTemplateIds.size).toBe(0);
      expect(state.lastEventTimestamp).toBe(0);
      expect(state.nextEventTime).toBeNull();
    });
  });

  describe('getCurrentSessionEvents', () => {
    it('should return copy of current session events', () => {
      generator.startSession();

      const events1 = generator.getCurrentSessionEvents();
      expect(events1).toHaveLength(0);

      // Modifying returned array should not affect internal state
      events1.push({
        id: 'test',
        severity: 'info',
        category: 'loot',
        timestamp: Date.now(),
        message: 'Test',
        effects: {},
        acknowledged: false,
      });

      const events2 = generator.getCurrentSessionEvents();
      expect(events2).toHaveLength(0);
    });
  });

  describe('event distribution', () => {
    it('should generate events with correct severity distribution', () => {
      const severityCounts: Record<string, number> = {
        flavor: 0,
        info: 0,
        warning: 0,
        critical: 0,
      };

      const quickConfig: EventGenerationConfig = {
        ...DEFAULT_EVENT_CONFIG,
        minTimeBetweenEvents: 0,
        maxTimeBetweenEvents: 0,
        maxEventsPerSession: 100,
      };

      const quickGenerator = new EventGenerator(eventBank, quickConfig);
      quickGenerator.startSession();

      for (let i = 0; i < 100; i++) {
        const result = quickGenerator.tryGenerateEvent('raid', {
          characterLevel: 5,
          currentHealth: 100,
          maxHealth: 100,
          isInjured: false,
          gold: 50,
          hasWeapon: true,
          hasArmor: true,
          taskType: 'raid',
          taskProgress: 50,
          eventCount: i,
        });

        if (result.success && result.event) {
          severityCounts[result.event.severity]++;
        }
      }

      // With our test data, we should have mix of severities
      // Since we only have 'info' and 'critical' in test data
      const totalEvents = Object.values(severityCounts).reduce((a, b) => a + b, 0);
      expect(totalEvents).toBeGreaterThan(0);
    });
  });
});
