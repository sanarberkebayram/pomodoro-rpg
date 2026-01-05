/**
 * Tests for SceneManager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SceneManager } from '@/rendering/SceneManager';
import { RaidScene } from '@/rendering/scenes/RaidScene';
import { ExpeditionScene } from '@/rendering/scenes/ExpeditionScene';

describe('SceneManager', () => {
  let sceneManager: SceneManager;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    sceneManager = new SceneManager();
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get context');
    ctx = context;
  });

  describe('initialization', () => {
    it('should create an instance', () => {
      expect(sceneManager).toBeTruthy();
      expect(sceneManager).toBeInstanceOf(SceneManager);
    });

    it('should have no current scene initially', () => {
      expect(sceneManager.getCurrentScene()).toBeNull();
    });

    it('should not be transitioning initially', () => {
      expect(sceneManager.isTransitionInProgress()).toBe(false);
    });
  });

  describe('scene registration', () => {
    it('should register a scene', () => {
      const scene = new RaidScene({ name: 'Raid' }, { width: 800, height: 600 });
      sceneManager.registerScene(scene);

      const registered = sceneManager.getScene('Raid');
      expect(registered).toBe(scene);
    });

    it('should unregister a scene', () => {
      const scene = new RaidScene({ name: 'Raid' }, { width: 800, height: 600 });
      sceneManager.registerScene(scene);
      sceneManager.unregisterScene('Raid');

      const registered = sceneManager.getScene('Raid');
      expect(registered).toBeUndefined();
    });

    it('should get all scene names', () => {
      const raid = new RaidScene({ name: 'Raid' }, { width: 800, height: 600 });
      const expedition = new ExpeditionScene({ name: 'Expedition' }, { width: 800, height: 600 });

      sceneManager.registerScene(raid);
      sceneManager.registerScene(expedition);

      const names = sceneManager.getSceneNames();
      expect(names).toContain('Raid');
      expect(names).toContain('Expedition');
      expect(names).toHaveLength(2);
    });
  });

  describe('scene switching', () => {
    it('should switch to a registered scene instantly', async () => {
      const scene = new RaidScene({ name: 'Raid' }, { width: 800, height: 600 });
      sceneManager.registerScene(scene);

      await sceneManager.switchScene('Raid');

      expect(sceneManager.getCurrentScene()).toBe(scene);
      expect(scene.isActive()).toBe(true);
    });

    it('should throw error when switching to unregistered scene', async () => {
      await expect(sceneManager.switchScene('NonExistent')).rejects.toThrow(
        'Scene "NonExistent" not found'
      );
    });

    it('should exit old scene when switching', async () => {
      const raid = new RaidScene({ name: 'Raid' }, { width: 800, height: 600 });
      const expedition = new ExpeditionScene({ name: 'Expedition' }, { width: 800, height: 600 });

      sceneManager.registerScene(raid);
      sceneManager.registerScene(expedition);

      await sceneManager.switchScene('Raid');
      expect(raid.isActive()).toBe(true);

      await sceneManager.switchScene('Expedition');
      expect(raid.isActive()).toBe(false);
      expect(expedition.isActive()).toBe(true);
    });
  });

  describe('scene updates', () => {
    it('should update current scene', async () => {
      const scene = new RaidScene({ name: 'Raid' }, { width: 800, height: 600 });
      sceneManager.registerScene(scene);
      await sceneManager.switchScene('Raid');

      const initialTime = scene.getTimeElapsed();
      sceneManager.update(16); // ~60fps frame

      expect(scene.getTimeElapsed()).toBeGreaterThan(initialTime);
    });

    it('should not update when no scene is active', () => {
      expect(() => sceneManager.update(16)).not.toThrow();
    });
  });

  describe('scene rendering', () => {
    it('should render current scene', async () => {
      const scene = new RaidScene({ name: 'Raid' }, { width: 800, height: 600 });
      sceneManager.registerScene(scene);
      await sceneManager.switchScene('Raid');

      expect(() => sceneManager.render(ctx)).not.toThrow();
    });

    it('should not throw when rendering with no scene', () => {
      expect(() => sceneManager.render(ctx)).not.toThrow();
    });
  });

  describe('scene pause/resume', () => {
    it('should pause current scene', async () => {
      const scene = new RaidScene({ name: 'Raid' }, { width: 800, height: 600 });
      sceneManager.registerScene(scene);
      await sceneManager.switchScene('Raid');

      sceneManager.pauseCurrentScene();
      expect(scene.isPaused()).toBe(true);
    });

    it('should resume current scene', async () => {
      const scene = new RaidScene({ name: 'Raid' }, { width: 800, height: 600 });
      sceneManager.registerScene(scene);
      await sceneManager.switchScene('Raid');

      sceneManager.pauseCurrentScene();
      sceneManager.resumeCurrentScene();
      expect(scene.isPaused()).toBe(false);
    });
  });

  describe('scene resize', () => {
    it('should resize all registered scenes', () => {
      const raid = new RaidScene({ name: 'Raid' }, { width: 800, height: 600 });
      const expedition = new ExpeditionScene({ name: 'Expedition' }, { width: 800, height: 600 });

      sceneManager.registerScene(raid);
      sceneManager.registerScene(expedition);

      expect(() => sceneManager.resize({ width: 1024, height: 768 })).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should clear all scenes', async () => {
      const scene = new RaidScene({ name: 'Raid' }, { width: 800, height: 600 });
      sceneManager.registerScene(scene);
      await sceneManager.switchScene('Raid');

      sceneManager.clear();

      expect(sceneManager.getCurrentScene()).toBeNull();
      expect(sceneManager.getSceneNames()).toHaveLength(0);
    });
  });
});
