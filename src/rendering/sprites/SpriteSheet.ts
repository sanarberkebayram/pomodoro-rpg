/**
 * SpriteSheet - Helper utilities for working with sprite sheets
 * Provides utilities for frame extraction and sprite rendering
 */

import type { SpriteFrame } from '../types';
import { assetLoader } from '../utils/AssetLoader';

export interface SpriteSheetConfig {
  id: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  frames?: number;
  padding?: number;
  margin?: number;
}

/**
 * Load a sprite sheet and register it with the asset loader
 */
export async function loadSpriteSheet(config: SpriteSheetConfig): Promise<void> {
  await assetLoader.loadSpriteSheet(config.id, config.url, config.frameWidth, config.frameHeight);
}

/**
 * Load multiple sprite sheets
 */
export async function loadSpriteSheets(configs: SpriteSheetConfig[]): Promise<void> {
  const loadPromises = configs.map((config) => loadSpriteSheet(config));
  await Promise.all(loadPromises);
}

/**
 * Get a sprite sheet by ID
 */
export function getSpriteSheet(id: string): ReturnType<typeof assetLoader.getSpriteSheet> {
  return assetLoader.getSpriteSheet(id);
}

/**
 * Check if a sprite sheet is loaded
 */
export function isSpriteSheetLoaded(id: string): boolean {
  return assetLoader.isLoaded(id);
}

/**
 * Get a specific frame from a sprite sheet
 */
export function getSpriteSheetFrame(
  spriteSheetId: string,
  frameIndex: number
): SpriteFrame | undefined {
  const spriteSheet = assetLoader.getSpriteSheet(spriteSheetId);
  if (!spriteSheet) {
    return undefined;
  }

  return spriteSheet.frames[frameIndex];
}

/**
 * Get frame count for a sprite sheet
 */
export function getSpriteSheetFrameCount(spriteSheetId: string): number {
  const spriteSheet = assetLoader.getSpriteSheet(spriteSheetId);
  return spriteSheet?.frames.length ?? 0;
}

/**
 * Render a specific frame from a sprite sheet
 */
export function renderSpriteSheetFrame(
  ctx: CanvasRenderingContext2D,
  spriteSheetId: string,
  frameIndex: number,
  x: number,
  y: number,
  width?: number,
  height?: number
): void {
  const spriteSheet = assetLoader.getSpriteSheet(spriteSheetId);
  if (!spriteSheet?.image) {
    return;
  }

  const frame = spriteSheet.frames[frameIndex];
  if (!frame) {
    return;
  }

  const renderWidth = width ?? frame.width;
  const renderHeight = height ?? frame.height;

  ctx.drawImage(
    spriteSheet.image,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    x,
    y,
    renderWidth,
    renderHeight
  );
}

/**
 * Create frame indices for an animation sequence
 */
export function createFrameSequence(start: number, end: number): number[] {
  const frames: number[] = [];
  for (let i = start; i <= end; i++) {
    frames.push(i);
  }
  return frames;
}

/**
 * Create a grid-based frame mapping
 */
export function createFrameGrid(rows: number, cols: number): number[] {
  const frames: number[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      frames.push(row * cols + col);
    }
  }
  return frames;
}
