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
  onClose?: () => void;
}

/**
 * Inventory - Main inventory grid component with modern dark theme
 */
export const Inventory: Component<InventoryProps> = (props) => {
  const [selectedSlotId, setSelectedSlotId] = createSignal<string | null>(null);
  const [draggedSlotId, setDraggedSlotId] = createSignal<string | null>(null);

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
    return 5;
  });

  /**
   * Get empty slot count
   */
  const emptySlots = createMemo(() => {
    return props.inventoryStore.getEmptySlotCount();
  });

  return (
    <div class="flex flex-col h-full bg-black/40 backdrop-blur-xl rounded-b-3xl">
      {/* Header with gold and slot info */}
      <div class="px-6 py-6 border-b border-primary-500/10 bg-gradient-to-r from-primary-500/5 to-transparent drag-handle cursor-grab active:cursor-grabbing">
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <h2 class="text-2xl font-display font-black tracking-tighter uppercase italic text-primary-500">Explorer Vault</h2>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Storage Sacks</span>
              <span class="text-xs font-mono text-primary-400 font-bold uppercase">
                {inventoryState().maxSlots - emptySlots()} / {inventoryState().maxSlots}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-6">
            <div class="text-right">
              <span class="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Imperial Gold</span>
              <div class="flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary-500/5 border border-primary-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <span class="text-xl drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">💰</span>
                <span class="text-2xl font-mono font-bold text-primary-400">{inventoryState().gold}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Locked overlay info */}
      <Show when={props.locked}>
        <div class="bg-danger/10 border-b border-danger/20 px-4 py-2 flex items-center justify-center gap-2">
          <span class="text-[10px] text-danger font-bold uppercase tracking-widest animate-pulse">Vault Sealed: Battle in Progress</span>
        </div>
      </Show>

      {/* Inventory grid */}
      <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div
          class="grid gap-4"
          style={{
            'grid-template-columns': `repeat(${gridColumns()}, minmax(0, 1fr))`,
          }}
        >
          <For each={inventoryState().slots}>
            {(slot) => (
              <div
                class={`relative transition-all duration-300 ${draggedSlotId() === slot.slotId ? 'opacity-20 scale-90 blur-sm' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop(slot.slotId)}
              >
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

                {/* Show tooltip on hover or select */}
                <Show when={selectedSlotId() === slot.slotId ? slot.item : undefined}>
                  {(item) => (
                    <div class="absolute z-50 top-full mt-3 left-1/2 -translate-x-1/2 pointer-events-none w-72">
                      <ItemTooltip item={item()} position="bottom" />
                    </div>
                  )}
                </Show>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Footer Actions */}
      <div class="p-6 border-t border-white/5 bg-black/40">
        <Show
          when={selectedSlotId() !== null}
          fallback={
            <div class="text-center py-4 border-2 border-dashed border-white/5 rounded-2xl opacity-50">
              <p class="text-[9px] font-mono text-gray-500 uppercase tracking-[0.3em] font-bold">Select relic of antiquity</p>
            </div>
          }
        >
          <div class="flex gap-4">
            <button
              class="flex-1 btn-primary py-4 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)]"
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
              Perform Binding Ritual
            </button>
            <button
              class="px-6 py-4 rounded-xl bg-danger/5 text-danger border border-danger/20 hover:bg-danger hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
              disabled={props.locked}
              onClick={() => {
                const slot = inventoryState().slots.find((s) => s.slotId === selectedSlotId());
                if (slot?.item) {
                  props.inventoryStore.removeItem(slot.item.id, slot.quantity);
                  setSelectedSlotId(null);
                }
              }}
            >
              Destroy
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
};
