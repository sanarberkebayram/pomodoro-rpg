/**
 * TaskLoadoutPanel Component
 * Displays character stats and equipment relevant to task success
 */

import { Component, Show } from 'solid-js';
import type { CharacterStore } from '../../core/state/CharacterState';
import type { InventoryStore } from '../../core/state/InventoryState';
import { getEquipmentBonuses } from '../../core/utils/itemUtils';

interface TaskLoadoutPanelProps {
  characterStore: CharacterStore;
  inventoryStore: InventoryStore;
}

/**
 * TaskLoadoutPanel - Show character readiness for task
 */
export const TaskLoadoutPanel: Component<TaskLoadoutPanelProps> = (props) => {
  const characterState = () => props.characterStore.state;
  const inventoryState = () => props.inventoryStore.state;

  const stats = () => characterState().computedStats;

  const equipmentBonuses = () => {
    return getEquipmentBonuses(characterState().equipment, inventoryState().items);
  };

  const getEquippedItem = (slot: 'weapon' | 'armor' | 'accessory') => {
    const equip = characterState().equipment[slot];
    if (!equip) return null;
    return inventoryState().items.find((item) => item.id === equip.itemId);
  };

  return (
    <div class="task-loadout-panel">
      <h3 class="task-loadout-panel__title">Your Loadout</h3>

      {/* Character Stats */}
      <div class="loadout-section">
        <h4 class="loadout-section__title">Stats</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-item__icon">⚔️</span>
            <div class="stat-item__info">
              <span class="stat-item__label">Power</span>
              <span class="stat-item__value">{stats().power}</span>
            </div>
          </div>

          <div class="stat-item">
            <span class="stat-item__icon">🛡️</span>
            <div class="stat-item__info">
              <span class="stat-item__label">Defense</span>
              <span class="stat-item__value">{stats().defense}</span>
            </div>
          </div>

          <div class="stat-item">
            <span class="stat-item__icon">🎯</span>
            <div class="stat-item__info">
              <span class="stat-item__label">Focus</span>
              <span class="stat-item__value">{stats().focus}</span>
            </div>
          </div>

          <div class="stat-item">
            <span class="stat-item__icon">🍀</span>
            <div class="stat-item__info">
              <span class="stat-item__label">Luck</span>
              <span class="stat-item__value">{stats().luck}</span>
            </div>
          </div>

          <div class="stat-item stat-item--health">
            <span class="stat-item__icon">❤️</span>
            <div class="stat-item__info">
              <span class="stat-item__label">Health</span>
              <span class="stat-item__value">
                {stats().health}/{stats().maxHealth}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment */}
      <div class="loadout-section">
        <h4 class="loadout-section__title">Equipment</h4>
        <div class="equipment-list">
          <div class="equipment-slot">
            <span class="equipment-slot__label">Weapon:</span>
            <Show
              when={getEquippedItem('weapon')}
              fallback={<span class="equipment-slot__empty">None</span>}
            >
              {(item) => <span class="equipment-slot__item">{item().name}</span>}
            </Show>
          </div>

          <div class="equipment-slot">
            <span class="equipment-slot__label">Armor:</span>
            <Show
              when={getEquippedItem('armor')}
              fallback={<span class="equipment-slot__empty">None</span>}
            >
              {(item) => <span class="equipment-slot__item">{item().name}</span>}
            </Show>
          </div>

          <div class="equipment-slot">
            <span class="equipment-slot__label">Accessory:</span>
            <Show
              when={getEquippedItem('accessory')}
              fallback={<span class="equipment-slot__empty">None</span>}
            >
              {(item) => <span class="equipment-slot__item">{item().name}</span>}
            </Show>
          </div>
        </div>

        <Show
          when={
            equipmentBonuses().power +
              equipmentBonuses().defense +
              equipmentBonuses().focus +
              equipmentBonuses().luck >
            0
          }
        >
          <div class="equipment-bonuses">
            <h5 class="equipment-bonuses__title">Equipment Bonuses</h5>
            <div class="bonuses-list">
              <Show when={equipmentBonuses().power > 0}>
                <span class="bonus-item">+{equipmentBonuses().power} Power</span>
              </Show>
              <Show when={equipmentBonuses().defense > 0}>
                <span class="bonus-item">+{equipmentBonuses().defense} Defense</span>
              </Show>
              <Show when={equipmentBonuses().focus > 0}>
                <span class="bonus-item">+{equipmentBonuses().focus} Focus</span>
              </Show>
              <Show when={equipmentBonuses().luck > 0}>
                <span class="bonus-item">+{equipmentBonuses().luck} Luck</span>
              </Show>
            </div>
          </div>
        </Show>
      </div>

      {/* Status Effects */}
      <Show when={characterState().injury.isInjured || characterState().hospitalBill}>
        <div class="loadout-section loadout-section--warning">
          <h4 class="loadout-section__title">Status</h4>
          <div class="status-list">
            <Show when={characterState().injury.isInjured}>
              <div class="status-item status-item--negative">
                <span class="status-item__icon">🩹</span>
                <div class="status-item__info">
                  <span class="status-item__label">
                    Injured ({characterState().injury.severity})
                  </span>
                  <span class="status-item__penalty">
                    -{characterState().injury.successPenalty}% Success
                  </span>
                </div>
              </div>
            </Show>

            <Show when={characterState().hospitalBill}>
              {(bill) => (
                <div class="status-item status-item--negative">
                  <span class="status-item__icon">💊</span>
                  <div class="status-item__info">
                    <span class="status-item__label">Unpaid Bill ({bill().amount} gold)</span>
                    <span class="status-item__penalty">-{bill().penalty}% Success</span>
                  </div>
                </div>
              )}
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
};
