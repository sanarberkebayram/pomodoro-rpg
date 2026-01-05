/**
 * Hospital System
 * Manages hospital bills, debt, and healing services
 */

import type { HospitalBill, InjuryState } from '../../core/types/character';

/**
 * Healing option types
 */
export type HealingOption = 'potion' | 'hospital' | 'rest';

/**
 * Healing service configuration
 */
export interface HealingServiceConfig {
  /** Service identifier */
  id: HealingOption;

  /** Display name */
  name: string;

  /** Description */
  description: string;

  /** Cost in gold (0 for free options) */
  cost: number;

  /** Whether this option removes injury */
  healsInjury: boolean;

  /** Whether this option restores health */
  restoresHealth: boolean;

  /** Health restoration amount (percentage or flat) */
  healthRestoration: number;

  /** Whether available */
  available: boolean;
}

/**
 * Healing service configurations
 */
export const HEALING_SERVICES: Record<HealingOption, HealingServiceConfig> = {
  potion: {
    id: 'potion',
    name: 'Use Healing Potion',
    description: 'Consume a healing potion from your inventory to heal injuries',
    cost: 0, // Uses inventory item
    healsInjury: true,
    restoresHealth: true,
    healthRestoration: 50, // Flat amount
    available: true,
  },
  hospital: {
    id: 'hospital',
    name: 'Hospital Treatment',
    description: 'Receive professional medical care (may incur debt if insufficient funds)',
    cost: 0, // Dynamic based on injury severity
    healsInjury: true,
    restoresHealth: true,
    healthRestoration: 100, // Percentage
    available: true,
  },
  rest: {
    id: 'rest',
    name: 'Rest & Recovery',
    description: 'Natural healing over time (takes multiple Pomodoro cycles)',
    cost: 0,
    healsInjury: false, // Only reduces severity gradually
    restoresHealth: true,
    healthRestoration: 25, // Flat amount per rest
    available: false, // Post-MVP feature
  },
};

/**
 * Hospital visit result
 */
export interface HospitalVisitResult {
  /** Whether healing was successful */
  success: boolean;

  /** Whether a bill was created */
  billCreated: boolean;

  /** Bill amount if created */
  billAmount: number;

  /** Message describing the result */
  message: string;

  /** Gold paid (if player had enough) */
  goldPaid: number;
}

/**
 * Bill payment result
 */
export interface BillPaymentResult {
  /** Whether payment was successful */
  success: boolean;

  /** Amount paid */
  amountPaid: number;

  /** Remaining gold after payment */
  remainingGold: number;

  /** Message describing the result */
  message: string;
}

/**
 * Hospital System
 * Manages hospital services, billing, and debt
 */
export class HospitalSystem {
  /**
   * Calculate hospital treatment cost based on injury severity
   * @param injury - Current injury state
   * @returns Treatment cost in gold
   */
  calculateTreatmentCost(injury: InjuryState): number {
    if (!injury.isInjured) {
      return 0;
    }

    const severityCosts = {
      minor: 20,
      moderate: 50,
      severe: 100,
    };

    return severityCosts[injury.severity];
  }

  /**
   * Process hospital visit
   * @param injury - Current injury state
   * @param currentGold - Player's current gold
   * @returns Hospital visit result
   */
  processHospitalVisit(injury: InjuryState, currentGold: number): HospitalVisitResult {
    if (!injury.isInjured) {
      return {
        success: false,
        billCreated: false,
        billAmount: 0,
        goldPaid: 0,
        message: 'You are not injured and do not need treatment.',
      };
    }

    const treatmentCost = this.calculateTreatmentCost(injury);

    // Player has enough gold
    if (currentGold >= treatmentCost) {
      return {
        success: true,
        billCreated: false,
        billAmount: 0,
        goldPaid: treatmentCost,
        message: `Treatment successful! Paid ${treatmentCost} gold. You are now fully healed.`,
      };
    }

    // Player doesn't have enough gold - create bill
    return {
      success: true,
      billCreated: true,
      billAmount: treatmentCost,
      goldPaid: 0,
      message: `Treatment successful! However, you couldn't pay the ${treatmentCost} gold fee. A bill has been created.`,
    };
  }

