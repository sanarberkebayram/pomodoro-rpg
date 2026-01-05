/**
 * Tests for CanvasUtils
 */

import { describe, it, expect } from 'vitest';
import {
  getPixelRatio,
  isPointInBounds,
  lerp,
  clamp,
  degToRad,
  radToDeg,
  distance,
} from '@/rendering/utils/CanvasUtils';
import type { Position, Bounds } from '@/rendering/types';

describe('CanvasUtils', () => {
  describe('getPixelRatio', () => {
    it('should return a positive number', () => {
      const ratio = getPixelRatio();
      expect(ratio).toBeGreaterThan(0);
    });
  });

  describe('isPointInBounds', () => {
    const bounds: Bounds = {
      x: 10,
      y: 10,
      width: 100,
      height: 100,
    };

    it('should return true for point inside bounds', () => {
      const point: Position = { x: 50, y: 50 };
      expect(isPointInBounds(point, bounds)).toBe(true);
    });

    it('should return true for point on bounds edge', () => {
      const point: Position = { x: 10, y: 10 };
      expect(isPointInBounds(point, bounds)).toBe(true);
    });

    it('should return false for point outside bounds', () => {
      const point: Position = { x: 5, y: 5 };
      expect(isPointInBounds(point, bounds)).toBe(false);
    });

    it('should return false for point beyond bounds', () => {
      const point: Position = { x: 120, y: 120 };
      expect(isPointInBounds(point, bounds)).toBe(false);
    });
  });

  describe('lerp', () => {
    it('should interpolate between two values', () => {
      expect(lerp(0, 100, 0.5)).toBe(50);
      expect(lerp(0, 100, 0)).toBe(0);
      expect(lerp(0, 100, 1)).toBe(100);
    });

    it('should handle negative values', () => {
      expect(lerp(-100, 100, 0.5)).toBe(0);
      expect(lerp(-50, -10, 0.5)).toBe(-30);
    });

    it('should extrapolate when t > 1', () => {
      expect(lerp(0, 100, 1.5)).toBe(150);
    });
  });

  describe('clamp', () => {
    it('should clamp value between min and max', () => {
      expect(clamp(50, 0, 100)).toBe(50);
      expect(clamp(-10, 0, 100)).toBe(0);
      expect(clamp(150, 0, 100)).toBe(100);
    });

    it('should handle negative ranges', () => {
      expect(clamp(-50, -100, 0)).toBe(-50);
      expect(clamp(-150, -100, 0)).toBe(-100);
      expect(clamp(50, -100, 0)).toBe(0);
    });
  });

  describe('degToRad', () => {
    it('should convert degrees to radians', () => {
      expect(degToRad(0)).toBe(0);
      expect(degToRad(180)).toBeCloseTo(Math.PI);
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
      expect(degToRad(360)).toBeCloseTo(Math.PI * 2);
    });
  });

  describe('radToDeg', () => {
    it('should convert radians to degrees', () => {
      expect(radToDeg(0)).toBe(0);
      expect(radToDeg(Math.PI)).toBeCloseTo(180);
      expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
      expect(radToDeg(Math.PI * 2)).toBeCloseTo(360);
    });
  });

  describe('distance', () => {
    it('should calculate distance between two points', () => {
      const p1: Position = { x: 0, y: 0 };
      const p2: Position = { x: 3, y: 4 };
      expect(distance(p1, p2)).toBe(5);
    });

    it('should return 0 for same point', () => {
      const p: Position = { x: 10, y: 10 };
      expect(distance(p, p)).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const p1: Position = { x: -3, y: -4 };
      const p2: Position = { x: 0, y: 0 };
      expect(distance(p1, p2)).toBe(5);
    });
  });
});
