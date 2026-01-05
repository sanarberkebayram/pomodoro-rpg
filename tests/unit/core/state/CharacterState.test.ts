import { describe, it, expect, beforeEach } from 'vitest';
import {
  createCharacterStore,
  createInitialCharacterState,
} from '../../../../src/core/state/CharacterState';
import type { StatusEffect } from '../../../../src/core/types/character';

describe('CharacterState', () => {
  describe('Initial State', () => {
    it('should create initial character state with Vanguard class', () => {
      const state = createInitialCharacterState({ class: 'Vanguard' });

      expect(state.class).toBe('Vanguard');
      expect(state.level).toBe(1);
      expect(state.baseStats.power).toBe(10);
      expect(state.baseStats.defense).toBe(15);
      expect(state.baseStats.focus).toBe(10);
      expect(state.baseStats.luck).toBe(5);
      expect(state.baseStats.health).toBe(100);
      expect(state.baseStats.maxHealth).toBe(100);
      expect(state.computedStats).toEqual(state.baseStats);
    });

    it('should have no equipment initially', () => {
      const state = createInitialCharacterState({ class: 'Vanguard' });

      expect(state.equipment.weapon).toBeNull();
      expect(state.equipment.armor).toBeNull();
      expect(state.equipment.accessory).toBeNull();
    });

    it('should not be injured initially', () => {
      const state = createInitialCharacterState({ class: 'Vanguard' });

      expect(state.injury.isInjured).toBe(false);
      expect(state.injury.successPenalty).toBe(0);
    });

    it('should have no hospital bill initially', () => {
      const state = createInitialCharacterState({ class: 'Vanguard' });

      expect(state.hospitalBill).toBeNull();
    });

    it('should have empty status effects initially', () => {
      const state = createInitialCharacterState({ class: 'Vanguard' });

      expect(state.statusEffects).toEqual([]);
    });

    it('should initialize metadata correctly', () => {
      const state = createInitialCharacterState({ class: 'Vanguard' });

      expect(state.metadata.tasksCompleted).toBe(0);
      expect(state.metadata.tasksFailed).toBe(0);
      expect(state.metadata.createdAt).toBeGreaterThan(0);
    });
  });

  describe('Leveling System', () => {
    let store: ReturnType<typeof createCharacterStore>;

    beforeEach(() => {
      store = createCharacterStore();
    });

    it('should level up and increase stats', () => {
      const initialPower = store.state.baseStats.power;
      const initialDefense = store.state.baseStats.defense;
      const initialMaxHealth = store.state.baseStats.maxHealth;

      store.levelUp();

      expect(store.state.level).toBe(2);
      expect(store.state.baseStats.power).toBe(initialPower + 2); // Vanguard power growth
      expect(store.state.baseStats.defense).toBe(initialDefense + 3); // Vanguard defense growth
      expect(store.state.baseStats.maxHealth).toBe(initialMaxHealth + 10); // Health per level
    });

    it('should restore health on level up', () => {
      store.takeDamage(50);
      expect(store.state.computedStats.health).toBe(50);

      store.levelUp();

      expect(store.state.computedStats.health).toBe(store.state.computedStats.maxHealth);
    });

    it('should set level correctly', () => {
      store.setLevel(5);

      expect(store.state.level).toBe(5);
      // At level 5, Vanguard should have: 10 + (2 * 4) = 18 power
      expect(store.state.baseStats.power).toBe(18);
      // At level 5, Vanguard should have: 15 + (3 * 4) = 27 defense
      expect(store.state.baseStats.defense).toBe(27);
    });

    it('should throw error when setting level below 1', () => {
      expect(() => store.setLevel(0)).toThrow('Level must be at least 1');
    });
  });

  describe('Equipment System', () => {
    let store: ReturnType<typeof createCharacterStore>;

    beforeEach(() => {
      store = createCharacterStore();
    });

    it('should equip item to weapon slot', () => {
      store.equipItem('weapon', 'sword-001');

      expect(store.state.equipment.weapon).toEqual({
        itemId: 'sword-001',
        slot: 'weapon',
      });
    });

    it('should equip item to armor slot', () => {
      store.equipItem('armor', 'plate-001');

      expect(store.state.equipment.armor).toEqual({
        itemId: 'plate-001',
        slot: 'armor',
      });
    });

    it('should unequip item from slot', () => {
      store.equipItem('weapon', 'sword-001');
      const unequipped = store.unequipItem('weapon');

      expect(unequipped).toEqual({
        itemId: 'sword-001',
        slot: 'weapon',
      });
      expect(store.state.equipment.weapon).toBeNull();
    });

    it('should return null when unequipping empty slot', () => {
      const unequipped = store.unequipItem('weapon');

      expect(unequipped).toBeNull();
    });

    it('should replace equipped item when equipping to same slot', () => {
      store.equipItem('weapon', 'sword-001');
      store.equipItem('weapon', 'sword-002');

      expect(store.state.equipment.weapon?.itemId).toBe('sword-002');
    });
  });

  describe('Health System', () => {
    let store: ReturnType<typeof createCharacterStore>;

    beforeEach(() => {
      store = createCharacterStore();
    });

    it('should take damage', () => {
      const initialHealth = store.state.computedStats.health;

      store.takeDamage(30);

      expect(store.state.computedStats.health).toBe(initialHealth - 30);
    });

    it('should not go below 0 health', () => {
      store.takeDamage(200);

      expect(store.state.computedStats.health).toBe(0);
    });

    it('should heal damage', () => {
      store.takeDamage(50);
      store.heal(30);

      expect(store.state.computedStats.health).toBe(80);
    });

    it('should not heal above max health', () => {
      const maxHealth = store.state.computedStats.maxHealth;

      store.takeDamage(20);
      store.heal(50);

      expect(store.state.computedStats.health).toBe(maxHealth);
    });

    it('should fully heal to max health', () => {
      const maxHealth = store.state.computedStats.maxHealth;

      store.takeDamage(70);
      store.fullHeal();

      expect(store.state.computedStats.health).toBe(maxHealth);
    });
  });

  describe('Injury System', () => {
    let store: ReturnType<typeof createCharacterStore>;

    beforeEach(() => {
      store = createCharacterStore();
    });

    it('should apply minor injury', () => {
      store.applyInjury('minor');

      expect(store.state.injury.isInjured).toBe(true);
      expect(store.state.injury.severity).toBe('minor');
      expect(store.state.injury.successPenalty).toBe(5);
    });

    it('should apply moderate injury', () => {
      store.applyInjury('moderate');

      expect(store.state.injury.severity).toBe('moderate');
      expect(store.state.injury.successPenalty).toBe(10);
    });

    it('should apply severe injury', () => {
      store.applyInjury('severe');

      expect(store.state.injury.severity).toBe('severe');
      expect(store.state.injury.successPenalty).toBe(20);
    });

    it('should reduce stats when injured', () => {
      const initialPower = store.state.computedStats.power;
      const initialFocus = store.state.computedStats.focus;

      store.applyInjury('moderate');

      expect(store.state.computedStats.power).toBeLessThan(initialPower);
      expect(store.state.computedStats.focus).toBeLessThan(initialFocus);
    });

    it('should heal injury', () => {
      store.applyInjury('severe');
      const injuredPower = store.state.computedStats.power;

      store.healInjury();

      expect(store.state.injury.isInjured).toBe(false);
      expect(store.state.injury.successPenalty).toBe(0);
      expect(store.state.computedStats.power).toBeGreaterThan(injuredPower);
    });

    it('should include injury penalty in success chance penalty', () => {
      store.applyInjury('moderate');

      const penalty = store.getSuccessChancePenalty();

      expect(penalty).toBe(10);
    });
  });

  describe('Hospital Bill System', () => {
    let store: ReturnType<typeof createCharacterStore>;

    beforeEach(() => {
      store = createCharacterStore();
    });

    it('should add hospital bill', () => {
      store.addHospitalBill(100);

      expect(store.state.hospitalBill).not.toBeNull();
      expect(store.state.hospitalBill?.amount).toBe(100);
      expect(store.state.hospitalBill?.penalty).toBe(10); // 100 / 10
    });

    it('should cap bill penalty at 10', () => {
      store.addHospitalBill(500);

      expect(store.state.hospitalBill?.penalty).toBe(10);
    });

    it('should reduce focus when bill is unpaid', () => {
      const initialFocus = store.state.computedStats.focus;

      store.addHospitalBill(50);

      expect(store.state.computedStats.focus).toBeLessThan(initialFocus);
    });

    it('should pay hospital bill', () => {
      store.addHospitalBill(100);
      const initialFocus = store.state.computedStats.focus;

      const paidAmount = store.payHospitalBill();

      expect(paidAmount).toBe(100);
      expect(store.state.hospitalBill).toBeNull();
      expect(store.state.computedStats.focus).toBeGreaterThan(initialFocus);
    });

    it('should include bill penalty in success chance penalty', () => {
      store.addHospitalBill(50);

      const penalty = store.getSuccessChancePenalty();

      expect(penalty).toBe(5);
    });

    it('should combine injury and bill penalties', () => {
      store.applyInjury('minor');
      store.addHospitalBill(30);

      const penalty = store.getSuccessChancePenalty();

      expect(penalty).toBe(8); // 5 (injury) + 3 (bill)
    });
  });

  describe('Status Effects System', () => {
    let store: ReturnType<typeof createCharacterStore>;

    beforeEach(() => {
      store = createCharacterStore();
    });

    it('should add status effect', () => {
      const effect: StatusEffect = {
        id: 'buff-001',
        name: 'Strength Boost',
        type: 'buff',
        statModifiers: { power: 5 },
        duration: 60000,
        appliedAt: Date.now(),
        stacks: 1,
      };

      store.addStatusEffect(effect);

      expect(store.state.statusEffects).toHaveLength(1);
      expect(store.state.statusEffects[0].id).toBe('buff-001');
    });

    it('should apply stat modifiers from status effects', () => {
      const initialPower = store.state.computedStats.power;

      const effect: StatusEffect = {
        id: 'buff-001',
        name: 'Strength Boost',
        type: 'buff',
        statModifiers: { power: 10 },
        duration: null,
        appliedAt: Date.now(),
        stacks: 1,
      };

      store.addStatusEffect(effect);

      expect(store.state.computedStats.power).toBe(initialPower + 10);
    });

    it('should stack multiple status effects', () => {
      const initialPower = store.state.computedStats.power;

      const effect1: StatusEffect = {
        id: 'buff-001',
        name: 'Strength Boost',
        type: 'buff',
        statModifiers: { power: 5 },
        duration: null,
        appliedAt: Date.now(),
        stacks: 1,
      };

      const effect2: StatusEffect = {
        id: 'buff-002',
        name: 'Focus Boost',
        type: 'buff',
        statModifiers: { power: 3, focus: 5 },
        duration: null,
        appliedAt: Date.now(),
        stacks: 1,
      };

      store.addStatusEffect(effect1);
      store.addStatusEffect(effect2);

      expect(store.state.computedStats.power).toBe(initialPower + 8);
    });

    it('should remove status effect by ID', () => {
      const effect: StatusEffect = {
        id: 'buff-001',
        name: 'Strength Boost',
        type: 'buff',
        statModifiers: { power: 10 },
        duration: null,
        appliedAt: Date.now(),
        stacks: 1,
      };

      store.addStatusEffect(effect);
      const buffedPower = store.state.computedStats.power;

      store.removeStatusEffect('buff-001');

      expect(store.state.statusEffects).toHaveLength(0);
      expect(store.state.computedStats.power).toBeLessThan(buffedPower);
    });

    it('should remove expired status effects', () => {
      const expiredEffect: StatusEffect = {
        id: 'buff-001',
        name: 'Temporary Boost',
        type: 'buff',
        statModifiers: { power: 5 },
        duration: 1000,
        appliedAt: Date.now() - 2000, // Applied 2 seconds ago
        stacks: 1,
      };

      const activeEffect: StatusEffect = {
        id: 'buff-002',
        name: 'Active Boost',
        type: 'buff',
        statModifiers: { focus: 5 },
        duration: 60000,
        appliedAt: Date.now(),
        stacks: 1,
      };

      store.addStatusEffect(expiredEffect);
      store.addStatusEffect(activeEffect);

      expect(store.state.statusEffects).toHaveLength(2);

      store.updateStatusEffects();

      expect(store.state.statusEffects).toHaveLength(1);
      expect(store.state.statusEffects[0].id).toBe('buff-002');
    });
  });

  describe('Task Metadata', () => {
    let store: ReturnType<typeof createCharacterStore>;

    beforeEach(() => {
      store = createCharacterStore();
    });

    it('should increment tasks completed', () => {
      store.incrementTasksCompleted();
      store.incrementTasksCompleted();

      expect(store.state.metadata.tasksCompleted).toBe(2);
    });

    it('should increment tasks failed', () => {
      store.incrementTasksFailed();
      store.incrementTasksFailed();
      store.incrementTasksFailed();

      expect(store.state.metadata.tasksFailed).toBe(3);
    });
  });

  describe('Stat Calculation Integration', () => {
    let store: ReturnType<typeof createCharacterStore>;

    beforeEach(() => {
      store = createCharacterStore();
    });

    it('should apply all modifiers correctly', () => {
      // Base stats at level 1: power=10, focus=10

      // Add status effect
      const buff: StatusEffect = {
        id: 'buff-001',
        name: 'Power Boost',
        type: 'buff',
        statModifiers: { power: 5, focus: 3 },
        duration: null,
        appliedAt: Date.now(),
        stacks: 1,
      };
      store.addStatusEffect(buff);

      // Apply injury (10% penalty for moderate)
      store.applyInjury('moderate');

      // Add hospital bill
      store.addHospitalBill(50);

      // Expected calculations:
      // Power: 10 (base) + 5 (buff) - 1 (injury 10% of 10) = 14
      // Focus: 10 (base) + 3 (buff) - 1 (injury 10% of 10) - 5 (bill) = 7

      expect(store.state.computedStats.power).toBe(14);
      expect(store.state.computedStats.focus).toBe(7);
    });

    it('should ensure stats never go below minimum values', () => {
      // Apply severe debuffs
      store.applyInjury('severe');
      store.addHospitalBill(1000);

      const debuff: StatusEffect = {
        id: 'debuff-001',
        name: 'Weakness',
        type: 'debuff',
        statModifiers: { power: -50, focus: -50 },
        duration: null,
        appliedAt: Date.now(),
        stacks: 1,
      };
      store.addStatusEffect(debuff);

      // Power and Focus should be at least 1
      expect(store.state.computedStats.power).toBeGreaterThanOrEqual(1);
      expect(store.state.computedStats.focus).toBeGreaterThanOrEqual(1);

      // Defense should be at least 0
      expect(store.state.computedStats.defense).toBeGreaterThanOrEqual(0);
    });
  });
});
