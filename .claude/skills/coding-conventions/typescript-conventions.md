# TypeScript Conventions

## Overview

This project uses TypeScript in strict mode with NO tolerance for the `any` type.

## TypeScript Configuration

From `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  }
}
```

## Strict Mode Rules

All strict mode features are enabled:

- `noImplicitAny`: Variables must have explicit types
- `strictNullChecks`: `null` and `undefined` must be handled explicitly
- `strictFunctionTypes`: Function parameters are contravariant
- `strictBindCallApply`: Bind/call/apply are type-checked
- `strictPropertyInitialization`: Class properties must be initialized
- `noImplicitThis`: `this` must have explicit type
- `alwaysStrict`: Emit "use strict" in output

## The `any` Type is FORBIDDEN

### Why?
The `any` type defeats the entire purpose of TypeScript. It disables type checking and allows runtime errors.

### What to Use Instead?

#### 1. Proper Types
```typescript
// Wrong
function processUser(user: any) {
  return user.name;
}

// Correct
interface User {
  id: string;
  name: string;
  email: string;
}

function processUser(user: User) {
  return user.name;
}
```

#### 2. Unknown with Type Guards
```typescript
// Wrong
function parseJson(json: string): any {
  return JSON.parse(json);
}

// Correct
function parseJson(json: string): unknown {
  return JSON.parse(json);
}

function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    if ('name' in data && typeof data.name === 'string') {
      return data.name;
    }
  }
  throw new Error('Invalid data structure');
}
```

#### 3. Generic Types
```typescript
// Wrong
function firstItem(items: any[]): any {
  return items[0];
}

// Correct
function firstItem<T>(items: T[]): T | undefined {
  return items[0];
}
```

## Type Definitions

### Interfaces vs Types

**Use `interface` for**:
- Object shapes
- Extensible types
- Class implementations

```typescript
interface PlayerStats {
  health: number;
  power: number;
  defense: number;
}

interface Warrior extends PlayerStats {
  rage: number;
}
```

**Use `type` for**:
- Unions and intersections
- Primitive aliases
- Mapped types
- Conditional types

```typescript
type TaskType = 'raid' | 'expedition' | 'craft';
type TaskRisk = 'safe' | 'standard' | 'risky';

type Result<T> = { success: true; data: T } | { success: false; error: string };
```

### Type Naming Conventions

```typescript
// Interfaces: PascalCase, descriptive noun
interface GameState { }
interface InventoryItem { }

// Types: PascalCase, often with suffix
type TaskType = 'raid' | 'expedition';
type ResultType<T> = { success: boolean; data: T };

// Avoid prefixes like 'I' or 'T'
// Wrong: IGameState, TTaskType
// Correct: GameState, TaskType
```

## Function Types

### Explicit Return Types (Recommended for Public APIs)

```typescript
// Public API: explicit return type
export function calculateDamage(power: number, defense: number): number {
  return Math.max(0, power - defense);
}

// Internal: inference OK
function localHelper(x: number, y: number) {
  return x + y; // inferred as 'number'
}
```

### Function Overloads

```typescript
function process(input: string): string;
function process(input: number): number;
function process(input: string | number): string | number {
  if (typeof input === 'string') {
    return input.toUpperCase();
  }
  return input * 2;
}
```

### Async Functions

```typescript
// Always specify Promise return type
async function fetchData(id: string): Promise<PlayerData> {
  const response = await fetch(`/api/player/${id}`);
  return response.json();
}

// Handle errors explicitly
async function safeLoad(id: string): Promise<PlayerData | null> {
  try {
    return await fetchData(id);
  } catch (error) {
    console.error('Failed to fetch:', error);
    return null;
  }
}
```

## Generics

### Basic Generics
```typescript
function identity<T>(value: T): T {
  return value;
}

function map<T, U>(items: T[], fn: (item: T) => U): U[] {
  return items.map(fn);
}
```

### Constrained Generics
```typescript
interface HasId {
  id: string;
}

function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}
```

### Generic Classes
```typescript
class Store<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  getAll(): T[] {
    return [...this.items];
  }
}

const playerStore = new Store<Player>();
```

## Type Guards

### typeof Guards
```typescript
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // value is string here
  }
  return value * 2; // value is number here
}
```

### instanceof Guards
```typescript
class NetworkError extends Error {
  constructor(public statusCode: number) {
    super('Network error');
  }
}

function handleError(error: unknown) {
  if (error instanceof NetworkError) {
    console.error(`Status: ${error.statusCode}`);
  } else if (error instanceof Error) {
    console.error(error.message);
  }
}
```

### Custom Type Guards
```typescript
interface Player {
  type: 'player';
  health: number;
}

interface Enemy {
  type: 'enemy';
  damage: number;
}

function isPlayer(entity: Player | Enemy): entity is Player {
  return entity.type === 'player';
}

function attack(entity: Player | Enemy) {
  if (isPlayer(entity)) {
    console.log(`Player health: ${entity.health}`);
  } else {
    console.log(`Enemy damage: ${entity.damage}`);
  }
}
```

