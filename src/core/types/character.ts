/**
 * Character System Type Definitions
 * Defines character stats, classes, equipment, and state
 */

/**
 * Core character stats
 * These stats determine success in tasks, combat, and loot quality
 */
export interface CharacterStats {
  /** Overall strength - affects task success and damage */
  power: number;

  /** Damage reduction - mitigates damage from failures and combat */
  defense: number;

  /** Success/crit chance - increases task success rate and critical hits */
  focus: number;

  /** Loot quality - improves rarity and quality of drops */
  luck: number;

  /** Current health points */
  health: number;

  /** Maximum health points */
  maxHealth: number;
}

/**
 * Character class types
 * MVP: Only Vanguard is available
 * Post-MVP: Arcanist (high variance), Rogue (utility)
 */
export type CharacterClass = 'Vanguard' | 'Arcanist' | 'Rogue';

/**
 * Character class configuration
 * Defines base stats and bonuses for each class
 */
export interface ClassConfig {
  /** Class identifier */
  id: CharacterClass;

  /** Display name */
  name: string;

  /** Class description */
  description: string;

  /** Base stats at level 1 */
  baseStats: CharacterStats;

  /** Stat growth per level */
  statGrowth: Omit<CharacterStats, 'health' | 'maxHealth'> & { maxHealth: number };

  /** Available in current version */
  available: boolean;
}

/**
 * Equipment slot types
 */
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

/**
 * Equipment item reference
 * Links to an item in the inventory
 */
export interface EquipmentItem {
  /** Item ID from inventory */
  itemId: string;

  /** Equipment slot */
  slot: EquipmentSlot;
}

/**
 * Injury state
 * Represents character injury status from task failures
 */
export interface InjuryState {
  /** Whether character is currently injured */
  isInjured: boolean;

  /** Injury severity (affects success chance penalty) */
  severity: 'minor' | 'moderate' | 'severe';

  /** Success chance penalty percentage (0-100) */
  successPenalty: number;

  /** Timestamp when injury occurred */
  injuredAt: number | null;
}

/**
 * Hospital bill state
 * Tracks unpaid medical debts
 */
export interface HospitalBill {
  /** Bill amount in gold */
  amount: number;

  /** Timestamp when bill was created */
  createdAt: number;

  /** Success chance penalty while unpaid */
  penalty: number;
}

/**
 * Character status effects
 * Temporary buffs/debuffs affecting stats
 */
export interface StatusEffect {
  /** Effect identifier */
  id: string;

  /** Effect name */
  name: string;

  /** Effect type */
  type: 'buff' | 'debuff';

  /** Stat modifications */
  statModifiers: Partial<Omit<CharacterStats, 'health' | 'maxHealth'>>;

  /** Duration in milliseconds (null = permanent until removed) */
  duration: number | null;

  /** Timestamp when effect was applied */
  appliedAt: number;

  /** Stack count (for stackable effects) */
  stacks: number;
}

/**
 * Complete character state
 * Represents the full state of the player's character
 */
export interface CharacterState {
  /** Character's chosen class */
  class: CharacterClass;

  /** Current level */
  level: number;

  /** Base stats (before equipment and effects) */
  baseStats: CharacterStats;

  /** Computed stats (after equipment and effects) */
  computedStats: CharacterStats;

  /** Equipped items by slot */
  equipment: {
    weapon: EquipmentItem | null;
    armor: EquipmentItem | null;
    accessory: EquipmentItem | null;
  };

  /** Current injury state */
  injury: InjuryState;

  /** Unpaid hospital bill (null if no debt) */
  hospitalBill: HospitalBill | null;

  /** Active status effects */
  statusEffects: StatusEffect[];

  /** Character metadata */
  metadata: {
    /** Timestamp when character was created */
    createdAt: number;

    /** Total tasks completed */
    tasksCompleted: number;

    /** Total tasks failed */
    tasksFailed: number;
  };
}

/**
 * Character creation data
 * Required information to create a new character
 */
export interface CharacterCreationData {
  /** Selected class */
  class: CharacterClass;
}

/**
 * Stat calculation context
 * Used for computing final stats with all modifiers
 */
export interface StatCalculationContext {
  /** Base stats from character level */
  baseStats: CharacterStats;

  /** Stat bonuses from equipped items */
  equipmentBonuses: Partial<CharacterStats>;

  /** Stat modifiers from status effects */
  statusEffectModifiers: Partial<CharacterStats>;

  /** Injury penalties */
  injuryPenalties: Partial<CharacterStats>;

  /** Hospital bill penalties */
  billPenalties: Partial<CharacterStats>;
}

/**
 * Character stat change event
 * Emitted when character stats are modified
 */
export interface CharacterStatChangeEvent {
  /** Stats before change */
  previousStats: CharacterStats;

  /** Stats after change */
  newStats: CharacterStats;

  /** Reason for stat change */
  reason: 'level-up' | 'equipment' | 'status-effect' | 'injury' | 'healing';

  /** Timestamp of change */
  timestamp: number;
}
