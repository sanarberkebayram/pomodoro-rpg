/**
 * Armor Item Templates
 * Base templates for generating procedural armor
 */

import type { ItemTemplate, ArmorItem } from '../../core/types/items';

/**
 * Armor item templates for procedural generation
 * Each template defines base properties and stat ranges
 */
export const ARMOR_TEMPLATES: Record<string, ItemTemplate> = {
  // LIGHT ARMOR - Low defense, high focus and luck
  'leather-armor': {
    id: 'leather-armor',
    name: 'Leather Armor',
    description: 'Supple leather protection that allows freedom of movement.',
    type: 'armor',
    icon: 'armor-light-leather',
    armorType: 'light',
    statRanges: {
      defense: [2, 4],
      focus: [2, 4],
      luck: [1, 2],
    },
  },
  'studded-leather': {
    id: 'studded-leather',
    name: 'Studded Leather',
    description: 'Leather armor reinforced with metal studs.',
    type: 'armor',
    icon: 'armor-light-studded',
    armorType: 'light',
    statRanges: {
      defense: [3, 6],
      power: [0, 1],
      focus: [3, 6],
      luck: [2, 4],
    },
  },
  'shadow-leather': {
    id: 'shadow-leather',
    name: 'Shadow Leather',
    description: 'Dark leather armor favored by rogues and scouts.',
    type: 'armor',
    icon: 'armor-light-shadow',
    armorType: 'light',
    statRanges: {
      defense: [5, 9],
      power: [1, 3],
      focus: [5, 9],
      luck: [4, 7],
    },
  },

  // MEDIUM ARMOR - Balanced defense and other stats
  chainmail: {
    id: 'chainmail',
    name: 'Chainmail',
    description: 'Interlocking metal rings provide solid protection.',
    type: 'armor',
    icon: 'armor-medium-chainmail',
    armorType: 'medium',
    statRanges: {
      defense: [4, 7],
      power: [1, 3],
      focus: [1, 3],
    },
  },
  'scale-mail': {
    id: 'scale-mail',
    name: 'Scale Mail',
    description: 'Overlapping metal scales offer flexible defense.',
    type: 'armor',
    icon: 'armor-medium-scale',
    armorType: 'medium',
    statRanges: {
      defense: [6, 10],
      power: [2, 4],
      focus: [2, 4],
    },
  },
  brigandine: {
    id: 'brigandine',
    name: 'Brigandine',
    description: 'Armor plates riveted to leather or cloth backing.',
    type: 'armor',
    icon: 'armor-medium-brigandine',
    armorType: 'medium',
    statRanges: {
      defense: [8, 13],
      power: [3, 6],
      focus: [3, 6],
      luck: [1, 2],
    },
  },

  // HEAVY ARMOR - High defense and power, low focus
  'iron-plate': {
    id: 'iron-plate',
    name: 'Iron Plate',
    description: 'Heavy iron plates provide excellent protection.',
    type: 'armor',
    icon: 'armor-heavy-iron',
    armorType: 'heavy',
    statRanges: {
      defense: [7, 11],
      power: [2, 5],
      focus: [0, 1],
    },
  },
  'steel-plate': {
    id: 'steel-plate',
    name: 'Steel Plate',
    description: 'Full plate armor crafted from hardened steel.',
    type: 'armor',
    icon: 'armor-heavy-steel',
    armorType: 'heavy',
    statRanges: {
      defense: [10, 16],
      power: [4, 8],
      focus: [0, 2],
    },
  },
  'dragon-scale-plate': {
    id: 'dragon-scale-plate',
    name: 'Dragon Scale Plate',
    description: 'Legendary armor forged from dragon scales.',
    type: 'armor',
    icon: 'armor-heavy-dragon',
    armorType: 'heavy',
    statRanges: {
      defense: [14, 22],
      power: [6, 12],
      focus: [2, 4],
      luck: [2, 4],
    },
  },

  // ROBES - Low defense, high focus and luck (casters)
  'apprentice-robe': {
    id: 'apprentice-robe',
    name: 'Apprentice Robe',
    description: 'Simple robes worn by novice spellcasters.',
    type: 'armor',
    icon: 'armor-robe-apprentice',
    armorType: 'robe',
    statRanges: {
      defense: [1, 2],
      focus: [4, 7],
      luck: [2, 4],
    },
  },
  'mage-robe': {
    id: 'mage-robe',
    name: 'Mage Robe',
    description: 'Enchanted robes that enhance magical abilities.',
    type: 'armor',
    icon: 'armor-robe-mage',
    armorType: 'robe',
    statRanges: {
      defense: [2, 4],
      power: [1, 3],
      focus: [6, 11],
      luck: [3, 6],
    },
  },
  'archmage-robe': {
    id: 'archmage-robe',
    name: 'Archmage Robe',
    description: 'Masterwork robes woven with powerful enchantments.',
    type: 'armor',
    icon: 'armor-robe-archmage',
    armorType: 'robe',
    statRanges: {
      defense: [3, 6],
      power: [2, 5],
      focus: [10, 18],
      luck: [5, 10],
    },
  },

  // REINFORCED VARIANTS - Higher stats across the board
  'reinforced-leather': {
    id: 'reinforced-leather',
    name: 'Reinforced Leather',
    description: 'Master-crafted leather with exceptional quality.',
    type: 'armor',
    icon: 'armor-light-reinforced',
    armorType: 'light',
    statRanges: {
      defense: [6, 11],
      power: [2, 4],
      focus: [6, 11],
      luck: [5, 9],
    },
  },
  'enchanted-chainmail': {
    id: 'enchanted-chainmail',
    name: 'Enchanted Chainmail',
    description: 'Chainmail infused with protective magic.',
    type: 'armor',
    icon: 'armor-medium-enchanted',
    armorType: 'medium',
    statRanges: {
      defense: [9, 15],
      power: [3, 6],
      focus: [4, 7],
      luck: [2, 4],
    },
  },
  'blessed-plate': {
    id: 'blessed-plate',
    name: 'Blessed Plate',
    description: 'Holy armor blessed by divine powers.',
    type: 'armor',
    icon: 'armor-heavy-blessed',
    armorType: 'heavy',
    statRanges: {
      defense: [12, 19],
      power: [5, 10],
      focus: [2, 5],
      luck: [3, 6],
    },
  },
  'void-robe': {
    id: 'void-robe',
    name: 'Void Robe',
    description: 'Dark robes that channel mysterious void energies.',
    type: 'armor',
    icon: 'armor-robe-void',
    armorType: 'robe',
    statRanges: {
      defense: [4, 8],
      power: [3, 7],
      focus: [12, 20],
      luck: [6, 12],
    },
  },

  // STARTER ARMOR - Low stats for early game
  'cloth-tunic': {
    id: 'cloth-tunic',
    name: 'Cloth Tunic',
    description: 'Simple cloth offering minimal protection.',
    type: 'armor',
    icon: 'armor-light-cloth',
    armorType: 'light',
    statRanges: {
      defense: [1, 2],
      focus: [1, 2],
    },
  },
  'padded-armor': {
    id: 'padded-armor',
    name: 'Padded Armor',
    description: 'Quilted fabric provides basic defense.',
    type: 'armor',
    icon: 'armor-light-padded',
    armorType: 'light',
    statRanges: {
      defense: [2, 3],
      focus: [1, 3],
      luck: [0, 1],
    },
  },
  'hide-armor': {
    id: 'hide-armor',
    name: 'Hide Armor',
    description: 'Crude armor made from animal hides.',
    type: 'armor',
    icon: 'armor-light-hide',
    armorType: 'light',
    statRanges: {
      defense: [2, 4],
      power: [1, 2],
      focus: [0, 1],
    },
  },

  // SPECIALIZED ARMOR - Unique stat distributions
  'battle-harness': {
    id: 'battle-harness',
    name: 'Battle Harness',
    description: 'Tactical armor designed for sustained combat.',
    type: 'armor',
    icon: 'armor-medium-harness',
    armorType: 'medium',
    statRanges: {
      defense: [7, 12],
      power: [4, 8],
      focus: [2, 5],
    },
  },
  'scouts-garb': {
    id: 'scouts-garb',
    name: "Scout's Garb",
    description: 'Light armor optimized for reconnaissance.',
    type: 'armor',
    icon: 'armor-light-scout',
    armorType: 'light',
    statRanges: {
      defense: [4, 7],
      focus: [4, 8],
      luck: [3, 6],
    },
  },
};

/**
 * Get armor template by ID
 */
export function getArmorTemplate(id: string): ItemTemplate | null {
  return ARMOR_TEMPLATES[id] ?? null;
}

/**
 * Get all armor templates
 */
export function getAllArmorTemplates(): ItemTemplate[] {
  return Object.values(ARMOR_TEMPLATES);
}

/**
 * Get armor templates by armor type
 */
export function getArmorTemplatesByType(armorType: ArmorItem['armorType']): ItemTemplate[] {
  return Object.values(ARMOR_TEMPLATES).filter((t) => t.armorType === armorType);
}

/**
 * Get random armor template
 */
export function getRandomArmorTemplate(): ItemTemplate {
  const templates = getAllArmorTemplates();
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}
