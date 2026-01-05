/**
 * Asset loading system for images and sprite sheets
 */

import type { Asset, SpriteSheet, SpriteFrame } from '../types';

export type AssetLoadCallback = (loaded: number, total: number) => void;

export class AssetLoader {
  private assets: Map<string, Asset> = new Map();
  private loading: Map<string, Promise<Asset>> = new Map();

  /**
   * Load a single image asset
   */
  async loadImage(id: string, url: string): Promise<Asset> {
    // Return cached asset if already loaded
    const cached = this.assets.get(id);
    if (cached?.loaded) {
      return cached;
    }

    // Return ongoing load promise if already loading
    const ongoing = this.loading.get(id);
    if (ongoing) {
      return ongoing;
    }

    // Start loading
    const loadPromise = this.createImageLoadPromise(id, url);
    this.loading.set(id, loadPromise);

    try {
      const asset = await loadPromise;
      this.assets.set(id, asset);
      return asset;
    } finally {
      this.loading.delete(id);
    }
  }

  /**
   * Load a sprite sheet
   */
  async loadSpriteSheet(
    id: string,
    url: string,
    frameWidth: number,
    frameHeight: number
  ): Promise<SpriteSheet> {
    const asset = await this.loadImage(id, url);

    if (!asset.image) {
      throw new Error(`Failed to load sprite sheet: ${id}`);
    }

    const frames = this.generateSpriteFrames(asset.image, frameWidth, frameHeight);

    const spriteSheet: SpriteSheet = {
      ...asset,
      type: 'spritesheet',
      frameWidth,
      frameHeight,
      frames,
    };

    this.assets.set(id, spriteSheet);
    return spriteSheet;
  }

  /**
   * Load multiple assets with progress callback
   */
  async loadAssets(
    assetConfigs: Array<{
      id: string;
      url: string;
      type: 'image' | 'spritesheet';
      frameWidth?: number;
      frameHeight?: number;
    }>,
    onProgress?: AssetLoadCallback
  ): Promise<void> {
    const total = assetConfigs.length;
    let loaded = 0;

    const loadPromises = assetConfigs.map(async (config) => {
      try {
        if (config.type === 'spritesheet' && config.frameWidth && config.frameHeight) {
          await this.loadSpriteSheet(config.id, config.url, config.frameWidth, config.frameHeight);
        } else {
          await this.loadImage(config.id, config.url);
        }

        loaded++;
        onProgress?.(loaded, total);
      } catch (error) {
        console.error(`Failed to load asset ${config.id}:`, error);
        throw error;
      }
    });

    await Promise.all(loadPromises);
  }

  /**
   * Get a loaded asset by ID
   */
  getAsset(id: string): Asset | undefined {
    return this.assets.get(id);
  }

  /**
   * Get a loaded sprite sheet by ID
   */
  getSpriteSheet(id: string): SpriteSheet | undefined {
    const asset = this.assets.get(id);
    if (asset?.type === 'spritesheet') {
      return asset as SpriteSheet;
    }
    return undefined;
  }

  /**
   * Check if an asset is loaded
   */
  isLoaded(id: string): boolean {
    return this.assets.get(id)?.loaded ?? false;
  }

  /**
   * Get all loaded assets
   */
  getAllAssets(): Asset[] {
    return Array.from(this.assets.values());
  }

  /**
   * Clear all loaded assets
   */
  clear(): void {
    this.assets.clear();
    this.loading.clear();
  }

  /**
   * Create a promise for loading an image
   */
  private createImageLoadPromise(id: string, url: string): Promise<Asset> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        const asset: Asset = {
          id,
          type: 'image',
          url,
          image,
          loaded: true,
        };
        resolve(asset);
      };

      image.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };

      // Start loading
      image.src = url;
    });
  }

  /**
   * Generate sprite frames from a sprite sheet image
   */
  private generateSpriteFrames(
    image: HTMLImageElement,
    frameWidth: number,
    frameHeight: number
  ): SpriteFrame[] {
    const frames: SpriteFrame[] = [];
    const cols = Math.floor(image.width / frameWidth);
    const rows = Math.floor(image.height / frameHeight);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        frames.push({
          x: col * frameWidth,
          y: row * frameHeight,
          width: frameWidth,
          height: frameHeight,
        });
      }
    }

    return frames;
  }
}

// Export singleton instance
export const assetLoader = new AssetLoader();
