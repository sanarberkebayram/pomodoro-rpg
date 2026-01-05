/**
 * ItemCard Component
 * Displays a single item with its icon, name, rarity, and quantity
 */

import { Component, Show, createMemo } from 'solid-js';
import type { Item } from '../../core/types/items';

interface ItemCardProps {
  item: Item | null;
  quantity?: number;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  /** For drag-and-drop */
  draggable?: boolean;
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Rarity color mappings for visual distinction
 */
const RARITY_COLORS = {
  common: 'border-gray-400 bg-gray-50',
  uncommon: 'border-green-500 bg-green-50',
  rare: 'border-blue-500 bg-blue-50',
  epic: 'border-purple-500 bg-purple-50',
  legendary: 'border-orange-500 bg-orange-50',
} as const;

const RARITY_TEXT_COLORS = {
  common: 'text-gray-700',
  uncommon: 'text-green-700',
  rare: 'text-blue-700',
  epic: 'text-purple-700',
  legendary: 'text-orange-700',
} as const;

/**
 * Size mappings for different use cases
 */
const SIZE_CLASSES = {
  sm: {
    container: 'w-12 h-12',
    text: 'text-xs',
    quantity: 'text-xs',
  },
  md: {
    container: 'w-16 h-16',
    text: 'text-sm',
    quantity: 'text-sm',
  },
  lg: {
    container: 'w-20 h-20',
    text: 'text-base',
    quantity: 'text-base',
  },
} as const;

/**
 * ItemCard - Visual representation of an inventory item
 */
export const ItemCard: Component<ItemCardProps> = (props) => {
  const size = () => props.size ?? 'md';
  const sizeClasses = createMemo(() => SIZE_CLASSES[size()]);

  const rarityBorderColor = createMemo(() => {
    if (!props.item) return 'border-gray-300 bg-gray-100';
    return RARITY_COLORS[props.item.rarity];
  });

  const rarityTextColor = createMemo(() => {
    if (!props.item) return 'text-gray-500';
    return RARITY_TEXT_COLORS[props.item.rarity];
  });

  const isEmpty = () => !props.item;

  return (
    <div
      class={`
        relative
        ${sizeClasses().container}
        border-2
        rounded-lg
        ${rarityBorderColor()}
        transition-all
        duration-200
        ${props.onClick ? 'cursor-pointer hover:scale-105 hover:shadow-md' : ''}
        ${props.selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${props.draggable && !isEmpty() ? 'cursor-grab active:cursor-grabbing' : ''}
        ${isEmpty() ? 'opacity-50' : ''}
        flex
        items-center
        justify-center
        overflow-hidden
      `}
      onClick={() => props.onClick?.()}
      onDblClick={() => props.onDoubleClick?.()}
      draggable={props.draggable && !isEmpty()}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
      role="button"
      tabindex={props.onClick ? 0 : -1}
      aria-label={props.item ? `${props.item.name} (${props.item.rarity})` : 'Empty slot'}
    >
      <Show
        when={props.item}
        fallback={
          <div class="text-gray-400 text-2xl">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        }
      >
        {(item) => (
          <>
            {/* Item icon placeholder - will be replaced with actual icons */}
            <div
              class={`
                flex
                items-center
                justify-center
                w-full
                h-full
                ${rarityTextColor()}
                font-bold
                ${sizeClasses().text}
              `}
              title={item().name}
            >
              {/* Icon placeholder - display first letter for now */}
              <span class="text-2xl">{item().name.charAt(0)}</span>
            </div>

            {/* Quantity badge for stackable items */}
            <Show when={props.quantity && props.quantity > 1}>
              <div
                class={`
                  absolute
                  bottom-0
                  right-0
                  bg-gray-900
                  text-white
                  px-1
                  rounded-tl
                  rounded-br
                  ${sizeClasses().quantity}
                  font-semibold
                  leading-tight
                `}
              >
                {props.quantity}
              </div>
            </Show>

            {/* Rarity indicator dot */}
            <div
              class={`
                absolute
                top-1
                right-1
                w-2
                h-2
                rounded-full
                ${rarityBorderColor()}
                border-2
              `}
              aria-hidden="true"
            />
          </>
        )}
      </Show>
    </div>
  );
};
