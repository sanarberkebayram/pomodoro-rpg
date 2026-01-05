/**
 * EventEffectApplier - Applies event effects to game state
 * Handles all side effects of events on character, inventory, and tasks
 */

import { GameEvent, EventEffects } from '@/core/types/events';
import { SetStoreFunction } from 'solid-js/store';
import { CharacterState } from '@/core/types/character';
import { InventoryState } from '@/core/types/items';
import { ActiveTask } from '@/core/types/tasks';

/**
 * Result of applying event effects
 */
export interface EventEffectResult {
  /** Whether effects were successfully applied */
  success: boolean;

  /** Effects that were applied */
  appliedEffects: string[];

  /** Effects that were blocked or failed */
  blockedEffects: string[];

  /** State changes made */
  stateChanges: {
    goldChange?: number;
    healthChange?: number;
    materialsChange?: number;
    successChanceChange?: number;
    durabilityChange?: number;
    chestsGained?: number;
    xpChange?: number;
  };
}

/**
 * EventEffectApplier class
 * Applies event effects to game state stores
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EventEffectApplier {
  /**
   * Apply all effects from an event to game state
   */
  public static applyEventEffects(
    event: GameEvent,
    characterState: CharacterState,
    setCharacterState: SetStoreFunction<CharacterState>,
    inventoryState: InventoryState,
    setInventoryState: SetStoreFunction<InventoryState>,
    activeTask: ActiveTask | null,
    setActiveTask: SetStoreFunction<ActiveTask | null>
  ): EventEffectResult {
    const result: EventEffectResult = {
      success: true,
      appliedEffects: [],
      blockedEffects: [],
      stateChanges: {},
    };

    const effects = event.effects;

    // Apply gold modifier
    if (effects.goldModifier !== undefined) {
      this.applyGoldModifier(effects.goldModifier, inventoryState, setInventoryState, result);
    }

    // Apply health modifier
    if (effects.healthModifier !== undefined) {
      this.applyHealthModifier(effects.healthModifier, characterState, setCharacterState, result);
    }

    // Apply materials modifier
    if (effects.materialsModifier !== undefined) {
      this.applyMaterialsModifier(
        effects.materialsModifier,
        inventoryState,
        setInventoryState,
        result
      );
    }

    // Apply success chance modifier (to active task)
    if (effects.successChanceModifier !== undefined && activeTask) {
      this.applySuccessModifier(effects.successChanceModifier, activeTask, setActiveTask, result);
    }

    // Apply durability damage (to equipped items)
    if (effects.durabilityDamage !== undefined) {
      this.applyDurabilityDamage(
        effects.durabilityDamage,
        characterState,
        setCharacterState,
        result
      );
    }

    // Apply extra chests
    if (effects.extraChests !== undefined) {
      this.applyExtraChests(effects.extraChests, inventoryState, setInventoryState, result);
    }

    // Apply XP modifier
    if (effects.xpModifier !== undefined) {
      this.applyXpModifier(effects.xpModifier, characterState, setCharacterState, result);
    }

    // Apply loot quality modifier (stored for later use)
    if (effects.lootQualityModifier !== undefined) {
      result.appliedEffects.push(
        `Loot quality ${effects.lootQualityModifier > 0 ? '+' : ''}${effects.lootQualityModifier}`
      );
      // Note: This is applied during loot generation, not here
    }

    return result;
  }

  /**
   * Apply gold modifier to inventory
   */
  private static applyGoldModifier(
    modifier: number,
    inventoryState: InventoryState,
    setInventoryState: SetStoreFunction<InventoryState>,
    result: EventEffectResult
  ): void {
    const currentGold = inventoryState.gold;
    const newGold = Math.max(0, currentGold + modifier); // Can't go below 0

    setInventoryState('gold', newGold);

    result.stateChanges.goldChange = newGold - currentGold;
    result.appliedEffects.push(`Gold ${modifier > 0 ? '+' : ''}${modifier}`);
  }

  /**
   * Apply health modifier to character
   */
  private static applyHealthModifier(
    modifier: number,
    characterState: CharacterState,
    setCharacterState: SetStoreFunction<CharacterState>,
    result: EventEffectResult
  ): void {
    const currentHp = characterState.currentHp;
    const maxHp = characterState.maxHp;

    // Calculate new HP (bounded by 0 and maxHp)
    const newHp = Math.max(0, Math.min(maxHp, currentHp + modifier));

    setCharacterState('currentHp', newHp);

    result.stateChanges.healthChange = newHp - currentHp;
    result.appliedEffects.push(`HP ${modifier > 0 ? '+' : ''}${modifier}`);

    // Check if character was knocked to 0 HP
    if (newHp === 0 && currentHp > 0) {
      result.appliedEffects.push('Character knocked out!');
    }
  }

  /**
   * Apply materials modifier to inventory
   */
  private static applyMaterialsModifier(
    modifier: number,
    inventoryState: InventoryState,
    setInventoryState: SetStoreFunction<InventoryState>,
    result: EventEffectResult
  ): void {
    const currentMaterials = inventoryState.materials;
    const newMaterials = Math.max(0, currentMaterials + modifier);

    setInventoryState('materials', newMaterials);

    result.stateChanges.materialsChange = newMaterials - currentMaterials;
    result.appliedEffects.push(`Materials ${modifier > 0 ? '+' : ''}${modifier}`);
  }

  /**
   * Apply success chance modifier to active task
   */
  private static applySuccessModifier(
    modifier: number,
    activeTask: ActiveTask,
    setActiveTask: SetStoreFunction<ActiveTask | null>,
    result: EventEffectResult
  ): void {
    const currentChance = activeTask.calculatedSuccessChance;
    const newChance = Math.max(0, Math.min(100, currentChance + modifier));

    setActiveTask('calculatedSuccessChance', newChance);

    result.stateChanges.successChanceChange = newChance - currentChance;
    result.appliedEffects.push(`Success chance ${modifier > 0 ? '+' : ''}${modifier.toFixed(1)}%`);
  }

  /**
   * Apply durability damage to equipped items
   */
  private static applyDurabilityDamage(
    damage: number,
    characterState: CharacterState,
    setCharacterState: SetStoreFunction<CharacterState>,
    result: EventEffectResult
  ): void {
    let totalDamage = 0;

    // Damage weapon if equipped
    if (characterState.equippedWeapon) {
      const weapon = characterState.equippedWeapon;
      const currentDurability = weapon.durability || 100;
      const newDurability = Math.max(0, currentDurability - damage);

      setCharacterState('equippedWeapon', 'durability', newDurability);
      totalDamage += currentDurability - newDurability;

      if (newDurability === 0) {
        result.appliedEffects.push('Weapon broken!');
      }
    }

    // Damage armor if equipped
    if (characterState.equippedArmor) {
      const armor = characterState.equippedArmor;
      const currentDurability = armor.durability || 100;
      const newDurability = Math.max(0, currentDurability - damage);

      setCharacterState('equippedArmor', 'durability', newDurability);
      totalDamage += currentDurability - newDurability;

      if (newDurability === 0) {
        result.appliedEffects.push('Armor broken!');
      }
    }

    if (totalDamage > 0) {
      result.stateChanges.durabilityChange = -totalDamage;
      result.appliedEffects.push(`Durability -${totalDamage.toFixed(0)}`);
    } else {
      result.blockedEffects.push('No equipped items to damage');
    }
  }

  /**
   * Apply extra chests to inventory
   */
  private static applyExtraChests(
    chests: number,
    inventoryState: InventoryState,
    setInventoryState: SetStoreFunction<InventoryState>,
    result: EventEffectResult
  ): void {
    const currentChests = inventoryState.unopenedChests || 0;
    const newChests = currentChests + chests;

    setInventoryState('unopenedChests', newChests);

    result.stateChanges.chestsGained = chests;
    result.appliedEffects.push(`+${chests} chest${chests > 1 ? 's' : ''}`);
  }

  /**
   * Apply XP modifier to character
   */
  private static applyXpModifier(
    modifier: number,
    characterState: CharacterState,
    setCharacterState: SetStoreFunction<CharacterState>,
    result: EventEffectResult
  ): void {
    const currentXp = characterState.experience;
    const newXp = Math.max(0, currentXp + modifier);

    setCharacterState('experience', newXp);

    result.stateChanges.xpChange = newXp - currentXp;
    result.appliedEffects.push(`XP ${modifier > 0 ? '+' : ''}${modifier}`);
  }

  /**
   * Get a summary string of effect results
   */
  public static getEffectSummary(result: EventEffectResult): string {
    if (result.appliedEffects.length === 0) {
      return 'No effects applied';
    }

    return result.appliedEffects.join(', ');
  }

  /**
   * Check if event effects would be harmful
   */
  public static isHarmfulEvent(effects: EventEffects): boolean {
    return (
      (effects.goldModifier !== undefined && effects.goldModifier < 0) ||
      (effects.healthModifier !== undefined && effects.healthModifier < 0) ||
      (effects.materialsModifier !== undefined && effects.materialsModifier < 0) ||
      (effects.successChanceModifier !== undefined && effects.successChanceModifier < 0) ||
      (effects.durabilityDamage !== undefined && effects.durabilityDamage > 0)
    );
  }

  /**
   * Check if event effects would be beneficial
   */
  public static isBeneficialEvent(effects: EventEffects): boolean {
    return (
      (effects.goldModifier !== undefined && effects.goldModifier > 0) ||
      (effects.healthModifier !== undefined && effects.healthModifier > 0) ||
      (effects.materialsModifier !== undefined && effects.materialsModifier > 0) ||
      (effects.successChanceModifier !== undefined && effects.successChanceModifier > 0) ||
      (effects.extraChests !== undefined && effects.extraChests > 0) ||
      (effects.xpModifier !== undefined && effects.xpModifier > 0) ||
      (effects.lootQualityModifier !== undefined && effects.lootQualityModifier > 0)
    );
  }

  /**
   * Get net impact score of effects (-100 to +100)
   */
  public static getImpactScore(effects: EventEffects): number {
    let score = 0;

    // Gold impact (1 point per gold)
    if (effects.goldModifier) {
      score += effects.goldModifier * 0.5;
    }

    // Health impact (2 points per HP)
    if (effects.healthModifier) {
      score += effects.healthModifier * 2;
    }

    // Materials impact (1 point per material)
    if (effects.materialsModifier) {
      score += effects.materialsModifier * 1;
    }

    // Success chance impact (3 points per %)
    if (effects.successChanceModifier) {
      score += effects.successChanceModifier * 3;
    }

    // Durability damage (negative impact, 1 point per durability)
    if (effects.durabilityDamage) {
      score -= effects.durabilityDamage * 1;
    }

    // Extra chests (big positive, 50 points per chest)
    if (effects.extraChests) {
      score += effects.extraChests * 50;
    }

    // XP impact (0.5 points per XP)
    if (effects.xpModifier) {
      score += effects.xpModifier * 0.5;
    }

    // Loot quality (10 points per quality level)
    if (effects.lootQualityModifier) {
      score += effects.lootQualityModifier * 10;
    }

    // Clamp to -100 to +100
    return Math.max(-100, Math.min(100, score));
  }
}