## Null and Undefined Handling

### Optional Chaining
```typescript
// Instead of
if (player && player.inventory && player.inventory.items) {
  const count = player.inventory.items.length;
}

// Use
const count = player?.inventory?.items?.length;
```

### Nullish Coalescing
```typescript
// Instead of (treats 0 and '' as falsy)
const value = input || 'default';

// Use (only treats null/undefined as nullish)
const value = input ?? 'default';
```

### Non-null Assertion (Use Sparingly)
```typescript
// Only when you're absolutely certain value exists
const element = document.getElementById('root')!;

// Better: handle the null case
const element = document.getElementById('root');
if (!element) {
  throw new Error('Root element not found');
}
```

## Union and Intersection Types

### Unions
```typescript
type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

type Result =
  | { status: 'success'; data: string }
  | { status: 'error'; error: Error };

function handleResult(result: Result) {
  if (result.status === 'success') {
    console.log(result.data); // data available here
  } else {
    console.error(result.error); // error available here
  }
}
```

### Intersections
```typescript
interface Movable {
  position: { x: number; y: number };
  move(dx: number, dy: number): void;
}

interface Drawable {
  sprite: string;
  draw(): void;
}

type GameObject = Movable & Drawable;

const player: GameObject = {
  position: { x: 0, y: 0 },
  sprite: 'player.png',
  move(dx, dy) {
    this.position.x += dx;
    this.position.y += dy;
  },
  draw() {
    console.log('Drawing at', this.position);
  },
};
```

## Utility Types

### Built-in Utility Types
```typescript
interface Player {
  id: string;
  name: string;
  health: number;
  power: number;
}

// Partial: all properties optional
type PlayerUpdate = Partial<Player>;

// Pick: select specific properties
type PlayerPreview = Pick<Player, 'id' | 'name'>;

// Omit: exclude specific properties
type PlayerWithoutId = Omit<Player, 'id'>;

// Required: all properties required
type CompletePlayer = Required<Partial<Player>>;

// Readonly: all properties readonly
type ImmutablePlayer = Readonly<Player>;

// Record: create object type with specific keys
type PlayerMap = Record<string, Player>;
```

### Custom Utility Types
```typescript
// Deep Partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Extract function parameter types
type Parameters<T> = T extends (...args: infer P) => unknown ? P : never;

// Extract function return type
type ReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never;
```

## Const Assertions

```typescript
// Without const assertion
const config = {
  maxHealth: 100,
  startLevel: 1,
};
// Type: { maxHealth: number; startLevel: number; }

// With const assertion
const config = {
  maxHealth: 100,
  startLevel: 1,
} as const;
// Type: { readonly maxHealth: 100; readonly startLevel: 1; }

// Array const assertion
const directions = ['north', 'south', 'east', 'west'] as const;
type Direction = typeof directions[number]; // 'north' | 'south' | 'east' | 'west'
```

## SolidJS-Specific Types

### Component Props
```typescript
import { Component, JSX } from 'solid-js';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children?: JSX.Element;
}

const Button: Component<ButtonProps> = (props) => {
  return (
    <button onClick={props.onClick} disabled={props.disabled}>
      {props.label}
      {props.children}
    </button>
  );
};
```

### Signals and Stores
```typescript
import { createSignal, createStore, Accessor, Setter } from 'solid-js';

// Signal types
const [count, setCount] = createSignal<number>(0);
// count: Accessor<number>
// setCount: Setter<number>

// Store types
interface GameState {
  gold: number;
  health: number;
}

const [state, setState] = createStore<GameState>({
  gold: 0,
  health: 100,
});
```

## Common Type Errors and Solutions

### Error: Object is possibly 'undefined'
```typescript
// Error
const name = player.name; // player might be undefined

// Solution
const name = player?.name ?? 'Unknown';
```

### Error: Type 'X' is not assignable to type 'Y'
```typescript
// Error
const id: number = '123'; // string not assignable to number

// Solution
const id: number = parseInt('123', 10);
```

### Error: Property 'x' does not exist on type 'Y'
```typescript
// Error
const value = data.unknownProperty;

// Solution: Define the type properly
interface Data {
  unknownProperty: string;
}
const data: Data = { unknownProperty: 'value' };
```

## Best Practices

1. **Enable strict mode** - Already done in tsconfig.json
2. **Never use `any`** - Use `unknown` and type guards instead
3. **Prefer interfaces for objects** - More extensible
4. **Use type guards** - Narrow types safely
5. **Leverage utility types** - Don't reinvent the wheel
6. **Document complex types** - Use JSDoc for public APIs
7. **Keep types close to usage** - Co-locate when possible
8. **Export types from index** - Centralize public API

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [SolidJS TypeScript Guide](https://www.solidjs.com/guides/typescript)
