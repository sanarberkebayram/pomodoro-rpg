/**
 * Task Completion Handler
 * Processes task completion results and applies effects to game state
 * (rewards, injuries, XP, statistics, etc.)
 */

import type { TaskCompletionResult } from '../../core/types/tasks';
import type { CharacterStore } from '../../core/state/CharacterState';
import type { InventoryStore } from '../../core/state/InventoryState';
import type { ProgressionManager } from '../progression/ProgressionManager';
import type { XPGainEvent } from '../progression';

/**
 * Task completion handler
 * Applies task completion results to character and inventory state
 */
export class TaskCompletionHandler {
  constructor(
    private characterStore: CharacterStore,
    private inventoryStore: InventoryStore,
    private progressionManager?: ProgressionManager
  ) {}

  /**
   * Process task completion result and apply all effects
   * @param result - Task completion result
   * @returns XP gain event if progression manager is available
   */
  processCompletion(result: TaskCompletionResult): XPGainEvent | null {
    // Apply rewards (gold, materials)
    this.applyRewards(result);

    // Apply XP and check for level up
    const xpEvent = this.applyXP(result);

    // Apply injury if occurred
    this.applyInjury(result);

    // Update character statistics
    this.updateCharacterStatistics(result);

    // Recalculate stats after all changes
    this.characterStore.recalculateStats();

    return xpEvent;
  }

  /**
   * Apply task rewards to inventory
   * @param result - Task completion result
   */
  private applyRewards(result: TaskCompletionResult): void {
    const { rewards } = result;

    // Add gold
    if (rewards.gold.min > 0) {
      this.inventoryStore.addGold(rewards.gold.min);
    }

    // Add materials (TODO: implement when materials system is added)
    // For now, materials are tracked separately or not implemented yet
    // if (rewards.materials.min > 0) {
    //   this.inventoryStore.addMaterials(rewards.materials.min);
    // }
  }

  /**
   * Apply XP rewards and handle leveling
   * @param result - Task completion result
   * @returns XP gain event if progression manager is available
   */
  private applyXP(result: TaskCompletionResult): XPGainEvent | null {
    if (!this.progressionManager) {
      return null;
    }

    const { rewards, outcome, task } = result;

    // Calculate average XP from reward range
    const averageXP = Math.floor((rewards.xp.min + rewards.xp.max) / 2);

    // Award XP through progression manager
    const xpEvent = this.progressionManager.awardXP(averageXP, outcome, task.taskType);

    return xpEvent;
  }

  /**
   * Apply injury if task resulted in injury
   * @param result - Task completion result
   */
  private applyInjury(result: TaskCompletionResult): void {
    if (!result.wasInjured || !result.injurySeverity) {
      return;
    }

    // Apply injury to character
    this.characterStore.applyInjury(result.injurySeverity);
  }

  /**
   * Update character statistics after task completion
   * @param result - Task completion result
   */
  private updateCharacterStatistics(result: TaskCompletionResult): void {
    const { outcome } = result;

    // Update task completion counters
    if (outcome === 'success' || outcome === 'partial') {
      this.characterStore.incrementTasksCompleted();
    } else if (outcome === 'failure') {
      this.characterStore.incrementTasksFailed();
    }
  }

  /**
   * Generate completion notification message
   * @param result - Task completion result
   * @returns Notification message
   */
  getCompletionMessage(result: TaskCompletionResult): string {
    return result.summary;
  }

  /**
   * Check if player should be warned about injury risk
   * @returns Warning message if applicable
   */
  getInjuryWarning(): string | null {
    const character = this.characterStore.state;

    if (character.injury.isInjured && character.injury.severity === 'severe') {
      return '⚠️ You have a severe injury! Visit the hospital before attempting another task.';
    }

    if (character.injury.isInjured) {
      return '⚠️ You are injured. Consider visiting the hospital to heal before your next task.';
    }

    return null;
  }

  /**
   * Check if player has outstanding hospital bills
   * @returns Bill warning message if applicable
   */
  getBillWarning(): string | null {
    const character = this.characterStore.state;

    if (character.hospitalBill && character.hospitalBill.amount > 0) {
      return `💰 You have an outstanding hospital bill of ${character.hospitalBill.amount} gold. Pay it to remove the success penalty.`;
    }

    return null;
  }
}

/**
 * Create a task completion handler
 */
export function createTaskCompletionHandler(
  characterStore: CharacterStore,
  inventoryStore: InventoryStore,
  progressionManager?: ProgressionManager
): TaskCompletionHandler {
  return new TaskCompletionHandler(characterStore, inventoryStore, progressionManager);
}
