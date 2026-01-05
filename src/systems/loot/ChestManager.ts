/**
 * Chest Manager
 * Handles chest creation, storage, and opening with loot generation
 */

import type { Item } from '../../core/types/items';
import type { TaskType } from '../../core/types/tasks';
import { generateItem, type ItemGenerationContext } from './LootGenerator';
import { getLootTable, getWeightedItemTemplates } from '../../data/loot/lootTables';
import { getConsumable } from '../../data/items/consumables';
import {
  generateUUID,
  randomInt,
  randomChoice,
  weightedRandom,
  percentChance,
} from '../../utils/random';

/**
 * Chest rarity/quality tier
 * Affects number of items and quality of loot
 */
export type ChestQuality = 'basic' | 'quality' | 'superior' | 'masterwork';

/**
 * Chest data structure
 * Represents an unopened chest in inventory
 */
export interface Chest {
  /** Unique chest identifier */
  id: string;

  /** Chest quality tier */
  quality: ChestQuality;

  /** Task type this chest came from (determines loot table) */
  sourceTask: TaskType;

  /** Loot quality modifier from task */
  lootQuality: number;

  /** When the chest was earned */
  earnedAt: number;

  /** Whether chest has been opened */
  opened: boolean;
}

/**
 * Chest opening result
 * Contains all loot generated from opening a chest
 */
export interface ChestOpenResult {
  /** The chest that was opened */
  chest: Chest;

  /** Items looted from chest */
  items: Item[];

  /** Gold looted from chest */
  gold: number;

  /** Whether this was a "lucky" opening (bonus loot) */
  wasLucky: boolean;

  /** Total value of all loot */
  totalValue: number;
}

/**
 * Chest quality configuration
 */
interface ChestQualityConfig {
  quality: ChestQuality;
  minItems: number;
  maxItems: number;
  goldMultiplier: number;
  luckyChance: number; // Chance for bonus loot (0-100)
}

/**
 * Chest quality configurations
 */
const CHEST_QUALITY_CONFIGS: Record<ChestQuality, ChestQualityConfig> = {
  basic: {
    quality: 'basic',
    minItems: 1,
    maxItems: 2,
    goldMultiplier: 1.0,
    luckyChance: 5,
  },
  quality: {
    quality: 'quality',
    minItems: 2,
    maxItems: 3,
    goldMultiplier: 1.5,
    luckyChance: 10,
  },
  superior: {
    quality: 'superior',
    minItems: 3,
    maxItems: 4,
    goldMultiplier: 2.0,
    luckyChance: 20,
  },
  masterwork: {
    quality: 'masterwork',
    minItems: 4,
    maxItems: 6,
    goldMultiplier: 3.0,
    luckyChance: 30,
  },
};

/**
 * Create a new chest
 * @param sourceTask - Task that awarded this chest
 * @param lootQuality - Loot quality modifier from task
 * @param quality - Chest quality tier (defaults to basic)
 * @returns New chest
 */
export function createChest(
  sourceTask: TaskType,
  lootQuality: number = 1.0,
  quality: ChestQuality = 'basic'
): Chest {
  return {
    id: generateUUID(),
    quality,
    sourceTask,
    lootQuality,
    earnedAt: Date.now(),
    opened: false,
  };
}

/**
 * Open a chest and generate loot
 * @param chest - Chest to open
 * @param context - Item generation context
 * @returns Loot result
 */
export function openChest(chest: Chest, context: ItemGenerationContext): ChestOpenResult {
  if (chest.opened) {
    throw new Error('Chest has already been opened');
  }

  const config = CHEST_QUALITY_CONFIGS[chest.quality];
  const lootTable = getLootTable(chest.sourceTask);

  // Determine if this is a lucky opening (bonus loot)
  const wasLucky = percentChance(config.luckyChance + context.luck * 0.5);

  // Calculate number of items
  let itemCount = randomInt(config.minItems, config.maxItems);
  if (wasLucky) {
    itemCount += 1; // Bonus item on lucky roll
  }

  // Generate items
  const items: Item[] = [];
  for (let i = 0; i < itemCount; i++) {
    const item = generateChestItem(lootTable, context);
    if (item) {
      items.push(item);
    }
  }

  // Generate gold
  const baseGold = randomInt(10, 30);
  const gold = Math.floor(baseGold * config.goldMultiplier * chest.lootQuality);

  // Calculate total value
  const totalValue = items.reduce((sum, item) => sum + item.value, gold);

  // Mark chest as opened
  chest.opened = true;

  return {
    chest,
    items,
    gold,
    wasLucky,
    totalValue,
  };
}

/**
 * Generate a single item from loot table
 */
