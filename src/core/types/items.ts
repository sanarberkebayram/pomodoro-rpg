/**
 * Item System Type Definitions
 * Defines items, inventory slots, equipment, and loot
 */

import type { CharacterStats, EquipmentSlot } from './character';

/**
 * Item rarity levels
 * Affects stat bonuses, value, and visual appearance
 */
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * Item category types
 */
export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';

/**
 * Rarity display properties
 * Colors and visual styling for each rarity tier
 */
export interface RarityConfig {
  /** Rarity tier */
  rarity: ItemRarity;

  /** Display name */
  name: string;

  /** Color hex code */
  color: string;

  /** Stat multiplier (1.0 = base, 2.0 = double stats) */
  statMultiplier: number;

  /** Value multiplier for gold price */
  valueMultiplier: number;

  /** Drop rate weight (higher = more common) */
  dropWeight: number;
}

/**
 * Base item interface
 * All items extend this base structure
 */
export interface BaseItem {
  /** Unique item identifier */
  id: string;

  /** Item name */
  name: string;

  /** Item description */
  description: string;

  /** Item type category */
  type: ItemType;

  /** Rarity tier */
  rarity: ItemRarity;

  /** Base gold value */
  value: number;

  /** Icon/sprite identifier */
  icon: string;

  /** Whether this item can be sold */
  sellable: boolean;

  /** Maximum stack size (1 = non-stackable) */
  maxStack: number;
}

/**
 * Weapon item
 * Equippable in weapon slot, provides combat and task bonuses
 */
export interface WeaponItem extends BaseItem {
  type: 'weapon';

  /** Equipment slot (always weapon for WeaponItem) */
  equipmentSlot: 'weapon';

  /** Stat bonuses when equipped */
  statBonuses: Partial<Omit<CharacterStats, 'health' | 'maxHealth'>>;

  /** Weapon-specific properties */
  weaponType: 'sword' | 'axe' | 'staff' | 'bow' | 'dagger' | 'mace' | 'spear';

  /** Damage range (min-max) */
  damageRange: {
    min: number;
    max: number;
  };
}

/**
 * Armor item
 * Equippable in armor slot, provides defensive bonuses
 */
export interface ArmorItem extends BaseItem {
  type: 'armor';

  /** Equipment slot (always armor for ArmorItem) */
  equipmentSlot: 'armor';

  /** Stat bonuses when equipped */
  statBonuses: Partial<Omit<CharacterStats, 'health' | 'maxHealth'>>;

  /** Armor-specific properties */
  armorType: 'light' | 'medium' | 'heavy' | 'robe';

  /** Armor rating (damage reduction) */
  armorRating: number;
}

/**
 * Accessory item
 * Equippable in accessory slot, provides utility bonuses
 */
export interface AccessoryItem extends BaseItem {
  type: 'accessory';

  /** Equipment slot (always accessory for AccessoryItem) */
  equipmentSlot: 'accessory';

  /** Stat bonuses when equipped */
  statBonuses: Partial<Omit<CharacterStats, 'health' | 'maxHealth'>>;

  /** Accessory-specific properties */
  accessoryType: 'ring' | 'amulet' | 'charm' | 'trinket';

  /** Special effect description (for future special abilities) */
  specialEffect?: string;
}

/**
 * Consumable item
 * Single-use items that provide immediate effects
 */
export interface ConsumableItem extends BaseItem {
  type: 'consumable';

  /** Consumable-specific properties */
  consumableType: 'potion' | 'food' | 'scroll' | 'elixir';

  /** Immediate stat restoration */
  effectStats?: Partial<CharacterStats>;

  /** Health restoration amount */
  healAmount?: number;

  /** Remove injury effect */
  curesInjury?: boolean;

  /** Duration of temporary buff (ms) */
  buffDuration?: number;

  /** Temporary stat bonuses */
  buffStats?: Partial<Omit<CharacterStats, 'health' | 'maxHealth'>>;
}

/**
 * Material item
 * Crafting materials and quest items (future feature)
 */
export interface MaterialItem extends BaseItem {
  type: 'material';

  /** Material-specific properties */
  materialType: 'ore' | 'wood' | 'leather' | 'cloth' | 'gem' | 'essence';

