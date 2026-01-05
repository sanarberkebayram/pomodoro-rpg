/**
 * Inventory State Management
 * Manages player inventory, items, gold, and equipment
 */

import { createStore, produce } from 'solid-js/store';
import type {
  InventoryState,
  InventorySlot,
  Item,
  EquippableItem,
  ItemComparisonResult,
  StackOperationResult,
  ItemFilter,
} from '../types/items';
import type { CharacterStats } from '../types/character';

/** Default inventory size */
const DEFAULT_INVENTORY_SIZE = 20;

/**
 * Create an empty inventory slot
 */
function createEmptySlot(slotId: string): InventorySlot {
  return {
    slotId,
    item: null,
    quantity: 0,
    locked: false,
  };
}

/**
 * Create initial inventory state
 */
export function createInitialInventoryState(
  maxSlots: number = DEFAULT_INVENTORY_SIZE
): InventoryState {
  const slots: InventorySlot[] = [];
  for (let i = 0; i < maxSlots; i++) {
    slots.push(createEmptySlot(`slot-${i}`));
  }

  return {
    slots,
    maxSlots,
    gold: 0,
    quickSlots: [null, null, null, null], // 4 quick slots
    metadata: {
      totalItemsCollected: 0,
      totalGoldEarned: 0,
      mostValuableItemId: null,
    },
  };
}

/**
 * Inventory State Store
 * Provides reactive inventory state and management functions
 */
