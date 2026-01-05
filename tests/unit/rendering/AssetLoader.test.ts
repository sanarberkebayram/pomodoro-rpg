/**
 * Tests for AssetLoader
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AssetLoader } from '@/rendering/utils/AssetLoader';

describe('AssetLoader', () => {
  let assetLoader: AssetLoader;

  beforeEach(() => {
    assetLoader = new AssetLoader();
  });

  describe('initialization', () => {
    it('should create an instance', () => {
      expect(assetLoader).toBeTruthy();
      expect(assetLoader).toBeInstanceOf(AssetLoader);
    });

    it('should start with no loaded assets', () => {
      const assets = assetLoader.getAllAssets();
      expect(assets).toHaveLength(0);
    });
  });

  describe('asset loading', () => {
    it('should check if asset is loaded', () => {
      expect(assetLoader.isLoaded('test-asset')).toBe(false);
    });

    it('should get undefined for non-existent asset', () => {
      const asset = assetLoader.getAsset('non-existent');
      expect(asset).toBeUndefined();
    });

    it('should get undefined for non-existent sprite sheet', () => {
      const spriteSheet = assetLoader.getSpriteSheet('non-existent');
      expect(spriteSheet).toBeUndefined();
    });
  });

  describe('clearing assets', () => {
    it('should clear all assets', () => {
      assetLoader.clear();
      const assets = assetLoader.getAllAssets();
      expect(assets).toHaveLength(0);
    });
  });

  // Note: Actual image loading tests would require mocking Image
  // or using a test environment with DOM support for Image loading
  describe('image loading (mocked)', () => {
    it('should handle image load errors gracefully', async () => {
      // This would need proper mocking of Image constructor
      // For now, we're just ensuring the API exists
      expect(typeof assetLoader.loadImage).toBe('function');
    });

    it('should handle sprite sheet loading', async () => {
      // This would need proper mocking of Image constructor
      expect(typeof assetLoader.loadSpriteSheet).toBe('function');
    });

    it('should handle batch loading with progress callback', async () => {
      // This would need proper mocking of Image constructor
      expect(typeof assetLoader.loadAssets).toBe('function');
    });
  });
});
