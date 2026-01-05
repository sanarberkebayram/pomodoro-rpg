/**
 * Main App Component
 * Integrates all game systems into a playable experience
 */

import { Component, createSignal, onMount, onCleanup, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { gameStateManager } from './core/engine/GameStateManager';
import { GameController } from './core/engine/GameController';
import { PomodoroPhase } from './systems/pomodoro/types';
import { TaskType, RiskLevel, TaskConfig, TaskOutcome } from './core/types/tasks';

// State imports
import { createCharacterStore } from './core/state/CharacterState';
import { createInventoryStore } from './core/state/InventoryState';
import { createTaskStore } from './core/state/TaskState';
import { createEventStateWithActions } from './core/state/EventState';
import { createChestStore } from './core/state/ChestState';

// System imports
import { determineChestQuality } from './systems/loot/ChestManager';
import { createInjuryManager } from './systems/injury/InjuryManager';

// Component imports
import { WorkScreen } from './components/work/WorkScreen';
import { TaskSelection } from './components/break/TaskSelection';
import { ChestOpening } from './components/break/ChestOpening';
import { Hospital } from './components/break/Hospital';
import { CharacterSheet } from './components/character/CharacterSheet';
import { Inventory } from './components/character/Inventory';
import { TimerDisplay } from './components/timer/TimerDisplay';
import { PhaseIndicator } from './components/timer/PhaseIndicator';

const App: Component = () => {
  // Game controller and state
  let gameController: GameController | null = null;

  // UI state signals
  const [currentPhase, setCurrentPhase] = createSignal<PomodoroPhase>('IDLE');
  const [remainingSeconds, setRemainingSeconds] = createSignal<number>(0);
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [showCharacterSheet, setShowCharacterSheet] = createSignal(false);
  const [showInventory, setShowInventory] = createSignal(false);
  const [activeBreakView, setActiveBreakView] = createSignal<'task-select' | 'chest' | 'hospital'>(
    'task-select'
  );

  // Game state stores
  const characterStore = createCharacterStore();
  const inventoryStore = createInventoryStore();
  const taskStore = createTaskStore();
  const { state: eventState, actions: eventActions } = createEventStateWithActions();
  const chestStore = createChestStore();

  // Game systems
  const injuryManager = createInjuryManager();

  // Progression state
  const [progression, setProgression] = createStore({
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    totalXP: 0,
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: null,
      totalActiveDays: 0,
    },
  });

  /**
   * Initialize game on mount
   */
  onMount(() => {
    // Initialize game state
    const initResult = gameStateManager.initialize();

    if (!initResult.success) {
      console.error('Failed to initialize game:', initResult.error);
      return;
    }

    const gameState = initResult.data;

    // Restore state to stores
    characterStore.setState(gameState.character);
    inventoryStore.setState(gameState.inventory);
    taskStore.setState(gameState.tasks);
    setProgression(gameState.progression);

    // Create game controller
    gameController = new GameController(gameStateManager.getTimer(), gameState, {
      onPhaseChange: (phase) => {
        setCurrentPhase(phase);
        handlePhaseChange(phase);
      },
      onTimerTick: (seconds) => {
        setRemainingSeconds(seconds);
        gameStateManager.syncTimerState();
      },
      onTaskProgress: (_progress) => {
        // Task progress is tracked internally
      },
      onEventGenerated: (event) => {
        eventActions.addEvent(event);
      },
      onTaskComplete: (outcome) => {
        handleTaskComplete(outcome);
      },
    });

    // Initialize controller
    gameController.initialize();

    // Set initial phase
    setCurrentPhase(gameController.getTimerState().phase);
    setRemainingSeconds(gameController.getTimerState().remainingSeconds);

    setIsInitialized(true);

    // Auto-save on page unload
    const handleUnload = () => {
      saveGameState();
      gameStateManager.flush();
    };
    window.addEventListener('beforeunload', handleUnload);

    onCleanup(() => {
      window.removeEventListener('beforeunload', handleUnload);
      gameController?.destroy();
    });
  });

  /**
   * Handle phase transitions
   */
  const handlePhaseChange = (phase: PomodoroPhase) => {
    if (phase === 'SHORT_BREAK' || phase === 'LONG_BREAK') {
      // Entering break - decide what to show
      const unopenedChests = chestStore.state.chests.filter((c) => !c.opened);

      if (unopenedChests.length > 0) {
        setActiveBreakView('chest');
      } else if (characterStore.state.injury.isInjured || characterStore.state.hospitalBill) {
        setActiveBreakView('hospital');
      } else {
        setActiveBreakView('task-select');
      }

      // Clear work phase events
      eventActions.clearSessionEvents();
    } else if (phase === 'WORK') {
      // Entering work - clear events for new session
      eventActions.clearSessionEvents();
    }

    saveGameState();
  };

  /**
   * Handle task completion
   */
  const handleTaskComplete = (outcome: TaskOutcome) => {
    // Apply rewards
    if (outcome.goldReward > 0) {
      inventoryStore.addGold(outcome.goldReward);
    }

    if (outcome.xpReward > 0) {
      addXP(outcome.xpReward);
    }

    // Create chest if task succeeded
    if (outcome.result === 'success' || outcome.result === 'partial') {
      const luckStat = characterStore.state.computedStats.luck;
      const taskSuccess = outcome.result === 'success';
      const chestQuality = determineChestQuality(taskSuccess, luckStat);
      const selectedTask = taskStore.state.activeTask;

      if (selectedTask) {
        chestStore.awardChest(
          selectedTask.taskId as TaskType,
          outcome.lootQuality ?? 1.0,
          chestQuality
        );
      }
    }

    // Handle injury if task failed
    if (outcome.result === 'failure' && outcome.injuryApplied) {
      const injury = injuryManager.applyInjury(
        characterStore.state,
        'standard' // Will be replaced with actual risk level
      );

      if (injury) {
        characterStore.applyInjury(injury);

        // Generate hospital bill
        const bill = injuryManager.generateBill(injury);
        characterStore.addHospitalBill(bill);
      }
    }

    // Update task history
    taskStore.completeTask(outcome);

    // Update character metadata
    if (outcome.result === 'success' || outcome.result === 'partial') {
      characterStore.incrementTasksCompleted();
    } else {
      characterStore.incrementTasksFailed();
    }

    saveGameState();
  };

  /**
   * Handle task selection
   */
  const handleTaskSelected = (taskType: TaskType, riskLevel: RiskLevel, config: TaskConfig) => {
    const taskManager = gameController?.getTaskManager();
    if (taskManager) {
      taskManager.selectTask(config.id, riskLevel);
      taskStore.selectTask(config, riskLevel);
    }

    saveGameState();
  };

  /**
   * Add XP and handle leveling
   */
  const addXP = (amount: number) => {
    const newXP = progression.currentXP + amount;
    const newTotalXP = progression.totalXP + amount;

    let newLevel = progression.level;
    let xpForNext = progression.xpToNextLevel;

    // Simple leveling logic (XP requirement increases by 50 per level)
    while (newXP >= xpForNext && newLevel < 99) {
      newLevel++;
      xpForNext = 100 + (newLevel - 1) * 50;
    }

    setProgression({
      level: newLevel,
      currentXP: newXP >= xpForNext ? newXP - xpForNext : newXP,
      xpToNextLevel: xpForNext,
      totalXP: newTotalXP,
    });

    // Level up character if needed
    if (newLevel > characterStore.state.level) {
      characterStore.levelUp(newLevel);
    }
  };

  /**
   * Save current game state
   */
  const saveGameState = () => {
    gameStateManager.updateState((state) => ({
      ...state,
      character: characterStore.state,
      inventory: inventoryStore.state,
      tasks: taskStore.state,
      progression: progression,
    }));
  };

  /**
   * Timer control handlers
   */
  const handleStart = () => gameController?.start();
  const handlePause = () => gameController?.pause();
  const handleResume = () => gameController?.resume();
  const handleSkip = () => gameController?.skip();

  /**
   * Render break phase content
   */
  const renderBreakContent = () => {
    const view = activeBreakView();

    if (view === 'chest') {
      const unopenedChests = chestStore.state.chests.filter((c) => !c.opened);

      if (unopenedChests.length === 0) {
        // No more chests, move to next view
        if (characterStore.state.injury.isInjured || characterStore.state.hospitalBill) {
          setActiveBreakView('hospital');
        } else {
          setActiveBreakView('task-select');
        }
        return null;
      }

      return (
        <ChestOpening
          chests={unopenedChests}
          onOpenChest={(chest) => {
            const result = chestStore.openChestById(chest.id, {
              characterLevel: characterStore.state.level,
              characterStats: characterStore.state.computedStats,
            });
            // Chest has been opened and loot generated by the store
            if (!result) {
              throw new Error('Failed to open chest');
            }
            return result;
          }}
          onCollectLoot={(_result) => {
            // Loot already added in onOpenChest via store
            // Just check if there are more chests
            const remaining = chestStore.state.chests.filter((c) => !c.opened);
            if (remaining.length === 0) {
              if (characterStore.state.injury.isInjured || characterStore.state.hospitalBill) {
                setActiveBreakView('hospital');
              } else {
                setActiveBreakView('task-select');
              }
            }
            saveGameState();
          }}
          onClose={() => {
            if (characterStore.state.injury.isInjured || characterStore.state.hospitalBill) {
              setActiveBreakView('hospital');
            } else {
              setActiveBreakView('task-select');
            }
          }}
        />
      );
    }

    if (view === 'hospital') {
      return (
        <Hospital
          characterStore={characterStore}
          inventoryStore={inventoryStore}
          onClose={() => setActiveBreakView('task-select')}
        />
      );
    }

    return (
      <TaskSelection
        characterStore={characterStore}
        inventoryStore={inventoryStore}
        onTaskSelected={handleTaskSelected}
      />
    );
  };

  return (
    <div class="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top bar with timer and phase */}
      <div class="bg-gray-800 border-b border-gray-700 p-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold">Pomodoro RPG</h1>
            <PhaseIndicator phase={currentPhase()} />
          </div>

          <div class="flex items-center gap-4">
            <TimerDisplay
              remainingSeconds={remainingSeconds()}
              phase={currentPhase()}
              isRunning={gameController?.getTimerState().isRunning ?? false}
              isPaused={gameController?.getTimerState().isPaused ?? false}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onSkip={handleSkip}
            />
          </div>

          <div class="flex items-center gap-2">
            <button
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              onClick={() => setShowCharacterSheet(true)}
            >
              Character
            </button>
            <button
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              onClick={() => setShowInventory(true)}
            >
              Inventory
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div class="flex-1 flex flex-col">
        <Show
          when={isInitialized()}
          fallback={
            <div class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <div class="text-xl mb-4">Loading game...</div>
                <div class="animate-pulse">⏳</div>
              </div>
            </div>
          }
        >
          {/* WORK phase */}
          <Show when={currentPhase() === 'WORK'}>
            <WorkScreen events={eventState.events} class="flex-1" />
          </Show>

          {/* BREAK phases */}
          <Show when={currentPhase() === 'SHORT_BREAK' || currentPhase() === 'LONG_BREAK'}>
            <div class="flex-1 p-4 overflow-auto">
              <div class="max-w-6xl mx-auto">
                <div class="mb-4">
                  <h2 class="text-2xl font-bold mb-2">
                    {currentPhase() === 'SHORT_BREAK' ? 'Short Break' : 'Long Break'}
                  </h2>
                  <p class="text-gray-400">
                    Time to manage your character and prepare for the next task
                  </p>
                </div>

                {/* Break navigation */}
                <div class="flex gap-2 mb-4">
                  <button
                    class={`px-4 py-2 rounded ${
                      activeBreakView() === 'task-select'
                        ? 'bg-blue-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => setActiveBreakView('task-select')}
                  >
                    Select Task
                  </button>
                  <button
                    class={`px-4 py-2 rounded ${
                      activeBreakView() === 'chest'
                        ? 'bg-blue-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => setActiveBreakView('chest')}
                    disabled={chestStore.state.chests.filter((c) => !c.opened).length === 0}
                  >
                    Open Chests ({chestStore.state.chests.filter((c) => !c.opened).length})
                  </button>
                  <button
                    class={`px-4 py-2 rounded ${
                      activeBreakView() === 'hospital'
                        ? 'bg-blue-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => setActiveBreakView('hospital')}
                    disabled={
                      !characterStore.state.injury.isInjured && !characterStore.state.hospitalBill
                    }
                  >
                    Hospital
                    <Show when={characterStore.state.injury.isInjured}>
                      <span class="ml-2 text-red-400">!</span>
                    </Show>
                  </button>
                </div>

                {/* Break content */}
                {renderBreakContent()}
              </div>
            </div>
          </Show>

          {/* IDLE phase */}
          <Show when={currentPhase() === 'IDLE'}>
            <div class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <h2 class="text-3xl font-bold mb-4">Ready to Begin?</h2>
                <p class="text-gray-400 mb-8">
                  Start the timer to begin your first Pomodoro session
                </p>
                <button
                  class="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-bold"
                  onClick={handleStart}
                >
                  Start Timer
                </button>
              </div>
            </div>
          </Show>
        </Show>
      </div>

      {/* Character Sheet Modal */}
      <Show when={showCharacterSheet()}>
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CharacterSheet
              characterStore={characterStore}
              inventoryStore={inventoryStore}
              onClose={() => setShowCharacterSheet(false)}
            />
          </div>
        </div>
      </Show>

      {/* Inventory Modal */}
      <Show when={showInventory()}>
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <Inventory inventoryStore={inventoryStore} onClose={() => setShowInventory(false)} />
          </div>
        </div>
      </Show>

      {/* Bottom stats bar */}
      <Show when={isInitialized()}>
        <div class="bg-gray-800 border-t border-gray-700 p-2">
          <div class="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <div class="flex gap-4">
              <span>Level: {progression.level}</span>
              <span>
                XP: {progression.currentXP} / {progression.xpToNextLevel}
              </span>
              <span>Gold: {inventoryStore.state.gold}</span>
            </div>
            <div class="flex gap-4">
              <span>
                HP: {characterStore.state.computedStats.health} /{' '}
                {characterStore.state.computedStats.maxHealth}
              </span>
              <Show when={characterStore.state.injury.isInjured}>
                <span class="text-red-400">INJURED</span>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default App;
