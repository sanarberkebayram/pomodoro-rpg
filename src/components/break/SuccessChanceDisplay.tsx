/**
 * SuccessChanceDisplay Component
 * Shows calculated success chance with detailed breakdown
 */

import { Component, For } from 'solid-js';
import type { SuccessCalculation } from '../../core/types/tasks';

interface SuccessChanceDisplayProps {
  calculation: SuccessCalculation;
}

/**
 * SuccessChanceDisplay - Show success chance breakdown
 */
export const SuccessChanceDisplay: Component<SuccessChanceDisplayProps> = (props) => {
  const getChanceColor = (chance: number): string => {
    if (chance >= 75) return 'success-high';
    if (chance >= 50) return 'success-medium';
    if (chance >= 25) return 'success-low';
    return 'success-very-low';
  };

  const getChanceLabel = (chance: number): string => {
    if (chance >= 75) return 'High';
    if (chance >= 50) return 'Moderate';
    if (chance >= 25) return 'Low';
    return 'Very Low';
  };

  return (
    <div class="success-chance-display">
      <div class="success-chance-display__header">
        <h4 class="section-title">Success Chance</h4>
      </div>

      <div
        class={`success-chance-display__result ${getChanceColor(props.calculation.finalChance)}`}
      >
        <div class="success-result">
          <span class="success-result__percentage">{props.calculation.finalChance}%</span>
          <span class="success-result__label">
            {getChanceLabel(props.calculation.finalChance)} Chance
          </span>
        </div>
        <div class="success-bar">
          <div class="success-bar__fill" style={{ width: `${props.calculation.finalChance}%` }} />
        </div>
      </div>

      <div class="success-chance-display__breakdown">
        <h5 class="breakdown-title">Breakdown</h5>
        <div class="breakdown-list">
          <For each={props.calculation.breakdown}>
            {(item) => (
              <div class="breakdown-item">
                <span class="breakdown-item__text">{item}</span>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="success-chance-display__note">
        <p class="note-text">Success chance is clamped between 5% and 95%</p>
      </div>
    </div>
  );
};
