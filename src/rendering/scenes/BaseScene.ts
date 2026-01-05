/**
 * BaseScene - Abstract base class for all game scenes
 * Provides common functionality for scene lifecycle and rendering
 */

import type { SceneConfig, SceneState, GameObject } from './types';
import type { Size } from '../types';

export abstract class BaseScene {
  protected config: SceneConfig;
  protected state: SceneState;
  protected gameObjects: Map<string, GameObject> = new Map();
  protected canvasSize: Size;

  constructor(config: SceneConfig, canvasSize: Size) {
    this.config = {
      clearBeforeRender: true,
      ...config,
    };

    this.state = {
      isActive: false,
      isPaused: false,
      timeElapsed: 0,
    };

    this.canvasSize = canvasSize;
  }

  /**
   * Initialize scene (called once when scene is created)
   */
  async initialize(): Promise<void> {
    await this.onInitialize();
  }

  /**
   * Enter scene (called when scene becomes active)
   */
  enter(): void {
    this.state.isActive = true;
    this.state.isPaused = false;
    this.state.timeElapsed = 0;
    this.onEnter();
  }

  /**
   * Exit scene (called when scene becomes inactive)
   */
  exit(): void {
    this.state.isActive = false;
    this.onExit();
  }

  /**
   * Pause scene
   */
  pause(): void {
    this.state.isPaused = true;
    this.onPause();
  }

  /**
   * Resume scene
   */
  resume(): void {
    this.state.isPaused = false;
    this.onResume();
  }

  /**
   * Update scene state
   */
  update(deltaTime: number): void {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }

    this.state.timeElapsed += deltaTime;
    this.onUpdate(deltaTime);
  }

  /**
   * Render scene
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.state.isActive) {
      return;
    }

    // Clear canvas if configured
    if (this.config.clearBeforeRender) {
      this.clearCanvas(ctx);
    }

    this.onRender(ctx);
  }

  /**
   * Resize scene
   */
  resize(newSize: Size): void {
    this.canvasSize = newSize;
    this.onResize(newSize);
  }

  /**
   * Add a game object to the scene
   */
  protected addGameObject(gameObject: GameObject): void {
    this.gameObjects.set(gameObject.id, gameObject);
  }

  /**
   * Remove a game object from the scene
   */
  protected removeGameObject(id: string): void {
    this.gameObjects.delete(id);
  }

  /**
   * Get a game object by ID
   */
  protected getGameObject(id: string): GameObject | undefined {
    return this.gameObjects.get(id);
  }

  /**
   * Get all game objects sorted by zIndex
   */
  protected getSortedGameObjects(): GameObject[] {
    return Array.from(this.gameObjects.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  /**
   * Clear the canvas with background color
   */
  protected clearCanvas(ctx: CanvasRenderingContext2D): void {
    if (this.config.backgroundColor) {
      ctx.fillStyle = this.config.backgroundColor;
      ctx.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    } else {
      ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    }
  }

  /**
   * Draw a rectangle (helper method)
   */
  protected drawRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    fill: boolean = true
  ): void {
    ctx.save();
    if (fill) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    } else {
      ctx.strokeStyle = color;
      ctx.strokeRect(x, y, width, height);
    }
    ctx.restore();
  }

  /**
   * Draw text (helper method)
   */
  protected drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color: string = '#ffffff',
    font: string = '16px sans-serif',
    align: CanvasTextAlign = 'left'
  ): void {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  /**
   * Check if scene is active
   */
  isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Check if scene is paused
   */
  isPaused(): boolean {
    return this.state.isPaused;
  }

  /**
   * Get scene name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get elapsed time
   */
  getTimeElapsed(): number {
    return this.state.timeElapsed;
  }

  // Abstract methods to be implemented by subclasses

  /**
   * Called once when scene is initialized
   */
  protected abstract onInitialize(): Promise<void>;

  /**
   * Called when scene becomes active
   */
  protected abstract onEnter(): void;

  /**
   * Called when scene becomes inactive
   */
  protected abstract onExit(): void;

  /**
   * Called when scene is paused
   */
  protected abstract onPause(): void;

  /**
   * Called when scene is resumed
   */
  protected abstract onResume(): void;

  /**
   * Called every frame to update scene state
   */
  protected abstract onUpdate(deltaTime: number): void;

  /**
   * Called every frame to render scene
   */
  protected abstract onRender(ctx: CanvasRenderingContext2D): void;

  /**
   * Called when canvas is resized
   */
  protected abstract onResize(newSize: Size): void;
}
