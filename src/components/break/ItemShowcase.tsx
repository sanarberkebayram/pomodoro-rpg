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
    <div class="space-y-6 animate-fade-in">
      {/* Success Banner */}
      <div
        class={`
          p-6
          rounded-lg
          text-center
          ${
            props.result.wasLucky
              ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
              : 'bg-gradient-to-r from-green-400 to-blue-400'
          }
          text-white
        `}
      >
        <h3 class="text-2xl font-bold mb-2">
          {props.result.wasLucky ? '✨ Lucky Opening! ✨' : '🎉 Chest Opened! 🎉'}
        </h3>
        <p class="text-lg">
          Total Value: <span class="font-bold">{props.result.totalValue} gold</span>
        </p>
      </div>

      {/* Gold Display */}
      <Show when={props.result.gold > 0}>
        <div class="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-4xl">💰</div>
            <div>
              <div class="text-sm text-gray-600">Gold Earned</div>
              <div class="text-2xl font-bold text-yellow-600">+{props.result.gold}</div>
            </div>
          </div>
        </div>
      </Show>

      {/* Items Display */}
      <Show when={props.result.items.length > 0}>
        <div>
          <h4 class="text-lg font-semibold mb-3 text-gray-800">
            Items ({props.result.items.length})
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

      {/* Item Comparison Modal */}
      <Show when={showComparison() && selectedItem() !== null}>
        {() => {
          const item = selectedItem();
          if (!item || !isEquippable(item)) return null;
          return (
            <ItemComparison
              newItem={item as EquippableItem}
              equippedItem={getEquippedItem(item)}
              onEquip={() => handleQuickEquip(item)}
              onClose={() => {
                setShowComparison(false);
                setSelectedItem(null);
              }}
            />
          );
        }}
      </Show>

      {/* Action Buttons */}
      <div class="flex gap-4 pt-4 border-t-2 border-gray-200">
        <button
          onClick={props.onCollect}
          class="
            flex-1
            py-3
            px-6
            rounded-lg
            font-bold
            text-white
            bg-gradient-to-r
            from-green-600
            to-blue-600
            hover:from-green-700
            hover:to-blue-700
            active:scale-95
            transition-all
          "
        >
          Collect Loot
        </button>
        <button
          onClick={props.onOpenAnother}
          class="
            py-3
            px-6
            rounded-lg
            font-semibold
            text-gray-700
            bg-gray-200
            hover:bg-gray-300
            active:scale-95
            transition-all
          "
        >
          Open Another
        </button>
      </div>
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
        relative
        bg-white
        rounded-lg
        border-2
        transition-all
        duration-200
        ${
          props.selected
            ? 'border-blue-500 shadow-lg scale-105'
            : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
        }
        cursor-pointer
        overflow-hidden
      `}
      onClick={props.onClick}
    >
      {/* Rarity Header */}
      <div
        class="px-3 py-1 text-xs font-bold text-white text-center"
        style={{ 'background-color': rarityColor() }}
      >
        {rarityName()}
      </div>

      {/* Item Icon */}
      <div class="p-4 flex flex-col items-center">
        <ItemCard item={props.item} size="lg" />

        {/* Item Name */}
        <div class="mt-3 text-center">
          <div class="font-semibold text-sm text-gray-800 line-clamp-2">{props.item.name}</div>
          <div class="text-xs text-gray-500 mt-1 capitalize">{props.item.type}</div>
        </div>

        {/* Item Value */}
        <div class="mt-2 text-yellow-600 font-bold text-sm">{props.item.value}g</div>

        {/* Quick Equip Button */}
        <Show when={isEquippable() && props.onQuickEquip}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.onQuickEquip?.();
            }}
            class="
              mt-3
              w-full
              py-2
              px-3
              bg-blue-500
              hover:bg-blue-600
              text-white
              text-xs
              font-semibold
              rounded
              transition-colors
            "
          >
            Quick Equip
          </button>
        </Show>
      </div>

      {/* Selection Indicator */}
      <Show when={props.selected}>
        <div class="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </Show>
    </div>
  );
};
