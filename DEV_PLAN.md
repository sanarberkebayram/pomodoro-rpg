# Pomodoro MMORPG - Development Plan

## Tech Stack

### Core Technologies
- **Language:** TypeScript 5.x
- **Framework:** SolidJS (reactive, performant, smaller bundle than React)
- **Build Tool:** Vite (fast dev server, optimized builds)
- **Rendering:** HTML Canvas 2D API (game scenes) + HTML/CSS (UI)
- **State Management:** SolidJS stores + custom game state manager
- **Styling:** TailwindCSS (mobile-first utilities) + CSS Modules
- **Package Manager:** pnpm (faster, more efficient)

### Development Tools
- **Type Checking:** TypeScript strict mode
- **Linting:** ESLint + TypeScript ESLint
- **Formatting:** Prettier
- **Testing:** Vitest (unit) + Playwright (e2e)
- **Git Hooks:** Husky + lint-staged

---

## Project Structure

```
pomodoro-rpg/
├── src/
│   ├── core/                    # Core game engine
│   │   ├── state/              # Game state management
│   │   │   ├── GameState.ts
│   │   │   ├── CharacterState.ts
│   │   │   ├── InventoryState.ts
│   │   │   └── TimerState.ts
│   │   ├── engine/             # Game loop & systems
│   │   │   ├── GameLoop.ts
│   │   │   ├── EventSystem.ts
│   │   │   └── SaveSystem.ts
│   │   └── types/              # Core type definitions
│   │       ├── character.ts
│   │       ├── items.ts
│   │       ├── tasks.ts
│   │       └── events.ts
│   │
│   ├── systems/                 # Game systems
│   │   ├── pomodoro/           # Timer & state machine
│   │   │   ├── PomodoroTimer.ts
│   │   │   ├── StateManager.ts
│   │   │   └── types.ts
│   │   ├── tasks/              # Work tasks (Raid, Expedition, etc.)
│   │   │   ├── TaskManager.ts
│   │   │   ├── TaskResolver.ts
│   │   │   └── tasks/
│   │   │       ├── Expedition.ts
│   │   │       └── Raid.ts
│   │   ├── combat/             # Combat system (dungeons, bosses)
│   │   │   ├── CombatManager.ts
│   │   │   ├── DamageCalculator.ts
│   │   │   └── types.ts
│   │   ├── loot/               # Loot & rewards
│   │   │   ├── LootGenerator.ts
│   │   │   ├── ChestManager.ts
│   │   │   └── RaritySystem.ts
│   │   ├── injury/             # Injury & hospital system
│   │   │   ├── InjuryManager.ts
│   │   │   └── HospitalSystem.ts
│   │   ├── progression/        # XP, leveling, streaks
│   │   │   ├── ProgressionManager.ts
│   │   │   ├── FocusBlessing.ts
│   │   │   └── StreakTracker.ts
│   │   └── events/             # Live events during Work
│   │       ├── EventGenerator.ts
│   │       ├── EventBank.ts
│   │       └── types.ts
│   │
│   ├── rendering/               # Canvas rendering
│   │   ├── CanvasRenderer.ts
│   │   ├── SceneManager.ts
│   │   ├── scenes/             # Different work scenes
│   │   │   ├── BaseScene.ts
│   │   │   ├── RaidScene.ts
│   │   │   ├── ExpeditionScene.ts
│   │   │   ├── CraftScene.ts
│   │   │   └── RestScene.ts
│   │   ├── sprites/            # Sprite management
│   │   │   ├── SpriteSheet.ts
│   │   │   ├── CharacterSprite.ts
│   │   │   └── AnimationSystem.ts
│   │   └── utils/
│   │       ├── AssetLoader.ts
│   │       └── CanvasUtils.ts
│   │
│   ├── components/              # SolidJS UI components
│   │   ├── timer/
│   │   │   ├── TimerDisplay.tsx
│   │   │   ├── PhaseIndicator.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── work/               # Work phase UI
│   │   │   ├── WorkScreen.tsx
│   │   │   ├── GameCanvas.tsx
│   │   │   └── EventLog.tsx
│   │   ├── break/              # Break phase UI
│   │   │   ├── BreakHub.tsx
│   │   │   ├── ChestOpening.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── TaskSelection.tsx
│   │   │   └── Hospital.tsx
│   │   ├── character/
│   │   │   ├── CharacterSheet.tsx
│   │   │   ├── StatDisplay.tsx
│   │   │   └── EquipmentSlots.tsx
│   │   ├── dungeon/            # Long break content
│   │   │   ├── DungeonRunner.tsx
│   │   │   ├── EncounterScreen.tsx
│   │   │   └── BossFight.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Card.tsx
│   │       └── Toast.tsx
│   │
│   ├── data/                    # Game data & config
│   │   ├── items/
│   │   │   ├── weapons.ts
│   │   │   ├── armor.ts
│   │   │   └── consumables.ts
│   │   ├── tasks/
│   │   │   └── taskConfigs.ts
│   │   ├── events/
│   │   │   └── eventBank.ts
│   │   ├── enemies/
│   │   │   └── enemyData.ts
│   │   └── config/
│   │       ├── gameConfig.ts
│   │       └── timerConfig.ts
│   │
│   ├── utils/                   # Utilities
│   │   ├── random.ts
│   │   ├── probability.ts
│   │   ├── formatting.ts
│   │   └── validation.ts
│   │
│   ├── hooks/                   # SolidJS hooks
│   │   ├── useGameState.ts
│   │   ├── useTimer.ts
│   │   ├── useCanvas.ts
│   │   └── usePersistence.ts
│   │
│   ├── styles/                  # Global styles
│   │   ├── globals.css
│   │   └── tailwind.css
│   │
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts
│
├── public/                      # Static assets
│   ├── sprites/
│   │   ├── character/
│   │   ├── items/
│   │   └── backgrounds/
│   ├── sounds/                  # (Post-MVP)
│   └── fonts/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   └── architecture.md
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── .eslintrc.json
├── .prettierrc
└── README.md
```

