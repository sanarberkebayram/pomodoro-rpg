# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pomodoro MMORPG** is a TypeScript web game that transforms the Pomodoro technique (Work → Short Break → Long Break) into an idle-focused fantasy RPG. Built with **SolidJS** for mobile-first web, using **HTML Canvas 2D** for game scenes and HTML/CSS for UI.

**Core Game Loop:**
- **WORK phase (25 min):** Game is fully locked (no input). Character performs automated tasks (raid/expedition/craft) while player watches 2D animated scenes and live event logs.
- **SHORT BREAK (5 min):** Playable. Quick management (chest opening, inventory, equipment, task selection).
- **LONG BREAK (15 min):** Playable. Extended content (mini dungeons with 3 encounters + boss fight).

**Design Pillars:**
1. Focus is Sacred - no input during Work
2. Break = Control - all player decisions happen during breaks
3. Living World - events happen automatically during Work
4. Preparation → Outcome - prepare during breaks, auto-resolve during Work
5. Moderate Penalties - failures cause missed rewards + small debuffs, never lock progression

## Architecture

### State Management
- **SolidJS stores** for reactive state (not Redux/MobX)
- Domain-separated stores: `TimerState`, `CharacterState`, `InventoryState`, `TaskState`, `ProgressionState`
- Use `createStore` from `solid-js/store` with immutable updates via `produce`
- All game state persists to **localStorage** (auto-save on state changes)

### Core Structure
```
src/
├── core/           # Game engine foundation
│   ├── state/     # Domain state stores
│   ├── engine/    # GameLoop, EventSystem, SaveSystem
│   └── types/     # Core type definitions
├── systems/        # Game mechanics (isolated, testable)
│   ├── pomodoro/  # Timer state machine (WORK → SHORT → WORK → LONG)
│   ├── tasks/     # Work task execution (Expedition, Raid, etc.)
│   ├── combat/    # Turn-based combat for dungeons
│   ├── loot/      # Procedural item generation, rarity system
│   ├── injury/    # Failure consequences, hospital mechanics
│   ├── progression/ # XP, leveling, Focus Blessing streaks
│   └── events/    # Live events during Work (rate-limited)
├── rendering/      # Canvas 2D rendering
│   ├── scenes/    # Different Work scenes (RaidScene, ExpeditionScene, etc.)
│   └── sprites/   # Sprite sheets, animation system
└── components/     # SolidJS UI (timer, inventory, dungeon UI, etc.)
```

### Hybrid Rendering Approach
- **Canvas 2D API:** Game scenes during Work phase (character animations, backgrounds, effects)
- **HTML/CSS:** All UI elements (inventory grids, stat displays, buttons, modals)
- **Why:** Canvas gives control for game-like visuals; HTML/CSS leverages browser capabilities for responsive UI

### Key Systems

**1. Pomodoro Timer State Machine**
```
IDLE → WORK → SHORT_BREAK → WORK → SHORT_BREAK → WORK → SHORT_BREAK → WORK → LONG_BREAK → (repeat)
```
- Auto-transitions between states
- Work phase locks all UI except emergency pause
- Break phase unlocks all interactions
- Timer durations are user-customizable

**2. Task System**
- Tasks selected during Break, executed during Work
- Risk levels: Safe / Standard / Risky (affects success chance and rewards)
- Success calculation: character stats + equipment + risk level + random events
- Outcomes: Success (full loot + XP), Partial Success (reduced loot), Fail (no loot + injury chance)

**3. Live Events (Work Phase)**
- Rate-limited: ~1 event per 2 minutes to avoid breaking focus
- Event levels: Flavor (no effect), Info (small effect), Warning (medium effect), Critical (rare, significant)
- Events affect: HP, Gold, Materials, Success chance, Equipment durability
- Examples: "Thief broke in (-15 Gold)", "Armor cracked (Defense -1)", "Lucky chest found (+1 Chest)"

