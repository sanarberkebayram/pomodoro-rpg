import { Component, For } from 'solid-js';
import type { SuccessCalculation } from '../../core/types/tasks';

interface SuccessChanceDisplayProps {
  calculation: SuccessCalculation;
}

/**
 * SuccessChanceDisplay - Modern display for success chance calculations
 */
export const SuccessChanceDisplay: Component<SuccessChanceDisplayProps> = (props) => {
  const getChanceColor = (chance: number): string => {
    if (chance >= 75) return 'from-emerald-600 to-emerald-400 shadow-emerald-500/20';
    if (chance >= 50) return 'from-primary-600 to-primary-400 shadow-primary-500/20';
    if (chance >= 25) return 'from-amber-600 to-amber-400 shadow-amber-500/20';
    return 'from-danger to-red-400 shadow-danger/20';
  };

  const getChanceTextClass = (chance: number): string => {
    if (chance >= 75) return 'text-emerald-400';
    if (chance >= 50) return 'text-primary-400';
    if (chance >= 25) return 'text-amber-400';
    return 'text-danger';
  };

  const getChanceLabel = (chance: number): string => {
    if (chance >= 75) return 'Optimal Conditions';
    if (chance >= 50) return 'Favorable Odds';
    if (chance >= 25) return 'High Risk';
    return 'Critical Hazard';
  };

  return (
    <div class="glass-panel p-6 border-white/5 bg-black/40">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Success Probability</h4>
          <span class={`text-sm font-bold ${getChanceTextClass(props.calculation.finalChance)}`}>
            {getChanceLabel(props.calculation.finalChance)}
          </span>
        </div>
        <div class="text-right">
          <span class={`text-4xl font-display font-bold ${getChanceTextClass(props.calculation.finalChance)}`}>
            {props.calculation.finalChance}<span class="text-xl opacity-50">%</span>
          </span>
        </div>
      </div>

      <div class="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 mb-8">
        <div
          class={`h-full bg-gradient-to-r transition-all duration-1000 ease-out shadow-lg ${getChanceColor(props.calculation.finalChance)}`}
          style={{ width: `${props.calculation.finalChance}%` }}
        />
      </div>

      <div class="space-y-4">
        <h5 class="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Calculation Breakdown</h5>
        <div class="grid grid-cols-1 gap-2">
          <For each={props.calculation.breakdown}>
            {(item) => (
              <div class="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-white/5 border border-white/5 text-[11px] font-mono transition-transform hover:translate-x-1">
                <span class="w-1.5 h-1.5 rounded-sm bg-primary-500/50"></span>
                <span class="text-gray-300">{item}</span>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-white/5 text-[9px] text-gray-500 italic text-center font-medium">
        Probability is dynamically calculated based on current character matrix and environment parameters.
      </div>
    </div>
  );
};
