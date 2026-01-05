---
name: coding-conventions
description: Enforces project coding conventions and style guidelines for the Pomodoro MMORPG project. Use when writing code, reviewing code, or asking about code style standards. Includes TypeScript strictness, naming conventions, formatting rules, and git hooks.
allowed-tools: Read, Grep, Glob
---

# Pomodoro MMORPG - Coding Conventions & Style Guide

This skill enforces consistent code quality and style across the Pomodoro MMORPG codebase. All code must follow these conventions.

## Core Principles

1. **Type Safety First** - NO `any` type allowed, strict TypeScript mode enabled
2. **Consistency Over Preference** - Follow Prettier and ESLint configurations
3. **Test Before Commit** - All code must pass tests and linting
4. **Mobile-First Performance** - Code must be optimized for mobile devices

## When to Apply This Skill

Apply these conventions when:
- Writing new features or components
- Refactoring existing code
- Reviewing pull requests
- Fixing bugs or type errors
- Creating tests

## Quick Reference

### TypeScript Rules
- **Strict mode**: All type safety features enabled
- **NO `any` type**: Use proper types or `unknown` with type guards
- **Explicit return types**: Optional but recommended for public APIs
- **JSX**: `preserve` with `jsxImportSource: "solid-js"` (SolidJS, not React)

### Code Formatting (Prettier)
- **Semicolons**: Required (`;`)
- **Quotes**: Single quotes (`'`)
- **Line length**: 100 characters max
- **Indentation**: 2 spaces (no tabs)
- **Trailing commas**: ES5 style
- **Arrow functions**: Always use parentheses `(x) => x`
- **Line endings**: LF (Unix-style)

### Linting (ESLint)
- **No console.log**: Use `console.warn` or `console.error` only
- **No unused vars**: Prefix with `_` for intentionally unused variables
- **TypeScript strict rules**: Enabled via `@typescript-eslint/strict`

### Naming Conventions
```typescript
// Variables and functions: camelCase
const playerHealth = 100;
function calculateDamage() { }

// Classes, Interfaces, Types: PascalCase
class GameEngine { }
interface PlayerStats { }
type TaskType = 'raid' | 'expedition';

// Constants: UPPER_SNAKE_CASE
const MAX_INVENTORY_SIZE = 50;
const DEFAULT_TIMER_DURATION = 25 * 60;

// Private class members: prefix with underscore
class Timer {
  private _intervalId: number;
}

// SolidJS Components: PascalCase with descriptive names
function InventoryGrid() { }
function TimerDisplay() { }
```

### File Organization
```
├── ComponentName.tsx        # One component per file
├── ComponentName.test.ts    # Tests alongside source
├── types.ts                 # Shared types for the module
├── index.ts                 # Public exports only
```

### Import Order
```typescript
// 1. External dependencies (alphabetical)
import { createStore } from 'solid-js/store';
import { createSignal } from 'solid-js';

// 2. Internal modules with path aliases (alphabetical)
import { GameEngine } from '@/core/engine/GameEngine';
import { TaskSystem } from '@/systems/tasks/TaskSystem';

// 3. Local relative imports
import { Button } from './Button';
import type { Props } from './types';
```

### Path Aliases (Use These!)
```typescript
"@/*"          // src/
"@components/*" // src/components/
"@state/*"      // src/state/
"@services/*"   // src/services/
"@types/*"      // src/types/
"@utils/*"      // src/utils/
"@assets/*"     // src/assets/
"@screens/*"    // src/screens/
```

## Git Workflow

### Pre-commit Hook (Automatic)
Every commit automatically runs:
1. **Prettier** - Auto-formats staged files
2. **ESLint** - Auto-fixes linting issues

### Manual Checks
```bash
# Lint check
bun lint

# Format check
bun format

# Run tests
bun run test

# Full validation
bun lint && bun format && bun run test
```

