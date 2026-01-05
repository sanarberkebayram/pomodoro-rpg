/**
 * Sprite and animation system exports
 */

export {
  AnimationSystem,
  createSimpleAnimation,
  createIdleAnimation,
  createWalkAnimation,
  createAttackAnimation,
} from './AnimationSystem';
export { CharacterSprite } from './CharacterSprite';
export type { CharacterSpriteConfig } from './CharacterSprite';
export {
  loadSpriteSheet,
  loadSpriteSheets,
  getSpriteSheet,
  isSpriteSheetLoaded,
  getSpriteSheetFrame,
  getSpriteSheetFrameCount,
  renderSpriteSheetFrame,
  createFrameSequence,
  createFrameGrid,
} from './SpriteSheet';
export type { SpriteSheetConfig } from './SpriteSheet';
