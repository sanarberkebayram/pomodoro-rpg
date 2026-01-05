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
 * Rarity specific styling for the modern theme
 */
const RARITY_THEME = {
  common: {
    border: 'border-white/10',
    bg: 'bg-white/5',
    glow: 'shadow-none',
    text: 'text-gray-400',
    accent: 'bg-gray-500/20'
  },
  uncommon: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    text: 'text-emerald-400',
    accent: 'bg-emerald-500/20'
  },
  rare: {
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/5',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    text: 'text-blue-400',
    accent: 'bg-blue-500/20'
  },
  epic: {
    border: 'border-purple-500/50',
    bg: 'bg-purple-500/10',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    text: 'text-purple-400',
    accent: 'bg-purple-500/20'
  },
  legendary: {
    border: 'border-amber-500/60',
    bg: 'bg-amber-500/15',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    text: 'text-amber-400',
    accent: 'bg-amber-500/30'
  },
} as const;

const SIZE_MAP = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

/**
 * ItemCard - Modern visual representation of an inventory item
 */
export const ItemCard: Component<ItemCardProps> = (props) => {
  const theme = createMemo(() => {
    if (!props.item) return null;
    return RARITY_THEME[props.item.rarity];
  });

  const isEmpty = () => !props.item;

  return (
    <div
      class={`
        relative
        ${SIZE_MAP[props.size ?? 'md']}
        rounded-xl
        border
        backdrop-blur-sm
        transition-all
        duration-300
        group
        ${isEmpty()
          ? 'border-white/5 bg-white/2'
          : `${theme()?.border} ${theme()?.bg} ${theme()?.glow} hover:scale-105 active:scale-95`
        }
        ${props.selected ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-black' : ''}
        ${props.draggable && !isEmpty() ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
        flex items-center justify-center overflow-hidden
      `}
      onClick={() => props.onClick?.()}
      onDblClick={() => props.onDoubleClick?.()}
      draggable={props.draggable && !isEmpty()}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
    >
      <Show
        when={props.item}
        fallback={
          <div class="opacity-10 group-hover:opacity-20 transition-opacity">
            <span class="text-xl">➕</span>
          </div>
        }
      >
        {(item) => (
          <>
            {/* Background pattern/accent */}
            <div class={`absolute inset-0 opacity-10 ${theme()?.accent}`}></div>

            {/* Item icon (Letter based for now) */}
            <div
              class={`
                relative
                flex
                items-center
                justify-center
                w-full
                h-full
                ${theme()?.text}
                font-black
                text-lg
                tracking-tighter
              `}
            >
              <span class="drop-shadow-[0_0_8px_currentColor]">{item().name.charAt(0)}</span>

              {/* Rarity shine effect */}
              <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-100%] group-hover:translate-x-[100%] duration-1000"></div>
            </div>

            {/* Quantity badge */}
            <Show when={props.quantity && props.quantity > 1}>
              <div
                class="
                  absolute
                  bottom-0.5
                  right-0.5
                  bg-black/80
                  text-white/90
                  px-1
                  py-0.5
                  rounded-md
                  text-[9px]
                  font-mono
                  font-bold
                  border border-white/10
                  backdrop-blur-md
                "
              >
                {props.quantity}
              </div>
            </Show>

            {/* Selection indicator glow */}
            <Show when={props.selected}>
              <div class="absolute inset-0 ring-1 ring-primary-400 rounded-xl animate-pulse"></div>
            </Show>
          </>
        )}
      </Show>
    </div>
  );
};
