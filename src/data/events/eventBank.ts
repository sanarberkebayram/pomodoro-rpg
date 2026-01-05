/**
 * Event Bank Data
 * Collection of 50+ event templates for dynamic gameplay during WORK phase
 */

import { EventTemplate } from '@/core/types/events';

/**
 * All event templates
 * Organized by category for easier management
 */
export const EVENT_TEMPLATES: EventTemplate[] = [
  // ============================================
  // FLAVOR EVENTS (Atmospheric, no real effect)
  // ============================================
  {
    templateId: 'flavor_bird_song',
    severity: 'flavor',
    category: 'fortune',
    messages: [
      'A bird lands nearby and sings a pleasant melody.',
      'The sound of distant birdsong fills the air.',
    ],
    effects: {},
    weight: 10,
    applicableTasks: [],
    repeatable: true,
  },
  {
    templateId: 'flavor_breeze',
    severity: 'flavor',
    category: 'fortune',
    messages: [
      'A gentle breeze passes through.',
      'The wind picks up slightly, rustling nearby foliage.',
    ],
    effects: {},
    weight: 10,
    applicableTasks: ['expedition'],
    repeatable: true,
  },
  {
    templateId: 'flavor_footsteps',
    severity: 'flavor',
    category: 'mystery',
    messages: [
      'You hear distant footsteps, but see nothing.',
      'Strange footsteps echo in the distance.',
    ],
    effects: {},
    weight: 8,
    applicableTasks: ['raid', 'expedition'],
    repeatable: true,
  },
  {
    templateId: 'flavor_shadow',
    severity: 'flavor',
    category: 'mystery',
    messages: [
      'A shadow passes overhead. Was it just a cloud?',
      'Something large briefly blocks out the sun.',
    ],
    effects: {},
    weight: 7,
    applicableTasks: [],
    repeatable: true,
  },
  {
    templateId: 'flavor_inscription',
    severity: 'flavor',
    category: 'mystery',
    messages: [
      'You notice ancient inscriptions on a nearby wall.',
      'Strange runes are carved into the stone here.',
    ],
    effects: {},
    weight: 6,
    applicableTasks: ['raid'],
    repeatable: true,
  },

  // ============================================
  // INFO EVENTS (Small effects)
  // ============================================
  {
    templateId: 'info_find_coins',
    severity: 'info',
    category: 'loot',
    messages: [
      'You find {gold} gold coins on the ground!',
      'A small pouch contains {gold} gold.',
      'Loose coins totaling {gold} gold are scattered about.',
    ],
    effects: {
      goldModifier: { min: 5, max: 15 },
    },
    visualCue: {
      type: 'sparkle',
      color: '#FFD700',
    },
    weight: 15,
    applicableTasks: [],
    repeatable: true,
  },
  {
    templateId: 'info_find_materials',
    severity: 'info',
    category: 'loot',
    messages: [
      'You gather {materials} useful materials.',
      'You find {materials} crafting materials lying around.',
    ],
    effects: {
      materialsModifier: { min: 2, max: 5 },
    },
    visualCue: {
      type: 'sparkle',
      color: '#8B4513',
    },
    weight: 15,
    applicableTasks: ['expedition', 'craft'],
    repeatable: true,
  },
  {
    templateId: 'info_stumble',
    severity: 'info',
    category: 'hazard',
    messages: [
      'You stumble over a root. -{damage} HP',
      'A loose stone causes you to trip. -{damage} HP',
    ],
    effects: {
      healthModifier: { min: -8, max: -3 },
    },
    visualCue: {
      type: 'damage',
      color: '#FF4444',
    },
    weight: 12,
    applicableTasks: ['expedition'],
    repeatable: true,
  },
  {
    templateId: 'info_rest',
    severity: 'info',
    category: 'health',
    messages: [
      'You take a moment to catch your breath. +{heal} HP',
      'A brief rest restores {heal} HP.',
    ],
    effects: {
      healthModifier: { min: 5, max: 12 },
    },
    visualCue: {
      type: 'sparkle',
      color: '#44FF44',
    },
    weight: 12,
    applicableTasks: [],
    repeatable: true,
  },
  {
    templateId: 'info_friendly_npc',
    severity: 'info',
    category: 'npc',
    messages: [
      'A friendly traveler shares some provisions. +{heal} HP',
      'A merchant gives you a health tonic. +{heal} HP',
    ],
    effects: {
      healthModifier: { min: 8, max: 15 },
    },
    visualCue: {
      type: 'sparkle',
      color: '#44FF44',
    },
    weight: 10,
    applicableTasks: ['expedition'],
    repeatable: true,
  },
  {
    templateId: 'info_lucky_find',
    severity: 'info',
    category: 'fortune',
    messages: [
      'You feel lucky! Success chance +{success}%',
      'Good fortune smiles upon you. Success +{success}%',
    ],
    effects: {
      successChanceModifier: { min: 2, max: 5 },
    },
    visualCue: {
      type: 'star',
      color: '#FFD700',
    },
    weight: 10,
    applicableTasks: [],
    repeatable: true,
  },
  {
    templateId: 'info_unlucky_moment',
    severity: 'info',
    category: 'fortune',
    messages: [
      'You have a bad feeling about this. Success -{success}%',
      'Your luck seems to have run out. Success -{success}%',
    ],
    effects: {
      successChanceModifier: { min: -5, max: -2 },
    },
    visualCue: {
      type: 'warning',
      color: '#FFA500',
    },
    weight: 8,
    applicableTasks: [],
    repeatable: true,
  },
  {
    templateId: 'info_find_herbs',
    severity: 'info',
    category: 'loot',
    messages: [
      'You spot some medicinal herbs and gather them. +{materials} materials',
      'Useful herbs grow nearby. +{materials} materials',
    ],
    effects: {
      materialsModifier: { min: 1, max: 3 },
    },
    weight: 12,
    applicableTasks: ['expedition'],
    repeatable: true,
  },
  {
    templateId: 'info_minor_scratch',
    severity: 'info',
    category: 'combat',
    messages: [
      'A minor skirmish leaves you scratched. -{damage} HP',
      'You take a glancing blow. -{damage} HP',
    ],
    effects: {
      healthModifier: { min: -10, max: -5 },
    },
    visualCue: {
      type: 'damage',
    },
    weight: 10,
    applicableTasks: ['raid', 'expedition'],
    repeatable: true,
  },
  {
    templateId: 'info_motivational_thought',
    severity: 'info',
    category: 'fortune',
    messages: [
      'You recall your training. Success +{success}%',
      'A surge of confidence boosts your abilities. Success +{success}%',
    ],
    effects: {
      successChanceModifier: { min: 3, max: 6 },
    },
    weight: 10,
    applicableTasks: [],
    repeatable: true,
  },

  // ============================================
  // WARNING EVENTS (Notable effects)
  // ============================================
  {
    templateId: 'warn_enemy_encounter',
    severity: 'warning',
    category: 'combat',
    messages: [
      'An enemy ambushes you! -{damage} HP',
      "You're attacked by a hostile creature! -{damage} HP",
      'Combat erupts! You take {damage} damage.',
    ],
    effects: {
      healthModifier: { min: -25, max: -12 },
      successChanceModifier: { min: -8, max: -3 },
    },
    visualCue: {
      type: 'damage',
      color: '#FF0000',
    },
    weight: 8,
    applicableTasks: ['raid', 'expedition'],
    repeatable: true,
  },
  {
    templateId: 'warn_treasure_found',
    severity: 'warning',
    category: 'loot',
    messages: [
      'You discover a hidden cache! +{gold} gold',
      'A treasure trove! +{gold} gold',
      'Jackpot! You find {gold} gold coins!',
    ],
    effects: {
      goldModifier: { min: 25, max: 50 },
    },
    visualCue: {
      type: 'treasure',
      color: '#FFD700',
    },
    weight: 12,
    applicableTasks: ['raid'],
    repeatable: true,
  },
  {
    templateId: 'warn_trap',
    severity: 'warning',
    category: 'hazard',
    messages: [
      'You trigger a trap! -{damage} HP',
      'A hidden mechanism activates! -{damage} HP',
      'Trapped! You take {damage} damage.',
    ],
    effects: {
      healthModifier: { min: -30, max: -15 },
    },
    visualCue: {
      type: 'damage',
      color: '#FF4444',
    },
    weight: 10,
    applicableTasks: ['raid'],
    repeatable: true,
    conditions: {
      requiresNotInjured: true,
    },
  },
  {
    templateId: 'warn_equipment_damage',
    severity: 'warning',
    category: 'equipment',
    messages: [
      'Your equipment takes a beating. Durability -{durability}',
      'Your gear is damaged! Durability -{durability}',
    ],
    effects: {
      durabilityDamage: { min: 10, max: 25 },
    },
    visualCue: {
      type: 'warning',
      color: '#FFA500',
    },
    weight: 8,
    applicableTasks: ['raid'],
    repeatable: true,
    conditions: {
      requiresArmor: true,
    },
  },
  {
    templateId: 'warn_theft',
    severity: 'warning',
    category: 'economy',
    messages: ['A thief steals {gold} gold from you!', "You're robbed! Lost {gold} gold."],
    effects: {
      goldModifier: { min: -30, max: -15 },
    },
    visualCue: {
      type: 'warning',
      color: '#FF6600',
    },
    weight: 6,
    applicableTasks: [],
    repeatable: true,
    conditions: {
      minGold: 20,
    },
  },
  {
    templateId: 'warn_mysterious_shrine',
    severity: 'warning',
    category: 'mystery',
    messages: [
      'You find a mysterious shrine. It grants you power! Success +{success}%',
      'An ancient altar bestows a blessing. Success +{success}%',
    ],
    effects: {
      successChanceModifier: { min: 8, max: 15 },
    },
    visualCue: {
      type: 'star',
      color: '#9966FF',
    },
    weight: 7,
    applicableTasks: [],
    repeatable: true,
  },
  {
    templateId: 'warn_cursed_item',
    severity: 'warning',
    category: 'mystery',
    messages: [
      'You touch a cursed item! Success -{success}%',
      'A dark energy weakens you. Success -{success}%',
    ],
    effects: {
      successChanceModifier: { min: -12, max: -6 },
    },
    visualCue: {
      type: 'skull',
      color: '#660066',
    },
    weight: 6,
    applicableTasks: ['raid'],
    repeatable: true,
  },
  {
    templateId: 'warn_healing_fountain',
    severity: 'warning',
    category: 'health',
    messages: [
      'You discover a healing fountain! +{heal} HP',
      'Magical waters restore your vitality. +{heal} HP',
    ],
    effects: {
      healthModifier: { min: 20, max: 40 },
    },
    visualCue: {
      type: 'sparkle',
      color: '#44FFFF',
    },
    weight: 10,
    applicableTasks: ['expedition'],
    repeatable: true,
  },
  {
    templateId: 'warn_material_cache',
    severity: 'warning',
    category: 'loot',
    messages: [
      'A cache of rare materials! +{materials} materials',
      'You find a stash of valuable resources. +{materials} materials',
    ],
    effects: {
      materialsModifier: { min: 8, max: 15 },
    },
    visualCue: {
      type: 'treasure',
      color: '#8B4513',
    },
    weight: 10,
    applicableTasks: ['expedition', 'craft'],
    repeatable: true,
  },
  {
    templateId: 'warn_friendly_guard',
    severity: 'warning',
    category: 'npc',
    messages: [
      'A friendly guard offers assistance. Success +{success}%',
      'You meet an experienced adventurer who gives advice. Success +{success}%',
    ],
    effects: {
      successChanceModifier: { min: 5, max: 10 },
    },
    weight: 8,
    applicableTasks: ['raid'],
    repeatable: true,
  },

  // ============================================
  // CRITICAL EVENTS (Significant effects)
  // ============================================
  {
    templateId: 'crit_boss_encounter',
    severity: 'critical',
    category: 'combat',
    messages: [
      'A powerful enemy appears! Massive fight! -{damage} HP, Success -{success}%',
      'Boss enemy blocks your path! -{damage} HP, Success -{success}%',
    ],
    effects: {
      healthModifier: { min: -50, max: -30 },
      successChanceModifier: { min: -15, max: -8 },
    },
    visualCue: {
      type: 'skull',
      color: '#FF0000',
    },
    weight: 4,
    applicableTasks: ['raid'],
    repeatable: false,
  },
  {
    templateId: 'crit_legendary_loot',
    severity: 'critical',
    category: 'loot',
    messages: [
      'LEGENDARY TREASURE! +{gold} gold, +{chests} chest, Success +{success}%!',
      "You've struck it rich! +{gold} gold and an extra chest!",
    ],
    effects: {
      goldModifier: { min: 75, max: 150 },
      extraChests: { min: 1, max: 1 },
      successChanceModifier: { min: 10, max: 20 },
    },
    visualCue: {
      type: 'star',
      color: '#FFD700',
    },
    weight: 3,
    applicableTasks: ['raid'],
    repeatable: false,
  },
  {
    templateId: 'crit_deadly_trap',
    severity: 'critical',
    category: 'hazard',
    messages: [
      'DEADLY TRAP! Massive damage! -{damage} HP',
      'You trigger a catastrophic trap! -{damage} HP',
    ],
    effects: {
      healthModifier: { min: -60, max: -35 },
      successChanceModifier: { min: -10, max: -5 },
    },
    visualCue: {
      type: 'skull',
      color: '#FF0000',
    },
    weight: 3,
    applicableTasks: ['raid'],
    repeatable: false,
    conditions: {
      minHealthPercent: 40,
    },
  },
  {
    templateId: 'crit_divine_blessing',
    severity: 'critical',
    category: 'fortune',
    messages: [
      'DIVINE BLESSING! Full heal and massive success boost! +{heal} HP, Success +{success}%',
      'The gods smile upon you! +{heal} HP, Success +{success}%',
    ],
    effects: {
      healthModifier: { min: 50, max: 100 },
      successChanceModifier: { min: 15, max: 25 },
    },
    visualCue: {
      type: 'star',
      color: '#FFFFFF',
    },
    weight: 2,
    applicableTasks: [],
    repeatable: false,
  },
  {
    templateId: 'crit_equipment_break',
    severity: 'critical',
    category: 'equipment',
    messages: [
      'CRITICAL FAILURE! Your equipment is severely damaged! Durability -{durability}',
      'Your gear nearly breaks apart! Durability -{durability}',
    ],
    effects: {
      durabilityDamage: { min: 40, max: 60 },
      successChanceModifier: { min: -12, max: -6 },
    },
    visualCue: {
      type: 'warning',
      color: '#FF0000',
    },
    weight: 2,
    applicableTasks: ['raid'],
    repeatable: true,
    conditions: {
      requiresArmor: true,
    },
  },
  {
    templateId: 'crit_master_thief',
    severity: 'critical',
    category: 'economy',
    messages: [
      'A master thief robs you blind! -{gold} gold stolen!',
      "You're ambushed by a notorious bandit! Lost {gold} gold.",
    ],
    effects: {
      goldModifier: { min: -80, max: -40 },
      healthModifier: { min: -20, max: -10 },
    },
    visualCue: {
      type: 'skull',
      color: '#660000',
    },
    weight: 2,
    applicableTasks: [],
    repeatable: false,
    conditions: {
      minGold: 50,
    },
  },
  {
    templateId: 'crit_ancient_power',
    severity: 'critical',
    category: 'mystery',
    messages: [
      'You awaken an ancient power! +{xp} XP, Success +{success}%',
      'Mystical energy surges through you! +{xp} XP, Success +{success}%',
    ],
    effects: {
      xpModifier: { min: 50, max: 100 },
      successChanceModifier: { min: 15, max: 20 },
    },
    visualCue: {
      type: 'star',
      color: '#9966FF',
    },
    weight: 3,
    applicableTasks: ['raid'],
    repeatable: false,
    conditions: {
      minLevel: 3,
    },
  },
  {
    templateId: 'crit_material_jackpot',
    severity: 'critical',
    category: 'loot',
    messages: [
      'MATERIAL JACKPOT! +{materials} rare materials!',
      'You discover a massive resource vein! +{materials} materials',
    ],
    effects: {
      materialsModifier: { min: 25, max: 50 },
      goldModifier: { min: 20, max: 40 },
    },
    visualCue: {
      type: 'treasure',
      color: '#8B4513',
    },
    weight: 3,
    applicableTasks: ['expedition', 'craft'],
    repeatable: false,
  },

  // ============================================
  // ADDITIONAL DIVERSE EVENTS
  // ============================================
  {
    templateId: 'info_weapon_sharpen',
    severity: 'info',
    category: 'equipment',
    messages: [
      'You sharpen your weapon. Success +{success}%',
      'Your blade gleams with renewed sharpness. Success +{success}%',
    ],
    effects: {
      successChanceModifier: { min: 3, max: 6 },
    },
    weight: 8,
    applicableTasks: [],
    repeatable: true,
    conditions: {
      requiresWeapon: true,
    },
  },
  {
    templateId: 'flavor_campfire',
    severity: 'flavor',
    category: 'npc',
    messages: [
      'You spot a distant campfire. Other adventurers nearby?',
      'Smoke rises in the distance. Signs of civilization.',
    ],
    effects: {},
    weight: 8,
    applicableTasks: ['expedition'],
    repeatable: true,
  },
  {
    templateId: 'info_animal_companion',
    severity: 'info',
    category: 'fortune',
    messages: [
      'A friendly animal follows you for a while. Success +{success}%',
      'You befriend a local creature. Success +{success}%',
    ],
    effects: {
      successChanceModifier: { min: 2, max: 5 },
    },
    weight: 10,
    applicableTasks: ['expedition'],
    repeatable: true,
  },
  {
    templateId: 'warn_sudden_storm',
    severity: 'warning',
    category: 'hazard',
    messages: [
      'A sudden storm rolls in! -{damage} HP, Success -{success}%',
      'Lightning strikes nearby! -{damage} HP, Success -{success}%',
    ],
    effects: {
      healthModifier: { min: -20, max: -10 },
      successChanceModifier: { min: -8, max: -4 },
    },
    visualCue: {
      type: 'warning',
      color: '#4444FF',
    },
    weight: 7,
    applicableTasks: ['expedition'],
    repeatable: true,
  },
  {
    templateId: 'info_old_map',
    severity: 'info',
    category: 'loot',
    messages: [
      'You find an old map. It might be valuable! +{gold} gold',
      'A treasure map! +{gold} gold',
    ],
    effects: {
      goldModifier: { min: 10, max: 20 },
    },
    weight: 9,
    applicableTasks: [],
    repeatable: true,
  },
  {
    templateId: 'warn_poison_dart',
    severity: 'warning',
    category: 'hazard',
    messages: [
      'A poison dart grazes you! -{damage} HP',
      "You're hit by a poisoned projectile! -{damage} HP",
    ],
    effects: {
      healthModifier: { min: -25, max: -15 },
    },
    visualCue: {
      type: 'damage',
      color: '#00FF00',
    },
    weight: 7,
    applicableTasks: ['raid'],
    repeatable: true,
  },
  {
    templateId: 'flavor_echo',
    severity: 'flavor',
    category: 'mystery',
    messages: [
      'Your footsteps echo strangely in this place.',
      'An eerie echo follows every sound.',
    ],
    effects: {},
    weight: 7,
    applicableTasks: ['raid'],
    repeatable: true,
  },
  {
    templateId: 'info_hidden_passage',
    severity: 'info',
    category: 'fortune',
    messages: [
      'You discover a hidden passage! Success +{success}%',
      'A secret route opens up. Success +{success}%',
    ],
    effects: {
      successChanceModifier: { min: 4, max: 8 },
    },
    weight: 9,
    applicableTasks: ['raid'],
    repeatable: true,
  },
  {
    templateId: 'warn_collapsing_floor',
    severity: 'warning',
    category: 'hazard',
    messages: [
      'The floor collapses beneath you! -{damage} HP',
      'You fall through a weak section! -{damage} HP',
    ],
    effects: {
      healthModifier: { min: -28, max: -15 },
    },
    visualCue: {
      type: 'damage',
      color: '#8B4513',
    },
    weight: 6,
    applicableTasks: ['raid'],
    repeatable: true,
  },
  {
    templateId: 'info_merchant_encounter',
    severity: 'info',
    category: 'npc',
    messages: [
      'You meet a traveling merchant. They buy some of your junk. +{gold} gold',
      'A merchant offers a fair trade. +{gold} gold',
    ],
    effects: {
      goldModifier: { min: 8, max: 18 },
    },
    weight: 10,
    applicableTasks: ['expedition'],
    repeatable: true,
  },
  {
    templateId: 'warn_wild_beast',
    severity: 'warning',
    category: 'combat',
    messages: ['A wild beast attacks! -{damage} HP', "You're mauled by a predator! -{damage} HP"],
    effects: {
      healthModifier: { min: -30, max: -18 },
    },
    visualCue: {
      type: 'damage',
      color: '#FF4444',
    },
    weight: 9,
    applicableTasks: ['expedition'],
    repeatable: true,
  },
  {
    templateId: 'flavor_carved_statue',
    severity: 'flavor',
    category: 'mystery',
    messages: [
      'An intricately carved statue watches over this area.',
      'Ancient statues line the walls, their eyes seem to follow you.',
    ],
    effects: {},
    weight: 8,
    applicableTasks: ['raid'],
    repeatable: true,
  },
  {
    templateId: 'info_momentum',
    severity: 'info',
    category: 'fortune',
    messages: [
      'Everything is going smoothly! Success +{success}%',
      "You're in the zone! Success +{success}%",
    ],
    effects: {
      successChanceModifier: { min: 3, max: 7 },
    },
    weight: 12,
    applicableTasks: [],
    repeatable: true,
  },
  {
    templateId: 'info_fatigue',
    severity: 'info',
    category: 'health',
    messages: ['Fatigue sets in. Success -{success}%', "You're getting tired. Success -{success}%"],
    effects: {
      successChanceModifier: { min: -6, max: -3 },
    },
    weight: 10,
    applicableTasks: [],
    repeatable: true,
  },
  {
    templateId: 'warn_chest_mimic',
    severity: 'warning',
    category: 'combat',
    messages: ['That chest was a mimic! -{damage} HP', 'The treasure chest attacks! -{damage} HP'],
    effects: {
      healthModifier: { min: -25, max: -15 },
      goldModifier: { min: 5, max: 15 },
    },
    visualCue: {
      type: 'damage',
      color: '#FF6600',
    },
    weight: 5,
    applicableTasks: ['raid'],
    repeatable: true,
  },
  {
    templateId: 'info_lucky_dodge',
    severity: 'info',
    category: 'combat',
    messages: ['You narrowly dodge an attack!', 'Your reflexes save you from harm!'],
    effects: {
      successChanceModifier: { min: 2, max: 4 },
    },
    weight: 10,
    applicableTasks: ['raid'],
    repeatable: true,
  },
  {
    templateId: 'crit_earthquake',
    severity: 'critical',
    category: 'hazard',
    messages: [
      'EARTHQUAKE! The ground shakes violently! -{damage} HP, Success -{success}%',
      'Massive tremors rock the area! -{damage} HP, Success -{success}%',
    ],
    effects: {
      healthModifier: { min: -45, max: -25 },
      successChanceModifier: { min: -15, max: -8 },
    },
    visualCue: {
      type: 'warning',
      color: '#8B4513',
    },
    weight: 2,
    applicableTasks: [],
    repeatable: false,
  },
  {
    templateId: 'crit_phoenix_feather',
    severity: 'critical',
    category: 'loot',
    messages: [
      'You find a PHOENIX FEATHER! Massive XP boost! +{xp} XP',
      'A legendary phoenix feather! +{xp} XP',
    ],
    effects: {
      xpModifier: { min: 75, max: 150 },
      successChanceModifier: { min: 10, max: 15 },
    },
    visualCue: {
      type: 'star',
      color: '#FF6600',
    },
    weight: 2,
    applicableTasks: [],
    repeatable: false,
    conditions: {
      minLevel: 5,
    },
  },
  {
    templateId: 'info_good_vibes',
    severity: 'info',
    category: 'fortune',
    messages: [
      'You feel good about this task. Success +{success}%',
      'Positive energy surrounds you. Success +{success}%',
    ],
    effects: {
      successChanceModifier: { min: 2, max: 5 },
    },
    weight: 12,
    applicableTasks: [],
    repeatable: true,
  },
  {
    templateId: 'warn_armor_crack',
    severity: 'warning',
    category: 'equipment',
    messages: [
      'Your armor develops a crack! Durability -{durability}',
      'A heavy blow damages your armor. Durability -{durability}',
    ],
    effects: {
      durabilityDamage: { min: 15, max: 30 },
    },
    weight: 7,
    applicableTasks: ['raid'],
    repeatable: true,
    conditions: {
      requiresArmor: true,
    },
  },
];

