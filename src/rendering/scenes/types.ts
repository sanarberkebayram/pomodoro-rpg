/**
 * Scene system type definitions
 */

import type { Position, Size } from '../types';

export interface SceneConfig {
  name: string;
  backgroundColor?: string;
  clearBeforeRender?: boolean;
}

export interface SceneState {
  isActive: boolean;
  isPaused: boolean;
  timeElapsed: number;
}

export type SceneTransition = 'fade' | 'slide' | 'instant';

export interface SceneTransitionConfig {
  type: SceneTransition;
  duration: number;
}

export interface AnimationFrame {
  index: number;
  duration: number;
  offsetX?: number;
  offsetY?: number;
}

export interface AnimationConfig {
  name: string;
  frames: AnimationFrame[];
  loop: boolean;
  onComplete?: () => void;
}

export interface SpriteAnimationState {
  currentAnimation: string;
  currentFrame: number;
  frameTime: number;
  isPlaying: boolean;
}

export interface GameObject {
  id: string;
  position: Position;
  size: Size;
  visible: boolean;
  zIndex: number;
  rotation?: number;
  scale?: number;
  opacity?: number;
}

export interface AnimatedSprite extends GameObject {
  spriteSheetId: string;
  animations: Map<string, AnimationConfig>;
  animationState: SpriteAnimationState;
}

export interface BackgroundLayer {
  id: string;
  imageId?: string;
  color?: string;
  zIndex: number;
  scrollSpeed?: number;
  opacity?: number;
}
