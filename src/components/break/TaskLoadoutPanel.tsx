import { Component, Show } from 'solid-js';
import type { CharacterStore } from '../../core/state/CharacterState';
import type { InventoryStore } from '../../core/state/InventoryState';

interface TaskLoadoutPanelProps {
  characterStore: CharacterStore;
  inventoryStore: InventoryStore;
}

/**
 * TaskLoadoutPanel - Show character readiness for task with modern UI
 */
export const TaskLoadoutPanel: Component<TaskLoadoutPanelProps> = (props) => {
  const characterState = () => props.characterStore.state;
  const inventoryState = () => props.inventoryStore.state;

  const stats = () => characterState().computedStats;


  const getEquippedItem = (slot: 'weapon' | 'armor' | 'accessory') => {
    const equip = characterState().equipment[slot];
    if (!equip) return null;
    return inventoryState().slots.find((s) => s.item?.id === equip.itemId)?.item;
  };

  return (
    <div class="glass-panel p-6 border-primary-500/10 bg-[#080810]/60 h-full flex flex-col space-y-8 animate-fade-in rounded-3xl">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-display font-black text-gray-500 uppercase tracking-[0.2em]">Heroic Vitals</h3>
        <span class="text-[9px] font-mono font-black text-primary-400 bg-primary-500/10 px-3 py-1 rounded border border-primary-500/20 uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.1)]">
          BATTLE READY
        </span>
      </div>

      {/* Character Stats */}
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1.5 opacity-60">
              <span class="text-sm">⚔️</span>
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Power</span>
            </div>
            <span class="text-2xl font-display font-black text-white leading-none">{stats().power}</span>
          </div>

          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1.5 opacity-60">
              <span class="text-sm">🛡️</span>
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Defense</span>
            </div>
            <span class="text-2xl font-display font-black text-white leading-none">{stats().defense}</span>
          </div>

          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1.5 opacity-60">
              <span class="text-sm">🎯</span>
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Focus</span>
            </div>
            <span class="text-2xl font-display font-black text-white leading-none">{stats().focus}</span>
          </div>

          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1.5 opacity-60">
              <span class="text-sm">🍀</span>
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Luck</span>
            </div>
            <span class="text-2xl font-display font-black text-white leading-none">{stats().luck}</span>
          </div>
        </div>

        <div class="pt-2">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest italic opacity-70">Soul Integrity</span>
            <span class="text-[10px] font-mono text-gray-300 font-bold">{stats().health} <span class="text-gray-600">/</span> {stats().maxHealth}</span>
          </div>
          <div class="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div
              class="h-full bg-gradient-to-r from-danger via-red-500 to-red-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(225,29,72,0.3)]"
              style={{ width: `${(stats().health / stats().maxHealth) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Equipment Summary */}
      <div class="space-y-5">
        <h4 class="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-primary-500/10 pb-2.5">Relic Resonance</h4>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Main Hand</span>
            <Show
              when={getEquippedItem('weapon')}
              fallback={<span class="text-[9px] font-mono text-gray-700 uppercase font-black">Unarmed</span>}
            >
              {(item) => <span class="text-[10px] font-display font-black text-primary-400 tracking-wide">{item().name.toUpperCase()}</span>}
            </Show>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Warded Armor</span>
            <Show
              when={getEquippedItem('armor')}
              fallback={<span class="text-[9px] font-mono text-gray-700 uppercase font-black">Unshielded</span>}
            >
              {(item) => <span class="text-[10px] font-display font-black text-primary-400 tracking-wide">{item().name.toUpperCase()}</span>}
            </Show>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Ancient Trinket</span>
            <Show
              when={getEquippedItem('accessory')}
              fallback={<span class="text-[9px] font-mono text-gray-700 uppercase font-black">Empty</span>}
            >
              {(item) => <span class="text-[10px] font-display font-black text-primary-400 tracking-wide">{item().name.toUpperCase()}</span>}
            </Show>
          </div>
        </div>
      </div>

      {/* Status Matrix */}
      <Show when={characterState().injury.isInjured || characterState().hospitalBill}>
        <div class="space-y-4 pt-5 border-t border-primary-500/10">
          <h4 class="text-[9px] font-black text-danger uppercase tracking-[0.2em]">Spirit Afflictions</h4>
          <div class="space-y-3">
            <Show when={characterState().injury.isInjured}>
              <div class="flex items-center gap-4 p-3 rounded-2xl bg-danger/5 border border-danger/10 text-[11px] backdrop-blur-sm">
                <span class="text-lg drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]">🩸</span>
                <div class="flex flex-col">
                  <span class="text-danger font-black uppercase tracking-widest text-[10px]">Spirit Bleed: {characterState().injury.severity}</span>
                  <span class="text-gray-500 text-[8px] font-mono uppercase">-{characterState().injury.successPenalty}% Fate Chance</span>
                </div>
              </div>
            </Show>

            <Show when={characterState().hospitalBill}>
              {(bill) => (
                <div class="flex items-center gap-4 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-[11px] backdrop-blur-sm">
                  <span class="text-lg drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">⚖️</span>
                  <div class="flex flex-col">
                    <span class="text-amber-500 font-black uppercase tracking-widest text-[10px]">Imperial Tithing</span>
                    <span class="text-gray-500 text-[8px] font-mono uppercase">-{bill().penalty}% Spirit Penalty</span>
                  </div>
                </div>
              )}
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
};
