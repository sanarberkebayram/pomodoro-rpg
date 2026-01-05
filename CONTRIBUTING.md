# Contributing to Pomodoro RPG

Thank you for your interest in contributing to Pomodoro RPG! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.0 or higher
- Git
- A code editor (VS Code recommended)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pomodoro-rpg.git
   cd pomodoro-rpg
   ```
3. Install dependencies:
   ```bash
   bun install
   ```
4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
bun dev
```

Visit `http://localhost:3000` to see your changes in real-time.

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage
```

**IMPORTANT:** Always run tests after making changes. All tests must pass before submitting a PR.

### Code Quality

#### Linting

```bash
bun lint
```

#### Formatting

```bash
bun format
```

#### Pre-commit Hooks

Husky is configured to automatically run linting and formatting on staged files before each commit. This ensures code quality and consistency.

## Code Style Guidelines

### TypeScript

- **Strict mode enabled:** All type safety features are on
- **NO `any` TYPE ALLOWED:** Never use `any` - use proper types or `unknown` with type guards
- **Explicit return types:** Preferred for public functions
- **Functional patterns:** Prefer pure functions where possible

### SolidJS

- Use SolidJS primitives (`createSignal`, `createStore`, `createEffect`, etc.)
- Follow reactive patterns - avoid unnecessary computations
- Use `createMemo` for derived state
- Keep components small and focused

### File Organization

- One component per file
- Co-locate tests with source files when appropriate
- Use barrel exports (`index.ts`) for public APIs
- Follow the existing folder structure (see [DEV_PLAN.md](./DEV_PLAN.md))

### Naming Conventions

- **Files:** PascalCase for components (`TimerDisplay.tsx`), camelCase for utilities (`formatTime.ts`)
- **Components:** PascalCase (`const TimerDisplay: Component = () => {}`)
- **Functions:** camelCase (`function calculateDamage() {}`)
- **Constants:** UPPER_SNAKE_CASE for true constants (`const MAX_HEALTH = 100`)
- **Types/Interfaces:** PascalCase (`interface GameState {}`)

## Testing Guidelines

### Unit Tests

- Test all game systems (timer, combat, loot, etc.)
- Test utility functions
- Aim for 80% coverage on core systems
- Use descriptive test names

Example:
```typescript
describe('PomodoroTimer', () => {
  it('should transition from WORK to SHORT_BREAK after 25 minutes', () => {
    // Test implementation
  });
});
```

### Integration Tests

- Test full gameplay flows
- Test state management integration
- Test UI component interactions

### E2E Tests

- Test complete user journeys
- Test on mobile viewports
- Use Playwright for E2E tests

## Commit Guidelines

### Commit Messages

Follow the conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(timer): add pause/resume functionality

fix(inventory): prevent duplicate items in equipment slots

docs(readme): update installation instructions

test(combat): add tests for damage calculation
```

### What to Commit

- Commit logical units of work
- Keep commits focused and atomic
- Don't commit commented-out code
- Don't commit debugging statements
- Don't commit `.env` files or secrets

## Pull Request Process

1. **Before submitting:**
   - Run all tests and ensure they pass
   - Run linting and formatting
   - Update documentation if needed
   - Test on mobile viewports if UI changes

2. **PR Title:**
   - Use conventional commit format
   - Be descriptive

3. **PR Description:**
   - Explain what changes were made and why
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

4. **Review Process:**
   - Address review comments promptly
   - Keep the PR focused - avoid scope creep
   - Ensure CI passes

## Design Principles

When contributing, keep these core principles in mind:

1. **Focus is Sacred:** No user input during work phases
2. **Break = Control:** All player decisions happen during breaks
3. **Living World:** Events happen automatically during work
4. **Mobile-First:** Optimize for mobile devices
5. **Performance:** Maintain 30fps minimum on canvas

## Areas to Contribute

### High Priority
- Core timer system implementation (Phase 1)
- Character and stats system (Phase 2)
- Work tasks system (Phase 3)
- Canvas rendering (Phase 4)

### Medium Priority
- UI components
- Game data (items, enemies, events)
- Testing coverage
- Documentation

### Nice to Have
- Performance optimizations
- Accessibility improvements
- Additional features (post-MVP)

## Questions?

If you have questions about contributing:
- Check the [DEV_PLAN.md](./DEV_PLAN.md) for technical details
- Check the [CLAUDE.md](./CLAUDE.md) for architecture guidelines
- Open a discussion on GitHub
- Review existing issues and PRs

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment
- Follow GitHub's community guidelines

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).
