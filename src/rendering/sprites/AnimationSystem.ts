/**
 * Animation system for sprite animations
 * Handles frame-based animations with configurable timing
 */

import type { AnimationConfig, SpriteAnimationState } from '../scenes/types';
import { assetLoader } from '../utils/AssetLoader';

export class AnimationSystem {
  private animations: Map<string, AnimationConfig> = new Map();
  private state: SpriteAnimationState;

  constructor() {
    this.state = {
      currentAnimation: '',
      currentFrame: 0,
      frameTime: 0,
      isPlaying: false,
    };
  }

  /**
   * Add an animation
   */
  addAnimation(animation: AnimationConfig): void {
    this.animations.set(animation.name, animation);
  }

  /**
   * Remove an animation
   */
  removeAnimation(name: string): void {
    this.animations.delete(name);
  }

  /**
   * Play an animation
   */
  play(name: string, restart: boolean = false): boolean {
    const animation = this.animations.get(name);
    if (!animation) {
      console.warn(`Animation "${name}" not found`);
      return false;
    }

    // If already playing this animation and not restarting, do nothing
    if (this.state.currentAnimation === name && this.state.isPlaying && !restart) {
      return true;
    }

    this.state.currentAnimation = name;
    this.state.currentFrame = 0;
    this.state.frameTime = 0;
    this.state.isPlaying = true;

    return true;
  }

  /**
   * Stop the current animation
   */
  stop(): void {
    this.state.isPlaying = false;
  }

  /**
   * Pause the current animation
   */
  pause(): void {
    this.state.isPlaying = false;
  }

  /**
   * Resume the current animation
   */
  resume(): void {
    this.state.isPlaying = true;
  }

  /**
   * Update animation state
   */
  update(deltaTime: number): void {
    if (!this.state.isPlaying || !this.state.currentAnimation) {
      return;
    }

    const animation = this.animations.get(this.state.currentAnimation);
    if (!animation || animation.frames.length === 0) {
      return;
    }

    const currentFrame = animation.frames[this.state.currentFrame];
    this.state.frameTime += deltaTime;

    // Check if we should advance to the next frame
    if (this.state.frameTime >= currentFrame.duration) {
      this.state.frameTime = 0;
      this.state.currentFrame++;

      // Check if animation is complete
      if (this.state.currentFrame >= animation.frames.length) {
        if (animation.loop) {
          this.state.currentFrame = 0;
        } else {
          this.state.currentFrame = animation.frames.length - 1;
          this.state.isPlaying = false;
          animation.onComplete?.();
        }
      }
    }
  }

  /**
   * Render the current animation frame
   */
  render(
    ctx: CanvasRenderingContext2D,
    spriteSheetId: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    if (!this.state.currentAnimation) {
      return;
    }

    const animation = this.animations.get(this.state.currentAnimation);
    if (!animation || animation.frames.length === 0) {
      return;
    }

    const spriteSheet = assetLoader.getSpriteSheet(spriteSheetId);
    if (!spriteSheet?.image) {
      return;
    }

    const currentFrame = animation.frames[this.state.currentFrame];
    const spriteFrame = spriteSheet.frames[currentFrame.index];

    if (!spriteFrame) {
      return;
    }

    ctx.save();

    // Apply frame offsets if specified
    const offsetX = currentFrame.offsetX || 0;
    const offsetY = currentFrame.offsetY || 0;

    // Draw the sprite frame
    ctx.drawImage(
      spriteSheet.image,
      spriteFrame.x,
      spriteFrame.y,
      spriteFrame.width,
      spriteFrame.height,
      x + offsetX,
      y + offsetY,
      width,
      height
    );

    ctx.restore();
  }

  /**
   * Get current animation name
   */
  getCurrentAnimation(): string {
    return this.state.currentAnimation;
  }

  /**
   * Get current frame index
   */
  getCurrentFrame(): number {
    return this.state.currentFrame;
  }

  /**
   * Check if animation is playing
   */
  isPlaying(): boolean {
    return this.state.isPlaying;
  }

  /**
   * Get animation state
   */
  getState(): SpriteAnimationState {
    return { ...this.state };
  }

  /**
   * Set animation state (for save/load)
   */
  setState(state: SpriteAnimationState): void {
    this.state = { ...state };
  }
}

/**
 * Helper function to create simple animations
 */
export function createSimpleAnimation(
  name: string,
  frameIndices: number[],
  frameDuration: number,
  loop: boolean = true
): AnimationConfig {
  return {
    name,
    frames: frameIndices.map((index) => ({
      index,
      duration: frameDuration,
    })),
    loop,
  };
}

/**
 * Create idle animation (single frame or slow cycle)
 */
export function createIdleAnimation(
  frameIndices: number[] = [0],
  frameDuration: number = 1000
): AnimationConfig {
  return createSimpleAnimation('idle', frameIndices, frameDuration, true);
}

/**
 * Create walk animation
 */
export function createWalkAnimation(
  frameIndices: number[] = [0, 1, 2, 3],
  frameDuration: number = 150
): AnimationConfig {
  return createSimpleAnimation('walk', frameIndices, frameDuration, true);
}

/**
 * Create attack animation
 */
export function createAttackAnimation(
  frameIndices: number[] = [0, 1, 2],
  frameDuration: number = 100
): AnimationConfig {
  return createSimpleAnimation('attack', frameIndices, frameDuration, false);
}
