/**
 * Tests for CanvasRenderer
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CanvasRenderer } from '@/rendering/CanvasRenderer';
import type { RenderLayer } from '@/rendering/types';

describe('CanvasRenderer', () => {
  let canvas: HTMLCanvasElement;
  let renderer: CanvasRenderer;

  beforeEach(() => {
    // Create a canvas element for testing
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    renderer = new CanvasRenderer({
      canvas,
      config: {
        width: 800,
        height: 600,
        pixelRatio: 1,
        backgroundColor: '#1a1a1a',
      },
      targetFPS: 60,
    });
  });

  afterEach(() => {
    renderer.destroy();
  });

  describe('initialization', () => {
    it('should initialize with correct configuration', () => {
      const config = renderer.getConfig();
      expect(config.width).toBe(800);
      expect(config.height).toBe(600);
      expect(config.backgroundColor).toBe('#1a1a1a');
    });

    it('should get valid 2D context', () => {
      const ctx = renderer.getContext();
      expect(ctx).toBeTruthy();
      expect(ctx).toHaveProperty('fillRect');
      expect(ctx).toHaveProperty('strokeRect');
      expect(ctx).toHaveProperty('clearRect');
    });

    it('should not be running initially', () => {
      expect(renderer.isRendering()).toBe(false);
    });
  });

  describe('layer management', () => {
    it('should add and retrieve layers', () => {
      const layer: RenderLayer = {
        id: 'test-layer',
        zIndex: 1,
        visible: true,
        render: vi.fn(),
      };

      renderer.addLayer(layer);
      const retrieved = renderer.getLayer('test-layer');

      expect(retrieved).toBe(layer);
    });

    it('should remove layers', () => {
      const layer: RenderLayer = {
        id: 'test-layer',
        zIndex: 1,
        visible: true,
        render: vi.fn(),
      };

      renderer.addLayer(layer);
      renderer.removeLayer('test-layer');
      const retrieved = renderer.getLayer('test-layer');

      expect(retrieved).toBeUndefined();
    });

    it('should toggle layer visibility', () => {
      const layer: RenderLayer = {
        id: 'test-layer',
        zIndex: 1,
        visible: true,
        render: vi.fn(),
      };

      renderer.addLayer(layer);
      renderer.setLayerVisibility('test-layer', false);

      const retrieved = renderer.getLayer('test-layer');
      expect(retrieved?.visible).toBe(false);
    });

    it('should clear all layers', () => {
      const layer1: RenderLayer = {
        id: 'layer-1',
        zIndex: 1,
        visible: true,
        render: vi.fn(),
      };
      const layer2: RenderLayer = {
        id: 'layer-2',
        zIndex: 2,
        visible: true,
        render: vi.fn(),
      };

      renderer.addLayer(layer1);
      renderer.addLayer(layer2);
      renderer.clearLayers();

      expect(renderer.getLayer('layer-1')).toBeUndefined();
      expect(renderer.getLayer('layer-2')).toBeUndefined();
    });
  });

  describe('rendering', () => {
    it('should start rendering', () => {
      renderer.start();
      expect(renderer.isRendering()).toBe(true);
    });

    it('should stop rendering', () => {
      renderer.start();
      renderer.stop();
      expect(renderer.isRendering()).toBe(false);
    });

    it('should not start multiple times', () => {
      renderer.start();
      renderer.start();
      expect(renderer.isRendering()).toBe(true);
    });

    it('should render visible layers in order', (done) => {
      const renderOrder: string[] = [];

      const layer1: RenderLayer = {
        id: 'layer-1',
        zIndex: 2,
        visible: true,
        render: () => renderOrder.push('layer-1'),
      };

      const layer2: RenderLayer = {
        id: 'layer-2',
        zIndex: 1,
        visible: true,
        render: () => renderOrder.push('layer-2'),
      };

      const layer3: RenderLayer = {
        id: 'layer-3',
        zIndex: 3,
        visible: false,
        render: () => renderOrder.push('layer-3'),
      };

      renderer.addLayer(layer1);
      renderer.addLayer(layer2);
      renderer.addLayer(layer3);

      renderer.start();

      // Wait for a few frames
      setTimeout(() => {
        renderer.stop();

        // layer-2 should render first (zIndex 1), then layer-1 (zIndex 2)
        // layer-3 should not render (visible: false)
        expect(renderOrder).toContain('layer-2');
        expect(renderOrder).toContain('layer-1');
        expect(renderOrder).not.toContain('layer-3');

        // Check order (first occurrence)
        const layer2Index = renderOrder.indexOf('layer-2');
        const layer1Index = renderOrder.indexOf('layer-1');
        expect(layer2Index).toBeLessThan(layer1Index);

        done();
      }, 100);
    });
  });

  describe('statistics', () => {
    it('should provide rendering statistics', () => {
      const stats = renderer.getStats();
      expect(stats).toHaveProperty('fps');
      expect(stats).toHaveProperty('frameTime');
      expect(stats).toHaveProperty('drawCalls');
    });

    it('should update statistics during rendering', (done) => {
      renderer.start();

      setTimeout(() => {
        renderer.stop();
        const stats = renderer.getStats();

        expect(stats.fps).toBeGreaterThan(0);
        expect(stats.frameTime).toBeGreaterThan(0);

        done();
      }, 100);
    });
  });

  describe('configuration', () => {
    it('should resize canvas', () => {
      renderer.resize(1024, 768);
      const config = renderer.getConfig();

      expect(config.width).toBe(1024);
      expect(config.height).toBe(768);
    });

    it('should update configuration', () => {
      renderer.updateConfig({
        backgroundColor: '#ff0000',
      });

      const config = renderer.getConfig();
      expect(config.backgroundColor).toBe('#ff0000');
    });
  });

  describe('cleanup', () => {
    it('should destroy renderer and clean up', () => {
      const layer: RenderLayer = {
        id: 'test-layer',
        zIndex: 1,
        visible: true,
        render: vi.fn(),
      };

      renderer.addLayer(layer);
      renderer.start();
      renderer.destroy();

      expect(renderer.isRendering()).toBe(false);
      expect(renderer.getLayer('test-layer')).toBeUndefined();
    });
  });
});
