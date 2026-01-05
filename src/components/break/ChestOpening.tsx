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
 * ChestOpening - Main chest opening interface with modern dark theme
 */
export const ChestOpening: Component<ChestOpeningProps> = (props) => {
  const [selectedChest, setSelectedChest] = createSignal<Chest | null>(null);
  const [openResult, setOpenResult] = createSignal<ChestOpenResult | null>(null);
  const [isOpening, setIsOpening] = createSignal(false);

  // Get unopened chests
  const unopenedChests = () => props.chests.filter((c) => !c.opened);

  // Handle chest selection
  const handleSelectChest = (chest: Chest) => {
    if (openResult()) return;
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
    }, 1200);
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
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fade-in">
      <div class="glass-panel bg-[#05070a]/90 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div class="px-8 py-6 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent relative">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>

          <div class="flex justify-between items-center relative z-10">
            <div>
              <h2 class="text-3xl font-display font-black tracking-tighter uppercase italic text-primary-500">Treasure Hoard</h2>
              <div class="flex items-center gap-2 mt-1">
                <span class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                <p class="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  {unopenedChests().length} Sealed Relics Discovered
                </p>
              </div>
            </div>
            <button
              onClick={props.onClose}
              class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-danger/20 hover:border-danger/30 hover:text-danger transition-all"
            >
              <span class="text-xl">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Show
            when={openResult()}
            fallback={
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Chest Selection */}
                <div class="lg:col-span-7 space-y-6">
                  <h3 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-primary-500/10 pb-2">Loot Queue</h3>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
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

                {/* Right: Selected Chest Details */}
                <div class="lg:col-span-5">
                  <Show
                    when={selectedChest()}
                    fallback={
                      <div class="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-primary-500/20 rounded-3xl opacity-50">
                        <span class="text-4xl mb-4">🔦</span>
                        <p class="text-xs font-mono uppercase tracking-widest text-primary-500">Choose a Crate to Inspect</p>
                      </div>
                    }
                  >
                    {(chest) => (
                      <div class="glass-panel p-6 border-primary-500/10 bg-white/2 space-y-8 animate-slide-up h-full flex flex-col rounded-2xl">
                        <div class="text-center">
                          <div class="w-24 h-24 mx-auto mb-4 rounded-3xl bg-black/40 border-2 flex items-center justify-center text-5xl transform -rotate-6 shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-500 group-hover:rotate-0"
                            style={{ 'border-color': getChestQualityColor(chest().quality) }}>
                            📦
                          </div>
                          <h3 class="text-2xl font-display font-bold text-white mb-1 uppercase tracking-tight">
                            {getChestQualityName(chest().quality)} Chest
                          </h3>
                          <span class="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Found in: {chest().sourceTask}</span>
                        </div>

                        <div class="space-y-4">
                          <div class="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5">
                            <span class="text-[10px] font-mono text-gray-500 uppercase">Luck Factor</span>
                            <span class="text-sm font-bold text-primary-400">{chest().lootQuality.toFixed(1)}x</span>
                          </div>
                          <div class="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5">
                            <span class="text-[10px] font-mono text-gray-500 uppercase">Estimated Spoils</span>
                            <span class="text-sm font-bold text-amber-500">
                              {(() => {
                                const estimate = estimateChestValue(chest());
                                return `${estimate.min}-${estimate.max} CR`;
                              })()}
                            </span>
                          </div>
                        </div>

                        <div class="flex-1"></div>

                        <button
                          onClick={handleOpenChest}
                          disabled={isOpening()}
                          class={`
                            btn-primary w-full py-4 text-sm font-bold
                            ${isOpening() ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          {isOpening() ? (
                            <span class="flex items-center justify-center gap-3">
                              <div class="w-4 h-4 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                              BREAKING SEAL...
                            </span>
                          ) : (
                            'Break the Seal'
                          )}
                        </button>
                      </div>
                    )}
                  </Show>
                </div>
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
 * ChestCard - Individual chest display card with modern dark theme
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
        group relative p-6 rounded-3xl border transition-all duration-300
        ${props.selected
          ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_20px_rgba(14,165,233,0.2)] scale-[1.05]'
          : 'border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5'
        }
      `}
    >
      {/* Chest Icon Wrapper */}
      <div
        class="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner bg-black/40"
        style={{ 'border': `1px solid ${qualityColor()}40` }}
      >
        <span class="drop-shadow-lg">📦</span>
      </div>

      {/* Chest Info */}
      <div class="text-center">
        <div class="text-[10px] font-display font-bold text-white uppercase tracking-tight truncate mb-1">
          {getChestQualityName(props.chest.quality)}
        </div>
        <div class="text-[8px] font-mono text-gray-500 uppercase tracking-widest truncate">
          {props.chest.sourceTask}
        </div>
      </div>

      {/* Selection Glow */}
      <Show when={props.selected}>
        <div class="absolute inset-0 rounded-3xl border-2 border-primary-500/50 pointer-events-none animate-pulse"></div>
        <div class="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center shadow-lg border-2 border-black">
          <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </Show>
    </button>
  );
};
