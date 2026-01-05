/**
 * Vitest setup file
 * Provides browser-like globals for testing
 */

import { beforeEach } from 'vitest';

// Mock localStorage implementation
class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value.toString();
  }

  removeItem(key: string): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// Create the localStorage instance
const localStorageMock = new LocalStorageMock();

// Set up Storage constructor for vi.spyOn compatibility
(globalThis as { Storage?: typeof LocalStorageMock }).Storage = LocalStorageMock;

// Set up localStorage on globalThis
(globalThis as { localStorage?: Storage }).localStorage = localStorageMock;

// Set up window to point to globalThis for SaveSystem compatibility (window.setTimeout, etc.)
(globalThis as { window?: typeof globalThis }).window = globalThis;

// Mock Canvas and CanvasRenderingContext2D
class CanvasRenderingContext2DMock {
  canvas: HTMLCanvasElement;
  fillStyle: string | CanvasGradient | CanvasPattern = '#000000';
  strokeStyle: string | CanvasGradient | CanvasPattern = '#000000';
  lineWidth: number = 1;
  lineCap: CanvasLineCap = 'butt';
  lineJoin: CanvasLineJoin = 'miter';
  miterLimit: number = 10;
  shadowBlur: number = 0;
  shadowColor: string = '';
  shadowOffsetX: number = 0;
  shadowOffsetY: number = 0;
  font: string = '10px sans-serif';
  textAlign: CanvasTextAlign = 'start';
  textBaseline: CanvasTextBaseline = 'alphabetic';
  globalAlpha: number = 1;
  globalCompositeOperation: GlobalCompositeOperation = 'source-over';
  imageSmoothingEnabled: boolean = true;
  imageSmoothingQuality: ImageSmoothingQuality = 'low';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  // Drawing methods
  clearRect(): void {}
  fillRect(): void {}
  strokeRect(): void {}
  fillText(): void {}
  strokeText(): void {}
  measureText(): TextMetrics {
    return { width: 0 } as TextMetrics;
  }

  // Path methods
  beginPath(): void {}
  closePath(): void {}
  moveTo(): void {}
  lineTo(): void {}
  quadraticCurveTo(): void {}
  bezierCurveTo(): void {}
  arc(): void {}
  arcTo(): void {}
  ellipse(): void {}
  rect(): void {}
  fill(): void {}
  stroke(): void {}
  clip(): void {}
  isPointInPath(): boolean {
    return false;
  }
  isPointInStroke(): boolean {
    return false;
  }

  // Transformations
  scale(): void {}
  rotate(): void {}
  translate(): void {}
  transform(): void {}
  setTransform(): void {}
  resetTransform(): void {}

  // State
  save(): void {}
  restore(): void {}

  // Image drawing
  drawImage(): void {}
  createImageData(): ImageData {
    return {} as ImageData;
  }
  getImageData(): ImageData {
    return {} as ImageData;
  }
  putImageData(): void {}

  // Gradients and patterns
  createLinearGradient(): CanvasGradient {
    return {
      addColorStop: () => {},
    } as CanvasGradient;
  }
  createRadialGradient(): CanvasGradient {
    return {
      addColorStop: () => {},
    } as CanvasGradient;
  }
  createPattern(): CanvasPattern | null {
    return null;
  }
}

// Mock HTMLCanvasElement.getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (
  contextId: string,
  options?: unknown
): RenderingContext | null {
  if (contextId === '2d') {
    return new CanvasRenderingContext2DMock(this) as unknown as CanvasRenderingContext2D;
  }
  return originalGetContext.call(this, contextId, options);
};

// Clear localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
});
