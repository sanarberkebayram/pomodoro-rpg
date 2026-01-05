/**
 * Inventory Component
 * Grid-based inventory display with drag-and-drop support
 */

import { Component, For, Show, createSignal, createMemo } from 'solid-js';
import type { InventoryStore } from '../../core/state/InventoryState';
import type { Item } from '../../core/types/items';
import { ItemCard } from '../common/ItemCard';
import { ItemTooltip } from '../common/ItemTooltip';

interface InventoryProps {
  inventoryStore: InventoryStore;
  /** Callback when item is selected for equipping/using */
  onItemSelect?: (item: Item, slotId: string) => void;
  /** Callback when item is double-clicked (quick equip/use) */
  onItemUse?: (item: Item, slotId: string) => void;
  /** Whether inventory is locked (during work phase) */
  locked?: boolean;
}

/**
 * Inventory - Main inventory grid component
 */
export const Inventory: Component<InventoryProps> = (props) => {
  const [selectedSlotId, setSelectedSlotId] = createSignal<string | null>(null);
  const [_hoveredItem, _setHoveredItem] = createSignal<Item | null>(null);
  const [_draggedSlotId, _setDraggedSlotId] = createSignal<string | null>(null);

  const inventoryState = () => props.inventoryStore.state;

  /**
   * Handle slot click
   */
  const handleSlotClick = (slotId: string) => {
    if (props.locked) return;

    const slot = inventoryState().slots.find((s) => s.slotId === slotId);
    if (!slot?.item) {
      setSelectedSlotId(null);
      return;
    }

    setSelectedSlotId(slotId);
    props.onItemSelect?.(slot.item, slotId);
  };

  /**
   * Handle slot double-click (quick use/equip)
   */
  const handleSlotDoubleClick = (slotId: string) => {
    if (props.locked) return;

    const slot = inventoryState().slots.find((s) => s.slotId === slotId);
    if (!slot?.item) return;

    props.onItemUse?.(slot.item, slotId);
  };

  /**
   * Handle drag start
   */
  const handleDragStart = (slotId: string) => (e: DragEvent) => {
    if (props.locked) {
      e.preventDefault();
      return;
    }

    setDraggedSlotId(slotId);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', slotId);
    }
  };

  /**
   * Handle drag end
   */
  const handleDragEnd = () => {
    setDraggedSlotId(null);
  };

  /**
   * Handle drag over
   */
  const handleDragOver = (e: DragEvent) => {
    if (props.locked) return;
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  /**
   * Handle drop
   */
  const handleDrop = (targetSlotId: string) => (e: DragEvent) => {
    if (props.locked) return;

    e.preventDefault();
    const sourceSlotId = e.dataTransfer?.getData('text/plain');

    if (sourceSlotId && sourceSlotId !== targetSlotId) {
      props.inventoryStore.moveItem(sourceSlotId, targetSlotId);
    }

    setDraggedSlotId(null);
  };

  /**
   * Calculate grid columns based on inventory size
   */
  const gridColumns = createMemo(() => {
    return Math.min(5, Math.ceil(Math.sqrt(inventoryState().maxSlots)));
  });

  /**
   * Get empty slot count
   */
  const emptySlots = createMemo(() => {
    return props.inventoryStore.getEmptySlotCount();
  });

  return (
    <div class="flex flex-col h-full">
      {/* Header with gold and slot info */}
      <div class="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b-2 border-yellow-300 px-4 py-3">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg font-bold text-gray-800">Inventory</h2>
            <p class="text-sm text-gray-600">
              {emptySlots()} / {inventoryState().maxSlots} slots available
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-600">Gold</p>
            <p class="text-2xl font-bold text-yellow-600 flex items-center">
              <svg
                class="w-6 h-6 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clip-rule="evenodd"
                />
              </svg>
              {inventoryState().gold}
            </p>
          </div>
        </div>
      </div>

      {/* Locked overlay during work phase */}
      <Show when={props.locked}>
        <div class="bg-red-100 border-b-2 border-red-300 px-4 py-2">
          <p class="text-sm text-red-700 font-semibold text-center">
            🔒 Inventory locked during work phase
          </p>
        </div>
      </Show>

      {/* Inventory grid */}
      <div class="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div
          class="grid gap-2"
          style={{
            'grid-template-columns': `repeat(${gridColumns()}, minmax(0, 1fr))`,
          }}
        >
          <For each={inventoryState().slots}>
            {(slot) => (
              <div class="relative" onDragOver={handleDragOver} onDrop={handleDrop(slot.slotId)}>
                <ItemCard
                  item={slot.item}
                  quantity={slot.quantity}
                  selected={selectedSlotId() === slot.slotId}
                  onClick={() => handleSlotClick(slot.slotId)}
                  onDoubleClick={() => handleSlotDoubleClick(slot.slotId)}
                  draggable={!props.locked && !!slot.item}
                  onDragStart={handleDragStart(slot.slotId)}
                  onDragEnd={handleDragEnd}
                  size="md"
                />

                {/* Show tooltip on hover */}
                <Show when={slot.item && selectedSlotId() === slot.slotId && slot.item}>
                  {(item) => (
                    <div class="absolute z-10 top-full mt-2 left-0">
                      <ItemTooltip item={item()} position="bottom" />
                    </div>
                  )}
                </Show>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Footer with actions */}
      <div class="border-t-2 border-gray-300 bg-white px-4 py-3">
        <Show
          when={selectedSlotId() !== null}
          fallback={<p class="text-sm text-gray-500 text-center">Select an item to see actions</p>}
        >
          <div class="flex gap-2 justify-center">
            <button
              class="
                px-4
                py-2
                bg-blue-500
                text-white
                rounded-lg
                font-semibold
                hover:bg-blue-600
                transition-colors
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
              disabled={props.locked}
              onClick={() => {
                const currentSlotId = selectedSlotId();
                if (!currentSlotId) return;

                const slot = inventoryState().slots.find((s) => s.slotId === currentSlotId);
                if (slot?.item) {
                  props.onItemUse?.(slot.item, currentSlotId);
                }
              }}
            >
              Use / Equip
            </button>
            <button
              class="
                px-4
                py-2
                bg-red-500
                text-white
                rounded-lg
                font-semibold
                hover:bg-red-600
                transition-colors
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
              disabled={props.locked}
              onClick={() => {
                const slot = inventoryState().slots.find((s) => s.slotId === selectedSlotId());
                if (slot?.item) {
                  // Remove item
                  props.inventoryStore.removeItem(slot.item.id, slot.quantity);
                  setSelectedSlotId(null);
                }
              }}
            >
              Drop
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
};
