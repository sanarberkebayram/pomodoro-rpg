/**
 * Main canvas rendering engine
 * Manages the rendering loop, layers, and performance stats
 */

import type { CanvasConfig, RenderLayer, RenderStats } from './types';
import { clearCanvas, getPixelRatio } from './utils/CanvasUtils';

export interface RendererOptions {
  canvas: HTMLCanvasElement;
  config?: Partial<CanvasConfig>;
  targetFPS?: number;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: CanvasConfig;
  private layers: Map<string, RenderLayer> = new Map();
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private targetFrameTime: number;
  private stats: RenderStats = {
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
  };
  private fpsHistory: number[] = [];
  private maxFPSHistoryLength: number = 60;

  constructor(options: RendererOptions) {
    this.canvas = options.canvas;
    const ctx = this.canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }

    this.ctx = ctx;
    this.targetFrameTime = 1000 / (options.targetFPS || 60);

    // Set up canvas configuration
    this.config = {
      width: options.config?.width || 800,
      height: options.config?.height || 600,
      pixelRatio: options.config?.pixelRatio || getPixelRatio(),
      backgroundColor: options.config?.backgroundColor || '#1a1a1a',
    };

    this.initializeCanvas();
  }

  /**
   * Initialize canvas with proper sizing and scaling
   */
  private initializeCanvas(): void {
    const { width, height, pixelRatio } = this.config;

    // Set actual size (scaled for retina)
    this.canvas.width = width * pixelRatio;
    this.canvas.height = height * pixelRatio;

    // Set display size
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Scale context
    this.ctx.scale(pixelRatio, pixelRatio);

    // Enable image smoothing for better quality
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  /**
   * Add a render layer
   */
  addLayer(layer: RenderLayer): void {
    this.layers.set(layer.id, layer);
    this.sortLayers();
  }

  /**
   * Remove a render layer
   */
  removeLayer(id: string): void {
    this.layers.delete(id);
  }

  /**
   * Get a render layer by ID
   */
  getLayer(id: string): RenderLayer | undefined {
    return this.layers.get(id);
  }

  /**
   * Set layer visibility
   */
  setLayerVisibility(id: string, visible: boolean): void {
    const layer = this.layers.get(id);
    if (layer) {
      layer.visible = visible;
    }
  }

  /**
   * Sort layers by zIndex
   */
  private sortLayers(): void {
    const sortedLayers = Array.from(this.layers.entries()).sort(
      (a, b) => a[1].zIndex - b[1].zIndex
    );
    this.layers = new Map(sortedLayers);
  }

  /**
   * Start the rendering loop
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.renderLoop(this.lastFrameTime);
  }

  /**
   * Stop the rendering loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main rendering loop
   */
  private renderLoop(currentTime: number): void {
    if (!this.isRunning) {
      return;
    }

    const deltaTime = currentTime - this.lastFrameTime;

    // Frame rate limiting
    if (deltaTime >= this.targetFrameTime) {
      this.lastFrameTime = currentTime - (deltaTime % this.targetFrameTime);

      // Update stats
      this.updateStats(deltaTime);

      // Clear canvas
      clearCanvas(this.ctx, this.config.backgroundColor);

      // Render all visible layers
      this.renderLayers();
    }

    this.animationFrameId = requestAnimationFrame((time) => this.renderLoop(time));
  }

  /**
   * Render all visible layers in order
   */
  private renderLayers(): void {
    let drawCalls = 0;

    for (const layer of this.layers.values()) {
      if (layer.visible) {
        this.ctx.save();
        layer.render(this.ctx);
        this.ctx.restore();
        drawCalls++;
      }
    }

    this.stats.drawCalls = drawCalls;
  }

  /**
   * Update rendering statistics
   */
  private updateStats(deltaTime: number): void {
    const fps = 1000 / deltaTime;
    this.fpsHistory.push(fps);

    if (this.fpsHistory.length > this.maxFPSHistoryLength) {
      this.fpsHistory.shift();
    }

    // Calculate average FPS
    const avgFPS = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;

    this.stats.fps = Math.round(avgFPS);
    this.stats.frameTime = deltaTime;
  }

  /**
   * Get current rendering statistics
   */
  getStats(): RenderStats {
    return { ...this.stats };
  }

  /**
   * Resize canvas
   */
  resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    this.initializeCanvas();
  }

  /**
   * Get canvas context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get canvas configuration
   */
  getConfig(): CanvasConfig {
    return { ...this.config };
  }

  /**
   * Update canvas configuration
   */
  updateConfig(config: Partial<CanvasConfig>): void {
    this.config = { ...this.config, ...config };
    this.initializeCanvas();
  }

  /**
   * Clear all layers
   */
  clearLayers(): void {
    this.layers.clear();
  }

  /**
   * Check if renderer is running
   */
  isRendering(): boolean {
    return this.isRunning;
  }

  /**
   * Destroy renderer and clean up resources
   */
  destroy(): void {
    this.stop();
    this.clearLayers();
    this.fpsHistory = [];
  }
}
