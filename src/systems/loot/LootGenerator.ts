/**
 * Loot Generator
 * Procedurally generates items from templates with randomized stats and rarities
 */

import type {
  Item,
  ItemTemplate,
  ItemRarity,
  WeaponItem,
  ArmorItem,
  AccessoryItem,
  ConsumableItem,
} from '../../core/types/items';
import type { CharacterStats } from '../../core/types/character';
import { generateUUID, randomInt, randomChoice } from '../../utils/random';
import { selectRarity, applyRarityMultiplier, applyValueMultiplier } from './RaritySystem';

/**
 * Item generation context
 * Provides information about the character and situation for loot generation
 */
export interface ItemGenerationContext {
  /** Character level affects item power scaling */
  characterLevel: number;

  /** Character luck stat affects rarity chances */
  luck: number;

  /** Loot quality modifier from task (affects rarity and stats) */
  lootQuality: number;

  /** Force specific rarity (optional) */
  forceRarity?: ItemRarity;
}

/**
 * Generate a procedural item from a template
 * @param template - Item template to generate from
 * @param context - Generation context (character level, luck, etc.)
 * @returns Generated item
 */
export function generateItem(template: ItemTemplate, context: ItemGenerationContext): Item {
  // Determine rarity (forced or random)
  const rarity = context.forceRarity ?? selectRarity(context.luck * context.lootQuality);

  // Generate base item properties
  const baseItem = {
    id: generateUUID(),
    name: generateItemName(template, rarity),
    description: template.description,
    type: template.type,
    rarity,
    value: calculateItemValue(template, rarity, context.characterLevel),
    icon: template.icon,
    sellable: true,
    maxStack: 1,
  };

  // Generate type-specific item
  switch (template.type) {
    case 'weapon':
      return generateWeapon(baseItem, template, rarity, context);
    case 'armor':
      return generateArmor(baseItem, template, rarity, context);
    case 'accessory':
      return generateAccessory(baseItem, template, rarity, context);
    case 'consumable':
      return generateConsumable(baseItem, template);
    case 'material':
      return generateMaterial(baseItem, template);
    default:
      throw new Error(`Unknown item type: ${template.type}`);
  }
}

/**
 * Generate item name with rarity prefix
 */
function generateItemName(template: ItemTemplate, rarity: ItemRarity): string {
  if (rarity === 'common') {
    return template.name;
  }

  const rarityPrefixes: Record<Exclude<ItemRarity, 'common'>, string[]> = {
    uncommon: ['Fine', 'Quality', 'Superior', 'Refined'],
    rare: ['Exceptional', 'Masterwork', 'Pristine', 'Exquisite'],
    epic: ['Legendary', 'Mythic', 'Fabled', 'Renowned'],
    legendary: ['Ancient', 'Divine', 'Celestial', 'Eternal', 'Godlike'],
  };

  if (rarity === 'common') {
    return template.name;
  }

  const prefix = randomChoice(rarityPrefixes[rarity]);
  return `${prefix} ${template.name}`;
}

/**
 * Calculate item value based on level and rarity
 */
function calculateItemValue(
  template: ItemTemplate,
  rarity: ItemRarity,
  characterLevel: number
): number {
  // Base value scales with character level (1-5 gold per level)
  const baseValue = 10 + characterLevel * randomInt(1, 5);
  return applyValueMultiplier(baseValue, rarity);
}

/**
 * Generate stat bonuses from template stat ranges
 */
function generateStatBonuses(
  template: ItemTemplate,
  rarity: ItemRarity
): Partial<Omit<CharacterStats, 'health' | 'maxHealth'>> {
  const stats: Partial<Omit<CharacterStats, 'health' | 'maxHealth'>> = {};

  if (!template.statRanges) {
    return stats;
  }

  // Generate each stat within its range
  if (template.statRanges.power) {
    const [min, max] = template.statRanges.power;
    stats.power = applyRarityMultiplier(randomInt(min, max), rarity);
  }

  if (template.statRanges.defense) {
    const [min, max] = template.statRanges.defense;
    stats.defense = applyRarityMultiplier(randomInt(min, max), rarity);
  }

  if (template.statRanges.focus) {
    const [min, max] = template.statRanges.focus;
    stats.focus = applyRarityMultiplier(randomInt(min, max), rarity);
  }

  if (template.statRanges.luck) {
    const [min, max] = template.statRanges.luck;
    stats.luck = applyRarityMultiplier(randomInt(min, max), rarity);
  }

  return stats;
}

