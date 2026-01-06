/**
 * Progression State Management
 * Manages XP, leveling, and streak tracking
 */

import { createStore, produce } from 'solid-js/store';
import type { ProgressionState, StreakData } from '../../systems/progression/types';

/**
 * Create initial progression state
 */
export function createInitialProgressionState(): ProgressionState {
  return {
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100, // Level 2 requirement (100 * 1^1.5)
    totalXP: 0,
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: null,
      totalActiveDays: 0,
    },
  };
}

/**
 * Progression State Store
 * Provides reactive progression state and management functions
 */
export function createProgressionStore(initialState?: ProgressionState) {
  const [state, setState] = createStore<ProgressionState>(
    initialState ?? createInitialProgressionState()
  );

  /**
   * Award XP to the character
   * @param amount - XP amount to award
   */
  function awardXP(amount: number): void {
    setState(
      produce((draft) => {
        draft.currentXP += amount;
        draft.totalXP += amount;
      })
    );
  }

  /**
   * Level up the character
   * @param newLevel - New level
   * @param xpToNextLevel - XP required for next level
   * @param currentXP - Current XP in this level
   */
  function levelUp(newLevel: number, xpToNextLevel: number, currentXP: number): void {
    setState(
      produce((draft) => {
        draft.level = newLevel;
        draft.xpToNextLevel = xpToNextLevel;
        draft.currentXP = currentXP;
      })
    );
  }

  /**
   * Update streak data
   * @param streak - New streak data
   */
  function updateStreak(streak: StreakData): void {
    setState(
      produce((draft) => {
        draft.streak = streak;
      })
    );
  }

  /**
   * Increment current streak
   */
  function incrementStreak(): void {
    setState(
      produce((draft) => {
        draft.streak.currentStreak += 1;
        draft.streak.totalActiveDays += 1;

        if (draft.streak.currentStreak > draft.streak.longestStreak) {
          draft.streak.longestStreak = draft.streak.currentStreak;
        }

        draft.streak.lastCompletionDate = new Date().toISOString().split('T')[0];
      })
    );
  }

  /**
   * Break the current streak
   */
  function breakStreak(): void {
    setState(
      produce((draft) => {
        draft.streak.currentStreak = 0;
      })
    );
  }

  /**
   * Check if a session was completed today
   * @returns True if completed today
   */
  function wasCompletedToday(): boolean {
    if (!state.streak.lastCompletionDate) return false;

    const today = new Date().toISOString().split('T')[0];
    return state.streak.lastCompletionDate === today;
  }

  /**
   * Check if streak should be continued or broken
   * @returns 'continue' | 'break' | 'already-completed'
   */
  function checkStreakStatus(): 'continue' | 'break' | 'already-completed' {
    const today = new Date().toISOString().split('T')[0];

    if (!state.streak.lastCompletionDate) {
      return 'continue';
    }

    if (state.streak.lastCompletionDate === today) {
      return 'already-completed';
    }

    const lastDate = new Date(state.streak.lastCompletionDate);
    const currentDate = new Date(today);
    const daysDiff = Math.floor(
      (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      return 'continue';
    } else {
      return 'break';
    }
  }

  /**
   * Process session completion for streak tracking
   */
  function processSessionCompletion(): void {
    const status = checkStreakStatus();

    if (status === 'continue') {
      incrementStreak();
    } else if (status === 'break') {
      breakStreak();
      incrementStreak(); // Start new streak
    }
    // If already-completed, do nothing
  }

  /**
   * Reset progression state (for testing or new game)
   */
  function reset(): void {
    setState(createInitialProgressionState());
  }

  /**
   * Set complete state (for loading saved game)
   * @param newState - New progression state
   */
  function setCompleteState(newState: ProgressionState): void {
    setState(newState);
  }

  return {
    state,
    setState,
    awardXP,
    levelUp,
    updateStreak,
    incrementStreak,
    breakStreak,
    wasCompletedToday,
    checkStreakStatus,
    processSessionCompletion,
    reset,
    setCompleteState,
  };
}

/**
 * Progression Store Type
 */
export type ProgressionStore = ReturnType<typeof createProgressionStore>;
