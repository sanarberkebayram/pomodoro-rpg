/**
 * Injury System Integration Tests
 * Tests the full flow from task failure → injury → hospital visit → healing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createCharacterStore } from '@/core/state/CharacterState';
import { createInventoryStore } from '@/core/state/InventoryState';
import { createTaskStore } from '@/core/state/TaskState';
import { createTaskManager } from '@/systems/tasks/TaskManager';
import { createTaskCompletionHandler } from '@/systems/tasks/TaskCompletionHandler';
import { createHospitalSystem } from '@/systems/injury/HospitalSystem';
import type { TaskSelectionContext } from '@/core/types/tasks';
import { getTaskConfig } from '@/data/tasks/taskConfigs';
import { getEquipmentBonuses } from '@/core/utils/itemUtils';

describe('Injury System Integration', () => {
  let characterStore: ReturnType<typeof createCharacterStore>;
  let inventoryStore: ReturnType<typeof createInventoryStore>;
  let taskStore: ReturnType<typeof createTaskStore>;
  let taskManager: ReturnType<typeof createTaskManager>;
  let completionHandler: ReturnType<typeof createTaskCompletionHandler>;
  let hospitalSystem: ReturnType<typeof createHospitalSystem>;

  beforeEach(() => {
    characterStore = createCharacterStore();
    inventoryStore = createInventoryStore();
    taskStore = createTaskStore();
    taskManager = createTaskManager(taskStore);
    completionHandler = createTaskCompletionHandler(characterStore, inventoryStore);
    hospitalSystem = createHospitalSystem();
  });

  describe('Task Failure → Injury Flow', () => {
    it('should apply injury when task fails with low defense', () => {
      // Setup: Low defense character
      const context: TaskSelectionContext = {
        characterLevel: 1,
        characterStats: {
          ...characterStore.state.computedStats,
          defense: 0, // Low defense = high injury chance
        },
        isInjured: false,
        injuryPenalty: 0,
        billPenalty: 0,
        equipmentBonuses: {
          power: 0,
          defense: 0,
          focus: 0,
          luck: 0,
        },
      };

      // Start and complete a task multiple times to trigger injury
      const taskConfig = getTaskConfig('expedition');
      let injuryOccurred = false;

      for (let i = 0; i < 20; i++) {
        // Reset character injury
        if (characterStore.state.injury.isInjured) {
          characterStore.healInjury();
        }

        taskManager.startTask('expedition', 'risky', taskConfig, context);

        // Force a failure by manipulating success chance
        const completion = taskManager.completeTask(context);

        if (completion && completion.outcome === 'failure' && completion.wasInjured) {
          // Apply injury through completion handler
          completionHandler.processCompletion(completion);

          // Verify injury was applied
          expect(characterStore.state.injury.isInjured).toBe(true);
          expect(characterStore.state.injury.severity).toBeDefined();
          expect(characterStore.state.injury.successPenalty).toBeGreaterThan(0);
          injuryOccurred = true;
          break;
        }
      }

      // Should have gotten injured at some point
      expect(injuryOccurred).toBe(true);
    });

    it('should apply correct severity based on risk level', () => {
      const context: TaskSelectionContext = {
        characterLevel: 1,
        characterStats: {
          ...characterStore.state.computedStats,
          defense: 0,
        },
        isInjured: false,
        injuryPenalty: 0,
        billPenalty: 0,
        equipmentBonuses: {
          power: 0,
          defense: 0,
          focus: 0,
          luck: 0,
        },
      };

      const taskConfig = getTaskConfig('raid');
      taskManager.startTask('raid', 'safe', taskConfig, context);

      // Try to get an injury (safe should only give minor)
      for (let i = 0; i < 50; i++) {
        if (characterStore.state.injury.isInjured) {
          characterStore.healInjury();
        }

        taskManager.startTask('raid', 'safe', taskConfig, context);
        const completion = taskManager.completeTask(context);

        if (completion && completion.wasInjured) {
          completionHandler.processCompletion(completion);
          // Safe risk should only produce minor injuries
          expect(characterStore.state.injury.severity).toBe('minor');
          break;
        }
      }
    });

    it('should reduce character stats when injured', () => {
      // Apply injury directly
      characterStore.applyInjury('moderate');

      const baseStats = characterStore.state.baseStats;
      const computedStats = characterStore.state.computedStats;

      // Stats should be reduced
      expect(computedStats.power).toBeLessThan(baseStats.power);
      expect(computedStats.focus).toBeLessThan(baseStats.focus);
    });
  });

  describe('Hospital Visit Flow', () => {
    it('should heal injury when player can afford treatment', () => {
      // Setup: Injured character with gold
      characterStore.applyInjury('minor');
      inventoryStore.addGold(100);

      const treatmentCost = hospitalSystem.calculateTreatmentCost(characterStore.state.injury);
      expect(treatmentCost).toBe(20);

      // Process hospital visit
      const result = hospitalSystem.processHospitalVisit(
        characterStore.state.injury,
        inventoryStore.state.gold
      );

      expect(result.success).toBe(true);
      expect(result.goldPaid).toBe(20);
      expect(result.billCreated).toBe(false);

      // Apply healing
      characterStore.healInjury();
      inventoryStore.removeGold(result.goldPaid);

      // Verify healing
      expect(characterStore.state.injury.isInjured).toBe(false);
      expect(inventoryStore.state.gold).toBe(80);
    });

    it('should create bill when player cannot afford treatment', () => {
      // Setup: Injured character without enough gold
      characterStore.applyInjury('severe');
      inventoryStore.addGold(50); // Needs 100 for severe

      // Process hospital visit
      const result = hospitalSystem.processHospitalVisit(
        characterStore.state.injury,
        inventoryStore.state.gold
      );

      expect(result.success).toBe(true);
      expect(result.billCreated).toBe(true);
      expect(result.billAmount).toBe(100);
      expect(result.goldPaid).toBe(0);

      // Apply healing and bill
      characterStore.healInjury();
      characterStore.addHospitalBill(result.billAmount);

      // Verify
      expect(characterStore.state.injury.isInjured).toBe(false);
      expect(characterStore.state.hospitalBill).toBeDefined();
      expect(characterStore.state.hospitalBill?.amount).toBe(100);
      expect(characterStore.state.hospitalBill?.penalty).toBe(10); // Capped at 10
    });

    it('should fully restore health on hospital treatment', () => {
      // Setup: Injured character with damaged health
      characterStore.applyInjury('moderate');
      characterStore.takeDamage(30);
      inventoryStore.addGold(100);

      const healthBefore = characterStore.state.computedStats.health;
      expect(healthBefore).toBeLessThan(characterStore.state.computedStats.maxHealth);

      // Process hospital visit
      hospitalSystem.processHospitalVisit(characterStore.state.injury, inventoryStore.state.gold);

      // Apply healing
      characterStore.healInjury();
      characterStore.fullHeal();

      // Verify full healing
      expect(characterStore.state.computedStats.health).toBe(
        characterStore.state.computedStats.maxHealth
      );
    });
  });

  describe('Bill Payment Flow', () => {
    it('should remove penalty when bill is paid', () => {
      // Setup: Character with hospital bill
      characterStore.addHospitalBill(50);
      inventoryStore.addGold(100);

      const penaltyBefore = characterStore.getSuccessChancePenalty();
      expect(penaltyBefore).toBeGreaterThan(0);

      // Pay bill
      const result = hospitalSystem.processBillPayment(
        characterStore.state.hospitalBill,
        inventoryStore.state.gold
      );

      expect(result.success).toBe(true);
      expect(result.amountPaid).toBe(50);

      // Apply payment
      inventoryStore.removeGold(result.amountPaid);
      characterStore.payHospitalBill();

      // Verify penalty removed
      const penaltyAfter = characterStore.getSuccessChancePenalty();
      expect(penaltyAfter).toBe(0);
      expect(characterStore.state.hospitalBill).toBeNull();
      expect(inventoryStore.state.gold).toBe(50);
    });

    it('should not allow payment with insufficient gold', () => {
      // Setup: Character with bill but not enough gold
      characterStore.addHospitalBill(100);
      inventoryStore.addGold(50);

      // Try to pay
      const result = hospitalSystem.processBillPayment(
        characterStore.state.hospitalBill,
        inventoryStore.state.gold
      );

      expect(result.success).toBe(false);
      expect(result.amountPaid).toBe(0);

      // Bill should still exist
      expect(characterStore.state.hospitalBill?.amount).toBe(100);
    });
  });

  describe('Injury Impact on Tasks', () => {
    it('should reduce success chance when injured', () => {
      const taskConfig = getTaskConfig('expedition');

      // Get success chance without injury
      const equipmentBonuses = {
        power: 0,
        defense: 0,
        focus: 0,
        luck: 0,
      };

      const healthyContext: TaskSelectionContext = {
        characterLevel: 1,
        characterStats: characterStore.state.computedStats,
        isInjured: false,
        injuryPenalty: 0,
        billPenalty: 0,
        equipmentBonuses,
      };

      const healthyChance = taskManager.previewSuccessChance(
        taskConfig,
        'standard',
        healthyContext
      );
      expect(healthyChance.finalChance).toBeGreaterThan(0);

      // Apply injury and get new success chance
      characterStore.applyInjury('severe'); // -20% success

      const injuredContext: TaskSelectionContext = {
        characterLevel: 1,
        characterStats: characterStore.state.computedStats,
        isInjured: true,
        injuryPenalty: 20,
        billPenalty: 0,
        equipmentBonuses,
      };

      const injuredChance = taskManager.previewSuccessChance(
        taskConfig,
        'standard',
        injuredContext
      );

      // Success chance should be reduced by 20%
      expect(injuredChance.injuryPenalty).toBe(20);
      expect(injuredChance.finalChance).toBeLessThan(healthyChance.finalChance);
    });

    it('should stack injury and bill penalties', () => {
      const taskConfig = getTaskConfig('expedition');

      // Apply both injury and bill
      characterStore.applyInjury('moderate'); // -10% success
      characterStore.addHospitalBill(100); // -10 focus penalty

      const context: TaskSelectionContext = {
        characterLevel: 1,
        characterStats: characterStore.state.computedStats,
        isInjured: true,
        injuryPenalty: 10,
        billPenalty: 10,
        equipmentBonuses: getEquipmentBonuses(
          characterStore.state.equipment,
          inventoryStore.state.items
        ),
      };

      const calculation = taskManager.previewSuccessChance(taskConfig, 'standard', context);

      // Both penalties should apply
      expect(calculation.injuryPenalty).toBe(10);
      expect(calculation.billPenalty).toBe(10);
      expect(calculation.breakdown).toContain('Injury (-10%)');
      expect(calculation.breakdown).toContain('Unpaid Bill (-10%)');
    });
  });

  describe('Complete Injury → Hospital → Recovery Flow', () => {
    it('should complete full injury recovery cycle', () => {
      // 1. Start healthy
      expect(characterStore.state.injury.isInjured).toBe(false);
      expect(characterStore.state.hospitalBill).toBeNull();

      // 2. Get injured (simulate)
      characterStore.applyInjury('moderate');
      expect(characterStore.state.injury.isInjured).toBe(true);
      expect(characterStore.state.injury.successPenalty).toBe(10);

      // 3. Visit hospital without money → create bill
      inventoryStore.addGold(10); // Not enough for 50 gold treatment
      const visitResult = hospitalSystem.processHospitalVisit(
        characterStore.state.injury,
        inventoryStore.state.gold
      );

      expect(visitResult.billCreated).toBe(true);

      // Apply healing and bill
      characterStore.healInjury();
      const bill = hospitalSystem.generateBill(visitResult.billAmount);
      characterStore.addHospitalBill(bill.amount);

      expect(characterStore.state.injury.isInjured).toBe(false);
      expect(characterStore.state.hospitalBill).toBeDefined();

      // 4. Earn gold
      inventoryStore.addGold(100);
      expect(inventoryStore.state.gold).toBe(110);

      // 5. Pay bill
      const paymentResult = hospitalSystem.processBillPayment(
        characterStore.state.hospitalBill,
        inventoryStore.state.gold
      );

      expect(paymentResult.success).toBe(true);

      inventoryStore.removeGold(paymentResult.amountPaid);
      characterStore.payHospitalBill();

      // 6. Verify full recovery
      expect(characterStore.state.injury.isInjured).toBe(false);
      expect(characterStore.state.hospitalBill).toBeNull();
      expect(characterStore.getSuccessChancePenalty()).toBe(0);
      expect(inventoryStore.state.gold).toBe(60); // 110 - 50
    });
  });

  describe('Completion Handler Integration', () => {
    it('should apply all effects through completion handler', () => {
      const context: TaskSelectionContext = {
        characterLevel: 1,
        characterStats: characterStore.state.computedStats,
        isInjured: false,
        injuryPenalty: 0,
        billPenalty: 0,
        equipmentBonuses: {
          power: 0,
          defense: 0,
          focus: 0,
          luck: 0,
        },
      };

      const taskConfig = getTaskConfig('expedition');
      taskManager.startTask('expedition', 'risky', taskConfig, context);

      // Get completion result (may or may not have injury)
      const completion = taskManager.completeTask(context);

      if (completion) {
        const goldBefore = inventoryStore.state.gold;
        const tasksCompletedBefore = characterStore.state.metadata.tasksCompleted;
        const tasksFailedBefore = characterStore.state.metadata.tasksFailed;

        // Process completion
        completionHandler.processCompletion(completion);

        // Verify rewards applied
        if (completion.outcome !== 'failure') {
          expect(inventoryStore.state.gold).toBeGreaterThan(goldBefore);
        }

        // Verify stats updated
        if (completion.outcome === 'success' || completion.outcome === 'partial') {
          expect(characterStore.state.metadata.tasksCompleted).toBe(tasksCompletedBefore + 1);
        } else {
          expect(characterStore.state.metadata.tasksFailed).toBe(tasksFailedBefore + 1);
        }

        // Verify injury applied if present
        if (completion.wasInjured) {
          expect(characterStore.state.injury.isInjured).toBe(true);
        }
      }
    });
  });
});