/**
 * Generate weapon item
 */
function generateWeapon(
  baseItem: Omit<Item, 'type'>,
  template: ItemTemplate,
  rarity: ItemRarity,
  context: ItemGenerationContext
): WeaponItem {
  if (!template.weaponType) {
    throw new Error('Weapon template must have weaponType');
  }

  const statBonuses = generateStatBonuses(template, rarity);

  // Calculate damage range based on stats and level
  const baseDamage = (statBonuses.power ?? 5) + context.characterLevel;
  const damageVariance = Math.max(3, Math.floor(baseDamage * 0.3));

  return {
    ...baseItem,
    type: 'weapon',
    equipmentSlot: 'weapon',
    weaponType: template.weaponType,
    statBonuses,
    damageRange: {
      min: Math.max(1, baseDamage - damageVariance),
      max: baseDamage + damageVariance,
    },
  };
}

/**
 * Generate armor item
 */
function generateArmor(
  baseItem: Omit<Item, 'type'>,
  template: ItemTemplate,
  rarity: ItemRarity,
  context: ItemGenerationContext
): ArmorItem {
  if (!template.armorType) {
    throw new Error('Armor template must have armorType');
  }

  const statBonuses = generateStatBonuses(template, rarity);

  // Calculate armor rating based on defense stat and level
  const baseArmor = (statBonuses.defense ?? 3) + Math.floor(context.characterLevel / 2);

  return {
    ...baseItem,
    type: 'armor',
    equipmentSlot: 'armor',
    armorType: template.armorType,
    statBonuses,
    armorRating: applyRarityMultiplier(baseArmor, rarity),
  };
}

/**
 * Generate accessory item
 */
function generateAccessory(
  baseItem: Omit<Item, 'type'>,
  template: ItemTemplate,
  rarity: ItemRarity,
  _context: ItemGenerationContext
): AccessoryItem {
  if (!template.accessoryType) {
    throw new Error('Accessory template must have accessoryType');
  }

  const statBonuses = generateStatBonuses(template, rarity);

  // Special effects for higher rarities (placeholder for future feature)
  let specialEffect: string | undefined;
  if (rarity === 'epic' || rarity === 'legendary') {
    specialEffect = 'Grants a mystical aura (effect to be implemented)';
  }

  return {
    ...baseItem,
    type: 'accessory',
    equipmentSlot: 'accessory',
    accessoryType: template.accessoryType,
    statBonuses,
    specialEffect,
  };
}

/**
 * Generate consumable item (non-procedural, uses fixed definitions)
 */
function generateConsumable(baseItem: Omit<Item, 'type'>, template: ItemTemplate): ConsumableItem {
  if (!template.consumableType) {
    throw new Error('Consumable template must have consumableType');
  }

  // Consumables are not procedurally generated - they have fixed effects
  // This is a placeholder that should reference the consumables data
  return {
    ...baseItem,
    type: 'consumable',
    consumableType: template.consumableType,
    maxStack: 99,
  };
}

/**
 * Generate material item
 */
function generateMaterial(baseItem: Omit<Item, 'type'>, template: ItemTemplate): Item {
  if (!template.materialType) {
    throw new Error('Material template must have materialType');
  }

  return {
    ...baseItem,
    type: 'material',
    materialType: template.materialType,
    tier: 1, // Base tier for now
    maxStack: 999,
  };
}

/**
 * Generate multiple items
 */
export function generateItems(
  templates: ItemTemplate[],
  context: ItemGenerationContext,
  count: number = 1
): Item[] {
  const items: Item[] = [];

  for (let i = 0; i < count; i++) {
    const template = randomChoice(templates);
    items.push(generateItem(template, context));
  }

  return items;
}

/**
 * Generate gold reward
 */
export function generateGold(min: number, max: number, luckModifier: number = 0): number {
  const baseGold = randomInt(min, max);
  const luckBonus = Math.floor(baseGold * luckModifier * 0.1);
  return baseGold + luckBonus;
}

/**
 * Generate materials reward
 */
export function generateMaterials(min: number, max: number): number {
  return randomInt(min, max);
}

/**
 * Generate XP reward
 */
export function generateXP(min: number, max: number): number {
  return randomInt(min, max);
}
