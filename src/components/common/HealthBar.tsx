/**
 * HealthBar Component
 * Visual health bar with injury indication
 */

import { Component, Show } from 'solid-js';

interface HealthBarProps {
  /** Current health */
  current: number;
  /** Maximum health */
  max: number;
  /** Whether character is injured */
  isInjured?: boolean;
  /** Show numeric values */
  showValues?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Custom class name */
  class?: string;
}

/**
 * HealthBar - Displays character health with visual indicators
 */
export const HealthBar: Component<HealthBarProps> = (props) => {
  const percentage = () => Math.max(0, Math.min(100, (props.current / props.max) * 100));

  const barColor = () => {
    const pct = percentage();
    if (pct > 75) return 'bg-green-500';
    if (pct > 50) return 'bg-yellow-500';
    if (pct > 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const barHeight = () => {
    switch (props.size ?? 'medium') {
      case 'small':
        return 'h-2';
      case 'large':
        return 'h-6';
      default:
        return 'h-4';
    }
  };

  const fontSize = () => {
    switch (props.size ?? 'medium') {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  return (
    <div class={`w-full ${props.class || ''}`}>
      <Show when={props.showValues ?? true}>
        <div class={`flex items-center justify-between mb-1 ${fontSize()}`}>
          <span class="font-medium text-gray-700">Health</span>
          <span class="font-semibold text-gray-900">
            {Math.floor(props.current)} / {Math.floor(props.max)}
          </span>
        </div>
      </Show>

      <div class="relative">
        {/* Background */}
        <div class={`w-full ${barHeight()} bg-gray-200 rounded-full overflow-hidden`}>
          {/* Health fill */}
          <div
            class={`${barHeight()} ${barColor()} transition-all duration-300 ease-out`}
            style={{ width: `${percentage()}%` }}
          />
        </div>

        {/* Injury indicator overlay */}
        <Show when={props.isInjured}>
          <div
            class="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"
            style={{
              'background-image':
                'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)',
            }}
          >
            <span class="text-xs font-bold text-red-600 drop-shadow-sm">INJURED</span>
          </div>
        </Show>
      </div>

      {/* Low health warning */}
      <Show when={percentage() < 25}>
        <div class="mt-1 text-xs text-red-600 font-medium">⚠️ Low Health!</div>
      </Show>
    </div>
  );
};
