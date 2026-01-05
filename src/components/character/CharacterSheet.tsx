/**
 * CharacterSheet Component
 * Complete character management interface combining stats, equipment, and inventory
 */

import { Component, Show, createSignal } from 'solid-js';
import type { CharacterStore } from '../../core/state/CharacterState';
import type { InventoryStore } from '../../core/state/InventoryState';
import type { Item, EquippableItem, ConsumableItem } from '../../core/types/items';
import { StatDisplay } from './StatDisplay';
import { EquipmentSlots } from './EquipmentSlots';
import { Inventory } from './Inventory';
import { getEquipmentBonuses, isEquippableItem } from '../../core/utils/itemUtils';

interface CharacterSheetProps {
  characterStore: CharacterStore;
  inventoryStore: InventoryStore;
  /** Whether interface is locked (during work phase) */
  locked?: boolean;
  onClose?: () => void;
}

type TabType = 'stats' | 'equipment' | 'inventory';

/**
 * CharacterSheet - Main character management interface
 */
export const CharacterSheet: Component<CharacterSheetProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal<TabType>('stats');
  const [notification, setNotification] = createSignal<string | null>(null);

  const characterState = () => props.characterStore.state;

  /**
   * Show notification message briefly
   */
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  /**
   * Handle item selection from inventory
   */
  const handleItemSelect = (_item: Item, _slotId: string) => {
    // Just for visual feedback, could extend with more functionality
    // Item selected for future interactions
  };

  /**
   * Handle item use/equip from inventory
   */
  const handleItemUse = (item: Item, _slotId: string) => {
    if (props.locked) {
      showNotification('❌ Cannot use items during work phase');
      return;
    }

    // Equip if it's equippable
    if (isEquippableItem(item)) {
      const equippableItem = item as EquippableItem;
      const slot = equippableItem.equipmentSlot;

      // Unequip current item if any
      const currentEquipment = characterState().equipment[slot];
      if (currentEquipment) {
        props.characterStore.unequipItem(slot);
      }

      // Equip new item
      props.characterStore.equipItem(slot, item.id);

      // Recalculate stats
      const equipmentBonuses = getEquipmentBonuses(
        characterState().equipment,
        props.inventoryStore.state
      );
      props.characterStore.recalculateStats(equipmentBonuses);

      showNotification(`✅ Equipped ${item.name}`);
      setActiveTab('equipment'); // Switch to equipment tab to show result
    }
    // Use if it's a consumable
    else if (item.type === 'consumable') {
      const consumable = item as ConsumableItem;

      // Apply healing
      if (consumable.healAmount) {
        props.characterStore.heal(consumable.healAmount);
        showNotification(`✅ Restored ${consumable.healAmount} health`);
      }

      // Cure injury
      if (consumable.curesInjury && characterState().injury.isInjured) {
        props.characterStore.healInjury();
        showNotification(`✅ Injury healed!`);
      }

      // Apply stat buffs (would need status effect system)
      if (consumable.buffStats) {
        // TODO: Implement status effect system for temporary buffs
        showNotification(`✅ Gained temporary buffs!`);
      }

      // Remove consumable from inventory
      props.inventoryStore.removeItem(item.id, 1);
    }
  };

  /**
   * Tab configuration
   */
  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'equipment', label: 'Equipment', icon: '⚔️' },
    { id: 'inventory', label: 'Inventory', icon: '🎒' },
  ];

  return (
    <div class="flex flex-col h-full bg-gray-50">
      {/* Header with character info */}
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-4 shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">{characterState().class}</h1>
            <p class="text-sm opacity-90">Level {characterState().level}</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-xs opacity-75">Tasks Completed</p>
              <p class="text-xl font-bold">{characterState().metadata.tasksCompleted}</p>
            </div>
            <Show when={props.onClose}>
              <button
                onClick={props.onClose}
                class="text-white/80 hover:text-white text-2xl leading-none"
                disabled={props.locked}
                aria-label="Close character sheet"
              >
                ×
              </button>
            </Show>
          </div>
        </div>

        {/* Injury warning */}
        <Show when={characterState().injury.isInjured}>
          <div class="mt-2 bg-red-500 bg-opacity-90 rounded px-3 py-2 text-sm font-semibold">
            ⚠️ Injured ({characterState().injury.severity}) - Success penalty:{' '}
            {characterState().injury.successPenalty}%
          </div>
        </Show>

        {/* Hospital bill warning */}
        <Show when={characterState().hospitalBill}>
          <div class="mt-2 bg-yellow-500 bg-opacity-90 rounded px-3 py-2 text-sm font-semibold">
            💰 Hospital Bill: {characterState().hospitalBill?.amount} Gold
          </div>
        </Show>
      </div>

      {/* Tab navigation */}
      <div class="flex border-b-2 border-gray-300 bg-white shadow-sm">
        {tabs.map((tab) => (
          <button
            class={`
              flex-1
              px-4
              py-3
              font-semibold
              transition-all
              ${
                activeTab() === tab.id
                  ? 'bg-indigo-50 text-indigo-600 border-b-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }
            `}
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab() === tab.id ? 'page' : undefined}
          >
            <span class="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification toast */}
      <Show when={notification()}>
        <div
          class="
            fixed
            top-4
            right-4
            bg-gray-900
            text-white
            px-4
            py-3
            rounded-lg
            shadow-xl
            z-50
            animate-slide-in-right
          "
          role="status"
          aria-live="polite"
        >
          {notification()}
        </div>
      </Show>

      {/* Tab content */}
      <div class="flex-1 overflow-hidden">
        <Show when={activeTab() === 'stats'}>
          <div class="h-full overflow-y-auto p-4">
            <StatDisplay
              baseStats={characterState().baseStats}
              computedStats={characterState().computedStats}
              detailed={true}
              layout="vertical"
            />

            {/* Additional info */}
            <div class="mt-6 space-y-3">
              <div class="bg-white border-2 border-gray-300 rounded-lg p-4">
                <h3 class="font-bold text-gray-800 mb-2">Character Info</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Class:</span>
                    <span class="font-semibold">{characterState().class}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Level:</span>
                    <span class="font-semibold">{characterState().level}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Tasks Completed:</span>
                    <span class="font-semibold text-green-600">
                      {characterState().metadata.tasksCompleted}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Tasks Failed:</span>
                    <span class="font-semibold text-red-600">
                      {characterState().metadata.tasksFailed}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>

        <Show when={activeTab() === 'equipment'}>
          <EquipmentSlots
            characterStore={props.characterStore}
            inventoryStore={props.inventoryStore}
            locked={props.locked}
          />
        </Show>

        <Show when={activeTab() === 'inventory'}>
          <Inventory
            inventoryStore={props.inventoryStore}
            onItemSelect={handleItemSelect}
            onItemUse={handleItemUse}
            locked={props.locked}
          />
        </Show>
      </div>
    </div>
  );
};