**4. Injury & Hospital System**
- Task failures can cause injury (reduces success chance in future tasks)
- Hospital generates bills (non-compounding debt)
- Unpaid bills give small penalty but never lock progression
- Healing options: potions (consumable) or hospital visit (costs gold)

**5. Character Stats (Simple but Systemic)**
- **Power:** Overall strength, affects damage and task success
- **Defense:** Damage reduction
- **Focus:** Success/crit chance in tasks
- **Luck:** Loot quality and rarity
- **Health:** Injury status

## Path Aliases (tsconfig.json)

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

## Development Commands

**IMPORTANT: Always use `bun` as the package manager and runtime for this project.**

```bash
bun install          # Install dependencies
bun dev              # Start Vite dev server
bun build            # Production build
bun preview          # Preview production build
bun run test --run   # Run Vitest tests (single run)
bun run test         # Run Vitest tests (watch mode)
bun lint             # ESLint
bun format           # Prettier
```

## Mobile-First Design Requirements

- **Primary target:** 375x667 (iPhone SE) and 390x844 (iPhone 13)
- **Touch targets:** Minimum 44x44px, 8px spacing
- **Layout:** Portrait-first, single column, bottom navigation
- **Performance:** <1.5s first paint, <3s interactive, 30fps minimum on canvas
- **Bundle:** <200KB initial (gzipped)

## Game Design Reference

See `pomodoro_mmorpg_gdd_v0_2.md` for complete game design document.
See `DEV_PLAN.md` for detailed 12-week implementation roadmap.

## TypeScript Configuration

- **Strict mode enabled:** All type safety features on
- **NO `any` TYPE ALLOWED:** Never use `any` type implicitly or explicitly. All types must be properly defined. Use `unknown` if absolutely necessary and narrow with type guards.
- **JSX:** `preserve` with `jsxImportSource: "solid-js"` (SolidJS, not React)
- **Module:** ESNext with bundler resolution (Vite handles bundling)
- **Bun types included** (potential alternative runtime to Node)

## Critical Implementation Notes

1. **Work Phase Lock:** Absolutely no user input during Work phase (except emergency pause). This is core to the Pomodoro focus concept.

2. **Auto-Transitions:** Timer automatically transitions between phases. No "start next phase" button - system moves forward when time expires.

3. **Event Rate Limiting:** During Work, events must be rate-limited (~1 per 2 minutes) to avoid notification fatigue and focus breaking.

4. **Mobile Performance:** Canvas rendering must be optimized for mobile. Consider OffscreenCanvas, limit animation complexity, profile early.

5. **State Persistence:** Game state saves to localStorage on every change (debounced). Player should never lose progress on page refresh.

6. **No Progression Locks:** Failures should feel consequential but never lock the player out. Injury system has penalties but they're recoverable. Hospital debt doesn't compound.

7. **MVP Scope:** Focus on timer + 1 character class + 2 work tasks (Expedition, Raid) + basic inventory + simple dungeon. See DEV_PLAN.md Phase 0-10 for full MVP definition.

8. **Code Quality After Every Feature:** ALWAYS run these commands after completing each feature implementation:
   - `bun run test --run` - Ensure all tests pass
   - `bun lint` - Check for and fix any linting errors
   - `bun format` - Format code consistently with Prettier

   All checks must pass before moving to the next feature.

## Git Commit Guidelines

- **No Claude watermarks:** Do NOT add "Generated with Claude Code" or "Co-Authored-By: Claude" footers to commit messages
- **Atomic commits:** Group related changes into logical, isolated commits
- **Clear messages:** Use imperative mood and describe what the commit does
- **Detailed bodies:** Include bullet points explaining the changes when appropriate

## Testing Strategy

- **Unit tests (Vitest):** All game systems (timer, tasks, loot, combat, progression)
- **Integration tests:** Full gameplay flows (work cycle, dungeon run, inventory management)
- **E2E tests (Playwright):** Complete user journeys, mobile viewport testing
- **Target:** 80% code coverage for core systems
