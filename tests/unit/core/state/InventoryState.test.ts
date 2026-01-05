/**
 * InventoryState Tests
 * Tests for inventory management and item operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInventoryStore,
  createInitialInventoryState,
} from '../../../../src/core/state/InventoryState';
import type { WeaponItem, ArmorItem, ConsumableItem } from '../../../../src/core/types/items';

describe('InventoryState', () => {
  describe('createInitialInventoryState', () => {
    it('should create an inventory with default size', () => {
      const state = createInitialInventoryState();
      expect(state.slots).toHaveLength(20);
      expect(state.maxSlots).toBe(20);
      expect(state.gold).toBe(0);
      expect(state.quickSlots).toHaveLength(4);
    });

    it('should create an inventory with custom size', () => {
      const state = createInitialInventoryState(30);
      expect(state.slots).toHaveLength(30);
      expect(state.maxSlots).toBe(30);
    });

    it('should initialize all slots as empty', () => {
      const state = createInitialInventoryState();
      expect(state.slots.every((slot) => slot.item === null)).toBe(true);
      expect(state.slots.every((slot) => slot.quantity === 0)).toBe(true);
    });
  });

  describe('createInventoryStore', () => {
    let store: ReturnType<typeof createInventoryStore>;

    beforeEach(() => {
      store = createInventoryStore();
    });

    describe('addItem', () => {
      const testWeapon: WeaponItem = {
        id: 'test-sword',
        name: 'Test Sword',
        description: 'A test weapon',
        type: 'weapon',
        equipmentSlot: 'weapon',
        weaponType: 'sword',
        rarity: 'common',
        value: 10,
        icon: 'sword-icon',
        sellable: true,
        maxStack: 1,
        statBonuses: { power: 5 },
        damageRange: { min: 5, max: 10 },
      };

      const testConsumable: ConsumableItem = {
        id: 'test-potion',
        name: 'Test Potion',
        description: 'A test potion',
        type: 'consumable',
        consumableType: 'potion',
        rarity: 'common',
        value: 5,
        icon: 'potion-icon',
        sellable: true,
        maxStack: 99,
        healAmount: 25,
      };

      it('should add a non-stackable item to an empty slot', () => {
        const result = store.addItem(testWeapon, 1);

        expect(result.success).toBe(true);
        expect(result.itemsAdded).toHaveLength(1);
        expect(result.itemsAdded[0].quantity).toBe(1);
        expect(result.itemsOverflow).toHaveLength(0);
        expect(store.state.slots[0].item?.id).toBe('test-sword');
      });

      it('should add stackable items to an empty slot', () => {
        const result = store.addItem(testConsumable, 10);

        expect(result.success).toBe(true);
        expect(result.itemsAdded).toHaveLength(1);
        expect(result.itemsAdded[0].quantity).toBe(10);
        expect(store.state.slots[0].item?.id).toBe('test-potion');
        expect(store.state.slots[0].quantity).toBe(10);
      });

      it('should stack items with existing items', () => {
        store.addItem(testConsumable, 10);
        const result = store.addItem(testConsumable, 5);

        expect(result.success).toBe(true);
        expect(store.state.slots[0].quantity).toBe(15);
        // Should only use one slot
        expect(store.state.slots[1].item).toBe(null);
      });

      it('should split stacks when exceeding maxStack', () => {
        const result = store.addItem(testConsumable, 150);

        expect(result.success).toBe(true);
        // 99 in first slot, 51 in second slot
        expect(store.state.slots[0].quantity).toBe(99);
        expect(store.state.slots[1].quantity).toBe(51);
      });

      it('should return overflow when inventory is full', () => {
        // Fill inventory with non-stackable items
        for (let i = 0; i < store.state.maxSlots; i++) {
          store.addItem({ ...testWeapon, id: `sword-${i}` }, 1);
        }

        const result = store.addItem(testWeapon, 1);

        expect(result.success).toBe(false);
        expect(result.itemsOverflow).toHaveLength(1);
        expect(result.itemsOverflow[0].quantity).toBe(1);
        expect(result.failureReason).toBe('inventory-full');
      });

      it('should update metadata when adding items', () => {
        store.addItem(testWeapon, 1);

        expect(store.state.metadata.totalItemsCollected).toBe(1);
      });
    });

    describe('removeItem', () => {
      const testConsumable: ConsumableItem = {
        id: 'test-potion',
        name: 'Test Potion',
        description: 'A test potion',
        type: 'consumable',
        consumableType: 'potion',
        rarity: 'common',
        value: 5,
        icon: 'potion-icon',
        sellable: true,
        maxStack: 99,
        healAmount: 25,
      };

      it('should remove items from inventory', () => {
        store.addItem(testConsumable, 10);
        const result = store.removeItem('test-potion', 5);

        expect(result).toBe(true);
        expect(store.state.slots[0].quantity).toBe(5);
      });

      it('should clear slot when quantity reaches 0', () => {
        store.addItem(testConsumable, 5);
        store.removeItem('test-potion', 5);

        expect(store.state.slots[0].item).toBe(null);
        expect(store.state.slots[0].quantity).toBe(0);
      });

      it('should remove from multiple stacks', () => {
        store.addItem(testConsumable, 150); // Creates 2 stacks: 99 in slot 0, 51 in slot 1
        const result = store.removeItem('test-potion', 120);

        expect(result).toBe(true);
        // Removes all 99 from slot 0 and 21 from slot 1, leaving 30 in slot 1
        expect(store.state.slots[0].item).toBe(null);
        expect(store.state.slots[1].quantity).toBe(30);
      });

      it('should return false when trying to remove more than available', () => {
        store.addItem(testConsumable, 10);
        const result = store.removeItem('test-potion', 15);

        expect(result).toBe(false);
      });
    });

    describe('moveItem', () => {
      const testWeapon: WeaponItem = {
        id: 'test-sword',
        name: 'Test Sword',
        description: 'A test weapon',
        type: 'weapon',
        equipmentSlot: 'weapon',
        weaponType: 'sword',
        rarity: 'common',
        value: 10,
        icon: 'sword-icon',
        sellable: true,
        maxStack: 1,
        statBonuses: { power: 5 },
        damageRange: { min: 5, max: 10 },
      };

      const testConsumable: ConsumableItem = {
        id: 'test-potion',
        name: 'Test Potion',
        description: 'A test potion',
        type: 'consumable',
        consumableType: 'potion',
        rarity: 'common',
        value: 5,
        icon: 'potion-icon',
        sellable: true,
        maxStack: 99,
        healAmount: 25,
      };

      it('should move item to empty slot', () => {
        store.addItem(testWeapon, 1);
        const result = store.moveItem('slot-0', 'slot-5');

        expect(result).toBe(true);
        expect(store.state.slots[0].item).toBe(null);
        expect(store.state.slots[5].item?.id).toBe('test-sword');
      });

      it('should swap items between slots', () => {
        store.addItem(testWeapon, 1);
        store.addItem({ ...testWeapon, id: 'test-axe', name: 'Test Axe' }, 1);

        store.moveItem('slot-0', 'slot-1');

        expect(store.state.slots[0].item?.id).toBe('test-axe');
        expect(store.state.slots[1].item?.id).toBe('test-sword');
      });

      it('should stack items when moving to same item type', () => {
        store.addItem(testConsumable, 10);
        store.addItem(testConsumable, 20);

        store.moveItem('slot-1', 'slot-0');

        expect(store.state.slots[0].quantity).toBe(30);
        expect(store.state.slots[1].item).toBe(null);
      });
    });

    describe('gold management', () => {
      it('should add gold', () => {
        store.addGold(100);
        expect(store.state.gold).toBe(100);
      });

      it('should track total gold earned', () => {
        store.addGold(50);
        store.addGold(30);
        expect(store.state.metadata.totalGoldEarned).toBe(80);
      });

      it('should remove gold', () => {
        store.addGold(100);
        const result = store.removeGold(30);

        expect(result).toBe(true);
        expect(store.state.gold).toBe(70);
      });

      it('should fail to remove gold when insufficient', () => {
        store.addGold(10);
        const result = store.removeGold(20);

        expect(result).toBe(false);
        expect(store.state.gold).toBe(10);
      });
    });

    describe('utility functions', () => {
      const testConsumable: ConsumableItem = {
        id: 'test-potion',
        name: 'Test Potion',
        description: 'A test potion',
        type: 'consumable',
        consumableType: 'potion',
        rarity: 'common',
        value: 5,
        icon: 'potion-icon',
        sellable: true,
        maxStack: 99,
        healAmount: 25,
      };

      it('should get item count', () => {
        store.addItem(testConsumable, 50);
        store.addItem(testConsumable, 30);

        expect(store.getItemCount('test-potion')).toBe(80);
      });

      it('should check if inventory is full', () => {
        expect(store.isInventoryFull()).toBe(false);

        // Fill inventory
        for (let i = 0; i < store.state.maxSlots; i++) {
          store.addItem({ ...testConsumable, id: `potion-${i}` }, 1);
        }

        expect(store.isInventoryFull()).toBe(true);
      });

      it('should count empty slots', () => {
        expect(store.getEmptySlotCount()).toBe(20);

        store.addItem(testConsumable, 10);
        expect(store.getEmptySlotCount()).toBe(19);
      });

      it('should get item by ID', () => {
        store.addItem(testConsumable, 10);
        const item = store.getItem('test-potion');

        expect(item).not.toBe(null);
        expect(item?.id).toBe('test-potion');
      });
    });

    describe('compareItems', () => {
      const weapon1: WeaponItem = {
        id: 'weak-sword',
        name: 'Weak Sword',
        description: 'A weak weapon',
        type: 'weapon',
        equipmentSlot: 'weapon',
        weaponType: 'sword',
        rarity: 'common',
        value: 10,
        icon: 'sword-icon',
        sellable: true,
        maxStack: 1,
        statBonuses: { power: 3 },
        damageRange: { min: 3, max: 6 },
      };

      const weapon2: WeaponItem = {
        id: 'strong-sword',
        name: 'Strong Sword',
        description: 'A strong weapon',
        type: 'weapon',
        equipmentSlot: 'weapon',
        weaponType: 'sword',
        rarity: 'rare',
        value: 50,
        icon: 'sword-icon',
        sellable: true,
        maxStack: 1,
        statBonuses: { power: 8, focus: 2 },
        damageRange: { min: 8, max: 16 },
      };

      it('should compare two weapons', () => {
        const result = store.compareItems(weapon1, weapon2);

        expect(result.isUpgrade).toBe(true);
        expect(result.statDifferences.power).toBe(5);
        expect(result.statDifferences.focus).toBe(2);
      });

      it('should detect downgrade', () => {
        const result = store.compareItems(weapon2, weapon1);

        expect(result.isUpgrade).toBe(false);
        expect(result.statDifferences.power).toBe(-5);
      });

      it('should handle null current item', () => {
        const result = store.compareItems(null, weapon1);

        expect(result.isUpgrade).toBe(true);
        expect(result.currentItem).toBe(null);
      });
    });

    describe('filterItems', () => {
      const weapon: WeaponItem = {
        id: 'test-sword',
        name: 'Test Sword',
        description: 'A test weapon',
        type: 'weapon',
        equipmentSlot: 'weapon',
        weaponType: 'sword',
        rarity: 'rare',
        value: 50,
        icon: 'sword-icon',
        sellable: true,
        maxStack: 1,
        statBonuses: { power: 8 },
        damageRange: { min: 8, max: 16 },
      };

      const armor: ArmorItem = {
        id: 'test-armor',
        name: 'Test Armor',
        description: 'A test armor',
        type: 'armor',
        equipmentSlot: 'armor',
        armorType: 'medium',
        rarity: 'common',
        value: 30,
        icon: 'armor-icon',
        sellable: true,
        maxStack: 1,
        statBonuses: { defense: 5 },
        armorRating: 5,
      };

      beforeEach(() => {
        store.addItem(weapon, 1);
        store.addItem(armor, 1);
      });

      it('should filter by type', () => {
        const result = store.filterItems({ type: ['weapon'] });
        expect(result).toHaveLength(1);
        expect(result[0].item?.type).toBe('weapon');
      });

      it('should filter by rarity', () => {
        const result = store.filterItems({ rarity: ['rare'] });
        expect(result).toHaveLength(1);
        expect(result[0].item?.rarity).toBe('rare');
      });

      it('should filter by name query', () => {
        const result = store.filterItems({ nameQuery: 'sword' });
        expect(result).toHaveLength(1);
        expect(result[0].item?.name).toContain('Sword');
      });

      it('should sort by value', () => {
        const result = store.filterItems({ sortBy: 'value', sortDirection: 'desc' });
        expect(result[0].item?.value).toBe(50);
        expect(result[1].item?.value).toBe(30);
      });
    });
  });
});
