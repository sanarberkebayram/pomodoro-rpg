/**
 * EquipmentSlots Component
 * Displays character equipment slots with drag-and-drop equipping
 */

import { Component, Show, For, createSignal } from 'solid-js';
import type { CharacterStore } from '../../core/state/CharacterState';
import type { InventoryStore } from '../../core/state/InventoryState';
import type { EquippableItem, Item } from '../../core/types/items';
import type { EquipmentSlot } from '../../core/types/character';
import { ItemCard } from '../common/ItemCard';
import { ItemTooltip } from '../common/ItemTooltip';
import { getEquipmentBonuses } from '../../core/utils/itemUtils';

interface EquipmentSlotsProps {
  characterStore: CharacterStore;
  inventoryStore: InventoryStore;
  /** Whether equipment is locked (during work phase) */
  locked?: boolean;
  /** Callback when item is unequipped */
  onUnequip?: (slot: EquipmentSlot) => void;
}

/**
 * Slot display configuration
 */
const SLOT_CONFIG: Record<
  EquipmentSlot,
  {
    label: string;
    icon: string;
    description: string;
  }
> = {
  weapon: {
    label: 'Weapon',
    icon: '⚔️',
    description: 'Main hand weapon for attacks',
  },
  armor: {
    label: 'Armor',
    icon: '🛡️',
    description: 'Body armor for defense',
  },
  accessory: {
    label: 'Accessory',
    icon: '💍',
    description: 'Special item with unique bonuses',
  },
};

/**
 * EquipmentSlots - Character equipment display with drag-and-drop
 */
export const EquipmentSlots: Component<EquipmentSlotsProps> = (props) => {
  const [selectedSlot, setSelectedSlot] = createSignal<EquipmentSlot | null>(null);
  const [dragOverSlot, setDragOverSlot] = createSignal<EquipmentSlot | null>(null);

  const characterState = () => props.characterStore.state;
  const inventoryState = () => props.inventoryStore.state;

  /**
   * Get equipped item for a slot
   */
  const getEquippedItem = (slot: EquipmentSlot): Item | null => {
    const equipment = characterState().equipment[slot];
    if (!equipment) return null;

    return props.inventoryStore.getItem(equipment.itemId);
  };

  /**
   * Handle unequip action
   */
  const handleUnequip = (slot: EquipmentSlot) => {
    if (props.locked) return;

    const unequipped = props.characterStore.unequipItem(slot);
    if (unequipped) {
      props.onUnequip?.(slot);
    }
    setSelectedSlot(null);

    // Recalculate stats with updated equipment
    const equipmentBonuses = getEquipmentBonuses(characterState().equipment, inventoryState());
    props.characterStore.recalculateStats(equipmentBonuses);
  };

  /**
   * Handle equip action from inventory drag-and-drop
   */
  const handleDrop = (slot: EquipmentSlot) => (e: DragEvent) => {
    if (props.locked) return;

    e.preventDefault();
    const sourceSlotId = e.dataTransfer?.getData('text/plain');

    if (sourceSlotId) {
      const sourceSlot = inventoryState().slots.find((s) => s.slotId === sourceSlotId);
      const item = sourceSlot?.item as EquippableItem | undefined;

      // Check if item can be equipped in this slot
      if (item && item.equipmentSlot === slot) {
        // Unequip current item if any
        const currentEquipment = characterState().equipment[slot];
        if (currentEquipment) {
          props.characterStore.unequipItem(slot);
        }

        // Equip new item
        props.characterStore.equipItem(slot, item.id);

        // Recalculate stats
        const equipmentBonuses = getEquipmentBonuses(characterState().equipment, inventoryState());
        props.characterStore.recalculateStats(equipmentBonuses);
      }
    }

    setDragOverSlot(null);
  };

  /**
   * Handle drag over
   */
  const handleDragOver = (slot: EquipmentSlot) => (e: DragEvent) => {
    if (props.locked) return;

    e.preventDefault();
    setDragOverSlot(slot);

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  /**
   * Equipment slots to render
   */
  const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];

  return (
    <div class="flex flex-col h-full">
      {/* Header */}
      <div class="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-300 px-4 py-3">
        <h2 class="text-lg font-bold text-gray-800">Equipment</h2>
        <p class="text-sm text-gray-600">Drag items from inventory to equip</p>
      </div>

      {/* Locked overlay */}
      <Show when={props.locked}>
        <div class="bg-red-100 border-b-2 border-red-300 px-4 py-2">
          <p class="text-sm text-red-700 font-semibold text-center">
            🔒 Equipment locked during work phase
          </p>
        </div>
      </Show>

      {/* Equipment slots */}
      <div class="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        <For each={slots}>
          {(slot) => {
            const config = SLOT_CONFIG[slot];
            const equippedItem = () => getEquippedItem(slot);
            const isSelected = () => selectedSlot() === slot;
            const isDragOver = () => dragOverSlot() === slot;

            return (
              <div
                class={`
                  border-2
                  rounded-lg
                  p-4
                  bg-white
                  transition-all
                  ${isDragOver() ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300'}
                  ${isSelected() ? 'ring-2 ring-purple-500' : ''}
                `}
                onDragOver={handleDragOver(slot)}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop(slot)}
              >
                {/* Slot header */}
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl" aria-hidden="true">
                      {config.icon}
                    </span>
                    <div>
                      <h3 class="font-bold text-gray-800">{config.label}</h3>
                      <p class="text-xs text-gray-500">{config.description}</p>
                    </div>
                  </div>
                </div>

                {/* Item display or empty slot */}
                <div class="flex items-center gap-4">
                  <Show
                    when={equippedItem()}
                    fallback={
                      <div
                        class="
                          w-full
                          border-2
                          border-dashed
                          border-gray-300
                          rounded-lg
                          p-8
                          text-center
                          text-gray-400
                        "
                      >
                        <p class="text-sm">No {config.label.toLowerCase()} equipped</p>
                        <p class="text-xs mt-1">Drag item here to equip</p>
                      </div>
                    }
                  >
                    {(item) => (
                      <div class="flex items-center gap-4 w-full">
                        <ItemCard item={item()} size="lg" />
                        <div class="flex-1 min-w-0">
                          <h4 class="font-semibold text-gray-800 truncate">{item().name}</h4>
                          <p class="text-xs text-gray-500 capitalize">{item().rarity}</p>

                          {/* Quick stats */}
                          <Show when={item().type !== 'consumable'}>
                            <div class="mt-2 space-y-1">
                              <For each={Object.entries((item() as EquippableItem).statBonuses)}>
                                {([stat, value]) =>
                                  value ? (
                                    <div class="text-xs text-green-600 font-medium">
                                      +{value} {stat}
                                    </div>
                                  ) : null
                                }
                              </For>
                            </div>
                          </Show>

                          {/* Unequip button */}
                          <button
                            class="
                              mt-2
                              px-3
                              py-1
                              text-xs
                              bg-red-100
                              text-red-700
                              rounded
                              hover:bg-red-200
                              transition-colors
                              disabled:opacity-50
                              disabled:cursor-not-allowed
                            "
                            disabled={props.locked}
                            onClick={() => handleUnequip(slot)}
                          >
                            Unequip
                          </button>
                        </div>
                      </div>
                    )}
                  </Show>
                </div>

                {/* Item tooltip on selection */}
                <Show when={isSelected() && equippedItem()}>
                  {(item) => (
                    <div class="mt-4">
                      <ItemTooltip item={item()} />
                    </div>
                  )}
                </Show>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};