---

## Core Architecture

### 1. State Management Architecture

```typescript
// Central game state using SolidJS stores
interface GameState {
  timer: TimerState;
  character: CharacterState;
  inventory: InventoryState;
  tasks: TaskState;
  progression: ProgressionState;
  ui: UIState;
}

// Reactive stores for each domain
const [timerState, setTimerState] = createStore<TimerState>({...});
const [characterState, setCharacterState] = createStore<CharacterState>({...});
```

**Design Principles:**
- **Single source of truth:** All game state in typed stores
- **Reactive updates:** SolidJS fine-grained reactivity
- **Immutable updates:** Use `produce` from `solid-js/store`
- **Persistence layer:** Auto-save to localStorage on state changes

### 2. Timer State Machine

```
States: IDLE → WORK → SHORT_BREAK → WORK → ... → LONG_BREAK → (repeat)

Work Phase:
  - Lock all UI inputs (except emergency pause)
  - Start selected task execution
  - Generate live events
  - Render appropriate scene
  - Display event log

Break Phase:
  - Unlock all UI
  - Show task results/rewards
  - Enable inventory management
  - Allow new task selection
  - Run break-specific content (dungeons, etc.)
```

### 3. Canvas Rendering System

**Architecture:**
- **One canvas element** for game scenes
- **Scene-based rendering:** Different scenes for different work types
- **Animation system:** Frame-based sprite animations
- **Layer system:** Background → Characters → Effects → UI overlays

**Rendering Loop:**
```typescript
function render(ctx: CanvasRenderingContext2D, deltaTime: number) {
  clearCanvas(ctx);
  currentScene.update(deltaTime);
  currentScene.render(ctx);

  // Event overlays (sparks, icons)
  renderEventEffects(ctx);
}

requestAnimationFrame(gameLoop);
```

### 4. Event System (Live Events During Work)

```typescript
interface GameEvent {
  id: string;
  type: 'flavor' | 'info' | 'warning' | 'critical';
  timestamp: number;
  message: string;
  effects: Effect[];
  visualCue?: VisualCue;
}

// Rate-limited event generation (1 per 2 minutes)
// Events affect: HP, Gold, Materials, Success chance
```

---

## Development Phases

### Phase 0: Project Setup (Week 1)
**Goal:** Initialize project with all tooling and basic structure

