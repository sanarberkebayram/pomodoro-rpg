import { Component, Show, createSignal } from 'solid-js';
import type { CharacterStore } from '../../core/state/CharacterState';
import type { InventoryStore } from '../../core/state/InventoryState';
import type { Item, EquippableItem, ConsumableItem } from '../../core/types/items';
import { EquipmentSlots } from './EquipmentSlots';
import { Inventory } from './Inventory';
import { getEquipmentBonuses, isEquippableItem } from '../../core/utils/itemUtils';

interface CharacterSheetProps {
  characterStore: CharacterStore;
  inventoryStore: InventoryStore;
  /** Whether interface is locked (during work phase) */
  locked?: boolean;
  onClose?: () => void;
}


/**
 * CharacterSheet - Main character management interface with modern dark theme
 */
export const CharacterSheet: Component<CharacterSheetProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal<'hero' | 'vault'>('hero');
  const [notification, setNotification] = createSignal<string | null>(null);

  const characterState = () => props.characterStore.state;

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleItemUse = (item: Item, _slotId: string) => {
    if (props.locked) {
      showNotification('❌ Focus Sealed: Expedition in Progress');
      return;
    }

    if (isEquippableItem(item)) {
      const equippableItem = item as EquippableItem;
      const slot = equippableItem.equipmentSlot;

      const currentEquipment = characterState().equipment[slot];
      if (currentEquipment) props.characterStore.unequipItem(slot);

      props.characterStore.equipItem(slot, item.id);

      const partialBonuses = getEquipmentBonuses(
        characterState().equipment,
        props.inventoryStore.state
      );

      props.characterStore.recalculateStats({
        power: partialBonuses.power ?? 0,
        defense: partialBonuses.defense ?? 0,
        focus: partialBonuses.focus ?? 0,
        luck: partialBonuses.luck ?? 0,
      });

      showNotification(`⚔️ Relic Bound: ${item.name}`);
    } else if (item.type === 'consumable') {
      const consumable = item as ConsumableItem;
      if (consumable.healAmount) {
        props.characterStore.heal(consumable.healAmount);
        showNotification(`🧪 Vitality Restored: +${consumable.healAmount}`);
      }
      if (consumable.curesInjury && characterState().injury.isInjured) {
        props.characterStore.healInjury();
        showNotification(`✨ Spirit Cleansed: Injury Healed`);
      }
      props.inventoryStore.removeItem(item.id, 1);
    }
  };

  return (
    <div class="flex flex-col h-[85vh] w-[90vw] max-w-5xl bg-[#080810]/98 text-gray-200 overflow-hidden animate-fade-in border border-primary-500/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.9)]">
      {/* Cinematic Header */}
      <div class="px-8 py-6 bg-gradient-to-b from-primary-500/10 to-transparent relative border-b border-white/5 drag-handle cursor-grab active:cursor-grabbing flex items-center justify-between">
        <div class="flex items-center gap-6">
          <div class="w-16 h-16 rounded-2xl bg-black/40 border border-primary-500/20 flex items-center justify-center text-4xl shadow-[inner_0_0_15px_rgba(245,158,11,0.2)]">
            👤
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-display font-black tracking-tighter uppercase italic text-primary-500 leading-none">{characterState().class}</h1>
              <span class="px-3 py-1 rounded bg-primary-500/10 border border-primary-500/20 text-[10px] font-mono font-black text-primary-400 uppercase tracking-widest font-display">Lv. {characterState().level}</span>
            </div>
            <p class="text-[9px] font-mono text-gray-500 uppercase tracking-[0.4em] mt-1">Sovereign of the Eternal Pacts</p>
          </div>
        </div>

        <div class="flex items-center gap-8">
          <div class="hidden md:flex flex-col items-end">
            <span class="text-[8px] font-mono font-black text-gray-600 uppercase tracking-widest">Victory Records</span>
            <span class="text-xl font-mono font-black text-white">{characterState().metadata.tasksCompleted} <span class="text-gray-700">/</span> {characterState().metadata.tasksFailed}</span>
          </div>
          <Show when={props.onClose}>
            <button
              onClick={props.onClose}
              class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-danger/20 hover:border-danger/30 hover:text-danger transition-all duration-300"
            >
              <span class="text-xl">×</span>
            </button>
          </Show>
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div class="flex-1 flex overflow-hidden">
        {/* Left Pane: Gear (Hero) - Always visible on desktop, tabbed on mobile */}
        <div class={`flex-1 md:flex-none md:w-[450px] flex flex-col border-r border-white/5 bg-black/20 ${activeTab() === 'hero' ? 'flex' : 'hidden md:flex'}`}>
          <div class="md:hidden flex bg-black/40 border-b border-white/5">
            <button onClick={() => setActiveTab('hero')} class={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab() === 'hero' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500'}`}>Hero</button>
            <button onClick={() => setActiveTab('vault')} class={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab() === 'vault' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500'}`}>Vault</button>
          </div>
          <EquipmentSlots
            characterStore={props.characterStore}
            inventoryStore={props.inventoryStore}
            locked={props.locked}
          />
        </div>

        {/* Right Pane: Inventory (Vault) - Always visible on desktop, tabbed on mobile */}
        <div class={`flex-1 flex flex-col bg-[#050508]/20 ${activeTab() === 'vault' ? 'flex' : 'hidden md:flex'}`}>
          <div class="md:hidden flex bg-black/40 border-b border-white/5">
            <button onClick={() => setActiveTab('hero')} class={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab() === 'hero' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500'}`}>Hero</button>
            <button onClick={() => setActiveTab('vault')} class={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${activeTab() === 'vault' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500'}`}>Vault</button>
          </div>
          <Inventory
            inventoryStore={props.inventoryStore}
            onItemUse={handleItemUse}
            locked={props.locked}
            onClose={props.onClose}
          />
        </div>
      </div>

      {/* Notifications */}
      <Show when={notification()}>
        <div class="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
          <div class="bg-black/95 backdrop-blur-2xl border border-primary-500/40 text-primary-400 px-8 py-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] animate-slide-up flex items-center gap-4">
            <div class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
            <span class="text-[10px] font-display font-black uppercase tracking-[0.2em]">{notification()}</span>
          </div>
        </div>
      </Show>
    </div>
  );
};
