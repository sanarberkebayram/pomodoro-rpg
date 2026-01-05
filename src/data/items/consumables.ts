/**
 * Consumable Item Definitions
 * Potions, foods, scrolls, and other consumable items
 */

import type { ConsumableItem } from '../../core/types/items';

/**
 * Consumable items with fixed stats (not procedurally generated)
 * Each consumable has specific, predictable effects
 */

// POTIONS - Health restoration and injury healing
export const HEALTH_POTION_MINOR: ConsumableItem = {
  id: 'health-potion-minor',
  name: 'Minor Health Potion',
  description: 'Restores a small amount of health.',
  type: 'consumable',
  consumableType: 'potion',
  rarity: 'common',
  value: 10,
  icon: 'consumable-potion-health-minor',
  sellable: true,
  maxStack: 99,
  healAmount: 25,
};

export const HEALTH_POTION: ConsumableItem = {
  id: 'health-potion',
  name: 'Health Potion',
  description: 'Restores a moderate amount of health.',
  type: 'consumable',
  consumableType: 'potion',
  rarity: 'uncommon',
  value: 25,
  icon: 'consumable-potion-health',
  sellable: true,
  maxStack: 99,
  healAmount: 50,
};

export const HEALTH_POTION_MAJOR: ConsumableItem = {
  id: 'health-potion-major',
  name: 'Major Health Potion',
  description: 'Restores a large amount of health.',
  type: 'consumable',
  consumableType: 'potion',
  rarity: 'rare',
  value: 50,
  icon: 'consumable-potion-health-major',
  sellable: true,
  maxStack: 99,
  healAmount: 100,
};

export const HEALING_SALVE: ConsumableItem = {
  id: 'healing-salve',
  name: 'Healing Salve',
  description: 'Removes minor injuries and restores health.',
  type: 'consumable',
  consumableType: 'potion',
  rarity: 'uncommon',
  value: 40,
  icon: 'consumable-salve',
  sellable: true,
  maxStack: 50,
  healAmount: 30,
  curesInjury: true,
};

// ELIXIRS - Temporary stat buffs
export const ELIXIR_OF_STRENGTH: ConsumableItem = {
  id: 'elixir-of-strength',
  name: 'Elixir of Strength',
  description: 'Temporarily increases Power for one task.',
  type: 'consumable',
  consumableType: 'elixir',
  rarity: 'uncommon',
  value: 35,
  icon: 'consumable-elixir-strength',
  sellable: true,
  maxStack: 50,
  buffDuration: 30 * 60 * 1000, // 30 minutes
  buffStats: {
    power: 5,
  },
};

export const ELIXIR_OF_FORTITUDE: ConsumableItem = {
  id: 'elixir-of-fortitude',
  name: 'Elixir of Fortitude',
  description: 'Temporarily increases Defense for one task.',
  type: 'consumable',
  consumableType: 'elixir',
  rarity: 'uncommon',
  value: 35,
  icon: 'consumable-elixir-fortitude',
  sellable: true,
  maxStack: 50,
  buffDuration: 30 * 60 * 1000,
  buffStats: {
    defense: 5,
  },
};

export const ELIXIR_OF_FOCUS: ConsumableItem = {
  id: 'elixir-of-focus',
  name: 'Elixir of Focus',
  description: 'Temporarily increases Focus for one task.',
  type: 'consumable',
  consumableType: 'elixir',
  rarity: 'uncommon',
  value: 35,
  icon: 'consumable-elixir-focus',
  sellable: true,
  maxStack: 50,
  buffDuration: 30 * 60 * 1000,
  buffStats: {
    focus: 5,
  },
};

export const ELIXIR_OF_FORTUNE: ConsumableItem = {
  id: 'elixir-of-fortune',
  name: 'Elixir of Fortune',
  description: 'Temporarily increases Luck for one task.',
  type: 'consumable',
  consumableType: 'elixir',
  rarity: 'uncommon',
  value: 35,
  icon: 'consumable-elixir-fortune',
  sellable: true,
  maxStack: 50,
  buffDuration: 30 * 60 * 1000,
  buffStats: {
    luck: 5,
  },
};

