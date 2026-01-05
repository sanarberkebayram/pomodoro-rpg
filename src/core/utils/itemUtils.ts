/**
 * Item Utility Functions
 * Helper functions for working with items, equipment, and stat bonuses
 */

import type { Item, EquippableItem, InventoryState } from '../types/items';
import type { CharacterStats, EquipmentItem } from '../types/character';

/**
 * Extract stat bonuses from an equippable item
 */
export function getItemStatBonuses(item: EquippableItem): Partial<CharacterStats> {
  return { ...item.statBonuses };
}

/**
 * Get equipment bonuses from equipped items
 * Looks up items in inventory and aggregates their stat bonuses
 */
export function getEquipmentBonuses(
  equipment: {
    weapon: EquipmentItem | null;
    armor: EquipmentItem | null;
    accessory: EquipmentItem | null;
  },
  inventory: InventoryState
): Partial<CharacterStats> {
  const bonuses: Partial<CharacterStats> = {};

  // Helper function to add bonuses from an item
  const addItemBonuses = (itemId: string | undefined) => {
    if (!itemId) return;

    // Find item in inventory
    const slot = inventory.slots.find((s) => s.item?.id === itemId);
    if (!slot?.item) return;

    const item = slot.item as EquippableItem;
    if (!item.statBonuses) return;

    // Aggregate bonuses
    Object.entries(item.statBonuses).forEach(([stat, value]) => {
      if (value !== undefined) {
        const key = stat as keyof CharacterStats;
        bonuses[key] = (bonuses[key] ?? 0) + value;
      }
    });
  };

  // Add bonuses from each equipment slot
  addItemBonuses(equipment.weapon?.itemId);
  addItemBonuses(equipment.armor?.itemId);
  addItemBonuses(equipment.accessory?.itemId);

  return bonuses;
}

/**
 * Check if an item is equippable
 */
export function isEquippableItem(item: Item): item is EquippableItem {
  return item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
}

/**
 * Get total value of all stat bonuses (for comparison)
 */
export function getTotalStatValue(stats: Partial<CharacterStats>): number {
  return Object.values(stats).reduce((sum, value) => sum + (value ?? 0), 0);
}

/**
 * Compare two items by their total stat value
 */
export function compareItemsByStatValue(item1: EquippableItem, item2: EquippableItem): number {
  const value1 = getTotalStatValue(item1.statBonuses);
  const value2 = getTotalStatValue(item2.statBonuses);
  return value2 - value1; // Higher is better
}

/**
 * Get equipment slot for an equippable item
 */
export function getEquipmentSlotForItem(item: EquippableItem): EquippableItem['equipmentSlot'] {
  return item.equipmentSlot;
}

/**
 * Format stat bonus for display (+5 Power, -2 Defense, etc.)
 */
export function formatStatBonus(stat: keyof CharacterStats, value: number): string {
  const statNames: Record<keyof CharacterStats, string> = {
    power: 'Power',
    defense: 'Defense',
    focus: 'Focus',
    luck: 'Luck',
    health: 'Health',
    maxHealth: 'Max Health',
  };

  const sign = value >= 0 ? '+' : '';
  return `${sign}${value} ${statNames[stat]}`;
}

/**
 * Get stat bonuses as formatted strings
 */
export function formatStatBonuses(stats: Partial<CharacterStats>): string[] {
  return Object.entries(stats)
    .filter(([, value]) => value !== undefined && value !== 0)
    .map(([stat, value]) => formatStatBonus(stat as keyof CharacterStats, value as number));
}
