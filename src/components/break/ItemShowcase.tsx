/**
 * ItemShowcase Component
 * Displays loot results from opening a chest with animations
 */

import { Component, For, Show, createSignal } from 'solid-js';
import type { ChestOpenResult } from '../../systems/loot/ChestManager';
import type { Item, EquippableItem } from '../../core/types/items';
import { ItemCard } from '../common/ItemCard';
import { ItemComparison } from './ItemComparison';
import { getRarityColor, getRarityName } from '../../systems/loot/RaritySystem';

interface ItemShowcaseProps {
  /** Chest opening result */
  result: ChestOpenResult;

  /** Callback when player collects loot */
  onCollect: () => void;

  /** Callback to open another chest */
  onOpenAnother: () => void;

  /** Currently equipped items for comparison (optional) */
  equippedItems?: {
    weapon: EquippableItem | null;
    armor: EquippableItem | null;
    accessory: EquippableItem | null;
  };

  /** Callback to quick equip an item (optional) */
  onQuickEquip?: (item: EquippableItem) => void;
}

/**
 * ItemShowcase - Displays loot results with animations
 */
export const ItemShowcase: Component<ItemShowcaseProps> = (props) => {
  const [selectedItem, setSelectedItem] = createSignal<Item | null>(null);
  const [showComparison, setShowComparison] = createSignal(false);

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    if (isEquippable(item) && props.equippedItems) {
      setShowComparison(true);
    }
  };

  const handleQuickEquip = (item: Item) => {
    if (isEquippable(item) && props.onQuickEquip) {
      props.onQuickEquip(item as EquippableItem);
      setShowComparison(false);
      setSelectedItem(null);
    }
  };

  const isEquippable = (item: Item): boolean => {
    return item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
  };

  const getEquippedItem = (item: Item): EquippableItem | null => {
    if (!props.equippedItems || !isEquippable(item)) return null;

    const slot = (item as EquippableItem).equipmentSlot;
    return props.equippedItems[slot] ?? null;
  };

  return (
    <div class="space-y-8 animate-fade-in py-4">
      {/* Success Banner */}
      <div
        class={`
          p-10
          rounded-3xl
          text-center
          relative
          overflow-hidden
          ${props.result.wasLucky
            ? 'bg-gradient-to-br from-primary-600 to-amber-700'
            : 'bg-gradient-to-br from-emerald-700 to-teal-900 border border-emerald-500/20'
          }
          text-white
          shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        `}
      >
        <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div class="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
          <div class="absolute bottom-0 left-0 w-full h-1 bg-black/20"></div>
        </div>

        <h3 class="text-4xl font-display font-black mb-2 uppercase tracking-tighter italic">
          {props.result.wasLucky ? '✨ Divine Fortune ✨' : '⚔️ Spoils Secured ⚔️'}
        </h3>
        <p class="text-sm font-mono text-white/70 uppercase tracking-widest">
          Total Value Gained: <span class="font-bold text-white">{props.result.totalValue} Gold</span>
        </p>
      </div>

      {/* Gold Display */}
      <Show when={props.result.gold > 0}>
        <div class="bg-black/40 border border-primary-500/10 rounded-3xl p-6 flex items-center justify-between shadow-inner">
          <div class="flex items-center gap-6">
            <div class="text-5xl drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">💰</div>
            <div>
              <div class="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Imperial Credits</div>
              <div class="text-3xl font-display font-black text-primary-500">+{props.result.gold} GOLD</div>
            </div>
          </div>
        </div>
      </Show>

      {/* Items Display */}
      <Show when={props.result.items.length > 0}>
        <div class="space-y-4">
          <h4 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">
            Acquired Relics ({props.result.items.length})
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            <For each={props.result.items}>
              {(item) => (
                <ItemShowcaseCard
                  item={item}
                  selected={selectedItem()?.id === item.id}
                  onClick={() => handleItemClick(item)}
                  onQuickEquip={
                    isEquippable(item) && props.onQuickEquip
                      ? () => handleQuickEquip(item)
                      : undefined
                  }
                />
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Action Buttons */}
      <div class="flex gap-6 pt-10 border-t border-white/5">
        <button
          onClick={props.onCollect}
          class="btn-primary flex-1 py-5 text-base font-black shadow-[0_0_30px_rgba(245,158,11,0.2)]"
        >
          CLAIM ALL SPOILS
        </button>
        <button
          onClick={props.onOpenAnother}
          class="
            px-10
            py-5
            rounded-2xl
            font-bold
            text-gray-400
            bg-white/5
            border
            border-white/10
            hover:text-white
            hover:bg-white/10
            transition-all
            uppercase
            text-sm
            tracking-widest
          "
        >
          Seek More
        </button>
      </div>

      {/* Item Comparison Modal */}
      <Show when={showComparison() ? selectedItem() : null}>
        {(item) => (
          <ItemComparison
            newItem={item() as EquippableItem}
            equippedItem={getEquippedItem(item())}
            onEquip={() => handleQuickEquip(item())}
            onClose={() => {
              setShowComparison(false);
              setSelectedItem(null);
            }}
          />
        )}
      </Show>
    </div>
  );
};

/**
 * ItemShowcaseCard - Display card for looted items
 */
const ItemShowcaseCard: Component<{
  item: Item;
  selected: boolean;
  onClick: () => void;
  onQuickEquip?: () => void;
}> = (props) => {
  const rarityColor = () => getRarityColor(props.item.rarity);
  const rarityName = () => getRarityName(props.item.rarity);

  const isEquippable = () =>
    props.item.type === 'weapon' || props.item.type === 'armor' || props.item.type === 'accessory';

  return (
    <div
      class={`
        group relative bg-white/2 rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden
        ${props.selected
          ? 'border-primary-500 bg-primary-500/5 shadow-[0_0_30px_rgba(245,158,11,0.2)] scale-[1.05]'
          : 'border-white/5 hover:border-white/10 hover:bg-white/5'
        }
      `}
      onClick={props.onClick}
    >
      {/* Rarity Glow */}
      <div
        class="absolute top-0 left-0 w-full h-1"
        style={{ 'background-color': rarityColor() }}
      ></div>

      {/* Item Content */}
      <div class="p-6 flex flex-col items-center">
        <ItemCard item={props.item} size="lg" />

        <div class="mt-4 text-center">
          <div class="text-[8px] font-mono font-bold uppercase tracking-widest mb-1" style={{ color: rarityColor() }}>
            {rarityName()}
          </div>
          <div class="font-display font-bold text-white text-sm uppercase tracking-tight line-clamp-2">{props.item.name}</div>
        </div>

        <div class="mt-3 text-primary-500 font-mono font-bold text-xs">{props.item.value}G</div>

        {/* Quick Equip Button */}
        <Show when={isEquippable() && props.onQuickEquip}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.onQuickEquip?.();
            }}
            class="
              mt-4
              w-full
              py-2
              bg-primary-500/10
              hover:bg-primary-500
              text-primary-500
              hover:text-white
              text-[9px]
              font-black
              rounded-xl
              border
              border-primary-500/30
              transition-all
              uppercase
              tracking-widest
            "
          >
            Equip
          </button>
        </Show>
      </div>

      {/* Selection Indicator */}
      <Show when={props.selected}>
        <div class="absolute top-3 right-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg border-2 border-black">
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </Show>
    </div>
  );
};
