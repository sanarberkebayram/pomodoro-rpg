/**
 * Tests for AnimationSystem
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AnimationSystem,
  createSimpleAnimation,
  createIdleAnimation,
  createWalkAnimation,
  createAttackAnimation,
} from '@/rendering/sprites/AnimationSystem';

describe('AnimationSystem', () => {
  let animationSystem: AnimationSystem;

  beforeEach(() => {
    animationSystem = new AnimationSystem();
  });

  describe('initialization', () => {
    it('should create an instance', () => {
      expect(animationSystem).toBeTruthy();
      expect(animationSystem).toBeInstanceOf(AnimationSystem);
    });

    it('should not be playing initially', () => {
      expect(animationSystem.isPlaying()).toBe(false);
    });

    it('should have no current animation', () => {
      expect(animationSystem.getCurrentAnimation()).toBe('');
    });
  });

  describe('animation management', () => {
    it('should add an animation', () => {
      const animation = createIdleAnimation([0], 500);
      animationSystem.addAnimation(animation);

      const success = animationSystem.play('idle');
      expect(success).toBe(true);
      expect(animationSystem.getCurrentAnimation()).toBe('idle');
    });

    it('should remove an animation', () => {
      const animation = createIdleAnimation([0], 500);
      animationSystem.addAnimation(animation);
      animationSystem.removeAnimation('idle');

      const success = animationSystem.play('idle');
      expect(success).toBe(false);
    });
  });

  describe('animation playback', () => {
    it('should play an animation', () => {
      const animation = createIdleAnimation([0], 500);
      animationSystem.addAnimation(animation);

      animationSystem.play('idle');

      expect(animationSystem.isPlaying()).toBe(true);
      expect(animationSystem.getCurrentAnimation()).toBe('idle');
      expect(animationSystem.getCurrentFrame()).toBe(0);
    });

    it('should stop an animation', () => {
      const animation = createIdleAnimation([0], 500);
      animationSystem.addAnimation(animation);

      animationSystem.play('idle');
      animationSystem.stop();

      expect(animationSystem.isPlaying()).toBe(false);
    });

    it('should pause an animation', () => {
      const animation = createIdleAnimation([0], 500);
      animationSystem.addAnimation(animation);

      animationSystem.play('idle');
      animationSystem.pause();

      expect(animationSystem.isPlaying()).toBe(false);
    });

    it('should resume an animation', () => {
      const animation = createIdleAnimation([0], 500);
      animationSystem.addAnimation(animation);

      animationSystem.play('idle');
      animationSystem.pause();
      animationSystem.resume();

      expect(animationSystem.isPlaying()).toBe(true);
    });

    it('should not restart animation if already playing (without restart flag)', () => {
      const animation = createWalkAnimation([0, 1, 2, 3], 150);
      animationSystem.addAnimation(animation);

      animationSystem.play('walk');
      animationSystem.update(200); // Advance to frame 1

      const currentFrame = animationSystem.getCurrentFrame();
      animationSystem.play('walk'); // Try to play again

      expect(animationSystem.getCurrentFrame()).toBe(currentFrame);
    });

    it('should restart animation when restart flag is true', () => {
      const animation = createWalkAnimation([0, 1, 2, 3], 150);
      animationSystem.addAnimation(animation);

      animationSystem.play('walk');
      animationSystem.update(200); // Advance to frame 1

      animationSystem.play('walk', true); // Restart

      expect(animationSystem.getCurrentFrame()).toBe(0);
    });
  });

  describe('animation updates', () => {
    it('should advance frames based on time', () => {
      const animation = createWalkAnimation([0, 1, 2, 3], 100);
      animationSystem.addAnimation(animation);
      animationSystem.play('walk');

      expect(animationSystem.getCurrentFrame()).toBe(0);

      animationSystem.update(150); // Should advance to next frame
      expect(animationSystem.getCurrentFrame()).toBe(1);
    });

    it('should loop animation when configured', () => {
      const animation = createSimpleAnimation('loop', [0, 1, 2], 100, true);
      animationSystem.addAnimation(animation);
      animationSystem.play('loop');

      // Advance through all frames
      animationSystem.update(100);
      animationSystem.update(100);
      animationSystem.update(100);

      // Should loop back to frame 0
      expect(animationSystem.getCurrentFrame()).toBe(0);
      expect(animationSystem.isPlaying()).toBe(true);
    });

    it('should stop at last frame when not looping', () => {
      const animation = createAttackAnimation([0, 1, 2], 100);
      animationSystem.addAnimation(animation);
      animationSystem.play('attack');

      // Advance through all frames
      animationSystem.update(100);
      animationSystem.update(100);
      animationSystem.update(100);

      // Should stop at last frame
      expect(animationSystem.getCurrentFrame()).toBe(2);
      expect(animationSystem.isPlaying()).toBe(false);
    });

    it('should call onComplete callback when animation finishes', () => {
      const onComplete = vi.fn();
      const animation = createSimpleAnimation('test', [0, 1], 100, false);
      animation.onComplete = onComplete;

      animationSystem.addAnimation(animation);
      animationSystem.play('test');

      animationSystem.update(100);
      animationSystem.update(100);

      expect(onComplete).toHaveBeenCalled();
    });

    it('should not update when not playing', () => {
      const animation = createWalkAnimation([0, 1, 2, 3], 100);
      animationSystem.addAnimation(animation);
      animationSystem.play('walk');
      animationSystem.stop();

      const frameBefore = animationSystem.getCurrentFrame();
      animationSystem.update(200);

      expect(animationSystem.getCurrentFrame()).toBe(frameBefore);
    });
  });

  describe('animation state', () => {
    it('should get animation state', () => {
      const animation = createIdleAnimation([0], 500);
      animationSystem.addAnimation(animation);
      animationSystem.play('idle');

      const state = animationSystem.getState();

      expect(state.currentAnimation).toBe('idle');
      expect(state.currentFrame).toBe(0);
      expect(state.isPlaying).toBe(true);
    });

    it('should set animation state', () => {
      const state = {
        currentAnimation: 'walk',
        currentFrame: 2,
        frameTime: 50,
        isPlaying: true,
      };

      animationSystem.setState(state);

      const retrievedState = animationSystem.getState();
      expect(retrievedState.currentAnimation).toBe('walk');
      expect(retrievedState.currentFrame).toBe(2);
      expect(retrievedState.isPlaying).toBe(true);
    });
  });

  describe('helper functions', () => {
    it('should create idle animation', () => {
      const animation = createIdleAnimation([0], 500);

      expect(animation.name).toBe('idle');
      expect(animation.loop).toBe(true);
      expect(animation.frames).toHaveLength(1);
      expect(animation.frames[0].duration).toBe(500);
    });

    it('should create walk animation', () => {
      const animation = createWalkAnimation([0, 1, 2, 3], 150);

      expect(animation.name).toBe('walk');
      expect(animation.loop).toBe(true);
      expect(animation.frames).toHaveLength(4);
      expect(animation.frames[0].duration).toBe(150);
    });

    it('should create attack animation', () => {
      const animation = createAttackAnimation([0, 1, 2], 100);

      expect(animation.name).toBe('attack');
      expect(animation.loop).toBe(false);
      expect(animation.frames).toHaveLength(3);
      expect(animation.frames[0].duration).toBe(100);
    });
  });
});
