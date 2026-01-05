import { Component, For, Show } from 'solid-js';
import type { CharacterStats, InjuryState, HospitalBill } from '../../core/types/character';

interface StatDisplayProps {
  baseStats: CharacterStats;
  computedStats: CharacterStats;
  /** Current injury state */
  injury?: InjuryState;
  /** Current hospital bill */
  hospitalBill?: HospitalBill | null;
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
  colorClass: string;
  description: string;
}

const STAT_CONFIGS: StatConfig[] = [
  {
    key: 'power',
    label: 'Power',
    icon: '⚔️',
    colorClass: 'text-rose-400',
    description: 'Offensive throughput and mission success capability',
  },
  {
    key: 'defense',
    label: 'Defense',
    icon: '🛡️',
    colorClass: 'text-primary-400',
    description: 'Damage mitigation during hazard events',
  },
  {
    key: 'focus',
    label: 'Focus',
    icon: '🎯',
    colorClass: 'text-violet-400',
    description: 'Precision work and critical success probability',
  },
  {
    key: 'luck',
    label: 'Luck',
    icon: '🍀',
    colorClass: 'text-emerald-400',
    description: 'Loot quality and rare node discovery',
  },
];

/**
 * StatDisplay - Shows character stats with bonuses in a modern UI
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

  return (
    <div class="space-y-6">
      {/* Integrity Core (Health) */}
      <div class="glass-panel p-5 border-white/5 bg-white/2">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h4 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Integrity Core</h4>
            <span class="text-xs font-mono text-gray-400">STATUS: {props.computedStats.health > props.computedStats.maxHealth * 0.3 ? 'STABLE' : 'CRITICAL'}</span>
          </div>
          <div class="text-right">
            <span class="text-xl font-mono font-bold text-white">{props.computedStats.health} <span class="text-xs opacity-30">/ {props.computedStats.maxHealth}</span></span>
          </div>
        </div>
        <div class="h-2 w-full bg-black/40 rounded-full border border-white/5 overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-danger to-rose-400 transition-all duration-1000 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
            style={{ width: `${(props.computedStats.health / props.computedStats.maxHealth) * 100}%` }}
          />
        </div>
      </div>

      {/* Primary Stat Grid */}
      <div
        class={`
          grid
          gap-4
          ${props.layout === 'horizontal' ? 'grid-cols-2' : 'grid-cols-1'}
        `}
      >
        <For each={STAT_CONFIGS}>
          {(config) => {
            const computedValue = props.computedStats[config.key];
            const bonus = getStatBonus(config.key);
            const hasBonus = bonus !== 0;

            return (
              <div
                class={`
                  glass-panel
                  bg-white/5
                  border-white/5
                  p-4
                  group
                  relative
                  overflow-hidden
                  transition-all
                  duration-300
                  hover:bg-white/10
                  ${props.detailed ? 'hover:-translate-y-1' : ''}
                `}
              >
                {/* Background Decor */}
                <div class={`absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity`}>
                  <span class="text-4xl">{config.icon}</span>
                </div>

                <div class="flex items-center justify-between relative z-10">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-black/40 border border-white/5 text-xl">
                      {config.icon}
                    </div>
                    <div>
                      <p class="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{config.label}</p>
                      <p class={`text-2xl font-display font-bold text-white group-hover:${config.colorClass}`}>{Math.floor(computedValue)}</p>
                    </div>
                  </div>

                  <Show when={hasBonus}>
                    <div class="text-right">
                      <span class={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${bonus > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                        {bonus > 0 ? '+' : ''}{Math.floor(bonus)}
                      </span>
                    </div>
                  </Show>
                </div>

                {props.detailed && (
                  <div class="mt-4 pt-4 border-t border-white/5">
                    <p class="text-[10px] text-gray-400 leading-relaxed italic">{config.description}</p>
                    {hasBonus && (
                      <div class="mt-3 flex items-center gap-2 text-[10px] font-mono uppercase">
                        <span class="text-gray-500">Base Matrix:</span>
                        <span class="text-gray-300">{Math.floor(props.baseStats[config.key])}</span>
                        <span class="text-gray-500 ml-auto group-hover:block hidden animate-fade-in">+ {Math.floor(bonus)} From Equipment</span>
                      </div>
                    )}
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
