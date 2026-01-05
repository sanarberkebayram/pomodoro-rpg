/**
 * ChestOpening Component
 * UI for opening chests and displaying loot rewards
 */

import { Component, createSignal, Show, For, createEffect } from 'solid-js';
import type { Chest, ChestOpenResult } from '../../systems/loot/ChestManager';
import {
  getChestQualityName,
  getChestQualityColor,
  estimateChestValue,
} from '../../systems/loot/ChestManager';
import { ItemShowcase } from './ItemShowcase';

interface ChestOpeningProps {
  /** List of unopened chests */
  chests: Chest[];

  /** Callback when chest is opened */
  onOpenChest: (chest: Chest) => ChestOpenResult;

  /** Callback when loot is collected */
  onCollectLoot: (result: ChestOpenResult) => void;

  /** Callback to close the chest opening screen */
  onClose: () => void;
}

/**
 * ChestOpening - Main chest opening interface
 */
export const ChestOpening: Component<ChestOpeningProps> = (props) => {
  const [selectedChest, setSelectedChest] = createSignal<Chest | null>(null);
  const [openResult, setOpenResult] = createSignal<ChestOpenResult | null>(null);
  const [isOpening, setIsOpening] = createSignal(false);

  // Get unopened chests
  const unopenedChests = () => props.chests.filter((c) => !c.opened);

  // Handle chest selection
  const handleSelectChest = (chest: Chest) => {
    if (openResult()) return; // Don't allow selection while viewing results
    setSelectedChest(chest);
  };

  // Handle chest opening
  const handleOpenChest = () => {
    const chest = selectedChest();
    if (!chest || isOpening()) return;

    setIsOpening(true);

    // Simulate opening animation delay
    setTimeout(() => {
      const result = props.onOpenChest(chest);
      setOpenResult(result);
      setIsOpening(false);
    }, 1000);
  };

  // Handle loot collection
  const handleCollectLoot = () => {
    const result = openResult();
    if (!result) return;

    props.onCollectLoot(result);
    setOpenResult(null);
    setSelectedChest(null);
  };

  // Auto-select first chest if none selected
  createEffect(() => {
    const chests = unopenedChests();
    if (chests.length > 0 && !selectedChest() && !openResult()) {
      setSelectedChest(chests[0]);
    }
  });

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold">Chest Opening</h2>
              <p class="text-purple-100 mt-1">
                {unopenedChests().length} unopened chest{unopenedChests().length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={props.onClose}
              class="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              aria-label="Close"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div class="flex-1 overflow-y-auto p-6">
          <Show
            when={openResult()}
            fallback={
              <div class="space-y-6">
                {/* Chest Selection */}
                <div>
                  <h3 class="text-lg font-semibold mb-3 text-gray-800">Select a Chest</h3>
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <For each={unopenedChests()}>
                      {(chest) => (
                        <ChestCard
                          chest={chest}
                          selected={selectedChest()?.id === chest.id}
                          onClick={() => handleSelectChest(chest)}
                        />
                      )}
                    </For>
                  </div>
                </div>

                {/* Selected Chest Details */}
                <Show when={selectedChest()}>
                  {(chest) => (
                    <div class="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                      <h3 class="text-xl font-bold mb-4 text-gray-800">
                        {getChestQualityName(chest().quality)}
                      </h3>

                      <div class="space-y-3 mb-6">
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-600">Source:</span>
                          <span class="font-semibold capitalize text-gray-800">
                            {chest().sourceTask}
                          </span>
                        </div>
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-600">Loot Quality:</span>
                          <span class="font-semibold text-gray-800">
                            {chest().lootQuality.toFixed(1)}x
                          </span>
                        </div>
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-600">Estimated Value:</span>
                          <span class="font-semibold text-yellow-600">
                            {(() => {
                              const estimate = estimateChestValue(chest());
                              return `${estimate.min}-${estimate.max} gold`;
                            })()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleOpenChest}
                        disabled={isOpening()}
                        class={`
                          w-full
                          py-3
                          px-6
                          rounded-lg
                          font-bold
                          text-white
                          transition-all
                          ${
                            isOpening()
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 active:scale-95'
                          }
                        `}
                      >
                        {isOpening() ? (
                          <span class="flex items-center justify-center gap-2">
                            <svg
                              class="animate-spin h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                              />
                              <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Opening...
                          </span>
                        ) : (
                          'Open Chest'
                        )}
                      </button>
                    </div>
                  )}
                </Show>
              </div>
            }
          >
            {(result) => (
              <ItemShowcase
                result={result()}
                onCollect={handleCollectLoot}
                onOpenAnother={() => {
                  setOpenResult(null);
                  setSelectedChest(null);
                }}
              />
            )}
          </Show>
        </div>
      </div>
    </div>
  );
};

/**
 * ChestCard - Individual chest display card
 */
const ChestCard: Component<{
  chest: Chest;
  selected: boolean;
  onClick: () => void;
}> = (props) => {
  const qualityColor = () => getChestQualityColor(props.chest.quality);

  return (
    <button
      onClick={props.onClick}
      class={`
        relative
        p-4
        rounded-lg
        border-2
        transition-all
        duration-200
        ${
          props.selected
            ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg'
            : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
        }
      `}
    >
      {/* Chest Icon */}
      <div
        class="w-16 h-16 mx-auto mb-2 rounded-lg flex items-center justify-center text-3xl"
        style={{ 'background-color': qualityColor() }}
      >
        📦
      </div>

      {/* Chest Name */}
      <div class="text-xs font-semibold text-center text-gray-700">
        {getChestQualityName(props.chest.quality)}
      </div>

      {/* Selection Indicator */}
      <Show when={props.selected}>
        <div class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </Show>
    </button>
  );
};
