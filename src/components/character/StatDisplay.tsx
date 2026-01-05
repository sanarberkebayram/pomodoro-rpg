/**
 * StatDisplay Component
 * Displays character stats with visual progress bars and bonuses
 */

import { Component, For, createMemo } from 'solid-js';
import type { CharacterStats } from '../../core/types/character';

interface StatDisplayProps {
  baseStats: CharacterStats;
  computedStats: CharacterStats;
  /** Whether to show detailed breakdown */
  detailed?: boolean;
  /** Layout: horizontal or vertical */
  layout?: 'horizontal' | 'vertical';
}

/**
 * Stat configuration for display
 */
interface StatConfig {
  key: keyof CharacterStats;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const STAT_CONFIGS: StatConfig[] = [
  {
    key: 'power',
    label: 'Power',
    icon: '⚔️',
    color: 'red',
    description: 'Increases attack damage and task success rate',
  },
  {
    key: 'defense',
    label: 'Defense',
    icon: '🛡️',
    color: 'blue',
    description: 'Reduces damage taken from failures',
  },
  {
    key: 'focus',
    label: 'Focus',
    icon: '🎯',
    color: 'purple',
    description: 'Improves critical hit chance and task precision',
  },
  {
    key: 'luck',
    label: 'Luck',
    icon: '🍀',
    color: 'green',
    description: 'Increases loot quality and rare item drops',
  },
];

/**
 * StatDisplay - Shows character stats with bonuses
 */
export const StatDisplay: Component<StatDisplayProps> = (props) => {
  /**
   * Calculate bonus for a stat (difference between computed and base)
   */
  const getStatBonus = (statKey: keyof CharacterStats): number => {
    // Don't show bonuses for health stats in this view
    if (statKey === 'health' || statKey === 'maxHealth') return 0;

    return props.computedStats[statKey] - props.baseStats[statKey];
  };

  /**
   * Get color classes for a stat
   */
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      red: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-300',
      },
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-300',
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-300',
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-300',
      },
    };

    return colorMap[color] || colorMap.red;
  };

  /**
   * Health percentage for progress bar
   */
  const healthPercentage = createMemo(() => {
    return (props.computedStats.health / props.computedStats.maxHealth) * 100;
  });

  /**
   * Health bar color based on percentage
   */
  const healthBarColor = createMemo(() => {
    const percentage = healthPercentage();
    if (percentage > 70) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  });

  return (
    <div class="space-y-4">
      {/* Health bar - always shown at top */}
      <div class="bg-white border-2 border-gray-300 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">❤️</span>
            <span class="font-bold text-gray-800">Health</span>
          </div>
          <span class="text-sm font-semibold text-gray-700">
            {Math.floor(props.computedStats.health)} / {Math.floor(props.computedStats.maxHealth)}
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            class={`h-full ${healthBarColor()} transition-all duration-300`}
            style={{ width: `${healthPercentage()}%` }}
            role="progressbar"
            aria-valuenow={props.computedStats.health}
            aria-valuemin={0}
            aria-valuemax={props.computedStats.maxHealth}
          />
        </div>
      </div>

      {/* Main stats grid */}
      <div
        class={`
          grid
          gap-3
          ${props.layout === 'horizontal' ? 'grid-cols-2' : 'grid-cols-1'}
        `}
      >
        <For each={STAT_CONFIGS}>
          {(config) => {
            const colors = getColorClasses(config.color);
            const baseValue = props.baseStats[config.key];
            const computedValue = props.computedStats[config.key];
            const bonus = getStatBonus(config.key);
            const hasBonus = bonus !== 0;

            return (
              <div
                class={`
                  bg-white
                  border-2
                  ${colors.border}
                  rounded-lg
                  p-3
                  ${props.detailed ? 'hover:shadow-md' : ''}
                  transition-shadow
                `}
                title={config.description}
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-xl" aria-hidden="true">
                      {config.icon}
                    </span>
                    <div>
                      <p class="font-semibold text-gray-800 text-sm">{config.label}</p>
                      {props.detailed && (
                        <p class="text-xs text-gray-500 mt-1">{config.description}</p>
                      )}
                    </div>
                  </div>
                  <div class="text-right">
                    <p class={`text-2xl font-bold ${colors.text}`}>{Math.floor(computedValue)}</p>
                    {hasBonus && (
                      <p
                        class={`text-xs font-semibold ${bonus > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {bonus > 0 ? '+' : ''}
                        {Math.floor(bonus)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Detailed breakdown */}
                {props.detailed && hasBonus && (
                  <div class="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                    <div class="flex justify-between">
                      <span>Base:</span>
                      <span class="font-semibold">{Math.floor(baseValue)}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Bonus:</span>
                      <span
                        class={`font-semibold ${bonus > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {bonus > 0 ? '+' : ''}
                        {Math.floor(bonus)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};
