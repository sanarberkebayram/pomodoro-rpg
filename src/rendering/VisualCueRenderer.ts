/**
 * VisualCueRenderer - Renders visual effects for game events on canvas
 * Shows sparkles, damage indicators, warnings, etc.
 */

import { VisualCue } from '@/core/types/events';

/**
 * Active visual cue with animation state
 */
interface ActiveVisualCue {
  cue: VisualCue;
  startTime: number;
  progress: number; // 0-1
}

/**
 * VisualCueRenderer class
 * Manages and renders visual cues on canvas
 */
export class VisualCueRenderer {
  private activeCues: ActiveVisualCue[] = [];

  /**
   * Add a visual cue to render
   */
  public addCue(cue: VisualCue): void {
    this.activeCues.push({
      cue,
      startTime: Date.now(),
      progress: 0,
    });
  }

  /**
   * Update active cues (call each frame)
   */
  public update(_deltaTime: number): void {
    const now = Date.now();

    // Update progress and remove expired cues
    this.activeCues = this.activeCues.filter((activeCue) => {
      const elapsed = now - activeCue.startTime;
      activeCue.progress = Math.min(elapsed / activeCue.cue.duration, 1);
      return activeCue.progress < 1;
    });
  }

  /**
   * Render all active cues
   */
  public render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    for (const activeCue of this.activeCues) {
      this.renderCue(ctx, activeCue, canvasWidth, canvasHeight);
    }
  }

  /**
   * Render a single visual cue
   */
  private renderCue(
    ctx: CanvasRenderingContext2D,
    activeCue: ActiveVisualCue,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const { cue, progress } = activeCue;

    // Get position (default to center if not specified)
    const x = cue.position?.x ? cue.position.x * canvasWidth : canvasWidth / 2;
    const y = cue.position?.y ? cue.position.y * canvasHeight : canvasHeight / 2;

    // Get color (default to white if not specified)
    const color = cue.color || '#FFFFFF';

    // Render based on type
    switch (cue.type) {
      case 'sparkle':
        this.renderSparkle(ctx, x, y, color, progress);
        break;
      case 'damage':
        this.renderDamage(ctx, x, y, color, progress);
        break;
      case 'warning':
        this.renderWarning(ctx, x, y, color, progress);
        break;
      case 'treasure':
        this.renderTreasure(ctx, x, y, color, progress);
        break;
      case 'shield':
        this.renderShield(ctx, x, y, color, progress);
        break;
      case 'skull':
        this.renderSkull(ctx, x, y, color, progress);
        break;
      case 'star':
        this.renderStar(ctx, x, y, color, progress);
        break;
      case 'question':
        this.renderQuestion(ctx, x, y, color, progress);
        break;
    }
  }

  /**
   * Render sparkle effect (positive effects)
   */
  private renderSparkle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    progress: number
  ): void {
    ctx.save();

    // Fade in then out
    const opacity = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
    ctx.globalAlpha = opacity;

    // Draw multiple sparkle particles
    const particleCount = 8;
    const radius = 30 + progress * 20;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + progress * Math.PI;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;

      // Draw sparkle particle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw glow
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, 8);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Render damage indicator (red flash/shake)
   */
  private renderDamage(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    progress: number
  ): void {
    ctx.save();

    // Quick flash that fades
    const opacity = Math.max(0, 1 - progress * 2);
    ctx.globalAlpha = opacity;

    // Screen flash effect
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 150);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(x - 150, y - 150, 300, 300);

    // Draw impact lines
    const lineCount = 8;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      const length = 20 + progress * 40;
      const startX = x + Math.cos(angle) * 10;
      const startY = y + Math.sin(angle) * 10;
      const endX = x + Math.cos(angle) * (10 + length);
      const endY = y + Math.sin(angle) * (10 + length);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Render warning indicator (pulsing triangle)
   */
  private renderWarning(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    progress: number
  ): void {
    ctx.save();

    // Pulse opacity
    const opacity = 0.5 + Math.sin(progress * Math.PI * 4) * 0.5;
    ctx.globalAlpha = opacity;

    // Scale up slightly
    const scale = 1 + progress * 0.2;
    const size = 30 * scale;

    // Draw warning triangle
    ctx.strokeStyle = color;
    ctx.fillStyle = color + '33'; // 20% opacity
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.866, y + size * 0.5);
    ctx.lineTo(x - size * 0.866, y + size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw exclamation mark
    ctx.fillStyle = color;
    ctx.fillRect(x - 2, y - size * 0.4, 4, size * 0.5);
    ctx.beginPath();
    ctx.arc(x, y + size * 0.3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Render treasure indicator (glowing chest/sparkles)
   */
  private renderTreasure(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    progress: number
  ): void {
    ctx.save();

    // Fade in and grow
    const opacity = Math.min(1, progress * 2);
    const scale = 0.5 + progress * 0.5;

    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Draw glowing circle
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, color + '88');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fill();

    // Draw rotating sparkles
    const sparkleCount = 6;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2 + progress * Math.PI * 2;
      const dist = 25;
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * dist;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 5);
      ctx.lineTo(sx + 2, sy);
      ctx.lineTo(sx, sy + 5);
      ctx.lineTo(sx - 2, sy);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Render shield indicator (protective glow)
   */
  private renderShield(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    progress: number
  ): void {
    ctx.save();

    // Pulse
    const opacity = 0.6 + Math.sin(progress * Math.PI * 3) * 0.4;
    ctx.globalAlpha = opacity;

    // Draw shield shape
    ctx.strokeStyle = color;
    ctx.fillStyle = color + '44';
    ctx.lineWidth = 3;

    const size = 35;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.quadraticCurveTo(x + size * 0.8, y - size * 0.5, x + size * 0.6, y + size * 0.3);
    ctx.quadraticCurveTo(x + size * 0.3, y + size * 0.7, x, y + size);
    ctx.quadraticCurveTo(x - size * 0.3, y + size * 0.7, x - size * 0.6, y + size * 0.3);
    ctx.quadraticCurveTo(x - size * 0.8, y - size * 0.5, x, y - size);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render skull indicator (danger/death)
   */
  private renderSkull(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    progress: number
  ): void {
    ctx.save();

    // Fade in with shake
    const opacity = Math.min(1, progress * 2);
    const shake = progress < 0.3 ? Math.sin(progress * 50) * 3 : 0;

    ctx.globalAlpha = opacity;
    ctx.translate(x + shake, y);

    // Draw skull (simplified)
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Head
    ctx.beginPath();
    ctx.arc(0, -5, 18, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-8, -8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8, -8, 4, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(-3, 3);
    ctx.lineTo(3, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Render star indicator (critical success/legendary)
   */
  private renderStar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    progress: number
  ): void {
    ctx.save();

    // Grow and rotate
    const scale = progress * 1.5;
    const rotation = progress * Math.PI * 2;
    const opacity = progress < 0.8 ? 1 : (1 - progress) * 5;

    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    // Draw star
    ctx.fillStyle = color;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const outerX = Math.cos(angle) * 25;
      const outerY = Math.sin(angle) * 25;
      const innerAngle = angle + Math.PI / 5;
      const innerX = Math.cos(innerAngle) * 12;
      const innerY = Math.sin(innerAngle) * 12;

      if (i === 0) {
        ctx.moveTo(outerX, outerY);
      } else {
        ctx.lineTo(outerX, outerY);
      }
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glow
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
    gradient.addColorStop(0, color + '88');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Render question mark indicator (mystery)
   */
  private renderQuestion(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    progress: number
  ): void {
    ctx.save();

    // Float up and fade
    const offsetY = -progress * 30;
    const opacity = 1 - progress;

    ctx.globalAlpha = opacity;
    ctx.translate(x, y + offsetY);

    // Draw question mark
    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeText('?', 0, 0);
    ctx.fillText('?', 0, 0);

    ctx.restore();
  }

  /**
   * Clear all active cues
   */
  public clear(): void {
    this.activeCues = [];
  }

  /**
   * Get count of active cues
   */
  public getActiveCount(): number {
    return this.activeCues.length;
  }
}
