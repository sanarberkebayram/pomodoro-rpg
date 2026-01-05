/**
 * Main App Component
 * Integrates all game systems into a playable experience
 */

import { Component, createSignal, onMount, onCleanup, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { gameStateManager } from './core/engine/GameStateManager';
import { GameController } from './core/engine/GameController';
import { PomodoroPhase } from './systems/pomodoro/types';
import { TaskType, RiskLevel, TaskConfig, TaskEvent } from './core/types/tasks';
import type { EventConditionContext, GameEvent } from './core/types/events';

// State imports
import { createCharacterStore } from './core/state/CharacterState';
import { createInventoryStore } from './core/state/InventoryState';
import { createTaskStore } from './core/state/TaskState';
import { createEventStateWithActions } from './core/state/EventState';
import { createChestStore } from './core/state/ChestState';
import { getEquipmentBonuses } from './core/utils/itemUtils';

// System imports
import { TaskManager } from './systems/tasks/TaskManager';
import { EventBank } from './systems/events/EventBank';
import { EventGenerator } from './systems/events/EventGenerator';
import { EVENT_TEMPLATES } from './data/events/eventBank';
import { getEnvironmentConfig, getTaskEventConfig } from './data/config/eventConfig';

// Component imports
import { WorkScreen } from './components/work/WorkScreen';
import { TaskSelection } from './components/break/TaskSelection';
import { ChestOpening } from './components/break/ChestOpening';
import { Hospital } from './components/break/Hospital';
import { CharacterSheet } from './components/character/CharacterSheet';
import { Inventory } from './components/character/Inventory';
import { TimerDisplay } from './components/timer/TimerDisplay';
import { PhaseIndicator } from './components/timer/PhaseIndicator';
import { DraggablePanel } from './components/common/DraggablePanel';

const App: Component = () => {
  // UI state signals
  const [currentPhase, setCurrentPhase] = createSignal<PomodoroPhase>('IDLE');
  const [remainingSeconds, setRemainingSeconds] = createSignal<number>(0);
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [showCharacterSheet, setShowCharacterSheet] = createSignal(false);
  const [showInventory, setShowInventory] = createSignal(false);
  const [activeBreakView, setActiveBreakView] = createSignal<'task-select' | 'chest' | 'hospital'>(
    'task-select'
  );
  const [gameControllerSignal, setGameControllerSignal] = createSignal<GameController | null>(null);

  // Game state stores
  const characterStore = createCharacterStore();
  const inventoryStore = createInventoryStore();
  const taskStore = createTaskStore();
  const { state: eventState, actions: eventActions } = createEventStateWithActions();
  const chestStore = createChestStore();
  const taskManager = new TaskManager(taskStore);
  const eventBank = new EventBank(EVENT_TEMPLATES);
  const eventGenerator = new EventGenerator(eventBank, getEnvironmentConfig());

  // Progression state
  const [progression, setProgression] = createStore<{
    level: number;
    currentXP: number;
    xpToNextLevel: number;
    totalXP: number;
    streak: {
      currentStreak: number;
      longestStreak: number;
      lastCompletionDate: string | null;
      totalActiveDays: number;
    };
  }>({
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
    const controller = new GameController(gameStateManager.getTimer(), gameState, {
      onPhaseChange: (phase) => {
        const previousPhase = currentPhase();
        setCurrentPhase(phase);
        handlePhaseChange(phase, previousPhase);
      },
      onTimerTick: (seconds) => {
        setRemainingSeconds(seconds);
        gameStateManager.syncTimerState();
        handleWorkTick(seconds);
      },
      onTaskProgress: (_progress) => {
        // Task progress is tracked internally
      },
      onTaskComplete: (outcome) => {
        void outcome;
      },
    });

    // Initialize controller
    controller.initialize();
    setGameControllerSignal(controller);

    // Set initial phase
    setCurrentPhase(controller.getTimerState().phase);
    setRemainingSeconds(controller.getTimerState().remainingSeconds);

    setIsInitialized(true);

    // Auto-save on page unload
    const handleUnload = () => {
      saveGameState();
      gameStateManager.flush();
    };
    window.addEventListener('beforeunload', handleUnload);

    onCleanup(() => {
      window.removeEventListener('beforeunload', handleUnload);
      controller.destroy();
    });
  });

  /**
   * Handle phase transitions
   */
  const handlePhaseChange = (phase: PomodoroPhase, previousPhase: PomodoroPhase) => {
    if (phase === 'WORK' && previousPhase !== 'WORK') {
      const activeTask = taskStore.state.activeTask;
      const taskType = activeTask?.taskType ?? 'expedition';
      const baseConfig = getEnvironmentConfig();
      const taskConfig = getTaskEventConfig(taskType, baseConfig);
      eventGenerator.updateConfig(taskConfig);
      eventGenerator.startSession();
    }

    if (previousPhase === 'WORK' && phase !== 'WORK') {
      eventGenerator.endSession();
    }

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

  const buildTaskSelectionContext = () => {
    const char = characterStore.state;
    const partialBonuses = getEquipmentBonuses(char.equipment, inventoryStore.state);

    const equipmentBonuses = {
      power: partialBonuses.power ?? 0,
      defense: partialBonuses.defense ?? 0,
      focus: partialBonuses.focus ?? 0,
      luck: partialBonuses.luck ?? 0,
    };

    return {
      characterLevel: char.level,
      characterStats: char.computedStats,
      isInjured: char.injury.isInjured,
      injuryPenalty: char.injury.successPenalty,
      billPenalty: char.hospitalBill?.penalty ?? 0,
      equipmentBonuses,
    };
  };

  const buildEventConditionContext = (
    taskType: TaskType,
    taskProgress: number
  ): EventConditionContext => {
    const char = characterStore.state;
    const inventory = inventoryStore.state;

    return {
      characterLevel: char.level,
      currentHealth: char.computedStats.health,
      maxHealth: char.computedStats.maxHealth,
      isInjured: char.injury.isInjured,
      gold: inventory.gold,
      hasWeapon: char.equipment.weapon !== null,
      hasArmor: char.equipment.armor !== null,
      taskType,
      taskProgress,
      eventCount: eventGenerator.getCurrentSessionEvents().length,
    };
  };

  const mapEventToTaskEvent = (event: GameEvent): TaskEvent => ({
    id: event.id,
    timestamp: event.timestamp,
    message: event.message,
    severity: event.severity,
    effects: {
      successChanceModifier: event.effects.successChanceModifier,
      goldModifier: event.effects.goldModifier,
      healthModifier: event.effects.healthModifier,
      materialsModifier: event.effects.materialsModifier,
    },
  });

  const handleWorkTick = (remainingSecondsValue: number) => {
    if (currentPhase() !== 'WORK') {
      return;
    }

    const timerConfig = gameStateManager.getTimer().getConfig();
    const totalSeconds = timerConfig.workDuration * 60;
    const elapsedSeconds = Math.max(0, totalSeconds - remainingSecondsValue);
    const progress = Math.min(100, (elapsedSeconds / totalSeconds) * 100);

    taskManager.updateProgress(progress);

    const activeTask = taskStore.state.activeTask;
    const taskType = activeTask?.taskType ?? 'expedition';
    const context = buildEventConditionContext(taskType, activeTask?.progress ?? progress);
    const result = eventGenerator.tryGenerateEvent(taskType, context);

    if (result.success && result.event) {
      eventActions.addEvent(result.event);
      if (activeTask) {
        taskManager.addEvent(mapEventToTaskEvent(result.event));
      }
    }
  };

  /**
   * Handle task selection
   */
  const handleTaskSelected = (taskType: TaskType, riskLevel: RiskLevel, config: TaskConfig) => {
    const selectionContext = buildTaskSelectionContext();
    taskManager.startTask(taskType, riskLevel, config, selectionContext);

    saveGameState();
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
  const handleStart = () => gameControllerSignal()?.start();
  const handlePause = () => gameControllerSignal()?.pause();
  const handleResume = () => gameControllerSignal()?.resume();
  const handleSkip = () => gameControllerSignal()?.skip();

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
              luck: characterStore.state.computedStats.luck,
              lootQuality: 1.0, // Default or derived from chest? Chest manager handles quality internally usually
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
    <div class="min-h-screen text-gray-100 flex flex-col font-sans selection:bg-primary-500/30">
      {/* Top bar with timer and phase */}
      <div class="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-primary-500/20 shadow-2xl shadow-black/60">
        <div class="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-3 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
          {/* Title Area */}
          <div class="flex flex-col items-center md:items-start order-1 md:order-1 flex-shrink-0">
            <h1 class="text-xl md:text-2xl font-display font-black tracking-[0.4em] bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent uppercase italic">
              Pomodoro RPG
            </h1>
            <div class="flex items-center gap-2 mt-0.5 opacity-40">
              <div class="h-1 w-1 rounded-full bg-primary-500 animate-pulse"></div>
              <p class="text-[8px] font-mono text-primary-500 tracking-[0.4em] uppercase">Engine Status: Online</p>
            </div>
          </div>

          {/* Central Timer Area - Full Width on Mobile */}
          <div class="flex flex-col items-center gap-2 w-full order-2 md:order-2 flex-grow">
            <TimerDisplay
              remainingSeconds={remainingSeconds()}
              phase={currentPhase()}
              isRunning={gameControllerSignal()?.getTimerState().isRunning ?? false}
              isPaused={gameControllerSignal()?.getTimerState().isPaused ?? false}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onSkip={handleSkip}
            />
          </div>

          {/* Navigation Area */}
          <div class="flex items-center gap-3 w-full justify-center md:w-auto order-3 md:order-3 flex-shrink-0">
            <button class="flex-1 md:flex-none btn-ghost text-[10px] font-bold uppercase tracking-widest px-6 py-3" onClick={() => setShowCharacterSheet(true)}>
              <span class="mr-2">👤</span> Spirit
            </button>
            <button class="flex-1 md:flex-none btn-primary text-[10px] font-black uppercase tracking-widest px-8 py-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]" onClick={() => setShowInventory(true)}>
              <span class="mr-2">🎒</span> Vault
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div class="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto p-4 md:p-6 pb-48">
        <Show
          when={isInitialized()}
          fallback={
            <div class="flex-1 flex items-center justify-center">
              <div class="text-center glass-panel px-12 py-10 animate-fade-in">
                <div class="text-xl mb-4 font-semibold text-primary-300">Loading Realm...</div>
                <div class="animate-pulse-slow text-4xl">⚔️</div>
              </div>
            </div>
          }
        >
          {/* WORK phase */}
          <Show when={currentPhase() === 'WORK'}>
            <WorkScreen events={eventState.currentSessionEvents} class="flex-1 animate-fade-in" />
          </Show>

          {/* BREAK phases */}
          <Show when={currentPhase() === 'SHORT_BREAK' || currentPhase() === 'LONG_BREAK'}>
            <div class="flex-1 overflow-auto animate-slide-up">
              <div class="max-w-5xl mx-auto">
                <div class="mb-8 flex items-end justify-between border-b border-white/5 pb-6">
                  <div>
                    <h2 class="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      {currentPhase() === 'SHORT_BREAK' ? 'Rest & Refit' : 'Long Rest'}
                    </h2>
                    <p class="text-gray-400">
                      Manage your character and prepare for the next expedition
                    </p>
                  </div>
                </div>

                {/* Break navigation */}
                <div class="flex flex-wrap gap-3 mb-8">
                  <button
                    class={`px-5 py-2.5 rounded-full font-medium transition-all ${activeBreakView() === 'task-select'
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    onClick={() => setActiveBreakView('task-select')}
                  >
                    Select Mission
                  </button>
                  <button
                    class={`px-5 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 ${activeBreakView() === 'chest'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    onClick={() => setActiveBreakView('chest')}
                    disabled={chestStore.state.chests.filter((c) => !c.opened).length === 0}
                  >
                    <span>Open Chests</span>
                    <span class="bg-black/20 px-2 py-0.5 rounded-full text-xs">
                      {chestStore.state.chests.filter((c) => !c.opened).length}
                    </span>
                  </button>
                  <button
                    class={`px-5 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 ${activeBreakView() === 'hospital'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    onClick={() => setActiveBreakView('hospital')}
                    disabled={
                      !characterStore.state.injury.isInjured && !characterStore.state.hospitalBill
                    }
                  >
                    Hospital
                    <Show when={characterStore.state.injury.isInjured}>
                      <span class="ml-2 animate-pulse text-red-200">!</span>
                    </Show>
                  </button>
                </div>

                {/* Break content */}
                <div class="animate-fade-in">
                  {renderBreakContent()}
                </div>
              </div>
            </div>
          </Show>

          {/* IDLE phase */}
          <Show when={currentPhase() === 'IDLE'}>
            <div class="flex-1 flex flex-col items-center justify-start md:justify-center py-12 px-6 overflow-y-auto custom-scrollbar">
              <div class="text-center glass-panel px-8 md:px-16 py-10 md:py-12 max-w-lg w-full transform transition-all duration-500 hover:border-primary-500/30 hover:shadow-primary-500/10 hover:shadow-2xl mb-8">
                <div class="text-6xl mb-6 animate-float drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">🛡️</div>
                <h2 class="text-3xl md:text-4xl font-display font-black mb-4 bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent uppercase italic">Ready to Begin?</h2>
                <p class="text-gray-400 mb-8 text-base md:text-lg font-sans font-medium">
                  Start the timer to begin your first Pomodoro session and earn rewards.
                </p>
                <button
                  class="btn-primary text-base md:text-lg px-10 py-4 w-full"
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
        <div class="fixed top-20 left-4 z-50 animate-fade-in pointer-events-none">
          <DraggablePanel
            class="max-w-2xl w-[90vw] max-h-[85vh] overflow-hidden flex flex-col pointer-events-auto"
            handleSelector=".drag-handle"
            showHandleBar={false}
          >
            <CharacterSheet
              characterStore={characterStore}
              inventoryStore={inventoryStore}
              onClose={() => setShowCharacterSheet(false)}
            />
          </DraggablePanel>
        </div>
      </Show>

      {/* Inventory Modal */}
      <Show when={showInventory()}>
        <div class="fixed top-20 right-4 z-50 animate-fade-in pointer-events-none">
          <DraggablePanel
            class="max-w-2xl w-[90vw] max-h-[85vh] overflow-hidden flex flex-col pointer-events-auto"
            handleSelector=".drag-handle"
            showHandleBar={false}
          >
            <Inventory inventoryStore={inventoryStore} onClose={() => setShowInventory(false)} />
          </DraggablePanel>
        </div>
      </Show>

      {/* Bottom stats bar */}
      <Show when={isInitialized()}>
        <div class="fixed bottom-0 left-0 right-0 bg-[#080810]/98 backdrop-blur-2xl border-t border-primary-500/15 py-3 px-6 z-30 shadow-[0_-10px_50px_rgba(0,0,0,0.9)]">
          <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

            {/* MMORPG HUD UNIT */}
            <div class="flex items-center gap-5 w-full md:w-auto">
              {/* Level / Tier Medallion */}
              <div class="relative group flex-shrink-0">
                <div class="absolute inset-0 bg-primary-500/20 blur-xl group-hover:bg-primary-500/40 transition-all duration-700"></div>
                <div class="relative flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 border-primary-500/40 bg-black/80 shadow-[inset_0_0_15px_rgba(245,158,11,0.2)] overflow-hidden">
                  <span class="text-[8px] font-mono font-black text-primary-500/60 uppercase tracking-tighter leading-none mb-1">Level</span>
                  <span class="text-2xl font-display font-black text-primary-400 leading-none">{progression.level}</span>
                  <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500/30"></div>
                </div>
              </div>

              {/* Bars & Gold Stack */}
              <div class="flex flex-col gap-1.5 flex-grow md:w-72">
                {/* Vitality Bar (Health) */}
                <div class="relative h-4 w-full bg-black/60 rounded-md border border-white/10 shadow-inner overflow-hidden group">
                  <div
                    class="h-full bg-gradient-to-r from-red-800 via-danger to-red-400 transition-all duration-1000 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    style={{ width: `${(characterStore.state.computedStats.health / characterStore.state.computedStats.maxHealth) * 100}%` }}
                  >
                    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                  </div>
                  <div class="absolute inset-0 flex items-center justify-between px-3">
                    <span class="text-[9px] font-display font-black text-white/90 drop-shadow-md uppercase tracking-[0.1em]">HP</span>
                    <span class="text-[9px] font-mono font-black text-white/90 drop-shadow-md">
                      {characterStore.state.computedStats.health} <span class="opacity-40">/</span> {characterStore.state.computedStats.maxHealth}
                    </span>
                  </div>
                </div>

                {/* Spirit Essence Bar (XP) */}
                <div class="relative h-1.5 w-full bg-black/80 rounded-full border border-primary-500/10 shadow-inner overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-primary-800 via-primary-500 to-primary-300 transition-all duration-1500"
                    style={{ width: `${(progression.currentXP / progression.xpToNextLevel) * 100}%` }}
                  ></div>
                </div>

                {/* Gold Indicator */}
                <div class="flex items-center justify-between pt-0.5 px-0.5">
                  <div class="flex items-center gap-2 group cursor-help">
                    <span class="text-sm scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">💰</span>
                    <span class="text-xs font-mono font-black text-amber-500 tracking-tight leading-none">{inventoryStore.state.gold} <span class="text-[8px] text-amber-500/40 uppercase tracking-widest ml-1 font-bold">Imperial Gold</span></span>
                  </div>
                  <div class="hidden sm:flex items-center gap-3 opacity-40">
                    <span class="text-[8px] font-mono font-black text-primary-400 uppercase tracking-tighter">XP Potency: {progression.currentXP} / {progression.xpToNextLevel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STATUS EFFECTS UNIT */}
            <div class="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end border-t border-white/5 md:border-none pt-4 md:pt-0">
              <Show
                when={characterStore.state.injury.isInjured}
                fallback={<div class="hidden lg:flex flex-col items-end opacity-20">
                  <span class="text-[8px] font-mono font-black text-emerald-500 uppercase tracking-[0.2em]">Spirit Status</span>
                  <span class="text-[10px] font-display font-bold text-emerald-400/80 uppercase">Harmonized</span>
                </div>}
              >
                <div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-danger/10 border border-danger/20 text-[9px] font-black text-danger animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.2)] uppercase tracking-[0.2em] backdrop-blur-sm">
                  <span class="text-base">🩸</span> Spirit Bleed Active
                </div>
              </Show>
              <Show when={characterStore.state.hospitalBill}>
                <div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] backdrop-blur-sm shadow-[0_0_25px_rgba(245,158,11,0.1)]">
                  <span class="text-base">⚖️</span> Tithing Due
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default App;
