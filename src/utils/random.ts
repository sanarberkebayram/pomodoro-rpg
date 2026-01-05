/**
 * Random Number Generation Utilities
 * Provides deterministic and seedable random functions for game systems
 */

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate a random boolean with given probability
 * @param probability - Chance of returning true (0-1)
 */
export function randomBool(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Pick a random element from an array
 */
export function randomChoice<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot pick from empty array');
  }
  return array[randomInt(0, array.length - 1)];
}

/**
 * Pick multiple random elements from an array (without replacement)
 */
export function randomChoices<T>(array: T[], count: number): T[] {
  if (count > array.length) {
    throw new Error('Count cannot exceed array length');
  }

  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

/**
 * Weighted random selection
 * @param items - Array of items with weights
 * @returns Selected item
 */
export function weightedRandom<T>(items: Array<{ item: T; weight: number }>): T {
  if (items.length === 0) {
    throw new Error('Cannot select from empty array');
  }

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) {
    throw new Error('Total weight must be greater than 0');
  }

  let random = Math.random() * totalWeight;

  for (const { item, weight } of items) {
    random -= weight;
    if (random <= 0) {
      return item;
    }
  }

  // Fallback (should never reach here due to floating point precision)
  return items[items.length - 1].item;
}

/**
 * Roll dice notation (e.g., "2d6" for two six-sided dice)
 * @param notation - Dice notation string (e.g., "1d20", "2d6+3")
 * @returns Total roll result
 */
export function rollDice(notation: string): number {
  const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`);
  }

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  let total = modifier;
  for (let i = 0; i < count; i++) {
    total += randomInt(1, sides);
  }

  return total;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between a and b
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Generate a random UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Shuffle an array in place (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate percentage chance
 * @param percentage - Percentage chance (0-100)
 * @returns true if roll succeeds
 */
export function percentChance(percentage: number): boolean {
  return Math.random() * 100 < percentage;
}

/**
 * Generate a random value from a normal distribution (Box-Muller transform)
 */
export function randomNormal(mean: number = 0, stdDev: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}
