/**
 * ItemTooltip Component
 * Displays detailed item information in a tooltip/modal
 */

import { Component, Show, For } from 'solid-js';
import type { Item, EquippableItem, ConsumableItem } from '../../core/types/items';
import { formatStatBonuses } from '../../core/utils/itemUtils';

interface ItemTooltipProps {
  item: Item;
  /** Position of tooltip */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Show as modal instead of tooltip */
  modal?: boolean;
}

/**
 * Rarity display names
 */
const RARITY_NAMES = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
} as const;

/**
 * Rarity colors for text
 */
const RARITY_COLORS = {
  common: 'text-gray-700',
  uncommon: 'text-green-600',
  rare: 'text-blue-600',
  epic: 'text-purple-600',
  legendary: 'text-orange-600',
} as const;

/**
 * ItemTooltip - Shows detailed item information
 */
export const ItemTooltip: Component<ItemTooltipProps> = (props) => {
  const isEquippable = () =>
    props.item.type === 'weapon' || props.item.type === 'armor' || props.item.type === 'accessory';

  const statBonuses = () => {
    if (!isEquippable()) return [];
    const equippableItem = props.item as EquippableItem;
    return formatStatBonuses(equippableItem.statBonuses);
  };

  return (
    <div
      class={`
        ${props.modal ? 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50' : 'absolute'}
        animate-fade-in
      `}
      role="tooltip"
    >
      <div
        class={`
          bg-white
          border-2
          border-gray-300
          rounded-lg
          shadow-xl
          ${props.modal ? 'w-80 max-w-full m-4' : 'w-64'}
          overflow-hidden
        `}
      >
        {/* Header with item name and rarity */}
        <div class="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 border-b border-gray-300">
          <h3
            class={`
              font-bold
              text-lg
              ${RARITY_COLORS[props.item.rarity]}
            `}
          >
            {props.item.name}
          </h3>
          <p class="text-xs text-gray-600 mt-1">
            {RARITY_NAMES[props.item.rarity]} {props.item.type}
          </p>
        </div>

        {/* Item details */}
        <div class="p-4 space-y-3">
          {/* Description */}
          <p class="text-sm text-gray-700 leading-relaxed">{props.item.description}</p>

          {/* Stat bonuses for equippable items */}
          <Show when={isEquippable() && statBonuses().length > 0}>
            <div class="border-t border-gray-200 pt-3">
              <p class="text-xs font-semibold text-gray-600 uppercase mb-2">Stats</p>
              <ul class="space-y-1">
                <For each={statBonuses()}>
                  {(stat) => (
                    <li class="text-sm text-green-600 font-medium flex items-center">
                      <svg
                        class="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      {stat}
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </Show>

          {/* Consumable effects */}
          <Show when={props.item.type === 'consumable'}>
            {() => {
              const consumable = props.item as ConsumableItem;
              return (
                <div class="border-t border-gray-200 pt-3">
                  <p class="text-xs font-semibold text-gray-600 uppercase mb-2">Effects</p>
                  <Show when={consumable.healAmount}>
                    <p class="text-sm text-green-600 font-medium">
                      Restores {consumable.healAmount} Health
                    </p>
                  </Show>
                  <Show when={consumable.curesInjury}>
                    <p class="text-sm text-blue-600 font-medium">Removes Injury</p>
                  </Show>
                </div>
              );
            }}
          </Show>

          {/* Value and sellable status */}
          <div class="border-t border-gray-200 pt-3 flex justify-between items-center">
            <div>
              <p class="text-xs text-gray-600">Value</p>
              <p class="text-sm font-bold text-yellow-600">{props.item.value} Gold</p>
            </div>
            <Show when={props.item.sellable}>
              <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Sellable
              </span>
            </Show>
          </div>

          {/* Stack info */}
          <Show when={props.item.maxStack > 1}>
            <div class="text-xs text-gray-500">Max Stack: {props.item.maxStack}</div>
          </Show>
        </div>
      </div>
    </div>
  );
};