  /** Crafting tier */
  tier: number;
}

/**
 * Union type of all item types
 */
export type Item = WeaponItem | ArmorItem | AccessoryItem | ConsumableItem | MaterialItem;

/**
 * Equippable item union type
 */
export type EquippableItem = WeaponItem | ArmorItem | AccessoryItem;

/**
 * Inventory slot
 * Represents a single slot in the inventory with item and stack count
 */
export interface InventorySlot {
  /** Slot identifier (for UI positioning) */
  slotId: string;

  /** Item in this slot (null if empty) */
  item: Item | null;

  /** Stack count (1 for non-stackable items) */
  quantity: number;

  /** Whether slot is locked/unavailable */
  locked: boolean;
}

/**
 * Inventory state
 * Complete player inventory
 */
export interface InventoryState {
  /** All inventory slots (fixed size grid) */
  slots: InventorySlot[];

  /** Maximum inventory capacity */
  maxSlots: number;

  /** Currently held gold */
  gold: number;

  /** Quick access slots (future feature) */
  quickSlots: (string | null)[];

  /** Inventory metadata */
  metadata: {
    /** Total items collected */
    totalItemsCollected: number;

    /** Total gold earned */
    totalGoldEarned: number;

    /** Most valuable item ID */
    mostValuableItemId: string | null;
  };
}

/**
 * Item comparison result
 * Compares two items for stat differences
 */
export interface ItemComparisonResult {
  /** Item being compared to (currently equipped) */
  currentItem: EquippableItem | null;

  /** Item being evaluated (new item) */
  newItem: EquippableItem;

  /** Stat differences (positive = upgrade, negative = downgrade) */
  statDifferences: Partial<CharacterStats>;

  /** Whether new item is an upgrade */
  isUpgrade: boolean;

  /** Value difference in gold */
  valueDifference: number;
}

/**
 * Item generation template
 * Used by loot generator to create procedural items
 */
export interface ItemTemplate {
  /** Template identifier */
  id: string;

  /** Base item properties */
  name: string;
  description: string;
  type: ItemType;
  icon: string;

  /** Stat generation rules */
  statRanges?: {
    power?: [number, number];
    defense?: [number, number];
    focus?: [number, number];
    luck?: [number, number];
  };

  /** Item-specific properties template */
  weaponType?: WeaponItem['weaponType'];
  armorType?: ArmorItem['armorType'];
  accessoryType?: AccessoryItem['accessoryType'];
  consumableType?: ConsumableItem['consumableType'];
  materialType?: MaterialItem['materialType'];
}

/**
 * Loot drop configuration
 * Defines item drop chances and quantities
 */
export interface LootDropConfig {
  /** Item template ID or specific item ID */
  itemId: string;

  /** Drop chance (0-1) */
  dropChance: number;

  /** Quantity range */
  quantity: {
    min: number;
    max: number;
  };

  /** Rarity override (if null, use random) */
  rarityOverride?: ItemRarity;

  /** Conditions for drop (future feature) */
  conditions?: {
    minLevel?: number;
    maxLevel?: number;
    requiredClass?: string[];
  };
}

/**
 * Item filter
 * Used for searching/filtering inventory
 */
export interface ItemFilter {
  /** Filter by item type */
  type?: ItemType[];

  /** Filter by rarity */
  rarity?: ItemRarity[];

  /** Filter by name (search query) */
  nameQuery?: string;

  /** Filter by equipment slot */
  equipmentSlot?: EquipmentSlot[];

  /** Filter by stat bonuses (has any of these stats) */
  hasStatBonuses?: (keyof CharacterStats)[];

  /** Sort order */
  sortBy?: 'name' | 'rarity' | 'value' | 'type';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Item stack operation result
 * Result of attempting to add items to inventory
 */
export interface StackOperationResult {
  /** Whether operation succeeded */
  success: boolean;

  /** Items successfully added */
  itemsAdded: {
    item: Item;
    quantity: number;
    slotId: string;
  }[];

  /** Items that couldn't be added (inventory full) */
  itemsOverflow: {
    item: Item;
    quantity: number;
  }[];

  /** Reason for failure (if any) */
  failureReason?: 'inventory-full' | 'item-not-stackable' | 'invalid-item';
}
