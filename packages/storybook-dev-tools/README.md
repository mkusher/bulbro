# Storybook Dev Tools Plugin

A Storybook addon for Bulbro game development that provides real-time game controls and comprehensive stats display directly in the Storybook devtools.

## Features

### Game Controls Panel
Control game scene playback during story development:
- **Play/Pause** - Toggle game playback
- **Stop** - Reset game to initial state
- **Step Forward** - Advance by configurable number of ticks (1-100)
- **Timed Play** - Play for a specific duration (0.1-60 seconds)
- **Real-time Status** - View current state, tick count, and elapsed time
- **Keyboard Shortcuts** - Quick access via Space (play/pause), S (stop), N (step)

### Game Stats Panel
Monitor comprehensive game state in real-time:
- **Game Overview** - Wave number, difficulty, timer, enemy count, active shots
- **Player Stats** - Health, level, experience, materials for each player
- **Detailed Stats** - All 18+ character stats organized in expandable sections
- **Weapons Display** - View equipped weapons with selection indicator
- **Multi-player Support** - Monitor up to 4 players simultaneously

## Installation

### 1. Add to Project

The plugin is already configured in the monorepo at `packages/storybook-dev-tools`.

### 2. Register in Storybook Config

Update `web/.storybook/main.ts`:

```typescript
import type { StorybookConfig } from "@storybook/preact-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@bulbro/storybook-dev-tools/preset"],
  framework: {
    name: "@storybook/preact-vite",
    options: {},
  },
};
export default config;
```

### 3. Install Dependencies

```bash
bun install
```

## Usage

### Game Controls Panel

Once the plugin is registered, you'll see a "Game Controls" tab in the Storybook devtools (bottom panel):

1. **Start the Game** - Click the Play button or press Space
2. **Control Playback** - Use Play/Pause/Stop buttons
3. **Step Through** - Set tick count and click Step for frame-by-frame control
4. **Timed Playback** - Enter duration and click Play for timed runs

#### Keyboard Shortcuts

- **Space** - Play/Pause
- **S** - Stop
- **N** - Step forward (by configured amount)

### Game Stats Panel

Switch to the "Game Stats" tab to monitor:

1. **Game Status** - Current wave, difficulty, time, enemy/shot counts
2. **Player Summary** - Click to expand individual players
3. **Detailed Stats** - View all character stats when expanded
4. **Weapons** - See equipped weapons with current selection

## Component Architecture

### Panels

- **GameControlsPanel** - Manages game playback controls and timing
- **GameStatsPanel** - Displays real-time game and player statistics

### Data Flow

The plugin subscribes to signals from `gameSceneStore`:
- `sceneState` - Current playback state (stopped/playing/paused)
- `gameState` - Complete game simulation state (WaveState)
- `tickCount` - Number of simulation ticks
- `elapsedTime` - Elapsed time in seconds
- `isInitialized` - Whether game is ready

### Functions Called

- `play()` / `pause()` / `playPause()` - Playback control
- `stop()` - Reset game
- `step(count)` - Advance by N ticks
- `playTimed(duration)` - Play for duration in seconds

## Styling

The plugin uses Tailwind CSS with a dark theme appropriate for development tools:

- **Dark backgrounds** for non-intrusive devtools appearance
- **Monospace font** for consistent stats display
- **Color-coded values** for quick stat scanning
- **HP bars** with green/yellow/red indicators

## Development

### Project Structure

```
src/
├── index.ts                 # Main export
├── preset.ts                # Storybook preset
├── manager.tsx              # Addon registration
├── types.ts                 # Type definitions
└── panels/
    ├── GameControlsPanel.tsx
    └── GameStatsPanel.tsx
```

### Building

The plugin is part of the Bulbro monorepo and uses the same build tools (Bun + TypeScript).

### Testing

Test with stories that use the `GameSceneControls` pattern in `web/src/stories/`.

## Type Safety

Full TypeScript support with types imported from the main game package:

```typescript
import type { WaveState, RoundState } from 'bulbro-game-web/src/waveState'
import type { BulbroState } from 'bulbro-game-web/src/bulbro/BulbroState'
import type { Stats } from 'bulbro-game-web/src/bulbro/BulbroCharacter'
```

## Performance

- Uses Preact signals for efficient reactive updates
- Only subscribes to necessary signals to minimize re-renders
- Safe null/undefined handling for missing game state
- Graceful degradation when game is not initialized

## Compatibility

- **Storybook** 10.0+
- **Preact** 10.27+
- **@preact/signals** 2.4+

## License

Part of the Bulbro game project.
