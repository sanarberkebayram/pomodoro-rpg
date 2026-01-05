/**
 * RaidScene - Visual scene for Raid work tasks
 * Shows character in a dungeon/raid environment with dynamic elements
 */

import { BaseScene } from './BaseScene';
import { CharacterSprite } from '../sprites/CharacterSprite';
import { createIdleAnimation, createWalkAnimation } from '../sprites/AnimationSystem';
import type { Size, Position } from '../types';
import type { SceneConfig } from './types';

export interface RaidSceneConfig extends SceneConfig {
  characterSpriteSheetId?: string;
  showProgressBar?: boolean;
  showEventFeed?: boolean;
}

export class RaidScene extends BaseScene {
  private characterSprite: CharacterSprite | null = null;
  private characterPosition: Position;
  private characterSize: Size;
  private progress: number = 0;
  private particles: Array<{ x: number; y: number; life: number; color: string }> = [];
  private backgroundOffset: number = 0;

  constructor(config: RaidSceneConfig, canvasSize: Size) {
    super(
      {
        name: 'Raid',
        backgroundColor: '#1a1a2e',
        clearBeforeRender: true,
        ...config,
      },
      canvasSize
    );

    // Position character in the center-left of the screen
    this.characterPosition = {
      x: canvasSize.width * 0.3,
      y: canvasSize.height * 0.5,
    };

    this.characterSize = {
      width: 64,
      height: 64,
    };
  }

  protected async onInitialize(): Promise<void> {
    // Create character sprite with animations
    this.characterSprite = new CharacterSprite({
      spriteSheetId: 'character-sprite', // Placeholder ID
      position: {
        x: this.characterPosition.x - this.characterSize.width / 2,
        y: this.characterPosition.y - this.characterSize.height / 2,
      },
      size: this.characterSize,
      animations: [createIdleAnimation([0], 500), createWalkAnimation([0, 1, 2, 3], 150)],
      defaultAnimation: 'idle',
    });
  }

  protected onEnter(): void {
    this.progress = 0;
    this.particles = [];
    this.backgroundOffset = 0;
    this.characterSprite?.playAnimation('walk');
  }

  protected onExit(): void {
    this.characterSprite?.stopAnimation();
  }

  protected onPause(): void {
    this.characterSprite?.pauseAnimation();
  }

  protected onResume(): void {
    this.characterSprite?.resumeAnimation();
  }

  protected onUpdate(deltaTime: number): void {
    // Update character sprite
    this.characterSprite?.update(deltaTime);

    // Simulate progress (this would be driven by actual task progress)
    this.progress += deltaTime / 100;
    if (this.progress > 100) {
      this.progress = 100;
    }

    // Animate background scrolling
    this.backgroundOffset += deltaTime * 0.02;
    if (this.backgroundOffset > this.canvasSize.width) {
      this.backgroundOffset = 0;
    }

    // Update particles
    this.updateParticles(deltaTime);

    // Occasionally spawn particles (combat effects)
    if (Math.random() < 0.02) {
      this.spawnParticle();
    }
  }

  protected onRender(ctx: CanvasRenderingContext2D): void {
    // Render background
    this.renderBackground(ctx);

    // Render environment elements
    this.renderEnvironment(ctx);

    // Render character
    this.renderCharacter(ctx);

    // Render particles (effects)
    this.renderParticles(ctx);

    // Render UI overlay
    this.renderOverlay(ctx);
  }

  protected onResize(newSize: Size): void {
    // Adjust character position relative to new size
    this.characterPosition = {
      x: newSize.width * 0.3,
      y: newSize.height * 0.5,
    };
  }

  /**
   * Render background layers
   */
  private renderBackground(ctx: CanvasRenderingContext2D): void {
    // Dark dungeon background
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasSize.height);
    gradient.addColorStop(0, '#16213e');
    gradient.addColorStop(1, '#0f1419');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    // Animated background lines (parallax effect)
    ctx.save();
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
    ctx.lineWidth = 2;

    for (let i = 0; i < 5; i++) {
      const x = ((i * this.canvasSize.width) / 5 - this.backgroundOffset) % this.canvasSize.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvasSize.height);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Render environment elements (pillars, walls, etc.)
   */
  private renderEnvironment(ctx: CanvasRenderingContext2D): void {
    // Draw dungeon floor
    ctx.fillStyle = 'rgba(68, 68, 68, 0.5)';
    ctx.fillRect(
      0,
      this.canvasSize.height * 0.7,
      this.canvasSize.width,
      this.canvasSize.height * 0.3
    );

    // Draw some pillars
    this.drawRect(
      ctx,
      this.canvasSize.width * 0.1,
      this.canvasSize.height * 0.3,
      40,
      this.canvasSize.height * 0.4,
      '#2a2a2a'
    );

    this.drawRect(
      ctx,
      this.canvasSize.width * 0.8,
      this.canvasSize.height * 0.3,
      40,
      this.canvasSize.height * 0.4,
      '#2a2a2a'
    );
  }

  /**
   * Render character with animation
   */
  private renderCharacter(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Character shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(
      this.characterPosition.x,
      this.characterPosition.y + this.characterSize.height / 2 + 5,
      this.characterSize.width / 2.5,
      10,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Render character sprite (will use placeholder if sprite sheet not loaded)
    if (this.characterSprite) {
      this.characterSprite.render(ctx);
    }

    ctx.restore();
  }

  /**
   * Render particles (combat effects)
   */
  private renderParticles(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    for (const particle of this.particles) {
      const alpha = particle.life / 100;
      ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Render UI overlay (progress bar, etc.)
   */
  private renderOverlay(ctx: CanvasRenderingContext2D): void {
    // Scene title
    this.drawText(
      ctx,
      'RAID IN PROGRESS',
      this.canvasSize.width / 2,
      30,
      '#ff6b6b',
      'bold 20px sans-serif',
      'center'
    );

    // Progress bar
    const barWidth = this.canvasSize.width * 0.6;
    const barHeight = 20;
    const barX = (this.canvasSize.width - barWidth) / 2;
    const barY = this.canvasSize.height - 40;

    // Background
    this.drawRect(ctx, barX, barY, barWidth, barHeight, 'rgba(0, 0, 0, 0.5)');

    // Progress fill
    const progressWidth = (barWidth - 4) * (this.progress / 100);
    this.drawRect(ctx, barX + 2, barY + 2, progressWidth, barHeight - 4, '#ff6b6b');

    // Border
    this.drawRect(ctx, barX, barY, barWidth, barHeight, '#ffffff', false);

    // Progress text
    this.drawText(
      ctx,
      `${Math.floor(this.progress)}%`,
      this.canvasSize.width / 2,
      barY + 15,
      '#ffffff',
      'bold 12px sans-serif',
      'center'
    );
  }

  /**
   * Update particles
   */
  private updateParticles(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].life -= deltaTime / 10;
      this.particles[i].y -= deltaTime * 0.05;

      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Spawn a particle effect
   */
  private spawnParticle(): void {
    const colors = ['rgb(255, 107, 107)', 'rgb(255, 193, 7)', 'rgb(255, 255, 255)'];

    this.particles.push({
      x: this.characterPosition.x + (Math.random() - 0.5) * 50,
      y: this.characterPosition.y + (Math.random() - 0.5) * 50,
      life: 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  /**
   * Set progress (for external control)
   */
  setProgress(progress: number): void {
    this.progress = Math.max(0, Math.min(100, progress));
  }

  /**
   * Get current progress
   */
  getProgress(): number {
    return this.progress;
  }
}
