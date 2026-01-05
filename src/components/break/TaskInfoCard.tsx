/**
 * TaskInfoCard Component
 * Displays detailed task information including rewards and requirements
 */

import { Component } from 'solid-js';
import type { TaskConfig, RiskLevel } from '../../core/types/tasks';

interface TaskInfoCardProps {
  config: TaskConfig;
  riskLevel: RiskLevel;
}

/**
 * TaskInfoCard - Display task details and rewards
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
    <div class="task-info-card">
      <div class="task-info-card__header">
        <h3 class="task-info-card__name">{props.config.name}</h3>
        <span class="task-info-card__stat-badge">
          {props.config.primaryStat.charAt(0).toUpperCase() + props.config.primaryStat.slice(1)}
          -based
        </span>
      </div>

      <p class="task-info-card__description">{props.config.description}</p>

      <div class="task-info-card__section">
        <h4 class="section-title">Rewards (at {props.riskLevel} risk)</h4>
        <div class="rewards-grid">
          <div class="reward-item">
            <span class="reward-item__icon">💰</span>
            <div class="reward-item__info">
              <span class="reward-item__label">Gold</span>
              <span class="reward-item__value">
                {rewards().gold.min}-{rewards().gold.max}
              </span>
            </div>
          </div>

          <div class="reward-item">
            <span class="reward-item__icon">⭐</span>
            <div class="reward-item__info">
              <span class="reward-item__label">XP</span>
              <span class="reward-item__value">
                {rewards().xp.min}-{rewards().xp.max}
              </span>
            </div>
          </div>

          <div class="reward-item">
            <span class="reward-item__icon">🔨</span>
            <div class="reward-item__info">
              <span class="reward-item__label">Materials</span>
              <span class="reward-item__value">
                {rewards().materials.min}-{rewards().materials.max}
              </span>
            </div>
          </div>

          <div class="reward-item">
            <span class="reward-item__icon">📦</span>
            <div class="reward-item__info">
              <span class="reward-item__label">Chests</span>
              <span class="reward-item__value">{rewards().chests}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="task-info-card__section">
        <h4 class="section-title">Risks</h4>
        <div class="risks-info">
          <div class="risk-stat">
            <span class="risk-stat__label">Base Success:</span>
            <span class="risk-stat__value">{props.config.baseSuccessChance}%</span>
          </div>
          <div class="risk-stat">
            <span class="risk-stat__label">Injury Chance on Failure:</span>
            <span class="risk-stat__value risk-stat__value--danger">
              {props.config.injuryChanceOnFailure}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