export const GRAND_ELIXIR: ConsumableItem = {
  id: 'grand-elixir',
  name: 'Grand Elixir',
  description: 'Significantly boosts all stats for one task.',
  type: 'consumable',
  consumableType: 'elixir',
  rarity: 'epic',
  value: 100,
  icon: 'consumable-elixir-grand',
  sellable: true,
  maxStack: 20,
  buffDuration: 30 * 60 * 1000,
  buffStats: {
    power: 8,
    defense: 8,
    focus: 8,
    luck: 8,
  },
};

// FOOD - Small buffs with healing
export const BREAD: ConsumableItem = {
  id: 'bread',
  name: 'Bread',
  description: 'Simple bread that restores a small amount of health.',
  type: 'consumable',
  consumableType: 'food',
  rarity: 'common',
  value: 5,
  icon: 'consumable-food-bread',
  sellable: true,
  maxStack: 99,
  healAmount: 15,
};

export const COOKED_MEAT: ConsumableItem = {
  id: 'cooked-meat',
  name: 'Cooked Meat',
  description: 'Hearty meal that restores health and boosts Power.',
  type: 'consumable',
  consumableType: 'food',
  rarity: 'common',
  value: 15,
  icon: 'consumable-food-meat',
  sellable: true,
  maxStack: 99,
  healAmount: 20,
  buffDuration: 15 * 60 * 1000, // 15 minutes
  buffStats: {
    power: 2,
  },
};

export const FRUIT_BASKET: ConsumableItem = {
  id: 'fruit-basket',
  name: 'Fruit Basket',
  description: 'Fresh fruit that restores health and boosts Focus.',
  type: 'consumable',
  consumableType: 'food',
  rarity: 'common',
  value: 12,
  icon: 'consumable-food-fruit',
  sellable: true,
  maxStack: 99,
  healAmount: 20,
  buffDuration: 15 * 60 * 1000,
  buffStats: {
    focus: 2,
  },
};

export const TRAVELERS_RATIONS: ConsumableItem = {
  id: 'travelers-rations',
  name: "Traveler's Rations",
  description: 'Preserved food for long journeys. Modest health and stat boost.',
  type: 'consumable',
  consumableType: 'food',
  rarity: 'uncommon',
  value: 20,
  icon: 'consumable-food-rations',
  sellable: true,
  maxStack: 99,
  healAmount: 30,
  buffDuration: 30 * 60 * 1000,
  buffStats: {
    power: 3,
    defense: 3,
  },
};

export const FEAST: ConsumableItem = {
  id: 'feast',
  name: 'Feast',
  description: 'A magnificent meal that provides substantial benefits.',
  type: 'consumable',
  consumableType: 'food',
  rarity: 'rare',
  value: 75,
  icon: 'consumable-food-feast',
  sellable: true,
  maxStack: 20,
  healAmount: 75,
  buffDuration: 60 * 60 * 1000, // 60 minutes
  buffStats: {
    power: 5,
    defense: 5,
    focus: 5,
    luck: 5,
  },
};

// SCROLLS - Special effects (future: unique abilities)
export const SCROLL_OF_RECALL: ConsumableItem = {
  id: 'scroll-of-recall',
  name: 'Scroll of Recall',
  description: 'Returns you safely from any dangerous situation. (Future feature)',
  type: 'consumable',
  consumableType: 'scroll',
  rarity: 'rare',
  value: 50,
  icon: 'consumable-scroll-recall',
  sellable: true,
  maxStack: 10,
  // Special effect placeholder - for future implementation
};