### Commit Message Format
```
imperative: Brief description (50 chars max)

- Detailed explanation of changes
- Why the change was made
- Any breaking changes or migrations needed
```

Examples:
```
add: Inventory grid component with drag-and-drop

- Created reusable InventoryGrid component
- Implemented drag-and-drop for item management
- Added touch support for mobile devices
- Tests included for all interactions
```

```
fix: Timer not pausing during work phase

- Fixed race condition in PomodoroTimer
- Added state validation before transitions
- Updated tests to cover edge case
```

## Common Patterns

### State Management (SolidJS)
```typescript
import { createStore } from 'solid-js/store';
import { produce } from 'solid-js/store';

interface GameState {
  gold: number;
  health: number;
}

export function createGameState() {
  const [state, setState] = createStore<GameState>({
    gold: 0,
    health: 100,
  });

  // Immutable updates with produce
  const addGold = (amount: number) => {
    setState(produce((draft) => {
      draft.gold += amount;
    }));
  };

  return { state, addGold };
}
```

### Type Guards
```typescript
// Never use 'any', use 'unknown' with type guards
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data;
  }
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String((data as Record<string, unknown>).value);
  }
  throw new Error('Invalid data type');
}
```

### Error Handling
```typescript
// Use custom error classes
class TaskFailureError extends Error {
  constructor(
    public taskType: string,
    public reason: string
  ) {
    super(`Task ${taskType} failed: ${reason}`);
    this.name = 'TaskFailureError';
  }
}

// Handle errors explicitly
try {
  await executeTask(task);
} catch (error) {
  if (error instanceof TaskFailureError) {
    console.error('Task failed:', error.taskType, error.reason);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Async Functions
```typescript
// Always type async function returns
async function fetchPlayerData(id: string): Promise<PlayerData> {
  const response = await fetch(`/api/player/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch player: ${response.statusText}`);
  }
  return response.json();
}
```

## Testing Conventions

### Test File Structure
```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('ComponentName', () => {
  describe('Feature Group', () => {
    beforeEach(() => {
      // Setup
    });

    it('should do something specific', () => {
      // Arrange
      const input = 5;

      // Act
      const result = calculate(input);

      // Assert
      expect(result).toBe(10);
    });
  });
});
```

### Test Naming
- Use `describe()` for grouping related tests
- Use `it('should ...')` for individual test cases
- Be specific and descriptive in test names

## Mobile-First Guidelines

### Performance Requirements
- **First Paint**: < 1.5s
- **Interactive**: < 3s
- **Canvas FPS**: 30fps minimum
- **Bundle Size**: < 200KB initial (gzipped)

### Touch Targets
- **Minimum size**: 44x44px
- **Spacing**: 8px minimum between targets
- **Layout**: Portrait-first, single column

### Code Optimization
```typescript
// Use lazy loading for heavy components
import { lazy } from 'solid-js';
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Memoize expensive computations
import { createMemo } from 'solid-js';
const expensiveValue = createMemo(() => complexCalculation(input()));

// Debounce frequent updates
import { debounce } from '@utils/timing';
const handleInput = debounce((value: string) => {
  processInput(value);
}, 300);
```

## Additional Resources

For detailed rules and examples, see:
- [ESLint Configuration](eslint-rules.md)
- [Prettier Configuration](prettier-rules.md)
- [TypeScript Guidelines](typescript-conventions.md)

## Validation Commands

Before committing, ensure code passes all checks:

```bash
# Full validation pipeline
bun lint && bun format && bun run test

# Individual checks
bun lint                 # ESLint check
bun lint --fix          # Auto-fix linting issues
bun format              # Format all files
bun format --check      # Check formatting without changes
bun run test            # Run test suite
bun run test:watch      # Run tests in watch mode
```

## Notes

- Git hooks automatically run `lint-staged` on pre-commit
- Lint-staged runs Prettier and ESLint only on staged files
- All commands use `bun` as the package manager and runtime
- Never commit code that doesn't pass linting and tests