**Tasks:**
1. Initialize Vite + SolidJS project
2. Configure TypeScript (strict mode)
3. Set up TailwindCSS + CSS modules
4. Configure ESLint + Prettier
5. Set up Vitest for testing
6. Create folder structure
7. Initialize Git + Husky hooks
8. Create basic `README.md` and `CONTRIBUTING.md`

**Deliverable:** Empty project with working dev server, builds successfully

---

### Phase 1: Core Timer System (Week 2)
**Goal:** Implement Pomodoro timer with state machine

**Tasks:**
1. **Timer State Machine**
   - Create `PomodoroTimer.ts` with state transitions
   - Implement timer logic (countdown, auto-transitions)
   - Add pause/resume functionality
   - Create timer configuration (customizable durations)

2. **Timer UI Components**
   - `TimerDisplay.tsx` - large countdown display
   - `PhaseIndicator.tsx` - shows current phase (Work/Break)
   - `ProgressBar.tsx` - visual progress through session

3. **Persistence**
   - Save timer state to localStorage
   - Resume on page reload
   - Track streak data

**Deliverable:** Working Pomodoro timer with UI, can cycle through phases

---

### Phase 2: Character & Stats System (Week 3)
**Goal:** Character creation, stats, basic inventory

**Tasks:**
1. **Character System**
   - Define character types (Power, Defense, Focus, Luck, Health)
   - Create `CharacterState` store
   - Implement stat calculations
   - Character creation flow

2. **Inventory System**
   - Item data structures (weapons, armor, consumables)
   - Inventory management (add, remove, stack)
   - Equipment slots (weapon, armor, accessory)
   - Item comparison logic

3. **UI Components**
   - `CharacterSheet.tsx` - display stats
   - `Inventory.tsx` - grid-based inventory
   - `EquipmentSlots.tsx` - drag-and-drop equipping

**Deliverable:** Create character, view stats, manage inventory

---

### Phase 3: Work Tasks System (Week 4)
**Goal:** Implement Expedition & Raid work tasks

**Tasks:**
1. **Task Framework**
   - `TaskManager.ts` - task selection and execution
   - `TaskResolver.ts` - calculate success/failure
   - Task configuration data
   - Risk levels (Safe, Standard, Risky)

2. **Task Implementation**
   - Expedition task (stable, materials)
   - Raid task (risky, high loot)
   - Success calculation based on stats + equipment
   - Outcome generation (Success, Partial, Fail)

3. **Task Selection UI**
   - `TaskSelection.tsx` - choose task and risk level
   - Display task info (rewards, risks)
   - Loadout preparation

**Deliverable:** Select tasks during break, execute during work, see outcomes

---

### Phase 4: Canvas Rendering & Scenes (Week 5)
**Goal:** Visual scenes during Work phase

**Tasks:**
1. **Canvas Setup**
   - `CanvasRenderer.ts` - main rendering engine
   - `GameCanvas.tsx` - SolidJS wrapper component
   - Asset loading system
   - Responsive canvas sizing (mobile-first)

2. **Scene System**
   - `BaseScene.ts` - abstract scene class
   - `RaidScene.ts` - raid visuals
   - `ExpeditionScene.ts` - expedition visuals
   - Simple animations (idle, walk)

3. **Character Sprites**
   - Sprite sheet loader
   - Animation system (frame-based)
   - Character rendering in scenes

**Deliverable:** During Work, see animated scene on canvas

---

### Phase 5: Live Events System (Week 6)
**Goal:** Events that happen during Work phase

**Tasks:**
1. **Event System**
   - `EventGenerator.ts` - rate-limited event creation
   - `EventBank.ts` - pool of possible events
   - Event categorization (Flavor, Info, Warning, Critical)
   - Event effects on game state

2. **Event Display**
   - `EventLog.tsx` - scrolling log of events
   - Toast notifications for important events
   - Visual cues on canvas (sparkles, icons)

3. **Event Data**
   - Create event bank (50+ events)
   - Configure probabilities
   - Link events to task types

**Deliverable:** During Work, random events appear and affect character

---

### Phase 6: Loot & Rewards (Week 7)
**Goal:** Chest opening, item generation

**Tasks:**
1. **Loot System**
   - `LootGenerator.ts` - procedural item generation
   - Rarity system (Common, Uncommon, Rare, Epic, Legendary)
   - `ChestManager.ts` - chest opening logic
   - Loot tables per task type