function generateChestItem(
  lootTable: ReturnType<typeof getLootTable>,
  context: ItemGenerationContext
): Item | null {
  // Determine if we generate equipment or consumable
  const typeRoll = randomInt(1, 100);
  const cumulativeWeights = {
    weapon: lootTable.typeWeights.weapon,
    armor: lootTable.typeWeights.weapon + lootTable.typeWeights.armor,
    accessory:
      lootTable.typeWeights.weapon + lootTable.typeWeights.armor + lootTable.typeWeights.accessory,
    consumable: 100, // Consumable fills remainder
  };

  // Select item type
  let selectedType: 'weapon' | 'armor' | 'accessory' | 'consumable' = 'consumable';
  if (typeRoll <= cumulativeWeights.weapon) {
    selectedType = 'weapon';
  } else if (typeRoll <= cumulativeWeights.armor) {
    selectedType = 'armor';
  } else if (typeRoll <= cumulativeWeights.accessory) {
    selectedType = 'accessory';
  }

  // Generate item based on type
  if (selectedType === 'consumable') {
    return generateChestConsumable(lootTable);
  } else {
    return generateChestEquipment(lootTable, selectedType, context);
  }
}

/**
 * Generate equipment item from loot table
 */
function generateChestEquipment(
  lootTable: ReturnType<typeof getLootTable>,
  itemType: 'weapon' | 'armor' | 'accessory',
  context: ItemGenerationContext
): Item | null {
  const templates = getWeightedItemTemplates(lootTable);
  const filteredTemplates = templates.filter((t) => t.type === itemType);

  if (filteredTemplates.length === 0) {
    return null;
  }

  const template = randomChoice(filteredTemplates);
  return generateItem(template, context);
}

/**
 * Generate consumable item from loot table
 */
function generateChestConsumable(lootTable: ReturnType<typeof getLootTable>): Item | null {
  if (lootTable.consumablePool.length === 0) {
    return null;
  }

  const consumableId = randomChoice(lootTable.consumablePool);
  const consumable = getConsumable(consumableId);

  if (!consumable) {
    return null;
  }

  // Return a copy with new ID (consumables are stackable)
  return {
    ...consumable,
    id: generateUUID(),
  };
}

/**
 * Get chest quality config
 */
export function getChestQualityConfig(quality: ChestQuality): ChestQualityConfig {
  return CHEST_QUALITY_CONFIGS[quality];
}

/**
 * Determine chest quality based on task outcome and luck
 * @param taskSuccess - Whether task was successful
 * @param luck - Character luck stat
 * @returns Chest quality
 */
export function determineChestQuality(taskSuccess: boolean, luck: number): ChestQuality {
  if (!taskSuccess) {
    return 'basic'; // Failed tasks give basic chests
  }

  // Success gives chance for better chests
  const qualities: ChestQuality[] = ['basic', 'quality', 'superior', 'masterwork'];
  const weights = qualities.map((_, index) => ({
    item: qualities[index],
    weight: Math.pow(2, qualities.length - index - 1) * (1 + luck * 0.02), // Higher luck increases better chest chances
  }));

  return weightedRandom(weights);
}

/**
 * Create multiple chests
 */
export function createChests(
  sourceTask: TaskType,
  count: number,
  lootQuality: number = 1.0,
  quality: ChestQuality = 'basic'
): Chest[] {
  const chests: Chest[] = [];
  for (let i = 0; i < count; i++) {
    chests.push(createChest(sourceTask, lootQuality, quality));
  }
  return chests;
}

/**
 * Batch open multiple chests
 */
export function openChests(chests: Chest[], context: ItemGenerationContext): ChestOpenResult[] {
  return chests.map((chest) => openChest(chest, context));
}

/**
 * Calculate estimated value of unopened chest
 */
export function estimateChestValue(chest: Chest): { min: number; max: number } {
  const config = CHEST_QUALITY_CONFIGS[chest.quality];

  // Rough estimate based on chest quality
  const baseMin = 20 * config.goldMultiplier;
  const baseMax = 100 * config.goldMultiplier;

  return {
    min: Math.floor(baseMin * chest.lootQuality),
    max: Math.floor(baseMax * chest.lootQuality),
  };
}

/**
 * Get display name for chest quality
 */
export function getChestQualityName(quality: ChestQuality): string {
  const names: Record<ChestQuality, string> = {
    basic: 'Basic Chest',
    quality: 'Quality Chest',
    superior: 'Superior Chest',
    masterwork: 'Masterwork Chest',
  };
  return names[quality];
}

/**
 * Get chest quality color for UI
 */
export function getChestQualityColor(quality: ChestQuality): string {
  const colors: Record<ChestQuality, string> = {
    basic: '#9CA3AF', // Gray
    quality: '#10B981', // Green
    superior: '#3B82F6', // Blue
    masterwork: '#A855F7', // Purple
  };
  return colors[quality];
}
