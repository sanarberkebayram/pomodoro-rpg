import { Component, Show, createSignal, createMemo, For } from 'solid-js';
import type { CharacterStore } from '../../core/state/CharacterState';
import type { InventoryStore } from '../../core/state/InventoryState';
import type { ConsumableItem } from '../../core/types/items';
import { createHospitalSystem } from '../../systems/injury/HospitalSystem';
import { INJURY_SEVERITY_CONFIG } from '../../systems/injury/InjuryManager';

interface HospitalProps {
  characterStore: CharacterStore;
  inventoryStore: InventoryStore;
  /** Whether interface is locked (during work phase) */
  locked?: boolean;
  onClose?: () => void;
}

/**
 * Hospital - Modern Medical Center interface with dark theme
 */
export const Hospital: Component<HospitalProps> = (props) => {
  const [notification, setNotification] = createSignal<string | null>(null);
  const [notificationType, setNotificationType] = createSignal<'success' | 'error' | 'info'>('info');

  const hospitalSystem = createHospitalSystem();

  const characterState = () => props.characterStore.state;
  const inventoryState = () => props.inventoryStore.state;

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification(message);
    setNotificationType(type);
    setTimeout(() => setNotification(null), 3000);
  };

  const healingPotions = createMemo(() => {
    return inventoryState().slots
      .filter(s => s.item?.type === 'consumable' && s.item?.curesInjury)
      .map(s => s.item!);
  });

  const hasHealingPotion = createMemo(() => healingPotions().length > 0);
  const currentGold = createMemo(() => inventoryState().gold);
  const treatmentCost = createMemo(() => hospitalSystem.calculateTreatmentCost(characterState().injury));
  const canAffordTreatment = createMemo(() => hospitalSystem.canAffordTreatment(characterState().injury, currentGold()));
  const canAffordBillPayment = createMemo(() => hospitalSystem.canAffordBillPayment(characterState().hospitalBill, currentGold()));

  const handleHospitalTreatment = () => {
    if (props.locked) {
      showNotification('SYSTEM_LOCKED: Mission in progress', 'error');
      return;
    }

    if (!characterState().injury.isInjured) {
      showNotification('INTEGRITY_STABLE: No trauma detected', 'info');
      return;
    }

    const result = hospitalSystem.processHospitalVisit(characterState().injury, currentGold());

    if (result.success) {
      props.characterStore.healInjury();
      if (result.goldPaid > 0) props.inventoryStore.removeGold(result.goldPaid);
      if (result.billCreated) props.characterStore.addHospitalBill(result.billAmount);
      props.characterStore.fullHeal();
      showNotification('CRITICAL_REPAIR_SUCCESS: Integrity Restored', 'success');
    } else {
      showNotification(`ERROR: ${result.message}`, 'error');
    }
  };

  const handleUsePotionHealing = () => {
    if (props.locked) {
      showNotification('SYSTEM_LOCKED: Mission in progress', 'error');
      return;
    }

    if (!characterState().injury.isInjured) {
      showNotification('INTEGRITY_STABLE: No trauma detected', 'info');
      return;
    }

    const potion = healingPotions()[0] as ConsumableItem;
    if (!potion) return;

    props.characterStore.healInjury();
    if (potion.healAmount) props.characterStore.heal(potion.healAmount);
    props.inventoryStore.removeItem(potion.id, 1);
    showNotification(`MODULE_EXECUTED: ${potion.name} applied`, 'success');
  };

  const handlePayBill = () => {
    if (props.locked) {
      showNotification('SYSTEM_LOCKED: Financial systems offline', 'error');
      return;
    }

    const result = hospitalSystem.processBillPayment(characterState().hospitalBill, currentGold());

    if (result.success) {
      props.inventoryStore.removeGold(result.amountPaid);
      props.characterStore.payHospitalBill();
      showNotification('TRANSACTION_COMPLETE: Debt resolved', 'success');
    } else {
      showNotification(`TRANSACTION_FAILED: ${result.message}`, 'error');
    }
  };

  const injurySeverityConfig = createMemo(() => {
    if (!characterState().injury.isInjured) return null;
    return INJURY_SEVERITY_CONFIG[characterState().injury.severity];
  });

  return (
    <div class="flex flex-col h-full bg-[#080810] text-gray-200 p-8 space-y-8 animate-fade-in relative overflow-hidden">
      {/* Background Decor */}
      <div class="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-danger/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <div class="flex items-start justify-between relative z-10">
        <div class="space-y-1">
          <h2 class="text-3xl font-display font-black tracking-tighter uppercase italic text-primary-500">The Great Sanctuary</h2>
          <p class="text-xs font-mono text-gray-500 uppercase tracking-widest">Restoration of Spirit & Mend of Flesh</p>
        </div>

        <div class="flex items-center gap-6">
          <div class="text-right px-4 py-2 rounded-2xl bg-primary-500/5 border border-primary-500/10">
            <span class="block text-[8px] font-mono text-primary-500/50 uppercase tracking-widest">Imperial Gold</span>
            <span class="text-xl font-mono font-bold text-primary-400">💰 {currentGold()}</span>
          </div>
          <Show when={props.onClose}>
            <button onClick={props.onClose} class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <span class="text-xl">×</span>
            </button>
          </Show>
        </div>
      </div>

      {/* Main Panel Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

        {/* Left: Injury Status */}
        <div class="lg:col-span-12">
          <div class="glass-panel p-6 border-white/5 bg-white/2 relative overflow-hidden rounded-2xl">
            <div class="flex items-start justify-between mb-8">
              <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-primary-500/10 pb-2 w-full">Vitals Inspection</h3>
            </div>

            <Show
              when={characterState().injury.isInjured}
              fallback={
                <div class="flex flex-col items-center justify-center py-12 space-y-4">
                  <div class="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl animate-pulse">
                    ⚔️
                  </div>
                  <div class="text-center">
                    <p class="text-xl font-display font-bold text-emerald-400 uppercase tracking-widest">Spirit Fully Restored</p>
                    <p class="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-2 italic">"You are ready for the path ahead, traveler."</p>
                  </div>
                </div>
              }
            >
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 space-y-6">
                  <div class="flex items-center gap-6">
                    <div class="w-24 h-24 rounded-3xl bg-danger/10 border border-danger/20 flex items-center justify-center text-5xl shadow-[0_0_20px_rgba(225,29,72,0.1)]">
                      🤕
                    </div>
                    <div>
                      <span class="text-[9px] font-mono text-danger font-bold uppercase tracking-widest bg-danger/10 px-2 py-0.5 rounded border border-danger/20">Affliction: {characterState().injury.severity.toUpperCase()}</span>
                      <h4 class="text-3xl font-display font-bold text-white mt-2 uppercase tracking-tight">{injurySeverityConfig()?.displayName}</h4>
                      <p class="text-sm text-gray-400 mt-1 italic leading-relaxed">{injurySeverityConfig()?.description}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-black/40 border border-white/5 p-4 rounded-2xl">
                      <span class="block text-[9px] font-mono text-gray-500 uppercase mb-1">Combat Penalty</span>
                      <span class="text-2xl font-display font-bold text-danger">-{characterState().injury.successPenalty}% SUCCESS</span>
                    </div>
                    <div class="bg-black/40 border border-white/5 p-4 rounded-2xl">
                      <span class="block text-[9px] font-mono text-gray-500 uppercase mb-1">Status</span>
                      <span class="text-2xl font-display font-bold text-gray-300">CRITICAL</span>
                    </div>
                  </div>
                </div>

                <div class="space-y-4 flex flex-col justify-center">
                  <button
                    onClick={handleHospitalTreatment}
                    disabled={props.locked}
                    class="btn-primary w-full py-4 text-sm font-bold shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                  >
                    BLESSED HEALING ({treatmentCost()}G)
                  </button>

                  <button
                    onClick={handleUsePotionHealing}
                    disabled={props.locked || !hasHealingPotion()}
                    class={`w-full py-4 rounded-xl border-2 font-bold text-sm transition-all uppercase tracking-widest
                        ${hasHealingPotion()
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'border-white/5 bg-white/2 text-gray-600 cursor-not-allowed'}
                      `}
                  >
                    USET POTION ({healingPotions().length})
                  </button>

                  <Show when={!canAffordTreatment()}>
                    <p class="text-[9px] font-mono text-gray-500 text-center uppercase tracking-tight italic mt-2">"The Sanctuary never turns away the wounded. Debt is accepted."</p>
                  </Show>
                </div>
              </div>
            </Show>
          </div>
        </div>

        {/* Bottom Panel: Debt & Info */}
        <div class="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hospital Bills */}
          <Show when={characterState().hospitalBill}>
            <div class="glass-panel p-6 border-danger/30 bg-danger/5 rounded-2xl">
              <div class="flex items-center gap-3 mb-6">
                <span class="text-2xl">⚖️</span>
                <h3 class="text-sm font-bold text-danger uppercase tracking-widest font-display">Outstanding Tithing</h3>
              </div>

              <div class="bg-black/40 rounded-2xl p-6 border border-white/5 mb-6 space-y-4">
                <div class="flex justify-between items-end border-b border-white/5 pb-4">
                  <span class="text-xs font-mono text-gray-500 uppercase">Sanctuary Debt</span>
                  <span class="text-3xl font-display font-black text-white">{characterState().hospitalBill?.amount}G</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="font-mono text-gray-500 uppercase">Sin Penalty</span>
                  <span class="font-bold text-danger">-{characterState().hospitalBill?.penalty}% SUCCESS</span>
                </div>
              </div>

              <button
                onClick={handlePayBill}
                disabled={props.locked || !canAffordBillPayment()}
                class={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all
                    ${canAffordBillPayment()
                    ? 'bg-danger text-white hover:bg-rose-700 shadow-[0_0_20px_rgba(225,29,72,0.2)]'
                    : 'bg-white/5 border border-white/10 text-gray-600 cursor-not-allowed'}
                  `}
              >
                Settle Debt
              </button>
            </div>
          </Show>

          {/* Medical Protocols */}
          <div class={`glass-panel p-6 border-white/5 bg-white/2 rounded-2xl flex flex-col justify-center ${!characterState().hospitalBill ? 'md:col-span-2 max-w-2xl mx-auto' : ''}`}>
            <h3 class="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-4 font-display">Sanctuary Laws</h3>
            <ul class="space-y-3 text-[10px] font-mono text-gray-400 uppercase tracking-tight">
              <li class="flex gap-3"><span class="text-primary-500">◈</span> Defeat in battle may leave lasting scars on the spirit.</li>
              <li class="flex gap-3"><span class="text-primary-500">◈</span> Wounded adventurers find their focus shattered (Success Penalty).</li>
              <li class="flex gap-3"><span class="text-primary-500">◈</span> Healing is a right, but gold is needed for the great candles.</li>
              <li class="flex gap-3"><span class="text-primary-500">◈</span> Debt to the sanctuary is a burden upon one's soul.</li>
              <li class="flex gap-3"><span class="text-primary-500">◈</span> Alchemical elixirs are a traveler's best friend.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Global Notifications */}
      <Show when={notification()}>
        <div class="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div class={`
              backdrop-blur-xl border-2 px-8 py-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-4
              ${notificationType() === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
              notificationType() === 'error' ? 'bg-danger/10 border-danger/30 text-danger' :
                'bg-primary-500/10 border-primary-500/30 text-primary-400'}
           `}>
            <div class={`w-2 h-2 rounded-full animate-pulse ${notificationType() === 'success' ? 'bg-emerald-500' : notificationType() === 'error' ? 'bg-danger' : 'bg-primary-500'}`}></div>
            <span class="text-xs font-display font-bold tracking-widest uppercase">{notification()}</span>
          </div>
        </div>
      </Show>
    </div>
  );
};