2. **Chest Opening UI**
   - `ChestOpening.tsx` - animated reveal
   - Item showcase
   - Item comparison (new vs equipped)
   - Quick equip option

3. **Item Database**
   - 20+ weapon types
   - 20+ armor types
   - 10+ consumables
   - Item stat generation

**Deliverable:** Complete work task → get chest → open during break → loot items

---

### Phase 7: Injury & Hospital System (Week 8)
**Goal:** Failure consequences and recovery

**Tasks:**
1. **Injury System**
   - `InjuryManager.ts` - track injury state
   - Injury effects on stats (-% success chance)
   - Injury healing (potions, hospital)

2. **Hospital System**
   - `HospitalSystem.ts` - generate bills
   - Bill payment logic
   - Debt management (non-compounding)

3. **Hospital UI**
   - `Hospital.tsx` - view injuries and bills
   - Healing options
   - Visual indicators (health bar, injury icon)

**Deliverable:** Fail a task → get injured → heal at hospital

---

### Phase 8: Progression & Streaks (Week 9)
**Goal:** Focus Blessing, XP, leveling

**Tasks:**
1. **Progression System**
   - `ProgressionManager.ts` - XP and leveling
   - Level-up stat bonuses
   - XP rewards per task completion

2. **Streak System**
   - `StreakTracker.ts` - daily/weekly streaks
   - `FocusBlessing.ts` - streak bonuses
   - Bonus calculations (+% loot quality, +% success)

3. **Progression UI**
   - XP bar
   - Level-up notifications
   - Streak display (fire icon + count)
   - Streak bonus tooltip

**Deliverable:** Complete tasks → gain XP → level up → maintain streaks

---

### Phase 9: Long Break Content - Dungeon (Week 10)
**Goal:** Mini dungeon with 3 encounters + boss

**Tasks:**
1. **Combat System**
   - `CombatManager.ts` - turn-based combat
   - Damage calculations
   - Enemy AI (simple)
   - Combat outcomes

2. **Dungeon System**
   - Dungeon structure (3 rooms + boss room)
   - Enemy generation
   - Boss mechanics (2-3 simple mechanics)
   - Dungeon rewards

3. **Dungeon UI**
   - `DungeonRunner.tsx` - dungeon navigation
   - `EncounterScreen.tsx` - combat interface
   - `BossFight.tsx` - boss-specific UI
   - Health bars, action buttons

**Deliverable:** Long break → enter dungeon → fight 3 encounters → boss → rewards

---

### Phase 10: Polish & Mobile Optimization (Week 11-12)
**Goal:** Mobile-first polish, performance, UX

**Tasks:**
1. **Mobile Optimization**
   - Touch controls
   - Responsive layouts (portrait priority)
   - Performance optimization (canvas rendering)
   - PWA setup (offline, install prompt)

2. **UX Polish**
   - Animations and transitions
   - Sound effects (optional)
   - Loading states
   - Error handling

3. **Testing**
   - Unit tests for core systems
   - E2E tests for main flows
   - Mobile device testing
   - Performance profiling

4. **Documentation**
   - Player guide
   - Developer documentation
   - Architecture diagrams

**Deliverable:** Polished, performant MVP ready for playtesting

---

## Key Technical Decisions

### Why SolidJS?
- **Performance:** Fine-grained reactivity, no virtual DOM
- **Bundle size:** Smaller than React (~7KB vs ~40KB)
- **Mobile-first:** Faster on lower-end devices
- **TypeScript:** Excellent TypeScript support
- **Learning curve:** Similar to React, easy to adopt

### Why Canvas + HTML/CSS Hybrid?
- **Canvas for game scenes:** Full control over rendering, animations, effects
- **HTML/CSS for UI:** Leverages browser capabilities, accessibility, responsive design
- **Best of both worlds:** Game-like visuals + modern web UI

### State Management Strategy
- **SolidJS stores:** Reactive, built-in, no extra dependency
- **Domain separation:** Each system has its own store slice
- **Computed values:** Use `createMemo` for derived state
- **Side effects:** Use `createEffect` for persistence, events

### Persistence Strategy (MVP)
- **localStorage:** Simple, works offline
- **JSON serialization:** Entire game state
- **Auto-save:** On every state change (debounced)
- **Future:** Backend API for cloud saves, leaderboards

