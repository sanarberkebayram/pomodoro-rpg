/**
 * Raid Task Implementation
 * High-risk, combat-focused task with emphasis on loot and gold
 */

import { BaseTask, type TaskEventTemplate, type TaskMilestone } from './BaseTask';
import { RAID_CONFIG } from '../../../data/tasks/taskConfigs';
import type { TaskType, TaskConfig } from '../../../core/types/tasks';

/**
 * Raid Task
 * Focus on combat, high-value loot, and dangerous encounters
 */
export class RaidTask extends BaseTask {
  readonly taskType: TaskType = 'raid';
  readonly config: TaskConfig = RAID_CONFIG;

  readonly eventTemplates: TaskEventTemplate[] = [
    // Positive events (combat victories, loot finds)
    {
      id: 'raid_treasure_vault',
      severity: 'info',
      messages: [
        'You breach the treasure vault - gold glitters everywhere!',
        'A hidden cache of riches awaits your claiming!',
        "The enemy's wealth is now yours!",
      ],
      effects: {
        goldModifier: 15,
        successChanceModifier: 5,
      },
      weight: 12,
    },
    {
      id: 'raid_enemy_defeated',
      severity: 'info',
      messages: [
        'The guards fall before your might!',
        'Enemy forces routed - the path is clear!',
        'Victory! Their defenses crumble!',
      ],
      effects: {
        successChanceModifier: 8,
        goldModifier: 5,
      },
      weight: 15,
    },
    {
      id: 'raid_weak_defenses',
      severity: 'info',
      messages: [
        'Their defenses are weaker than expected!',
        'You find a gap in their fortifications.',
        'The guards are few and unprepared.',
      ],
      effects: {
        successChanceModifier: 10,
      },
      weight: 18,
    },
    {
      id: 'raid_weapons_cache',
      severity: 'info',
      messages: [
        'You discover their armory - fine weapons within!',
        'Equipment upgrades found in the barracks!',
        'Valuable gear left unguarded!',
      ],
      effects: {
        goldModifier: 10,
        materialsModifier: 2,
      },
      weight: 14,
    },

    // Neutral/Combat flavor
    {
      id: 'raid_combat_flavor',
      severity: 'flavor',
      messages: [
        'Steel clashes against steel.',
        'You press forward through enemy territory.',
        'The sound of battle echoes through the halls.',
        'Your weapon finds its mark again and again.',
      ],
      effects: {},
      weight: 20,
    },
    {
      id: 'raid_infiltration',
      severity: 'flavor',
      messages: [
        'You move silently through shadowed corridors.',
        'Every corner could hide an ambush.',
        'The fortress interior is vast and foreboding.',
        'Enemy movements echo in the distance.',
      ],
      effects: {},
      weight: 18,
    },

    // Negative events (injuries, setbacks, reinforcements)
    {
      id: 'raid_tough_resistance',
      severity: 'warning',
      messages: [
        'The enemy fights back fiercely!',
        'Reinforcements arrive - the battle intensifies!',
        'Their captain leads a counterattack!',
      ],
      effects: {
        successChanceModifier: -8,
        healthModifier: -5,
      },
      weight: 15,
    },
    {
      id: 'raid_trap_triggered',
      severity: 'warning',
      messages: [
        'You trigger a concealed trap!',
        "An alarm sounds - they know you're here!",
        'Arrows rain down from hidden murder holes!',
      ],
      effects: {
        healthModifier: -10,
        successChanceModifier: -5,
      },
      weight: 12,
    },
    {
      id: 'raid_elite_guard',
      severity: 'warning',
      messages: [
        'An elite guard blocks your path!',
        'You face their strongest warrior!',
        'The champion steps forward to challenge you!',
      ],
      effects: {
        healthModifier: -8,
        successChanceModifier: -10,
      },
      weight: 10,
    },
    {
      id: 'raid_setback',
      severity: 'warning',
      messages: [
        "You're forced to retreat and regroup!",
        'Their defenses were better than scouted!',
        'The raid encounters unexpected complications!',
      ],
      effects: {
        successChanceModifier: -6,
        goldModifier: -5,
      },
      weight: 11,
    },

    // Critical events (rare, high impact)
    {
      id: 'raid_legendary_loot',
      severity: 'critical',
      messages: [
        "You discover the enemy commander's personal vault!",
        'Legendary treasures lie before you - the raid of a lifetime!',
        'The war chest stands open - riches beyond imagination!',
      ],
      effects: {
        goldModifier: 30,
        materialsModifier: 5,
        successChanceModifier: 15,
      },
      weight: 2,
      minProgress: 60,
    },
    {
      id: 'raid_ambush',
      severity: 'critical',
      messages: [
        "It's a trap! Enemies surround you!",
        "You've walked into a coordinated ambush!",
        'The entire garrison descends upon you!',
      ],
      effects: {
        healthModifier: -25,
        successChanceModifier: -15,
        goldModifier: -10,
      },
      weight: 4,
    },
    {
      id: 'raid_reinforcements_arrive',
      severity: 'critical',
      messages: [
        'Enemy reinforcements flood in from all sides!',
        'A war horn sounds - massive reinforcements incoming!',
      ],
      effects: {
        healthModifier: -15,
        successChanceModifier: -20,
      },
      weight: 3,
      minProgress: 40,
    },
  ];

  readonly milestones: TaskMilestone[] = [
    {
      progress: 20,
      description: 'Breached the outer defenses - the raid begins in earnest.',
      triggered: false,
    },
    {
      progress: 50,
      description: 'Reached the inner sanctum - the highest value targets await.',
      triggered: false,
    },
    {
      progress: 80,
      description: 'Extraction phase - time to escape with the loot.',
      triggered: false,
    },
  ];

  getProgressFlavor(progress: number): string {
    if (progress < 15) {
      return 'Approaching the target under cover of darkness.';
    } else if (progress < 30) {
      return 'Breaching outer defenses, initial resistance encountered.';
    } else if (progress < 50) {
      return 'Fighting through enemy territory, securing key positions.';
    } else if (progress < 65) {
      return 'Deep within enemy stronghold, high-value targets in sight.';
    } else if (progress < 80) {
      return 'Claiming loot and securing objectives amidst fierce combat.';
    } else if (progress < 95) {
      return 'Fighting a tactical retreat, protecting acquired treasure.';
    } else {
      return 'Final push to escape with the spoils of war.';
    }
  }

  getStartMessage(): string {
    const messages = [
      'The raid begins - steel yourself for battle!',
      'You approach the enemy stronghold under cover of night.',
      'Time to strike - for glory and gold!',
      'The fortress stands before you, ripe for plunder.',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getCompletionFlavor(outcome: 'success' | 'partial' | 'failure'): string {
    if (outcome === 'success') {
      const messages = [
        'Victory! The raid succeeds brilliantly - legendary loot secured!',
        'You emerge victorious, weighed down by plunder!',
        'A perfect raid - the enemy never knew what hit them!',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else if (outcome === 'partial') {
      const messages = [
        'You escape with some treasure, but casualties were high.',
        'Partial success - you got out alive, but not with everything.',
        'The raid yields results, though not without cost.',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = [
        'The raid fails catastrophically - you barely escape alive!',
        'Overwhelmed by enemy forces, you retreat empty-handed.',
        'Defeat - the enemy was too strong, the raid a disaster.',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }
}

/**
 * Create a new Raid task instance
 */
export function createRaidTask(): RaidTask {
  return new RaidTask();
}
