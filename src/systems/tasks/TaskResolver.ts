/**
 * Task Resolver
 * Calculates task success/failure based on character stats, risk level, and random events
 */

import type {
  TaskConfig,
  TaskSelectionContext,
  SuccessCalculation,
  TaskOutcome,
  RiskLevel,
  TaskRewards,
  ActiveTask,
} from '../../core/types/tasks';

/**
 * Calculate success chance for a task
 * Returns a detailed breakdown of all modifiers
 */
export function calculateSuccessChance(
  taskConfig: TaskConfig,
  riskLevel: RiskLevel,
  context: TaskSelectionContext,
  eventModifier: number = 0
): SuccessCalculation {
  const breakdown: string[] = [];

  // Base chance from task configuration
  const baseChance = taskConfig.baseSuccessChance;
  breakdown.push(`Base: ${baseChance}%`);

  // Stat modifier based on primary stat
  const primaryStatValue = context.characterStats[taskConfig.primaryStat];
  const statModifier = calculateStatModifier(primaryStatValue, taskConfig.primaryStat);
  breakdown.push(
    `${taskConfig.primaryStat.charAt(0).toUpperCase() + taskConfig.primaryStat.slice(1)} (+${statModifier}%)`
  );

  // Equipment modifier (based on total equipment bonuses)
  const equipmentModifier = calculateEquipmentModifier(context.equipmentBonuses);
  if (equipmentModifier > 0) {
    breakdown.push(`Equipment (+${equipmentModifier}%)`);
  }

  // Risk level modifier
  const riskModifier = taskConfig.riskModifiers[riskLevel].successChanceModifier;
  if (riskModifier !== 0) {
    breakdown.push(
      `${taskConfig.riskModifiers[riskLevel].displayName} (${riskModifier >= 0 ? '+' : ''}${riskModifier}%)`
    );
  }

  // Injury penalty
  const injuryPenalty = context.isInjured ? context.injuryPenalty : 0;
  if (injuryPenalty > 0) {
    breakdown.push(`Injury (-${injuryPenalty}%)`);
  }

  // Hospital bill penalty
  const billPenalty = context.billPenalty;
  if (billPenalty > 0) {
    breakdown.push(`Unpaid Bill (-${billPenalty}%)`);
  }

  // Event modifiers (accumulated during task execution)
  if (eventModifier !== 0) {
    breakdown.push(`Events (${eventModifier >= 0 ? '+' : ''}${eventModifier}%)`);
  }

  // Calculate final chance (clamped to 5-95%)
  let finalChance =
    baseChance +
    statModifier +
    equipmentModifier +
    riskModifier -
    injuryPenalty -
    billPenalty +
    eventModifier;
  finalChance = Math.max(5, Math.min(95, finalChance));

  return {
    baseChance,
    statModifier,
    equipmentModifier,
    riskModifier,
    injuryPenalty,
    billPenalty,
    eventModifier,
    finalChance,
    breakdown,
  };
}

/**
 * Calculate stat modifier based on primary stat value
 * Higher stat = higher success chance bonus
 */
function calculateStatModifier(statValue: number, _statName: string): number {
  // Formula: statValue / 2 (rounded down)
  // Example: 20 power = +10%, 40 power = +20%
  return Math.floor(statValue / 2);
}

/**
 * Calculate equipment modifier
 * Takes the average of all equipment bonuses
 */
function calculateEquipmentModifier(equipmentBonuses: {
  power: number;
  defense: number;
  focus: number;
  luck: number;
}): number {
  const total = equipmentBonuses.power + equipmentBonuses.focus + equipmentBonuses.luck;
  // Each point of relevant stats adds 0.5% success chance
  return Math.floor(total * 0.5);
}

/**
 * Resolve task outcome based on success chance
 * Uses a roll to determine success, partial success, or failure
 */
export function resolveTaskOutcome(successChance: number): TaskOutcome {
  const roll = Math.random() * 100;

  // Success threshold
  if (roll < successChance) {
    return 'success';
  }

  // Partial success threshold (within 20% of success chance)
  const partialThreshold = successChance + 20;
  if (roll < partialThreshold) {
    return 'partial';
  }

  // Failure
  return 'failure';
}

/**
 * Calculate rewards based on outcome and task configuration
 */
