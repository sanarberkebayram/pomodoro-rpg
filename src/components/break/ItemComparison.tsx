/**
 * ItemComparison Component
 * Displays side-by-side comparison of new item vs currently equipped item
 */

import { Component, Show, For, createMemo } from 'solid-js';
import type { EquippableItem } from '../../core/types/items';
import type { CharacterStats } from '../../core/types/character';
import { getRarityColor, getRarityName } from '../../systems/loot/RaritySystem';

interface ItemComparisonProps {
  /** New item being evaluated */
  newItem: EquippableItem;

  /** Currently equipped item (null if slot is empty) */
  equippedItem: EquippableItem | null;

  /** Callback to equip the new item */
  onEquip: () => void;

  /** Callback to close comparison */
  onClose: () => void;
}

interface StatDifference {
  stat: keyof Omit<CharacterStats, 'health' | 'maxHealth'>;
  label: string;
  currentValue: number;
  newValue: number;
  difference: number;
  isUpgrade: boolean;
}

/**
 * ItemComparison - Side-by-side item comparison modal
 */
export const ItemComparison: Component<ItemComparisonProps> = (props) => {
  // Calculate stat differences
  const statDifferences = createMemo<StatDifference[]>(() => {
    const stats: Array<keyof Omit<CharacterStats, 'health' | 'maxHealth'>> = [
      'power',
      'defense',
      'focus',
      'luck',
    ];

    const statLabels: Record<keyof Omit<CharacterStats, 'health' | 'maxHealth'>, string> = {
      power: 'Power',
      defense: 'Defense',
      focus: 'Focus',
      luck: 'Luck',
    };

    return stats
      .map((stat) => {
        const currentValue = props.equippedItem?.statBonuses[stat] ?? 0;
        const newValue = props.newItem.statBonuses[stat] ?? 0;
        const difference = newValue - currentValue;

        return {
          stat,
          label: statLabels[stat],
          currentValue,
          newValue,
          difference,
          isUpgrade: difference > 0,
        };
      })
      .filter((diff) => diff.currentValue !== 0 || diff.newValue !== 0); // Only show non-zero stats
  });

  // Check if new item is overall upgrade
  const isOverallUpgrade = createMemo(() => {
    return statDifferences().some((diff) => diff.isUpgrade);
  });

  // Calculate value difference
  const valueDifference = createMemo(() => {
    return props.newItem.value - (props.equippedItem?.value ?? 0);
  });

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white/90 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div class="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-6">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold">Item Comparison</h2>
              <p class="text-slate-200 mt-1">Compare equipment stats</p>
            </div>
            <button
              onClick={props.onClose}
              class="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-2 gap-6">
            {/* Current Item */}
            <div>
              <h3 class="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                Current
              </h3>
              <Show
                when={props.equippedItem}
                fallback={
                  <div class="bg-slate-100 rounded-xl p-6 text-center text-slate-500 h-full flex items-center justify-center">
                    <div>
                      <div class="text-4xl mb-2">∅</div>
                      <div>No item equipped</div>
                    </div>
                  </div>
                }
              >
                {(item) => <ItemComparisonCard item={item()} />}
              </Show>
            </div>

            {/* New Item */}
            <div>
              <h3 class="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                New Item
                <Show when={isOverallUpgrade()}>
                  <span class="ml-2 text-emerald-600">✓ Upgrade</span>
                </Show>
              </h3>
              <ItemComparisonCard item={props.newItem} isNew />
            </div>
          </div>

          {/* Stat Differences */}
          <Show when={statDifferences().length > 0}>
            <div class="mt-6 bg-slate-50 rounded-2xl p-4">
              <h4 class="font-semibold text-slate-800 mb-3">Stat Comparison</h4>
              <div class="space-y-2">
                <For each={statDifferences()}>
                  {(diff) => (
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-slate-600">{diff.label}</span>
                      <div class="flex items-center gap-3">
                        <span class="text-slate-500 w-12 text-right">{diff.currentValue}</span>
                        <span class="text-slate-400">→</span>
                        <span class="font-semibold w-12">{diff.newValue}</span>
                        <span
                          class={`
                            w-16
                            text-right
                            font-bold
                            ${
                              diff.difference > 0
                                ? 'text-emerald-600'
                                : diff.difference < 0
                                  ? 'text-red-600'
                                  : 'text-slate-400'
                            }
                          `}
                        >
                          {diff.difference > 0 ? '+' : ''}
                          {diff.difference}
                        </span>
                      </div>
                    </div>
                  )}
                </For>

                {/* Value Difference */}
                <div class="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                  <span class="text-slate-600">Value</span>
                  <div class="flex items-center gap-3">
                    <span class="text-slate-500 w-12 text-right">
                      {props.equippedItem?.value ?? 0}g
                    </span>
                    <span class="text-slate-400">→</span>
                    <span class="font-semibold w-12">{props.newItem.value}g</span>
                    <span
                      class={`
                        w-16
                        text-right
                        font-bold
                        ${
                          valueDifference() > 0
                            ? 'text-emerald-600'
                            : valueDifference() < 0
                              ? 'text-red-600'
                              : 'text-slate-400'
                        }
                      `}
                    >
                      {valueDifference() > 0 ? '+' : ''}
                      {valueDifference()}g
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Show>
        </div>

        {/* Actions */}
        <div class="border-t border-white/70 p-6">
          <div class="flex gap-4">
            <button
              onClick={props.onEquip}
              class={`
                flex-1
                py-3
                px-6
                rounded-xl
                font-bold
                text-white
                transition-all
                ${
                  isOverallUpgrade()
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                }
                active:scale-95
              `}
            >
              <Show when={isOverallUpgrade()} fallback="Equip Anyway">
                Equip Upgrade
              </Show>
            </button>
            <button
              onClick={props.onClose}
              class="
                px-6
                py-3
                rounded-xl
                font-semibold
                text-slate-700
                bg-slate-200
                hover:bg-slate-300
                active:scale-95
                transition-all
              "
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ItemComparisonCard - Display card for item in comparison
 */
const ItemComparisonCard: Component<{
  item: EquippableItem;
  isNew?: boolean;
}> = (props) => {
  const rarityColor = () => getRarityColor(props.item.rarity);
  const rarityName = () => getRarityName(props.item.rarity);

  return (
    <div
      class={`
        bg-white/90
        rounded-2xl
        border-2
        overflow-hidden
        ${props.isNew ? 'border-emerald-500 shadow-lg' : 'border-slate-200'}
      `}
    >
      {/* Rarity Header */}
      <div
        class="px-4 py-2 text-sm font-bold text-white"
        style={{ 'background-color': rarityColor() }}
      >
        {rarityName()}
      </div>

      {/* Item Details */}
      <div class="p-4">
        {/* Item Icon */}
        <div class="w-20 h-20 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center text-4xl">
          {props.item.name.charAt(0)}
        </div>

        {/* Item Name */}
        <div class="text-center mb-4">
          <div class="font-bold text-slate-800 text-lg">{props.item.name}</div>
          <div class="text-sm text-slate-500 capitalize mt-1">
            {props.item.equipmentSlot} •{' '}
            {props.item.type === 'weapon' ? props.item.weaponType : props.item.armorType}
          </div>
        </div>

        {/* Stats */}
        <div class="space-y-2">
          <Show when={props.item.statBonuses.power}>
            {(power) => <StatRow label="Power" value={power()} />}
          </Show>
          <Show when={props.item.statBonuses.defense}>
            {(defense) => <StatRow label="Defense" value={defense()} />}
          </Show>
          <Show when={props.item.statBonuses.focus}>
            {(focus) => <StatRow label="Focus" value={focus()} />}
          </Show>
          <Show when={props.item.statBonuses.luck}>
            {(luck) => <StatRow label="Luck" value={luck()} />}
          </Show>

          {/* Special properties */}
          <Show when={props.item.type === 'weapon'}>
            {() => {
              const weapon = props.item as Extract<EquippableItem, { type: 'weapon' }>;
              return (
                <div class="pt-2 border-t border-slate-200">
                  <StatRow
                    label="Damage"
                    value={`${weapon.damageRange.min}-${weapon.damageRange.max}`}
                  />
                </div>
              );
            }}
          </Show>

          <Show when={props.item.type === 'armor'}>
            {() => {
              const armor = props.item as Extract<EquippableItem, { type: 'armor' }>;
              return (
                <div class="pt-2 border-t border-slate-200">
                  <StatRow label="Armor Rating" value={armor.armorRating} />
                </div>
              );
            }}
          </Show>
        </div>

        {/* Description */}
        <div class="mt-4 text-xs text-slate-500 text-center">{props.item.description}</div>
      </div>
    </div>
  );
};

/**
 * StatRow - Display a single stat with label and value
 */
const StatRow: Component<{ label: string; value: number | string }> = (props) => {
  return (
    <div class="flex justify-between text-sm">
      <span class="text-slate-600">{props.label}:</span>
      <span class="font-semibold text-slate-800">+{props.value}</span>
    </div>
  );
};
