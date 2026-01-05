/**
 * VisualCueRenderer Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualCueRenderer } from '@/rendering/VisualCueRenderer';
import { VisualCue } from '@/core/types/events';

describe('VisualCueRenderer', () => {
  let renderer: VisualCueRenderer;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    renderer = new VisualCueRenderer();

    // Create mock canvas context
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      fillRect: vi.fn(),
      strokeText: vi.fn(),
      fillText: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
    } as unknown as CanvasRenderingContext2D;
  });

  describe('addCue', () => {
    it('should add a visual cue', () => {
      const cue: VisualCue = {
        type: 'sparkle',
        duration: 2000,
        color: '#FFD700',
      };

      renderer.addCue(cue);

      expect(renderer.getActiveCount()).toBe(1);
    });

    it('should add multiple cues', () => {
      const cue1: VisualCue = { type: 'sparkle', duration: 2000 };
      const cue2: VisualCue = { type: 'damage', duration: 1000 };

      renderer.addCue(cue1);
      renderer.addCue(cue2);

      expect(renderer.getActiveCount()).toBe(2);
    });
  });

  describe('update', () => {
    it('should update cue progress', () => {
      const cue: VisualCue = {
        type: 'sparkle',
        duration: 1000,
      };

      renderer.addCue(cue);
      expect(renderer.getActiveCount()).toBe(1);

      // Fast forward time
      vi.useFakeTimers();
      vi.advanceTimersByTime(500);

      renderer.update(16); // ~1 frame

      expect(renderer.getActiveCount()).toBe(1);

      vi.useRealTimers();
    });

    it('should remove expired cues', () => {
      const cue: VisualCue = {
        type: 'sparkle',
        duration: 1000,
      };

      renderer.addCue(cue);

      // Fast forward past duration
      vi.useFakeTimers();
      vi.advanceTimersByTime(1100);

      renderer.update(16);

      expect(renderer.getActiveCount()).toBe(0);

      vi.useRealTimers();
    });

    it('should handle multiple cues with different durations', () => {
      const shortCue: VisualCue = { type: 'sparkle', duration: 500 };
      const longCue: VisualCue = { type: 'damage', duration: 2000 };

      renderer.addCue(shortCue);
      renderer.addCue(longCue);

      vi.useFakeTimers();

      // After 600ms, short cue should be gone
      vi.advanceTimersByTime(600);
      renderer.update(16);
      expect(renderer.getActiveCount()).toBe(1);

      // After 2100ms total, both should be gone
      vi.advanceTimersByTime(1500);
      renderer.update(16);
      expect(renderer.getActiveCount()).toBe(0);

      vi.useRealTimers();
    });
  });

  describe('render', () => {
    it('should render sparkle cues', () => {
      const cue: VisualCue = {
        type: 'sparkle',
        duration: 2000,
        color: '#FFD700',
      };

      renderer.addCue(cue);
      renderer.render(mockCtx, 800, 600);

      // Should call canvas context methods
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should render damage cues', () => {
      const cue: VisualCue = {
        type: 'damage',
        duration: 1000,
        color: '#FF0000',
      };

      renderer.addCue(cue);
      renderer.render(mockCtx, 800, 600);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should render warning cues', () => {
      const cue: VisualCue = {
        type: 'warning',
        duration: 2000,
        color: '#FFA500',
      };

      renderer.addCue(cue);
      renderer.render(mockCtx, 800, 600);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should render all cue types', () => {
      const cueTypes: VisualCue['type'][] = [
        'sparkle',
        'damage',
        'warning',
        'treasure',
        'shield',
        'skull',
        'star',
        'question',
      ];

      for (const type of cueTypes) {
        renderer.clear();
        const cue: VisualCue = { type, duration: 1000 };
        renderer.addCue(cue);
        renderer.render(mockCtx, 800, 600);

        expect(mockCtx.save).toHaveBeenCalled();
        expect(mockCtx.restore).toHaveBeenCalled();
      }
    });

    it('should use custom position if specified', () => {
      const cue: VisualCue = {
        type: 'sparkle',
        duration: 1000,
        position: { x: 0.25, y: 0.75 },
      };

      renderer.addCue(cue);
      renderer.render(mockCtx, 800, 600);

      // Position should be 0.25 * 800 = 200, 0.75 * 600 = 450
      expect(mockCtx.save).toHaveBeenCalled();
    });

    it('should default to center if no position', () => {
      const cue: VisualCue = {
        type: 'sparkle',
        duration: 1000,
      };

      renderer.addCue(cue);
      renderer.render(mockCtx, 800, 600);

      // Should use center (400, 300)
      expect(mockCtx.save).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should remove all active cues', () => {
      const cue1: VisualCue = { type: 'sparkle', duration: 2000 };
      const cue2: VisualCue = { type: 'damage', duration: 2000 };

      renderer.addCue(cue1);
      renderer.addCue(cue2);
      expect(renderer.getActiveCount()).toBe(2);

      renderer.clear();
      expect(renderer.getActiveCount()).toBe(0);
    });
  });

  describe('getActiveCount', () => {
    it('should return 0 initially', () => {
      expect(renderer.getActiveCount()).toBe(0);
    });

    it('should return correct count after adding cues', () => {
      renderer.addCue({ type: 'sparkle', duration: 1000 });
      expect(renderer.getActiveCount()).toBe(1);

      renderer.addCue({ type: 'damage', duration: 1000 });
      expect(renderer.getActiveCount()).toBe(2);
    });
  });

  describe('integration', () => {
    it('should handle full lifecycle of cue', () => {
      const cue: VisualCue = {
        type: 'sparkle',
        duration: 1000,
        color: '#FFD700',
        position: { x: 0.5, y: 0.5 },
      };

      // Add cue
      renderer.addCue(cue);
      expect(renderer.getActiveCount()).toBe(1);

      // Render
      renderer.render(mockCtx, 800, 600);
      expect(mockCtx.save).toHaveBeenCalled();

      // Update
      renderer.update(16);
      expect(renderer.getActiveCount()).toBe(1);

      // Clear
      renderer.clear();
      expect(renderer.getActiveCount()).toBe(0);
    });
  });
});
