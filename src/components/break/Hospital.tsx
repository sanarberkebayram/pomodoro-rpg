/**
 * Hospital Component
 * Interface for viewing injuries, managing hospital bills, and healing services
 */

import { Component, Show, createSignal, createMemo } from 'solid-js';
import type { CharacterStore } from '../../core/state/CharacterState';
import type { InventoryStore } from '../../core/state/InventoryState';
import { createHospitalSystem } from '../../systems/injury/HospitalSystem';
import { INJURY_SEVERITY_CONFIG } from '../../systems/injury/InjuryManager';

interface HospitalProps {
  characterStore: CharacterStore;
  inventoryStore: InventoryStore;
  /** Whether interface is locked (during work phase) */
  locked?: boolean;
  onClose?: () => void;
}

/**
 * Hospital - Injury and medical services interface
 */
export const Hospital: Component<HospitalProps> = (props) => {
  const [notification, setNotification] = createSignal<string | null>(null);
  const [notificationType, setNotificationType] = createSignal<'success' | 'error' | 'info'>(
    'info'
  );

  const hospitalSystem = createHospitalSystem();

  const characterState = () => props.characterStore.state;
  const inventoryState = () => props.inventoryStore.state;

  /**
   * Show notification message briefly
   */
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification(message);
    setNotificationType(type);
    setTimeout(() => setNotification(null), 3000);
  };

  /**
   * Check if player has healing potions
   */
  const healingPotions = createMemo(() => {
    return inventoryState().items.filter((item) => item.type === 'consumable' && item.curesInjury);
  });

  const hasHealingPotion = createMemo(() => healingPotions().length > 0);

  /**
   * Get current gold
   */
  const currentGold = createMemo(() => inventoryState().gold);

  /**
   * Get treatment cost
   */
  const treatmentCost = createMemo(() => {
    return hospitalSystem.calculateTreatmentCost(characterState().injury);
  });

  /**
   * Check if can afford treatment
   */
  const canAffordTreatment = createMemo(() => {
    return hospitalSystem.canAffordTreatment(characterState().injury, currentGold());
  });

  /**
   * Check if can afford bill payment
   */
  const canAffordBillPayment = createMemo(() => {
    return hospitalSystem.canAffordBillPayment(characterState().hospitalBill, currentGold());
  });

  /**
   * Handle hospital treatment
   */
  const handleHospitalTreatment = () => {
    if (props.locked) {
      showNotification('Cannot use hospital during work phase', 'error');
      return;
    }

    if (!characterState().injury.isInjured) {
      showNotification('You are not injured', 'info');
      return;
    }

    const result = hospitalSystem.processHospitalVisit(characterState().injury, currentGold());

    if (result.success) {
      // Heal the injury
      props.characterStore.healInjury();

      // Pay gold if player had enough
      if (result.goldPaid > 0) {
        props.inventoryStore.removeGold(result.goldPaid);
      }

      // Create bill if player didn't have enough
      if (result.billCreated) {
        const bill = hospitalSystem.generateBill(result.billAmount);
        props.characterStore.addHospitalBill(bill.amount);
      }

      // Also restore health to full
      props.characterStore.fullHeal();

      showNotification(result.message, 'success');
    } else {
      showNotification(result.message, 'error');
    }
  };

  /**
   * Handle potion use
   */
  const handleUsePotionHealing = () => {
    if (props.locked) {
      showNotification('Cannot use items during work phase', 'error');
      return;
    }

    if (!characterState().injury.isInjured) {
      showNotification('You are not injured', 'info');
      return;
    }

    const potion = healingPotions()[0];
    if (!potion) {
      showNotification('No healing potions in inventory', 'error');
      return;
    }

    // Heal injury
    props.characterStore.healInjury();

    // Heal health if potion has healAmount
    if (potion.healAmount) {
      props.characterStore.heal(potion.healAmount);
    }

    // Remove potion from inventory
    props.inventoryStore.removeItem(potion.id, 1);

    showNotification(`Used ${potion.name}. Injury healed!`, 'success');
  };

  /**
   * Handle bill payment
   */
  const handlePayBill = () => {
    if (props.locked) {
      showNotification('Cannot pay bills during work phase', 'error');
      return;
    }

    const result = hospitalSystem.processBillPayment(characterState().hospitalBill, currentGold());

    if (result.success) {
      props.inventoryStore.removeGold(result.amountPaid);
      props.characterStore.payHospitalBill();
      showNotification(result.message, 'success');
    } else {
      showNotification(result.message, 'error');
    }
  };

  /**
   * Get injury severity config
   */
  const injurySeverityConfig = createMemo(() => {
    if (!characterState().injury.isInjured) return null;
    return INJURY_SEVERITY_CONFIG[characterState().injury.severity];
  });

  /**
   * Get time since injury formatted
   */
  const timeSinceInjury = createMemo(() => {
    const injury = characterState().injury;
    if (!injury.isInjured || !injury.injuredAt) return '';

    const ms = Date.now() - injury.injuredAt;
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    }
    return `${minutes}m ago`;
  });

  return (
    <div class="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">Hospital</h2>
        <Show when={props.onClose}>
          <button
            onClick={props.onClose}
            class="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            disabled={props.locked}
          >
            ×
          </button>
        </Show>
      </div>

      {/* Notification */}
      <Show when={notification()}>
        <div
          class={`p-3 rounded-lg text-sm font-medium ${
            notificationType() === 'success'
              ? 'bg-green-100 text-green-800'
              : notificationType() === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
          }`}
        >
          {notification()}
        </div>
      </Show>

      {/* Gold Display */}
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="text-sm text-yellow-800 font-medium">Your Gold</div>
        <div class="text-2xl font-bold text-yellow-900">{currentGold()} G</div>
      </div>

      {/* Injury Status */}
      <div class="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h3 class="text-lg font-semibold text-gray-900">Injury Status</h3>

        <Show
          when={characterState().injury.isInjured}
          fallback={
            <div class="text-center py-6">
              <div class="text-4xl mb-2">✓</div>
              <div class="text-gray-600">You are healthy</div>
            </div>
          }
        >
          <div class="space-y-3">
            {/* Severity */}
            <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <div class="text-sm text-red-600 font-medium">Severity</div>
                <div class="text-lg font-bold text-red-900">
                  {injurySeverityConfig()?.displayName}
                </div>
              </div>
              <div class="text-3xl">🤕</div>
            </div>

            {/* Description */}
            <div class="text-sm text-gray-600">{injurySeverityConfig()?.description}</div>

            {/* Effects */}
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-gray-50 rounded-lg">
                <div class="text-xs text-gray-500">Success Penalty</div>
                <div class="text-lg font-semibold text-red-600">
                  -{characterState().injury.successPenalty}%
                </div>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg">
                <div class="text-xs text-gray-500">Time Injured</div>
                <div class="text-lg font-semibold text-gray-900">{timeSinceInjury()}</div>
              </div>
            </div>
          </div>
        </Show>
      </div>

      {/* Healing Options */}
      <Show when={characterState().injury.isInjured}>
        <div class="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Healing Options</h3>

          {/* Hospital Treatment */}
          <div class="border border-gray-200 rounded-lg p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-semibold text-gray-900">Hospital Treatment</div>
                <div class="text-sm text-gray-600">
                  Professional medical care - fully heals injuries and restores health
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="text-lg font-bold text-gray-900">Cost: {treatmentCost()} Gold</div>
              <button
                onClick={handleHospitalTreatment}
                disabled={props.locked}
                class={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  props.locked
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : canAffordTreatment()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-400 text-white hover:bg-blue-500'
                }`}
              >
                Get Treatment
              </button>
            </div>

            <Show when={!canAffordTreatment()}>
              <div class="text-xs text-gray-500 italic">
                Don't worry! We'll create a bill if you can't pay now. No one is turned away.
              </div>
            </Show>
          </div>

          {/* Healing Potion */}
          <div class="border border-gray-200 rounded-lg p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-semibold text-gray-900">Use Healing Potion</div>
                <div class="text-sm text-gray-600">
                  Consume a healing potion from your inventory
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-600">
                Available: {healingPotions().length} potion
                {healingPotions().length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={handleUsePotionHealing}
                disabled={props.locked || !hasHealingPotion()}
                class={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  props.locked || !hasHealingPotion()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Use Potion
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Hospital Bills */}
      <Show when={characterState().hospitalBill}>
        <div class="bg-white border border-red-300 rounded-lg p-4 space-y-4">
          <h3 class="text-lg font-semibold text-red-900">Outstanding Bill</h3>

          <div class="p-4 bg-red-50 rounded-lg space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-sm text-red-600">Amount Due</div>
              <div class="text-xl font-bold text-red-900">
                {characterState().hospitalBill?.amount} Gold
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="text-sm text-red-600">Success Penalty</div>
              <div class="text-lg font-semibold text-red-900">
                -{characterState().hospitalBill?.penalty}%
              </div>
            </div>

            <div class="text-xs text-red-600 mt-2">
              {hospitalSystem.getBillStatusMessage(characterState().hospitalBill)}
            </div>
          </div>

          <button
            onClick={handlePayBill}
            disabled={props.locked || !canAffordBillPayment()}
            class={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
              props.locked || !canAffordBillPayment()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <Show when={canAffordBillPayment()} fallback="Insufficient Funds">
              Pay Bill
            </Show>
          </button>
        </div>
      </Show>

      {/* Info Note */}
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="text-sm text-blue-800">
          <div class="font-medium mb-1">💡 About the Hospital</div>
          <ul class="text-xs space-y-1 list-disc list-inside">
            <li>Injuries occur when tasks fail, reducing your success chance</li>
            <li>Hospital treatment fully heals injuries and restores health</li>
            <li>If you can't afford treatment, we'll create a bill</li>
            <li>Unpaid bills give a small penalty but never lock progression</li>
            <li>Healing potions are an alternative to hospital visits</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
