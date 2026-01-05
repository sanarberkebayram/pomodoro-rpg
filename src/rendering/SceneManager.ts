/**
 * SceneManager - Manages scene lifecycle and transitions
 * Handles switching between different game scenes
 */

import type { BaseScene } from './scenes/BaseScene';
import type { Size } from './types';

export type SceneTransitionType = 'instant' | 'fade' | 'slide';

export interface SceneTransitionConfig {
  type: SceneTransitionType;
  duration: number;
}

export class SceneManager {
  private scenes: Map<string, BaseScene> = new Map();
  private currentScene: BaseScene | null = null;
  private nextScene: BaseScene | null = null;
  private isTransitioning: boolean = false;
  private transitionProgress: number = 0;
  private transitionConfig: SceneTransitionConfig = {
    type: 'instant',
    duration: 0,
  };

  /**
   * Register a scene
   */
  registerScene(scene: BaseScene): void {
    const name = scene.getName();
    if (this.scenes.has(name)) {
      console.warn(`Scene "${name}" is already registered. Overwriting.`);
    }
    this.scenes.set(name, scene);
  }

  /**
   * Unregister a scene
   */
  unregisterScene(name: string): void {
    const scene = this.scenes.get(name);
    if (scene && scene === this.currentScene) {
      console.warn(`Cannot unregister active scene "${name}"`);
      return;
    }
    this.scenes.delete(name);
  }

  /**
   * Get a scene by name
   */
  getScene(name: string): BaseScene | undefined {
    return this.scenes.get(name);
  }

  /**
   * Get current active scene
   */
  getCurrentScene(): BaseScene | null {
    return this.currentScene;
  }

  /**
   * Switch to a different scene
   */
  async switchScene(sceneName: string, transitionConfig?: SceneTransitionConfig): Promise<void> {
    const scene = this.scenes.get(sceneName);

    if (!scene) {
      throw new Error(`Scene "${sceneName}" not found`);
    }

    if (this.isTransitioning) {
      console.warn('Scene transition already in progress');
      return;
    }

    // Initialize scene if not already initialized
    await scene.initialize();

    // Set up transition
    this.nextScene = scene;
    this.transitionConfig = transitionConfig || { type: 'instant', duration: 0 };
    this.transitionProgress = 0;

    if (this.transitionConfig.type === 'instant' || this.transitionConfig.duration === 0) {
      this.completeTransition();
    } else {
      this.isTransitioning = true;
    }
  }

  /**
   * Complete the scene transition
   */
  private completeTransition(): void {
    // Exit current scene
    if (this.currentScene) {
      this.currentScene.exit();
    }

    // Enter next scene
    if (this.nextScene) {
      this.currentScene = this.nextScene;
      this.currentScene.enter();
      this.nextScene = null;
    }

    this.isTransitioning = false;
    this.transitionProgress = 0;
  }

  /**
   * Update the scene manager
   */
  update(deltaTime: number): void {
    // Update transition
    if (this.isTransitioning && this.transitionConfig.duration > 0) {
      this.transitionProgress += deltaTime / this.transitionConfig.duration;

      if (this.transitionProgress >= 1) {
        this.completeTransition();
      }
    }

    // Update current scene
    if (this.currentScene && !this.isTransitioning) {
      this.currentScene.update(deltaTime);
    }
  }

  /**
   * Render the current scene with transition effects
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.currentScene) {
      return;
    }

    if (this.isTransitioning && this.nextScene) {
      this.renderTransition(ctx);
    } else {
      this.currentScene.render(ctx);
    }
  }

  /**
   * Render scene transition effect
   */
  private renderTransition(ctx: CanvasRenderingContext2D): void {
    switch (this.transitionConfig.type) {
      case 'fade':
        this.renderFadeTransition(ctx);
        break;
      case 'slide':
        this.renderSlideTransition(ctx);
        break;
      default:
        this.currentScene?.render(ctx);
    }
  }

  /**
   * Render fade transition
   */
  private renderFadeTransition(ctx: CanvasRenderingContext2D): void {
    const progress = this.transitionProgress;

    ctx.save();

    // Fade out current scene
    if (this.currentScene && progress < 0.5) {
      ctx.globalAlpha = 1 - progress * 2;
      this.currentScene.render(ctx);
    }

    // Fade in next scene
    if (this.nextScene && progress >= 0.5) {
      ctx.globalAlpha = (progress - 0.5) * 2;
      this.nextScene.render(ctx);
    }

    ctx.restore();
  }

  /**
   * Render slide transition
   */
  private renderSlideTransition(ctx: CanvasRenderingContext2D): void {
    const progress = this.transitionProgress;
    const canvasWidth = ctx.canvas.width;

    ctx.save();

    // Slide out current scene
    if (this.currentScene) {
      ctx.translate(-canvasWidth * progress, 0);
      this.currentScene.render(ctx);
      ctx.translate(canvasWidth * progress, 0);
    }

    // Slide in next scene
    if (this.nextScene) {
      ctx.translate(canvasWidth * (1 - progress), 0);
      this.nextScene.render(ctx);
      ctx.translate(-canvasWidth * (1 - progress), 0);
    }

    ctx.restore();
  }

  /**
   * Pause current scene
   */
  pauseCurrentScene(): void {
    if (this.currentScene && !this.isTransitioning) {
      this.currentScene.pause();
    }
  }

  /**
   * Resume current scene
   */
  resumeCurrentScene(): void {
    if (this.currentScene && !this.isTransitioning) {
      this.currentScene.resume();
    }
  }

  /**
   * Resize all scenes
   */
  resize(newSize: Size): void {
    for (const scene of this.scenes.values()) {
      scene.resize(newSize);
    }
  }

  /**
   * Check if a transition is in progress
   */
  isTransitionInProgress(): boolean {
    return this.isTransitioning;
  }

  /**
   * Get all registered scene names
   */
  getSceneNames(): string[] {
    return Array.from(this.scenes.keys());
  }

  /**
   * Clear all scenes
   */
  clear(): void {
    if (this.currentScene) {
      this.currentScene.exit();
    }
    this.currentScene = null;
    this.nextScene = null;
    this.scenes.clear();
    this.isTransitioning = false;
  }
}
