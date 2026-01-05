/**
 * Chest State Management
 * Manages player's chest inventory and opening system
 */

import { createStore, produce } from 'solid-js/store';
import type { Chest, ChestOpenResult } from '../../systems/loot/ChestManager';
import { createChest, openChest, type ChestQuality } from '../../systems/loot/ChestManager';
import type { TaskType } from '../types/tasks';
import type { ItemGenerationContext } from '../../systems/loot/LootGenerator';

/**
 * Chest State Interface
 */
export interface ChestState {
  /** All chests (opened and unopened) */
  chests: Chest[];

  /** Total chests earned */
  totalChestsEarned: number;

  /** Total chests opened */
  totalChestsOpened: number;

  /** Total value obtained from chests */
  totalValueObtained: number;

  /** Last chest opening result (for UI display) */
  lastOpenResult: ChestOpenResult | null;

  /** Statistics by chest quality */
  statsByQuality: Record<
    ChestQuality,
    {
      earned: number;
      opened: number;
      totalValue: number;
    }
  >;
}

/**
 * Create initial chest state
 */
export function createInitialChestState(): ChestState {
  return {
    chests: [],
    totalChestsEarned: 0,
    totalChestsOpened: 0,
    totalValueObtained: 0,
    lastOpenResult: null,
    statsByQuality: {
      basic: { earned: 0, opened: 0, totalValue: 0 },
      quality: { earned: 0, opened: 0, totalValue: 0 },
      superior: { earned: 0, opened: 0, totalValue: 0 },
      masterwork: { earned: 0, opened: 0, totalValue: 0 },
    },
  };
}

/**
 * Chest State Store
 * Provides reactive chest state and management functions
 */
export function createChestStore(initialState?: ChestState) {
  const [state, setState] = createStore<ChestState>(initialState ?? createInitialChestState());

  /**
   * Award a chest to the player
   */
  function awardChest(
    sourceTask: TaskType,
    lootQuality: number = 1.0,
    quality: ChestQuality = 'basic'
  ): Chest {
    const chest = createChest(sourceTask, lootQuality, quality);

    setState(
      produce((draft) => {
        draft.chests.push(chest);
        draft.totalChestsEarned++;
        draft.statsByQuality[quality].earned++;
      })
    );

    return chest;
  }

  /**
   * Award multiple chests
   */
  function awardChests(
    sourceTask: TaskType,
    count: number,
    lootQuality: number = 1.0,
    quality: ChestQuality = 'basic'
  ): Chest[] {
    const chests: Chest[] = [];
    for (let i = 0; i < count; i++) {
      chests.push(awardChest(sourceTask, lootQuality, quality));
    }
    return chests;
  }

  /**
   * Open a chest
   */
  function openChestById(chestId: string, context: ItemGenerationContext): ChestOpenResult | null {
    const chestIndex = state.chests.findIndex((c) => c.id === chestId);
    if (chestIndex === -1) return null;

    const chest = state.chests[chestIndex];
    if (chest.opened) return null;

    // Open the chest
    const result = openChest(chest, context);

    // Update state
    setState(
      produce((draft) => {
        draft.chests[chestIndex].opened = true;
        draft.totalChestsOpened++;
        draft.totalValueObtained += result.totalValue;
        draft.lastOpenResult = result;
        draft.statsByQuality[chest.quality].opened++;
        draft.statsByQuality[chest.quality].totalValue += result.totalValue;
      })
    );

    return result;
  }

  /**
   * Get all unopened chests
   */
  function getUnopenedChests(): Chest[] {
    return state.chests.filter((c) => !c.opened);
  }

  /**
   * Get unopened chest count
   */
  function getUnopenedChestCount(): number {
    return getUnopenedChests().length;
  }

  /**
   * Get all chests from a specific task
   */
  function getChestsByTask(taskType: TaskType): Chest[] {
    return state.chests.filter((c) => c.sourceTask === taskType);
  }

  /**
   * Get chests by quality
   */
  function getChestsByQuality(quality: ChestQuality): Chest[] {
    return state.chests.filter((c) => c.quality === quality);
  }

  /**
   * Clear last open result (after viewing)
   */
  function clearLastOpenResult(): void {
    setState('lastOpenResult', null);
  }

  /**
   * Remove old opened chests (keep only recent N)
   */
  function pruneOldChests(keepCount: number = 50): void {
    setState(
      produce((draft) => {
        const openedChests = draft.chests.filter((c) => c.opened);
        if (openedChests.length > keepCount) {
          // Sort by earnedAt and remove oldest
          openedChests.sort((a, b) => b.earnedAt - a.earnedAt);
          const chestsToKeep = new Set(openedChests.slice(0, keepCount).map((c) => c.id));

          // Keep unopened chests and recent opened chests
          draft.chests = draft.chests.filter((c) => !c.opened || chestsToKeep.has(c.id));
        }
      })
    );
  }

  /**
   * Get average chest value by quality
   */
  function getAverageValueByQuality(quality: ChestQuality): number {
    const stats = state.statsByQuality[quality];
    return stats.opened > 0 ? Math.floor(stats.totalValue / stats.opened) : 0;
  }

  /**
   * Reset chest state (for testing or new game)
   */
  function reset(): void {
    setState(createInitialChestState());
  }

  return {
    state,
    setState,
    awardChest,
    awardChests,
    openChestById,
    getUnopenedChests,
    getUnopenedChestCount,
    getChestsByTask,
    getChestsByQuality,
    clearLastOpenResult,
    pruneOldChests,
    getAverageValueByQuality,
    reset,
  };
}

/**
 * Export type for the store
 */
export type ChestStore = ReturnType<typeof createChestStore>;
