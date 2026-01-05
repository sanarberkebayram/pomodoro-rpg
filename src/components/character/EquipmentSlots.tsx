import { Component, Show, For, createSignal } from 'solid-js';
import type { CharacterStore } from '../../core/state/CharacterState';
import type { InventoryStore } from '../../core/state/InventoryState';
import type { EquippableItem, Item } from '../../core/types/items';
import type { EquipmentSlot } from '../../core/types/character';
import { ItemCard } from '../common/ItemCard';
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
 * Slot display configuration for the modern theme
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
    label: 'Main Hand',
    icon: '⚔️',
    description: 'Strike with the force of legends',
  },
  armor: {
    label: 'Body Armor',
    icon: '🛡️',
    description: 'Warded against the darkness',
  },
  accessory: {
    label: 'Mystic Accessory',
    icon: '💍',
    description: 'Enchanted auxiliary power',
  },
};

/**
 * EquipmentSlots - Fantasy RPG character equipment display
 */
export const EquipmentSlots: Component<EquipmentSlotsProps> = (props) => {
  const [dragOverSlot, setDragOverSlot] = createSignal<EquipmentSlot | null>(null);

  const characterState = () => props.characterStore.state;
  const inventoryState = () => props.inventoryStore.state;

  const getEquippedItem = (slot: EquipmentSlot): Item | null => {
    const equipment = characterState().equipment[slot];
    if (!equipment) return null;
    return props.inventoryStore.getItem(equipment.itemId);
  };

  const handleUnequip = (slot: EquipmentSlot) => {
    if (props.locked) return;
    const unequipped = props.characterStore.unequipItem(slot);
    if (unequipped) props.onUnequip?.(slot);

    const partialBonuses = getEquipmentBonuses(characterState().equipment, inventoryState());
    props.characterStore.recalculateStats({
      power: partialBonuses.power ?? 0,
      defense: partialBonuses.defense ?? 0,
      focus: partialBonuses.focus ?? 0,
      luck: partialBonuses.luck ?? 0,
    });
  };

  const handleDrop = (slot: EquipmentSlot) => (e: DragEvent) => {
    if (props.locked) return;
    e.preventDefault();
    const sourceSlotId = e.dataTransfer?.getData('text/plain');

    if (sourceSlotId) {
      const sourceSlot = inventoryState().slots.find((s) => s.slotId === sourceSlotId);
      const item = sourceSlot?.item as EquippableItem | undefined;

      if (item && item.equipmentSlot === slot) {
        const currentEquipment = characterState().equipment[slot];
        if (currentEquipment) props.characterStore.unequipItem(slot);
        props.characterStore.equipItem(slot, item.id);

        const partialBonuses = getEquipmentBonuses(characterState().equipment, inventoryState());
        props.characterStore.recalculateStats({
          power: partialBonuses.power ?? 0,
          defense: partialBonuses.defense ?? 0,
          focus: partialBonuses.focus ?? 0,
          luck: partialBonuses.luck ?? 0,
        });
      }
    }
    setDragOverSlot(null);
  };

  const handleDragOver = (slot: EquipmentSlot) => (e: DragEvent) => {
    if (props.locked) return;
    e.preventDefault();
    setDragOverSlot(slot);
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = () => setDragOverSlot(null);


  return (
    <div class="flex flex-col h-full bg-[#050508]/40 overflow-hidden">

      {/* Classic MMO Gear Board */}
      <div class="flex-1 relative px-12 py-8 flex items-center justify-between gap-12 min-h-[480px]">
        {/* Background Ambience */}
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)] opacity-50 pointer-events-none"></div>

        {/* LEFT: Character Profile & Labels */}
        <div class="flex-1 flex flex-col items-center justify-center relative">
          <div class="w-64 h-80 relative flex items-center justify-center mb-6">
            {/* Stylized Silhouette & Glows */}
            <div class="absolute inset-0 bg-gradient-to-t from-primary-500/30 via-primary-500/5 to-transparent blur-3xl opacity-40 animate-pulse"></div>
            <div class="text-[12rem] text-white/5 font-display italic font-black select-none pointer-events-none transform -rotate-12 translate-y-6">
              {characterState().class.charAt(0)}
            </div>

            {/* Glowing Aura Rings */}
            <div class="absolute inset-0 border border-primary-500/5 rounded-full scale-125 animate-ping opacity-20"></div>
          </div>

          {/* Profile Labels (Bottom of Character) */}
          <div class="text-center space-y-2 relative z-10 w-full">
            <div class="flex items-center justify-center gap-4 mb-2">
              <div class="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent flex-1"></div>
              <span class="text-[10px] font-mono font-black text-primary-500/60 uppercase tracking-[0.4em]">Spirit Signature</span>
              <div class="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent flex-1"></div>
            </div>
            <h3 class="text-4xl font-display font-black text-white italic uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] leading-none">
              {characterState().class}
            </h3>
            <div class="flex items-center justify-center gap-3">
              <span class="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">Ascension Level</span>
              <span class="text-xl font-display font-black text-primary-400">0{characterState().level}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Equipment Slot Vertical Stack */}
        <div class="flex flex-col gap-5 flex-shrink-0 relative z-20">
          {renderMmoSlot('weapon', 'Main Hand')}
          {renderMmoSlot('armor', 'Body Armor')}
          {renderMmoSlot('accessory', 'Relic Slot')}
        </div>
      </div>

      {/* Stat Summary Footer */}
      <div class="px-8 py-5 border-t border-primary-500/10 bg-black/40 backdrop-blur-md">
        <div class="flex items-center justify-between gap-8">
          <div class="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
            <For each={Object.entries(characterState().computedStats)}>
              {([stat, value]) => {
                if (stat === 'health' || stat === 'maxHealth') return null;
                const icon = stat === 'power' ? '⚔️' : stat === 'defense' ? '🛡️' : stat === 'focus' ? '🎯' : '🍀';
                return (
                  <div class="flex flex-col">
                    <span class="text-[8px] font-mono font-black text-gray-500 uppercase tracking-widest">{stat}</span>
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs">{icon}</span>
                      <span class="text-sm font-mono font-black text-white">{Math.floor(value)}</span>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
          <div class="flex-shrink-0">
            <span class="text-[9px] font-mono font-black text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">
              Combat Potency Balanced
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  function renderMmoSlot(slot: EquipmentSlot, label: string) {
    const config = SLOT_CONFIG[slot];
    const equippedItem = () => getEquippedItem(slot);
    const isDragOver = () => dragOverSlot() === slot;

    return (
      <div
        class={`flex flex-col items-center gap-2 group cursor-default p-2 transition-all duration-300 ${isDragOver() ? 'scale-110' : 'hover:scale-105'}`}
        onDragOver={handleDragOver(slot)}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop(slot)}
      >
        <div
          class={`
            relative w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 overflow-hidden
            ${isDragOver()
              ? 'border-primary-500 bg-primary-500/20 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
              : equippedItem()
                ? 'border-primary-500/40 bg-black/60 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]'
                : 'border-white/5 bg-white/2 opacity-40 hover:opacity-100 hover:border-white/20'
            }
          `}
        >
          <Show
            when={equippedItem()}
            fallback={<span class="text-3xl grayscale opacity-30 select-none">{config.icon}</span>}
          >
            {(item) => (
              <div class="relative w-full h-full flex items-center justify-center group/item">
                <ItemCard item={item()} size="lg" />
                <button
                  onClick={(e) => { e.stopPropagation(); handleUnequip(slot); }}
                  class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-danger text-white text-[10px] flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity border border-white/20 shadow-lg hover:scale-110"
                  title="Unequip"
                >
                  ×
                </button>
              </div>
            )}
          </Show>

          {/* Animated Scan Line (on drag or if equipped) */}
          <Show when={isDragOver() || equippedItem()}>
            <div class={`absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/10 to-transparent h-[200%] ${isDragOver() ? 'animate-scan' : ''} pointer-events-none`}></div>
          </Show>
        </div>

        <div class="text-center">
          <span class="block text-[9px] font-display font-black text-gray-500 uppercase tracking-widest">{label}</span>
          <Show when={equippedItem()}>
            {(item) => <span class="block text-[8px] font-mono font-bold text-primary-400 mt-0.5 max-w-[80px] truncate">{item().name}</span>}
          </Show>
        </div>
      </div>
    );
  }
};
