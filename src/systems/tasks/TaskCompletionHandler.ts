/**
 * Task Completion Handler
 * Processes task completion results and applies effects to game state
 * (rewards, injuries, XP, statistics, etc.)
 */

import type { TaskCompletionResult } from '../../core/types/tasks';
import type { CharacterStore } from '../../core/state/CharacterState';
import type { InventoryStore } from '../../core/state/InventoryState';

/**
 * Task completion handler
 * Applies task completion results to character and inventory state
 */
export class TaskCompletionHandler {
  constructor(
    private characterStore: CharacterStore,
    private inventoryStore: InventoryStore
  ) {}

  /**
   * Process task completion result and apply all effects
   * @param result - Task completion result
   */
  processCompletion(result: TaskCompletionResult): void {
    // Apply rewards
    this.applyRewards(result);

    // Apply injury if occurred
    this.applyInjury(result);

    // Update character statistics
    this.updateCharacterStatistics(result);

    // Recalculate stats after all changes
    this.characterStore.recalculateStats();
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

    // Add XP (handled separately through progression system)
    // XP application should be handled by a ProgressionManager
    // For now, we'll leave this as a placeholder
    // TODO: Integrate with ProgressionManager when Phase 8 is implemented
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
  inventoryStore: InventoryStore
): TaskCompletionHandler {
  return new TaskCompletionHandler(characterStore, inventoryStore);
}
