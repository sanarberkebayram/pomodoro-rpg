# Pomodoro RPG

Transform your Pomodoro focus sessions into an epic fantasy RPG adventure.

## Overview

Pomodoro RPG is a mobile-first web game that gamifies the Pomodoro technique. During work phases, watch your character embark on automated adventures. During breaks, manage your inventory, upgrade equipment, and prepare for the next expedition.

## Tech Stack

- **Framework:** SolidJS (reactive, performant)
- **Language:** TypeScript 5.x (strict mode)
- **Build Tool:** Vite
- **Styling:** TailwindCSS + CSS Modules
- **Rendering:** HTML Canvas 2D API (game scenes) + HTML/CSS (UI)
- **Testing:** Vitest + Playwright
- **Package Manager:** Bun

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) 1.0+ installed

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pomodoro-rpg

# Install dependencies
bun install

# Start development server
bun dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

```bash
bun dev          # Start development server
bun build        # Build for production
bun preview      # Preview production build
bun test         # Run tests
bun test:watch   # Run tests in watch mode
bun test:coverage # Run tests with coverage
bun lint         # Lint code
bun format       # Format code with Prettier
```

## Project Structure

```
pomodoro-rpg/
├── src/
│   ├── core/           # Game engine (state, systems, types)
│   ├── systems/        # Game mechanics (pomodoro, tasks, combat, etc.)
│   ├── rendering/      # Canvas rendering & scenes
│   ├── components/     # SolidJS UI components
│   ├── data/           # Game data & configuration
│   ├── utils/          # Utility functions
│   ├── hooks/          # SolidJS hooks
│   └── styles/         # Global styles
├── public/             # Static assets
├── tests/              # Test files
└── docs/               # Documentation
```

## Core Game Loop

1. **WORK Phase (25 min):** Game is fully locked. Character automatically performs selected task (raid, expedition, etc.) while you focus on real work.
2. **SHORT BREAK (5 min):** Unlock UI. Open chests, manage inventory, equip items, select next task.
3. **LONG BREAK (15 min):** Extended content like mini-dungeons with boss fights.

## Development Roadmap

See [DEV_PLAN.md](./DEV_PLAN.md) for detailed development phases.

### Current Status: Phase 0 - Project Setup

- [x] Initialize Vite + SolidJS project
- [x] Configure TypeScript (strict mode)
- [x] Set up TailwindCSS + CSS modules
- [x] Configure ESLint + Prettier
- [x] Set up Vitest for testing
- [x] Create folder structure
- [x] Initialize Git + Husky hooks
- [x] Create documentation files

### Next: Phase 1 - Core Timer System

Implement the Pomodoro timer with state machine and basic UI.

## Design Principles

1. **Focus is Sacred:** No user input during work phases
2. **Break = Control:** All decisions happen during breaks
3. **Living World:** Events auto-generate during work
4. **Preparation → Outcome:** Prepare during breaks, auto-resolve during work
5. **Moderate Penalties:** Failures are consequential but never lock progression

## Mobile-First Design

Built primarily for mobile devices (iPhone SE, iPhone 13, iPad) with touch-friendly controls and optimized performance.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT

## Resources

- [Game Design Document](./pomodoro_mmorpg_gdd_v0_2.md)
- [Development Plan](./DEV_PLAN.md)
- [Claude Instructions](./CLAUDE.md)
