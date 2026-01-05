/**
 * Expedition Task Implementation
 * Stable, exploration-focused task with emphasis on materials gathering
 */

import { BaseTask, type TaskEventTemplate, type TaskMilestone } from './BaseTask';
import { EXPEDITION_CONFIG } from '../../../data/tasks/taskConfigs';
import type { TaskType, TaskConfig } from '../../../core/types/tasks';

/**
 * Expedition Task
 * Focus on exploration, materials gathering, and steady progression
 */
export class ExpeditionTask extends BaseTask {
  readonly taskType: TaskType = 'expedition';
  readonly config: TaskConfig = EXPEDITION_CONFIG;

  readonly eventTemplates: TaskEventTemplate[] = [
    // Positive events (higher weight for stable task)
    {
      id: 'expedition_treasure_find',
      severity: 'info',
      messages: [
        'You discover a hidden cache of materials!',
        'A glint catches your eye - valuable resources ahead!',
        'Your expedition uncovers a forgotten stash.',
      ],
      effects: {
        materialsModifier: 3,
        goldModifier: 5,
      },
      weight: 15,
    },
    {
      id: 'expedition_safe_path',
      severity: 'info',
      messages: [
        'You find a safe route forward.',
        'The terrain becomes more favorable.',
        'Clear skies and good fortune guide your way.',
      ],
      effects: {
        successChanceModifier: 5,
      },
      weight: 20,
    },
    {
      id: 'expedition_resource_node',
      severity: 'info',
      messages: [
        'You stumble upon a rich mineral deposit!',
        'Rare herbs grow abundantly in this area.',
        'An untouched resource vein lies before you.',
      ],
      effects: {
        materialsModifier: 5,
      },
      weight: 18,
    },
    {
      id: 'expedition_lucky_find',
      severity: 'info',
      messages: [
        'A traveling merchant left supplies behind!',
        'You find an abandoned camp with useful gear.',
        'Fortune smiles upon you - gold coins scattered here!',
      ],
      effects: {
        goldModifier: 10,
        successChanceModifier: 3,
      },
      weight: 12,
    },

    // Neutral/Flavor events
    {
      id: 'expedition_scenery',
      severity: 'flavor',
      messages: [
        'The landscape is breathtaking.',
        'You take a moment to rest and enjoy the view.',
        'Ancient ruins dot the horizon.',
        'Wildlife scurries past, unbothered by your presence.',
      ],
      effects: {},
      weight: 25,
    },
    {
      id: 'expedition_discovery',
      severity: 'flavor',
      messages: [
        'You sketch the local flora in your journal.',
        'An interesting rock formation catches your attention.',
        'You discover tracks from an unknown creature.',
        'The expedition notes are filling up nicely.',
      ],
      effects: {},
      weight: 20,
    },

    // Negative events (lower weight for stable expedition)
    {
      id: 'expedition_rough_terrain',
      severity: 'warning',
      messages: [
        'The terrain becomes treacherous.',
        'A sudden storm slows your progress.',
        'Dense undergrowth blocks the path forward.',
      ],
      effects: {
        successChanceModifier: -3,
      },
      weight: 10,
    },
    {
      id: 'expedition_wrong_path',
      severity: 'warning',
      messages: [
        'You realize you took a wrong turn.',
        'The map seems less accurate than expected.',
        'You backtrack after hitting a dead end.',
      ],
      effects: {
        successChanceModifier: -5,
      },
      weight: 8,
    },
    {
      id: 'expedition_equipment_issue',
      severity: 'warning',
      messages: [
        'Your rope frays - time to be more careful.',
        'A tool breaks, slowing your progress.',
        'Your pack tears, scattering some supplies.',
      ],
      effects: {
        materialsModifier: -2,
        successChanceModifier: -2,
      },
      weight: 7,
    },

    // Rare critical events
    {
      id: 'expedition_major_discovery',
      severity: 'critical',
      messages: [
        'You discover an untouched ancient cache!',
        'A legendary resource vein - this is the find of a lifetime!',
      ],
      effects: {
        materialsModifier: 10,
        goldModifier: 20,
        successChanceModifier: 10,
      },
      weight: 2,
      minProgress: 50,
    },
    {
      id: 'expedition_dangerous_wildlife',
      severity: 'critical',
      messages: [
        'A territorial beast blocks your path!',
        "You stumble into a predator's hunting ground.",
      ],
      effects: {
        healthModifier: -15,
        successChanceModifier: -10,
      },
      weight: 3,
    },
  ];

  readonly milestones: TaskMilestone[] = [
    {
      progress: 25,
      description: 'First quarter complete - the expedition is underway.',
      triggered: false,
    },
    {
      progress: 50,
      description: 'Halfway point reached - the path ahead is clearer.',
      triggered: false,
    },
    {
      progress: 75,
      description: 'Three quarters done - the destination is in sight.',
      triggered: false,
    },
  ];

  getProgressFlavor(progress: number): string {
    if (progress < 10) {
      return 'Setting out on the expedition, checking supplies and equipment.';
    } else if (progress < 25) {
      return 'Traversing the initial terrain, mapping the route ahead.';
    } else if (progress < 40) {
      return 'Steadily progressing through diverse landscapes.';
    } else if (progress < 60) {
      return 'Reaching deeper into unexplored territory.';
    } else if (progress < 75) {
      return 'Gathering resources and documenting discoveries.';
    } else if (progress < 90) {
      return 'Beginning the return journey with collected materials.';
    } else {
      return 'Final stretch - nearly back to base camp.';
    }
  }

  getStartMessage(): string {
    const messages = [
      'The expedition begins - adventure awaits beyond the horizon.',
      'You set out with determination, ready to explore the unknown.',
      "Maps unfurled, supplies checked - it's time to venture forth.",
      'The call of discovery pulls you into uncharted lands.',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getCompletionFlavor(outcome: 'success' | 'partial' | 'failure'): string {
    if (outcome === 'success') {
      const messages = [
        'The expedition was a resounding success! Materials overflow from your pack.',
        'You return triumphant, laden with valuable discoveries.',
        'Every objective met - this expedition will be remembered.',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else if (outcome === 'partial') {
      const messages = [
        'The expedition yields some results, though not all objectives were met.',
        'You return with modest findings - not quite what you hoped for.',
        'Partial success - some discoveries made, but challenges remain.',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = [
        'The expedition proves too challenging - you return empty-handed.',
        'Harsh conditions force an early retreat with nothing to show.',
        'Despite your best efforts, this expedition yields no results.',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }
}

/**
 * Create a new Expedition task instance
 */
export function createExpeditionTask(): ExpeditionTask {
  return new ExpeditionTask();
}
