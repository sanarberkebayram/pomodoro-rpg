# Prettier Configuration

## Overview

Prettier handles all code formatting automatically. No debates about style - Prettier decides.

## Configuration File

Located at: `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## Rule Details

### Semicolons: Required
```json
"semi": true
```

**Output**:
```typescript
const value = 10;
const name = 'Player';
```

### Trailing Commas: ES5 Style
```json
"trailingComma": "es5"
```

**Output**:
```typescript
const config = {
  name: 'Game',
  version: '1.0',
  settings: {
    sound: true,
    music: false,
  },
};

const items = [
  'sword',
  'shield',
  'potion',
];
```

**Why**: Cleaner git diffs when adding/removing items.

### Single Quotes
```json
"singleQuote": true
```

**Output**:
```typescript
const message = 'Hello World';
const html = '<div class="container"></div>';
```

**Note**: JSX attributes still use double quotes by convention:
```tsx
<Button className="primary" label='Click' />
```

### Print Width: 100 Characters
```json
"printWidth": 100
```

**Output**:
```typescript
// Fits on one line
const shortFunction = (a: number, b: number) => a + b;

// Breaks to multiple lines
const longFunction = (
  firstParameter: string,
  secondParameter: number,
  thirdParameter: boolean
) => {
  return processData(firstParameter, secondParameter, thirdParameter);
};
```

### Indentation: 2 Spaces
```json
"tabWidth": 2,
"useTabs": false
```

**Output**:
```typescript
function example() {
  if (condition) {
    doSomething();
  }
}
```

### Arrow Function Parentheses: Always
```json
"arrowParens": "always"
```

**Output**:
```typescript
// Always use parentheses
const single = (x) => x * 2;
const multiple = (x, y) => x + y;

// Not like this (Prettier will fix)
const wrong = x => x * 2;
```

### Line Endings: Unix (LF)
```json
"endOfLine": "lf"
```

**Why**: Consistent across all platforms (Windows, Mac, Linux).

## Running Prettier

### Format all files:
```bash
bun format
```

### Check formatting without changing files:
```bash
bun format --check
```

### Format specific files:
```bash
bunx prettier --write src/components/Timer.tsx
```

### Format specific patterns:
```bash
bunx prettier --write "src/**/*.{ts,tsx}"
```

## Before and After Examples

### Example 1: Inconsistent Spacing
**Before**:
```typescript
const config={name:"Game",version:1.0,settings:{sound:true,music:false}}
```

**After Prettier**:
```typescript
const config = {
  name: 'Game',
  version: 1.0,
  settings: { sound: true, music: false },
};
```

### Example 2: Long Lines
**Before**:
```typescript
function calculateDamage(attackerPower: number, defenderDefense: number, criticalHit: boolean, multiplier: number) {
  return criticalHit ? (attackerPower - defenderDefense) * multiplier * 2 : (attackerPower - defenderDefense) * multiplier;
}
```

**After Prettier**:
```typescript
function calculateDamage(
  attackerPower: number,
  defenderDefense: number,
  criticalHit: boolean,
  multiplier: number
) {
  return criticalHit
    ? (attackerPower - defenderDefense) * multiplier * 2
    : (attackerPower - defenderDefense) * multiplier;
}
```

### Example 3: Inconsistent Quotes
**Before**:
```typescript
const message = "Hello";
const name = 'World';
const template = `${message} ${name}`;
```

**After Prettier**:
```typescript
const message = 'Hello';
const name = 'World';
const template = `${message} ${name}`;
```

### Example 4: Array Formatting
**Before**:
```typescript
const items = ['sword', 'shield', 'potion', 'helmet', 'boots', 'gloves', 'ring', 'amulet'];
```

**After Prettier**:
```typescript
const items = [
  'sword',
  'shield',
  'potion',
  'helmet',
  'boots',
  'gloves',
  'ring',
  'amulet',
];
```

## Integration with Git Hooks

Prettier runs automatically on pre-commit via `lint-staged`:

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "prettier --write",
    "eslint --fix"
  ]
}
```

Files are formatted before being committed, ensuring consistent formatting across the codebase.

## Editor Integration

### VS Code
Install the Prettier extension and add to settings:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### WebStorm / IntelliJ
1. Go to Settings → Languages & Frameworks → JavaScript → Prettier
2. Enable "On save"
3. Set Prettier package path

### Vim / Neovim
Use plugins like:
- `prettier/vim-prettier`
- Configure with `:Prettier` command

## Ignoring Files

Create `.prettierignore` if needed (currently using defaults):
```
dist/
node_modules/
*.min.js
*.min.css
```

## Prettier vs ESLint

- **Prettier**: Handles formatting (spaces, quotes, line breaks)
- **ESLint**: Handles code quality (unused vars, type errors, logic issues)

They work together:
1. Prettier formats code
2. ESLint checks for logical errors

Never fight Prettier - it makes decisions so you don't have to!

## Common Questions

### Q: Can I disable Prettier for specific code?
**A**: Yes, but avoid it:
```typescript
// prettier-ignore
const matrix = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
];
```

### Q: Why does Prettier change my carefully formatted code?
**A**: Consistency is more valuable than personal preference. Let Prettier handle formatting so you can focus on logic.

### Q: Can I change the Prettier config?
**A**: Talk to the team first. Changing formatting rules affects everyone and creates git noise.

### Q: Do I need to run Prettier manually?
**A**: No! Git hooks run it automatically on commit. But you can run it manually anytime with `bun format`.