export function calculateRewards(
  taskConfig: TaskConfig,
  riskLevel: RiskLevel,
  outcome: TaskOutcome,
  luckStat: number
): TaskRewards {
  const baseRewards = taskConfig.rewards;
  const riskMultiplier = taskConfig.riskModifiers[riskLevel].rewardMultiplier;

  // Outcome multiplier
  let outcomeMultiplier = 1.0;
  if (outcome === 'success') {
    outcomeMultiplier = 1.0;
  } else if (outcome === 'partial') {
    outcomeMultiplier = 0.5; // Half rewards for partial success
  } else {
    outcomeMultiplier = 0; // No rewards for failure
  }

  // Luck multiplier (small bonus)
  const luckMultiplier = 1.0 + luckStat * 0.01; // +1% per luck point

  // Calculate gold reward
  const goldMultiplier = riskMultiplier * outcomeMultiplier * luckMultiplier;
  const goldMin = Math.floor(baseRewards.gold.min * goldMultiplier);
  const goldMax = Math.floor(baseRewards.gold.max * goldMultiplier);
  const goldReward = randomInRange(goldMin, goldMax);

  // Calculate XP reward
  const xpMultiplier = riskMultiplier * outcomeMultiplier;
  const xpMin = Math.floor(baseRewards.xp.min * xpMultiplier);
  const xpMax = Math.floor(baseRewards.xp.max * xpMultiplier);
  const xpReward = randomInRange(xpMin, xpMax);

  // Calculate materials reward
  const materialsMultiplier = riskMultiplier * outcomeMultiplier * luckMultiplier;
  const materialsMin = Math.floor(baseRewards.materials.min * materialsMultiplier);
  const materialsMax = Math.floor(baseRewards.materials.max * materialsMultiplier);
  const materialsReward = randomInRange(materialsMin, materialsMax);

  // Calculate chest count
  let chestCount = baseRewards.chests;
  if (outcome === 'partial') {
    chestCount = Math.floor(chestCount / 2); // Half chests for partial
  } else if (outcome === 'failure') {
    chestCount = 0; // No chests for failure
  }

  // Loot quality modifier
  const lootQuality = baseRewards.lootQuality * riskMultiplier;

  return {
    gold: { min: goldReward, max: goldReward }, // Return exact value in min/max
    xp: { min: xpReward, max: xpReward },
    materials: { min: materialsReward, max: materialsReward },
    chests: chestCount,
    lootQuality,
  };
}

/**
 * Determine if character gets injured from task failure
 */
export function shouldApplyInjury(
  taskConfig: TaskConfig,
  outcome: TaskOutcome,
  defenseStat: number
): boolean {
  // Only failures can cause injury
  if (outcome !== 'failure') {
    return false;
  }

  // Calculate injury chance (reduced by defense)
  const baseInjuryChance = taskConfig.injuryChanceOnFailure;
  const defenseReduction = Math.floor(defenseStat / 2); // Each 2 defense reduces injury chance by 1%
  const finalInjuryChance = Math.max(5, baseInjuryChance - defenseReduction); // Minimum 5% injury chance

  const roll = Math.random() * 100;
  return roll < finalInjuryChance;
}

/**
 * Determine injury severity based on task risk level
 */
export function determineInjurySeverity(riskLevel: RiskLevel): 'minor' | 'moderate' | 'severe' {
  if (riskLevel === 'safe') {
    return 'minor';
  } else if (riskLevel === 'standard') {
    // 70% minor, 30% moderate
    return Math.random() < 0.7 ? 'minor' : 'moderate';
  } else {
    // risky: 40% minor, 40% moderate, 20% severe
    const roll = Math.random();
    if (roll < 0.4) return 'minor';
    if (roll < 0.8) return 'moderate';
    return 'severe';
  }
}

/**
 * Generate task summary message based on outcome
 */
export function generateTaskSummary(
  task: ActiveTask,
  outcome: TaskOutcome,
  rewards: TaskRewards,
  wasInjured: boolean
): string {
  const taskName = task.config.name;
  const riskName = task.config.riskModifiers[task.riskLevel].displayName;

  if (outcome === 'success') {
    return `${taskName} (${riskName}) completed successfully! Earned ${rewards.gold.min} gold, ${rewards.xp.min} XP, and ${rewards.chests} chest${rewards.chests !== 1 ? 's' : ''}.`;
  } else if (outcome === 'partial') {
    return `${taskName} (${riskName}) partially completed. Earned ${rewards.gold.min} gold and ${rewards.xp.min} XP, but some objectives were missed.`;
  } else {
    if (wasInjured) {
      return `${taskName} (${riskName}) failed! You were injured and need medical attention.`;
    } else {
      return `${taskName} (${riskName}) failed! No rewards earned, but you escaped unharmed.`;
    }
  }
}

/**
 * Helper: Get random integer in range [min, max] inclusive
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
