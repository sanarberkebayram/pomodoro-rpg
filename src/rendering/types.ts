/**
 * Canvas rendering types and interfaces
 */

export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Animation {
  name: string;
  frames: SpriteFrame[];
  frameRate: number;
  loop: boolean;
}

export interface Asset {
  id: string;
  type: 'image' | 'spritesheet';
  url: string;
  image?: HTMLImageElement;
  loaded: boolean;
}

export interface SpriteSheet extends Asset {
  type: 'spritesheet';
  frameWidth: number;
  frameHeight: number;
  frames: SpriteFrame[];
}

export interface RenderLayer {
  id: string;
  zIndex: number;
  visible: boolean;
  render: (ctx: CanvasRenderingContext2D) => void;
}

export interface CanvasConfig {
  width: number;
  height: number;
  pixelRatio: number;
  backgroundColor: string;
}

export interface RenderStats {
  fps: number;
  frameTime: number;
  drawCalls: number;
}
