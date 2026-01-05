/**
 * Weapon Item Templates
 * Base templates for generating procedural weapons
 */

import type { ItemTemplate, WeaponItem } from '../../core/types/items';

/**
 * Weapon item templates for procedural generation
 * Each template defines base properties and stat ranges
 */
export const WEAPON_TEMPLATES: Record<string, ItemTemplate> = {
  // SWORDS - Balanced weapons with moderate power and focus
  'iron-sword': {
    id: 'iron-sword',
    name: 'Iron Sword',
    description: 'A reliable blade forged from quality iron.',
    type: 'weapon',
    icon: 'weapon-sword-iron',
    weaponType: 'sword',
    statRanges: {
      power: [3, 6],
      defense: [0, 1],
      focus: [1, 3],
    },
  },
  'steel-sword': {
    id: 'steel-sword',
    name: 'Steel Sword',
    description: 'A well-crafted sword made from hardened steel.',
    type: 'weapon',
    icon: 'weapon-sword-steel',
    weaponType: 'sword',
    statRanges: {
      power: [5, 9],
      defense: [1, 2],
      focus: [2, 4],
    },
  },
  'silver-sword': {
    id: 'silver-sword',
    name: 'Silver Sword',
    description: 'An elegant blade with silver inlay, excellent against dark foes.',
    type: 'weapon',
    icon: 'weapon-sword-silver',
    weaponType: 'sword',
    statRanges: {
      power: [7, 12],
      defense: [1, 3],
      focus: [3, 6],
      luck: [1, 2],
    },
  },

  // AXES - High power, low focus
  'hand-axe': {
    id: 'hand-axe',
    name: 'Hand Axe',
    description: 'A small, versatile axe for combat and utility.',
    type: 'weapon',
    icon: 'weapon-axe-hand',
    weaponType: 'axe',
    statRanges: {
      power: [5, 8],
      defense: [0, 1],
      focus: [0, 2],
    },
  },
  'battle-axe': {
    id: 'battle-axe',
    name: 'Battle Axe',
    description: 'A heavy axe designed for devastating strikes.',
    type: 'weapon',
    icon: 'weapon-axe-battle',
    weaponType: 'axe',
    statRanges: {
      power: [8, 13],
      defense: [0, 2],
      focus: [0, 1],
    },
  },
  'great-axe': {
    id: 'great-axe',
    name: 'Great Axe',
    description: 'A massive two-handed axe that cleaves through armor.',
    type: 'weapon',
    icon: 'weapon-axe-great',
    weaponType: 'axe',
    statRanges: {
      power: [12, 18],
      defense: [1, 3],
      focus: [0, 1],
    },
  },

  // STAFFS - High focus, moderate power, bonus luck
  'wooden-staff': {
    id: 'wooden-staff',
    name: 'Wooden Staff',
    description: 'A simple staff carved from oak wood.',
    type: 'weapon',
    icon: 'weapon-staff-wooden',
    weaponType: 'staff',
    statRanges: {
      power: [2, 4],
      focus: [3, 6],
      luck: [1, 2],
    },
  },
  'mystic-staff': {
    id: 'mystic-staff',
    name: 'Mystic Staff',
    description: 'A staff imbued with arcane energy.',
    type: 'weapon',
    icon: 'weapon-staff-mystic',
    weaponType: 'staff',
    statRanges: {
      power: [4, 7],
      focus: [5, 9],
      luck: [2, 4],
    },
  },
  'crystal-staff': {
    id: 'crystal-staff',
    name: 'Crystal Staff',
    description: 'A powerful staff topped with a glowing crystal.',
    type: 'weapon',
    icon: 'weapon-staff-crystal',
    weaponType: 'staff',
    statRanges: {
      power: [6, 10],
      focus: [8, 14],
      luck: [3, 6],
    },
  },

  // BOWS - Moderate power, high focus
  'short-bow': {
    id: 'short-bow',
    name: 'Short Bow',
    description: 'A compact bow for quick, accurate shots.',
    type: 'weapon',
    icon: 'weapon-bow-short',
    weaponType: 'bow',
    statRanges: {
      power: [3, 5],
      focus: [4, 7],
      luck: [0, 1],
    },
  },
  'long-bow': {
    id: 'long-bow',
    name: 'Long Bow',
    description: 'A traditional bow with impressive range and power.',
    type: 'weapon',
    icon: 'weapon-bow-long',
    weaponType: 'bow',
    statRanges: {
      power: [5, 9],
      focus: [6, 10],
      luck: [1, 2],
    },
  },
  'composite-bow': {
    id: 'composite-bow',
    name: 'Composite Bow',
    description: 'A masterfully crafted bow with superior performance.',
    type: 'weapon',
    icon: 'weapon-bow-composite',
    weaponType: 'bow',
    statRanges: {
      power: [8, 13],
      focus: [9, 15],
      luck: [2, 4],
    },
  },

  // DAGGERS - Fast, high luck, low power
  'iron-dagger': {
    id: 'iron-dagger',
    name: 'Iron Dagger',
    description: 'A small blade perfect for quick strikes.',
    type: 'weapon',
    icon: 'weapon-dagger-iron',
    weaponType: 'dagger',
    statRanges: {
      power: [2, 4],
      focus: [2, 4],
      luck: [2, 5],
    },
  },
  stiletto: {
    id: 'stiletto',
    name: 'Stiletto',
    description: 'A thin, deadly blade designed for precision.',
    type: 'weapon',
    icon: 'weapon-dagger-stiletto',
    weaponType: 'dagger',
    statRanges: {
      power: [3, 6],
      focus: [4, 7],
      luck: [4, 8],
    },
  },
  'shadow-blade': {
    id: 'shadow-blade',
    name: 'Shadow Blade',
    description: 'A mysterious dagger that seems to fade in and out of sight.',
    type: 'weapon',
    icon: 'weapon-dagger-shadow',
    weaponType: 'dagger',
    statRanges: {
      power: [5, 9],
      focus: [6, 11],
      luck: [6, 12],
    },
  },

  // MACES - High power and defense, low focus
  'wooden-club': {
    id: 'wooden-club',
    name: 'Wooden Club',
    description: 'A simple but effective bludgeoning weapon.',
    type: 'weapon',
    icon: 'weapon-mace-club',
    weaponType: 'mace',
    statRanges: {
      power: [4, 6],
      defense: [1, 2],
      focus: [0, 1],
    },
  },
  'iron-mace': {
    id: 'iron-mace',
    name: 'Iron Mace',
    description: 'A heavy flanged mace for crushing armor.',
    type: 'weapon',
    icon: 'weapon-mace-iron',
    weaponType: 'mace',
    statRanges: {
      power: [6, 10],
      defense: [2, 4],
      focus: [0, 2],
    },
  },
  'holy-mace': {
    id: 'holy-mace',
    name: 'Holy Mace',
    description: 'A blessed mace that radiates divine energy.',
    type: 'weapon',
    icon: 'weapon-mace-holy',
    weaponType: 'mace',
    statRanges: {
      power: [9, 14],
      defense: [3, 6],
      focus: [2, 4],
      luck: [1, 3],
    },
  },

  // SPEARS - Balanced, slight defense bonus
  spear: {
    id: 'spear',
    name: 'Spear',
    description: 'A simple wooden spear with an iron tip.',
    type: 'weapon',
    icon: 'weapon-spear-basic',
    weaponType: 'spear',
    statRanges: {
      power: [4, 7],
      defense: [1, 3],
      focus: [2, 4],
    },
  },
  pike: {
    id: 'pike',
    name: 'Pike',
    description: 'A long spear designed to keep enemies at bay.',
    type: 'weapon',
    icon: 'weapon-spear-pike',
    weaponType: 'spear',
    statRanges: {
      power: [6, 10],
      defense: [2, 5],
      focus: [3, 6],
    },
  },
  halberd: {
    id: 'halberd',
    name: 'Halberd',
    description: 'A versatile polearm with axe and spear capabilities.',
    type: 'weapon',
    icon: 'weapon-spear-halberd',
    weaponType: 'spear',
    statRanges: {
      power: [9, 15],
      defense: [3, 7],
      focus: [4, 8],
    },
  },

  // CROSSBOWS - High focus and luck, moderate power
  crossbow: {
    id: 'crossbow',
    name: 'Crossbow',
    description: 'A mechanical bow with deadly precision.',
    type: 'weapon',
    icon: 'weapon-bow-crossbow',
    weaponType: 'bow',
    statRanges: {
      power: [6, 11],
      focus: [7, 12],
      luck: [2, 5],
    },
  },
  'heavy-crossbow': {
    id: 'heavy-crossbow',
    name: 'Heavy Crossbow',
    description: 'A powerful crossbow that pierces through armor.',
    type: 'weapon',
    icon: 'weapon-bow-heavy-crossbow',
    weaponType: 'bow',
    statRanges: {
      power: [10, 16],
      focus: [9, 15],
      luck: [3, 7],
    },
  },

  // HAMMERS - Very high power, moderate defense, very low focus
  warhammer: {
    id: 'warhammer',
    name: 'Warhammer',
    description: 'A devastating hammer designed to crush armor and bone.',
    type: 'weapon',
    icon: 'weapon-mace-warhammer',
    weaponType: 'mace',
    statRanges: {
      power: [10, 16],
      defense: [2, 5],
      focus: [0, 1],
    },
  },
  'thunder-hammer': {
    id: 'thunder-hammer',
    name: 'Thunder Hammer',
    description: 'A legendary hammer that crackles with lightning.',
    type: 'weapon',
    icon: 'weapon-mace-thunder',
    weaponType: 'mace',
    statRanges: {
      power: [14, 22],
      defense: [3, 8],
      focus: [1, 3],
      luck: [2, 5],
    },
  },

  // EXOTIC SWORDS - Unique stat distributions
  scimitar: {
    id: 'scimitar',
    name: 'Scimitar',
    description: 'A curved blade favored by desert warriors.',
    type: 'weapon',
    icon: 'weapon-sword-scimitar',
    weaponType: 'sword',
    statRanges: {
      power: [6, 10],
      defense: [0, 2],
      focus: [4, 8],
      luck: [3, 6],
    },
  },
  katana: {
    id: 'katana',
    name: 'Katana',
    description: 'A masterfully forged blade with exceptional sharpness.',
    type: 'weapon',
    icon: 'weapon-sword-katana',
    weaponType: 'sword',
    statRanges: {
      power: [8, 14],
      defense: [1, 3],
      focus: [6, 12],
      luck: [2, 5],
    },
  },

  // POLEARMS - Extended reach weapons
  glaive: {
    id: 'glaive',
    name: 'Glaive',
    description: 'A single-edged blade mounted on a long pole.',
    type: 'weapon',
    icon: 'weapon-spear-glaive',
    weaponType: 'spear',
    statRanges: {
      power: [7, 12],
      defense: [2, 6],
      focus: [3, 7],
    },
  },
  trident: {
    id: 'trident',
    name: 'Trident',
    description: 'A three-pronged spear with excellent balance.',
    type: 'weapon',
    icon: 'weapon-spear-trident',
    weaponType: 'spear',
    statRanges: {
      power: [8, 13],
      defense: [3, 7],
      focus: [4, 9],
      luck: [1, 3],
    },
  },
};

/**
 * Get weapon template by ID
 */
export function getWeaponTemplate(id: string): ItemTemplate | null {
  return WEAPON_TEMPLATES[id] ?? null;
}

/**
 * Get all weapon templates
 */
export function getAllWeaponTemplates(): ItemTemplate[] {
  return Object.values(WEAPON_TEMPLATES);
}

/**
 * Get weapon templates by weapon type
 */
export function getWeaponTemplatesByType(weaponType: WeaponItem['weaponType']): ItemTemplate[] {
  return Object.values(WEAPON_TEMPLATES).filter((t) => t.weaponType === weaponType);
}

/**
 * Get random weapon template
 */
export function getRandomWeaponTemplate(): ItemTemplate {
  const templates = getAllWeaponTemplates();
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}
