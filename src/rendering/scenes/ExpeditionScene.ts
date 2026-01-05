/**
 * ExpeditionScene - Visual scene for Expedition work tasks
 * Shows character exploring a landscape/environment with nature elements
 */

import { BaseScene } from './BaseScene';
import { CharacterSprite } from '../sprites/CharacterSprite';
import { createIdleAnimation, createWalkAnimation } from '../sprites/AnimationSystem';
import type { Size, Position } from '../types';
import type { SceneConfig } from './types';

export interface ExpeditionSceneConfig extends SceneConfig {
  characterSpriteSheetId?: string;
  showProgressBar?: boolean;
  showEventFeed?: boolean;
}

interface CloudParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export class ExpeditionScene extends BaseScene {
  private characterSprite: CharacterSprite | null = null;
  private characterPosition: Position;
  private characterSize: Size;
  private progress: number = 0;
  private clouds: CloudParticle[] = [];
  private trees: Array<{ x: number; height: number }> = [];
  private walkCycle: number = 0;

  constructor(config: ExpeditionSceneConfig, canvasSize: Size) {
    super(
      {
        name: 'Expedition',
        backgroundColor: '#87ceeb',
        clearBeforeRender: true,
        ...config,
      },
      canvasSize
    );

    // Position character in the lower-left, walking across
    this.characterPosition = {
      x: canvasSize.width * 0.2,
      y: canvasSize.height * 0.6,
    };

    this.characterSize = {
      width: 64,
      height: 64,
    };

    this.initializeEnvironment();
  }

  /**
   * Initialize environment elements
   */
  private initializeEnvironment(): void {
    // Create clouds
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: Math.random() * this.canvasSize.width,
        y: Math.random() * this.canvasSize.height * 0.3,
        size: 30 + Math.random() * 40,
        speed: 0.01 + Math.random() * 0.02,
        opacity: 0.4 + Math.random() * 0.3,
      });
    }

    // Create trees
    for (let i = 0; i < 8; i++) {
      this.trees.push({
        x: (i * this.canvasSize.width) / 8,
        height: 60 + Math.random() * 40,
      });
    }
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
    this.walkCycle = 0;
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

    // Simulate progress
    this.progress += deltaTime / 100;
    if (this.progress > 100) {
      this.progress = 100;
    }

    // Update walk cycle (character moves across screen)
    this.walkCycle += deltaTime * 0.01;
    this.characterPosition.x = this.canvasSize.width * 0.2 + Math.sin(this.walkCycle) * 30;

    // Update character sprite position
    if (this.characterSprite) {
      this.characterSprite.setPosition({
        x: this.characterPosition.x - this.characterSize.width / 2,
        y: this.characterPosition.y - this.characterSize.height / 2,
      });
    }

    // Update clouds
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed * deltaTime;
      if (cloud.x > this.canvasSize.width + cloud.size) {
        cloud.x = -cloud.size;
      }
    }
  }

  protected onRender(ctx: CanvasRenderingContext2D): void {
    // Render background
    this.renderBackground(ctx);

    // Render environment
    this.renderEnvironment(ctx);

    // Render character
    this.renderCharacter(ctx);

    // Render foreground elements
    this.renderForeground(ctx);

    // Render UI overlay
    this.renderOverlay(ctx);
  }

  protected onResize(newSize: Size): void {
    // Adjust character position relative to new size
    this.characterPosition = {
      x: newSize.width * 0.2,
      y: newSize.height * 0.6,
    };

    // Reinitialize environment for new size
    this.initializeEnvironment();
  }

  /**
   * Render sky and background layers
   */
  private renderBackground(ctx: CanvasRenderingContext2D): void {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasSize.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(0.6, '#b4e1ff');
    gradient.addColorStop(1, '#c9f0c9');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    // Clouds
    ctx.save();
    for (const cloud of this.clouds) {
      ctx.globalAlpha = cloud.opacity;
      this.drawCloud(ctx, cloud.x, cloud.y, cloud.size);
    }
    ctx.restore();

    // Sun
    ctx.save();
    ctx.fillStyle = '#ffd93d';
    ctx.shadowColor = '#ffd93d';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(this.canvasSize.width * 0.8, this.canvasSize.height * 0.2, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw a cloud
   */
  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y + size * 0.1, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render environment elements (trees, mountains, etc.)
   */
  private renderEnvironment(ctx: CanvasRenderingContext2D): void {
    // Distant mountains
    ctx.fillStyle = '#8b9dc3';
    ctx.beginPath();
    ctx.moveTo(0, this.canvasSize.height * 0.5);
    for (let i = 0; i <= 10; i++) {
      const x = (i * this.canvasSize.width) / 10;
      const y = this.canvasSize.height * 0.5 - Math.sin(i * 0.5) * 40;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.canvasSize.width, this.canvasSize.height * 0.7);
    ctx.lineTo(0, this.canvasSize.height * 0.7);
    ctx.closePath();
    ctx.fill();

    // Ground/grass
    ctx.fillStyle = '#7ec850';
    ctx.fillRect(
      0,
      this.canvasSize.height * 0.7,
      this.canvasSize.width,
      this.canvasSize.height * 0.3
    );

    // Path
    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.moveTo(0, this.canvasSize.height * 0.75);
    ctx.quadraticCurveTo(
      this.canvasSize.width / 2,
      this.canvasSize.height * 0.7,
      this.canvasSize.width,
      this.canvasSize.height * 0.75
    );
    ctx.lineTo(this.canvasSize.width, this.canvasSize.height);
    ctx.lineTo(0, this.canvasSize.height);
    ctx.closePath();
    ctx.fill();

    // Trees in background
    for (const tree of this.trees) {
      this.drawTree(ctx, tree.x, this.canvasSize.height * 0.65, tree.height);
    }
  }

  /**
   * Draw a simple tree
   */
  private drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, height: number): void {
    // Trunk
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x - 5, y, 10, height * 0.3);

    // Foliage
    ctx.fillStyle = '#228b22';
    ctx.beginPath();
    ctx.moveTo(x, y - height * 0.5);
    ctx.lineTo(x - height * 0.25, y);
    ctx.lineTo(x + height * 0.25, y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y - height * 0.3);
    ctx.lineTo(x - height * 0.2, y - height * 0.1);
    ctx.lineTo(x + height * 0.2, y - height * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Render character with animation
   */
  private renderCharacter(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Character shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(
      this.characterPosition.x,
      this.characterPosition.y + this.characterSize.height / 2 + 5,
      this.characterSize.width / 2.5,
      8,
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
   * Render foreground elements (grass, flowers, etc.)
   */
  private renderForeground(ctx: CanvasRenderingContext2D): void {
    // Grass tufts
    ctx.fillStyle = '#5fa832';
    for (let i = 0; i < 20; i++) {
      const x = (i * this.canvasSize.width) / 20;
      const y = this.canvasSize.height * 0.85 + Math.random() * 20;
      ctx.fillRect(x, y, 3, 10);
    }
  }

  /**
   * Render UI overlay (progress bar, etc.)
   */
  private renderOverlay(ctx: CanvasRenderingContext2D): void {
    // Scene title
    this.drawText(
      ctx,
      'EXPEDITION IN PROGRESS',
      this.canvasSize.width / 2,
      30,
      '#2d6a4f',
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
    this.drawRect(ctx, barX + 2, barY + 2, progressWidth, barHeight - 4, '#52b788');

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