  /**
   * Generate a hospital bill
   * @param amount - Bill amount in gold
   * @returns Hospital bill object
   */
  generateBill(amount: number): HospitalBill {
    // Calculate penalty (1 focus per 10 gold, capped at 10)
    const penalty = Math.min(Math.floor(amount / 10), 10);

    return {
      amount,
      createdAt: Date.now(),
      penalty,
    };
  }

  /**
   * Process bill payment
   * @param bill - Current hospital bill
   * @param currentGold - Player's current gold
   * @returns Payment result
   */
  processBillPayment(bill: HospitalBill | null, currentGold: number): BillPaymentResult {
    if (!bill) {
      return {
        success: false,
        amountPaid: 0,
        remainingGold: currentGold,
        message: 'You have no outstanding bills.',
      };
    }

    if (currentGold < bill.amount) {
      return {
        success: false,
        amountPaid: 0,
        remainingGold: currentGold,
        message: `Insufficient funds. You need ${bill.amount} gold but only have ${currentGold} gold.`,
      };
    }

    return {
      success: true,
      amountPaid: bill.amount,
      remainingGold: currentGold - bill.amount,
      message: `Bill paid successfully! Paid ${bill.amount} gold. The success penalty has been removed.`,
    };
  }

  /**
   * Get bill status message for display
   * @param bill - Current hospital bill
   * @returns Status message
   */
  getBillStatusMessage(bill: HospitalBill | null): string {
    if (!bill) {
      return 'No outstanding bills';
    }

    const daysOverdue = Math.floor((Date.now() - bill.createdAt) / (1000 * 60 * 60 * 24));
    return `Outstanding: ${bill.amount} gold (${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} old, -${bill.penalty}% success)`;
  }

  /**
   * Get bill penalty
   * @param bill - Current hospital bill
   * @returns Success chance penalty percentage
   */
  getBillPenalty(bill: HospitalBill | null): number {
    if (!bill) {
      return 0;
    }
    return bill.penalty;
  }

  /**
   * Calculate total debt burden
   * @param bill - Current hospital bill
   * @returns Total debt information
   */
  getDebtInfo(bill: HospitalBill | null): {
    hasDebt: boolean;
    amount: number;
    penalty: number;
    daysOverdue: number;
  } {
    if (!bill) {
      return {
        hasDebt: false,
        amount: 0,
        penalty: 0,
        daysOverdue: 0,
      };
    }

    const daysOverdue = Math.floor((Date.now() - bill.createdAt) / (1000 * 60 * 60 * 24));

    return {
      hasDebt: true,
      amount: bill.amount,
      penalty: bill.penalty,
      daysOverdue,
    };
  }

  /**
   * Check if player can afford treatment
   * @param injury - Current injury state
   * @param currentGold - Player's current gold
   * @returns Whether player can afford treatment
   */
  canAffordTreatment(injury: InjuryState, currentGold: number): boolean {
    if (!injury.isInjured) {
      return true;
    }

    const cost = this.calculateTreatmentCost(injury);
    return currentGold >= cost;
  }

  /**
   * Check if player can afford to pay bill
   * @param bill - Current hospital bill
   * @param currentGold - Player's current gold
   * @returns Whether player can afford to pay bill
   */
  canAffordBillPayment(bill: HospitalBill | null, currentGold: number): boolean {
    if (!bill) {
      return true;
    }
    return currentGold >= bill.amount;
  }

  /**
   * Get healing service configuration
   * @param option - Healing option
   * @returns Service configuration
   */
  getHealingService(option: HealingOption): HealingServiceConfig {
    return HEALING_SERVICES[option];
  }

  /**
   * Get all available healing services
   * @returns Array of available healing services
   */
  getAvailableHealingServices(): HealingServiceConfig[] {
    return Object.values(HEALING_SERVICES).filter((service) => service.available);
  }
}

/**
 * Create a new hospital system instance
 */
export function createHospitalSystem(): HospitalSystem {
  return new HospitalSystem();
}
