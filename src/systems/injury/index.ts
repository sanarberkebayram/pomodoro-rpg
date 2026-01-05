/**
 * Injury System Exports
 */

export { InjuryManager, createInjuryManager, INJURY_SEVERITY_CONFIG } from './InjuryManager';
export type { InjurySeverityConfig, InjuryApplicationResult } from './InjuryManager';

export { HospitalSystem, createHospitalSystem, HEALING_SERVICES } from './HospitalSystem';
export type {
  HealingOption,
  HealingServiceConfig,
  HospitalVisitResult,
  BillPaymentResult,
} from './HospitalSystem';
