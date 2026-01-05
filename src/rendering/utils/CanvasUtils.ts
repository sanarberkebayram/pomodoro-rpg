/**
 * Canvas utility functions for rendering and manipulation
 */

import type { Size, Position, Bounds } from '../types';

/**
 * Clear the entire canvas
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, backgroundColor?: string): void {
  const { width, height } = ctx.canvas;

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }
}

/**
 * Get device pixel ratio for crisp rendering on retina displays
 */
export function getPixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * Calculate canvas size based on container and device pixel ratio
 */
export function calculateCanvasSize(container: HTMLElement, pixelRatio?: number): Size {
  const ratio = pixelRatio || getPixelRatio();
  const rect = container.getBoundingClientRect();

  return {
    width: rect.width * ratio,
    height: rect.height * ratio,
  };
}

/**
 * Set canvas size with proper scaling for retina displays
 */
export function setCanvasSize(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  pixelRatio?: number
): void {
  const ratio = pixelRatio || getPixelRatio();

  // Set actual canvas size (scaled)
  canvas.width = width * ratio;
  canvas.height = height * ratio;

  // Set display size (CSS)
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Scale context to match
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(ratio, ratio);
  }
}

/**
 * Check if a point is within bounds
 */
export function isPointInBounds(point: Position, bounds: Bounds): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

/**
 * Draw a rounded rectangle
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw text with shadow for better readability
 */
export function drawTextWithShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string = '#ffffff',
  shadowColor: string = '#000000',
  shadowBlur: number = 4
): void {
  // Draw shadow
  ctx.save();
  ctx.fillStyle = shadowColor;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.fillText(text, x, y);
  ctx.restore();

  // Draw text
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Position, p2: Position): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Save canvas as image data URL
 */
export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality?: number
): string {
  return canvas.toDataURL(type, quality);
}

/**
 * Create an offscreen canvas for optimized rendering
 */
export function createOffscreenCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
