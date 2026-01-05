import { Component } from 'solid-js';
import type { TaskConfig, RiskLevel } from '../../core/types/tasks';

interface TaskInfoCardProps {
  config: TaskConfig;
  riskLevel: RiskLevel;
}

/**
 * TaskInfoCard - Modern display for task details and rewards
 */
export const TaskInfoCard: Component<TaskInfoCardProps> = (props) => {
  const getAdjustedRewards = () => {
    const multiplier = props.config.riskModifiers[props.riskLevel].rewardMultiplier;
    const base = props.config.rewards;

    return {
      gold: {
        min: Math.floor(base.gold.min * multiplier),
        max: Math.floor(base.gold.max * multiplier),
      },
      xp: {
        min: Math.floor(base.xp.min * multiplier),
        max: Math.floor(base.xp.max * multiplier),
      },
      materials: {
        min: Math.floor(base.materials.min * multiplier),
        max: Math.floor(base.materials.max * multiplier),
      },
      chests: base.chests,
    };
  };

  const rewards = () => getAdjustedRewards();

  return (
    <div class="glass-panel p-8 border-primary-500/10 animate-fade-in relative overflow-hidden rounded-3xl bg-[#080810]/60">
      <div class="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <span class="text-9xl grayscale brightness-200">⚔️</span>
      </div>

      <div class="flex items-start justify-between mb-6">
        <div class="space-y-2">
          <h3 class="text-3xl font-display font-black text-primary-500 uppercase italic tracking-tighter leading-none">{props.config.name}</h3>
          <span class="inline-block text-[9px] uppercase tracking-[0.2em] font-black text-primary-400 bg-primary-500/10 px-3 py-1 rounded border border-primary-500/20">
            {props.config.primaryStat} SPECIALIST
          </span>
        </div>
      </div>

      <p class="text-gray-400 text-sm leading-relaxed mb-10 max-w-[85%] font-medium italic opacity-80">
        "{props.config.description}"
      </p>

      <div class="space-y-8">
        <div>
          <h4 class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6 border-b border-primary-500/10 pb-2">Quest Spoils</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center gap-4 transition-all duration-300 hover:border-primary-500/30 hover:bg-black/60">
              <span class="text-3xl drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">💰</span>
              <div>
                <span class="block text-[8px] text-gray-600 uppercase font-black tracking-widest">Gold</span>
                <span class="text-white font-mono font-bold text-lg">{rewards().gold.min}-{rewards().gold.max}</span>
              </div>
            </div>

            <div class="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center gap-4 transition-all duration-300 hover:border-primary-500/30 hover:bg-black/60">
              <span class="text-3xl drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">⭐</span>
              <div>
                <span class="block text-[8px] text-gray-600 uppercase font-black tracking-widest">Spirit</span>
                <span class="text-white font-mono font-bold text-lg">{rewards().xp.min}-{rewards().xp.max}</span>
              </div>
            </div>

            <div class="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center gap-4 transition-all duration-300 hover:border-primary-500/30 hover:bg-black/60">
              <span class="text-3xl drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">🔨</span>
              <div>
                <span class="block text-[8px] text-gray-600 uppercase font-black tracking-widest">Shards</span>
                <span class="text-white font-mono font-bold text-lg">{rewards().materials.min}-{rewards().materials.max}</span>
              </div>
            </div>

            <div class="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center gap-4 transition-all duration-300 hover:border-primary-500/30 hover:bg-black/60">
              <span class="text-3xl drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">📦</span>
              <div>
                <span class="block text-[8px] text-gray-600 uppercase font-black tracking-widest">Coffers</span>
                <span class="text-white font-mono font-bold text-lg">×{rewards().chests}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
          <div>
            <span class="block text-[10px] text-gray-500 uppercase font-bold mb-1">Base Success</span>
            <span class="text-emerald-400 font-bold font-mono">{props.config.baseSuccessChance}%</span>
          </div>
          <div>
            <span class="block text-[10px] text-gray-500 uppercase font-bold mb-1">Hazard Risk</span>
            <span class="text-danger font-bold font-mono">{props.config.injuryChanceOnFailure}% Failure Injury</span>
          </div>
        </div>
      </div>
    </div>
  );
};
