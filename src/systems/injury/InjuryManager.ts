/**
 * Injury Manager
 * Centralized system for managing character injuries and their effects
 */

import type { InjuryState } from '../../core/types/character';
import type { RiskLevel, TaskOutcome } from '../../core/types/tasks';

/**
 * Injury severity configuration
 */
export interface InjurySeverityConfig {
  /** Success chance penalty percentage */
  successPenalty: number;

  /** Power stat penalty percentage */
  powerPenalty: number;

  /** Focus stat penalty percentage */
  focusPenalty: number;

  /** Recommended healing cost in gold */
  healingCost: number;

  /** Display name */
  displayName: string;

  /** Description of severity */
  description: string;
}

/**
 * Injury severity configurations
 */
export const INJURY_SEVERITY_CONFIG: Record<InjuryState['severity'], InjurySeverityConfig> = {
  minor: {
    successPenalty: 5,
    powerPenalty: 5,
    focusPenalty: 5,
    healingCost: 20,
    displayName: 'Minor Injury',
    description: 'A light wound that slightly impairs performance',
  },
  moderate: {
    successPenalty: 10,
    powerPenalty: 10,
    focusPenalty: 10,
    healingCost: 50,
    displayName: 'Moderate Injury',
    description: 'A painful injury that significantly affects combat ability',
  },
  severe: {
    successPenalty: 20,
    powerPenalty: 20,
    focusPenalty: 20,
    healingCost: 100,
    displayName: 'Severe Injury',
    description: 'A critical wound requiring immediate medical attention',
  },
};

/**
 * Injury application result
 */
export interface InjuryApplicationResult {
  /** Whether injury was applied */
  wasApplied: boolean;

  /** Severity of applied injury */
  severity: InjuryState['severity'] | null;

  /** Message describing the injury */
  message: string;
}

/**
 * Injury Manager
 * Handles injury probability, severity calculation, and status management
 */
export class InjuryManager {
  /**
   * Calculate if injury should be applied based on task outcome
   * @param taskOutcome - The outcome of the task
   * @param taskInjuryChance - Base injury chance from task config (0-100)
   * @param defenseStat - Character's defense stat
   * @returns Whether injury should be applied
   */
  shouldApplyInjury(
    taskOutcome: TaskOutcome,
    taskInjuryChance: number,
    defenseStat: number
  ): boolean {
    // Only failures can cause injury
    if (taskOutcome !== 'failure') {
      return false;
    }

    // Calculate injury chance (reduced by defense)
    const defenseReduction = Math.floor(defenseStat / 2);
    const finalInjuryChance = Math.max(5, taskInjuryChance - defenseReduction);

    const roll = Math.random() * 100;
    return roll < finalInjuryChance;
  }

  /**
   * Determine injury severity based on risk level and random chance
   * @param riskLevel - The risk level of the task
   * @returns Injury severity
   */
  determineInjurySeverity(riskLevel: RiskLevel): InjuryState['severity'] {
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
   * Apply injury and return result
   * @param taskOutcome - The outcome of the task
   * @param riskLevel - The risk level of the task
   * @param taskInjuryChance - Base injury chance from task config
   * @param defenseStat - Character's defense stat
   * @returns Injury application result
   */
  applyInjuryIfNeeded(
    taskOutcome: TaskOutcome,
    riskLevel: RiskLevel,
    taskInjuryChance: number,
    defenseStat: number
  ): InjuryApplicationResult {
    const shouldApply = this.shouldApplyInjury(taskOutcome, taskInjuryChance, defenseStat);

    if (!shouldApply) {
      return {
        wasApplied: false,
        severity: null,
        message: 'You escaped without injury.',
      };
    }

    const severity = this.determineInjurySeverity(riskLevel);
    const config = INJURY_SEVERITY_CONFIG[severity];

    return {
      wasApplied: true,
      severity,
      message: `You suffered a ${config.displayName.toLowerCase()}! ${config.description}`,
    };
  }

  /**
   * Get injury severity configuration
   * @param severity - Injury severity
   * @returns Configuration for that severity
   */
  getSeverityConfig(severity: InjuryState['severity']): InjurySeverityConfig {
    return INJURY_SEVERITY_CONFIG[severity];
  }

  /**
   * Get success chance penalty for an injury
   * @param injury - Current injury state
   * @returns Success chance penalty percentage
   */
  getSuccessChancePenalty(injury: InjuryState): number {
    if (!injury.isInjured) {
      return 0;
    }
    return injury.successPenalty;
  }

  /**
   * Calculate stat penalties for an injury
   * @param injury - Current injury state
   * @param basePower - Base power stat
   * @param baseFocus - Base focus stat
   * @returns Stat penalties
   */
  calculateStatPenalties(
    injury: InjuryState,
    basePower: number,
    baseFocus: number
  ): { power: number; focus: number } {
    if (!injury.isInjured) {
      return { power: 0, focus: 0 };
    }

    const config = INJURY_SEVERITY_CONFIG[injury.severity];
    const powerPenalty = Math.floor((basePower * config.powerPenalty) / 100);
    const focusPenalty = Math.floor((baseFocus * config.focusPenalty) / 100);

    return {
      power: powerPenalty,
      focus: focusPenalty,
    };
  }

  /**
   * Check if character is critically injured (severe injury)
   * @param injury - Current injury state
   * @returns Whether character is critically injured
   */
  isCriticallyInjured(injury: InjuryState): boolean {
    return injury.isInjured && injury.severity === 'severe';
  }

  /**
   * Get time since injury in milliseconds
   * @param injury - Current injury state
   * @returns Time since injury, or 0 if not injured
   */
  getTimeSinceInjury(injury: InjuryState): number {
    if (!injury.isInjured || !injury.injuredAt) {
      return 0;
    }
    return Date.now() - injury.injuredAt;
  }

  /**
   * Get injury status message for display
   * @param injury - Current injury state
   * @returns Status message
   */
  getInjuryStatusMessage(injury: InjuryState): string {
    if (!injury.isInjured) {
      return 'Healthy';
    }

    const config = INJURY_SEVERITY_CONFIG[injury.severity];
    return `${config.displayName} (-${injury.successPenalty}% success chance)`;
  }

  /**
   * Get healing cost for current injury
   * @param injury - Current injury state
   * @returns Healing cost in gold
   */
  getHealingCost(injury: InjuryState): number {
    if (!injury.isInjured) {
      return 0;
    }
    return INJURY_SEVERITY_CONFIG[injury.severity].healingCost;
  }
}

/**
 * Create a new injury manager instance
 */
export function createInjuryManager(): InjuryManager {
  return new InjuryManager();
}
