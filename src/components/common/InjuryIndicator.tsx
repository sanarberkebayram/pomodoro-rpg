/**
 * InjuryIndicator Component
 * Visual indicator for character injury status
 */

import { Component, Show } from 'solid-js';
import type { InjuryState } from '../../core/types/character';
import { INJURY_SEVERITY_CONFIG } from '../../systems/injury/InjuryManager';

interface InjuryIndicatorProps {
  injury: InjuryState;
  /** Display mode: compact (icon + badge) or full (detailed info) */
  mode?: 'compact' | 'full';
  /** Custom class name */
  class?: string;
}

/**
 * InjuryIndicator - Shows character injury status visually
 */
export const InjuryIndicator: Component<InjuryIndicatorProps> = (props) => {
  const mode = () => props.mode ?? 'compact';

  const severityColor = () => {
    if (!props.injury.isInjured) return 'green';
    switch (props.injury.severity) {
      case 'minor':
        return 'yellow';
      case 'moderate':
        return 'orange';
      case 'severe':
        return 'red';
      default:
        return 'gray';
    }
  };

  const severityEmoji = () => {
    if (!props.injury.isInjured) return '✓';
    switch (props.injury.severity) {
      case 'minor':
        return '🤕';
      case 'moderate':
        return '😰';
      case 'severe':
        return '🩹';
      default:
        return '❓';
    }
  };

  const severityConfig = () => {
    if (!props.injury.isInjured) return null;
    return INJURY_SEVERITY_CONFIG[props.injury.severity];
  };

  return (
    <Show
      when={mode() === 'full'}
      fallback={
        // Compact mode - icon with badge
        <div class={`inline-flex items-center ${props.class || ''}`}>
          <div
            class={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
              props.injury.isInjured
                ? severityColor() === 'red'
                  ? 'bg-red-100 text-red-800'
                  : severityColor() === 'orange'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            <span class="text-base">{severityEmoji()}</span>
            <Show when={props.injury.isInjured} fallback={<span class="text-xs">Healthy</span>}>
              <span class="text-xs">
                {severityConfig()?.displayName} (-{props.injury.successPenalty}%)
              </span>
            </Show>
          </div>
        </div>
      }
    >
      {/* Full mode - detailed card */}
      <div class={`${props.class || ''}`}>
        <Show
          when={props.injury.isInjured}
          fallback={
            <div class="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div class="text-2xl">✓</div>
              <div>
                <div class="font-semibold text-green-900">Healthy</div>
                <div class="text-sm text-green-700">No injuries</div>
              </div>
            </div>
          }
        >
          <div
            class={`flex items-start gap-3 p-3 rounded-lg border ${
              severityColor() === 'red'
                ? 'bg-red-50 border-red-200'
                : severityColor() === 'orange'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div class="text-2xl">{severityEmoji()}</div>
            <div class="flex-1">
              <div
                class={`font-semibold ${
                  severityColor() === 'red'
                    ? 'text-red-900'
                    : severityColor() === 'orange'
                      ? 'text-orange-900'
                      : 'text-yellow-900'
                }`}
              >
                {severityConfig()?.displayName}
              </div>
              <div
                class={`text-sm mt-1 ${
                  severityColor() === 'red'
                    ? 'text-red-700'
                    : severityColor() === 'orange'
                      ? 'text-orange-700'
                      : 'text-yellow-700'
                }`}
              >
                {severityConfig()?.description}
              </div>
              <div class="flex gap-4 mt-2 text-xs">
                <div>
                  <span class="opacity-75">Success: </span>
                  <span class="font-semibold">-{props.injury.successPenalty}%</span>
                </div>
                <div>
                  <span class="opacity-75">Healing: </span>
                  <span class="font-semibold">{severityConfig()?.healingCost}G</span>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </Show>
  );
};
