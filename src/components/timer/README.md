# Timer UI Components

Phase 1.2 implementation - Timer UI Components for the Pomodoro MMORPG.

## Components

### TimerDisplay
Large countdown display showing remaining time in MM:SS format.

**Features:**
- Large, readable text (text-8xl) optimized for mobile
- Color-coded by phase (blue for Work, green for Break, red when critical)
- Shows pause state with animated indicator
- Displays current session number
- Fully accessible with ARIA labels

**Usage:**
```tsx
import { TimerDisplay } from './components/timer';

<TimerDisplay timerState={timerState} />
```

### PhaseIndicator
Shows current Pomodoro phase with visual styling and description.

**Features:**
- Phase-specific icons and colors
- Clear phase name display (Work Time, Short Break, Long Break, Ready to Start)
- Descriptive text for each phase
- Running indicator with pulsing dot
- Work phase lock warning
- Mobile-first touch-friendly design

**Usage:**
```tsx
import { PhaseIndicator } from './components/timer';

<PhaseIndicator
  phase={timerState.phase}
  isRunning={timerState.isRunning}
/>
```

### ProgressBar
Visual progress indicator showing elapsed time as a percentage.

**Features:**
- Horizontal progress bar with smooth animations
- Phase-specific colors matching the timer
- Percentage display and time remaining
- Milestone markers at 25%, 50%, 75%, 100%
- Shimmer animation effect
- Fully accessible progressbar role with ARIA attributes

**Usage:**
```tsx
import { ProgressBar } from './components/timer';

<ProgressBar
  phase={timerState.phase}
  remainingSeconds={timerState.remainingSeconds}
  config={timerConfig}
/>
```

## Complete Timer Layout Example

```tsx
import { Component } from 'solid-js';
import { TimerDisplay, PhaseIndicator, ProgressBar } from './components/timer';
import type { TimerState, TimerConfig } from './systems/pomodoro/types';

const TimerScreen: Component<{
  timerState: TimerState;
  config: TimerConfig
}> = (props) => {
  return (
    <div class="flex flex-col items-center gap-8 p-6 min-h-screen bg-gray-50">
      {/* Phase indicator at top */}
      <PhaseIndicator
        phase={props.timerState.phase}
        isRunning={props.timerState.isRunning}
      />

      {/* Large timer display in center */}
      <TimerDisplay timerState={props.timerState} />

      {/* Progress bar below timer */}
      <ProgressBar
        phase={props.timerState.phase}
        remainingSeconds={props.timerState.remainingSeconds}
        config={props.config}
      />

      {/* Timer controls would go here */}
    </div>
  );
};
```

## Design Notes

### Mobile-First
All components follow mobile-first design principles:
- Minimum touch target: 44x44px
- Large, readable fonts (minimum 16px)
- High contrast colors
- Portrait-optimized layouts
- Responsive spacing

### Color Scheme
- **Work (Blue):** `bg-blue-600`, `text-blue-600`
- **Short Break (Green):** `bg-green-600`, `text-green-600`
- **Long Break (Emerald):** `bg-emerald-600`, `text-emerald-600`
- **Idle (Gray):** `bg-gray-200`, `text-gray-600`
- **Critical/Warning (Red/Orange):** `bg-red-600`, `bg-orange-50`

### Accessibility
- All components use semantic HTML and ARIA attributes
- Timer has `role="timer"` and `aria-live="polite"`
- Progress bar has `role="progressbar"` with proper values
- Phase changes announced to screen readers
- High contrast ratios for text

## Next Steps

To use these components, you need to:

1. **Complete Phase 0 (Project Setup):**
   - Initialize Vite + SolidJS project
   - Install dependencies (solid-js, typescript, tailwindcss)
   - Configure Tailwind with custom animations
   - Set up development environment

2. **Add Custom Tailwind Configuration:**
   ```js
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         animation: {
           shimmer: 'shimmer 2s infinite',
         },
         keyframes: {
           shimmer: {
             '0%': { transform: 'translateX(-100%)' },
             '100%': { transform: 'translateX(100%)' },
           },
         },
       },
     },
   };
   ```

3. **Create a Timer Hook (Phase 1.3):**
   - `useTimer` hook to integrate PomodoroTimer with SolidJS reactivity
   - Automatic state synchronization
   - localStorage persistence

4. **Build Complete Timer Screen:**
   - Combine components into main timer view
   - Add control buttons (Start, Pause, Resume, Skip, Reset)
   - Integrate with game state management
