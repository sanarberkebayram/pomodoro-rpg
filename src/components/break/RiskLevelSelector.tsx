/**
 * RiskLevelSelector Component
 * Interface for selecting task risk level with preview of modifiers
 */

import { Component, For } from 'solid-js';
import type { RiskLevel, TaskConfig } from '../../core/types/tasks';

interface RiskLevelSelectorProps {
  config: TaskConfig;
  selectedRisk: RiskLevel;
  onRiskSelect: (risk: RiskLevel) => void;
}

const RISK_LEVELS: RiskLevel[] = ['safe', 'standard', 'risky'];

/**
 * RiskLevelSelector - Choose risk level for task
 */
export const RiskLevelSelector: Component<RiskLevelSelectorProps> = (props) => {
  const getRiskModifier = (risk: RiskLevel) => {
    return props.config.riskModifiers[risk];
  };

  const getRiskColor = (risk: RiskLevel): string => {
    switch (risk) {
      case 'safe':
        return 'risk-safe';
      case 'standard':
        return 'risk-standard';
      case 'risky':
        return 'risk-risky';
    }
  };

  return (
    <div class="risk-selector">
      <h3 class="risk-selector__title">Risk Level</h3>
      <div class="risk-selector__options">
        <For each={RISK_LEVELS}>
          {(risk) => {
            const modifier = getRiskModifier(risk);
            const isSelected = props.selectedRisk === risk;

            return (
              <button
                class={`risk-option ${getRiskColor(risk)} ${isSelected ? 'risk-option--selected' : ''}`}
                onClick={() => props.onRiskSelect(risk)}
              >
                <div class="risk-option__header">
                  <span class="risk-option__name">{modifier.displayName}</span>
                  <span class="risk-option__badge">{risk}</span>
                </div>

                <p class="risk-option__description">{modifier.description}</p>

                <div class="risk-option__modifiers">
                  <div class="modifier">
                    <span class="modifier__label">Success Chance:</span>
                    <span
                      class={`modifier__value ${modifier.successChanceModifier >= 0 ? 'positive' : 'negative'}`}
                    >
                      {modifier.successChanceModifier >= 0 ? '+' : ''}
                      {modifier.successChanceModifier}%
                    </span>
                  </div>
                  <div class="modifier">
                    <span class="modifier__label">Reward Multiplier:</span>
                    <span
                      class={`modifier__value ${modifier.rewardMultiplier >= 1 ? 'positive' : 'neutral'}`}
                    >
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
