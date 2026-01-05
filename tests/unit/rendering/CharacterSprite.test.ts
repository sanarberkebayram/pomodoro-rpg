/**
 * Tests for CharacterSprite
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CharacterSprite } from '@/rendering/sprites/CharacterSprite';
import { createIdleAnimation, createWalkAnimation } from '@/rendering/sprites/AnimationSystem';

describe('CharacterSprite', () => {
  let characterSprite: CharacterSprite;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get context');
    ctx = context;

    characterSprite = new CharacterSprite({
      spriteSheetId: 'test-sprite',
      position: { x: 100, y: 100 },
      size: { width: 64, height: 64 },
      animations: [createIdleAnimation([0], 500), createWalkAnimation([0, 1, 2, 3], 150)],
      defaultAnimation: 'idle',
    });
  });

  describe('initialization', () => {
    it('should create an instance', () => {
      expect(characterSprite).toBeTruthy();
      expect(characterSprite).toBeInstanceOf(CharacterSprite);
    });

    it('should set initial position', () => {
      const position = characterSprite.getPosition();
      expect(position.x).toBe(100);
      expect(position.y).toBe(100);
    });

    it('should set initial size', () => {
      const size = characterSprite.getSize();
      expect(size.width).toBe(64);
      expect(size.height).toBe(64);
    });

    it('should start with default animation', () => {
      expect(characterSprite.getCurrentAnimation()).toBe('idle');
      expect(characterSprite.isAnimationPlaying()).toBe(true);
    });

    it('should be visible by default', () => {
      expect(characterSprite.isVisible()).toBe(true);
    });

    it('should have full opacity by default', () => {
      expect(characterSprite.getOpacity()).toBe(1);
    });

    it('should have default scale of 1', () => {
      expect(characterSprite.getScale()).toBe(1);
    });

    it('should not be flipped horizontally by default', () => {
      expect(characterSprite.isFlippedHorizontal()).toBe(false);
    });
  });

  describe('animation control', () => {
    it('should play animation', () => {
      const result = characterSprite.playAnimation('walk');
      expect(result).toBe(true);
      expect(characterSprite.getCurrentAnimation()).toBe('walk');
    });

    it('should return false when playing non-existent animation', () => {
      const result = characterSprite.playAnimation('nonexistent');
      expect(result).toBe(false);
    });

    it('should stop animation', () => {
      characterSprite.stopAnimation();
      expect(characterSprite.isAnimationPlaying()).toBe(false);
    });

    it('should pause animation', () => {
      characterSprite.pauseAnimation();
      expect(characterSprite.isAnimationPlaying()).toBe(false);
    });

    it('should resume animation', () => {
      characterSprite.pauseAnimation();
      characterSprite.resumeAnimation();
      expect(characterSprite.isAnimationPlaying()).toBe(true);
    });
  });

  describe('position and size', () => {
    it('should update position', () => {
      characterSprite.setPosition({ x: 200, y: 300 });
      const position = characterSprite.getPosition();
      expect(position.x).toBe(200);
      expect(position.y).toBe(300);
    });

    it('should update size', () => {
      characterSprite.setSize({ width: 128, height: 128 });
      const size = characterSprite.getSize();
      expect(size.width).toBe(128);
      expect(size.height).toBe(128);
    });

    it('should get bounds', () => {
      const bounds = characterSprite.getBounds();
      expect(bounds.x).toBe(100);
      expect(bounds.y).toBe(100);
      expect(bounds.width).toBe(64);
      expect(bounds.height).toBe(64);
    });

    it('should calculate bounds with scale', () => {
      characterSprite.setScale(2);
      const bounds = characterSprite.getBounds();
      expect(bounds.width).toBe(128);
      expect(bounds.height).toBe(128);
    });
  });

  describe('visual properties', () => {
    it('should update scale', () => {
      characterSprite.setScale(2);
      expect(characterSprite.getScale()).toBe(2);
    });

    it('should toggle horizontal flip', () => {
      characterSprite.setFlipHorizontal(true);
      expect(characterSprite.isFlippedHorizontal()).toBe(true);
    });

    it('should toggle visibility', () => {
      characterSprite.setVisible(false);
      expect(characterSprite.isVisible()).toBe(false);
    });

    it('should update opacity', () => {
      characterSprite.setOpacity(0.5);
      expect(characterSprite.getOpacity()).toBe(0.5);
    });

    it('should clamp opacity to 0-1 range', () => {
      characterSprite.setOpacity(1.5);
      expect(characterSprite.getOpacity()).toBe(1);

      characterSprite.setOpacity(-0.5);
      expect(characterSprite.getOpacity()).toBe(0);
    });
  });

  describe('update and render', () => {
    it('should update animation', () => {
      characterSprite.playAnimation('walk');
      const initialAnimation = characterSprite.getCurrentAnimation();

      characterSprite.update(16);

      expect(characterSprite.getCurrentAnimation()).toBe(initialAnimation);
    });

    it('should render without errors', () => {
      expect(() => characterSprite.render(ctx)).not.toThrow();
    });

    it('should not render when not visible', () => {
      characterSprite.setVisible(false);
      expect(() => characterSprite.render(ctx)).not.toThrow();
    });

    it('should render placeholder when sprite sheet not loaded', () => {
      // Sprite sheet 'test-sprite' doesn't exist, so it should render placeholder
      expect(() => characterSprite.render(ctx)).not.toThrow();
    });
  });

  describe('sprite sheet ID', () => {
    it('should return sprite sheet ID', () => {
      expect(characterSprite.getSpriteSheetId()).toBe('test-sprite');
    });
  });

  describe('configuration options', () => {
    it('should accept custom scale in config', () => {
      const sprite = new CharacterSprite({
        spriteSheetId: 'test',
        position: { x: 0, y: 0 },
        size: { width: 64, height: 64 },
        animations: [createIdleAnimation()],
        scale: 2,
      });

      expect(sprite.getScale()).toBe(2);
    });

    it('should accept horizontal flip in config', () => {
      const sprite = new CharacterSprite({
        spriteSheetId: 'test',
        position: { x: 0, y: 0 },
        size: { width: 64, height: 64 },
        animations: [createIdleAnimation()],
        flipHorizontal: true,
      });

      expect(sprite.isFlippedHorizontal()).toBe(true);
    });

    it('should work without default animation', () => {
      const sprite = new CharacterSprite({
        spriteSheetId: 'test',
        position: { x: 0, y: 0 },
        size: { width: 64, height: 64 },
        animations: [createIdleAnimation()],
      });

      expect(sprite.getCurrentAnimation()).toBe('');
      expect(sprite.isAnimationPlaying()).toBe(false);
    });
  });
});