/**
 * Get event statistics
 */
export function getEventStatistics() {
  const stats = {
    total: EVENT_TEMPLATES.length,
    bySeverity: {
      flavor: EVENT_TEMPLATES.filter((e) => e.severity === 'flavor').length,
      info: EVENT_TEMPLATES.filter((e) => e.severity === 'info').length,
      warning: EVENT_TEMPLATES.filter((e) => e.severity === 'warning').length,
      critical: EVENT_TEMPLATES.filter((e) => e.severity === 'critical').length,
    },
    byCategory: {
      combat: EVENT_TEMPLATES.filter((e) => e.category === 'combat').length,
      loot: EVENT_TEMPLATES.filter((e) => e.category === 'loot').length,
      hazard: EVENT_TEMPLATES.filter((e) => e.category === 'hazard').length,
      npc: EVENT_TEMPLATES.filter((e) => e.category === 'npc').length,
      fortune: EVENT_TEMPLATES.filter((e) => e.category === 'fortune').length,
      equipment: EVENT_TEMPLATES.filter((e) => e.category === 'equipment').length,
      health: EVENT_TEMPLATES.filter((e) => e.category === 'health').length,
      economy: EVENT_TEMPLATES.filter((e) => e.category === 'economy').length,
      mystery: EVENT_TEMPLATES.filter((e) => e.category === 'mystery').length,
    },
    repeatable: EVENT_TEMPLATES.filter((e) => e.repeatable).length,
    nonRepeatable: EVENT_TEMPLATES.filter((e) => !e.repeatable).length,
  };

  return stats;
}
