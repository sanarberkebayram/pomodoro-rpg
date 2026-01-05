import { Component, For } from 'solid-js';
import type { RiskLevel, TaskConfig } from '../../core/types/tasks';

interface RiskLevelSelectorProps {
  config: TaskConfig;
  selectedRisk: RiskLevel;
  onRiskSelect: (risk: RiskLevel) => void;
}

const RISK_LEVELS: RiskLevel[] = ['safe', 'standard', 'risky'];

/**
 * RiskLevelSelector - Choose risk level for task with modern UI
 */
export const RiskLevelSelector: Component<RiskLevelSelectorProps> = (props) => {
  const getRiskModifier = (risk: RiskLevel) => {
    return props.config.riskModifiers[risk];
  };

  const getRiskStyles = (risk: RiskLevel): string => {
    switch (risk) {
      case 'safe':
        return 'border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400';
      case 'standard':
        return 'border-primary-500/30 hover:border-primary-500/50 text-primary-400';
      case 'risky':
        return 'border-danger/30 hover:border-danger/50 text-danger';
    }
  };

  return (
    <div class="space-y-4">
      <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest">Risk Assessment</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <For each={RISK_LEVELS}>
          {(risk) => {
            const modifier = getRiskModifier(risk);
            const isSelected = props.selectedRisk === risk;

            return (
              <button
                class={`relative flex flex-col p-4 rounded-xl border transition-all duration-300 ${isSelected
                    ? getRiskStyles(risk).replace('border-', 'bg-white/5 border-') + ' ring-1 ring-inset'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                onClick={() => props.onRiskSelect(risk)}
              >
                <div class="flex items-center justify-between mb-2">
                  <span class={`text-sm font-bold uppercase tracking-tight ${isSelected ? '' : 'text-gray-300'}`}>
                    {modifier.displayName}
                  </span>
                  {isSelected && (
                    <div class="w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor]"></div>
                  )}
                </div>

                <div class="space-y-2 mt-auto">
                  <div class="flex items-center justify-between text-[10px] uppercase font-bold">
                    <span class="text-gray-500">Success</span>
                    <span class={modifier.successChanceModifier >= 0 ? 'text-emerald-400' : 'text-danger'}>
                      {modifier.successChanceModifier >= 0 ? '+' : ''}{modifier.successChanceModifier}%
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-[10px] uppercase font-bold">
                    <span class="text-gray-500">Rewards</span>
                    <span class="text-primary-400">
                      ×{modifier.rewardMultiplier.toFixed(1)}
                    </span>
                  </div>
                </div>
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
};
