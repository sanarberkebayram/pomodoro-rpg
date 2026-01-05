/**
 * TaskSelection Component
 * Main interface for selecting tasks and risk levels during break phase
 */

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
 * TaskSelection - Interface for choosing work tasks
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
    const equipmentBonuses = getEquipmentBonuses(char.equipment, inventoryState().items);

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
    <div class="task-selection">
      <div class="task-selection__header">
        <h2 class="task-selection__title">Select Work Task</h2>
        <p class="task-selection__subtitle">
          Choose your task and risk level for the upcoming work session
        </p>
      </div>

      <div class="task-selection__content">
        {/* Left Panel: Task List */}
        <div class="task-selection__tasks">
          <h3 class="section-title">Available Tasks</h3>
          <div class="task-list">
            <For each={availableTasks()}>
              {(taskConfig) => (
                <button
                  class={`task-list__item ${selectedTask() === taskConfig.id ? 'task-list__item--selected' : ''}`}
                  onClick={() => handleTaskSelect(taskConfig.id)}
                  disabled={!taskConfig.available}
                >
                  <div class="task-list__item-header">
                    <span class="task-list__item-name">{taskConfig.name}</span>
                    <span class="task-list__item-level">Lv.{taskConfig.minLevel}+</span>
                  </div>
                  <p class="task-list__item-description">{taskConfig.description}</p>
                  <div class="task-list__item-stats">
                    <span class="stat-badge">
                      {taskConfig.primaryStat.charAt(0).toUpperCase() +
                        taskConfig.primaryStat.slice(1)}
                    </span>
                    <span class="success-badge">{taskConfig.baseSuccessChance}% base</span>
                  </div>
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Middle Panel: Task Details & Risk Selection */}
        <div class="task-selection__details">
          <Show
            when={currentTaskConfig()}
            fallback={
              <div class="task-selection__placeholder">
                <p>Select a task to view details</p>
              </div>
            }
          >
            {(config) => (
              <>
                <TaskInfoCard config={config()} riskLevel={selectedRisk()} />
                <RiskLevelSelector
                  config={config()}
                  selectedRisk={selectedRisk()}
                  onRiskSelect={handleRiskSelect}
                />
                <Show when={successChance()}>
                  {(chance) => <SuccessChanceDisplay calculation={chance()} />}
                </Show>
              </>
            )}
          </Show>
        </div>

        {/* Right Panel: Character Loadout */}
        <div class="task-selection__loadout">
          <TaskLoadoutPanel
            characterStore={props.characterStore}
            inventoryStore={props.inventoryStore}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div class="task-selection__actions">
        <Show when={props.onCancel}>
          <button class="btn btn--secondary" onClick={props.onCancel}>
            Cancel
          </button>
        </Show>
        <button class="btn btn--primary" onClick={handleConfirm} disabled={!canConfirm()}>
          Start Task
        </button>
      </div>
    </div>
  );
};