export const SCROLL_OF_FORTUNE: ConsumableItem = {
  id: 'scroll-of-fortune',
  name: 'Scroll of Fortune',
  description: 'Greatly increases luck for the next task.',
  type: 'consumable',
  consumableType: 'scroll',
  rarity: 'rare',
  value: 60,
  icon: 'consumable-scroll-fortune',
  sellable: true,
  maxStack: 10,
  buffDuration: 30 * 60 * 1000,
  buffStats: {
    luck: 15,
  },
};

export const SCROLL_OF_PROTECTION: ConsumableItem = {
  id: 'scroll-of-protection',
  name: 'Scroll of Protection',
  description: 'Provides a powerful defensive barrier for one task.',
  type: 'consumable',
  consumableType: 'scroll',
  rarity: 'rare',
  value: 60,
  icon: 'consumable-scroll-protection',
  sellable: true,
  maxStack: 10,
  buffDuration: 30 * 60 * 1000,
  buffStats: {
    defense: 15,
  },
};

export const SCROLL_OF_CLARITY: ConsumableItem = {
  id: 'scroll-of-clarity',
  name: 'Scroll of Clarity',
  description: 'Sharpens the mind, greatly increasing Focus.',
  type: 'consumable',
  consumableType: 'scroll',
  rarity: 'rare',
  value: 60,
  icon: 'consumable-scroll-clarity',
  sellable: true,
  maxStack: 10,
  buffDuration: 30 * 60 * 1000,
  buffStats: {
    focus: 15,
  },
};

/**
 * All consumable items mapped by ID
 */
export const CONSUMABLES: Record<string, ConsumableItem> = {
  // Health potions
  [HEALTH_POTION_MINOR.id]: HEALTH_POTION_MINOR,
  [HEALTH_POTION.id]: HEALTH_POTION,
  [HEALTH_POTION_MAJOR.id]: HEALTH_POTION_MAJOR,
  [HEALING_SALVE.id]: HEALING_SALVE,

  // Elixirs
  [ELIXIR_OF_STRENGTH.id]: ELIXIR_OF_STRENGTH,
  [ELIXIR_OF_FORTITUDE.id]: ELIXIR_OF_FORTITUDE,
  [ELIXIR_OF_FOCUS.id]: ELIXIR_OF_FOCUS,
  [ELIXIR_OF_FORTUNE.id]: ELIXIR_OF_FORTUNE,
  [GRAND_ELIXIR.id]: GRAND_ELIXIR,

  // Food
  [BREAD.id]: BREAD,
  [COOKED_MEAT.id]: COOKED_MEAT,
  [FRUIT_BASKET.id]: FRUIT_BASKET,
  [TRAVELERS_RATIONS.id]: TRAVELERS_RATIONS,
  [FEAST.id]: FEAST,

  // Scrolls
  [SCROLL_OF_RECALL.id]: SCROLL_OF_RECALL,
  [SCROLL_OF_FORTUNE.id]: SCROLL_OF_FORTUNE,
  [SCROLL_OF_PROTECTION.id]: SCROLL_OF_PROTECTION,
  [SCROLL_OF_CLARITY.id]: SCROLL_OF_CLARITY,
};

/**
 * Get consumable by ID
 */
export function getConsumable(id: string): ConsumableItem | null {
  return CONSUMABLES[id] ?? null;
}

/**
 * Get all consumables
 */
export function getAllConsumables(): ConsumableItem[] {
  return Object.values(CONSUMABLES);
}

/**
 * Get consumables by type
 */
export function getConsumablesByType(
  consumableType: ConsumableItem['consumableType']
): ConsumableItem[] {
  return Object.values(CONSUMABLES).filter((c) => c.consumableType === consumableType);
}

/**
 * Get healing items (items with healAmount)
 */
export function getHealingItems(): ConsumableItem[] {
  return Object.values(CONSUMABLES).filter((c) => c.healAmount && c.healAmount > 0);
}

/**
 * Get buff items (items with buffStats)
 */
export function getBuffItems(): ConsumableItem[] {
  return Object.values(CONSUMABLES).filter((c) => c.buffStats !== undefined);
}
