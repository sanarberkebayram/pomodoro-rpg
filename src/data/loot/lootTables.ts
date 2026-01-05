/**
 * Loot Table Configurations
 * Defines item drop pools for different task types
 */

import type { TaskType } from '../../core/types/tasks';
import type { ItemTemplate } from '../../core/types/items';
import { getWeaponTemplatesByType } from '../items/weapons';
import { getArmorTemplatesByType } from '../items/armor';

/**
 * Loot table for a specific task type
 * Defines which items can drop from chests earned in that task
 */
export interface LootTable {
  /** Task type this loot table applies to */
  taskType: TaskType;

  /** Item templates that can drop */
  itemPool: ItemTemplate[];

  /** Consumable IDs that can drop */
  consumablePool: string[];

  /** Weight distribution for item types */
  typeWeights: {
    weapon: number;
    armor: number;
    accessory: number;
    consumable: number;
  };
}

/**
 * Expedition Loot Table
 * Balanced loot with focus on materials and utility
 * - Moderate weapons and armor
 * - Good consumable drops
 * - Focus on exploration gear (bows, staffs, light armor)
 */
export const EXPEDITION_LOOT_TABLE: LootTable = {
  taskType: 'expedition',
  itemPool: [
    // Weapons - Focus on ranged and utility
    ...getWeaponTemplatesByType('bow'),
    ...getWeaponTemplatesByType('staff'),
    ...getWeaponTemplatesByType('dagger'),
    ...getWeaponTemplatesByType('spear'),

    // Armor - Light and medium for mobility
    ...getArmorTemplatesByType('light'),
    ...getArmorTemplatesByType('robe'),
    ...getArmorTemplatesByType('medium').slice(0, 2), // Only first 2 medium armors
  ],
  consumablePool: [
    'health-potion-minor',
    'health-potion',
    'bread',
    'cooked-meat',
    'fruit-basket',
    'travelers-rations',
    'elixir-of-focus',
    'elixir-of-fortune',
  ],
  typeWeights: {
    weapon: 30,
    armor: 30,
    accessory: 10,
    consumable: 30,
  },
};

/**
 * Raid Loot Table
 * Combat-focused loot with high-value equipment
 * - Heavy weapons and armor
 * - Better gold and equipment quality
 * - Combat-oriented gear (swords, axes, heavy armor)
 */
export const RAID_LOOT_TABLE: LootTable = {
  taskType: 'raid',
  itemPool: [
    // Weapons - Focus on melee combat
    ...getWeaponTemplatesByType('sword'),
    ...getWeaponTemplatesByType('axe'),
    ...getWeaponTemplatesByType('mace'),
    ...getWeaponTemplatesByType('spear'),

    // Armor - Heavy and medium for protection
    ...getArmorTemplatesByType('heavy'),
    ...getArmorTemplatesByType('medium'),
  ],
  consumablePool: [
    'health-potion',
    'health-potion-major',
    'healing-salve',
    'elixir-of-strength',
    'elixir-of-fortitude',
    'travelers-rations',
    'feast',
    'scroll-of-protection',
    'grand-elixir',
  ],
  typeWeights: {
    weapon: 40,
    armor: 40,
    accessory: 10,
    consumable: 10,
  },
};

/**
 * Craft Loot Table (Post-MVP)
 * Crafting materials and consumables
 */
export const CRAFT_LOOT_TABLE: LootTable = {
  taskType: 'craft',
  itemPool: [
    // Minimal equipment, mostly materials
    ...getWeaponTemplatesByType('dagger').slice(0, 2),
    ...getArmorTemplatesByType('light').slice(0, 2),
  ],
  consumablePool: [
    'health-potion-minor',
    'health-potion',
    'healing-salve',
    'bread',
    'cooked-meat',
    'fruit-basket',
    'elixir-of-focus',
  ],
  typeWeights: {
    weapon: 10,
    armor: 10,
    accessory: 10,
    consumable: 70,
  },
};

/**
 * Hunt Loot Table (Post-MVP)
 * Rare materials and luck-based gear
 */
export const HUNT_LOOT_TABLE: LootTable = {
  taskType: 'hunt',
  itemPool: [
    // Focus on agility and luck gear
    ...getWeaponTemplatesByType('bow'),
    ...getWeaponTemplatesByType('dagger'),
    ...getArmorTemplatesByType('light'),
  ],
  consumablePool: [
    'cooked-meat',
    'fruit-basket',
    'travelers-rations',
    'elixir-of-fortune',
    'scroll-of-fortune',
  ],
  typeWeights: {
    weapon: 35,
    armor: 35,
    accessory: 15,
    consumable: 15,
  },
};

/**
 * Rest Loot Table (Post-MVP)
 * Healing items only
 */
export const REST_LOOT_TABLE: LootTable = {
  taskType: 'rest',
  itemPool: [], // No equipment drops
  consumablePool: [
    'health-potion-minor',
    'health-potion',
    'health-potion-major',
    'healing-salve',
    'bread',
    'fruit-basket',
  ],
  typeWeights: {
    weapon: 0,
    armor: 0,
    accessory: 0,
    consumable: 100,
  },
};

/**
 * All loot tables indexed by task type
 */
export const LOOT_TABLES: Record<TaskType, LootTable> = {
  expedition: EXPEDITION_LOOT_TABLE,
  raid: RAID_LOOT_TABLE,
  craft: CRAFT_LOOT_TABLE,
  hunt: HUNT_LOOT_TABLE,
  rest: REST_LOOT_TABLE,
};

/**
 * Get loot table for a specific task type
 */
export function getLootTable(taskType: TaskType): LootTable {
  return LOOT_TABLES[taskType];
}

/**
 * Get item templates from loot table by weighted random selection
 */
export function getWeightedItemTemplates(lootTable: LootTable): ItemTemplate[] {
  // Filter out templates that don't have items
  const availableTypes: Array<keyof LootTable['typeWeights']> = [];

  if (lootTable.typeWeights.weapon > 0 && lootTable.itemPool.some((t) => t.type === 'weapon')) {
    availableTypes.push('weapon');
  }
  if (lootTable.typeWeights.armor > 0 && lootTable.itemPool.some((t) => t.type === 'armor')) {
    availableTypes.push('armor');
  }
  if (
    lootTable.typeWeights.accessory > 0 &&
    lootTable.itemPool.some((t) => t.type === 'accessory')
  ) {
    availableTypes.push('accessory');
  }

  // Filter pool by available types (excluding consumables which are handled separately)
  return lootTable.itemPool.filter((template) =>
    availableTypes.includes(template.type as keyof LootTable['typeWeights'])
  );
}

/**
 * Check if task type has equipment drops
 */
export function hasEquipmentDrops(taskType: TaskType): boolean {
  const lootTable = getLootTable(taskType);
  return lootTable.itemPool.length > 0;
}

/**
 * Check if task type has consumable drops
 */
export function hasConsumableDrops(taskType: TaskType): boolean {
  const lootTable = getLootTable(taskType);
  return lootTable.consumablePool.length > 0;
}
