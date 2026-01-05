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

// Clear localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
});
