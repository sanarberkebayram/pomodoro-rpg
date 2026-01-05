/**
 * HospitalSystem Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  HospitalSystem,
  createHospitalSystem,
  HEALING_SERVICES,
} from '@/systems/injury/HospitalSystem';
import type { InjuryState, HospitalBill } from '@/core/types/character';

describe('HospitalSystem', () => {
  describe('Treatment Cost Calculation', () => {
    it('should return zero cost when not injured', () => {
      const system = createHospitalSystem();
      const injury: InjuryState = {
        isInjured: false,
        severity: 'minor',
        successPenalty: 0,
        injuredAt: null,
      };

      expect(system.calculateTreatmentCost(injury)).toBe(0);
    });

    it('should calculate correct cost for minor injury', () => {
      const system = createHospitalSystem();
      const injury: InjuryState = {
        isInjured: true,
        severity: 'minor',
        successPenalty: 5,
        injuredAt: Date.now(),
      };

      expect(system.calculateTreatmentCost(injury)).toBe(20);
    });

    it('should calculate correct cost for moderate injury', () => {
      const system = createHospitalSystem();
      const injury: InjuryState = {
        isInjured: true,
        severity: 'moderate',
        successPenalty: 10,
        injuredAt: Date.now(),
      };

      expect(system.calculateTreatmentCost(injury)).toBe(50);
    });

    it('should calculate correct cost for severe injury', () => {
      const system = createHospitalSystem();
      const injury: InjuryState = {
        isInjured: true,
        severity: 'severe',
        successPenalty: 20,
        injuredAt: Date.now(),
      };

      expect(system.calculateTreatmentCost(injury)).toBe(100);
    });
  });

  describe('Hospital Visit Processing', () => {
    it('should reject visit when not injured', () => {
      const system = createHospitalSystem();
      const injury: InjuryState = {
        isInjured: false,
        severity: 'minor',
        successPenalty: 0,
        injuredAt: null,
      };

      const result = system.processHospitalVisit(injury, 100);
      expect(result.success).toBe(false);
      expect(result.billCreated).toBe(false);
      expect(result.goldPaid).toBe(0);
      expect(result.message).toContain('not injured');
    });

    it('should process payment when player has enough gold', () => {
      const system = createHospitalSystem();
      const injury: InjuryState = {
        isInjured: true,
        severity: 'minor',
        successPenalty: 5,
        injuredAt: Date.now(),
      };

      const result = system.processHospitalVisit(injury, 100); // Has 100 gold, needs 20
      expect(result.success).toBe(true);
      expect(result.billCreated).toBe(false);
      expect(result.goldPaid).toBe(20);
      expect(result.billAmount).toBe(0);
      expect(result.message).toContain('Treatment successful');
      expect(result.message).toContain('Paid 20 gold');
    });

    it('should create bill when player lacks sufficient gold', () => {
      const system = createHospitalSystem();
      const injury: InjuryState = {
        isInjured: true,
        severity: 'moderate',
        successPenalty: 10,
        injuredAt: Date.now(),
      };

      const result = system.processHospitalVisit(injury, 10); // Has 10 gold, needs 50
      expect(result.success).toBe(true);
      expect(result.billCreated).toBe(true);
      expect(result.goldPaid).toBe(0);
      expect(result.billAmount).toBe(50);
      expect(result.message).toContain('bill has been created');
    });

    it('should handle exact gold amount', () => {
      const system = createHospitalSystem();
      const injury: InjuryState = {
        isInjured: true,
        severity: 'minor',
        successPenalty: 5,
        injuredAt: Date.now(),
      };

      const result = system.processHospitalVisit(injury, 20); // Exactly 20 gold
      expect(result.success).toBe(true);
      expect(result.billCreated).toBe(false);
      expect(result.goldPaid).toBe(20);
    });
  });

  describe('Bill Generation', () => {
    it('should generate bill with correct amount', () => {
      const system = createHospitalSystem();
      const bill = system.generateBill(50);

      expect(bill.amount).toBe(50);
      expect(bill.penalty).toBe(5); // 50 / 10 = 5
      expect(bill.createdAt).toBeGreaterThan(0);
    });

    it('should calculate penalty correctly (1 per 10 gold)', () => {
      const system = createHospitalSystem();

      const bill1 = system.generateBill(20);
      expect(bill1.penalty).toBe(2);

      const bill2 = system.generateBill(50);
      expect(bill2.penalty).toBe(5);

      const bill3 = system.generateBill(100);
      expect(bill3.penalty).toBe(10); // Capped at 10
    });

    it('should cap penalty at 10', () => {
      const system = createHospitalSystem();
      const bill = system.generateBill(500); // Would be 50 without cap

      expect(bill.penalty).toBe(10);
    });

    it('should handle small amounts', () => {
      const system = createHospitalSystem();
      const bill = system.generateBill(5);

      expect(bill.penalty).toBe(0); // 5 / 10 = 0.5, floored to 0
    });
  });

  describe('Bill Payment Processing', () => {
    it('should reject payment when no bill exists', () => {
      const system = createHospitalSystem();
      const result = system.processBillPayment(null, 100);

      expect(result.success).toBe(false);
      expect(result.amountPaid).toBe(0);
      expect(result.message).toContain('no outstanding bills');
    });

    it('should reject payment when insufficient gold', () => {
      const system = createHospitalSystem();
      const bill: HospitalBill = {
        amount: 50,
        createdAt: Date.now(),
        penalty: 5,
      };

      const result = system.processBillPayment(bill, 30);
      expect(result.success).toBe(false);
      expect(result.amountPaid).toBe(0);
      expect(result.remainingGold).toBe(30);
      expect(result.message).toContain('Insufficient funds');
    });

    it('should process payment when sufficient gold', () => {
      const system = createHospitalSystem();
      const bill: HospitalBill = {
        amount: 50,
        createdAt: Date.now(),
        penalty: 5,
      };

      const result = system.processBillPayment(bill, 100);
      expect(result.success).toBe(true);
      expect(result.amountPaid).toBe(50);
      expect(result.remainingGold).toBe(50);
      expect(result.message).toContain('Bill paid successfully');
    });

    it('should handle exact payment amount', () => {
      const system = createHospitalSystem();
      const bill: HospitalBill = {
        amount: 50,
        createdAt: Date.now(),
        penalty: 5,
      };

      const result = system.processBillPayment(bill, 50);
      expect(result.success).toBe(true);
      expect(result.amountPaid).toBe(50);
      expect(result.remainingGold).toBe(0);
    });
  });

  describe('Bill Status and Info', () => {
    it('should return no bills status when no bill', () => {
      const system = createHospitalSystem();
      const message = system.getBillStatusMessage(null);

      expect(message).toBe('No outstanding bills');
    });

    it('should format bill status with days overdue', () => {
      const system = createHospitalSystem();
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const bill: HospitalBill = {
        amount: 50,
        createdAt: oneDayAgo,
        penalty: 5,
      };

      const message = system.getBillStatusMessage(bill);
      expect(message).toContain('50 gold');
      expect(message).toContain('1 day');
      expect(message).toContain('-5%');
    });

    it('should return zero penalty when no bill', () => {
      const system = createHospitalSystem();
      expect(system.getBillPenalty(null)).toBe(0);
    });

    it('should return correct penalty from bill', () => {
      const system = createHospitalSystem();
      const bill: HospitalBill = {
        amount: 50,
        createdAt: Date.now(),
        penalty: 5,
      };

      expect(system.getBillPenalty(bill)).toBe(5);
    });

    it('should return comprehensive debt info', () => {
      const system = createHospitalSystem();
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      const bill: HospitalBill = {
        amount: 75,
        createdAt: threeDaysAgo,
        penalty: 7,
      };

      const info = system.getDebtInfo(bill);
      expect(info.hasDebt).toBe(true);
      expect(info.amount).toBe(75);
      expect(info.penalty).toBe(7);
      expect(info.daysOverdue).toBe(3);
    });

    it('should return no debt info when no bill', () => {
      const system = createHospitalSystem();
      const info = system.getDebtInfo(null);

      expect(info.hasDebt).toBe(false);
      expect(info.amount).toBe(0);
      expect(info.penalty).toBe(0);
      expect(info.daysOverdue).toBe(0);
    });
  });

  describe('Affordability Checks', () => {
    it('should return true for treatment when player has enough gold', () => {
      const system = createHospitalSystem();
      const injury: InjuryState = {
        isInjured: true,
        severity: 'minor',
        successPenalty: 5,
        injuredAt: Date.now(),
      };

      expect(system.canAffordTreatment(injury, 50)).toBe(true);
    });

    it('should return false for treatment when player lacks gold', () => {
      const system = createHospitalSystem();
      const injury: InjuryState = {
        isInjured: true,
        severity: 'severe',
        successPenalty: 20,
        injuredAt: Date.now(),
      };

      expect(system.canAffordTreatment(injury, 50)).toBe(false); // Needs 100
    });

    it('should return true for bill payment when enough gold', () => {
      const system = createHospitalSystem();
      const bill: HospitalBill = {
        amount: 50,
        createdAt: Date.now(),
        penalty: 5,
      };

      expect(system.canAffordBillPayment(bill, 100)).toBe(true);
    });

    it('should return false for bill payment when insufficient gold', () => {
      const system = createHospitalSystem();
      const bill: HospitalBill = {
        amount: 50,
        createdAt: Date.now(),
        penalty: 5,
      };

      expect(system.canAffordBillPayment(bill, 30)).toBe(false);
    });

    it('should return true when no bill exists', () => {
      const system = createHospitalSystem();
      expect(system.canAffordBillPayment(null, 0)).toBe(true);
    });
  });

  describe('Healing Services', () => {
    it('should return healing service configuration', () => {
      const system = createHospitalSystem();
      const potionService = system.getHealingService('potion');

      expect(potionService.id).toBe('potion');
      expect(potionService.healsInjury).toBe(true);
      expect(potionService.available).toBe(true);
    });

    it('should return hospital service configuration', () => {
      const system = createHospitalSystem();
      const hospitalService = system.getHealingService('hospital');

      expect(hospitalService.id).toBe('hospital');
      expect(hospitalService.healsInjury).toBe(true);
      expect(hospitalService.restoresHealth).toBe(true);
      expect(hospitalService.healthRestoration).toBe(100);
    });

    it('should return only available services', () => {
      const system = createHospitalSystem();
      const available = system.getAvailableHealingServices();

      expect(available.length).toBeGreaterThan(0);
      expect(available.every((s) => s.available)).toBe(true);
    });

    it('should exclude rest service (post-MVP)', () => {
      const system = createHospitalSystem();
      const available = system.getAvailableHealingServices();

      const hasRest = available.some((s) => s.id === 'rest');
      expect(hasRest).toBe(false);
    });
  });

  describe('Healing Service Constants', () => {
    it('should have potion service configured', () => {
      expect(HEALING_SERVICES.potion).toBeDefined();
      expect(HEALING_SERVICES.potion.name).toBe('Use Healing Potion');
      expect(HEALING_SERVICES.potion.cost).toBe(0); // Uses inventory
    });

    it('should have hospital service configured', () => {
      expect(HEALING_SERVICES.hospital).toBeDefined();
      expect(HEALING_SERVICES.hospital.name).toBe('Hospital Treatment');
      expect(HEALING_SERVICES.hospital.healsInjury).toBe(true);
    });

    it('should have rest service configured for future', () => {
      expect(HEALING_SERVICES.rest).toBeDefined();
      expect(HEALING_SERVICES.rest.available).toBe(false);
    });
  });

  describe('Factory Function', () => {
    it('should create HospitalSystem instance', () => {
      const system = createHospitalSystem();
      expect(system).toBeInstanceOf(HospitalSystem);
    });
  });
});
