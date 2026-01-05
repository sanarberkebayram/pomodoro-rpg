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
git clone https://github.com/sanarberkebayram/pomodoro-rpg.git
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

### Completed Phases

#### Phase 0: Project Setup ✅
- [x] Initialize Vite + SolidJS project
- [x] Configure TypeScript (strict mode)
- [x] Set up TailwindCSS + CSS modules
- [x] Configure ESLint + Prettier
- [x] Set up Vitest for testing
- [x] Create folder structure
- [x] Initialize Git + Husky hooks
- [x] Create documentation files

#### Phase 1: Core Timer System ✅
- [x] Pomodoro timer with state machine
- [x] Timer UI components (display, progress bar, phase indicator)
- [x] Persistence and streak tracking

#### Phase 2: Character & Stats System ✅
- [x] Character state management
- [x] Stat system (Power, Defense, Focus, Luck, Health)
- [x] Character sheet UI

#### Phase 3: Work Tasks System ✅
- [x] Task framework (Expedition, Raid)
- [x] Risk levels (Safe, Standard, Risky)
- [x] Success/failure resolution
- [x] Task selection UI

#### Phase 4: Canvas Rendering & Scenes ✅
- [x] Canvas rendering engine
- [x] Scene system (Raid, Expedition)
- [x] Sprite animations
- [x] Character rendering

#### Phase 5: Live Events System ✅
- [x] Event generator with rate limiting
- [x] Event bank (50+ events)
- [x] Event log UI
- [x] Visual cues on canvas

#### Phase 6: Loot & Rewards ✅
- [x] Procedural loot generation
- [x] Rarity system
- [x] Chest opening UI
- [x] Item database (weapons, armor, consumables)

#### Phase 7: Injury & Hospital System ✅
- [x] Injury manager with severity levels
- [x] Hospital system with billing
- [x] Injury effects on stats
- [x] Hospital UI and healing options

### Current Status: Phase 8 - Progression & Streaks

Next phase focuses on XP, leveling, and Focus Blessing streak bonuses.

### Upcoming Phases

#### Phase 8: Progression & Streaks (Week 9)
**Goal:** Focus Blessing, XP, leveling

- [ ] XP and leveling system
- [ ] Level-up stat bonuses
- [ ] Daily/weekly streak tracking
- [ ] Focus Blessing bonuses
- [ ] XP bar and level-up notifications
- [ ] Streak display UI

#### Phase 9: Long Break Content - Dungeon (Week 10)
**Goal:** Mini dungeon with 3 encounters + boss

- [ ] Turn-based combat system
- [ ] Dungeon structure (3 rooms + boss)
- [ ] Enemy generation and AI
- [ ] Boss mechanics
- [ ] Combat UI and dungeon navigation

#### Phase 10: Polish & Mobile Optimization (Week 11-12)
**Goal:** Mobile-first polish, performance, UX

- [ ] Touch controls and responsive layouts
- [ ] Performance optimization
- [ ] PWA setup (offline support)
- [ ] Animations and transitions
- [ ] Comprehensive testing
- [ ] Player and developer documentation

### Post-MVP Features

After Phase 10, planned enhancements include:
- Additional character classes (Arcanist, Rogue)
- More work tasks (Craft, Hunt, Rest)
- Town/base building system
- Skill/perk system
- Backend API and cloud saves
- Leaderboards and social features

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
