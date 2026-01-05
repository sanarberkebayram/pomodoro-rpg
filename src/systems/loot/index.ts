/**
 * Loot System Module
 * Exports all loot system components
 */

// Rarity System
export {
  RARITY_CONFIGS,
  getRarityConfig,
  getAllRarityConfigs,
  selectRarity,
  applyRarityMultiplier,
  applyValueMultiplier,
  getRarityColor,
  getRarityName,
  compareRarity,
  isBetterRarity,
  getRarityTier,
  createRarityStats,
  recordRarityDrop,
  calculateDropRates,
  type RarityStats,
} from './RaritySystem';

// Loot Generator
export {
  generateItem,
  generateItems,
  generateGold,
  generateMaterials,
  generateXP,
  type ItemGenerationContext,
} from './LootGenerator';

// Chest Manager
export {
  createChest,
  openChest,
  createChests,
  openChests,
  getChestQualityConfig,
  determineChestQuality,
  estimateChestValue,
  getChestQualityName,
  getChestQualityColor,
  type Chest,
  type ChestQuality,
  type ChestOpenResult,
} from './ChestManager';
