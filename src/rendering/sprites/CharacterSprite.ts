/**
 * CharacterSprite - Represents an animated character sprite
 * Combines sprite rendering with animation system
 */

import { AnimationSystem } from './AnimationSystem';
import type { Position, Size } from '../types';
import type { AnimationConfig } from '../scenes/types';
import { assetLoader } from '../utils/AssetLoader';

export interface CharacterSpriteConfig {
  spriteSheetId: string;
  position: Position;
  size: Size;
  animations: AnimationConfig[];
  defaultAnimation?: string;
  scale?: number;
  flipHorizontal?: boolean;
}

export class CharacterSprite {
  private spriteSheetId: string;
  private position: Position;
  private size: Size;
  private animationSystem: AnimationSystem;
  private scale: number;
  private flipHorizontal: boolean;
  private visible: boolean = true;
  private opacity: number = 1;

  constructor(config: CharacterSpriteConfig) {
    this.spriteSheetId = config.spriteSheetId;
    this.position = { ...config.position };
    this.size = { ...config.size };
    this.scale = config.scale ?? 1;
    this.flipHorizontal = config.flipHorizontal ?? false;

    // Initialize animation system
    this.animationSystem = new AnimationSystem();

    // Add all animations
    config.animations.forEach((animation) => {
      this.animationSystem.addAnimation(animation);
    });

    // Play default animation if specified
    if (config.defaultAnimation) {
      this.animationSystem.play(config.defaultAnimation);
    }
  }

  /**
   * Update sprite animation
   */
  update(deltaTime: number): void {
    this.animationSystem.update(deltaTime);
  }

  /**
   * Render sprite with current animation frame
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) {
      return;
    }

    const spriteSheet = assetLoader.getSpriteSheet(this.spriteSheetId);
    if (!spriteSheet?.image) {
      // Fallback: render placeholder if sprite sheet not loaded
      this.renderPlaceholder(ctx);
      return;
    }

    ctx.save();

    // Apply opacity
    ctx.globalAlpha = this.opacity;

    // Apply flip
    if (this.flipHorizontal) {
      ctx.translate(this.position.x + (this.size.width * this.scale) / 2, this.position.y);
      ctx.scale(-1, 1);
      ctx.translate(-(this.size.width * this.scale) / 2, 0);
    } else {
      ctx.translate(this.position.x, this.position.y);
    }

    // Render current animation frame
    this.animationSystem.render(
      ctx,
      this.spriteSheetId,
      0,
      0,
      this.size.width * this.scale,
      this.size.height * this.scale
    );

    ctx.restore();
  }

  /**
   * Render a placeholder when sprite sheet is not available
   */
  private renderPlaceholder(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Draw simple colored rectangle as placeholder
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width * this.scale,
      this.size.height * this.scale
    );

    // Draw border
    ctx.strokeStyle = '#2d8b85';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.position.x,
      this.position.y,
      this.size.width * this.scale,
      this.size.height * this.scale
    );

    ctx.restore();
  }

  /**
   * Play an animation
   */
  playAnimation(name: string, restart: boolean = false): boolean {
    return this.animationSystem.play(name, restart);
  }

  /**
   * Stop current animation
   */
  stopAnimation(): void {
    this.animationSystem.stop();
  }

  /**
   * Pause current animation
   */
  pauseAnimation(): void {
    this.animationSystem.pause();
  }

  /**
   * Resume current animation
   */
  resumeAnimation(): void {
    this.animationSystem.resume();
  }

  /**
   * Get current animation name
   */
  getCurrentAnimation(): string {
    return this.animationSystem.getCurrentAnimation();
  }

  /**
   * Check if animation is playing
   */
  isAnimationPlaying(): boolean {
    return this.animationSystem.isPlaying();
  }

  /**
   * Set position
   */
  setPosition(position: Position): void {
    this.position = { ...position };
  }

  /**
   * Get position
   */
  getPosition(): Position {
    return { ...this.position };
  }

  /**
   * Set size
   */
  setSize(size: Size): void {
    this.size = { ...size };
  }

  /**
   * Get size
   */
  getSize(): Size {
    return { ...this.size };
  }

  /**
   * Set scale
   */
  setScale(scale: number): void {
    this.scale = scale;
  }

  /**
   * Get scale
   */
  getScale(): number {
    return this.scale;
  }

  /**
   * Set horizontal flip
   */
  setFlipHorizontal(flip: boolean): void {
    this.flipHorizontal = flip;
  }

  /**
   * Get horizontal flip state
   */
  isFlippedHorizontal(): boolean {
    return this.flipHorizontal;
  }

  /**
   * Set visibility
   */
  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  /**
   * Check if visible
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * Set opacity
   */
  setOpacity(opacity: number): void {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }

  /**
   * Get opacity
   */
  getOpacity(): number {
    return this.opacity;
  }

  /**
   * Get sprite sheet ID
   */
  getSpriteSheetId(): string {
    return this.spriteSheetId;
  }

  /**
   * Get bounds (for collision detection, etc.)
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.size.width * this.scale,
      height: this.size.height * this.scale,
    };
  }
}
