/**
 * Character State Management
 * Manages character stats, equipment, injuries, and status effects
 */

import { createStore, produce } from 'solid-js/store';
import type {
  CharacterState,
  CharacterStats,
  CharacterClass,
  CharacterCreationData,
  EquipmentItem,
  EquipmentSlot,
  StatusEffect,
  InjuryState,
  StatCalculationContext,
} from '../types/character';
import { getClassConfig } from '../../data/config/classConfig';

/**
 * Create initial character state
 */
export function createInitialCharacterState(creationData: CharacterCreationData): CharacterState {
  const classConfig = getClassConfig(creationData.class);

  const baseStats = { ...classConfig.baseStats };
  const computedStats = { ...baseStats };

  return {
    class: creationData.class,
    level: 1,
    baseStats,
    computedStats,
    equipment: {
      weapon: null,
      armor: null,
      accessory: null,
    },
    injury: {
      isInjured: false,
      severity: 'minor',
      successPenalty: 0,
      injuredAt: null,
    },
    hospitalBill: null,
    statusEffects: [],
    metadata: {
      createdAt: Date.now(),
      tasksCompleted: 0,
      tasksFailed: 0,
    },
  };
}

/**
 * Character State Store
 * Provides reactive character state and management functions
 */
export function createCharacterStore(initialState?: CharacterState) {
  const [state, setState] = createStore<CharacterState>(
    initialState ?? createInitialCharacterState({ class: 'Vanguard' })
  );

  /**
   * Calculate base stats for a given level
   */
  function calculateBaseStatsForLevel(classType: CharacterClass, level: number): CharacterStats {
    const classConfig = getClassConfig(classType);
    const levelDelta = level - 1; // Level 1 = base stats, no growth yet

    return {
      power: classConfig.baseStats.power + classConfig.statGrowth.power * levelDelta,
      defense: classConfig.baseStats.defense + classConfig.statGrowth.defense * levelDelta,
      focus: classConfig.baseStats.focus + classConfig.statGrowth.focus * levelDelta,
      luck: classConfig.baseStats.luck + classConfig.statGrowth.luck * levelDelta,
      health: state.computedStats.health, // Preserve current health
      maxHealth: classConfig.baseStats.maxHealth + classConfig.statGrowth.maxHealth * levelDelta,
    };
  }

  /**
   * Calculate final stats with all modifiers
   * This is the core stat calculation system
   */
  function calculateComputedStats(context: StatCalculationContext): CharacterStats {
    const { baseStats, equipmentBonuses, statusEffectModifiers, injuryPenalties, billPenalties } =
      context;

    // Start with base stats
    const computed: CharacterStats = { ...baseStats };

    // Apply equipment bonuses (additive)
    if (equipmentBonuses.power) computed.power += equipmentBonuses.power;
    if (equipmentBonuses.defense) computed.defense += equipmentBonuses.defense;
    if (equipmentBonuses.focus) computed.focus += equipmentBonuses.focus;
    if (equipmentBonuses.luck) computed.luck += equipmentBonuses.luck;
    if (equipmentBonuses.maxHealth) computed.maxHealth += equipmentBonuses.maxHealth;

    // Apply status effect modifiers (additive)
    if (statusEffectModifiers.power) computed.power += statusEffectModifiers.power;
    if (statusEffectModifiers.defense) computed.defense += statusEffectModifiers.defense;
    if (statusEffectModifiers.focus) computed.focus += statusEffectModifiers.focus;
    if (statusEffectModifiers.luck) computed.luck += statusEffectModifiers.luck;

    // Apply injury penalties (subtractive)
    if (injuryPenalties.power) computed.power = Math.max(1, computed.power - injuryPenalties.power);
    if (injuryPenalties.defense)
      computed.defense = Math.max(0, computed.defense - injuryPenalties.defense);
    if (injuryPenalties.focus) computed.focus = Math.max(1, computed.focus - injuryPenalties.focus);

    // Apply bill penalties (subtractive)
    if (billPenalties.power) computed.power = Math.max(1, computed.power - billPenalties.power);
    if (billPenalties.focus) computed.focus = Math.max(1, computed.focus - billPenalties.focus);

    // Ensure health doesn't exceed maxHealth
    computed.health = Math.min(computed.health, computed.maxHealth);

    // Floor all stats to integers
    computed.power = Math.floor(computed.power);
    computed.defense = Math.floor(computed.defense);
    computed.focus = Math.floor(computed.focus);
    computed.luck = Math.floor(computed.luck);
    computed.health = Math.floor(computed.health);
    computed.maxHealth = Math.floor(computed.maxHealth);

    return computed;
  }

  /**
   * Recalculate and update computed stats
   * @param providedEquipmentBonuses - Equipment bonuses from inventory (optional)
   */
  function recalculateStats(providedEquipmentBonuses?: Partial<CharacterStats>): void {
    // Use provided equipment bonuses, or empty object if not provided
    const equipmentBonuses: Partial<CharacterStats> = providedEquipmentBonuses ?? {};

    // Calculate status effect modifiers
    const statusEffectModifiers: Partial<CharacterStats> = state.statusEffects.reduce(
      (acc, effect) => {
        Object.entries(effect.statModifiers).forEach(([stat, value]) => {
          const key = stat as keyof CharacterStats;
          acc[key] = (acc[key] ?? 0) + (value ?? 0);
        });
        return acc;
      },
      {} as Partial<CharacterStats>
    );

    // Calculate injury penalties
    const injuryPenalties: Partial<CharacterStats> = {};
    if (state.injury.isInjured) {
      // Injury reduces power and focus based on severity
      const penaltyMultiplier =
        state.injury.severity === 'severe'
          ? 0.2
          : state.injury.severity === 'moderate'
            ? 0.1
            : 0.05;
      injuryPenalties.power = Math.floor(state.baseStats.power * penaltyMultiplier);
      injuryPenalties.focus = Math.floor(state.baseStats.focus * penaltyMultiplier);
    }

    // Calculate bill penalties
    const billPenalties: Partial<CharacterStats> = {};
    if (state.hospitalBill) {
      billPenalties.focus = state.hospitalBill.penalty;
    }

    const context: StatCalculationContext = {
      baseStats: state.baseStats,
      equipmentBonuses,
      statusEffectModifiers,
      injuryPenalties,
      billPenalties,
    };

    const newStats = calculateComputedStats(context);

    setState('computedStats', newStats);
  }

  /**
   * Level up the character
   */
  function levelUp(): void {
    setState(
      produce((draft) => {
        draft.level += 1;
        draft.baseStats = calculateBaseStatsForLevel(draft.class, draft.level);

        // Restore health on level up
        draft.baseStats.health = draft.baseStats.maxHealth;
      })
    );

    recalculateStats();
  }

  /**
   * Set character level (for testing or loading)
   */
  function setLevel(level: number): void {
    if (level < 1) {
      throw new Error('Level must be at least 1');
    }

    setState(
      produce((draft) => {
        draft.level = level;
        draft.baseStats = calculateBaseStatsForLevel(draft.class, level);
      })
    );

    recalculateStats();
  }

  /**
   * Equip an item to a slot
   */
  function equipItem(slot: EquipmentSlot, itemId: string): void {
    setState(
      produce((draft) => {
        draft.equipment[slot] = {
          itemId,
          slot,
        };
      })
    );

    recalculateStats();
  }

  /**
   * Unequip an item from a slot
   */
  function unequipItem(slot: EquipmentSlot): EquipmentItem | null {
    const unequipped = state.equipment[slot];

    setState(
      produce((draft) => {
        draft.equipment[slot] = null;
      })
    );

    recalculateStats();

    return unequipped;
  }

  /**
   * Take damage
   */
  function takeDamage(amount: number): void {
    setState(
      produce((draft) => {
        draft.computedStats.health = Math.max(0, draft.computedStats.health - amount);
        draft.baseStats.health = draft.computedStats.health;
      })
    );
  }

  /**
   * Heal health
   */
  function heal(amount: number): void {
    setState(
      produce((draft) => {
        draft.computedStats.health = Math.min(
          draft.computedStats.maxHealth,
          draft.computedStats.health + amount
        );
        draft.baseStats.health = draft.computedStats.health;
      })
    );
  }

  /**
   * Fully restore health
   */
  function fullHeal(): void {
    setState(
      produce((draft) => {
        draft.computedStats.health = draft.computedStats.maxHealth;
        draft.baseStats.health = draft.computedStats.health;
      })
    );
  }

  /**
   * Apply an injury
   */
  function applyInjury(severity: InjuryState['severity']): void {
    const successPenaltyMap = {
      minor: 5,
      moderate: 10,
      severe: 20,
    };

    setState(
      produce((draft) => {
        draft.injury.isInjured = true;
        draft.injury.severity = severity;
        draft.injury.successPenalty = successPenaltyMap[severity];
        draft.injury.injuredAt = Date.now();
      })
    );

    recalculateStats();
  }

  /**
   * Heal injury
   */
  function healInjury(): void {
    setState(
      produce((draft) => {
        draft.injury.isInjured = false;
        draft.injury.successPenalty = 0;
        draft.injury.injuredAt = null;
      })
    );

    recalculateStats();
  }

  /**
   * Add a hospital bill
   */
  function addHospitalBill(amount: number): void {
    const penalty = Math.floor(amount / 10); // 1 focus penalty per 10 gold

    setState(
      produce((draft) => {
        draft.hospitalBill = {
          amount,
          createdAt: Date.now(),
          penalty: Math.min(penalty, 10), // Cap at 10 focus penalty
        };
      })
    );

    recalculateStats();
  }

  /**
   * Pay hospital bill
   */
  function payHospitalBill(): number {
    const amount = state.hospitalBill?.amount ?? 0;

    setState(
      produce((draft) => {
        draft.hospitalBill = null;
      })
    );

    recalculateStats();

    return amount;
  }

  /**
   * Add a status effect
   */
  function addStatusEffect(effect: StatusEffect): void {
    setState(
      produce((draft) => {
        draft.statusEffects.push(effect);
      })
    );

    recalculateStats();
  }

  /**
   * Remove a status effect by ID
   */
  function removeStatusEffect(effectId: string): void {
    setState(
      produce((draft) => {
        draft.statusEffects = draft.statusEffects.filter((e) => e.id !== effectId);
      })
    );

    recalculateStats();
  }

  /**
   * Update status effects (remove expired ones)
   */
  function updateStatusEffects(): void {
    const now = Date.now();

    setState(
      produce((draft) => {
        draft.statusEffects = draft.statusEffects.filter((effect) => {
          if (effect.duration === null) return true; // Permanent effect
          return now - effect.appliedAt < effect.duration;
        });
      })
    );

    recalculateStats();
  }

  /**
   * Increment tasks completed
   */
  function incrementTasksCompleted(): void {
    setState(
      produce((draft) => {
        draft.metadata.tasksCompleted += 1;
      })
    );
  }

  /**
   * Increment tasks failed
   */
  function incrementTasksFailed(): void {
    setState(
      produce((draft) => {
        draft.metadata.tasksFailed += 1;
      })
    );
  }

  /**
   * Get success chance modifier from injuries and bills
   * Returns a percentage penalty (0-100)
   */
  function getSuccessChancePenalty(): number {
    let penalty = 0;

    if (state.injury.isInjured) {
      penalty += state.injury.successPenalty;
    }

    if (state.hospitalBill) {
      penalty += state.hospitalBill.penalty;
    }

    return penalty;
  }

  return {
    state,
    setState,
    levelUp,
    setLevel,
    equipItem,
    unequipItem,
    takeDamage,
    heal,
    fullHeal,
    applyInjury,
    healInjury,
    addHospitalBill,
    payHospitalBill,
    addStatusEffect,
    removeStatusEffect,
    updateStatusEffects,
    incrementTasksCompleted,
    incrementTasksFailed,
    getSuccessChancePenalty,
    recalculateStats,
  };
}

/**
 * Character Store Type
 */
export type CharacterStore = ReturnType<typeof createCharacterStore>;