export function createInventoryStore(initialState?: InventoryState) {
  const [state, setState] = createStore<InventoryState>(
    initialState ?? createInitialInventoryState()
  );

  /**
   * Find item by ID in inventory
   */
  function findItemById(itemId: string): { slot: InventorySlot; index: number } | null {
    for (let i = 0; i < state.slots.length; i++) {
      const slot = state.slots[i];
      if (slot.item?.id === itemId) {
        return { slot, index: i };
      }
    }
    return null;
  }

  /**
   * Find first empty slot
   */
  function findEmptySlot(): number {
    for (let i = 0; i < state.slots.length; i++) {
      if (!state.slots[i].item && !state.slots[i].locked) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Find slot with stackable item of same type
   */
  function _findStackableSlot(item: Item): number {
    if (item.maxStack <= 1) return -1;

    for (let i = 0; i < state.slots.length; i++) {
      const slot = state.slots[i];
      if (slot.item && slot.item.id === item.id && slot.quantity < item.maxStack && !slot.locked) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Check if inventory is full
   */
  function isInventoryFull(): boolean {
    return findEmptySlot() === -1;
  }

  /**
   * Get count of empty slots
   */
  function getEmptySlotCount(): number {
    return state.slots.filter((slot) => !slot.item && !slot.locked).length;
  }

  /**
   * Get total count of a specific item
   */
  function getItemCount(itemId: string): number {
    return state.slots.reduce((count, slot) => {
      if (slot.item?.id === itemId) {
        return count + slot.quantity;
      }
      return count;
    }, 0);
  }

  /**
   * Add item to inventory with stacking logic
   */
  function addItem(item: Item, quantity: number = 1): StackOperationResult {
    if (quantity <= 0) {
      return {
        success: false,
        itemsAdded: [],
        itemsOverflow: [],
        failureReason: 'invalid-item',
      };
    }

    const result: StackOperationResult = {
      success: false,
      itemsAdded: [],
      itemsOverflow: [],
    };

    let remainingQuantity = quantity;

    setState(
      produce((draft) => {
        // First, try to stack with existing items
        if (item.maxStack > 1) {
          for (let i = 0; i < draft.slots.length && remainingQuantity > 0; i++) {
            const slot = draft.slots[i];
            if (
              slot.item &&
              slot.item.id === item.id &&
              slot.quantity < item.maxStack &&
              !slot.locked
            ) {
              const availableSpace = item.maxStack - slot.quantity;
              const amountToAdd = Math.min(availableSpace, remainingQuantity);

              slot.quantity += amountToAdd;
              remainingQuantity -= amountToAdd;

              result.itemsAdded.push({
                item,
                quantity: amountToAdd,
                slotId: slot.slotId,
              });
            }
          }
        }

        // Then, fill empty slots
        for (let i = 0; i < draft.slots.length && remainingQuantity > 0; i++) {
          const slot = draft.slots[i];
          if (!slot.item && !slot.locked) {
            const amountToAdd = Math.min(item.maxStack, remainingQuantity);

            slot.item = { ...item };
            slot.quantity = amountToAdd;
            remainingQuantity -= amountToAdd;

            result.itemsAdded.push({
              item,
              quantity: amountToAdd,
              slotId: slot.slotId,
            });
          }
        }

        // Update metadata
        draft.metadata.totalItemsCollected += quantity - remainingQuantity;

        // Track most valuable item
        if (
          !draft.metadata.mostValuableItemId ||
          item.value > (findItemById(draft.metadata.mostValuableItemId)?.slot.item?.value ?? 0)
        ) {
          draft.metadata.mostValuableItemId = item.id;
        }
      })
    );

    // Handle overflow
    if (remainingQuantity > 0) {
      result.itemsOverflow.push({
        item,
        quantity: remainingQuantity,
      });
      result.failureReason = 'inventory-full';
    }

    result.success = result.itemsAdded.length > 0;
    return result;
  }

  /**
   * Remove item from inventory
   */
  function removeItem(itemId: string, quantity: number = 1): boolean {
    if (quantity <= 0) return false;

    let remainingToRemove = quantity;

    setState(
      produce((draft) => {
        for (let i = 0; i < draft.slots.length && remainingToRemove > 0; i++) {
          const slot = draft.slots[i];
          if (slot.item?.id === itemId) {
            const amountToRemove = Math.min(slot.quantity, remainingToRemove);
            slot.quantity -= amountToRemove;
            remainingToRemove -= amountToRemove;

            // Clear slot if empty
            if (slot.quantity <= 0) {
              slot.item = null;
              slot.quantity = 0;
            }
          }
        }
      })
    );

    return remainingToRemove === 0;
  }

  /**
   * Move item between slots
   */
  function moveItem(fromSlotId: string, toSlotId: string): boolean {
    const fromIndex = state.slots.findIndex((s) => s.slotId === fromSlotId);
    const toIndex = state.slots.findIndex((s) => s.slotId === toSlotId);

    if (fromIndex === -1 || toIndex === -1) return false;

    const fromSlot = state.slots[fromIndex];
    const toSlot = state.slots[toIndex];

    if (!fromSlot.item || toSlot.locked) return false;

    setState(
      produce((draft) => {
        const tempItem = draft.slots[fromIndex].item;
        const tempQuantity = draft.slots[fromIndex].quantity;

        // Early return if source item is null (shouldn't happen due to earlier check)
        if (!tempItem) return;

        // If destination has same item and is stackable, try to stack
        if (toSlot.item && toSlot.item.id === tempItem.id && tempItem.maxStack > 1) {
          const availableSpace = tempItem.maxStack - toSlot.quantity;
          const amountToMove = Math.min(availableSpace, tempQuantity);

          draft.slots[toIndex].quantity += amountToMove;
          draft.slots[fromIndex].quantity -= amountToMove;

          // Clear source slot if empty
          if (draft.slots[fromIndex].quantity <= 0) {
            draft.slots[fromIndex].item = null;
            draft.slots[fromIndex].quantity = 0;
          }
        } else {
          // Swap items
          draft.slots[fromIndex].item = draft.slots[toIndex].item;
          draft.slots[fromIndex].quantity = draft.slots[toIndex].quantity;
          draft.slots[toIndex].item = tempItem;
          draft.slots[toIndex].quantity = tempQuantity;
        }
      })
    );

    return true;
  }

  /**
   * Add gold
   */
  function addGold(amount: number): void {
    if (amount <= 0) return;

    setState(
      produce((draft) => {
        draft.gold += amount;
        draft.metadata.totalGoldEarned += amount;
      })
    );
  }

  /**
   * Remove gold
   */
  function removeGold(amount: number): boolean {
    if (amount <= 0 || state.gold < amount) return false;

    setState(
      produce((draft) => {
        draft.gold -= amount;
      })
    );

    return true;
  }

  /**
   * Get item by ID (returns first occurrence)
   */
  function getItem(itemId: string): Item | null {
    const result = findItemById(itemId);
    return result?.slot.item ?? null;
  }

  /**
   * Compare two equippable items
   */
  function compareItems(
    currentItem: EquippableItem | null,
    newItem: EquippableItem
  ): ItemComparisonResult {
    const statDifferences: Partial<CharacterStats> = {};
    let isUpgrade = false;

    if (currentItem) {
      // Calculate stat differences
      const currentStats = currentItem.statBonuses;
      const newStats = newItem.statBonuses;

      const statKeys: (keyof typeof newStats)[] = ['power', 'defense', 'focus', 'luck'];

      for (const stat of statKeys) {
        const currentValue = currentStats[stat] ?? 0;
        const newValue = newStats[stat] ?? 0;
        const diff = newValue - currentValue;

        if (diff !== 0) {
          statDifferences[stat] = diff;
        }
      }

      // Determine if it's an upgrade (any positive stat difference)
      isUpgrade = Object.values(statDifferences).some((diff) => diff > 0);
    } else {
      // No current item, any stats are an upgrade
      statDifferences.power = newItem.statBonuses.power ?? 0;
      statDifferences.defense = newItem.statBonuses.defense ?? 0;
      statDifferences.focus = newItem.statBonuses.focus ?? 0;
      statDifferences.luck = newItem.statBonuses.luck ?? 0;
      isUpgrade = Object.values(statDifferences).some((diff) => diff > 0);
    }

    const valueDifference = newItem.value - (currentItem?.value ?? 0);

    return {
      currentItem,
      newItem,
      statDifferences,
      isUpgrade,
      valueDifference,
    };
  }

  /**
   * Filter inventory slots
   */
  function filterItems(filter: ItemFilter): InventorySlot[] {
    let filtered = state.slots.filter((slot) => slot.item !== null);

    // Filter by type
    if (filter.type && filter.type.length > 0) {
      const typeFilter = filter.type;
      filtered = filtered.filter((slot) => slot.item && typeFilter.includes(slot.item.type));
    }

    // Filter by rarity
    if (filter.rarity && filter.rarity.length > 0) {
      const rarityFilter = filter.rarity;
      filtered = filtered.filter((slot) => slot.item && rarityFilter.includes(slot.item.rarity));
    }

    // Filter by name query
    if (filter.nameQuery) {
      const query = filter.nameQuery.toLowerCase();
      filtered = filtered.filter(
        (slot) => slot.item && slot.item.name.toLowerCase().includes(query)
      );
    }

    // Filter by equipment slot
    if (filter.equipmentSlot && filter.equipmentSlot.length > 0) {
      const equipSlotFilter = filter.equipmentSlot;
      filtered = filtered.filter((slot) => {
        const item = slot.item as EquippableItem;
        return item.equipmentSlot && equipSlotFilter.includes(item.equipmentSlot);
      });
    }

    // Filter by stat bonuses
    if (filter.hasStatBonuses && filter.hasStatBonuses.length > 0) {
      const statFilter = filter.hasStatBonuses;
      filtered = filtered.filter((slot) => {
        const item = slot.item as EquippableItem;
        if (!item.statBonuses) return false;

        return statFilter.some((stat) => {
          return item.statBonuses[stat as keyof typeof item.statBonuses] !== undefined;
        });
      });
    }

    // Sort
    if (filter.sortBy) {
      const direction = filter.sortDirection === 'desc' ? -1 : 1;

      filtered.sort((a, b) => {
        // Items are guaranteed to exist due to filter on line 399
        if (!a.item || !b.item) return 0;
        const itemA = a.item;
        const itemB = b.item;

        switch (filter.sortBy) {
          case 'name':
            return direction * itemA.name.localeCompare(itemB.name);
          case 'rarity': {
            const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
            return (
              direction * (rarityOrder.indexOf(itemA.rarity) - rarityOrder.indexOf(itemB.rarity))
            );
          }
          case 'value':
            return direction * (itemA.value - itemB.value);
          case 'type':
            return direction * itemA.type.localeCompare(itemB.type);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }

  /**
   * Get equipped item from character (requires external character state)
   */
  function getEquippedItemStats(itemId: string): Partial<CharacterStats> {
    const item = getItem(itemId) as EquippableItem;
    return item?.statBonuses ?? {};
  }

  /**
   * Clear inventory (for testing or reset)
   */
  function clearInventory(): void {
    setState(
      produce((draft) => {
        for (const slot of draft.slots) {
          if (!slot.locked) {
            slot.item = null;
            slot.quantity = 0;
          }
        }
      })
    );
  }

  /**
   * Set quick slot
   */
  function setQuickSlot(slotIndex: number, itemId: string | null): boolean {
    if (slotIndex < 0 || slotIndex >= state.quickSlots.length) return false;

    setState(
      produce((draft) => {
        draft.quickSlots[slotIndex] = itemId;
      })
    );

    return true;
  }

  /**
   * Get items by type
   */
  function getItemsByType(type: Item['type']): InventorySlot[] {
    return state.slots.filter((slot) => slot.item?.type === type);
  }

  /**
   * Get items by rarity
   */
  function getItemsByRarity(rarity: Item['rarity']): InventorySlot[] {
    return state.slots.filter((slot) => slot.item?.rarity === rarity);
  }

  /**
   * Get all non-empty slots
   */
  function getOccupiedSlots(): InventorySlot[] {
    return state.slots.filter((slot) => slot.item !== null);
  }

  return {
    state,
    setState,
    addItem,
    removeItem,
    moveItem,
    addGold,
    removeGold,
    getItem,
    findItemById,
    getItemCount,
    isInventoryFull,
    getEmptySlotCount,
    compareItems,
    filterItems,
    getEquippedItemStats,
    clearInventory,
    setQuickSlot,
    getItemsByType,
    getItemsByRarity,
    getOccupiedSlots,
  };
}

/**
 * Inventory Store Type
 */
export type InventoryStore = ReturnType<typeof createInventoryStore>;
