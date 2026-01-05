import { Component, For, Show, createSignal, createMemo } from 'solid-js';
import type { CharacterStore } from '../../core/state/CharacterState';
import type { InventoryStore } from '../../core/state/InventoryState';
import type { TaskType, RiskLevel, TaskConfig, TaskSelectionContext } from '../../core/types/tasks';
import { getTaskConfig, getTaskConfigsForLevel } from '../../data/tasks/taskConfigs';
import { calculateSuccessChance } from '../../systems/tasks/TaskResolver';
import { getEquipmentBonuses } from '../../core/utils/itemUtils';
import { TaskInfoCard } from './TaskInfoCard';
import { RiskLevelSelector } from './RiskLevelSelector';
import { TaskLoadoutPanel } from './TaskLoadoutPanel';
import { SuccessChanceDisplay } from './SuccessChanceDisplay';

interface TaskSelectionProps {
  characterStore: CharacterStore;
  inventoryStore: InventoryStore;
  onTaskSelected: (taskType: TaskType, riskLevel: RiskLevel, config: TaskConfig) => void;
  onCancel?: () => void;
}

/**
 * TaskSelection - Modern interface for choosing work tasks
 */
export const TaskSelection: Component<TaskSelectionProps> = (props) => {
  const [selectedTask, setSelectedTask] = createSignal<TaskType | null>(null);
  const [selectedRisk, setSelectedRisk] = createSignal<RiskLevel>('standard');

  const characterState = () => props.characterStore.state;
  const inventoryState = () => props.inventoryStore.state;

  /**
   * Get available tasks for current character level
   */
  const availableTasks = createMemo(() => {
    return getTaskConfigsForLevel(characterState().level);
  });

  /**
   * Get current task config
   */
  const currentTaskConfig = createMemo(() => {
    const task = selectedTask();
    return task ? getTaskConfig(task) : null;
  });

  /**
   * Build task selection context
   */
  const selectionContext = createMemo((): TaskSelectionContext => {
    const char = characterState();
    const partialBonuses = getEquipmentBonuses(char.equipment, inventoryState());

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
  });

  /**
   * Calculate success chance for current selection
   */
  const successChance = createMemo(() => {
    const config = currentTaskConfig();
    if (!config) return null;

    return calculateSuccessChance(config, selectedRisk(), selectionContext());
  });

  /**
   * Handle task selection
   */
  const handleTaskSelect = (taskType: TaskType) => {
    setSelectedTask(taskType);
  };

  /**
   * Handle risk level selection
   */
  const handleRiskSelect = (risk: RiskLevel) => {
    setSelectedRisk(risk);
  };

  /**
   * Confirm selection and start task
   */
  const handleConfirm = () => {
    const task = selectedTask();
    const config = currentTaskConfig();
    if (task && config) {
      props.onTaskSelected(task, selectedRisk(), config);
    }
  };

  /**
   * Check if selection is valid
   */
  const canConfirm = createMemo(() => {
    return selectedTask() !== null && currentTaskConfig() !== null;
  });

  return (
    <div class="space-y-6 animate-slide-up">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="text-3xl font-display font-bold text-white mb-1">Select Mission</h2>
          <p class="text-gray-400">Choose your path for the next Focus Cycle</p>
        </div>

        <div class="flex gap-3">
          <Show when={props.onCancel}>
            <button class="btn-ghost text-sm" onClick={props.onCancel}>
              Cancel
            </button>
          </Show>
          <button
            class="btn-primary px-8"
            onClick={handleConfirm}
            disabled={!canConfirm()}
          >
            Deploy Now
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Task List */}
        <div class="lg:col-span-4 space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-widest text-primary-400 mb-2">Available Missions</h3>
          <div class="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            <For each={availableTasks()}>
              {(taskConfig) => (
                <button
                  class={`w-full text-left transition-all duration-300 rounded-2xl border ${selectedTask() === taskConfig.id
                    ? 'bg-primary-500/10 border-primary-500 shadow-[0_0_20px_rgba(14,165,233,0.15)] ring-1 ring-primary-500/50'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                    } p-4 group`}
                  onClick={() => handleTaskSelect(taskConfig.id)}
                  disabled={!taskConfig.available}
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class={`font-bold transition-colors ${selectedTask() === taskConfig.id ? 'text-primary-400' : 'text-gray-200'}`}>
                      {taskConfig.name}
                    </span>
                    <span class="text-[10px] font-mono font-medium text-gray-500 bg-black/30 px-2 py-0.5 rounded border border-white/5">
                      LV {taskConfig.minLevel}
                    </span>
                  </div>
                  <p class="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                    {taskConfig.description}
                  </p>
                  <div class="flex items-center gap-3">
                    <span class="text-[9px] uppercase tracking-tighter font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {taskConfig.primaryStat}
                    </span>
                    <span class="text-[9px] uppercase tracking-tighter font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {taskConfig.baseSuccessChance}% Base
                    </span>
                  </div>
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Middle Column: Details & Configuration */}
        <div class="lg:col-span-5 space-y-6">
          <Show
            when={currentTaskConfig()}
            fallback={
              <div class="glass-panel h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 opacity-50 border-dashed border-2 border-primary-500/10 bg-transparent rounded-3xl">
                <div class="text-6xl mb-4 animate-pulse">📜</div>
                <h3 class="text-lg font-display font-black text-gray-300 uppercase tracking-widest">Awaiting Selection</h3>
                <p class="text-xs text-gray-500 mt-4 max-w-[240px] font-medium leading-relaxed italic">Consult the roster of quests to unseal the scroll of destiny.</p>
              </div>
            }
          >
            {(config) => (
              <div class="space-y-6">
                <TaskInfoCard config={config()} riskLevel={selectedRisk()} />

                <div class="glass-panel p-6 border-white/5 bg-black/20">
                  <RiskLevelSelector
                    config={config()}
                    selectedRisk={selectedRisk()}
                    onRiskSelect={handleRiskSelect}
                  />
                </div>

                <Show when={successChance()}>
                  {(chance) => <SuccessChanceDisplay calculation={chance()} />}
                </Show>
              </div>
            )}
          </Show>
        </div>

        {/* Right Column: Readiness Panel */}
        <div class="lg:col-span-3">
          <TaskLoadoutPanel
            characterStore={props.characterStore}
            inventoryStore={props.inventoryStore}
          />
        </div>
      </div>
    </div>
  );
};