---

## Mobile-First Design Guidelines

### Screen Sizes
- **Primary:** 375x667 (iPhone SE)
- **Secondary:** 390x844 (iPhone 13)
- **Tablet:** 768x1024 (iPad)

### Touch Targets
- **Minimum size:** 44x44px (Apple HIG)
- **Spacing:** 8px between interactive elements
- **Gestures:** Tap (primary), swipe (navigation), long-press (details)

### Layout Priorities
1. **Portrait mode first** (most common)
2. **Single column layouts**
3. **Bottom navigation** (thumb-friendly)
4. **Large, clear typography** (16px minimum)
5. **High contrast** (outdoor visibility)

### Performance Targets
- **First paint:** <1.5s
- **Time to interactive:** <3s
- **Canvas FPS:** 30fps minimum (60fps target)
- **Bundle size:** <200KB initial (gzipped)

---

## Testing Strategy

### Unit Tests (Vitest)
- All core systems (timer, tasks, loot, combat)
- State management logic
- Utility functions
- Target: 80% coverage

### Integration Tests
- Timer + task flow
- Inventory + equipment
- Combat + dungeon
- Event generation

### E2E Tests (Playwright)
- Complete work cycle
- Dungeon run
- Character creation
- Mobile viewport testing

---

## Deployment Strategy

### Hosting
- **Primary:** Vercel (zero-config, edge network)
- **Alternative:** Netlify, Cloudflare Pages

### CI/CD
- GitHub Actions
- Auto-deploy on main branch
- Preview deploys on PRs

### Monitoring (Post-MVP)
- Sentry (error tracking)
- Analytics (Plausible/Fathom)
- Performance monitoring (Web Vitals)

---

## MVP Success Criteria

The MVP is complete when a player can:

1. ✅ Start a Pomodoro timer and complete a full cycle
2. ✅ Create a character with stats
3. ✅ Select a work task (Expedition or Raid) with risk level
4. ✅ See an animated scene during Work phase
5. ✅ Experience live events that affect their character
6. ✅ Complete or fail a task and see outcomes
7. ✅ Open chests and receive loot items
8. ✅ Manage inventory and equip items
9. ✅ Get injured and use the hospital system
10. ✅ Gain XP, level up, and maintain streaks
11. ✅ Play a mini dungeon during Long Break
12. ✅ Have progress saved across sessions

---

## Post-MVP Roadmap

### Version 0.2 (Weeks 13-16)
- Additional character classes (Arcanist, Rogue)
- More work tasks (Craft Batch, Hunt)
- Town/base building system
- More dungeon variety

### Version 0.3 (Weeks 17-20)
- Skill/perk system
- Profession system (crafting, alchemy)
- Pet/companion system
- Seasonal events

### Version 1.0 (Weeks 21-24)
- Backend API (user accounts)
- Cloud saves
- Leaderboards
- Social features (async)
- Premium cosmetics

---

## Risk Mitigation

### Technical Risks
1. **Canvas performance on mobile**
   - Mitigation: Profile early, use OffscreenCanvas, limit animations

2. **Bundle size creep**
   - Mitigation: Code splitting, lazy loading, regular bundle analysis

3. **State complexity**
   - Mitigation: Clear architecture, comprehensive types, early refactoring

### Game Design Risks
1. **Work phase too boring**
   - Mitigation: Rich event system, varied scenes, satisfying animations

2. **Progression too slow/fast**
   - Mitigation: Playtesting, tunable config values, analytics

3. **Mobile controls awkward**
   - Mitigation: Early mobile testing, simplified UI, touch optimization

---

## Next Steps

1. **Set up initial project** (Phase 0)
2. **Create core type definitions** (`core/types/`)
3. **Implement timer state machine** (Phase 1)
4. **Build timer UI** (Phase 1)
5. **Iterate based on playtesting**

---

## Resources

- [SolidJS Documentation](https://www.solidjs.com/docs/latest)
- [Canvas 2D API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Mobile Web Best Practices](https://web.dev/mobile/)
- [Game Design Document](./pomodoro_mmorpg_gdd_v0_2.md)

---

**Total Estimated Timeline:** 12 weeks (3 months) to MVP
**Team Size:** 1-2 developers
**Post-MVP:** Ongoing development in 4-week sprints
