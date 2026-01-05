# ESLint Configuration

## Overview

The project uses ESLint with TypeScript support to enforce code quality and catch errors early.

## Configuration File

Located at: `.eslintrc.json`

## Extends

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/strict"
  ]
}
```

- **eslint:recommended**: Core ESLint rules
- **@typescript-eslint/recommended**: TypeScript-specific recommended rules
- **@typescript-eslint/strict**: Stricter TypeScript rules for type safety

## Custom Rules

### 1. No `any` Type (ERROR)
```json
"@typescript-eslint/no-explicit-any": "error"
```

**Why**: The `any` type defeats TypeScript's type safety. Always use proper types.

**Wrong**:
```typescript
function process(data: any) {
  return data.value;
}
```

**Correct**:
```typescript
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data');
}
```

### 2. Explicit Function Return Types (OFF)
```json
"@typescript-eslint/explicit-function-return-type": "off"
```

**Why**: TypeScript can infer return types effectively. Explicit types are optional but recommended for public APIs.

**Acceptable**:
```typescript
function add(a: number, b: number) {
  return a + b; // return type 'number' inferred
}
```

**Better for public APIs**:
```typescript
export function calculateDamage(power: number, defense: number): number {
  return Math.max(0, power - defense);
}
```

### 3. No Unused Variables (ERROR)
```json
"@typescript-eslint/no-unused-vars": [
  "error",
  {
    "argsIgnorePattern": "^_",
    "varsIgnorePattern": "^_"
  }
]
```

**Why**: Unused variables indicate dead code or incomplete refactoring.

**Wrong**:
```typescript
function process(data: string, unused: number) {
  return data.toUpperCase();
}
```

**Correct** (if parameter is required by interface):
```typescript
function process(data: string, _unused: number) {
  return data.toUpperCase();
}
```

**Best** (remove if truly unused):
```typescript
function process(data: string) {
  return data.toUpperCase();
}
```

### 4. No Console Logs (WARN)
```json
"no-console": [
  "warn",
  {
    "allow": ["warn", "error"]
  }
]
```

**Why**: `console.log` pollutes production logs. Use proper logging or remove debug logs.

**Wrong**:
```typescript
console.log('User logged in', user);
```

**Correct**:
```typescript
// For errors
console.error('Login failed:', error);

// For warnings
console.warn('Deprecated API used');

// For debugging (remove before commit)
// console.log('Debug:', value);
```

## Ignored Files

```json
"ignorePatterns": [
  "dist",
  "node_modules",
  "*.config.js",
  "*.config.ts"
]
```

## Running ESLint

### Check for errors:
```bash
bun lint
```

### Auto-fix fixable issues:
```bash
bun lint --fix
```

### Lint specific files:
```bash
bun lint src/components/Timer.tsx
```

### Lint with detailed output:
```bash
bun lint --format verbose
```

## Common ESLint Errors and Fixes

### Error: "Unexpected any"
```typescript
// Error
function handle(data: any) { }

// Fix
function handle(data: unknown) {
  if (typeof data === 'string') {
    // Handle string
  }
}
```

### Error: "variable is assigned but never used"
```typescript
// Error
const result = calculate();
return value;

// Fix 1: Use the variable
const result = calculate();
return result;

// Fix 2: Remove if truly unused
return calculate();

// Fix 3: Prefix with _ if required by interface
const _result = calculate();
```

### Error: "Unexpected console statement"
```typescript
// Error
console.log('Processing...');

// Fix 1: Remove debug logs
// (remove the line)

// Fix 2: Use allowed methods
console.error('Failed to process:', error);
```

## Integration with Git Hooks

ESLint runs automatically on pre-commit via `lint-staged`:

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "prettier --write",
    "eslint --fix"
  ]
}
```

This ensures all committed code passes linting checks.

## TypeScript ESLint Rules

The strict configuration includes these important rules:

- **no-unnecessary-condition**: Prevents always-true/false conditions
- **no-unnecessary-type-assertion**: Removes redundant type assertions
- **prefer-nullish-coalescing**: Use `??` instead of `||` for null checks
- **prefer-optional-chain**: Use `?.` instead of manual null checks
- **no-floating-promises**: Ensures promises are awaited or handled
- **no-misused-promises**: Prevents promise misuse in conditionals

## Disabling Rules (Use Sparingly)

If you must disable a rule:

```typescript
// For single line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = legacyFunction();

// For entire file (avoid if possible)
/* eslint-disable @typescript-eslint/no-explicit-any */
```

**Important**: Always add a comment explaining WHY the rule is disabled.

## Editor Integration

### VS Code
Install the ESLint extension for real-time feedback:
```json
{
  "eslint.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Other Editors
Most editors have ESLint plugins available. Check your editor's documentation.
